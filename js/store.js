/* State, persistence, scoring rules, penalties and reports. Everything is stored on the device. */
(function () {
  const KEY = 'greencommons.v1';
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const today = () => ymd(new Date());
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 86400000);
  const weekStart = (s) => { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n, d) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: d == null ? 0 : d });

  let S;
  function blank() { return { v: 1, lang: null, onboarded: false, accounts: {}, session: null, groups: {}, locks: {} }; }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) return Object.assign(blank(), o); } } catch (e) { /* ignore */ }
    return blank();
  }
  S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }

  GC.util = { pad, ymd, parse, today, addDays, diffDays, weekStart, uid, clamp, esc, num };
  GC.state = () => S;
  GC.save = save;
  GC.resetAll = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } S = blank(); };
  GC.notices = [];          // short messages the UI shows as toasts
  GC.pendingLevelUp = null; // level name to celebrate in a sheet

  /* ---------- accounts ---------- */
  function hashPin(phone, pin) {
    let x = 2166136261, str = 'gc1:' + phone + ':' + pin;
    for (let r = 0; r < 2; r++) for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
    return (x >>> 0).toString(16);
  }
  GC.hashPin = hashPin;
  GC.user = () => (S.session && S.accounts[S.session]) || null;
  GC.findAccount = (phone) => S.accounts[phone] || null;
  GC.setLang = (code) => { S.lang = code; I18N.set(code); save(); };

  function newUser(d) {
    return {
      name: d.name, phone: d.phone, email: d.email, pinHash: hashPin(d.phone, d.pin), createdAt: Date.now(),
      profile: { age: '', state: '', district: '', pincode: '', locality: '', type: 'Household', household: 3, land: '', crop: '', irrigation: '' },
      logs: [], penalties: [], spent: 0, quizPoints: 0, redemptions: [], quizzes: {},
      challenges: { active: [], done: [] }, community: null,
      inbox: [], settings: { reminder: '20:00', anonymous: false, lock: false },
      devices: [], readings: { electricity: [], water: [] }, trips: [],
      badges: [], maxLevel: 0, lastReminder: ''
    };
  }

  GC.signup = (d) => {
    const u = newUser(d);
    S.accounts[d.phone] = u; S.session = d.phone;
    GC.addInbox('official', 'Welcome to GreenCommons', 'Your account is ready. You start with a Green Credit of ' + num(GC.START_SCORE) + ' points. Log your first action to begin.');
    GC.addInbox('official', 'About prototype rewards', 'Vouchers in this prototype are simulated and labelled "Prototype reward". No money or real discounts are involved yet.');
    save(); return u;
  };

  GC.lockInfo = (phone) => {
    const l = S.locks[phone];
    if (l && l.until && l.until > Date.now()) return { locked: true, until: l.until };
    return { locked: false };
  };
  GC.login = (phone, pin) => {
    const li = GC.lockInfo(phone);
    if (li.locked) return { ok: false, locked: true, until: li.until };
    const u = S.accounts[phone];
    if (!u) return { ok: false, error: 'No account found for this number.' };
    if (u.pinHash !== hashPin(phone, pin)) {
      const l = S.locks[phone] = S.locks[phone] || { fails: 0 };
      l.fails++;
      if (l.fails >= 5) { l.until = Date.now() + 5 * 60 * 1000; l.fails = 0; save(); return { ok: false, locked: true, until: l.until }; }
      save(); return { ok: false, error: 'That PIN is not right.', left: 5 - l.fails };
    }
    delete S.locks[phone]; S.session = phone; save();
    return { ok: true, user: u };
  };
  GC.logout = () => { S.session = null; save(); };
  GC.deleteAccount = () => { if (S.session) delete S.accounts[S.session]; S.session = null; save(); };
  GC.resetPin = (phone, pin) => { const u = S.accounts[phone]; if (u) { u.pinHash = hashPin(phone, pin); delete S.locks[phone]; save(); } };

  /* ---------- inbox ---------- */
  GC.addInbox = (type, title, body, u) => {
    u = u || GC.user(); if (!u) return;
    u.inbox.unshift({ id: uid(), ts: Date.now(), type, title, body, read: false });
    if (u.inbox.length > 200) u.inbox.length = 200;
  };
  GC.unread = () => { const u = GC.user(); return u ? u.inbox.filter((m) => !m.read).length : 0; };

  /* ---------- score ---------- */
  GC.levelOf = (score) => {
    const idx = score >= 5000 ? 2 : score >= 3000 ? 1 : 0;
    const L = GC.LEVELS[idx], next = GC.LEVELS[idx + 1] || null;
    const progress = next ? clamp((score - L.min) / (next.min - L.min), 0, 1) : 1;
    return { idx, name: L.name, next, progress };
  };

  GC.totals = (u, uptoDate) => {
    const byCat = { carbon: 0, water: 0, food: 0, farm: 0 };
    let good = 0, pen = 0;
    u.logs.forEach((l) => { if (!uptoDate || l.date <= uptoDate) { good += l.points; byCat[l.cat] += l.points; } });
    u.penalties.forEach((p) => { if (!uptoDate || p.date <= uptoDate) { pen += p.points; byCat.carbon -= p.points; } });
    const score = clamp(GC.START_SCORE + good - pen, 0, GC.MAX_SCORE);
    const wallet = good + u.quizPoints - u.spent;
    return { good, pen, score, byCat, wallet, earned: good + u.quizPoints, spent: u.spent };
  };

  GC.netBetween = (u, from, to, cat) => {
    let n = 0;
    u.logs.forEach((l) => { if (l.date >= from && l.date <= to && (!cat || l.cat === cat)) n += l.points; });
    u.penalties.forEach((p) => { if (p.date >= from && p.date <= to && (!cat || cat === 'carbon')) n -= p.points; });
    return n;
  };

  GC.deed = (id) => GC.DEEDS.find((d) => d.id === id);
  GC.cat = (id) => GC.CATS.find((c) => c.id === id);

  function dayCatPoints(u, date, cat) { return u.logs.filter((l) => l.date === date && l.cat === cat).reduce((a, l) => a + l.points, 0); }
  function dayPenalty(u, date) { return u.penalties.filter((p) => p.date === date).reduce((a, p) => a + p.points, 0); }

  /* Validate and save a deed. Returns {ok, points, error, confirm}. */
  GC.logDeed = (o) => {
    const u = GC.user(); if (!u) return { ok: false, error: 'Please log in.' };
    const deed = GC.deed(o.deedId); if (!deed) return { ok: false, error: 'Choose a deed.' };
    const amount = Number(o.amount);
    if (!isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount.' };
    if (amount < deed.min) return { ok: false, error: 'The minimum for this deed is ' + deed.min + ' ' + deed.unit + '.' };
    const date = o.date || today(), t0 = today();
    if (date > t0) return { ok: false, error: 'The date cannot be in the future.' };
    if (diffDays(t0, date) > 7) return { ok: false, error: 'You can log up to 7 days back.' };
    const skip = o.ignoreId;
    const others = u.logs.filter((l) => l.id !== skip);
    if (deed.once && others.some((l) => l.deedId === deed.id)) return { ok: false, error: 'This one-time deed has already been counted.' };
    const dup = others.find((l) => l.deedId === deed.id && l.date === date);
    let points = GC.DEED_LEVELS[deed.level].points, note = '';
    if (dup) {
      if (Date.now() - dup.ts < 5 * 60 * 1000) {
        if (!o.force) return { ok: false, confirm: true, error: 'You logged this a moment ago. Save anyway?' };
        points = 0; note = 'Counted once a day';
      } else return { ok: false, error: 'This deed already counted for that day. Try a different deed.' };
    }
    if (points > 0) {
      const used = others.filter((l) => l.date === date && l.cat === deed.cat).reduce((a, l) => a + l.points, 0);
      const room = GC.DAILY_CAT_CAP - used;
      if (room <= 0) return { ok: false, error: 'You have reached the daily limit of ' + GC.DAILY_CAT_CAP + ' points for ' + GC.cat(deed.cat).name + '.' };
      if (points > room) { points = room; note = 'Daily limit reached'; }
    }
    const entry = { id: uid(), ts: Date.now(), date, cat: deed.cat, deedId: deed.id, amount, points, note: (o.note || '').slice(0, 200), photo: o.photo || '', flag: note };
    u.logs.push(entry);
    afterChange(u);
    save();
    return { ok: true, points, entry, flag: note };
  };

  GC.deleteLog = (id) => { const u = GC.user(); if (!u) return; u.logs = u.logs.filter((l) => l.id !== id); recomputeBadges(u, true); save(); };

  GC.editLog = (id, amount, note) => {
    const u = GC.user(); const l = u.logs.find((x) => x.id === id); if (!l) return { ok: false, error: 'Entry not found.' };
    const deed = GC.deed(l.deedId); const a = Number(amount);
    if (!isFinite(a) || a < deed.min) return { ok: false, error: 'The minimum for this deed is ' + deed.min + ' ' + deed.unit + '.' };
    l.amount = a; l.note = (note || '').slice(0, 200); save(); return { ok: true };
  };

  function pushPenalty(u, date, points, reason, kind, ref) {
    if (u.penalties.some((p) => p.ref === ref)) return { applied: false };
    const room = GC.DAILY_PENALTY_CAP - dayPenalty(u, date);
    const pts = Math.min(points, room);
    if (pts <= 0) return { applied: false, capped: true };
    u.penalties.push({ id: uid(), ts: Date.now(), date, points: pts, reason, kind, ref });
    GC.addInbox('alert', 'Score change: -' + pts, reason, u);
    return { applied: true, points: pts };
  }

  function average(arr) { return arr.reduce((a, b) => a + b, 0) / (arr.length || 1); }

  /* Weekly electricity reading (typed in or sent by a sensor). Penalises only after the learning period. */
  GC.addElectricity = (kwh, src) => {
    const u = GC.user(); const value = Number(kwh);
    if (!isFinite(value) || value <= 0) return { ok: false, error: 'Enter the kWh used this week.' };
    const week = weekStart(today());
    const list = u.readings.electricity;
    let r = list.find((x) => x.week === week);
    if (r) { r.value = value; r.ts = Date.now(); r.src = src || 'typed'; } else { r = { week, value, ts: Date.now(), src: src || 'typed' }; list.push(r); }
    list.sort((a, b) => (a.week < b.week ? -1 : 1));
    const prior = list.filter((x) => x.week < week).slice(-8);
    if (prior.length < GC.BASELINE_WEEKS) { save(); return { ok: true, status: 'learning', have: prior.length, need: GC.BASELINE_WEEKS }; }
    const avg = average(prior.map((x) => x.value));
    const pct = Math.round((value / avg - 1) * 100);
    if (value > avg * 1.2) {
      const res = pushPenalty(u, today(), 10, 'Electricity was ' + pct + '% above your average this week: -10', 'electricity', 'elec-' + week);
      afterChange(u); save();
      return { ok: true, status: res.applied ? 'penalty' : 'noted', pct, avg, co2: value * GC.GRID_KG_PER_KWH };
    }
    save();
    return { ok: true, status: 'normal', pct, avg, co2: value * GC.GRID_KG_PER_KWH };
  };

  /* Weekly water meter reading. Water has no penalty; unusual use raises a leak alert. */
  GC.addWater = (litres, src) => {
    const u = GC.user(); const value = Number(litres);
    if (!isFinite(value) || value <= 0) return { ok: false, error: 'Enter the litres used this week.' };
    const week = weekStart(today());
    const list = u.readings.water;
    let r = list.find((x) => x.week === week);
    if (r) { r.value = value; r.ts = Date.now(); r.src = src || 'typed'; } else { r = { week, value, ts: Date.now(), src: src || 'typed' }; list.push(r); }
    list.sort((a, b) => (a.week < b.week ? -1 : 1));
    const prior = list.filter((x) => x.week < week).slice(-8);
    if (prior.length < GC.BASELINE_WEEKS) { save(); return { ok: true, status: 'learning', have: prior.length, need: GC.BASELINE_WEEKS }; }
    const avg = average(prior.map((x) => x.value));
    const pct = Math.round((value / avg - 1) * 100);
    if (value > avg * 1.2) {
      if (!u.inbox.some((m) => m.ref === 'water-' + week)) {
        GC.addInbox('alert', 'Water use is high', 'Water use was ' + pct + '% above your average this week. Check taps and pipes for leaks.', u);
        u.inbox[0].ref = 'water-' + week;
      }
      save(); return { ok: true, status: 'high', pct, avg };
    }
    save(); return { ok: true, status: 'normal', pct, avg };
  };

  /* A confirmed trip. A solo car trip over 25 km or under 2 km takes off 10 points. */
  GC.recordTrip = (km, mode) => {
    const u = GC.user(); const k = Number(km);
    if (!isFinite(k) || k <= 0) return { ok: false, error: 'Enter the distance in km.' };
    const trip = { id: uid(), ts: Date.now(), date: today(), km: k, mode };
    u.trips.push(trip);
    let result = { ok: true, status: 'noted' };
    if (mode === 'car-solo' && (k > 25 || k < 2)) {
      const why = k > 25 ? 'A solo car trip of ' + k.toFixed(1) + ' km is over 25 km: -10' : 'A solo car trip of ' + k.toFixed(1) + ' km is under 2 km: -10';
      const res = pushPenalty(u, trip.date, 10, why, 'travel', 'trip-' + trip.id);
      if (res.applied) { result = { ok: true, status: 'penalty', reason: why }; afterChange(u); }
    }
    save(); return result;
  };

  /* Sensor value arriving from a connected device. */
  GC.deviceReading = (deviceId, value) => {
    const u = GC.user(); const d = u.devices.find((x) => x.id === deviceId); if (!d) return null;
    const v = Number(value); d.readings.push({ ts: Date.now(), value: v }); if (d.readings.length > 120) d.readings.shift();
    d.last = Date.now(); d.status = 'Connected';
    const type = GC.DEVICE_TYPES.find((t) => t.id === d.type);
    let res = null;
    if (type && type.feeds === 'electricity') res = GC.addElectricity(v, 'sensor');
    else if (type && type.feeds === 'water') res = GC.addWater(v, 'sensor');
    else if (d.type === 'tank' && v < 15) GC.addInbox('alert', 'Tank level is low', d.name + ' is at ' + Math.round(v) + '%.', u);
    else if (d.type === 'soil' && v < 25) GC.addInbox('alert', 'Soil is dry', d.name + ' reads ' + Math.round(v) + '% moisture.', u);
    save(); return res;
  };

  /* ---------- after any score change ---------- */
  function afterChange(u) {
    const t = GC.totals(u);
    const lv = GC.levelOf(t.score);
    if (lv.idx > (u.maxLevel || 0)) {
      u.maxLevel = lv.idx;
      GC.pendingLevelUp = lv.name;
      GC.addInbox('official', 'You reached the ' + lv.name + ' level', 'Your Green Credit is now ' + num(t.score) + '. A copy of this message can be emailed to you.', u);
    }
    recomputeBadges(u, false);
    checkChallenges(u);
  }

  function recomputeBadges(u, silent) {
    const t = GC.totals(u);
    const have = new Set(u.badges);
    const ok = {
      first: u.logs.length > 0,
      streak7: GC.streak(u).best >= 7,
      water: t.byCat.water >= 300,
      food: u.logs.some((l) => l.deedId === 'f4'),
      carbon: t.byCat.carbon >= 300,
      farm: t.byCat.farm >= 300,
      green: (u.maxLevel || 0) >= 1,
      champion: (u.maxLevel || 0) >= 2
    };
    Object.keys(ok).forEach((k) => {
      if (ok[k] && !have.has(k)) {
        u.badges.push(k);
        if (!silent) { const b = GC.BADGES.find((x) => x.id === k); GC.notices.push('New badge: ' + b.name); }
      }
    });
  }
  GC.recompute = () => { const u = GC.user(); if (u) { recomputeBadges(u, true); save(); } };

  GC.streak = (u) => {
    const dates = Array.from(new Set(u.logs.filter((l) => l.points > 0 || true).map((l) => l.date))).sort();
    let best = 0, run = 0, prev = null;
    dates.forEach((d) => { run = prev && diffDays(d, prev) === 1 ? run + 1 : 1; if (run > best) best = run; prev = d; });
    const t = today();
    let cur = 0;
    if (dates.length) {
      let d = dates.includes(t) ? t : (dates.includes(addDays(t, -1)) ? addDays(t, -1) : null);
      while (d && dates.includes(d)) { cur++; d = addDays(d, -1); }
    }
    return { current: cur, best };
  };

  /* ---------- impact ---------- */
  GC.impact = (u, from, to) => {
    const r = { co2: 0, water: 0, food: 0, irr: 0, acres: 0 };
    u.logs.forEach((l) => {
      if (l.date < from || l.date > to || l.points === 0) return;
      const d = GC.deed(l.deedId); if (!d) return;
      r.co2 += (d.co2 || 0) * l.amount; r.water += (d.water || 0) * l.amount; r.food += (d.food || 0) * l.amount;
      r.irr += (d.irr || 0) * l.amount;
      if (d.acres) r.acres += d.acres * l.amount;
    });
    return r;
  };

  GC.range = (period) => {
    const t = today();
    if (period === 'week') return { from: addDays(t, -6), to: t, days: 7 };
    if (period === 'month') return { from: addDays(t, -29), to: t, days: 30 };
    const first = GC.user() && GC.user().logs.length ? GC.user().logs.map((l) => l.date).sort()[0] : t;
    return { from: first, to: t, days: Math.max(1, diffDays(t, first) + 1) };
  };

  GC.dailySeries = (u, from, to) => {
    const out = []; const n = diffDays(to, from);
    for (let i = 0; i <= n; i++) {
      const date = addDays(from, i); const row = { date, carbon: 0, water: 0, food: 0, farm: 0 };
      u.logs.forEach((l) => { if (l.date === date) row[l.cat] += l.points; });
      u.penalties.forEach((p) => { if (p.date === date) row.carbon -= p.points; });
      out.push(row);
    }
    return out;
  };

  GC.scoreHistory = (u, weeks) => {
    const out = []; const t = today();
    for (let i = weeks - 1; i >= 0; i--) {
      const end = addDays(t, -7 * i);
      out.push({ date: end, score: GC.totals(u, end).score });
    }
    return out;
  };

  GC.recentChanges = (u, n) => {
    const rows = [];
    u.logs.forEach((l) => { const d = GC.deed(l.deedId); rows.push({ ts: l.ts, date: l.date, text: d ? d.name : 'Deed', pts: l.points }); });
    u.penalties.forEach((p) => rows.push({ ts: p.ts, date: p.date, text: p.reason.replace(/: -\d+$/, ''), pts: -p.points }));
    rows.sort((a, b) => b.ts - a.ts);
    return rows.slice(0, n);
  };

  GC.todayGoal = (u) => {
    const lastLog = u.logs.length ? u.logs.map((l) => l.date).sort().pop() : null;
    if (lastLog && diffDays(today(), lastLog) >= 7) return { text: 'Welcome back. Log one action to restart.', cat: null };
    const day = Math.floor(Date.now() / 86400000);
    const cat = GC.CATS[day % 4].id;
    return { text: GC.GOALS[cat], cat };
  };
  GC.tipOfDay = () => GC.TIPS[Math.floor(Date.now() / 86400000) % GC.TIPS.length];

  GC.weeklyGain = (u) => GC.netBetween(u, addDays(today(), -6), today());

  GC.ensureReminder = (u) => {
    const t = today();
    if (u.lastReminder === t) return;
    const hasLogToday = u.logs.some((l) => l.date === t);
    const now = new Date(); const hhmm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (!hasLogToday && hhmm >= (u.settings.reminder || '20:00')) {
      u.lastReminder = t;
      GC.addInbox('reminder', 'Log today\'s actions', 'You have not logged anything today. A quick log keeps your streak going.', u);
      save();
    }
  };

  /* ---------- rewards ---------- */
  GC.redemptionsLastWeek = (u) => u.redemptions.filter((r) => Date.now() - r.ts < 7 * 86400000).length;
  GC.redeem = (voucherId) => {
    const u = GC.user(); const v = GC.VOUCHERS.find((x) => x.id === voucherId); if (!v) return { ok: false, error: 'Voucher not found.' };
    const t = GC.totals(u); const lv = GC.levelOf(t.score);
    const need = GC.LEVELS.findIndex((l) => l.name === v.level);
    if (lv.idx < need) return { ok: false, error: 'Reach the ' + v.level + ' level to unlock this.' };
    if (t.wallet < v.cost) return { ok: false, error: 'You need ' + num(v.cost - t.wallet) + ' more wallet points.' };
    if (GC.redemptionsLastWeek(u) >= 2) return { ok: false, error: 'You can redeem two vouchers a week. Try again later.' };
    const code = 'GC-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const rec = { id: uid(), ts: Date.now(), voucherId: v.id, name: v.name, cost: v.cost, code, expires: Date.now() + 30 * 86400000 };
    u.redemptions.unshift(rec); u.spent += v.cost;
    GC.addInbox('official', 'Voucher issued: ' + v.name, 'Prototype reward code ' + code + '. Valid for 30 days.', u);
    save(); return { ok: true, rec };
  };

  GC.submitQuiz = (articleId) => {
    const u = GC.user(); const first = u.quizzes[articleId] === undefined;
    u.quizzes[articleId] = Date.now();
    if (first) u.quizPoints += 15;
    save(); return { first };
  };

  /* ---------- challenges ---------- */
  GC.allChallenges = () => {
    const list = GC.CHALLENGES.slice();
    const u = GC.user();
    if (u && u.community) { const g = groupOf(u); if (g) g.challenges.forEach((c) => list.push(c)); }
    return list;
  };
  GC.challengeProgress = (u, ch, joinedAt) => {
    const since = joinedAt || today();
    const logs = u.logs.filter((l) => l.date >= since && l.points > 0 && (!ch.cat || l.cat === ch.cat) && (!ch.deeds || ch.deeds.includes(l.deedId)));
    if (ch.type === 'sum') return Math.min(ch.target, logs.reduce((a, l) => a + l.amount, 0));
    if (ch.type === 'sunday') return Math.min(ch.target, logs.filter((l) => parse(l.date).getDay() === 0).length ? 1 : 0);
    return Math.min(ch.target, new Set(logs.map((l) => l.date)).size);
  };
  GC.joinChallenge = (id) => {
    const u = GC.user();
    if (u.challenges.active.length >= GC.MAX_ACTIVE_CHALLENGES) return { ok: false, error: 'You can have three challenges at a time.' };
    if (u.challenges.active.some((c) => c.id === id) || u.challenges.done.some((c) => c.id === id)) return { ok: false, error: 'Already joined.' };
    u.challenges.active.push({ id, joinedAt: today() }); save(); return { ok: true };
  };
  GC.leaveChallenge = (id) => { const u = GC.user(); u.challenges.active = u.challenges.active.filter((c) => c.id !== id); save(); };
  function checkChallenges(u) {
    const all = GC.allChallenges();
    u.challenges.active.slice().forEach((a) => {
      const ch = all.find((c) => c.id === a.id); if (!ch) return;
      if (GC.challengeProgress(u, ch, a.joinedAt) >= ch.target) {
        u.challenges.active = u.challenges.active.filter((x) => x.id !== a.id);
        u.challenges.done.push({ id: a.id, doneAt: Date.now() });
        GC.addInbox('official', 'Challenge completed', 'You finished "' + ch.title + '". Well done.', u);
        GC.notices.push('Challenge completed: ' + ch.title);
      }
    });
  }

  /* ---------- community ---------- */
  const DEMO_MEMBERS = ['Aarav', 'Diya', 'Ishaan', 'Kavya', 'Nikhil', 'Riya', 'Sahil', 'Tara'];
  function groupOf(u) {
    if (!u.community) return null;
    const def = GC.COMMUNITY_CODES[u.community.code]; if (!def) return null;
    const key = def.shared || u.community.code;
    if (!S.groups[key]) {
      S.groups[key] = {
        name: def.name, kind: def.kind, goal: 4000,
        announcements: [{ id: uid(), ts: Date.now() - 86400000 * 2, by: 'Admin', text: 'Welcome to ' + def.name + '. Log your actions every day and help us reach our group goal.' }],
        notices: [
          { id: uid(), ts: Date.now() - 86400000, type: 'Event', by: 'Admin', text: 'Tree planting this Saturday morning. Bring a bucket.' },
          { id: uid(), ts: Date.now() - 3600000 * 5, type: 'Offer', by: 'Neighbour', text: 'Spare compost bin available for anyone who needs one.' },
          { id: uid(), ts: Date.now() - 3600000 * 3, type: 'Need', by: 'Neighbour', text: 'Looking for a lift to the market on Sundays.' }
        ],
        challenges: [],
        members: DEMO_MEMBERS.map((n, i) => ({ name: n, week: 80 + ((i * 37) % 160), month: 300 + ((i * 91) % 600) }))
      };
      save();
    }
    return S.groups[key];
  }
  GC.group = (u) => groupOf(u);
  GC.joinCommunity = (code) => {
    const u = GC.user(); const c = String(code || '').trim().toUpperCase();
    const def = GC.COMMUNITY_CODES[c];
    if (!def) return { ok: false, error: 'That code was not found. Try GREEN-SCH, WARD-12 or KISAN-1 in this prototype.' };
    u.community = { code: c, role: def.role }; groupOf(u); save(); return { ok: true, def };
  };
  GC.leaveCommunity = () => { const u = GC.user(); u.community = null; save(); };

  /* ---------- leaderboard ---------- */
  GC.displayName = (u) => {
    if (u.settings.anonymous) return 'Green member';
    const p = u.name.trim().split(/\s+/); const last = p.length > 1 ? ' ' + p[p.length - 1][0].toUpperCase() + '.' : '';
    return p[0] + last;
  };
  GC.leaderboard = (kind, period, cat) => {
    const u = GC.user(); const t = today();
    const from = period === 'week' ? addDays(t, -6) : addDays(t, -29);
    const mine = GC.netBetween(u, from, t, cat === 'all' ? null : cat);
    if (kind === 'groups') {
      const rows = GC.DEMO_GROUPS.map((g) => {
        let pts = period === 'week' ? g.w : g.m;
        if (u.community && GC.COMMUNITY_CODES[u.community.code] && GC.COMMUNITY_CODES[u.community.code].name === g.name) pts += mine;
        const scale = cat === 'all' ? 1 : 0.25;
        return { name: g.name, sub: g.members + ' members', value: Math.round((pts * scale) / g.members), me: !!(u.community && GC.COMMUNITY_CODES[u.community.code] && GC.COMMUNITY_CODES[u.community.code].name === g.name) };
      });
      return rows.sort((a, b) => b.value - a.value);
    }
    const rows = GC.DEMO_PEOPLE.map((p) => {
      const src = period === 'week' ? p.w : p.m;
      const v = cat === 'all' ? Object.values(src).reduce((a, b) => a + b, 0) : src[cat];
      return { name: p.name, sub: p.place, value: v, me: false };
    }).filter((r) => r.value > 0);
    rows.push({ name: GC.displayName(u), sub: u.profile.locality || 'You', value: Math.max(0, mine), me: true });
    return rows.sort((a, b) => b.value - a.value);
  };

  /* ---------- reports ---------- */
  GC.reportData = (u, period) => {
    const t = today();
    const from = period === 'week' ? addDays(t, -6) : period === 'quarter' ? addDays(t, -89) : addDays(t, -29);
    const tot = GC.totals(u);
    const cats = GC.CATS.map((c) => ({ cat: c, pts: GC.netBetween(u, from, t, c.id), n: u.logs.filter((l) => l.date >= from && l.date <= t && l.cat === c.id).length }));
    const byDeed = {};
    u.logs.filter((l) => l.date >= from && l.date <= t).forEach((l) => { byDeed[l.deedId] = (byDeed[l.deedId] || 0) + l.points; });
    const top = Object.keys(byDeed).map((id) => ({ name: GC.deed(id).name, pts: byDeed[id] })).sort((a, b) => b.pts - a.pts).slice(0, 5);
    return { from, to: t, tot, level: GC.levelOf(tot.score), cats, top, impact: GC.impact(u, from, t), badges: u.badges.map((id) => GC.BADGES.find((b) => b.id === id).name), series: GC.dailySeries(u, from, t) };
  };
  GC.reportText = (u, period) => {
    const r = GC.reportData(u, period);
    const lines = ['GreenCommons report', u.name + ' (' + r.from + ' to ' + r.to + ')', '',
      'Green Credit: ' + num(r.tot.score) + ' (' + r.level.name + ')', 'Reward Wallet: ' + num(r.tot.wallet), '', 'Net points by category:'];
    r.cats.forEach((c) => lines.push('- ' + c.cat.name + ': ' + num(c.pts)));
    lines.push('', 'Impact in this period:', '- CO2 avoided: ' + num(r.impact.co2, 1) + ' kg', '- Water saved: ' + num(r.impact.water) + ' L', '- Food saved: ' + num(r.impact.food, 1) + ' kg');
    if (r.impact.irr) lines.push('- Irrigation saved: ' + num(r.impact.irr) + ' L');
    if (r.top.length) { lines.push('', 'Top actions:'); r.top.forEach((x) => lines.push('- ' + x.name + ': ' + x.pts + ' points')); }
    if (r.badges.length) lines.push('', 'Badges: ' + r.badges.join(', '));
    lines.push('', 'This is a habit score, not a financial credit score.');
    return lines.join('\n');
  };

  /* ---------- demo tools ---------- */
  GC.seedDemo = () => {
    const u = GC.user(); const t = today();
    const plan = [['c2', 8], ['w1', 40], ['f1', 2], ['c1', 2], ['w3', 30], ['f2', 1], ['c4', 3], ['w5', 4], ['f5', 1], ['c3', 6], ['w6', 1], ['f3', 1]];
    let i = 0;
    for (let d = 20; d >= 0; d--) {
      const date = addDays(t, -d);
      for (let k = 0; k < 2 + (d % 3); k++) {
        const [id, amt] = plan[(i++) % plan.length];
        const deed = GC.deed(id);
        if (u.logs.some((l) => l.deedId === id && l.date === date)) continue;
        const pts = GC.DEED_LEVELS[deed.level].points;
        u.logs.push({ id: uid(), ts: Date.now() - d * 86400000 - k * 600000, date, cat: deed.cat, deedId: id, amount: Math.max(amt, deed.min), points: pts, note: '', photo: '', flag: '' });
      }
    }
    for (let w = 5; w >= 1; w--) {
      const week = weekStart(addDays(t, -7 * w));
      if (!u.readings.electricity.some((r) => r.week === week)) u.readings.electricity.push({ week, value: 28 + (w % 3) * 2, ts: Date.now(), src: 'demo' });
      if (!u.readings.water.some((r) => r.week === week)) u.readings.water.push({ week, value: 900 + (w % 3) * 40, ts: Date.now(), src: 'demo' });
    }
    u.readings.electricity.sort((a, b) => (a.week < b.week ? -1 : 1)); u.readings.water.sort((a, b) => (a.week < b.week ? -1 : 1));
    afterChange(u); save();
  };

  /* ---------- device demo ---------- */
  GC.addDevice = (o) => {
    const u = GC.user(); const type = GC.DEVICE_TYPES.find((x) => x.id === o.type);
    const d = { id: uid(), type: o.type, name: o.name || type.name, conn: o.conn, code: o.code, status: o.status || 'Connected', readings: [], last: Date.now() };
    u.devices.push(d); save(); return d;
  };
  GC.removeDevice = (id) => { const u = GC.user(); u.devices = u.devices.filter((d) => d.id !== id); save(); };
})();
