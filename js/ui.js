/* Shared UI toolkit: icons, sheets, toasts, charts and small components. */
(function () {
  const { esc, num } = GC.util;
  const $ = (s, r) => (r || document).querySelector(s);

  /* ---------- icons: thin outline, 24px grid ---------- */
  const P = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    log: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M9 13h6M12 10v6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    gift: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7c-1-3-5-3-5-1s3 1 5 1zM12 7c1-3 5-3 5-1s-3 1-5 1z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
    leaf: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
    sprout: '<path d="M12 21v-8"/><path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    tank: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 12c2 1.5 4-1.5 6 0s4-1.5 6 0"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 1 4 4 4M16 6h4c0 3-1 4-4 4M12 13v4M8 20h8M10 17h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.700 2 6.500 5.500"/><circle cx="17" cy="9" r="2.500"/><path d="M17 14c2.500 0 4 1.500 4.500 4.500"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 1-1 1.700M12 17v.5"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.500"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    ticket: '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    badge: '<circle cx="12" cy="9" r="5"/><path d="M8.500 13.500L7 21l5-3 5 3-1.500-7.500"/>',
    wifi: '<path d="M3 9a14 14 0 0 1 18 0M6 12.500a9.500 9.500 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/>',
    bt: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>'
  };
  GC.icon = (name, size) => {
    const s = size || 24;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.info) + '</svg>';
  };
  const ic = GC.icon;
  GC.logoSvg = (px) => '<svg width="' + px + '" height="' + px + '" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="#3E8C69"/><path d="M256 96c-70 78-104 134-104 186a104 104 0 0 0 208 0c0-52-34-108-104-186z" fill="#E6F2EB"/><path d="M256 176c-34 40-52 72-52 100a52 52 0 0 0 104 0c0-28-18-60-52-100z" fill="#3E8C69"/><path d="M256 214v118M256 276l-30-26M256 296l28-24" fill="none" stroke="#E6F2EB" stroke-width="12" stroke-linecap="round"/></svg>';

  /* ---------- registries for click and input handlers ---------- */
  GC.act = {};
  GC.inp = {};
  GC.go = (path) => { if (location.hash === '#' + path) GC.render(); else location.hash = path; };
  GC.back = (fallback) => { if (history.length > 1 && GC._navCount > 1) { GC._navCount -= 2; history.back(); } else GC.go(fallback || '/home'); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act],[data-go]');
    if (!el || el.disabled) return;
    if (el.dataset.go) { GC.go(el.dataset.go); return; }
    const fn = GC.act[el.dataset.act];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-inp]');
    if (el && GC.inp[el.dataset.inp]) GC.inp[el.dataset.inp](el, e);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-chg]');
    if (el && GC.inp[el.dataset.chg]) GC.inp[el.dataset.chg](el, e);
  });

  /* ---------- toast ---------- */
  let toastTimer;
  GC.toast = (msg, ms) => {
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms || 2600);
  };
  GC.flushNotices = () => { const n = GC.notices.splice(0); if (n.length) GC.toast(n.join('. ')); };

  /* ---------- sheets ---------- */
  let sheetEl = null, scrimEl = null, onCloseCb = null;
  GC.sheet = {
    open(o) {
      GC.sheet.close(true);
      const root = $('#sheet-root');
      scrimEl = document.createElement('div'); scrimEl.className = 'scrim';
      sheetEl = document.createElement('div'); sheetEl.className = 'sheet'; sheetEl.setAttribute('role', 'dialog'); sheetEl.setAttribute('aria-modal', 'true');
      sheetEl.innerHTML = '<div class="handle" aria-hidden="true"></div><div class="sheet-head"><h2>' + esc(o.title || '') + '</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">' + ic('close') + '</button></div><div class="sheet-body' + (o.tall ? ' tall' : '') + '">' + (o.html || '') + '</div>';
      root.appendChild(scrimEl); root.appendChild(sheetEl);
      onCloseCb = o.onClose || null;
      scrimEl.addEventListener('click', () => GC.sheet.close());
      requestAnimationFrame(() => requestAnimationFrame(() => { scrimEl && scrimEl.classList.add('open'); sheetEl && sheetEl.classList.add('open'); }));
      dragToClose(sheetEl);
      const first = sheetEl.querySelector('input,select,textarea'); if (first && o.focus) setTimeout(() => first.focus(), 260);
      if (o.mount) o.mount(sheetEl);
      return sheetEl;
    },
    set(html, title) {
      if (!sheetEl) return;
      sheetEl.querySelector('.sheet-body').innerHTML = html;
      if (title != null) sheetEl.querySelector('h2').textContent = title;
    },
    el() { return sheetEl; },
    close(instant) {
      if (!sheetEl) return;
      const s = sheetEl, sc = scrimEl, cb = onCloseCb;
      sheetEl = null; scrimEl = null; onCloseCb = null;
      const remove = () => { s.remove(); sc.remove(); };
      if (instant) remove(); else { s.classList.remove('open'); sc.classList.remove('open'); setTimeout(remove, 240); }
      if (cb) cb();
    },
    isOpen() { return !!sheetEl; }
  };
  GC.act['sheet-close'] = () => GC.sheet.close();
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') GC.sheet.close(); });

  function dragToClose(sheet) {
    let y0 = null, dy = 0;
    const grips = sheet.querySelectorAll('.handle,.sheet-head');
    grips.forEach((g) => {
      g.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; sheet.style.transition = 'none'; g.setPointerCapture(e.pointerId); });
      g.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = 'translateY(' + dy + 'px)'; });
      const end = () => { if (y0 == null) return; sheet.style.transition = ''; sheet.style.transform = ''; const close = dy > 90; y0 = null; if (close) GC.sheet.close(); };
      g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
    });
  }
  // keep the sheet above the keyboard on browsers that do not resize the layout
  if (window.visualViewport) {
    const adjust = () => {
      const vv = window.visualViewport; const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const r = $('#sheet-root'); if (r) r.style.bottom = gap + 'px';
    };
    window.visualViewport.addEventListener('resize', adjust); window.visualViewport.addEventListener('scroll', adjust);
  }

  GC.confirmSheet = (o) => {
    GC.sheet.open({
      title: o.title,
      html: '<p class="mid">' + esc(o.body || '') + '</p><div class="btn-row"><button class="btn outline" data-act="sheet-close">' + esc(o.cancel || t('Cancel')) + '</button><button class="btn" id="confirm-go">' + esc(o.confirm || t('Yes')) + '</button></div>',
      mount(el) { el.querySelector('#confirm-go').addEventListener('click', () => { GC.sheet.close(); o.onConfirm && o.onConfirm(); }); }
    });
  };

  /* ---------- helpers ---------- */
  GC.mail = (subject, body) => {
    const u = GC.user(); const to = u ? u.email : '';
    if (!navigator.onLine) { GC.toast('Email needs internet. Try again when you are online.'); return; }
    location.href = 'mailto:' + encodeURIComponent(to).replace('%40', '@') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };
  GC.shareText = async (title, text) => {
    if (!navigator.onLine) { GC.toast('Sharing needs internet. Try again when you are online.'); return; }
    try {
      if (navigator.share) { await navigator.share({ title, text }); return; }
      await navigator.clipboard.writeText(text); GC.toast('Copied to the clipboard');
    } catch (e) { if (e && e.name !== 'AbortError') GC.toast('Could not share. Try again.'); }
  };
  GC.readPhoto = (file, cb) => {
    if (!file) return cb('');
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 360, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => cb(''); img.src = rd.result;
    };
    rd.onerror = () => cb(''); rd.readAsDataURL(file);
  };
  GC.fmtDate = (s) => {
    const d = GC.util.parse(s); const t0 = GC.util.today();
    if (s === t0) return t('Today'); if (s === GC.util.addDays(t0, -1)) return t('Yesterday');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  GC.fmtTime = (ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  /* ---------- components ---------- */
  GC.ui = {
    bar: (p) => '<div class="bar" role="progressbar" aria-valuenow="' + Math.round(p * 100) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + Math.round(Math.max(0, Math.min(1, p)) * 100) + '%"></i></div>',
    empty: (text, btn, act, icon) => '<div class="empty">' + ic(icon || 'leaf') + '<p>' + esc(text) + '</p>' + (btn ? '<button class="btn" data-act="' + act + '">' + esc(btn) + '</button>' : '') + '</div>',
    error: (msg, act) => '<div class="err">' + ic('warn') + '<div class="grow"><p>' + esc(msg) + '</p>' + (act ? '<button class="btn outline small mt" data-act="' + act + '">' + t('Retry') + '</button>' : '') + '</div></div>',
    msg: (text) => '<p class="msg">' + ic('warn', 16) + '<span>' + esc(text) + '</span></p>',
    row: (icon, title, meta, go, act) => '<button class="item" ' + (go ? 'data-go="' + go + '"' : 'data-act="' + act + '"') + '><span class="ic">' + ic(icon) + '</span><span class="grow"><span class="semi">' + esc(title) + '</span>' + (meta ? '<br><span class="meta">' + esc(meta) + '</span>' : '') + '</span><span class="chev">' + ic('chev', 20) + '</span></button>',
    chips: (items, sel, act) => '<div class="chips">' + items.map((i) => '<button class="chip' + (i.id === sel ? ' sel' : '') + '" data-act="' + act + '" data-v="' + esc(i.id) + '">' + (i.icon ? ic(i.icon, 18) : '') + esc(i.name) + '</button>').join('') + '</div>',
    seg: (items, sel, act) => '<div class="seg" role="tablist">' + items.map((i) => '<button role="tab" aria-selected="' + (i.id === sel) + '" class="' + (i.id === sel ? 'sel' : '') + '" data-act="' + act + '" data-v="' + esc(i.id) + '">' + esc(i.name) + '</button>').join('') + '</div>',
    pts: (n) => n >= 0 ? '<span class="pts-plus">+' + num(n) + '</span>' : '<span class="pts-minus">&minus;' + num(Math.abs(n)) + '</span>',
    levelName: (n) => t(n)
  };
  GC.catIcon = (id) => ic(GC.cat(id).icon);

  /* half-circle gauge for the Green Credit */
  GC.gauge = (score) => {
    const cx = 130, cy = 124, r = 104, p = Math.max(0, Math.min(1, score / GC.MAX_SCORE));
    const x = cx - r * Math.cos(Math.PI * p), y = cy - r * Math.sin(Math.PI * p);
    const fg = p > 0 ? '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + '" fill="none" stroke="#3E8C69" stroke-width="16" stroke-linecap="round"/>' : '';
    return '<svg class="gauge" viewBox="0 0 260 150" width="260" height="150" role="img" aria-label="Green Credit ' + score + ' out of ' + GC.MAX_SCORE + '">' +
      '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" fill="none" stroke="#E6F2EB" stroke-width="16" stroke-linecap="round"/>' + fg +
      '<text x="' + cx + '" y="' + (cy - 22) + '" text-anchor="middle" font-size="40" font-weight="600" fill="#2B2F2D" style="font-family:inherit">' + num(score) + '</text>' +
      '<text x="' + (cx - r) + '" y="' + (cy + 20) + '" text-anchor="middle" font-size="11" fill="#6B706D" style="font-family:inherit">0</text>' +
      '<text x="' + (cx + r) + '" y="' + (cy + 20) + '" text-anchor="middle" font-size="11" fill="#6B706D" style="font-family:inherit">' + num(GC.MAX_SCORE) + '</text></svg>';
  };

  const CAT_FILL = { carbon: '#3E8C69', water: '#A9D1BC', food: '#D9DCDA', farm: '#6B706D' };
  /* stacked bars of points per day, by category */
  GC.stackedChart = (series) => {
    const W = 320, H = 150, padL = 4, padB = 22, padT = 8;
    const totals = series.map((r) => ['carbon', 'water', 'food', 'farm'].reduce((a, c) => a + Math.max(0, r[c]), 0));
    const max = Math.max(10, ...totals);
    const n = series.length, bw = Math.max(3, Math.min(28, (W - padL * 2) / n - 3));
    const step = (W - padL * 2) / n;
    let svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Points per day by category">';
    svg += '<line x1="0" x2="' + W + '" y1="' + (H - padB) + '" y2="' + (H - padB) + '" stroke="#D9DCDA"/>';
    series.forEach((r, i) => {
      let y = H - padB; const x = padL + i * step + (step - bw) / 2;
      ['carbon', 'water', 'food', 'farm'].forEach((c) => {
        const v = Math.max(0, r[c]); if (!v) return;
        const h = (v / max) * (H - padB - padT); y -= h;
        svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + CAT_FILL[c] + '"/>';
      });
      if (n <= 10 || i % Math.ceil(n / 8) === 0) {
        const d = GC.util.parse(r.date);
        svg += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + (n <= 7 ? 'SMTWTFS'[d.getDay()] : d.getDate() + '/' + (d.getMonth() + 1)) + '</text>';
      }
    });
    svg += '</svg>';
    const legend = '<div class="row wrap small mid mt">' + GC.CATS.map((c) => '<span class="row" style="gap:6px"><i style="width:12px;height:12px;border-radius:3px;background:' + CAT_FILL[c.id] + ';display:inline-block;border:1px solid #D9DCDA"></i>' + t(c.name) + '</span>').join('') + '</div>';
    return svg + legend;
  };

  /* simple line chart (12-week history) */
  GC.lineChart = (pts, label) => {
    const W = 320, H = 120, p = 14;
    const vals = pts.map((x) => x.score); const lo = Math.min(...vals), hi = Math.max(...vals);
    const min = lo === hi ? lo - 50 : lo, max = lo === hi ? hi + 50 : hi;
    const xs = (i) => p + (i * (W - p * 2)) / Math.max(1, pts.length - 1);
    const ys = (v) => H - p - ((v - min) / (max - min)) * (H - p * 2);
    const path = pts.map((x, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(x.score).toFixed(1)).join(' ');
    let svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label || 'History') + '">';
    svg += '<line x1="' + p + '" x2="' + (W - p) + '" y1="' + (H - p) + '" y2="' + (H - p) + '" stroke="#D9DCDA"/>';
    svg += '<path d="' + path + '" fill="none" stroke="#3E8C69" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach((x, i) => { svg += '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(x.score).toFixed(1) + '" r="3" fill="#3E8C69"/>'; });
    svg += '<text x="' + p + '" y="' + (H - 1) + '">' + esc(GC.fmtDate(pts[0].date)) + '</text><text x="' + (W - p) + '" y="' + (H - 1) + '" text-anchor="end">' + t('Today') + '</text></svg>';
    return svg;
  };

  /* small 7-day strip for category pages */
  GC.strip = (series) => {
    const max = Math.max(10, ...series.map((r) => Math.abs(r.v)));
    return '<div class="strip">' + series.map((r) => '<div class="col"><i style="height:' + Math.max(3, Math.round((Math.max(0, r.v) / max) * 54)) + 'px"></i><span>' + esc(r.label) + '</span></div>').join('') + '</div>';
  };

  /* PIN pad: caller supplies the action names */
  GC.pinPad = (dotsId, len, value) => {
    const dots = Array.from({ length: len }, (_, i) => '<i class="' + (i < value.length ? 'on' : '') + '"></i>').join('');
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
    return '<div class="pin-dots" id="' + dotsId + '" aria-label="PIN, ' + value.length + ' of ' + len + ' digits entered">' + dots + '</div>' +
      '<div class="pad">' + keys.map((k) => k === '' ? '<button class="blank" tabindex="-1" aria-hidden="true"></button>' : k === 'del' ? '<button data-act="pin-del" aria-label="Delete">' + ic('back') + '</button>' : '<button data-act="pin-digit" data-v="' + k + '">' + k + '</button>').join('') + '</div>';
  };

  GC.progressLine = (ms) => { const p = $('#progress'); p.hidden = false; setTimeout(() => { p.hidden = true; }, ms || 260); };
})();
