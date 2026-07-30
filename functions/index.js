const { onCall, HttpsError } = require("firebase-functions/v2/https");
const axios = require("axios");

// ── SEND SMS (MSG91) ──────────────────────────────────
// Callable from the app: Firebase.functions().httpsCallable('sendSMS')({ phone, message })
exports.sendSMS = onCall({ region: "asia-south1" }, async (request) => {
  // Require authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required to send SMS.");
  }

  const { phone, message } = request.data;
  if (!phone || !message) {
    throw new HttpsError("invalid-argument", "Phone and message are required.");
  }

  // Get API key from user's Firestore document
  const admin = require("firebase-admin");
  if (!admin.apps.length) admin.initializeApp();
  const db = admin.firestore();

  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userData = userDoc.data();

  if (!userData || !userData.smsConfig || !userData.smsConfig.apiKey) {
    throw new HttpsError(
      "failed-precondition",
      "SMS not configured. Please set your MSG91 API key in Settings."
    );
  }

  const { apiKey, senderId } = userData.smsConfig;

  // Clean phone number
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);
  else if (cleanPhone.startsWith("91") && cleanPhone.length > 10)
    cleanPhone = cleanPhone.slice(2);

  if (cleanPhone.length !== 10) {
    throw new HttpsError("invalid-argument", "Invalid phone number.");
  }

  try {
    // MSG91 API v5 - Send OTP / Transactional SMS
    const response = await axios.post(
      "https://api.msg91.com/api/v5/flow",
      {
        sender_id: senderId || "KHETDI",
        message: message,
        route: "v4",
        numbers: [cleanPhone],
      },
      {
        headers: {
          authkey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.type === "success") {
      return { success: true, messageId: response.data.request_id };
    } else {
      throw new HttpsError(
        "internal",
        "SMS failed: " + (response.data.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("SMS Error:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "internal",
      "SMS service error: " + (error.message || "Unknown error")
    );
  }
});

// ── SAVE SMS CONFIG ───────────────────────────────────
exports.saveSMSConfig = onCall({ region: "asia-south1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }

  const { apiKey, senderId } = request.data;
  if (!apiKey) {
    throw new HttpsError("invalid-argument", "API key is required.");
  }

  const admin = require("firebase-admin");
  if (!admin.apps.length) admin.initializeApp();
  const db = admin.firestore();

  await db.collection("users").doc(request.auth.uid).set(
    { smsConfig: { apiKey, senderId: senderId || "KHETDI" } },
    { merge: true }
  );

  return { success: true };
});
