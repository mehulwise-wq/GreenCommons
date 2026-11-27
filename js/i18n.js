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
    en: 'Welcome to GreenCommons',
    hi: 'ग्रीनकॉमन्स में आपका स्वागत है',
    bn: 'গ্রিনকমন্সে স্বাগতম',
    mr: 'ग्रीनकॉमन्समध्ये आपले स्वागत आहे',
    te: 'గ్రీన్‌కామన్స్‌కు స్వాగతం',
    ta: 'கிரீன்காமன்ஸுக்கு வரவேற்கிறோம்',
    gu: 'ગ્રીનકોમન્સમાં આપનું સ્વાગત છે',
    ur: 'گرین کامنز میں خوش آمدید',
    kn: 'ಗ್ರೀನ್‌ಕಾಮನ್ಸ್‌ಗೆ ಸ್ವಾಗತ',
    or: 'ଗ୍ରୀନକମନ୍ସକୁ ସ୍ୱାଗତ',
    ml: 'ഗ്രീൻകോമൺസിലേക്ക് സ്വാഗതം',
    pa: 'ਗ੍ਰੀਨਕਾਮਨਜ਼ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
    as: 'গ্ৰীনকমনছলৈ স্বাগতম'
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
    'Select your language': 'अपनी भाषा चुनें', 'Welcome to GreenCommons': 'ग्रीनकॉमन्स में आपका स्वागत है',
    'No account yet?': 'अभी तक खाता नहीं है?', 'Choose your language': 'अपनी भाषा चुनें'
  };

  const DICT = { en: {}, hi: hi };

  const I18N = {
    LANGS, WELCOME, SELECT, DICT,
    lang: 'en',
    set(code) {
      this.lang = LANGS.some((l) => l.code === code) ? code : 'en';
      const meta = LANGS.find((l) => l.code === this.lang);
      document.documentElement.lang = this.lang;
      document.documentElement.dir = meta && meta.rtl ? 'rtl' : 'ltr';
    },
    t(key, vars) {
      const d = DICT[this.lang];
      let s = (d && d[key]) || key;
      if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
      return s;
    },
    isTranslated(code) { return code === 'en' || !!DICT[code]; }
  };

  window.I18N = I18N;
  window.t = (k, v) => I18N.t(k, v);
})();
