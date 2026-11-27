/* Translation table. English text is the key; add a language by adding one object to DICT.
   Strings missing from a language fall back to English. */
(function () {
  const LANGS = [
    { code: 'en', native: 'English', english: 'English' },
    { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
    { code: 'bn', native: 'বাংলা', english: 'Bengali' },
    { code: 'mr', native: 'मराठी', english: 'Marathi' },
    { code: 'te', native: 'తెలుగు', english: 'Telugu' },
    { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
    { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
    { code: 'ur', native: 'اردو', english: 'Urdu', rtl: true },
    { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
    { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia' },
    { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
    { code: 'as', native: 'অসমীয়া', english: 'Assamese' }
  ];

  const WELCOME = {
    en: 'Welcome to GreenAura',
    hi: 'ग्रीनऑरा में आपका स्वागत है',
    bn: 'গ্রিনঅরাে স্বাগতম',
    mr: 'ग्रीनऑरामध्ये आपले स्वागत आहे',
    te: 'గ్రీన్‌కామన్స్‌కు స్వాగతం',
    ta: 'கிரீன்காமன்ஸுக்கு வரவேற்கிறோம்',
    gu: 'ગ્રીનઓરામાં આપનું સ્વાગત છે',
    ur: 'گرین کامنز میں خوش آمدید',
    kn: 'ಗ್ರೀನ್‌ಆರಾ‌ಗೆ ಸ್ವಾಗತ',
    or: 'ଗ୍ରୀନକମନ୍ସକୁ ସ୍ୱାଗତ',
    ml: 'ഗ്രീൻകോമൺസിലേക്ക് സ്വാഗതം',
    pa: 'ਗ੍ਰੀਨਕਾਮਨਜ਼ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
    as: 'গ্ৰীনঅৰালৈ স্বাগতম'
  };

  const SELECT = {
    en: 'Select your language', hi: 'अपनी भाषा चुनें', bn: 'আপনার ভাষা বেছে নিন', mr: 'तुमची भाषा निवडा',
    te: 'మీ భాషను ఎంచుకోండి', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', gu: 'તમારી ભાષા પસંદ કરો',
    ur: 'اپنی زبان منتخب کریں', kn: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', or: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ',
    ml: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക', pa: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', as: 'আপোনাৰ ভাষা বাছনি কৰক'
  };

  // Hindi covers the main navigation, buttons and headings. Other languages need a native review
  // and a translation pass: copy the hi object, change the values, and register it below.
  const hi = {
    'Home': 'होम', 'Log': 'दर्ज करें', 'Impact': 'प्रभाव', 'Rewards': 'पुरस्कार', 'Profile': 'प्रोफ़ाइल',
    'Continue': 'आगे बढ़ें', 'Back': 'वापस', 'Save': 'सहेजें', 'Cancel': 'रद्द करें', 'Done': 'हो गया',
    'Skip': 'छोड़ें', 'Next': 'अगला', 'Retry': 'फिर कोशिश करें', 'Close': 'बंद करें', 'Yes': 'हाँ', 'No': 'नहीं',
    'Log in': 'लॉग इन', 'Sign up': 'साइन अप', 'Log out': 'लॉग आउट', 'Verify': 'सत्यापित करें',
    'Get started': 'शुरू करें', 'I already have an account': 'मेरा खाता पहले से है',
    'Forgot PIN?': 'पिन भूल गए?', 'Send OTP': 'ओटीपी भेजें',
    'Full name': 'पूरा नाम', 'Mobile number': 'मोबाइल नंबर', 'Gmail address': 'जीमेल पता', 'PIN': 'पिन',
    'Carbon': 'कार्बन', 'Water': 'पानी', 'Food': 'भोजन', 'Farm': 'खेती',
    'Green Credit': 'ग्रीन क्रेडिट', 'Leaderboard': 'लीडरबोर्ड', 'Challenges': 'चुनौतियाँ',
    'Learn': 'सीखें', 'Community': 'समुदाय', 'Reports': 'रिपोर्ट', 'Devices': 'उपकरण',
    'Settings': 'सेटिंग्स', 'Help': 'सहायता', 'About': 'जानकारी', 'Inbox': 'इनबॉक्स',
    'Log an action': 'कार्य दर्ज करें', "Today's goal": 'आज का लक्ष्य', 'Tip of the day': 'आज की सलाह',
    'Logged today': 'आज दर्ज किया', 'Not logged yet': 'अभी दर्ज नहीं',
    'Start logging': 'दर्ज करना शुरू करें', 'Hello': 'नमस्ते',
    'Language': 'भाषा', 'Reminder time': 'रिमाइंडर का समय', 'Delete account': 'खाता हटाएँ',
    'Show me as Anonymous': 'मुझे गुमनाम दिखाएँ', 'App lock': 'ऐप लॉक',
    'Vouchers': 'वाउचर', 'Badges': 'बैज', 'Fund Pool': 'फंड पूल', 'Reward Wallet': 'रिवॉर्ड वॉलेट',
    'Redeem': 'भुनाएँ', 'Locked': 'बंद', 'Week': 'सप्ताह', 'Month': 'महीना', 'All time': 'अब तक',
    'People': 'लोग', 'Groups': 'समूह', 'Active': 'सक्रिय', 'Available': 'उपलब्ध', 'Completed': 'पूरे हुए',
    'All': 'सभी', 'Alerts': 'अलर्ट', 'Official': 'आधिकारिक', 'Reminders': 'रिमाइंडर',
    'Email': 'ईमेल', 'Share': 'साझा करें', 'Add': 'जोड़ें', 'Edit': 'बदलें', 'Delete': 'हटाएँ',
    'Beginner': 'शुरुआती', 'Green': 'ग्रीन', 'Champion': 'चैंपियन',
    'Level': 'स्तर', 'Points': 'अंक', 'Amount': 'मात्रा', 'Date': 'तारीख', 'Note': 'टिप्पणी',
    'Deed': 'कार्य', 'Today': 'आज', 'Yesterday': 'कल', 'Notice board': 'सूचना पट्ट',
    'Announcements': 'घोषणाएँ', 'Join': 'जुड़ें', 'Join with a code': 'कोड से जुड़ें',
    'Add a device': 'उपकरण जोड़ें', 'Test connection': 'कनेक्शन जाँचें', 'Search': 'खोजें',
    'Listen': 'सुनें', 'Quiz': 'प्रश्नोत्तरी', 'Try it now': 'अभी आज़माएँ',
    'Why did my score change?': 'मेरा स्कोर क्यों बदला?', 'How is it calculated?': 'यह कैसे गिना जाता है?',
    'How to improve': 'सुधार कैसे करें', 'Your impact': 'आपका प्रभाव', 'In everyday terms': 'रोज़मर्रा की भाषा में',
    'Select your language': 'अपनी भाषा चुनें', 'Welcome to GreenAura': 'ग्रीनऑरा में आपका स्वागत है',
    'No account yet?': 'अभी तक खाता नहीं है?', 'Choose your language': 'अपनी भाषा चुनें'
  };

  // Build the dictionary for every language in translations.js. Hindi also keeps the shorter table above.
  const DICT = { en: {}, hi: Object.assign({}, hi) };
  (function () {
    const order = window.GC_LANG_ORDER || [], tr = window.GC_TR || {};
    order.forEach((c) => { if (!DICT[c]) DICT[c] = {}; });
    Object.keys(tr).forEach((k) => order.forEach((c, i) => { if (tr[k][i]) DICT[c][k] = tr[k][i]; }));
  })();

  /* Patterns for text that has numbers or names inside. */
  const GREET = { hi: 'नमस्ते', kn: 'ನಮಸ್ಕಾರ', mr: 'नमस्कार', bn: 'নমস্কার', gu: 'નમસ્તે' };
  const UNITS = ['litres saved', 'litres', 'km', 'kg', 'meals', 'loads', 'hours', 'taps', 'trees', 'times', 'days', 'checks', 'drives', 'gardens', 'systems', 'leaks', 'acres'];
  const unitRe = UNITS.map((u) => u.replace(/ /g, '\\s')).join('|');
  const RE_UNIT = new RegExp('^([\\d.,]+) (' + unitRe + ')( · .*)?$');
  const RE_PER = new RegExp('^per (' + unitRe + ') · minimum ([\\d.]+)( · one-time)?$');
  const RE_PTS = /^([\d.,]+) points$/;
  const RE_HELLO = /^Hello, (.+)$/;
  const RE_WEEK = /^\+?([\d.,]+) this week$/;
  const RE_NEXT = /^Next: (Beginner|Green|Champion) at ([\d.,]+)$/;
  const RE_TO = /^([\d.,]+) points to (Beginner|Green|Champion)$/;
  function pattern(code, d, key) {
    let m;
    if ((m = RE_WEEK.exec(key)) && d['This week']) return '+' + m[1] + ' ' + d['This week'];
    if ((m = RE_NEXT.exec(key)) && d['Next']) return d['Next'] + ': ' + d[m[1]] + ' · ' + m[2];
    if ((m = RE_TO.exec(key)) && d['Points']) return m[1] + ' ' + d['Points'] + ' → ' + d[m[2]];
    if ((m = RE_HELLO.exec(key)) && GREET[code]) return GREET[code] + ', ' + m[1];
    if ((m = RE_PTS.exec(key)) && d['Points']) return m[1] + ' ' + d['Points'];
    if ((m = RE_PER.exec(key)) && d[m[1]]) return d['per'] + ' ' + d[m[1]] + ' · ' + d['minimum'] + ' ' + m[2] + (m[3] ? ' · ' + (d['one-time'] || 'one-time') : '');
    if ((m = RE_UNIT.exec(key)) && d[m[2]]) return m[1] + ' ' + d[m[2]] + (m[3] || '');
    return null;
  }

  const I18N = {
    LANGS, WELCOME, SELECT, DICT,
    lang: 'en',
    set(code) {
      this.lang = LANGS.some((l) => l.code === code) ? code : 'en';
      const meta = LANGS.find((l) => l.code === this.lang);
      document.documentElement.lang = this.lang;
      document.documentElement.dir = meta && meta.rtl ? 'rtl' : 'ltr';
      if (this.lang !== 'en' && document.body) applyTree(document.body);
    },
    /* Translate one piece of text, or return null when there is no translation. */
    lookup(text) {
      const d = DICT[this.lang]; if (!d || this.lang === 'en') return null;
      const key = text.replace(/\s+/g, ' ').trim(); if (!key) return null;
      return d[key] || pattern(this.lang, d, key);
    },
    t(key, vars) {
      const d = DICT[this.lang];
      let s = (d && d[key]) || key;
      if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
      return s;
    },
    isTranslated(code) { return code === 'en' || !!DICT[code]; }
  };

  /* Translates text already on the page, and keeps translating as screens change. */
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, CODE: 1 };
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  let busy = false;
  function doText(n) {
    const p = n.parentElement; if (!p || SKIP[p.tagName] || p.closest('[data-notr]')) return;
    const v = n.nodeValue; const r = I18N.lookup(v);
    if (r && r !== v.trim()) n.nodeValue = v.replace(v.trim(), r);
  }
  function doAttrs(el) {
    ATTRS.forEach((a) => { const v = el.getAttribute && el.getAttribute(a); if (v) { const r = I18N.lookup(v); if (r && r !== v) el.setAttribute(a, r); } });
  }
  function applyTree(root) {
    if (I18N.lang === 'en' || !root) return;
    busy = true;
    try {
      if (root.nodeType === 3) doText(root);
      else if (root.nodeType === 1) {
        doAttrs(root);
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) doText(n);
        root.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(doAttrs);
      }
    } finally { busy = false; }
  }
  I18N.apply = applyTree;
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver((muts) => {
      if (busy || I18N.lang === 'en') return;
      muts.forEach((m) => { if (m.type === 'characterData') applyTree(m.target); else m.addedNodes.forEach((n) => applyTree(n)); });
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  window.I18N = I18N;
  window.t = (k, v) => I18N.t(k, v);
})();
