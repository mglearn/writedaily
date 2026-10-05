// Daily Writing a Day: the month calendar (front page). One month per sheet; each school day
// links to its day page (day/#2026-10-05). The month is in the URL hash (#2026-10).
(function () {
  'use strict';
  const C = window.DW; if (!C || !C.weeks.length) return;
  const { ymd, ym, parse, addDays, mondayOf, fmt, isKey, isMonth } = window.DWCore;
  // Old links pointed days at the front page; send them to the day page.
  if (isKey(location.hash.slice(1))) { location.replace('day/' + location.hash); return; }

  const $ = id => document.getElementById(id);
  const sheet = $('mSheet');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = window.DWCore.settings(C);
  let days = [], byKey = new Map(), months = [], mi = 0;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function build() {
    days = window.DWCore.schoolDays(C, S.start, S.useHol);
    byKey = new Map(days.map((x, i) => [x.key, { ...x, i }]));
    months = [];
    const last = days[days.length - 1].date;
    for (let m = new Date(days[0].date.getFullYear(), days[0].date.getMonth(), 1); m <= last; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) months.push(m);
    $('mTabs').innerHTML = months.map((m, i) => `<button type="button" data-m="${i}" aria-label="${fmt(m, { month: 'long', year: 'numeric' })}">${fmt(m, { month: 'short' })}</button>`).join('');
    $('mTabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { const i = Number(b.dataset.m); show(i, i > mi ? 1 : i < mi ? -1 : 0); }));
  }

  function sheetHTML(m) {
    const band = S.band, todayKey = ymd(new Date());
    const first = days[0].date, last = days[days.length - 1].date;
    let rows = '';
    for (let mon = mondayOf(m); mon.getMonth() === m.getMonth() || mon < m; mon = addDays(mon, 7)) {
      const wk = [0, 1, 2, 3, 4].map(n => addDays(mon, n));
      if (!wk.some(d => d.getMonth() === m.getMonth())) continue;   // e.g. a month that starts on a weekend
      const inWeek = wk.map(d => byKey.get(ymd(d))).find(Boolean);
      const W = inWeek && C.weeks[inWeek.w];
      const label = W
        ? `<div class="mw"><span class="mw-n">Week ${W.week}</span><span class="mw-t">${esc(W.theme)}</span><span class="chip">${esc(W.bands[band].genre)}</span><span class="mw-f">Fix It: ${esc(W.bands[band].conv)}</span></div>`
        : `<div class="mw mw-off"><span class="mw-t">${mon < first ? 'Before school starts' : mon > last ? 'Summer' : 'Break'}</span></div>`;
      const cells = wk.map(d => {
        const k = ymd(d), x = byKey.get(k), today = k === todayKey ? ' today' : '';
        const label = fmt(d, { weekday: 'long', month: 'long', day: 'numeric' });
        if (d.getMonth() !== m.getMonth()) return '<div class="md md-out" aria-hidden="true"></div>';
        if (!x) {
          const why = d >= first && d <= last ? 'No school' : '';
          return `<div class="md md-off${today}"><span class="md-n">${d.getDate()}</span>${why ? `<span class="md-k">${why}</span>` : ''}</div>`;
        }
        const day = C.weeks[x.w].days[x.d];
        return `<a class="md${today}" href="day/#${k}" aria-label="${esc(label)}: ${esc(C.kinds[day.kind])}, ${esc(day.title)}">
          <span class="md-n">${d.getDate()}</span>${today ? '<span class="md-today">Today</span>' : ''}
          <span class="md-k">${esc(C.kinds[day.kind])}</span><span class="md-t">${esc(day.title)}</span></a>`;
      }).join('');
      rows += `<div class="mr">${label}${cells}</div>`;
    }
    const count = days.filter(x => x.date.getMonth() === m.getMonth() && x.date.getFullYear() === m.getFullYear()).length;
    return `<article class="mc" aria-labelledby="mTitle">
      <div class="fp-holes" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      <header class="mc-head"><h2 id="mTitle"><span>${fmt(m, { month: 'long' })}</span> ${m.getFullYear()}</h2>
        <p>${count} school days · ${C.bands[band]}</p></header>
      <div class="mg" role="presentation">
        <div class="mr mr-h" aria-hidden="true"><span></span>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((x, i) => `<span>${x}<small>${['Plan', 'Draft', 'Revise', 'Quick-write', 'Edit & share'][i]}</small></span>`).join('')}</div>
        ${rows}
      </div>
    </article>`;
  }

  function show(i, dir) {
    mi = Math.max(0, Math.min(months.length - 1, i));
    const html = sheetHTML(months[mi]);
    const old = sheet.querySelector('.mc:not(.leave-next):not(.leave-prev)');
    sheet.querySelectorAll('.leave-next, .leave-prev').forEach(n => n.remove());
    if (old && dir) {
      const tmp = document.createElement('div'); tmp.innerHTML = html; const nw = tmp.firstElementChild;
      if (dir > 0) { sheet.insertBefore(nw, old); old.classList.add('leave-next'); }   // flip the sheet up and over
      else { sheet.appendChild(nw); nw.classList.add('enter-prev'); old.classList.add('leave-prev'); }
      setTimeout(() => { old.remove(); nw.classList.remove('enter-prev'); }, reduce ? 200 : 460);
    } else sheet.innerHTML = html;
    try { history.replaceState(null, '', '#' + ym(months[mi])); } catch (e) { /* sandboxed */ }
    $('mPrev').disabled = mi === 0; $('mNext').disabled = mi === months.length - 1;
    $('mTabs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === mi ? 'true' : 'false'));
    $('mLive').textContent = fmt(months[mi], { month: 'long', year: 'numeric' });
  }

  // Month index for a date, clamped to the school year.
  function monthFor(d) {
    const i = months.findIndex(m => m.getFullYear() === d.getFullYear() && m.getMonth() === d.getMonth());
    return i >= 0 ? i : d < months[0] ? 0 : months.length - 1;
  }
  function setToday() {
    const t = new Date(), k = ymd(t);
    const x = days.find(y => y.key >= k) || days[days.length - 1];   // today, or the next school day
    $('mTodayLink').href = 'day/#' + x.key;
  }

  window.DWCore.wireBands(S, () => show(mi, 0));
  window.DWCore.wireSettings(C, S, () => { const cur = months[mi]; build(); setToday(); show(monthFor(cur), 0); });
  $('mPrev').addEventListener('click', () => show(mi - 1, -1));
  $('mNext').addEventListener('click', () => show(mi + 1, 1));
  $('mThisMonth').addEventListener('click', () => { const i = monthFor(new Date()); show(i, i > mi ? 1 : i < mi ? -1 : 0); });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); if (mi < months.length - 1) show(mi + 1, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); if (mi > 0) show(mi - 1, -1); }
    else if (e.key === 't' || e.key === 'T') $('mThisMonth').click();
    else if (e.key === 'Escape' && !$('calSettings').hidden) { $('calSettings').hidden = true; $('calSettingsBtn').setAttribute('aria-expanded', 'false'); $('calSettingsBtn').focus(); }
  });
  let sx = null;
  sheet.addEventListener('pointerdown', e => { sx = e.target.closest('a, button') ? null : e.clientX; });
  sheet.addEventListener('pointerup', e => {
    if (sx !== null && Math.abs(e.clientX - sx) > 60) { const d = e.clientX < sx ? 1 : -1; if (mi + d >= 0 && mi + d < months.length) show(mi + d, d); }
    sx = null;
  });

  build(); setToday();
  const h = location.hash.slice(1);
  show(isMonth(h) ? monthFor(parse(h)) : monthFor(new Date()), 0);
})();
