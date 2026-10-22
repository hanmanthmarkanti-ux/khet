//  AI FARMING ASSISTANT - Rule-based smart chatbot
const AI_NAME = 'Khet AI';
let aiOpen = false;

function toggleAI(){
  aiOpen = !aiOpen;
  document.getElementById('ai-panel').classList.toggle('open', aiOpen);
  if(aiOpen){
    const m = document.getElementById('ai-messages');
    if(m.children.length === 0){
      addBotMsg("Namaste! I'm <b>Khet AI</b> - your smart farming assistant.\n\nI can help you with:\n- <b>Crop tips</b> - Rice, Cotton, Chilli & more\n- <b>Fertilizer</b> - Right rates & timing\n- <b>Pest control</b> - Sprays & solutions\n- <b>Weather</b> - Farming advice\n- <b>Govt schemes</b> - PM-KISAN, Insurance\n- <b>Profit</b> - Track expenses & earnings\n\nJust ask me anything about farming!");
    }
  }
}

function sendAI(){
  const inp = document.getElementById('ai-input');
  const txt = inp.value.trim();
  if(!txt) return;
  addUserMsg(txt);
  inp.value = '';
  showTyping();
  setTimeout(()=>{
    hideTyping();
    addBotMsg(getAIReply(txt));
  }, 600 + Math.random()*800);
}

function addBotMsg(t){
  const m = document.getElementById('ai-messages');
  const d = document.createElement('div');
  d.className = 'ai-msg bot';
  d.innerHTML = '<div class="bot-name">'+AI_NAME+'</div>'+t.replace(/\n/g,'<br>');
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
}
function addUserMsg(t){
  const m = document.getElementById('ai-messages');
  const d = document.createElement('div');
  d.className = 'ai-msg user';
  d.textContent = t;
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
}
function showTyping(){document.getElementById('ai-typing').style.display='flex';document.getElementById('ai-messages').appendChild(document.getElementById('ai-typing'));document.getElementById('ai-messages').scrollTop=9999;}
function hideTyping(){document.getElementById('ai-typing').style.display='none';}

function quickAI(q){
  document.getElementById('ai-input').value = q;
  sendAI();
}

let voiceListening = false;
let recognition = null;
let voiceLang = 'en-IN';

function toggleVoice(){
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    addBotMsg("Voice not supported in this browser.\n\nPlease use <b>Chrome browser</b> on mobile or PC.");
    return;
  }
  if(voiceListening){
    stopVoice();
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = voiceLang;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  const btn = document.getElementById('ai-voice-btn');

  recognition.onstart = function(){
    voiceListening = true;
    btn.classList.add('listening');
    btn.textContent = '🎤';
    document.getElementById('ai-input').placeholder = '🎤 Listening... speak now';
  };

  recognition.onresult = function(event){
    let final = '';
    let interim = '';
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal) final += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    document.getElementById('ai-input').value = final || interim;
  };

  recognition.onend = function(){
    voiceListening = false;
    btn.classList.remove('listening');
    btn.textContent = '🎤';
    document.getElementById('ai-input').placeholder = 'Ask about farming...';
    const txt = document.getElementById('ai-input').value.trim();
    if(txt) sendAI();
  };

  recognition.onerror = function(e){
    voiceListening = false;
    btn.classList.remove('listening');
    btn.textContent = '🎤';
    document.getElementById('ai-input').placeholder = 'Ask about farming...';
    if(e.error === 'not-allowed'){
      addBotMsg("Microphone blocked!\n\nTo fix:\n1. Tap the lock icon in address bar\n2. Allow Microphone\n3. Refresh page & try again");
    } else if(e.error === 'no-speech'){
      addBotMsg("No speech detected. Try speaking louder and tap 🎤 again.");
    } else if(e.error === 'network'){
      addBotMsg("Network error. Check your internet connection.");
    } else {
      addBotMsg("Voice error: " + e.error + "\n\nTry again or type your question.");
    }
  };

  try {
    recognition.start();
  } catch(e) {
    addBotMsg("Could not start voice. Tap 🎤 and allow microphone permission when browser asks.");
  }
}

function stopVoice(){
  if(recognition) try { recognition.stop(); } catch(e){}
}

