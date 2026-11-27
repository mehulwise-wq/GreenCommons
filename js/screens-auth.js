/* Screens 1 to 8: Splash, Language, Onboarding, Sign up, OTP, Profile setup, Login, Forgot PIN. Plus app lock. */
(function () {
  const { esc, num } = GC.util;
  const $ = (s, r) => (r || document).querySelector(s);
  const ic = GC.icon;
  GC.flow = {};
  const here = () => (location.hash || '').replace(/^#\/?/, '').split('/')[0];

  /* ---------- 1. Splash ---------- */
  GC.screens.splash = () => ({
    title: 'GreenCommons', noBar: true, full: true,
    html: '<div class="splash">' + GC.logoSvg(88) + '<div class="name">GreenCommons</div><p class="mid">Small habits, shared impact.</p><div class="line"><i></i></div></div>',
    mount() {
      setTimeout(() => {
        if (here() !== 'splash') return;
        const S = GC.state();
        let to;
        if (!S.lang) to = '/language';
        else if (GC.user()) to = '/home';
        else if (Object.keys(S.accounts).length) to = '/login';
        else to = S.onboarded ? '/signup' : '/onboarding';
        GC.go(to);
      }, 2000);
    }
  });

  /* ---------- 2. Language ---------- */
  let pickedLang = null;
  GC.screens.language = (from) => {
    pickedLang = pickedLang || GC.state().lang || null;
    const heads = ['en', 'hi', 'bn', 'ta'].map((c) => '<div class="' + (c === 'en' ? 'heading' : 'mid') + '">' + esc(I18N.SELECT[c]) + '</div>').join('');
    const list = I18N.LANGS.map((l) => '<button class="lang' + (l.code === pickedLang ? ' sel' : '') + '" data-act="lang-pick" data-v="' + l.code + '"><span><span class="native">' + esc(l.native) + '</span><br><span class="small mid">' + esc(l.english) + '</span></span>' + (l.code === pickedLang ? ic('check') : '') + '</button>').join('');
    return {
      title: 'Choose your language', noBar: !from, back: from === 'settings' ? '/settings' : from === 'login' ? '/login' : '',
      html: '<div class="stack" style="margin-bottom:16px">' + heads + '</div>' + list + '<div style="position:sticky;bottom:-16px;background:linear-gradient(transparent,#fff 30%);padding:12px 0 0"><button class="btn block" data-act="lang-continue" data-from="' + (from || '') + '"' + (pickedLang ? '' : ' disabled') + '>' + t('Continue') + '</button></div>'
    };
  };
  GC.act['lang-pick'] = (el) => {
    pickedLang = el.dataset.v;
    document.querySelectorAll('.lang').forEach((b) => { const on = b.dataset.v === pickedLang; b.classList.toggle('sel', on); const chk = b.querySelector('svg'); if (chk) chk.remove(); if (on) b.insertAdjacentHTML('beforeend', ic('check')); });
    $('[data-act="lang-continue"]').disabled = false;
  };
  GC.act['lang-continue'] = (el) => {
    const code = pickedLang; if (!code) return;
    const L = I18N.LANGS.find((l) => l.code === code);
    const note = I18N.isTranslated(code) ? '' : '<p class="small mid mt">Only the welcome text is translated in this prototype. The rest of the app will show in English until this language is reviewed and added.</p>';
    GC.sheet.open({
      title: esc(L.english),
      html: '<div class="card pale center" style="padding:24px"><div class="heading" dir="' + (L.rtl ? 'rtl' : 'ltr') + '">' + esc(I18N.WELCOME[code]) + '</div></div>' + note + '<div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Back') + '</button><button class="btn" data-act="lang-confirm" data-from="' + el.dataset.from + '">' + t('Continue') + '</button></div>'
    });
  };
  GC.act['lang-confirm'] = (el) => {
    GC.setLang(pickedLang); GC.sheet.close(true);
    const from = el.dataset.from; pickedLang = null;
    if (from === 'settings') GC.go('/settings'); else if (from === 'login') GC.go('/login'); else GC.go(GC.state().onboarded ? '/signup' : '/onboarding');
  };

  /* ---------- 3. Onboarding ---------- */
  let slide = 0;
  const SLIDES = [
    { h: 'Track what you save', p: 'Log small actions in four areas and see what they add up to.', art: () => '<div class="grid2" style="max-width:220px;margin:auto">' + GC.CATS.map((c) => '<div class="card line center" style="padding:16px"><div style="color:var(--green)">' + GC.catIcon(c.id) + '</div><div class="small semi mt">' + t(c.name) + '</div></div>').join('') + '</div>' },
    { h: 'Build your Green Credit', p: 'Everyone starts at 2,000. Good habits move you towards 7,000.', art: () => GC.gauge(2000) },
    { h: 'Earn rewards, help your community', p: 'Turn points into vouchers and join your school, ward or farm group.', art: () => '<div class="row" style="justify-content:center;gap:24px;color:var(--green)">' + ic('gift', 56) + ic('users', 56) + '</div>' }
  ];
  GC.screens.onboarding = (mode) => {
    slide = 0;
    return {
      title: 'GreenCommons', noBar: true, full: true,
      html: '<div class="onb" id="onb"></div>',
      mount() { drawSlide(mode); }
    };
  };
  function drawSlide(mode) {
    const s = SLIDES[slide], last = slide === SLIDES.length - 1;
    const dots = SLIDES.map((_, i) => '<i class="' + (i === slide ? 'on' : '') + '"></i>').join('');
    let actions;
    if (!last) actions = '<button class="btn block" data-act="onb-next" data-mode="' + (mode || '') + '">' + t('Next') + '</button>';
    else if (mode === 'help') actions = '<button class="btn block" data-go="/help">' + t('Done') + '</button>';
    else actions = '<button class="btn block" data-go="/signup" data-act="onb-done">' + t('Get started') + '</button><button class="btn text block" data-go="/login" data-act="onb-done" style="margin-top:6px">' + t('I already have an account') + '</button>';
    $('#onb').innerHTML = '<div class="row" style="justify-content:flex-end;min-height:44px">' + (last ? '' : '<button class="btn text small" data-act="onb-skip" data-mode="' + (mode || '') + '">' + t('Skip') + '</button>') + '</div>' +
      '<div class="art"><div class="pic">' + s.art() + '<h2 class="heading mt2">' + t(s.h) + '</h2><p class="mid mt">' + t(s.p) + '</p></div></div><div class="dots">' + dots + '</div>' + actions;
  }
  GC.act['onb-next'] = (el) => { slide++; drawSlide(el.dataset.mode); };
  GC.act['onb-skip'] = (el) => { const S = GC.state(); if (el.dataset.mode === 'help') return GC.go('/help'); S.onboarded = true; GC.save(); GC.go('/signup'); };
  GC.act['onb-done'] = () => { const S = GC.state(); S.onboarded = true; GC.save(); };

  /* ---------- 4. Sign up ---------- */
  const fieldMsg = (id, text) => { const el = $('#m-' + id); if (el) el.innerHTML = text ? GC.ui.msg(text) : ''; };
  GC.screens.signup = () => {
    const f = GC.flow.form || {};
    return {
      title: 'Sign up', back: '/language/login',
      html: '<form id="signup-form" novalidate autocomplete="off">' +
        '<label class="field"><span class="lbl">' + t('Full name') + '</span><input class="input" id="su-name" autocomplete="name" value="' + esc(f.name || '') + '"><div id="m-name"></div></label>' +
        '<label class="field"><span class="lbl">' + t('Mobile number') + '</span><div class="phone-row"><span class="pre">+91</span><input class="input" id="su-phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" value="' + esc(f.phone || '') + '"></div><div id="m-phone"></div></label>' +
        '<label class="field"><span class="lbl">' + t('Gmail address') + '</span><input class="input" id="su-email" type="email" autocomplete="email" value="' + esc(f.email || '') + '"><div id="m-email"></div></label>' +
        '<label class="field"><span class="lbl">4-digit PIN</span><input class="input" id="su-pin" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"><div id="m-pin"></div></label>' +
        '<label class="field"><span class="lbl">Confirm PIN</span><input class="input" id="su-pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"><div id="m-pin2"></div></label>' +
        '<label class="check"><input type="checkbox" id="su-terms"><span>I agree to the <a href="#" data-act="show-terms">Terms and Privacy</a>.</span></label><div id="m-terms"></div>' +
        '<button type="submit" class="btn block mt2">' + t('Send OTP') + '</button>' +
        '<p class="center small mid mt">' + t('No account yet?').replace('No account yet?', 'Already registered?') + ' <a href="#/login">' + t('Log in') + '</a></p></form>',
      mount() { $('#signup-form').addEventListener('submit', (e) => { e.preventDefault(); submitSignup(); }); }
    };
  };
  function submitSignup() {
    const v = { name: $('#su-name').value.trim(), phone: $('#su-phone').value.replace(/\D/g, ''), email: $('#su-email').value.trim(), pin: $('#su-pin').value, pin2: $('#su-pin2').value, terms: $('#su-terms').checked };
    let ok = true;
    const bad = (id, m) => { fieldMsg(id, m); ok = false; };
    ['name', 'phone', 'email', 'pin', 'pin2', 'terms'].forEach((k) => fieldMsg(k, ''));
    if (v.name.length < 2) bad('name', 'Enter your full name.');
    if (!/^[6-9]\d{9}$/.test(v.phone)) bad('phone', 'Enter a 10-digit mobile number.');
    if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(v.email)) bad('email', 'Enter a Gmail address, like name@gmail.com.');
    if (!/^\d{4}$/.test(v.pin)) bad('pin', 'The PIN must be 4 digits.');
    if (v.pin2 !== v.pin) bad('pin2', 'The two PINs do not match.');
    if (!v.terms) bad('terms', 'Please tick the box to continue.');
    GC.flow.form = { name: v.name, phone: v.phone, email: v.email };
    if (!ok) return;
    if (GC.findAccount(v.phone)) {
      GC.sheet.open({ title: 'This number already has an account', html: '<p class="mid">Each mobile number can have one account. Please log in instead.</p><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Cancel') + '</button><button class="btn" data-act="to-login">' + t('Log in') + '</button></div>' });
      return;
    }
    GC.flow.signup = { name: v.name, phone: v.phone, email: v.email, pin: v.pin, code: String(Math.floor(1000 + Math.random() * 9000)), tries: 0, lockUntil: 0, sentAt: Date.now(), showCode: true };
    GC.go('/otp');
  }
  GC.act['to-login'] = () => { GC.sheet.close(true); GC.go('/login'); };
  GC.act['show-terms'] = (el, e) => {
    e.preventDefault();
    GC.sheet.open({ title: 'Terms and Privacy', html: '<p class="mid">GreenCommons is a prototype. Your details are kept on this device only, and nothing is sent to a server. Points, rankings and vouchers are simulated. This is a habit score, not a financial credit score, and it is never shared with banks.</p><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>' });
  };

  /* ---------- 5. OTP (simulated) ---------- */
  let otpTimer = null;
  GC.screens.otp = () => {
    const f = GC.flow.signup;
    if (!f) return { title: 'Sign up', html: '<div class="empty">' + 'Start from sign up.' + '<br><a class="btn mt" href="#/signup">' + t('Sign up') + '</a></div>' };
    return {
      title: 'Verify number', back: '/signup',
      html: '<h2 class="heading">Enter the code</h2><p class="mid mt">We sent a 4-digit code to +91 ' + esc(f.phone) + '.</p>' +
        '<div class="otp" id="otp">' + [0, 1, 2, 3].map((i) => '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + (i + 1) + '" data-i="' + i + '">').join('') + '</div>' +
        '<div id="otp-msg" class="center"></div>' +
        '<button class="btn block mt2" data-act="otp-verify">' + t('Verify') + '</button>' +
        '<p class="center mt"><button class="btn text" data-act="otp-resend" id="otp-resend" disabled>Resend code</button></p>' +
        '<p class="demo-note">Prototype: no SMS is sent. The code is shown on screen.</p>',
      mount() {
        const boxes = Array.from(document.querySelectorAll('#otp input'));
        boxes.forEach((b, i) => {
          b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, '').slice(0, 1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); });
          b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
          b.addEventListener('paste', (e) => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4); if (!d) return; e.preventDefault(); d.split('').forEach((c, k) => { if (boxes[k]) boxes[k].value = c; }); (boxes[Math.min(d.length, 3)]).focus(); });
        });
        boxes[0].focus();
        if (f.showCode) { f.showCode = false; showDemoCode(f); }
        runResendTimer(f);
      }
    };
  };
  function showDemoCode(f) {
    GC.sheet.open({ title: 'Demo code', html: '<p class="mid">This prototype does not send real messages. Use this code:</p><div class="code">' + esc(f.code) + '</div><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>' });
  }
  function runResendTimer(f) {
    clearInterval(otpTimer);
    const btn = () => $('#otp-resend');
    const tick = () => {
      const b = btn(); if (!b) { clearInterval(otpTimer); return; }
      const left = 30 - Math.floor((Date.now() - f.sentAt) / 1000);
      if (left > 0) { b.disabled = true; b.textContent = 'Resend code in ' + left + 's'; } else { b.disabled = false; b.textContent = 'Resend code'; clearInterval(otpTimer); }
    };
    tick(); otpTimer = setInterval(tick, 1000);
  }
  GC.act['otp-resend'] = () => { const f = GC.flow.signup; f.code = String(Math.floor(1000 + Math.random() * 9000)); f.sentAt = Date.now(); runResendTimer(f); showDemoCode(f); };
  GC.act['otp-verify'] = () => {
    const f = GC.flow.signup; const msg = $('#otp-msg');
    if (f.lockUntil > Date.now()) { msg.innerHTML = GC.ui.msg('Too many tries. Wait a minute and try again.'); return; }
    const code = Array.from(document.querySelectorAll('#otp input')).map((b) => b.value).join('');
    if (code.length < 4) { msg.innerHTML = GC.ui.msg('Enter all 4 digits.'); return; }
    if (code !== f.code) {
      f.tries++;
      if (f.tries >= 3) { f.tries = 0; f.lockUntil = Date.now() + 60000; msg.innerHTML = GC.ui.msg('Three wrong tries. This screen is locked for one minute.'); } else msg.innerHTML = GC.ui.msg('That code is not right. ' + (3 - f.tries) + ' tries left.');
      document.querySelectorAll('#otp input').forEach((b) => { b.value = ''; }); document.querySelector('#otp input').focus();
      return;
    }
    clearInterval(otpTimer);
    GC.signup({ name: f.name, phone: f.phone, email: f.email, pin: f.pin });
    GC.unlocked = true; GC.flow = {};
    GC.go('/setup');
  };

  /* ---------- 6. Profile setup ---------- */
  let step = 1; const prof = {};
  GC.screens.setup = () => {
    step = 1; Object.assign(prof, GC.user() ? GC.user().profile : {});
    return { title: 'Set up your profile', noBell: true, html: '<div id="setup"></div>', mount() { drawSetup(); } };
  };
  function drawSetup() {
    const dots = [1, 2, 3].map((i) => '<i class="' + (i === step ? 'on' : '') + '"></i>').join('');
    let body = '';
    if (step === 1) {
      body = '<h2 class="heading">Your age group</h2><p class="mid mt">This helps us tailor tips.</p><div class="chips mt" style="flex-wrap:wrap;overflow:visible">' + GC.AGE_GROUPS.map((a) => '<button class="chip' + (prof.age === a ? ' sel' : '') + '" data-act="setup-age" data-v="' + a + '">' + a + '</button>').join('') + '</div>';
    } else if (step === 2) {
      body = '<h2 class="heading">Where are you?</h2><label class="field"><span class="lbl">State</span><select class="input" id="sp-state"><option value="">Choose a state</option>' + GC.STATES.map((s) => '<option' + (prof.state === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label>' +
        '<label class="field"><span class="lbl">District</span><input class="input" id="sp-district" value="' + esc(prof.district || '') + '"></label>' +
        '<label class="field"><span class="lbl">PIN code</span><input class="input" id="sp-pincode" inputmode="numeric" maxlength="6" value="' + esc(prof.pincode || '') + '"></label>' +
        '<label class="field"><span class="lbl">Locality</span><input class="input" id="sp-locality" value="' + esc(prof.locality || '') + '"></label>';
    } else {
      const farmer = prof.type === 'Farmer';
      body = '<h2 class="heading">About you</h2><div class="chips mt" style="flex-wrap:wrap;overflow:visible">' + GC.PROFILE_TYPES.map((p) => '<button class="chip' + (prof.type === p ? ' sel' : '') + '" data-act="setup-type" data-v="' + p + '">' + p + '</button>').join('') + '</div>' +
        '<label class="field"><span class="lbl">Household size</span><input class="input" id="sp-household" type="number" min="1" max="30" value="' + esc(prof.household || 3) + '"></label>' +
        (farmer ? '<label class="field"><span class="lbl">Land size (acres)</span><input class="input" id="sp-land" type="number" min="0" step="0.1" value="' + esc(prof.land || '') + '"></label><label class="field"><span class="lbl">Main crop</span><input class="input" id="sp-crop" value="' + esc(prof.crop || '') + '"></label><label class="field"><span class="lbl">Irrigation type</span><select class="input" id="sp-irr"><option value="">Choose</option>' + GC.IRRIGATION.map((s) => '<option' + (prof.irrigation === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label>' : '');
    }
    $('#setup').innerHTML = '<div class="dots" style="margin-top:0">' + dots + '</div>' + body +
      '<div class="btn-row"><button class="btn outline" data-act="setup-skip">' + (step === 1 ? 'Not now' : t('Skip')) + '</button><button class="btn" data-act="setup-next">' + t('Continue') + '</button></div>';
  }
  function readStep() {
    if (step === 2) { prof.state = $('#sp-state').value; prof.district = $('#sp-district').value.trim(); prof.pincode = $('#sp-pincode').value.trim(); prof.locality = $('#sp-locality').value.trim(); }
    if (step === 3) {
      prof.household = Math.max(1, Number($('#sp-household').value) || 1);
      if (prof.type === 'Farmer') { prof.land = $('#sp-land').value; prof.crop = $('#sp-crop').value.trim(); prof.irrigation = $('#sp-irr').value; }
    }
  }
  function finishSetup() {
    const u = GC.user(); Object.assign(u.profile, prof); GC.save();
    GC.sheet.open({ title: 'You are all set', html: '<div class="card pale center"><div class="score-num">' + num(GC.START_SCORE) + '</div><p class="mid">Your starting Green Credit is ' + num(GC.START_SCORE) + ' points.</p></div><div class="btn-row"><button class="btn" data-act="setup-done">' + t('Get started') + '</button></div>', onClose: () => { if (here() === 'setup') GC.go('/home'); } });
  }
  GC.act['setup-age'] = (el) => { prof.age = el.dataset.v; drawSetup(); };
  GC.act['setup-type'] = (el) => { readStep(); prof.type = el.dataset.v; drawSetup(); };
  GC.act['setup-next'] = () => { readStep(); if (step < 3) { step++; drawSetup(); } else finishSetup(); };
  GC.act['setup-skip'] = () => { if (step < 3) { step++; drawSetup(); } else finishSetup(); };
  GC.act['setup-done'] = () => { GC.sheet.close(true); GC.go('/home'); };

  /* ---------- 7. Login ---------- */
  let pin = '', lockTimer = null;
  const pinHtml = () => GC.pinPad('pin-dots', 4, pin);
  GC.screens.login = () => {
    pin = '';
    const last = Object.keys(GC.state().accounts)[0] || '';
    return {
      title: 'Log in', noBell: true,
      barExtra: '<button class="icon-btn" data-go="/language/login" aria-label="' + t('Language') + '">' + ic('globe') + '</button>',
      html: '<h2 class="heading">Welcome back</h2><label class="field"><span class="lbl">' + t('Mobile number') + '</span><div class="phone-row"><span class="pre">+91</span><input class="input" id="lg-phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" value="' + esc(last) + '"></div></label>' +
        '<p class="small mid mt2 center">Enter your PIN</p><div id="pin-area">' + pinHtml() + '</div><div id="lg-msg" class="center"></div>' +
        '<button class="btn block mt" data-act="login-go" id="lg-btn" disabled>' + t('Log in') + '</button>' +
        '<p class="center mt"><a href="#/forgot">' + t('Forgot PIN?') + '</a></p><p class="center small mid">New here? <a href="#/signup">' + t('Sign up') + '</a></p>',
      mount() { checkLock(); }
    };
  };
  function refreshPin(area) { $('#pin-area').innerHTML = pinHtml(); const b = $('#lg-btn') || $('#unlock-btn'); if (b) b.disabled = pin.length < 4; }
  GC.act['pin-digit'] = (el) => { if (pin.length < 4) { pin += el.dataset.v; refreshPin(); } };
  GC.act['pin-del'] = () => { pin = pin.slice(0, -1); refreshPin(); };
  function checkLock() {
    const phone = ($('#lg-phone') || {}).value || '';
    clearInterval(lockTimer);
    const li = GC.lockInfo(phone);
    if (!li.locked) return;
    const show = () => {
      const left = Math.ceil((li.until - Date.now()) / 1000);
      const el = $('#lg-msg'); if (!el) { clearInterval(lockTimer); return; }
      if (left <= 0) { clearInterval(lockTimer); el.innerHTML = ''; return; }
      el.innerHTML = GC.ui.msg('Too many wrong PINs. Try again in ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + '.');
    };
    show(); lockTimer = setInterval(show, 1000);
  }
  GC.act['login-go'] = () => {
    const phone = $('#lg-phone').value.replace(/\D/g, ''); const msg = $('#lg-msg');
    if (!/^\d{10}$/.test(phone)) { msg.innerHTML = GC.ui.msg('Enter your 10-digit mobile number.'); return; }
    const res = GC.login(phone, pin);
    pin = ''; refreshPin();
    if (res.ok) { GC.unlocked = true; GC.go('/home'); return; }
    if (res.locked) { checkLock(); return; }
    msg.innerHTML = GC.ui.msg(res.error + (res.left ? ' ' + res.left + ' tries left.' : ''));
  };

  /* ---------- 8. Forgot PIN (three-step sheet) ---------- */
  let fp = {};
  GC.screens.forgot = () => {
    const base = GC.screens.login();
    const baseMount = base.mount;
    return Object.assign(base, { mount() { baseMount(); fp = { step: 1 }; openForgot(); } });
  };
  function forgotBody() {
    if (fp.step === 1) return '<p class="mid">Confirm the number and Gmail address on your account.</p><label class="field"><span class="lbl">' + t('Mobile number') + '</span><input class="input" id="fp-phone" inputmode="numeric" maxlength="10" value="' + esc(fp.phone || '') + '"></label><label class="field"><span class="lbl">' + t('Gmail address') + '</span><input class="input" id="fp-email" type="email" value="' + esc(fp.email || '') + '"></label><div id="fp-msg"></div><div class="btn-row"><button class="btn" data-act="fp-next">' + t('Continue') + '</button></div>';
    if (fp.step === 2) return '<p class="mid">Enter the demo code. No message is sent in this prototype.</p><div class="code">' + esc(fp.code) + '</div><label class="field"><span class="lbl">Code</span><input class="input" id="fp-code" inputmode="numeric" maxlength="4"></label><div id="fp-msg"></div><div class="btn-row"><button class="btn" data-act="fp-next">' + t('Verify') + '</button></div>';
    return '<p class="mid">Choose a new 4-digit PIN.</p><label class="field"><span class="lbl">New PIN</span><input class="input" id="fp-pin" type="password" inputmode="numeric" maxlength="4"></label><label class="field"><span class="lbl">Confirm PIN</span><input class="input" id="fp-pin2" type="password" inputmode="numeric" maxlength="4"></label><div id="fp-msg"></div><div class="btn-row"><button class="btn" data-act="fp-next">' + t('Save') + '</button></div>';
  }
  function openForgot() {
    GC.sheet.open({ title: 'Reset your PIN (step ' + fp.step + ' of 3)', html: forgotBody(), onClose: () => { if (here() === 'forgot') GC.go('/login'); } });
  }
  GC.act['fp-next'] = () => {
    const msg = (m) => { $('#fp-msg').innerHTML = GC.ui.msg(m); };
    if (fp.step === 1) {
      const phone = $('#fp-phone').value.replace(/\D/g, ''), email = $('#fp-email').value.trim().toLowerCase();
      const acc = GC.findAccount(phone);
      if (!acc || acc.email.toLowerCase() !== email) return msg('We could not match that number and Gmail address.');
      fp = { step: 2, phone, email, code: String(Math.floor(1000 + Math.random() * 9000)) };
    } else if (fp.step === 2) {
      if ($('#fp-code').value.trim() !== fp.code) return msg('That code is not right.');
      fp.step = 3;
    } else {
      const a = $('#fp-pin').value, b = $('#fp-pin2').value;
      if (!/^\d{4}$/.test(a)) return msg('The PIN must be 4 digits.');
      if (a !== b) return msg('The two PINs do not match.');
      GC.resetPin(fp.phone, a); GC.sheet.close(true); GC.toast('PIN changed. Please log in.'); GC.go('/login'); return;
    }
    GC.sheet.set(forgotBody(), 'Reset your PIN (step ' + fp.step + ' of 3)');
  };

  /* ---------- App lock ---------- */
  GC.screens.lock = () => {
    pin = '';
    return {
      title: 'GreenCommons', noBar: true, full: true,
      html: '<div class="splash" style="justify-content:flex-start;padding-top:56px">' + GC.logoSvg(64) + '<h2 class="heading mt">App locked</h2><p class="mid">Enter your PIN to open GreenCommons.</p><div id="pin-area" style="width:100%">' + pinHtml() + '</div><div id="lg-msg"></div><button class="btn" style="min-width:220px" id="unlock-btn" data-act="unlock" disabled>Unlock</button><button class="btn text mt" data-act="lock-logout">' + t('Log out') + '</button></div>'
    };
  };
  GC.act['unlock'] = () => {
    const u = GC.user(); if (!u) return GC.go('/login');
    if (GC.hashPin(u.phone, pin) === u.pinHash) { GC.unlocked = true; GC.go('/home'); } else { pin = ''; refreshPin(); $('#lg-msg').innerHTML = GC.ui.msg('That PIN is not right.'); }
  };
  GC.act['lock-logout'] = () => { GC.logout(); GC.unlocked = false; GC.go('/login'); };
})();
