/* Router, shell (top bar, tab bar) and start-up. */
(function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = GC.util;
  GC.screens = GC.screens || {};
  GC.unlocked = false;

  const PUBLIC = ['splash', 'language', 'onboarding', 'signup', 'otp', 'setup', 'login', 'forgot', 'lock'];
  const TABS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'log', label: 'Log', icon: 'log' },
    { id: 'impact', label: 'Impact', icon: 'chart' },
    { id: 'rewards', label: 'Rewards', icon: 'gift' },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ];

  function parseHash() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'splash', param: parts[1] ? decodeURIComponent(parts[1]) : '', param2: parts[2] ? decodeURIComponent(parts[2]) : '' };
  }

  GC.render = function render() {
    const r = parseHash();
    const u = GC.user();
    let name = r.name;
    if (!GC.screens[name]) name = u ? 'home' : 'splash';
    // guards
    if (!u && !PUBLIC.includes(name)) { location.replace('#/login'); return; }
    if (u && ['signup', 'otp', 'login', 'forgot'].includes(name)) { location.replace('#/home'); return; }
    if (u && u.settings.lock && !GC.unlocked && name !== 'lock') { location.replace('#/lock'); return; }
    if (name !== 'lock' && GC.sheet.isOpen()) GC.sheet.close(true);

    GC.progressLine(220);
    const out = GC.screens[name](r.param, r.param2) || { html: '' };
    const view = $('#view');
    view.className = 'view' + (out.full ? ' full' : '');
    view.innerHTML = out.html;
    view.scrollTop = 0;
    view.setAttribute('aria-label', out.title || 'GreenCommons');

    // top bar
    const bar = $('#topbar');
    if (out.noBar) bar.hidden = true;
    else {
      bar.hidden = false;
      const back = out.back ? '<button class="icon-btn" data-go="' + out.back + '" aria-label="' + t('Back') + '">' + GC.icon('back') + '</button>' : '';
      const bell = u && !out.noBell ? '<button class="icon-btn" data-go="/inbox" aria-label="' + t('Inbox') + '">' + GC.icon('bell') + (GC.unread() ? '<span class="dot"></span>' : '') + '</button>' : '';
      bar.innerHTML = back + '<h1>' + esc(t(out.title || '')) + '</h1>' + (out.barExtra || '') + bell;
    }
    // tab bar
    const tb = $('#tabbar');
    if (out.tab && u) {
      tb.hidden = false;
      tb.innerHTML = TABS.map((x) => '<button class="tab' + (x.id === out.tab ? ' active' : '') + '" data-go="/' + x.id + '"' + (x.id === out.tab ? ' aria-current="page"' : '') + '>' + GC.icon(x.icon) + '<span>' + esc(t(x.label)) + '</span></button>').join('');
    } else tb.hidden = true;

    if (out.mount) out.mount(view, r);
    updateOffline();
    GC.flushNotices();
    GC.checkLevelUp();
  };

  GC.checkLevelUp = () => {
    if (!GC.pendingLevelUp || GC.sheet.isOpen()) return;
    const lv = GC.pendingLevelUp; GC.pendingLevelUp = null;
    const u = GC.user(); if (!u) return;
    GC.sheet.open({
      title: 'You reached ' + lv,
      html: '<div class="center"><div style="margin:8px auto;width:56px;height:56px;border-radius:50%;background:var(--pale);color:var(--green);display:flex;align-items:center;justify-content:center">' + GC.icon('badge', 32) + '</div>' +
        '<p class="mid">Your Green Credit is now <b>' + GC.util.num(GC.totals(u).score) + '</b>. Keep going. New vouchers may now be unlocked.</p></div>' +
        '<div class="btn-row"><button class="btn outline" data-act="level-email">Email me this</button><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>'
    });
  };
  GC.act['level-email'] = () => { const u = GC.user(); GC.mail('GreenCommons level reached', 'Hello ' + u.name + ',\n\nYou reached a new level. Your Green Credit is ' + GC.util.num(GC.totals(u).score) + '.\n\nThis is a habit score, not a financial credit score.\n\nGreenCommons (prototype)'); };
  GC.afterAction = () => { GC.flushNotices(); GC.checkLevelUp(); };

  function updateOffline() {
    const el = $('#offline'); const u = GC.user();
    if (!navigator.onLine && u) { el.hidden = false; el.innerHTML = GC.icon('wifi', 18) + '<span>You are offline. Everything works except email and sharing.</span>'; } else el.hidden = true;
  }
  window.addEventListener('online', updateOffline);
  window.addEventListener('offline', updateOffline);
  window.addEventListener('hashchange', () => GC.render());

  // install prompt (Chrome)
  GC.installEvent = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); GC.installEvent = e; });
  window.addEventListener('appinstalled', () => { GC.installEvent = null; GC.toast('GreenCommons is installed'); });
  GC.act['install-app'] = async () => {
    if (GC.installEvent) { GC.installEvent.prompt(); try { await GC.installEvent.userChoice; } catch (e) { /* ignore */ } GC.installEvent = null; GC.render(); }
    else GC.sheet.open({ title: 'Install GreenCommons', html: '<p class="mid">In Chrome, open the menu (three dots) and choose <b>Install app</b> or <b>Add to Home screen</b>. After that GreenCommons opens like any other app, even without internet.</p><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>' });
  };

  /* ---------- start ---------- */
  function start() {
    const S = GC.state();
    if (S.lang) I18N.set(S.lang);
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    if (!location.hash) location.replace('#/splash');
    GC.render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
