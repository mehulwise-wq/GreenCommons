/* GreenAura online layer (Supabase). Does nothing unless js/config.js is filled in.
   The phone keeps working offline; changes wait in an outbox and are sent when the network is back.
   The server re-checks every rule, so its answer wins over anything stored on the phone. */
(function () {
  const GC = window.GC; const CFG = window.GC_CONFIG || {};
  const KEY = 'greencommons.cloud.v1';
  const enabled = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  const base = (CFG.SUPABASE_URL || '').replace(/\/+$/, '');
  let C; try { C = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { C = {}; }
  C.outbox = C.outbox || []; C.tokens = C.tokens || {};
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) { /* ignore */ } };
  const f = window.fetch ? window.fetch.bind(window) : null;

  /* Phone + PIN become a hidden email and a long password. A 4-digit PIN is weak on its own, so
     the server's sign-in rate limit is what stops guessing; use a longer PIN for important accounts. */
  const emailOf = (phone) => '91' + String(phone).replace(/\D/g, '').slice(-10) + '@users.greencommons.app';
  async function passOf(phone, pin) {
    const enc = new TextEncoder();
    if (window.crypto && crypto.subtle) {
      const k = await crypto.subtle.importKey('raw', enc.encode(String(pin) + ':' + phone), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('greencommons-v1:' + phone), iterations: 100000 }, k, 256);
      return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return 'gc1-' + phone + '-' + pin + '-padding-for-length';
  }

  async function http(path, opts) {
    const res = await f(base + path, Object.assign({ headers: {} }, opts, {
      headers: Object.assign({ apikey: CFG.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, opts && opts.headers)
    }));
    let body = null; try { body = await res.json(); } catch (e) { /* empty body */ }
    return { ok: res.ok, status: res.status, body };
  }
  const nice = (b) => (b && (b.message || b.msg || b.error_description || b.error)) || 'Something went wrong.';

  function cur() { const u = GC.user(); return u ? C.tokens[u.phone] : null; }
  async function refresh(phone) {
    const t = C.tokens[phone]; if (!t || !t.refresh) return false;
    const r = await http('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: t.refresh }) });
    if (!r.ok) return false;
    C.tokens[phone] = { access: r.body.access_token, refresh: r.body.refresh_token, exp: Date.now() + (r.body.expires_in - 60) * 1000 }; persist(); return true;
  }
  async function token(phone) {
    const t = C.tokens[phone]; if (!t) return null;
    if (Date.now() > t.exp) { if (!(await refresh(phone))) return null; }
    return C.tokens[phone].access;
  }
  async function rpc(name, args, phone) {
    phone = phone || (GC.user() && GC.user().phone);
    const tk = await token(phone); if (!tk) return { ok: false, offline: true, error: 'Not signed in online.' };
    const r = await http('/rest/v1/rpc/' + name, { method: 'POST', body: JSON.stringify(args || {}), headers: { Authorization: 'Bearer ' + tk } });
    return { ok: r.ok, status: r.status, data: r.body, error: r.ok ? '' : nice(r.body) };
  }

  function setTokens(phone, b) { C.tokens[phone] = { access: b.access_token, refresh: b.refresh_token, exp: Date.now() + (b.expires_in - 60) * 1000 }; persist(); }

  async function register(phone, pin, profile) {
    const email = emailOf(phone), password = await passOf(phone, pin);
    let r = await http('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (!r.ok && /already/i.test(nice(r.body))) return signIn(phone, pin);
    if (!r.ok) return { ok: false, error: nice(r.body) };
    if (!r.body.access_token) return { ok: false, error: 'Online sign-up needs "Confirm email" switched off in Supabase (Authentication > Providers > Email).' };
    setTokens(phone, r.body);
    if (profile) await pushProfile(profile, phone);
    return { ok: true };
  }
  async function signIn(phone, pin) {
    const r = await http('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: emailOf(phone), password: await passOf(phone, pin) }) });
    if (!r.ok) return { ok: false, error: nice(r.body), status: r.status };
    setTokens(phone, r.body); return { ok: true };
  }
  function profileArgs(u) { return { p_name: u.name, p_locality: u.profile.locality || '', p_household: Math.floor(Number(u.profile.household) || 3), p_land: Number(u.profile.land) || 0 }; }
  function pushProfile(u, phone) { return rpc('save_profile', profileArgs(u), phone || u.phone); }

  /* ---------- outbox: queued changes, sent in order ---------- */
  function queue(op) { if (!enabled) return; C.outbox.push(Object.assign({ at: Date.now(), who: GC.user() && GC.user().phone }, op)); persist(); flush(); }
  let flushing = false;
  async function flush() {
    if (!enabled || flushing || !f) return; flushing = true;
    try {
      while (C.outbox.length) {
        const op = C.outbox[0];
        const r = op.kind === 'profile' ? await rpc('save_profile', op.args, op.who)
          : op.kind === 'log' ? await rpc('log_deed', op.args, op.who)
          : op.kind === 'del' ? await rpc('delete_deed', op.args, op.who) : { ok: true };
        if (r.offline || r.status === 0 || r.status >= 500 || (r.status === 401 && C.outbox.length)) { if (r.offline || r.status === 401) { break; } break; }
        C.outbox.shift(); persist();
        if (!r.ok && op.kind === 'log') GC.notices.push('The server did not accept one entry: ' + r.error);
      }
    } catch (e) { /* network down: try again later */ }
    flushing = false;
  }

  /* Sign in online, or create the online account the first time. Never blocks the app. */
  async function connect(phone, pin, u) {
    if (!enabled || !f) return { ok: false, offline: true };
    try {
      let r = await signIn(phone, pin);
      if (!r.ok && r.status !== 0 && r.status !== 429 && r.status < 500) r = await register(phone, pin, u);
      if (r.ok) { await pushProfile(u, phone); flush(); }
      return r;
    } catch (e) { return { ok: false, offline: true }; }
  }

  GC.cloud = {
    enabled, connect, register, signIn, flush, rpc,
    pending: () => C.outbox.length,
    signedIn: () => !!cur(),
    syncProfile: () => queue({ kind: 'profile', args: profileArgs(GC.user()) }),
    pushLog: (e) => queue({ kind: 'log', args: { p_deed: e.deedId, p_amount: e.amount, p_date: e.date } }),
    pushDelete: (l) => queue({ kind: 'del', args: { p_deed: l.deedId, p_date: l.date } }),
    joinGroup: (code, name) => rpc('join_group', { p_code: code, p_name: name || null }),
    leaveGroup: (code) => rpc('leave_group', { p_code: code }),
    board: (code) => rpc('group_board', { p_code: code }),
    score: () => rpc('my_score', {})
  };
  if (enabled) { window.addEventListener('online', flush); setTimeout(flush, 1500); }
})();
