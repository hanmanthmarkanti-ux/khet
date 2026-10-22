/* Khet Diary service worker — offline support
   - Navigations: network first, fall back to cache (app opens with no internet)
   - Same-origin static files: cache first
   - CDN scripts/fonts (Firebase SDK, Inter font): cache-first after first load
   - Firebase data/auth endpoints are never intercepted, so login & sync stay live */
const VERSION = 'khet-diary-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './favicon-32.png',
  './favicon-16.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(CORE).catch(() => c.add('./index.html')))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const FIREBASE_DATA = /firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebaselogging|firebaseinstallations|app-measurement|firebasestorage\.googleapis\.com/i;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (!/^https?:$/.test(url.protocol)) return;
  // Never intercept Firebase auth/data traffic (must stay live)
  if (FIREBASE_DATA.test(url.hostname)) return;

  // App pages: network first, cache fallback (offline)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else (static + CDN): cache first, refresh in background
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) {
        // refresh in background (stale-while-revalidate)
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
        }).catch(() => {});
        return hit;
      }
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        if (req.url.indexOf('index.html') !== -1 || url.pathname === '/') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
