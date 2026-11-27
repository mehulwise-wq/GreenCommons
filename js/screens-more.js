/* Screens 17 to 28: Rewards, Leaderboard, Challenges, Learn, Community, Inbox, Reports,
   Profile, Settings, Help, About, Devices. */
(function () {
  const { esc, num, today, addDays } = GC.util;
  const ic = GC.icon;
  const $ = (s, r) => (r || document).querySelector(s);

  /* ====================== 17. REWARDS ====================== */
  let rewardsTab = 'vouchers';
  GC.screens.rewards = () => {
    const u = GC.user(); const tot = GC.totals(u); const lv = GC.levelOf(tot.score);
    let body = '';
    if (rewardsTab === 'vouchers') {
      body = GC.VOUCHERS.map((v) => {
        const need = GC.LEVELS.findIndex((l) => l.name === v.level);
        const levelLock = lv.idx < need, short = tot.wallet < v.cost;
        const reason = levelLock ? 'Unlocks at the ' + v.level + ' level' : short ? 'Needs ' + num(v.cost - tot.wallet) + ' more points' : '';
        return '<div class="card line voucher' + (levelLock ? ' locked' : '') + '"><div class="row between"><span class="semi">' + esc(v.name) + '</span><span class="tag grey">Prototype reward</span></div><p class="small mid">' + esc(v.desc) + '</p><div class="row between mt"><span class="cost">' + num(v.cost) + ' points</span>' +
          (levelLock ? '<span class="small mid">' + ic('lock', 16) + ' ' + esc(reason) + '</span>' : '<button class="btn small' + (short ? ' outline' : '') + '" data-act="voucher-open" data-id="' + v.id + '"' + '>' + (short ? esc(reason) : t('Redeem')) + '</button>') + '</div></div>';
      }).join('');
      if (u.redemptions.length) body += '<h3 class="section-title">My vouchers</h3><div class="list">' + u.redemptions.map((r) => '<div class="item"><span class="ic">' + ic('ticket') + '</span><span class="grow"><span class="semi">' + esc(r.name) + '</span><br><span class="meta">' + esc(r.code) + ' · until ' + new Date(r.expires).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + '</span></span></div>').join('') + '</div>';
    } else if (rewardsTab === 'badges') {
      body = '<div class="grid2">' + GC.BADGES.map((b) => { const got = u.badges.includes(b.id); return '<div class="card' + (got ? ' pale' : '') + ' center" style="' + (got ? '' : 'opacity:.65') + '"><div style="color:' + (got ? 'var(--green)' : 'var(--mid)') + '">' + ic(got ? 'badge' : 'lock', 32) + '</div><div class="semi small mt">' + esc(b.name) + '</div><div class="small mid">' + esc(b.desc) + '</div></div>'; }).join('') + '</div>';
    } else {
      const all = Object.keys(GC.state().accounts).reduce((a, k) => a + GC.totals(GC.state().accounts[k]).earned, 0);
      const pool = all + 125000;
      body = '<div class="card pale center"><div class="small mid">Simulated fund pool</div><div class="score-num">&#8377;' + num((pool / 1000) * 10) + '</div><p class="small mid">1,000 points = &#8377;10 of notional value</p></div><p class="mid mt">This figure is an illustration of how a real funding partner could back rewards in future. <b>No money is involved in this prototype.</b></p>';
    }
    return {
      title: 'Rewards', tab: 'rewards',
      html: '<div class="stack"><div class="card pale"><div class="row between"><span class="small mid">' + t('Reward Wallet') + '</span><span class="small mid">' + t(lv.name) + ' level</span></div><div class="score-num">' + num(tot.wallet) + '</div><div class="row between small mid"><span>Earned ' + num(tot.earned) + '</span><span>Spent ' + num(tot.spent) + '</span></div></div>' +
        GC.ui.seg([{ id: 'vouchers', name: t('Vouchers') }, { id: 'badges', name: t('Badges') }, { id: 'pool', name: t('Fund Pool') }], rewardsTab, 'rewards-tab') + body + '</div>'
    };
  };
  GC.act['rewards-tab'] = (el) => { rewardsTab = el.dataset.v; GC.render(); };
  GC.act['voucher-open'] = (el) => {
    const v = GC.VOUCHERS.find((x) => x.id === el.dataset.id);
    GC.sheet.open({ title: 'Redeem ' + v.name, html: '<p class="mid">' + esc(v.desc) + '</p><div class="kv"><span>Cost</span><b>' + num(v.cost) + ' points</b></div><div class="kv"><span>Valid for</span><b>30 days</b></div><div class="kv"><span>Limit</span><b>2 a week</b></div><p class="small mid mt">This is a <b>prototype reward</b>. The code is simulated and has no cash value. Spending points lowers your Reward Wallet only, never your Green Credit.</p><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Cancel') + '</button><button class="btn" data-act="voucher-confirm" data-id="' + v.id + '">' + t('Redeem') + '</button></div>' });
  };
  GC.act['voucher-confirm'] = (el) => {
    const res = GC.redeem(el.dataset.id);
    if (!res.ok) { GC.sheet.set('<div class="err">' + ic('warn') + '<p>' + esc(res.error) + '</p></div><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>', 'Cannot redeem'); return; }
    GC.sheet.set('<p class="mid">Your prototype voucher is ready.</p><div class="code">' + esc(res.rec.code) + '</div><p class="small mid center">' + esc(res.rec.name) + ' · valid for 30 days</p><div class="btn-row"><button class="btn outline" data-act="voucher-email" data-code="' + esc(res.rec.code) + '" data-name="' + esc(res.rec.name) + '">' + ic('mail', 18) + ' Email it</button><button class="btn" data-act="voucher-done">' + t('Done') + '</button></div>', 'Voucher issued');
  };
  GC.act['voucher-email'] = (el) => GC.mail('GreenCommons voucher: ' + el.dataset.name, 'Your prototype reward code: ' + el.dataset.code + '\nValid for 30 days.\n\nThis is a prototype reward with no cash value.');
  GC.act['voucher-done'] = () => { GC.sheet.close(true); GC.render(); };

  /* ====================== 18. LEADERBOARD ====================== */
  const LB = { kind: 'people', period: 'week', cat: 'all' };
  GC.screens.leaderboard = () => {
    const rows = GC.leaderboard(LB.kind, LB.period, LB.cat);
    const top = rows.slice(0, 3), rest = rows.slice(3, 10);
    const meIdx = rows.findIndex((r) => r.me);
    const unit = LB.kind === 'groups' ? 'pts per member' : 'pts';
    const order = [top[1], top[0], top[2]].filter(Boolean);
    const podium = '<div class="podium">' + order.map((r) => { const rank = rows.indexOf(r) + 1; return '<div class="p' + (rank === 1 ? ' first' : '') + '"><div class="rank">' + rank + '</div><div class="semi small">' + esc(r.name) + (r.me ? ' (you)' : '') + '</div><div class="small mid">' + num(r.value) + '</div></div>'; }).join('') + '</div>';
    const rowHtml = (r, i) => '<div class="item' + (r.me ? ' me-row' : '') + '"><span style="width:24px" class="semi">' + (i + 1) + '</span><span class="grow"><span class="semi">' + esc(r.name) + (r.me ? ' (you)' : '') + '</span><br><span class="meta">' + esc(r.sub) + '</span></span><span class="semi">' + num(r.value) + '</span></div>';
    return {
      title: 'Leaderboard', back: '/home',
      html: '<div class="stack">' + GC.ui.seg([{ id: 'people', name: t('People') }, { id: 'groups', name: t('Groups') }], LB.kind, 'lb-kind') + GC.ui.seg([{ id: 'week', name: 'This week' }, { id: 'month', name: 'This month' }], LB.period, 'lb-period') +
        GC.ui.chips([{ id: 'all', name: t('All') }].concat(GC.CATS.map((c) => ({ id: c.id, name: t(c.name), icon: c.icon }))), LB.cat, 'lb-cat') +
        '<p class="small mid center">Demo community · ' + (LB.kind === 'groups' ? 'ranked by points per member so size cannot win' : 'first name, last initial and locality only') + '</p>' +
        podium + '<div class="list">' + rest.map((r, i) => rowHtml(r, i + 3)).join('') + '</div>' +
        (meIdx >= 10 ? '<div class="list card line" style="padding:0 8px;position:sticky;bottom:0">' + rowHtml(rows[meIdx], meIdx) + '</div>' : '') + '<p class="demo-note">Values are in ' + unit + '. Change how you appear in Settings.</p></div>'
    };
  };
  GC.act['lb-kind'] = (el) => { LB.kind = el.dataset.v; GC.render(); };
  GC.act['lb-period'] = (el) => { LB.period = el.dataset.v; GC.render(); };
  GC.act['lb-cat'] = (el) => { LB.cat = el.dataset.v; GC.render(); };

  /* ====================== 19. CHALLENGES ====================== */
  let chTab = 'active';
  GC.screens.challenges = () => {
    const u = GC.user(); const all = GC.allChallenges();
    let body = '';
    if (chTab === 'active') {
      body = u.challenges.active.length ? u.challenges.active.map((a) => { const ch = all.find((c) => c.id === a.id); if (!ch) return ''; const p = GC.challengeProgress(u, ch, a.joinedAt); return '<div class="card line"><div class="row between"><span class="semi">' + esc(ch.title) + '</span><span class="small mid">' + p + ' of ' + ch.target + '</span></div><p class="small mid">' + esc(ch.desc) + '</p><div class="mt">' + GC.ui.bar(p / ch.target) + '</div><div class="btn-row"><button class="btn outline small" data-act="open-log" data-cat="' + ch.cat + '">Log now</button><button class="btn text small" data-act="ch-leave" data-id="' + ch.id + '">Leave</button></div></div>'; }).join('') : GC.ui.empty('No active challenges. Pick one from Available.', 'See available', 'ch-to-available', 'flag');
    } else if (chTab === 'available') {
      const open = all.filter((c) => !u.challenges.active.some((a) => a.id === c.id) && !u.challenges.done.some((d) => d.id === c.id));
      body = (u.challenges.active.length >= GC.MAX_ACTIVE_CHALLENGES ? '<div class="err">' + ic('info') + '<p>You have three active challenges. Finish or leave one to join another.</p></div>' : '') + (open.length ? open.map((c) => '<div class="card line"><div class="row between"><span class="semi">' + esc(c.title) + '</span><span class="tag grey">' + t(GC.cat(c.cat).name) + '</span></div><p class="small mid">' + esc(c.desc) + (c.group ? ' (set by your group admin)' : '') + '</p><button class="btn small mt" data-act="ch-join" data-id="' + c.id + '">' + t('Join') + '</button></div>').join('') : GC.ui.empty('You have joined every challenge.'));
    } else {
      body = u.challenges.done.length ? '<div class="list">' + u.challenges.done.map((d) => { const ch = all.find((c) => c.id === d.id); return '<div class="item"><span class="ic" style="color:var(--green)">' + ic('check') + '</span><span class="grow"><span class="semi">' + esc(ch ? ch.title : d.id) + '</span><br><span class="meta">Completed ' + esc(new Date(d.doneAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) + '</span></span></div>'; }).join('') + '</div>' : GC.ui.empty('Completed challenges will show here.');
    }
    return { title: 'Challenges', back: '/home', html: '<div class="stack">' + GC.ui.seg([{ id: 'active', name: t('Active') }, { id: 'available', name: t('Available') }, { id: 'done', name: t('Completed') }], chTab, 'ch-tab') + body + '</div>' };
  };
  GC.act['ch-tab'] = (el) => { chTab = el.dataset.v; GC.render(); };
  GC.act['ch-to-available'] = () => { chTab = 'available'; GC.render(); };
  GC.act['ch-join'] = (el) => { const r = GC.joinChallenge(el.dataset.id); if (!r.ok) GC.toast(r.error); else { chTab = 'active'; GC.toast('Challenge joined'); } GC.render(); };
  GC.act['ch-leave'] = (el) => GC.confirmSheet({ title: 'Leave this challenge?', body: 'Your progress for it will be lost.', confirm: 'Leave', onConfirm: () => { GC.leaveChallenge(el.dataset.id); GC.render(); } });

  /* ====================== 20. LEARN ====================== */
  const LN = { q: '', cat: 'all', size: 16 };
  GC.screens.learn = () => {
    const u = GC.user();
    const list = GC.ARTICLES.filter((a) => (LN.cat === 'all' || a.cat === LN.cat) && (!LN.q || (a.title + ' ' + a.body).toLowerCase().includes(LN.q.toLowerCase())));
    return {
      title: 'Learn', back: '/home',
      html: '<div class="stack"><label class="field" style="margin:0"><span class="lbl" style="position:absolute;left:-9999px">' + t('Search') + '</span><input class="input" id="ln-q" type="search" placeholder="' + t('Search') + '" value="' + esc(LN.q) + '" data-inp="ln-search"></label>' +
        GC.ui.chips([{ id: 'all', name: t('All') }].concat(GC.CATS.map((c) => ({ id: c.id, name: t(c.name), icon: c.icon }))), LN.cat, 'ln-cat') +
        '<div class="card pale"><div class="small mid">' + t('Tip of the day') + '</div><p>' + esc(GC.tipOfDay()) + '</p></div><div id="ln-list">' + learnList(list, u) + '</div></div>'
    };
  };
  function learnList(list, u) {
    return list.length ? list.map((a) => '<button class="card line tap" style="margin-bottom:12px" data-go="/article/' + a.id + '"><div class="row between"><span class="tag grey">' + t(GC.cat(a.cat).name) + '</span><span class="small mid">1 min read' + (u.quizzes[a.id] ? ' · quiz done' : '') + '</span></div><div class="semi mt">' + esc(a.title) + '</div></button>').join('') : GC.ui.empty('No articles match your search.', 'Clear search', 'ln-clear', 'search');
  }
  GC.inp['ln-search'] = (el) => { LN.q = el.value; const list = GC.ARTICLES.filter((a) => (LN.cat === 'all' || a.cat === LN.cat) && (!LN.q || (a.title + ' ' + a.body).toLowerCase().includes(LN.q.toLowerCase()))); $('#ln-list').innerHTML = learnList(list, GC.user()); };
  GC.act['ln-cat'] = (el) => { LN.cat = el.dataset.v; GC.render(); };
  GC.act['ln-clear'] = () => { LN.q = ''; LN.cat = 'all'; GC.render(); };

  GC.screens.article = (id) => {
    const a = GC.ARTICLES.find((x) => x.id === id); if (!a) return GC.screens.learn();
    return {
      title: a.title, back: '/learn',
      html: '<div class="stack"><div class="row"><span class="tag">' + t(GC.cat(a.cat).name) + '</span><span class="grow"></span><button class="icon-btn" data-act="ar-smaller" aria-label="Smaller text"><b style="font-size:14px">A</b></button><button class="icon-btn" data-act="ar-larger" aria-label="Larger text"><b style="font-size:20px">A</b></button></div>' +
        '<h2 class="heading">' + esc(a.title) + '</h2><p class="article-body" id="ar-body" style="font-size:' + LN.size + 'px">' + esc(a.body) + '</p>' +
        '<div class="row"><button class="btn outline small" data-act="ar-listen" data-id="' + a.id + '">' + ic('play', 18) + ' ' + t('Listen') + '</button></div>' +
        '<div class="card pale"><div class="semi">' + t('Quiz') + '</div><p class="small mid">Three quick questions. You get 15 Reward Wallet points the first time.</p><button class="btn small mt" data-act="quiz-start" data-id="' + a.id + '">Start quiz</button></div>' +
        '<button class="btn outline block" data-act="open-log" data-cat="' + a.cat + '">' + t('Try it now') + '</button></div>'
    };
  };
  GC.act['ar-smaller'] = () => { LN.size = Math.max(14, LN.size - 2); $('#ar-body').style.fontSize = LN.size + 'px'; };
  GC.act['ar-larger'] = () => { LN.size = Math.min(26, LN.size + 2); $('#ar-body').style.fontSize = LN.size + 'px'; };
  GC.act['ar-listen'] = (el) => {
    const a = GC.ARTICLES.find((x) => x.id === el.dataset.id);
    if (!('speechSynthesis' in window)) { GC.toast('Reading aloud is not available on this phone.'); return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
    const ut = new SpeechSynthesisUtterance(a.title + '. ' + a.body); ut.lang = I18N.lang === 'en' ? 'en-IN' : I18N.lang; speechSynthesis.speak(ut);
  };
  const QZ = { id: '', i: 0, right: 0 };
  GC.act['quiz-start'] = (el) => { Object.assign(QZ, { id: el.dataset.id, i: 0, right: 0 }); GC.sheet.open({ title: 'Quiz', html: quizHtml(), tall: true, onClose: () => { speechSynthesis && speechSynthesis.cancel && speechSynthesis.cancel(); } }); };
  function quizHtml() {
    const a = GC.ARTICLES.find((x) => x.id === QZ.id); const q = a.quiz[QZ.i];
    return '<p class="small mid">Question ' + (QZ.i + 1) + ' of ' + a.quiz.length + '</p><p class="semi">' + esc(q.q) + '</p>' + q.o.map((o, k) => '<button class="quiz-opt" data-act="quiz-answer" data-k="' + k + '">' + esc(o) + '</button>').join('');
  }
  GC.act['quiz-answer'] = (el) => {
    const a = GC.ARTICLES.find((x) => x.id === QZ.id); const q = a.quiz[QZ.i]; const k = Number(el.dataset.k);
    if (k === q.a) QZ.right++;
    QZ.i++;
    if (QZ.i < a.quiz.length) { GC.sheet.set(quizHtml()); return; }
    const r = GC.submitQuiz(QZ.id);
    GC.sheet.set('<div class="center stack"><div class="score-num">' + QZ.right + ' of ' + a.quiz.length + '</div><p class="mid">' + (QZ.right === a.quiz.length ? 'Perfect score.' : 'Good effort. Read the article again to improve.') + '</p>' + (r.first ? '<div class="card pale"><b>+15</b> Reward Wallet points</div>' : '<p class="small mid">You already earned the quiz points for this article.</p>') + '</div><div class="btn-row"><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>', 'Quiz complete');
  };

  /* ====================== 21. COMMUNITY ====================== */
  GC.screens.community = () => {
    const u = GC.user();
    if (!u.community) {
      return {
        title: 'Community', back: '/home',
        html: '<div class="stack"><div class="card pale"><div class="semi">' + t('Join with a code') + '</div><p class="small mid">Get a code from your school, ward or farm group. Try these demo codes: GREEN-SCH, WARD-12, KISAN-1. Teachers can use GREEN-SCH-ADMIN.</p><label class="field"><span class="lbl">Group code</span><input class="input" id="cm-code" autocapitalize="characters" placeholder="GREEN-SCH"></label><div id="cm-msg"></div><button class="btn block mt" data-act="cm-join">' + t('Join') + '</button></div></div>'
      };
    }
    const g = GC.group(u); const admin = u.community.role === 'admin';
    const t0 = today(); const mine = Math.max(0, GC.netBetween(u, addDays(t0, -29), t0));
    const pts = g.members.reduce((a, m) => a + m.month, 0) + mine;
    const kind = { Event: 'flag', Offer: 'gift', Need: 'help' };
    return {
      title: 'Community', back: '/home',
      html: '<div class="stack"><div class="card pale"><div class="row between"><div><div class="heading">' + esc(g.name) + '</div><div class="small mid">' + esc(g.kind) + (admin ? ' · Admin' : '') + '</div></div><span class="tag">' + esc(u.community.code) + '</span></div><div class="mt semi">' + num(pts) + ' of ' + num(g.goal) + ' group points this month</div><div class="mt">' + GC.ui.bar(pts / g.goal) + '</div><p class="demo-note" style="text-align:left">Demo community: other members are sample data.</p></div>' +
        (admin ? '<div class="card line"><div class="semi">Admin tools</div><div class="chips mt" style="flex-wrap:wrap;overflow:visible"><button class="chip" data-act="cm-announce">Post announcement</button><button class="chip" data-act="cm-goal">Set goal</button><button class="chip" data-act="cm-challenge">Start challenge</button><button class="chip" data-go="/reports">Class summary</button></div></div>' : '') +
        '<h3 class="section-title">' + t('Announcements') + '</h3>' + g.announcements.slice().sort((a, b) => b.ts - a.ts).map((a) => '<div class="card"><div class="small mid">' + esc(a.by) + ' · ' + esc(GC.fmtTime(a.ts)) + '</div><p>' + esc(a.text) + '</p></div>').join('<div style="height:8px"></div>') +
        '<div class="row between"><h3 class="section-title" style="margin:20px 0 8px">' + t('Notice board') + '</h3><button class="btn text small" data-act="cm-post">' + ic('plus', 18) + ' Post</button></div>' +
        '<div class="list">' + g.notices.slice().sort((a, b) => b.ts - a.ts).map((n) => '<div class="item"><span class="ic" style="color:var(--green)">' + ic(kind[n.type] || 'info') + '</span><span class="grow"><span class="tag grey">' + esc(n.type) + '</span><br>' + esc(n.text) + '<br><span class="meta">' + esc(n.by) + ' · ' + esc(GC.fmtTime(n.ts)) + '</span></span></div>').join('') + '</div>' +
        '<h3 class="section-title">Food donation partners</h3><div class="list">' + GC.FOOD_PARTNERS.map((p) => '<div class="item"><span class="ic">' + ic('leaf') + '</span><span class="grow"><span class="semi">' + esc(p.name) + '</span><br><span class="meta">' + esc(p.area) + '</span></span></div>').join('') + '</div><p class="demo-note">Demo partners for the prototype.</p>' +
        '<button class="btn outline block" data-act="cm-leave">Leave group</button></div>'
    };
  };
  GC.act['cm-join'] = () => { const r = GC.joinCommunity($('#cm-code').value); if (!r.ok) { $('#cm-msg').innerHTML = GC.ui.msg(r.error); return; } GC.toast('Joined ' + r.def.name); GC.render(); };
  GC.act['cm-leave'] = () => GC.confirmSheet({ title: 'Leave this group?', body: 'You can rejoin with the code later.', confirm: 'Leave', onConfirm: () => { GC.leaveCommunity(); GC.render(); } });
  GC.act['cm-post'] = () => GC.sheet.open({ title: 'Post to the notice board', html: '<div class="chips" id="cm-types">' + ['Offer', 'Need', 'Event'].map((x, i) => '<button class="chip' + (i === 0 ? ' sel' : '') + '" data-act="cm-type" data-v="' + x + '">' + x + '</button>').join('') + '</div><label class="field"><span class="lbl">Message</span><textarea class="input" id="cm-text" maxlength="160"></textarea></label><div id="cm-err"></div><button class="btn block mt" data-act="cm-post-save" data-type="Offer" id="cm-save">Post</button>', focus: true });
  GC.act['cm-type'] = (el) => { document.querySelectorAll('#cm-types .chip').forEach((c) => c.classList.toggle('sel', c === el)); $('#cm-save').dataset.type = el.dataset.v; };
  GC.act['cm-post-save'] = (el) => {
    const txt = $('#cm-text').value.trim(); if (!txt) { $('#cm-err').innerHTML = GC.ui.msg('Write a short message first.'); return; }
    const u = GC.user(); const g = GC.group(u); g.notices.push({ id: GC.util.uid(), ts: Date.now(), type: el.dataset.type, by: GC.displayName(u), text: txt }); GC.save(); GC.sheet.close(true); GC.render();
  };
  GC.act['cm-announce'] = () => GC.sheet.open({ title: 'Post announcement', html: '<label class="field"><span class="lbl">Announcement</span><textarea class="input" id="cm-text" maxlength="240"></textarea></label><div id="cm-err"></div><button class="btn block mt" data-act="cm-announce-save">Post</button>', focus: true });
  GC.act['cm-announce-save'] = () => { const txt = $('#cm-text').value.trim(); if (!txt) { $('#cm-err').innerHTML = GC.ui.msg('Write a short message first.'); return; } const g = GC.group(GC.user()); g.announcements.push({ id: GC.util.uid(), ts: Date.now(), by: 'Admin', text: txt }); GC.save(); GC.sheet.close(true); GC.render(); };
  GC.act['cm-goal'] = () => { const g = GC.group(GC.user()); GC.sheet.open({ title: 'Set group goal', html: '<label class="field"><span class="lbl">Points this month</span><input class="input" id="cm-goal" type="number" min="500" step="100" value="' + g.goal + '"></label><div class="btn-row"><button class="btn" data-act="cm-goal-save">' + t('Save') + '</button></div>' }); };
  GC.act['cm-goal-save'] = () => { const v = Number($('#cm-goal').value); if (v >= 500) { GC.group(GC.user()).goal = v; GC.save(); GC.sheet.close(true); GC.render(); } };
  GC.act['cm-challenge'] = () => GC.sheet.open({ title: 'Start a group challenge', html: '<label class="field"><span class="lbl">Title</span><input class="input" id="gc-title" maxlength="60" placeholder="Plastic-free week"></label><label class="field"><span class="lbl">Category</span><select class="input" id="gc-cat">' + GC.CATS.map((c) => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></label><label class="field"><span class="lbl">Days to log a deed in this category</span><input class="input" id="gc-days" type="number" min="1" max="30" value="5"></label><div id="cm-err"></div><button class="btn block mt" data-act="cm-challenge-save">Start challenge</button>', focus: true });
  GC.act['cm-challenge-save'] = () => {
    const title = $('#gc-title').value.trim(); const days = Number($('#gc-days').value);
    if (!title || !(days >= 1)) { $('#cm-err').innerHTML = GC.ui.msg('Add a title and a number of days.'); return; }
    const g = GC.group(GC.user()); g.challenges.push({ id: 'g-' + GC.util.uid(), title, desc: 'Log a ' + GC.cat($('#gc-cat').value).name + ' deed on ' + days + ' different days.', cat: $('#gc-cat').value, type: 'days', target: days, group: true });
    GC.save(); GC.sheet.close(true); GC.toast('Challenge started. Members will see it under Available.'); GC.render();
  };

  /* ====================== 22. INBOX ====================== */
  let inboxTab = 'all';
  GC.screens.inbox = () => {
    const u = GC.user();
    const map = { all: null, alerts: 'alert', official: 'official', reminders: 'reminder' };
    const list = u.inbox.filter((m) => !map[inboxTab] || m.type === map[inboxTab]);
    return {
      title: 'Inbox', back: '/home', noBell: true,
      html: '<div class="stack">' + GC.ui.seg([{ id: 'all', name: t('All') }, { id: 'alerts', name: t('Alerts') }, { id: 'official', name: t('Official') }, { id: 'reminders', name: t('Reminders') }], inboxTab, 'inbox-tab') +
        (list.length ? '<div class="list">' + list.map((m) => '<button class="item" data-act="inbox-open" data-id="' + m.id + '"><span class="ic" style="color:' + (m.read ? 'var(--mid)' : 'var(--green)') + '">' + ic(m.type === 'alert' ? 'warn' : m.type === 'reminder' ? 'bell' : 'mail') + '</span><span class="grow"><span class="' + (m.read ? '' : 'semi') + '">' + esc(m.title) + '</span><br><span class="meta">' + esc(GC.fmtTime(m.ts)) + '</span></span>' + (m.read ? '' : '<span class="tag">New</span>') + '</button>').join('') + '</div><button class="btn text block" data-act="inbox-readall">Mark all as read</button>' : GC.ui.empty('Nothing here yet.', '', '', 'bell')) + '</div>'
    };
  };
  GC.act['inbox-tab'] = (el) => { inboxTab = el.dataset.v; GC.render(); };
  GC.act['inbox-readall'] = () => { GC.user().inbox.forEach((m) => { m.read = true; }); GC.save(); GC.render(); };
  GC.act['inbox-open'] = (el) => {
    const m = GC.user().inbox.find((x) => x.id === el.dataset.id); m.read = true; GC.save();
    GC.sheet.open({ title: m.title, html: '<p>' + esc(m.body) + '</p><p class="small mid mt">' + esc(GC.fmtTime(m.ts)) + '</p><div class="btn-row"><button class="btn outline" data-act="inbox-email" data-id="' + m.id + '">' + ic('mail', 18) + ' Email me this</button><button class="btn" data-act="sheet-close">' + t('Done') + '</button></div>', onClose: () => { if (location.hash.indexOf('#/inbox') === 0) GC.render(); } });
  };
  GC.act['inbox-email'] = (el) => { const m = GC.user().inbox.find((x) => x.id === el.dataset.id); GC.mail('GreenCommons: ' + m.title, m.body + '\n\nGreenCommons (prototype)'); };

  /* ====================== 23. REPORTS ====================== */
  let repPeriod = 'month';
  GC.screens.reports = () => {
    const u = GC.user(); const r = GC.reportData(u, repPeriod);
    const admin = u.community && u.community.role === 'admin';
    let cls = '';
    if (admin) {
      const g = GC.group(u); const rows = g.members.map((m) => ({ n: m.name, w: m.week, m: m.month })).concat([{ n: GC.displayName(u) + ' (you)', w: Math.max(0, GC.netBetween(u, addDays(today(), -6), today())), m: Math.max(0, GC.netBetween(u, addDays(today(), -29), today())) }]).sort((a, b) => b.m - a.m);
      cls = '<div class="card"><div class="semi">Class summary (demo members)</div><table class="table mt"><tr><th>Member</th><th class="num">Week</th><th class="num">Month</th></tr>' + rows.map((x) => '<tr><td>' + esc(x.n) + '</td><td class="num">' + num(x.w) + '</td><td class="num">' + num(x.m) + '</td></tr>').join('') + '</table></div>';
    }
    return {
      title: 'Reports', back: '/profile',
      html: '<div class="stack">' + GC.ui.seg([{ id: 'week', name: 'This week' }, { id: 'month', name: 'This month' }, { id: 'quarter', name: '3 months' }], repPeriod, 'rep-period') +
        '<div class="card pale"><div class="small mid">' + esc(u.name) + ' · ' + esc(r.from) + ' to ' + esc(r.to) + '</div><div class="row between mt"><div><div class="score-num">' + num(r.tot.score) + '</div><div class="small mid">' + t('Green Credit') + ' · ' + t(r.level.name) + '</div></div><div style="text-align:right"><div class="score-num" style="font-size:28px">' + num(r.tot.wallet) + '</div><div class="small mid">' + t('Reward Wallet') + '</div></div></div></div>' +
        '<div class="card"><table class="table"><tr><th>Category</th><th class="num">Entries</th><th class="num">Net points</th></tr>' + r.cats.map((c) => '<tr><td>' + t(c.cat.name) + '</td><td class="num">' + c.n + '</td><td class="num">' + (c.pts < 0 ? '&minus;' : '') + num(Math.abs(c.pts)) + '</td></tr>').join('') + '</table></div>' +
        '<div class="card"><div class="semi">Top actions</div>' + (r.top.length ? '<table class="table mt">' + r.top.map((x) => '<tr><td>' + esc(x.name) + '</td><td class="num">' + x.pts + '</td></tr>').join('') + '</table>' : '<p class="small mid">No actions in this period.</p>') + '</div>' +
        '<div class="card"><div class="semi">Impact</div><div class="kv"><span class="mid">CO2 avoided</span><span>' + num(r.impact.co2, 1) + ' kg</span></div><div class="kv"><span class="mid">Water saved</span><span>' + num(r.impact.water) + ' L</span></div><div class="kv"><span class="mid">Food saved</span><span>' + num(r.impact.food, 1) + ' kg</span></div></div>' +
        '<div class="card"><div class="semi" style="margin-bottom:8px">Points per ' + (r.series.length > 35 ? 'day' : 'day') + '</div>' + GC.stackedChart(r.series.length > 35 ? weekly(r.series) : r.series) + '</div>' +
        '<div class="card"><div class="semi">' + t('Badges') + '</div><p class="small mid">' + (r.badges.length ? esc(r.badges.join(', ')) : 'No badges yet.') + '</p></div>' + cls +
        '<div class="btn-row"><button class="btn outline" data-act="rep-share">' + ic('share', 18) + ' ' + t('Share') + '</button><button class="btn" data-act="rep-email">' + ic('mail', 18) + ' ' + t('Email') + '</button></div></div>'
    };
  };
  function weekly(series) { const g = []; for (let i = 0; i < series.length; i += 7) { const ch = series.slice(i, i + 7); const row = { date: ch[0].date, carbon: 0, water: 0, food: 0, farm: 0 }; ch.forEach((x) => ['carbon', 'water', 'food', 'farm'].forEach((k) => { row[k] += Math.max(0, x[k]); })); g.push(row); } return g; }
  GC.act['rep-period'] = (el) => { repPeriod = el.dataset.v; GC.render(); };
  GC.act['rep-email'] = () => { const u = GC.user(); GC.mail('Your GreenCommons report', GC.reportText(u, repPeriod)); };
  GC.act['rep-share'] = () => { const u = GC.user(); GC.shareText('My GreenCommons report', GC.reportText(u, repPeriod)); };

  /* ====================== 24. PROFILE ====================== */
  GC.screens.profile = () => {
    const u = GC.user(); const tot = GC.totals(u); const lv = GC.levelOf(tot.score);
    const initials = u.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    const place = [u.profile.locality, u.profile.district, u.profile.state].filter(Boolean).join(', ');
    const R = GC.ui.row;
    return {
      title: 'Profile', tab: 'profile',
      html: '<div class="stack"><div class="card pale row"><div style="width:56px;height:56px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:20px;flex:0 0 56px">' + esc(initials) + '</div><div class="grow"><div class="heading">' + esc(u.name) + '</div><div class="small mid">' + esc(place || 'Add your locality in Settings') + '</div><div class="row wrap mt" style="gap:6px"><span class="tag">' + esc(u.profile.type) + '</span><span class="tag">' + t(lv.name) + '</span></div></div></div>' +
        '<div class="list card line" style="padding:0 12px">' + R('chart', t('Green Credit'), num(tot.score) + ' points', '/credit') + R('trophy', t('Leaderboard'), '', '/leaderboard') + R('flag', t('Challenges'), '', '/challenges') + R('book', t('Learn'), '', '/learn') + R('users', t('Community'), u.community ? GC.group(u).name : 'Join a group', '/community') + R('doc', t('Reports'), '', '/reports') + R('chip', t('Devices'), u.devices.length + ' connected', '/devices') + R('gear', t('Settings'), '', '/settings') + R('help', t('Help'), '', '/help') + R('info', t('About'), '', '/about') + (GC.installEvent ? R('plus', 'Install app', 'Add GreenCommons to your home screen', '', 'install-app') : '') + '</div></div>'
    };
  };

  /* ====================== 25. SETTINGS ====================== */
  GC.screens.settings = () => {
    const u = GC.user(); const L = I18N.LANGS.find((l) => l.code === I18N.lang);
    const sw = (id, on, label, sub) => '<div class="item"><span class="grow"><span class="semi">' + label + '</span>' + (sub ? '<br><span class="meta">' + sub + '</span>' : '') + '</span><label class="check" style="margin:0"><input type="checkbox" id="' + id + '" data-chg="' + id + '"' + (on ? ' checked' : '') + ' aria-label="' + label + '"></label></div>';
    return {
      title: 'Settings', back: '/profile',
      html: '<div class="stack"><div class="list card line" style="padding:0 12px">' + GC.ui.row('globe', t('Language'), (L.code === 'en' ? 'English' : L.native + ' (' + L.english + ')'), '/language/settings') +
        '<div class="item"><span class="grow"><span class="semi">' + t('Reminder time') + '</span><br><span class="meta">Reminders appear in your Inbox</span></span><input class="input" style="width:150px" type="time" id="st-reminder" value="' + esc(u.settings.reminder) + '" data-chg="st-reminder"></div>' +
        sw('st-anon', u.settings.anonymous, t('Show me as Anonymous'), 'Leaderboards show "Green member"') + sw('st-lock', u.settings.lock, t('App lock'), 'Ask for your PIN when the app opens') + '</div>' +
        '<div class="list card line" style="padding:0 12px">' + GC.ui.row('user', 'Your details', u.email + ' · +91 ' + u.phone, '', 'st-details') + '</div>' +
        '<div class="card"><div class="semi">Prototype tools</div><p class="small mid">Add sample activity to see charts and scores filled in.</p><div class="row wrap mt"><button class="btn outline small" data-act="st-seed">Add sample activity</button><button class="btn outline small" data-act="st-reset">Reset all prototype data</button></div></div>' +
        '<button class="btn outline block" data-act="st-logout">' + t('Log out') + '</button><button class="btn text block" data-act="st-delete" style="color:var(--ink)">' + t('Delete account') + '</button></div>'
    };
  };
  GC.inp['st-reminder'] = (el) => { GC.user().settings.reminder = el.value || '20:00'; GC.save(); GC.toast('Reminder time saved'); };
  GC.inp['st-anon'] = (el) => { GC.user().settings.anonymous = el.checked; GC.save(); };
  GC.inp['st-lock'] = (el) => { GC.user().settings.lock = el.checked; GC.unlocked = true; GC.save(); GC.toast(el.checked ? 'App lock is on' : 'App lock is off'); };
  GC.act['st-details'] = () => { const u = GC.user(); const p = u.profile; GC.sheet.open({ title: 'Your details', html: '<label class="field"><span class="lbl">' + t('Full name') + '</span><input class="input" id="ds-name" value="' + esc(u.name) + '"></label><label class="field"><span class="lbl">Locality</span><input class="input" id="ds-loc" value="' + esc(p.locality) + '"></label><label class="field"><span class="lbl">District</span><input class="input" id="ds-dist" value="' + esc(p.district) + '"></label><label class="field"><span class="lbl">Profile type</span><select class="input" id="ds-type">' + GC.PROFILE_TYPES.map((x) => '<option' + (p.type === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + t('Cancel') + '</button><button class="btn" data-act="ds-save">' + t('Save') + '</button></div>' }); };
  GC.act['ds-save'] = () => { const u = GC.user(); const n = $('#ds-name').value.trim(); if (n.length >= 2) u.name = n; u.profile.locality = $('#ds-loc').value.trim(); u.profile.district = $('#ds-dist').value.trim(); u.profile.type = $('#ds-type').value; GC.save(); GC.sheet.close(true); GC.render(); };
  GC.act['st-seed'] = () => GC.confirmSheet({ title: 'Add sample activity?', body: 'This adds three weeks of example logs and weekly readings to your account so you can explore the charts. You can delete entries from History.', confirm: 'Add', onConfirm: () => { GC.seedDemo(); GC.toast('Sample activity added'); GC.afterAction(); GC.go('/home'); } });
  GC.act['st-reset'] = () => GC.confirmSheet({ title: 'Reset all prototype data?', body: 'This removes every account and all data stored on this phone. It cannot be undone.', confirm: 'Reset everything', onConfirm: () => { GC.resetAll(); GC.unlocked = false; I18N.set('en'); GC.go('/splash'); } });
  GC.act['st-logout'] = () => GC.confirmSheet({ title: 'Log out?', body: 'You can log back in with your mobile number and PIN.', confirm: t('Log out'), onConfirm: () => { GC.logout(); GC.unlocked = false; GC.go('/login'); } });
  GC.act['st-delete'] = () => GC.confirmSheet({ title: 'Delete your account?', body: 'Your score, logs, vouchers and messages will be removed from this phone. This cannot be undone.', confirm: t('Delete account'), onConfirm: () => { GC.deleteAccount(); GC.unlocked = false; GC.toast('Account deleted'); GC.go('/signup'); } });

  /* ====================== 26. HELP ====================== */
  GC.screens.help = () => ({
    title: 'Help', back: '/profile',
    html: '<div class="stack"><div class="list card line" style="padding:0 12px">' + GC.ui.row('play', 'How GreenCommons works', 'Watch the three-step intro again', '/onboarding/help') + '</div>' +
      '<h3 class="section-title">Points and levels</h3><div class="card"><p>Every account starts with a Green Credit of <b>2,000</b>. Good deeds add 15, 25, 50 or 100 points depending on how big the effort is. Carbon penalties can take points off. The score stays between 0 and 7,000.</p><div class="kv"><span>Beginner</span><span class="mid">0 to 2,999</span></div><div class="kv"><span>Green</span><span class="mid">3,000 to 4,999</span></div><div class="kv"><span>Champion</span><span class="mid">5,000 to 7,000</span></div><p class="small mid mt">The Reward Wallet is separate. It collects the points you earn and is spent on vouchers.</p></div>' +
      '<h3 class="section-title">Questions</h3><div class="faq card line" style="padding:0 14px">' +
      [['How do I log an action?', 'Tap Log an action on Home, pick a category and a deed, enter the amount and save. You can log up to 7 days back.'],
        ['Why did I lose points?', 'Only Carbon has penalties, and only from measured numbers such as a high weekly electricity reading or a solo car trip that is very short or very long. Tap Why? on the Carbon page.'],
        ['Why can\'t I earn more today?', 'Each category earns at most 200 points a day, and each deed counts once a day.'],
        ['Are the rewards real?', 'Not yet. Vouchers are labelled "Prototype reward" and have no cash value.'],
        ['Does it work without internet?', 'Yes. Only emailing and sharing need internet.'],
        ['Where is my data?', 'On this phone only. Deleting your account or resetting the app removes it.']].map((x) => '<details><summary>' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>').join('') + '</div></div>'
  });

  /* ====================== 27. ABOUT ====================== */
  GC.screens.about = () => ({
    title: 'About', back: '/profile',
    html: '<div class="stack"><div class="center">' + GC.logoSvg(72) + '<h2 class="heading mt">GreenCommons</h2><p class="mid">Version 1.0 (prototype)</p></div>' +
      '<div class="card pale"><p><b>This is a prototype.</b> Sign-up codes, email checks, the shared leaderboard, the fund pool and vouchers are simulated. Your data stays on this phone.</p></div>' +
      '<div class="card"><div class="semi">How impact figures are estimated</div><p class="small mid mt">Impact numbers are rough estimates built from simple per-action factors. Carbon from electricity uses about ' + GC.GRID_KG_PER_KWH + ' kg of CO2 per kWh. Everyday comparisons use ' + GC.EVERYDAY.bucketL + ' litres per bucket and about ' + GC.EVERYDAY.mealKg + ' kg of food per meal. Figures are approximate and have not been audited. Sources will be listed here before a public release.</p></div>' +
      '<p class="demo-note">This is a habit score, not a financial credit score.</p></div>'
  });

  /* ====================== 28. DEVICES ====================== */
  const DV = { type: 'water-flow', conn: 'wifi', ok: false, bt: '' };
  GC.screens.devices = () => {
    const u = GC.user();
    return {
      title: 'Devices', back: '/profile',
      html: '<div class="stack"><div class="card pale"><div class="semi">Automatic readings</div><p class="small mid">Connect sensors to measure water and electricity without typing. Readings are collected when the app is open. Penalties and leak alerts start after four weeks of readings.</p></div>' +
        (u.devices.length ? '<div class="list card line" style="padding:0 12px">' + u.devices.map((d) => { const ty = GC.DEVICE_TYPES.find((x) => x.id === d.type); const last = d.readings.length ? d.readings[d.readings.length - 1].value + ' ' + ty.unit : 'No reading yet'; return GC.ui.row(ty.icon, d.name, d.status + ' · ' + last, '/device/' + d.id); }).join('') + '</div>' : GC.ui.empty('No devices yet. Add a sensor to start.', 'Add a device', 'dv-add', 'chip')) +
        (u.devices.length ? '<button class="btn block" data-act="dv-add">' + t('Add a device') + '</button>' : '') +
        '<div class="card"><div class="semi">Try it without hardware</div><p class="small mid">Add a device with the code DEMO to simulate readings, or load four weeks of sample readings to skip the learning period.</p><button class="btn outline small mt" data-act="dv-seed">Load sample weekly readings</button></div></div>'
    };
  };
  function addDeviceHtml() {
    return '<div class="stack"><div><div class="small mid" style="margin-bottom:6px">Type</div><div class="chips" style="flex-wrap:wrap;overflow:visible">' + GC.DEVICE_TYPES.map((x) => '<button class="chip' + (DV.type === x.id ? ' sel' : '') + '" data-act="dv-type" data-v="' + x.id + '">' + ic(x.icon, 18) + x.name + '</button>').join('') + '</div></div>' +
      '<div><div class="small mid" style="margin-bottom:6px">Connection</div><div class="seg"><button class="' + (DV.conn === 'wifi' ? 'sel' : '') + '" data-act="dv-conn" data-v="wifi">Wi-Fi</button><button class="' + (DV.conn === 'bt' ? 'sel' : '') + '" data-act="dv-conn" data-v="bt">Bluetooth</button></div></div>' +
      (DV.conn === 'wifi' ? '<label class="field"><span class="lbl">Device code or address (use DEMO to try it)</span><input class="input" id="dv-code" placeholder="DEMO or 192.168.1.20" autocapitalize="characters"></label>' : '<div class="card"><p class="small mid">Pair a nearby Bluetooth device. ' + (navigator.bluetooth ? '' : 'Bluetooth pairing is not available in this browser. ') + 'Readings over Bluetooth need matching device software.</p><button class="btn outline small mt" data-act="dv-pair">Pair device</button><p class="small mt">' + esc(DV.bt || '') + '</p></div>') +
      '<label class="field"><span class="lbl">Name (optional)</span><input class="input" id="dv-name" maxlength="40"></label><div id="dv-msg"></div>' +
      '<div class="btn-row"><button class="btn outline" data-act="dv-test">' + t('Test connection') + '</button><button class="btn" data-act="dv-save"' + (DV.ok ? '' : ' disabled') + ' id="dv-save">' + t('Save') + '</button></div></div>';
  }
  GC.act['dv-add'] = () => { Object.assign(DV, { type: 'water-flow', conn: 'wifi', ok: false, bt: '' }); GC.sheet.open({ title: 'Add a device', html: addDeviceHtml(), tall: true }); };
  const dvKeep = () => ({ c: ($('#dv-code') || {}).value || '', n: ($('#dv-name') || {}).value || '' });
  const dvRedraw = (k) => { GC.sheet.set(addDeviceHtml()); if ($('#dv-code')) $('#dv-code').value = k.c; $('#dv-name').value = k.n; };
  GC.act['dv-type'] = (el) => { const k = dvKeep(); DV.type = el.dataset.v; DV.ok = false; dvRedraw(k); };
  GC.act['dv-conn'] = (el) => { const k = dvKeep(); DV.conn = el.dataset.v; DV.ok = false; dvRedraw(k); };
  GC.act['dv-pair'] = async () => {
    if (!navigator.bluetooth) { $('#dv-msg').innerHTML = GC.ui.error('Bluetooth pairing is not available in this browser.'); return; }
    try { const dev = await navigator.bluetooth.requestDevice({ acceptAllDevices: true }); DV.bt = 'Paired with ' + (dev.name || 'device'); DV.ok = true; const k = dvKeep(); dvRedraw(k); }
    catch (e) { $('#dv-msg').innerHTML = GC.ui.error('No device was paired. ' + (e && e.name === 'NotFoundError' ? '' : 'Check Bluetooth and try again.'), 'dv-pair'); }
  };
  GC.act['dv-test'] = async () => {
    const msg = $('#dv-msg');
    if (DV.conn === 'bt') { msg.innerHTML = DV.ok ? GC.ui.msg('Paired. Ready to save.') : GC.ui.msg('Pair a device first.'); return; }
    const code = ($('#dv-code').value || '').trim();
    if (!code) { msg.innerHTML = GC.ui.msg('Enter the device code.'); return; }
    if (code.toUpperCase() === 'DEMO') { DV.ok = true; $('#dv-save').disabled = false; msg.innerHTML = GC.ui.msg('Demo device connected. Readings will be simulated.'); return; }
    msg.innerHTML = GC.ui.msg('Testing…');
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 4000);
      const res = await fetch('http://' + code + '/data', { signal: ctl.signal }); clearTimeout(to);
      const j = await res.json(); if (typeof j.value !== 'number') throw new Error('bad');
      DV.ok = true; $('#dv-save').disabled = false; msg.innerHTML = GC.ui.msg('Connected. Latest value: ' + j.value);
    } catch (e) {
      DV.ok = false; $('#dv-save').disabled = true;
      msg.innerHTML = GC.ui.error(location.protocol === 'https:' ? 'Could not reach the device. Browsers block plain http devices from a secure page, so use Bluetooth or the DEMO code in this prototype.' : 'Could not reach the device. Check Wi-Fi and the address.', 'dv-test');
    }
  };
  GC.act['dv-save'] = () => {
    const code = DV.conn === 'wifi' ? ($('#dv-code').value || '').trim() : 'bluetooth'; const ty = GC.DEVICE_TYPES.find((x) => x.id === DV.type);
    const d = GC.addDevice({ type: DV.type, conn: DV.conn, code, name: ($('#dv-name').value || '').trim() || ty.name });
    GC.sheet.close(true); GC.go('/device/' + d.id);
  };
  GC.act['dv-seed'] = () => { seedReadings(); GC.toast('Four weeks of sample readings added'); GC.render(); };
  function seedReadings() {
    const u = GC.user(); const base = GC.util.weekStart(today());
    for (let w = 5; w >= 1; w--) {
      const week = addDays(base, -7 * w);
      if (!u.readings.electricity.some((r) => r.week === week)) u.readings.electricity.push({ week, value: 28 + (w % 3) * 2, ts: Date.now(), src: 'demo' });
      if (!u.readings.water.some((r) => r.week === week)) u.readings.water.push({ week, value: 900 + (w % 3) * 40, ts: Date.now(), src: 'demo' });
    }
    u.readings.electricity.sort((a, b) => (a.week < b.week ? -1 : 1)); u.readings.water.sort((a, b) => (a.week < b.week ? -1 : 1)); GC.save();
  }

  GC.screens.device = (id) => {
    const u = GC.user(); const d = u.devices.find((x) => x.id === id); if (!d) return GC.screens.devices();
    const ty = GC.DEVICE_TYPES.find((x) => x.id === d.type); const last = d.readings[d.readings.length - 1];
    const pts = d.readings.slice(-12).map((r) => ({ date: GC.util.ymd(new Date(r.ts)), score: r.value }));
    const isDemo = d.code && d.code.toUpperCase() === 'DEMO';
    const feeds = ty.feeds === 'electricity' || ty.feeds === 'water';
    return {
      title: d.name, back: '/devices',
      html: '<div class="stack"><div class="card pale center"><div class="small mid">' + esc(ty.name) + ' · ' + (d.conn === 'wifi' ? 'Wi-Fi' : 'Bluetooth') + '</div><div class="score-num">' + (last ? esc(num(last.value, 1)) + ' <span style="font-size:18px">' + ty.unit + '</span>' : '&ndash;') + '</div><div class="small mid">' + (last ? 'Updated ' + esc(GC.fmtTime(last.ts)) : 'No reading yet') + '</div></div>' +
        (feeds ? '<p class="small mid">' + (ty.feeds === 'electricity' ? 'Each reading is treated as this week\'s total in kWh.' : 'Each reading is treated as this week\'s total in litres.') + '</p>' : '') +
        (pts.length > 1 ? '<div class="card"><div class="semi" style="margin-bottom:8px">Recent readings</div>' + GC.lineChart(pts, 'Recent readings') + '</div>' : GC.ui.empty('Take a reading to see the chart.')) +
        '<div id="dv-result"></div><button class="btn block" data-act="dv-read" data-id="' + d.id + '">' + (isDemo ? 'Simulate a reading' : 'Read now') + '</button>' + (isDemo && feeds ? '<button class="btn outline block" data-act="dv-read-high" data-id="' + d.id + '">Simulate a high reading</button>' : '') +
        '<button class="btn text block" data-act="dv-remove" data-id="' + d.id + '" style="color:var(--ink)">Remove device</button></div>'
    };
  };
  function demoValue(d, high) {
    const ty = d.type; const u = GC.user();
    if (ty === 'power' || ty === 'water-flow') {
      const list = ty === 'power' ? u.readings.electricity : u.readings.water; const week = GC.util.weekStart(today());
      const prior = list.filter((r) => r.week < week); const avg = prior.length ? prior.reduce((a, r) => a + r.value, 0) / prior.length : (ty === 'power' ? 30 : 950);
      return Math.round(avg * (high ? 1.35 : 0.9 + Math.random() * 0.15) * 10) / 10;
    }
    return Math.round((high ? 10 : 30 + Math.random() * 60) * 10) / 10;
  }
  async function takeReading(id, high) {
    const u = GC.user(); const d = u.devices.find((x) => x.id === id); const out = $('#dv-result');
    let v;
    if (d.code.toUpperCase() === 'DEMO') v = demoValue(d, high);
    else if (d.conn === 'wifi') {
      try { const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 4000); const r = await fetch('http://' + d.code + '/data', { signal: ctl.signal }); clearTimeout(to); const j = await r.json(); v = j.value; if (typeof v !== 'number') throw new Error('bad'); }
      catch (e) { d.status = 'Not connected'; GC.save(); out.innerHTML = GC.ui.error('Could not read the device. Check that it is on and on the same Wi-Fi.', 'dv-retry'); out.dataset.id = id; return; }
    } else { out.innerHTML = GC.ui.error('Bluetooth readings need matching device software, which is not set up yet. Use a DEMO device to try the screens.'); return; }
    const res = GC.deviceReading(id, v);
    GC.afterAction();
    let extra = '';
    if (res && res.status === 'penalty') extra = 'Electricity was ' + res.pct + '% above your average this week: -10';
    else if (res && res.status === 'learning') extra = 'Learning your normal use: ' + res.have + ' of ' + res.need + ' weeks.';
    else if (res && res.status === 'high') extra = 'Water use is high. An alert was added to your Inbox.';
    else if (res && res.status === 'noted') extra = 'Reading saved. It was already counted this week, or the daily penalty limit has been reached.';
    else if (res && res.status === 'normal') extra = 'Reading saved. Use is within your normal range.';
    GC.render();
    if (extra) { const o = $('#dv-result'); if (o) o.innerHTML = '<div class="card pale"><p>' + esc(extra) + '</p></div>'; }
  }
  GC.act['dv-read'] = (el) => takeReading(el.dataset.id, false);
  GC.act['dv-read-high'] = (el) => takeReading(el.dataset.id, true);
  GC.act['dv-retry'] = () => { const id = location.hash.split('/')[2]; takeReading(id, false); };
  GC.act['dv-remove'] = (el) => GC.confirmSheet({ title: 'Remove this device?', body: 'Its past readings will be deleted. Weekly totals already counted stay.', confirm: 'Remove', onConfirm: () => { GC.removeDevice(el.dataset.id); GC.go('/devices'); } });
})();