function cycleVoiceLang(){
  const langs = [
    {code:'en-IN', label:'EN'},
    {code:'te-IN', label:'TE'},
    {code:'hi-IN', label:'HI'}
  ];
  let idx = langs.findIndex(l => l.code === voiceLang);
  idx = (idx + 1) % langs.length;
  voiceLang = langs[idx].code;
  addBotMsg("Voice language changed to <b>" + langs[idx].label + "</b>\n\nNow tap 🎤 and speak!");
}

document.addEventListener('click', function(e){
  if(e.target.id === 'ai-voice-lang') cycleVoiceLang();
});

function getAIReply(input){
  const t = input.toLowerCase().trim();
  if(/^(hi|hello|hey|namaste|namaskar|sup|yo|howdy)/i.test(t))
    return "Namaste! How can I help with your farming today?";
  if(/thank|thanks/i.test(t))
    return "You're welcome! Happy farming!";
  if(/bye|goodbye|good night/i.test(t))
    return "Goodbye! May your crops flourish!";
  if(/rice|dhaan|paddy/i.test(t))
    return "<b>Rice</b>\n\nBest planting: June-July (Kharif)\nWater needed: 5-6 inches standing water\nFertilizer: Urea 130kg + SSP 60kg/acre\nHarvest: 120-150 days after planting\nCommon pests: Stem borer, leaf folder\nTip: Use Tricyclazole for blast disease";
  if(/cotton|kapas/i.test(t))
    return "<b>Cotton</b>\n\nPlanting: May-June\nSpacing: 90cm x 60cm\nFertilizer: N 120kg + P 60kg + K 60kg/ha\nKey pest: Bollworm - use Bt cotton or neem spray\nHarvest: 150-180 days\nTip: Remove square buds early for better yield";
  if(/chilli|chili|mirchi|capsicum/i.test(t))
    return "<b>Chilli</b>\n\nPlanting: June-July (transplant in Aug)\nSpacing: 60cm x 30cm\nFertilizer: N 100kg + P 50kg + K 50kg/ha\nCommon disease: Die-back - spray Copper oxychloride\nYield: 1.5-2 tonnes/acre\nTip: Use mulching to retain moisture";
  if(/groundnut|peanut|moongphali/i.test(t))
    return "<b>Groundnut</b>\n\nPlanting: June-July\nSpacing: 30cm x 10cm\nSeed rate: 80-100 kg/ha\nFertilizer: P 40kg + K 40kg/ha (no nitrogen needed)\nHarvest: 90-120 days\nTip: Uproot when 70% pods turn brown";
  if(/maize|corn|makka/i.test(t))
    return "<b>Maize</b>\n\nPlanting: June-July (Kharif) or Jan (Rabi)\nSpacing: 60cm x 20cm\nFertilizer: N 120kg + P 60kg + K 60kg/ha\nKey pest: Stem borer - use Chlorantraniliprole\nYield: 25-30 quintals/acre\nTip: Earthing up at 30 days helps root strength";
  if(/sugarcane|ganna/i.test(t))
    return "<b>Sugarcane</b>\n\nPlanting: Jan-Feb or Oct-Nov\nSpacing: 90cm x 60cm\nFertilizer: N 250kg + P 60kg + K 120kg/ha\nWater: 2000-2500mm total\nHarvest: 12-18 months\nTip: Apply earthing up twice for better tillering";
  if(/turmeric|haldi/i.test(t))
    return "<b>Turmeric</b>\n\nPlanting: June-July\nSpacing: 60cm x 30cm\nSeed: 2500 kg rhizome/ha\nFertilizer: N 60kg + P 30kg + K 90kg/ha\nHarvest: 8-10 months (when leaves turn yellow)\nYield: 20-25 tonnes/ha\nTip: Boiling & drying increases color & price";
  if(/onion|pyaz/i.test(t))
    return "<b>Onion</b>\n\nPlanting: Oct-Nov (Rabi)\nTransplant: Dec-Jan\nSpacing: 15cm x 10cm\nFertilizer: N 100kg + P 50kg + K 50kg/ha\nHarvest: When 50% tops fall over\nTip: Stop watering 10 days before harvest for longer storage";
  if(/tomato|tamatar/i.test(t))
    return "<b>Tomato</b>\n\nPlanting: Year-round (best June-July, Jan-Feb)\nSpacing: 60cm x 45cm\nFertilizer: N 100kg + P 60kg + K 60kg/ha\nCommon disease: Early blight - spray Mancozeb\nYield: 20-30 tonnes/ha\nTip: Staking plants improves airflow & reduces disease";
  if(/fertilizer|khaad|urea|dap|ssp|npk/i.test(t))
    return "<b>Fertilizer Guide</b>\n\n<b>Urea</b> (46% N): Rs 300/subsidy bag - for leafy growth\n<b>DAP</b> (18-46-0): Rs 1350/bag - for root & flower\n<b>SSP</b> (0-16-0-11): Rs 400/bag - for phosphorus\n<b>NPK</b> (10-26-26): Rs 900/bag - balanced nutrition\n<b>Neem cake</b>: Rs 15/kg - organic option\n\nApply N in 3 splits - basal, 30 days, 60 days";
  if(/pest|pesticide|insect|keet|bug|worm|bollworm|aphid/i.test(t))
    return "<b>Pest Control Tips</b>\n\n<b>Neem oil</b> (5ml/L): Safe, organic - spray weekly\n<b>Chlorantraniliprole</b>: Best for bollworm\n<b>Imidacloprid</b>: For sucking pests (aphids, jassids)\n<b>Profenophos</b>: For whitefly & bollworm\n\nAlways spray in evening\nMix sticker for better results\nRotate chemicals to prevent resistance";
  if(/water|irrigation|paani|drip|sprinkler/i.test(t))
    return "<b>Water Management</b>\n\n<b>Drip irrigation</b>: Saves 40-60% water\n<b>Sprinkler</b>: Good for sandy soil\n<b>Flood</b>: Best for paddy, wastes water\n\nWater early morning or evening\nMulching saves 25% water\nMost crops need 4-6 acre-inches/season";
  if(/weather|mausam|rain|barish|storm|cyclone/i.test(t))
    return "<b>Weather Tips for Farmers</b>\n\nCheck IMD app for daily forecast\nHeavy rain coming? Drain field, spray after rain\nDrought? Mulch heavily, reduce irrigation frequency\nFrost expected? Irrigate evening before (water retains heat)\n\nDownload: <a href='https://mausam.imd.gov.in' target='_blank' style='color:var(--blue)'>mausam.imd.gov.in</a>";
  if(/profit|fayda|loss|nukasan|income|money|kharchu|expense/i.test(t))
    return "<b>Profit Tips</b>\n\nUse Khet Diary to track every expense!\n\n<b>Good profit crops:</b>\nChilli: Rs 1.5-3 lakh/acre\nTurmeric: Rs 2-4 lakh/acre\nCotton: Rs 40-80K/acre\nRice: Rs 20-40K/acre\n\nTip: Track seed, fertilizer, labour, diesel separately in the app - then check your monthly report!";
  if(/loan|karz|debt|interest|byaaj|emi/i.test(t))
    return "<b>Loan & Interest Info</b>\n\n<b>KCC</b> (Kisan Credit Card): 4% interest (with subsidy)\n<b>Regular loan</b>: 9-12% interest\nUse the <b>Interest Calculator</b> in the app (PxRxT/100)\n\nTip: Always pay KCC loan on time to get interest subvention!";
  if(/labour|labor|worker|mazdoor|wage/i.test(t))
    return "<b>Labour & Worker Tips</b>\n\nMGNREGA: 100 days guaranteed work @ Rs 250-350/day\nFarm labour rate: Rs 400-700/day (varies by region)\nUse the <b>Workers</b> section in app to track daily wages\n\nTip: Record worker names & daily payments - never lose track!";
  if(/diesel|fuel|petrol|pump/i.test(t))
    return "<b>Diesel Tips</b>\n\nCurrent rate: Rs 90-105/litre (varies by state)\nTrack every fill in the <b>Diesel</b> section of app\nAverage usage: Tractor 8-12L/hr, Harvester 20-30L/hr\n\nTip: Compare avg Rs/litre across pumps - some bunk prices vary!";
  if(/harvest|fasal|sell|market|mandi|bazaar/i.test(t))
    return "<b>Harvest & Selling Tips</b>\n\nSell at <b>APMC mandi</b> for best price\nCheck daily prices: <a href='https://agmarknet.gov.in' target='_blank' style='color:var(--blue)'>agmarknet.gov.in</a>\nDon't sell immediately after harvest - wait 1-2 weeks if not urgent\nStore in gunny bags in dry place\n\nRecord selling price in app to calculate actual profit!";
  if(/organic|jaivik|natural|eco/i.test(t))
    return "<b>Organic Farming Tips</b>\n\n<b>Jeevamrutham</b>: Cow dung 10kg + urine 10L + jaggery 2kg + gram flour 2kg -> Ferment 48hrs\n<b>Neem cake</b>: Best organic fertilizer\n<b>Panchagavya</b>: Growth promoter\n<b>Beejamrutham</b>: Seed treatment\n\nTakes 2-3 years to fully transition - start gradually!";
  if(/rotation|cropping/i.test(t))
    return "<b>Crop Rotation Guide</b>\n\nBest rotations:\nPaddy -> Groundnut (fixes nitrogen)\nCotton -> Bengalgram (restores soil)\nChilli -> Rice -> Cotton\nSugarcane (3yr) -> Pulse -> Vegetable\n\nDon't: Cotton -> Cotton (depletes soil, more pests)";
  if(/soil|mitti|land|field|bhoomi/i.test(t))
    return "<b>Soil Health Tips</b>\n\nTest soil every year - cost Rs 200-400\nGet <b>Soil Health Card</b> free from govt\nIdeal pH: 6.5-7.5 for most crops\nAdd lime if acidic, gypsum if alkaline\nOrganic matter improves all soil types\n\nVisit your nearest soil testing lab!";
  if(/seed|beej|planting|nursery/i.test(t))
    return "<b>Seed & Nursery Tips</b>\n\nAlways use <b>certified seeds</b> from govt shops\nSeed treatment: Thiram 3g/kg seed (prevents fungal disease)\nNursery readiness: 25-30 days for rice, 35-40 for cotton\nSeed rate: Rice 20-25kg/ha, Cotton 5-8kg/ha\n\nBuy from Raitha Bazaar / AP Seeds for genuine quality!";
  if(/scheme|yojana|sarkari|subsidy|govt|government|pm kisan/i.test(t))
    return "<b>Government Schemes</b>\n\n<b>PM-KISAN</b>: Rs 6000/year (3 installments)\n<b>PM Fasal Bima</b>: Crop insurance\n<b>KCC</b>: Loan at 4% interest\n<b>MGNREGA</b>: 100 days work guarantee\n<b>PM KUSUM</b>: Solar pump subsidy\n<b>eNAM</b>: Online mandi for better prices\n\nApply via: <a href='https://pmkisan.gov.in' target='_blank' style='color:var(--blue)'>pmkisan.gov.in</a>";
  if(/insurance|bima|claim|pmfby/i.test(t))
    return "<b>Crop Insurance (PMFBY)</b>\n\nPremium: 2-5% of sum insured\nCovers: Flood, drought, pest attack, hailstorm\nApply before sowing deadline\nClaim: Report loss within 72 hours\n\nApply via: <a href='https://pmfby.gov.in' target='_blank' style='color:var(--blue)'>pmfby.gov.in</a>";
  if(/telugu/i.test(t))
    return "Telugu mode! Ask me about crops, fertilizer, pests, weather, govt schemes.";
  if(/help|madad|what can you|how to use|guide/i.test(t))
    return "<b>How I Can Help</b>\n\nAsk me about:\n<b>Crops</b>: Rice, Cotton, Chilli, Groundnut, Maize, Sugarcane, Turmeric, Onion, Tomato\n<b>Fertilizers</b>: Urea, DAP, SSP, NPK\n<b>Pests</b>: Bollworm, aphids, spray tips\n<b>Water</b>: Irrigation methods\n<b>Money</b>: Profit, expenses, loans\n<b>Govt schemes</b>: PM-KISAN, insurance\n<b>Weather</b>: Farming tips\n\nJust type your question!";
  const defaults = [
    "I'm not sure about that. Try asking about specific crops (rice, cotton, chilli), fertilizers, pests, water, or govt schemes!",
    "Hmm, I don't have info on that yet. But I know a lot about farming! Ask me about crops, fertilizer, irrigation, or profit tips.",
    "I didn't understand that. Try asking like:\n'How to grow rice?'\n'Best fertilizer for cotton?'\n'How to control bollworm?'",
    "Not sure about that one. I'm best at farming advice - crops, fertilizer, pests, weather, govt schemes. Try one of those!"
  ];
  return defaults[Math.floor(Math.random()*defaults.length)];
}