/* Screens 9 to 16: Home, Log (and Quick Log sheet), Carbon, Water, Food, Farm, Impact, Green Credit. */
(function () {
  const { esc, num, today, addDays, parse } = GC.util;
  const ic = GC.icon;
  const $ = (s, r) => (r || document).querySelector(s);
  const first = (u) => (u.name || '').trim().split(/\s+/)[0];

  /* ====================== 9. HOME ====================== */
  GC.screens.home = () => {
    const u = GC.user(); GC.ensureReminder(u);
    const tot = GC.totals(u), lv = GC.levelOf(tot.score), gain = GC.weeklyGain(u);
    const t0 = today();
    const tiles = GC.CATS.map((c) => {
      const loggedToday = u.logs.some((l) => l.date === t0 && l.cat === c.id);
      const hasAny = u.logs.some((l) => l.cat === c.id);
      return '<button class="tile" data-go="/cat/' + c.id + '"><span class="ic" style="color:var(--green)">' + ic(c.icon, 28) + '</span><span class="name">' + t(c.name) + '</span><span class="pts">' + (hasAny || tot.byCat[c.id] ? (tot.byCat[c.id] >= 0 ? '' : '&minus;') + num(Math.abs(tot.byCat[c.id])) : '0') + '</span><span class="status">' + (hasAny ? (loggedToday ? t('Logged today') : t('Not logged yet')) : t('Start logging')) + '</span></button>';
    }).join('');
    const goal = GC.todayGoal(u);
    const act = u.challenges.active[0];
    let chal = '';
    if (act) {
      const ch = GC.allChallenges().find((c) => c.id === act.id);
      if (ch) { const p = GC.challengeProgress(u, ch, act.joinedAt); chal = '<button class="card line tap" data-go="/challenges"><div class="row between"><span class="semi">' + esc(ch.title) + '</span><span class="small mid">' + p + ' of ' + ch.target + '</span></div><div class="mt">' + GC.ui.bar(p / ch.target) + '</div></button>'; }
    }
    let snap;
    if (u.community) { const g = GC.group(u); const pts = g.members.reduce((a, m) => a + m.month, 0) + Math.max(0, GC.netBetween(u, addDays(t0, -29), t0)); snap = '<button class="card tap" data-go="/community"><div class="small mid">' + esc(g.name) + '</div><div class="semi">' + num(pts) + ' of ' + num(g.goal) + ' group points this month</div><div class="mt">' + GC.ui.bar(pts / g.goal) + '</div></button>'; }
    else snap = '<button class="card tap" data-go="/community"><span class="semi">Join a community</span><div class="small mid">Use a school, ward or farm group code to share goals.</div></button>';
    return {
      title: 'Home', tab: 'home',
      html: '<div class="stack"><div><h2 class="heading">' + t('Hello') + ', ' + esc(first(u)) + '</h2></div>' +
        '<div class="card pale score-card" data-go="/credit" role="link" tabindex="0"><div class="row between"><span class="small mid">' + t('Green Credit') + '</span><button class="icon-btn" style="width:36px;height:36px" data-act="score-help" aria-label="How is it calculated?">' + ic('help', 22) + '</button></div>' +
        '<div class="score-num">' + num(tot.score) + '</div><div class="row between mt"><span class="semi">' + t(lv.name) + '</span><span class="small mid">' + (lv.next ? t('Next') + ': ' + t(lv.next.name) + ' · ' + num(lv.next.min) : 'Top level') + '</span></div><div class="mt">' + GC.ui.bar(lv.progress) + '</div><p class="small mt">' + (gain >= 0 ? '+' : '&minus;') + num(Math.abs(gain)) + ' this week</p></div>' +
        '<div class="grid2">' + tiles + '</div>' +
        '<button class="btn block" data-act="open-log">' + t('Log an action') + '</button>' +
        '<div class="card"><div class="small mid">' + t("Today's goal") + '</div><p class="semi">' + esc(goal.text) + '</p>' + (goal.cat ? '<button class="btn small outline mt" data-act="open-log" data-cat="' + goal.cat + '">Log it</button>' : '') + '</div>' +
        chal +
        '<div class="card"><div class="small mid">' + t('Tip of the day') + '</div><p>' + esc(GC.tipOfDay()) + '</p></div>' + snap +
        '<div class="chips"><button class="chip" data-go="/leaderboard">' + ic('trophy', 18) + t('Leaderboard') + '</button><button class="chip" data-go="/challenges">' + ic('flag', 18) + t('Challenges') + '</button><button class="chip" data-go="/learn">' + ic('book', 18) + t('Learn') + '</button><button class="chip" data-go="/devices">' + ic('chip', 18) + t('Devices') + '</button></div>' +
        (GC.installEvent ? '<button class="btn outline block" data-act="install-app">Install GreenAura on this phone</button>' : '') + '</div>'
    };
  };
  GC.act['score-help'] = (el, e) => { e.stopPropagation(); explainScore(); };
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=link][data-go]')) { e.preventDefault(); GC.go(e.target.dataset.go); } });
  function explainScore() {
    GC.sheet.open({
      title: 'How is it calculated?',
      html: '<div class="stack"><p>Your Green Credit = <b>2,000</b> + points from good deeds &minus; carbon penalties.</p><p class="mid">It never goes below 0 or above 7,000, and points do not expire.</p>' +
        '<p class="mid small">Bigger, longer-lasting deeds earn more than small everyday ones. You see the points after you save a deed.</p>' +
        '<p class="mid small">Each deed counts once a day, and each category earns at most ' + GC.DAILY_CAT_CAP + ' points a day. Only Carbon has penalties, and they come from measured numbers such as your electricity meter or a confirmed car trip. They take off at most ' + GC.DAILY_PENALTY_CAP + ' points a day.</p>' +
        '<p class="small"><b>This is a habit score, not a financial credit score.</b> It is never shared with banks.</p></div><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>'
    });
  }
  GC.act['explain-score'] = explainScore;

  /* ====================== QUICK LOG SHEET ====================== */
  const QL = { cat: 'carbon', deedId: '', amount: '', date: '', note: '', photo: '', saved: false };
  function qlRead() {
    const a = $('#ql-amount'), d = $('#ql-date'), n = $('#ql-note');
    if (a) QL.amount = a.value; if (d) QL.date = d.value; if (n) QL.note = n.value;
  }
  function room(u, cat, date) { return GC.DAILY_CAT_CAP - u.logs.filter((l) => l.date === date && l.cat === cat).reduce((a, l) => a + l.points, 0); }
  function qlPreview() {
    const u = GC.user(); const deed = GC.deed(QL.deedId);
    if (!deed) return { text: 'Choose what you did, then enter the amount.', warn: false };
    const date = QL.date || today();
    if (deed.once && u.logs.some((l) => l.deedId === deed.id)) return { text: 'This one-time deed has already been counted. It can only be done once.', warn: true };
    if (u.logs.some((l) => l.deedId === deed.id && l.date === date)) return { text: 'You already logged this deed for that day. Edit the entry instead.', warn: true };
    if (room(u, deed.cat, date) <= 0) return { text: 'You have reached the daily limit for ' + GC.cat(deed.cat).name + '.', warn: true };
    const mx = GC.deedMax(deed, u);
    if (deed.unit === 'acres' && !mx) return { text: 'Add your land size under My farm first (Farm page, Edit).', warn: true };
    return { text: 'Enter only what you really did. The most for one day is ' + num(mx, 1) + ' ' + deed.unit + '.', warn: false };
  }
  function qlHtml() {
    const deeds = GC.DEEDS.filter((d) => d.cat === QL.cat);
    const deed = GC.deed(QL.deedId);
    const pv = qlPreview();
    return '<div class="stack"><div class="chips">' + GC.CATS.map((c) => '<button class="chip' + (c.id === QL.cat ? ' sel' : '') + '" data-act="ql-cat" data-v="' + c.id + '">' + ic(c.icon, 18) + t(c.name) + '</button>').join('') + '</div>' +
      '<div><div class="small mid" style="margin-bottom:6px">' + t('Deed') + '</div><div class="list" style="max-height:200px;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:0 10px">' +
      deeds.map((d) => '<button class="item" style="min-height:48px" data-act="ql-deed" data-v="' + d.id + '" aria-pressed="' + (d.id === QL.deedId) + '"><span class="grow' + (d.id === QL.deedId ? ' semi' : '') + '">' + esc(d.name) + '</span>' + (d.once ? '<span class="tag grey">one-time</span>' : '') + (d.id === QL.deedId ? ic('check', 20) : '') + '</button>').join('') + '</div></div>' +
      '<label class="field"><span class="lbl">' + t('Amount') + (deed ? ' (' + esc(deed.unit) + ', minimum ' + deed.min + ')' : '') + '</span><input class="input" id="ql-amount" type="number" inputmode="' + (deed && deed.int ? 'numeric' : 'decimal') + '" min="' + (deed ? deed.min : 0) + '"' + (deed ? ' max="' + GC.deedMax(deed) + '"' : '') + ' step="' + (deed && deed.int ? 1 : 'any') + '" value="' + esc(QL.amount) + '"' + (deed ? '' : ' disabled') + '></label>' +
      '<label class="field"><span class="lbl">' + t('Date') + '</span><input class="input" id="ql-date" type="date" min="' + addDays(today(), -7) + '" max="' + today() + '" value="' + esc(QL.date || today()) + '" data-chg="ql-refresh"></label>' +
      '<div class="card pale" id="ql-preview" aria-live="polite"><span class="semi">' + (pv.warn ? ic('warn', 18) + ' ' : '') + esc(pv.text) + '</span></div>' +
      '<label class="field"><span class="lbl">' + t('Note') + ' (optional)</span><textarea class="input" id="ql-note" maxlength="200">' + esc(QL.note) + '</textarea></label>' +
      '<div class="row"><label class="btn outline small" style="cursor:pointer">' + ic('camera', 18) + ' Photo<input type="file" accept="image/*" capture="environment" data-chg="ql-photo" hidden></label>' + (QL.photo ? '<img src="' + QL.photo + '" alt="Attached photo" style="height:40px;border-radius:8px"><button class="btn text small" data-act="ql-nophoto">Remove</button>' : '') + '</div>' +
      '<div id="ql-err"></div><button class="btn block" data-act="ql-save">' + t('Save') + '</button></div>';
  }
  GC.openQuickLog = (o) => {
    o = o || {};
    Object.assign(QL, { cat: o.cat || QL.cat || 'carbon', deedId: o.deedId || '', amount: '', date: today(), note: '', photo: '', saved: false });
    GC.sheet.open({ title: 'Quick log', html: qlHtml(), tall: true, onClose: () => { if (QL.saved) { QL.saved = false; GC.render(); } else GC.afterAction(); } });
  };
  GC.act['open-log'] = (el) => GC.openQuickLog({ cat: el.dataset.cat, deedId: el.dataset.deed });
  GC.act['ql-cat'] = (el) => { qlRead(); QL.cat = el.dataset.v; QL.deedId = ''; GC.sheet.set(qlHtml()); };
  GC.act['ql-deed'] = (el) => { qlRead(); QL.deedId = el.dataset.v; GC.sheet.set(qlHtml()); const a = $('#ql-amount'); if (a) a.focus(); };
  GC.act['ql-nophoto'] = () => { qlRead(); QL.photo = ''; GC.sheet.set(qlHtml()); };
  GC.inp['ql-refresh'] = () => { qlRead(); const pv = qlPreview(); $('#ql-preview').innerHTML = '<span class="semi">' + (pv.warn ? ic('warn', 18) + ' ' : '') + esc(pv.text) + '</span>'; };
  GC.inp['ql-photo'] = (el) => { qlRead(); GC.readPhoto(el.files[0], (d) => { QL.photo = d; GC.sheet.set(qlHtml()); }); };
  function qlSave(force) {
    qlRead(); const err = $('#ql-err');
    const res = GC.logDeed({ deedId: QL.deedId, amount: QL.amount, date: QL.date, note: QL.note, photo: QL.photo, force });
    if (res.confirm) { GC.confirmSheet({ title: 'Save anyway?', body: res.error, confirm: 'Save anyway', onConfirm: () => { GC.sheet.open({ title: 'Quick log', html: qlHtml(), tall: true, onClose: () => { if (QL.saved) { QL.saved = false; GC.render(); } } }); qlSave(true); } }); return; }
    if (!res.ok) { err.innerHTML = '<div class="err">' + ic('warn') + '<p>' + esc(res.error) + '</p></div>'; return; }
    QL.saved = true;
    const deed = GC.deed(QL.deedId);
    GC.sheet.set('<div class="center stack"><div style="margin:0 auto;width:56px;height:56px;border-radius:50%;background:var(--pale);color:var(--green);display:flex;align-items:center;justify-content:center">' + ic('check', 32) + '</div><h3 class="heading">Saved. +' + res.points + ' points</h3><p class="mid">' + esc(deed.name) + (res.flag ? '<br>' + esc(res.flag) : '') + '</p></div><div class="btn-row"><button class="btn outline" data-act="ql-another">Log another</button><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>', 'Quick log');
  }
  GC.act['ql-save'] = () => qlSave(false);
  GC.act['ql-another'] = () => { Object.assign(QL, { deedId: '', amount: '', note: '', photo: '', date: today() }); GC.sheet.set(qlHtml(), 'Quick log'); };

  /* ====================== 10. LOG TAB ====================== */
  function entryRows(list) {
    return list.map((l) => {
      const d = GC.deed(l.deedId);
      return '<div class="item" style="min-height:60px"><span class="ic" style="color:var(--green)">' + GC.catIcon(l.cat) + '</span><span class="grow"><span class="semi">' + esc(d ? d.name : 'Deed') + '</span><br><span class="meta">' + esc(num(l.amount, 2)) + ' ' + esc(d ? d.unit : '') + (l.date !== today() ? ' · ' + GC.fmtDate(l.date) : '') + (l.note ? ' · ' + esc(l.note) : '') + '</span></span>' + GC.ui.pts(l.points) +
        '<button class="icon-btn" data-act="entry-edit" data-id="' + l.id + '" aria-label="' + t('Edit') + '">' + ic('pencil', 20) + '</button><button class="icon-btn" data-act="entry-del" data-id="' + l.id + '" aria-label="' + t('Delete') + '">' + ic('trash', 20) + '</button></div>';
    }).join('');
  }
  GC.screens.log = () => {
    const u = GC.user(); const todayList = u.logs.filter((l) => l.date === today()).sort((a, b) => b.ts - a.ts);
    return {
      title: 'Log', tab: 'log',
      html: '<div class="stack"><div class="grid2">' + GC.CATS.map((c) => '<button class="tile" data-act="open-log" data-cat="' + c.id + '"><span style="color:var(--green)">' + ic(c.icon, 28) + '</span><span class="name">' + t(c.name) + '</span><span class="status">' + esc(c.examples) + '</span></button>').join('') + '</div>' +
        '<button class="btn block" data-act="open-log">' + t('Log an action') + '</button>' +
        '<div class="row between"><h3 class="section-title" style="margin:0">Today\'s entries</h3><a href="#/history" class="small">History</a></div>' +
        (todayList.length ? '<div class="list">' + entryRows(todayList) + '</div>' : GC.ui.empty('Nothing logged today yet.', t('Log an action'), 'open-log')) + '</div>'
    };
  };
  GC.screens.history = () => {
    const u = GC.user(); const list = u.logs.slice().sort((a, b) => (a.date === b.date ? b.ts - a.ts : a.date < b.date ? 1 : -1));
    let html = ''; let cur = '';
    list.forEach((l) => { if (l.date !== cur) { cur = l.date; html += '<h3 class="section-title">' + esc(GC.fmtDate(cur)) + '</h3>'; } html += '<div class="list">' + entryRows([l]) + '</div>'; });
    return { title: 'History', back: '/log', html: list.length ? html : GC.ui.empty('Nothing logged yet.', t('Log an action'), 'open-log') };
  };
  GC.act['entry-del'] = (el) => GC.confirmSheet({ title: 'Delete this entry?', body: 'Its points will be removed from your score.', confirm: t('Delete'), onConfirm: () => { const r = GC.deleteLog(el.dataset.id); if (!r.ok) GC.toast(r.error); GC.render(); } });
  GC.act['entry-edit'] = (el) => {
    const u = GC.user(); const l = u.logs.find((x) => x.id === el.dataset.id); const d = GC.deed(l.deedId);
    GC.sheet.open({ title: t('Edit'), html: '<p class="semi">' + esc(d.name) + '</p><label class="field"><span class="lbl">' + t('Amount') + ' (' + esc(d.unit) + ')</span><input class="input" id="ed-amount" type="number" step="any" value="' + l.amount + '"></label><label class="field"><span class="lbl">' + t('Note') + '</span><input class="input" id="ed-note" value="' + esc(l.note) + '" maxlength="200"></label><div id="ed-err"></div><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Cancel') + '</button><button class="btn" data-act="entry-save" data-id="' + l.id + '">' + t('Save') + '</button></div>' });
  };
  GC.act['entry-save'] = (el) => { const r = GC.editLog(el.dataset.id, $('#ed-amount').value, $('#ed-note').value); if (!r.ok) { $('#ed-err').innerHTML = GC.ui.msg(r.error); return; } GC.sheet.close(true); GC.render(); };

  /* ====================== 11 to 14. CATEGORY PAGES ====================== */
  function catStrip(u, cat) {
    const t0 = today(); const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(t0, -i);
      let v = u.logs.filter((l) => l.date === d && l.cat === cat).reduce((a, l) => a + l.points, 0);
      if (cat === 'carbon') v -= u.penalties.filter((p) => p.date === d).reduce((a, p) => a + p.points, 0);
      out.push({ v, label: 'SMTWTFS'[parse(d).getDay()] });
    }
    return GC.strip(out);
  }
  function readingCard(kind) {
    const u = GC.user(); const list = u.readings[kind]; const unit = kind === 'electricity' ? 'kWh' : 'litres';
    const week = GC.util.weekStart(today()); const cur = list.find((r) => r.week === week);
    const prior = list.filter((r) => r.week < week).length;
    const learn = prior < GC.BASELINE_WEEKS ? '<p class="small mid mt">Learning period: ' + prior + ' of ' + GC.BASELINE_WEEKS + ' weeks of readings. ' + (kind === 'electricity' ? 'Penalties start after that.' : 'Leak alerts start after that.') + '</p>' : '';
    return '<div class="card"><div class="row between"><span class="semi">Weekly ' + (kind === 'electricity' ? 'electricity' : 'water') + ' reading</span>' + (cur ? '<span class="tag">' + num(cur.value) + ' ' + unit + ' this week</span>' : '') + '</div>' +
      '<p class="small mid">' + (kind === 'electricity' ? 'Type in this week\'s meter use, or let a connected sensor send it. A reading more than 20% above your own average takes off 10 points.' : 'Type in this week\'s water use, or let a connected sensor send it. High use raises a leak alert.') + '</p>' +
      '<div class="row mt"><input class="input" id="rd-' + kind + '" type="number" inputmode="decimal" min="0" step="any" placeholder="' + unit + ' this week" aria-label="' + unit + ' this week"><button class="btn small" data-act="reading-save" data-kind="' + kind + '">' + t('Save') + '</button></div>' + learn + '<div id="rd-msg-' + kind + '"></div></div>';
  }
  GC.act['reading-save'] = (el) => {
    const kind = el.dataset.kind; const v = $('#rd-' + kind).value; const msg = $('#rd-msg-' + kind);
    const res = kind === 'electricity' ? GC.addElectricity(v, 'typed') : GC.addWater(v, 'typed');
    if (!res.ok) { msg.innerHTML = GC.ui.msg(res.error); return; }
    let text;
    if (res.status === 'learning') text = 'Saved. Learning your normal use first: ' + res.have + ' of ' + res.need + ' weeks.';
    else if (res.status === 'penalty') text = 'Electricity was ' + res.pct + '% above your average this week: -10';
    else if (res.status === 'noted') text = 'Saved. This was already counted for this week.';
    else if (res.status === 'high') text = 'Saved. Water use was ' + res.pct + '% above your average. Check for leaks. An alert was added to your Inbox.';
    else text = 'Saved. Use is within your normal range.' + (kind === 'electricity' ? ' About ' + num(res.co2, 1) + ' kg of CO2 this week.' : '');
    GC.sheet.open({ title: res.status === 'penalty' ? 'Score change' : 'Reading saved', html: '<p>' + esc(text) + '</p>' + (res.status === 'penalty' ? '<p class="small mid mt">Penalties never reduce your Reward Wallet.</p>' : '') + '<div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>', onClose: () => { GC.render(); GC.afterAction(); } });
  };

  function tripCard() {
    return '<div class="card"><div class="semi">Record a trip</div><p class="small mid">Use your phone\'s GPS or type the distance, then tap how you travelled.</p><button class="btn outline small mt" data-act="trip-open">Record a trip</button></div>';
  }
  const TRIP = { km: 0, watch: null, last: null, mode: '' };
  const MODES = [{ id: 'walk', name: 'Walk' }, { id: 'cycle', name: 'Cycle' }, { id: 'transit', name: 'Bus or train' }, { id: 'car-shared', name: 'Car with others' }, { id: 'car-solo', name: 'Car alone' }];
  function hav(a, b) { const R = 6371, rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
  function tripHtml() {
    return '<div class="stack"><div class="card pale center"><div class="score-num" id="trip-km">' + TRIP.km.toFixed(2) + '</div><div class="mid">km</div></div>' +
      '<div class="row"><button class="btn outline small grow" data-act="trip-gps">' + (TRIP.watch != null ? 'Stop GPS' : 'Use GPS') + '</button></div>' +
      '<label class="field"><span class="lbl">Or type the distance (km)</span><input class="input" id="trip-manual" type="number" inputmode="decimal" step="any" min="0"></label>' +
      '<div><div class="small mid" style="margin-bottom:6px">How did you travel?</div><div class="chips" style="flex-wrap:wrap;overflow:visible">' + MODES.map((m) => '<button class="chip' + (TRIP.mode === m.id ? ' sel' : '') + '" data-act="trip-mode" data-v="' + m.id + '">' + m.name + '</button>').join('') + '</div></div><div id="trip-err"></div><button class="btn block" data-act="trip-save">' + t('Save') + '</button></div>';
  }
  GC.act['trip-open'] = () => { Object.assign(TRIP, { km: 0, watch: null, last: null, mode: '' }); GC.sheet.open({ title: 'Record a trip', html: tripHtml(), tall: true, onClose: tripStop }); };
  function tripStop() { if (TRIP.watch != null && navigator.geolocation) navigator.geolocation.clearWatch(TRIP.watch); TRIP.watch = null; }
  GC.act['trip-gps'] = () => {
    if (TRIP.watch != null) { tripStop(); GC.sheet.set(tripHtml()); return; }
    if (!navigator.geolocation) { $('#trip-err').innerHTML = GC.ui.msg('GPS is not available here. Type the distance instead.'); return; }
    TRIP.last = null;
    TRIP.watch = navigator.geolocation.watchPosition((p) => {
      const pt = { lat: p.coords.latitude, lon: p.coords.longitude };
      if (TRIP.last && p.coords.accuracy < 60) { const d = hav(TRIP.last, pt); if (d > 0.01) { TRIP.km += d; TRIP.last = pt; } } else if (!TRIP.last) TRIP.last = pt;
      const el = $('#trip-km'); if (el) el.textContent = TRIP.km.toFixed(2);
    }, () => { const e = $('#trip-err'); if (e) e.innerHTML = GC.ui.msg('Could not read your location. Check permission or type the distance.'); tripStop(); }, { enableHighAccuracy: true, maximumAge: 2000 });
    GC.sheet.set(tripHtml());
  };
  GC.act['trip-mode'] = (el) => { const m = $('#trip-manual'); const keep = m ? m.value : ''; TRIP.mode = el.dataset.v; GC.sheet.set(tripHtml()); if (keep) $('#trip-manual').value = keep; };
  GC.act['trip-save'] = () => {
    const manual = Number(($('#trip-manual') || {}).value); const km = manual > 0 ? manual : TRIP.km;
    if (!km || km <= 0) { $('#trip-err').innerHTML = GC.ui.msg('Record or type a distance first.'); return; }
    if (!TRIP.mode) { $('#trip-err').innerHTML = GC.ui.msg('Tap how you travelled.'); return; }
    tripStop();
    const res = GC.recordTrip(km, TRIP.mode);
    if (!res.ok) { $('#trip-err').innerHTML = GC.ui.msg(res.error); return; }
    GC.sheet.set('<p>' + (res.status === 'penalty' ? esc(res.reason) : 'Trip saved. No change to your score.') + '</p><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>');
    const s = GC.sheet.el(); if (s) { /* refresh behind the sheet when closed */ }
  };

  GC.screens.cat = (id) => {
    const c = GC.cat(id); if (!c) return GC.screens.home();
    const u = GC.user(); const tot = GC.totals(u);
    const deeds = GC.DEEDS.filter((d) => d.cat === id);
    const todayList = u.logs.filter((l) => l.date === today() && l.cat === id).sort((a, b) => b.ts - a.ts);
    let extra = '';
    if (id === 'carbon') {
      extra = readingCard('electricity') + tripCard();
      if (u.penalties.length) extra += '<h3 class="section-title">Score changes from measurements</h3><div class="list">' + u.penalties.slice().sort((a, b) => b.ts - a.ts).slice(0, 5).map((p) => '<div class="item"><span class="grow"><span class="semi">' + esc(p.reason.replace(/: -\d+$/, '')) + '</span><br><span class="meta">' + esc(GC.fmtDate(p.date)) + '</span></span>' + GC.ui.pts(-p.points) + '</div>').join('') + '</div><p class="small mid"><button class="btn text small" data-act="why-penalty">Why?</button></p>';
    }
    if (id === 'water') extra = readingCard('water');
    if (id === 'food') extra = '<div class="card"><div class="semi">' + t('Donate food') + '</div><p class="small mid">Partner NGOs (demo list). Pack surplus food safely and take it to a partner, then log it.</p><div class="list mt">' + GC.FOOD_PARTNERS.map((p) => '<div class="item"><span class="ic">' + ic('leaf') + '</span><span class="grow"><span class="semi">' + esc(p.name) + '</span><br><span class="meta">' + esc(p.area) + ' · ' + esc(p.hours) + '</span></span></div>').join('') + '</div><button class="btn outline small mt" data-act="open-log" data-cat="food" data-deed="f4">Log a donation</button></div>';
    if (id === 'farm') {
      const p = u.profile;
      extra = '<div class="card"><div class="row between"><span class="semi">My farm</span><button class="btn text small" data-act="farm-edit">' + t('Edit') + '</button></div>' + (p.land || p.crop || p.irrigation ? '<div class="kv"><span class="mid">Land</span><span>' + (p.land ? esc(p.land) + ' acres' : 'Not set') + '</span></div><div class="kv"><span class="mid">Crop</span><span>' + esc(p.crop || 'Not set') + '</span></div><div class="kv"><span class="mid">Irrigation</span><span>' + esc(p.irrigation || 'Not set') + '</span></div>' : '<p class="small mid">Add your land size, crop and irrigation type to get better tips.</p>') + '</div>';
    }
    return {
      title: c.name, back: '/home',
      html: '<div class="stack"><div class="card pale"><div class="row"><span style="color:var(--green)">' + ic(c.icon, 32) + '</span><div class="grow"><div class="semi">' + t(c.name) + '</div><div class="small mid">' + esc(c.blurb) + '</div></div><div class="score-num" style="font-size:28px">' + (tot.byCat[id] < 0 ? '&minus;' : '') + num(Math.abs(tot.byCat[id])) + '</div></div></div>' +
        '<div class="card"><div class="small mid" style="margin-bottom:8px">Points, last 7 days</div>' + catStrip(u, id) + '</div>' +
        '<button class="btn block" data-act="open-log" data-cat="' + id + '">' + t('Add') + '</button>' + extra +
        '<h3 class="section-title">Deeds</h3><div class="list">' + deeds.map((d) => '<button class="item" data-act="open-log" data-cat="' + id + '" data-deed="' + d.id + '"><span class="grow"><span class="semi">' + esc(d.name) + '</span><br><span class="meta">per ' + esc(d.unit) + ' · minimum ' + d.min + (d.once ? ' · one-time' : '') + '</span></span></button>').join('') + '</div>' +
        '<h3 class="section-title">Today\'s entries</h3>' + (todayList.length ? '<div class="list">' + entryRows(todayList) + '</div>' : GC.ui.empty('Nothing logged in ' + c.name + ' today.', t('Add'), 'open-log')) + '</div>'
    };
  };
  GC.act['why-penalty'] = () => GC.sheet.open({ title: 'Why did this happen?', html: '<p>Carbon penalties come only from measured numbers, never from anything you type about your own habits:</p><ul class="mid"><li>A weekly electricity reading more than 20% above your own average takes off 10 points.</li><li>A confirmed solo car trip over 25 km, or under 2 km, takes off 10 points.</li></ul><p class="small mid">Penalties start after four weeks of readings, take off at most ' + GC.DAILY_PENALTY_CAP + ' points a day, and never reduce your Reward Wallet.</p><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>' });
  GC.act['farm-edit'] = () => {
    const p = GC.user().profile;
    GC.sheet.open({ title: 'My farm', html: '<label class="field"><span class="lbl">Land size (acres)</span><input class="input" id="fm-land" type="number" min="0.1" max="' + GC.LAND_MAX + '" step="0.1" value="' + esc(p.land || '') + '"></label><label class="field"><span class="lbl">Main crop</span><input class="input" id="fm-crop" value="' + esc(p.crop || '') + '"></label><label class="field"><span class="lbl">Irrigation type</span><select class="input" id="fm-irr"><option value="">Choose</option>' + GC.IRRIGATION.map((s) => '<option' + (p.irrigation === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></label><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Cancel') + '</button><button class="btn" data-act="farm-save">' + t('Save') + '</button></div>' });
  };
  GC.act['farm-save'] = () => { const p = GC.user().profile; const land = $('#fm-land').value.trim(); if (land !== '') { const n = Number(land); if (!isFinite(n) || n <= 0 || n > GC.LAND_MAX) { GC.toast('Land size must be between 0.1 and ' + GC.LAND_MAX + ' acres.'); return; } const used = Math.max.apply(null, [0].concat(GC.user().logs.filter((l) => GC.deed(l.deedId) && GC.deed(l.deedId).unit === 'acres').map((l) => l.amount))); if (n < used) { GC.toast('You already logged ' + used + ' acres, so the land size cannot be smaller than that.'); return; } } p.land = land; p.crop = $('#fm-crop').value.trim(); p.irrigation = $('#fm-irr').value; GC.save(); GC.sheet.close(true); GC.render(); };

  /* ====================== 15. IMPACT ====================== */
  let impactPeriod = 'week';
  GC.screens.impact = () => {
    const u = GC.user(); const r = GC.range(impactPeriod); const imp = GC.impact(u, r.from, r.to);
    let series = GC.dailySeries(u, r.from, r.to);
    if (series.length > 35) { // group into weeks
      const g = []; for (let i = 0; i < series.length; i += 7) { const ch = series.slice(i, i + 7); const row = { date: ch[0].date, carbon: 0, water: 0, food: 0, farm: 0 }; ch.forEach((x) => ['carbon', 'water', 'food', 'farm'].forEach((k) => { row[k] += Math.max(0, x[k]); })); g.push(row); } series = g;
    }
    const cards = [
      ['CO2 avoided', num(imp.co2, 1), 'kg', 'cloud'], ['Water saved', num(imp.water), 'litres', 'drop'], ['Food saved', num(imp.food, 1), 'kg', 'leaf'],
      ['Irrigation saved', num(imp.irr), 'litres', 'sprout'], ['Good practice', num(imp.acres, 1), 'acres', 'sprout']
    ].map((c, i) => '<div class="card' + (i === 4 ? ' tile-wide' : '') + '" style="' + (i === 4 ? 'grid-column:1/-1' : '') + '"><div class="row" style="color:var(--green)">' + ic(c[3], 22) + '</div><div class="score-num" style="font-size:26px">' + c[1] + '</div><div class="small mid">' + c[2] + ' · ' + c[0] + '</div></div>').join('');
    const avg = GC.AVG_HOUSEHOLD_WEEK; const f = (r.days / 7) * (Math.min(GC.household(u), 50) / 4);
    const cmp = [['CO2 avoided (kg)', imp.co2, avg.co2 * f], ['Water saved (litres)', imp.water, avg.water * f], ['Food saved (kg)', imp.food, avg.food * f]].map((x) => {
      const mx = Math.max(x[1], x[2], 1);
      return '<div class="mt"><div class="small">' + x[0] + '</div><div class="row small mid"><span style="width:56px">You</span><div class="grow">' + GC.ui.bar(x[1] / mx) + '</div><span style="width:56px;text-align:right">' + num(x[1], 1) + '</span></div><div class="row small mid"><span style="width:56px">Average</span><div class="grow">' + GC.ui.bar(x[2] / mx) + '</div><span style="width:56px;text-align:right">' + num(x[2], 1) + '</span></div></div>';
    }).join('');
    const everyday = [Math.round(imp.water / GC.EVERYDAY.bucketL), Math.round(imp.co2 * GC.EVERYDAY.kmPerKgCO2), Math.round(imp.food / GC.EVERYDAY.mealKg)];
    const empty = !u.logs.length;
    return {
      title: 'Impact', tab: 'impact',
      html: '<div class="stack">' + GC.ui.seg([{ id: 'week', name: t('Week') }, { id: 'month', name: t('Month') }, { id: 'all', name: t('All time') }], impactPeriod, 'impact-period') +
        (empty ? GC.ui.empty('Your impact will appear here after your first log.', t('Log an action'), 'open-log', 'chart') : '') +
        '<div class="grid2">' + cards + '</div>' +
        '<div class="card pale"><div class="semi">' + t('In everyday terms') + '</div><ul class="mid" style="margin:8px 0 0;padding-left:20px"><li>' + num(everyday[0]) + ' buckets of water saved</li><li>' + num(everyday[1]) + ' km of car driving avoided</li><li>' + num(everyday[2]) + ' meals worth of food saved</li></ul></div>' +
        '<div class="card"><div class="semi" style="margin-bottom:8px">Points trend</div>' + GC.stackedChart(series) + '</div>' +
        '<div class="card"><div class="semi">Compared with an average household</div><p class="small mid">Demo averages for a typical household in this prototype. Not official statistics.</p>' + cmp + '</div>' +
        '<button class="btn outline block" data-act="impact-share">' + ic('share', 20) + ' ' + t('Share') + '</button><p class="demo-note">Impact figures are approximate estimates.</p></div>'
    };
  };
  GC.act['impact-period'] = (el) => { impactPeriod = el.dataset.v; GC.render(); };
  GC.act['impact-share'] = () => {
    const u = GC.user(); const r = GC.range(impactPeriod); const i = GC.impact(u, r.from, r.to);
    GC.shareText('My GreenAura impact', 'My GreenAura impact (' + impactPeriod + '): ' + num(i.co2, 1) + ' kg CO2 avoided, ' + num(i.water) + ' L water saved, ' + num(i.food, 1) + ' kg food saved. Join me on GreenAura.');
  };

  /* ====================== 16. GREEN CREDIT ====================== */
  GC.screens.credit = () => {
    const u = GC.user(); const tot = GC.totals(u); const lv = GC.levelOf(tot.score);
    const cats = GC.CATS.map((c) => ({ c, v: tot.byCat[c.id] }));
    const maxv = Math.max(10, ...cats.map((x) => Math.abs(x.v)));
    const considered = cats.filter((x) => x.c.id !== 'farm' || u.profile.type === 'Farmer' || u.logs.some((l) => l.cat === 'farm'));
    const weakest = considered.slice().sort((a, b) => a.v - b.v)[0];
    const t0 = today();
    const easy = GC.DEEDS.filter((d) => d.cat === weakest.c.id && d.level === 'basic' && !u.logs.some((l) => l.deedId === d.id && l.date === t0)).slice(0, 2);
    const hist = GC.scoreHistory(u, 12);
    return {
      title: 'Green Credit', back: '/home',
      html: '<div class="stack"><div class="card pale center">' + GC.gauge(tot.score) + '<div class="semi">' + t(lv.name) + '</div>' + (lv.next ? '<div class="small mid">' + num(lv.next.min - tot.score) + ' points to ' + t(lv.next.name) + '</div>' : '<div class="small mid">Top level</div>') + '</div>' +
        '<div class="card"><div class="semi" style="margin-bottom:6px">Levels</div>' + GC.LEVELS.map((L, i) => '<div class="kv"><span' + (i === lv.idx ? ' class="semi"' : ' class="mid"') + '>' + (i === lv.idx ? ic('check', 16) + ' ' : '') + t(L.name) + '</span><span class="' + (i === lv.idx ? 'semi' : 'mid') + '">' + num(L.min) + ' to ' + num(L.max) + '</span></div>').join('') + '</div>' +
        '<div class="card"><div class="semi" style="margin-bottom:8px">Net points by category</div>' + cats.map((x) => '<div class="row small" style="margin-top:8px"><span style="width:76px">' + ic(x.c.icon, 18) + ' ' + t(x.c.name) + '</span><div class="grow">' + GC.ui.bar(Math.max(0, x.v) / maxv) + '</div><span style="width:48px;text-align:right">' + (x.v < 0 ? '&minus;' : '') + num(Math.abs(x.v)) + '</span></div>').join('') + '</div>' +
        '<div class="card"><div class="semi" style="margin-bottom:8px">Last 12 weeks</div>' + GC.lineChart(hist, 'Green Credit over 12 weeks') + '</div>' +
        '<div class="card pale"><div class="semi">' + t('How to improve') + '</div><p class="small mid">' + (u.logs.length ? t(weakest.c.name) + ' is your lowest area. Two easy actions:' : 'Start with two easy actions:') + '</p>' +
        (easy.length ? easy.map((d) => '<button class="item" data-act="open-log" data-cat="' + d.cat + '" data-deed="' + d.id + '"><span class="grow">' + esc(d.name) + '</span></button>').join('') : '<p>Great work today. Come back tomorrow.</p>') + '</div>' +
        '<div class="list card line" style="padding:0 12px">' + GC.ui.row('doc', t('Why did my score change?'), '', '', 'score-changes') + GC.ui.row('help', t('How is it calculated?'), '', '', 'explain-score') + '</div>' +
        '<p class="demo-note"><b>This is a habit score, not a financial credit score.</b> It is never shared with banks.</p></div>'
    };
  };
  GC.act['score-changes'] = () => {
    const u = GC.user(); const rows = GC.recentChanges(u, 5);
    GC.sheet.open({ title: 'Why did my score change?', html: rows.length ? '<div class="list">' + rows.map((r) => '<div class="item"><span class="grow"><span class="semi">' + esc(r.text) + '</span><br><span class="meta">' + esc(GC.fmtDate(r.date)) + '</span></span>' + GC.ui.pts(r.pts) + '</div>').join('') + '</div>' : GC.ui.empty('No changes yet. Log an action to begin.', t('Log an action'), 'open-log'), tall: true });
  };
})();
