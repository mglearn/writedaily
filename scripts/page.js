// Daily Writing a Day: a school-year flip calendar.
// The Nth school week gets week N's writing; the weekday picks the day (Mon plan … Fri edit & share).
// Weekends and, by default, typical Texas holidays are skipped. The day is in the URL hash (#2026-10-05).
(function () {
  'use strict';
  const C = window.DW; if (!C || !C.weeks.length) return;
  const $ = id => document.getElementById(id);
  const flip = $('calFlip');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { return localStorage.getItem('dw.' + k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dw.' + k, v); } catch (e) { /* storage blocked */ } },
  };

  // ---- dates: local time throughout, never UTC ----
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  const fmt = (d, o) => d.toLocaleDateString('en-US', o);
  const isKey = s => /^\d{4}-\d{2}-\d{2}$/.test(s);

  let band = store.get('band', 'g35'); if (!C.bands[band]) band = 'g35';
  let start = store.get('start', C.year.start); if (!isKey(start)) start = C.year.start;
  let useHol = store.get('hol', '1') === '1';
  let days = [], index = 0;

  function build() {
    days = [];
    const hol = new Set(useHol ? C.year.holidays : []);
    let d = parse(start), lastMon = null, weekNo = 0;
    for (let guard = 0; guard < 500; guard++, d = addDays(d, 1)) {
      const wd = d.getDay();
      if (wd === 0 || wd === 6 || hol.has(ymd(d))) continue;
      const mon = ymd(mondayOf(d));
      if (mon !== lastMon) { weekNo++; lastMon = mon; }   // a week counts only if it has a school day
      if (weekNo > C.weeks.length) break;
      const week = C.weeks[weekNo - 1];
      days.push({ date: new Date(d), key: ymd(d), week, day: week.days[wd - 1] });
    }
  }

  // ---- red-pen diff: mark tokens in the fix that weren't in the original ----
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const tok = s => s.match(/\*[^*]+\*|[\p{L}\p{N}’']+|\s+|[^\s\p{L}\p{N}]/gu) || [];
  function redPen(orig, fix) {
    const a = tok(orig).filter(t => !/^\s+$/.test(t)), b = tok(fix);
    const bw = b.map((t, i) => [t.replace(/\*/g, ''), i]).filter(([t]) => !/^\s+$/.test(t));
    const L = Array.from({ length: a.length + 1 }, () => new Array(bw.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = bw.length - 1; j >= 0; j--)
      L[i][j] = a[i] === bw[j][0] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const kept = new Set();
    for (let i = 0, j = 0; i < a.length && j < bw.length;) {
      if (a[i] === bw[j][0]) { kept.add(bw[j][1]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
    }
    return b.map((t, i) => {
      if (/^\s+$/.test(t)) return t;
      const h = /^\*.+\*$/.test(t) ? `<em>${esc(t.slice(1, -1))}</em>` : esc(t);
      return kept.has(i) ? h : `<mark>${h}</mark>`;
    }).join('');
  }

  // letters in DOL use " / " for a line break (Dear Lin, / You are …)
  const lines = h => h.replace(/ (?:<mark>)?\/(?:<\/mark>)? /g, '<br>');

  // ---- rendering ----
  function pageHTML(entry, note) {
    const { date, week, day } = entry, B = week.bands[band], q = day.dol[band];
    const kind = C.kinds[day.kind], isFri = day.kind === 'edit-share';
    return `<article class="fp" aria-labelledby="fpDate">
      <div class="fp-holes" aria-hidden="true"><span></span><span></span><span></span></div>
      <header class="fp-head" id="fpDate">
        <div class="fp-num">${date.getDate()}</div>
        <div class="fp-dow">${fmt(date, { weekday: 'long' })}</div>
        <div class="fp-mon">${fmt(date, { month: 'long', year: 'numeric' })}</div>
        <div class="fp-sub">School day ${index + 1} · Week ${week.week} of ${C.weeks.length}</div>
      </header>
      ${note ? `<p class="fp-note">${note}</p>` : ''}
      <div class="fp-week"><span class="chip kind">${kind}</span><span class="fp-theme">${week.theme}</span><span class="chip">${B.genre}</span></div>

      <section class="fp-sec" aria-label="Fix It">
        <div class="fp-label"><h2>Fix It</h2><span class="focus">Focus: <strong>${esc(B.conv)}</strong></span></div>
        <p class="dol">${lines(esc(q.s))}</p>
        <div class="dol-meta"><span class="errs">${q.n} errors</span>
          <span class="marks" aria-label="Editing marks"><b>≡</b> capital · <b>/</b> lowercase · <b>^</b> insert · <b>⊙</b> period · <b>ℓ</b> delete</span></div>
        <details class="fp-fix"><summary>Show the fix</summary><div class="fix">${lines(redPen(q.s, q.fix))}</div></details>
      </section>

      <section class="fp-sec" aria-label="Write">
        <div class="fp-label"><h2>Write</h2><span class="focus">${day.title}</span></div>
        <p class="prompt">${day.write[band]}</p>
        ${isFri ? `<p class="ican"><span>Rate yourself 1–4 fingers</span>${B.iCan}</p>` : ''}
      </section>

      <details class="fp-teacher"><summary>For the teacher</summary><div><p>${day.teacher}</p><p class="muted"><strong>This week:</strong> ${week.title}. ${week.bigIdea}${week.note ? ` <em>Note: ${week.note}.</em>` : ''}</p></div></details>

      <div class="fp-teks"><span><b>TEKS ${C.bands[band]}</b></span><span>Fix It: ${C.dol[band]} · ${esc(B.conv)}</span><span>Write: ${day.code[band]} · ${kind}</span><span>Genre: ${B.genreCode} · ${B.genre}</span></div>
    </article>`;
  }

  function show(i, dir, note) {
    if (!days.length) return;
    index = Math.max(0, Math.min(days.length - 1, i));
    const html = pageHTML(days[index], note);
    const old = flip.querySelector('.fp:not(.leave-next):not(.leave-prev)');
    flip.querySelectorAll('.leave-next, .leave-prev').forEach(n => n.remove());
    if (old && dir) {
      const tmp = document.createElement('div'); tmp.innerHTML = html; const nw = tmp.firstElementChild;
      if (dir > 0) { flip.insertBefore(nw, old); old.classList.add('leave-next'); }   // tear the top page off
      else { flip.appendChild(nw); nw.classList.add('enter-prev'); old.classList.add('leave-prev'); }
      setTimeout(() => { old.remove(); nw.classList.remove('enter-prev'); }, reduce ? 200 : 460);
    } else flip.innerHTML = html;
    const e = days[index];
    try { history.replaceState(null, '', '#' + e.key); } catch (err) { /* sandboxed */ }
    $('calLive').textContent = `${fmt(e.date, { weekday: 'long', month: 'long', day: 'numeric' })}: ${C.kinds[e.day.kind]}, ${e.week.theme}`;
    $('calPrev').disabled = index === 0; $('calNext').disabled = index === days.length - 1;
    if (!$('calMonth').hidden) renderMonth();
  }
  const go = d => show(index + d, d);

  function openToDate(key, silent) {
    const target = parse(key);
    let i = days.findIndex(x => x.key === key), note = '';
    if (i < 0) {
      if (target < days[0].date) { i = 0; note = 'School hasn’t started yet, so here is the first day.'; }
      else if (target > days[days.length - 1].date) { i = days.length - 1; note = 'The school year is over, so here is the last day.'; }
      else { i = days.findIndex(x => x.date > target); note = 'No school that day, so here is the next school day.'; }
      if (silent) note = '';
    }
    show(i, 0, note);
  }

  // ---- month view: every school day with its week theme ----
  function renderMonth() {
    const box = $('calMonth');
    const byKey = new Map(days.map((x, i) => [x.key, i]));
    const first = days[0].date, last = days[days.length - 1].date, todayKey = ymd(new Date());
    let html = '<p class="cm-jump">Pick a day to jump to it. Crossed-out days are holidays and breaks.</p><div class="cm-months">';
    for (let m = new Date(first.getFullYear(), first.getMonth(), 1); m <= last; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
      html += `<section class="cm"><h3>${fmt(m, { month: 'long', year: 'numeric' })}</h3><div class="cm-grid">`;
      html += ['M', 'T', 'W', 'T', 'F'].map(x => `<span class="cm-h" aria-hidden="true">${x}</span>`).join('');
      for (let d = mondayOf(m); d.getMonth() === m.getMonth() || d < m; d = addDays(d, 1)) {
        const wd = d.getDay(); if (wd === 0 || wd === 6) continue;
        if (d < m) { html += '<span></span>'; continue; }
        const k = ymd(d), i = byKey.get(k), today = k === todayKey ? ' today' : '';
        if (i === undefined) { html += `<span class="cm-d off${today}">${d.getDate()}</span>`; continue; }
        const x = days[i];
        html += `<button type="button" class="cm-d${i === index ? ' on' : ''}${today}" data-i="${i}" title="${x.week.theme}: ${C.kinds[x.day.kind]}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}, ${x.week.theme}, ${C.kinds[x.day.kind]}">${d.getDate()}</button>`;
      }
      html += '</div>';
      const themes = [...new Set(days.filter(x => x.date.getMonth() === m.getMonth() && x.date.getFullYear() === m.getFullYear()).map(x => `Wk ${x.week.week}: ${x.week.theme}`))];
      html += `<p class="cm-wk">${themes.join(' · ')}</p></section>`;
    }
    box.innerHTML = html + '</div>';
    box.querySelectorAll('button[data-i]').forEach(b => b.addEventListener('click', () => { const i = Number(b.dataset.i); show(i, i > index ? 1 : -1); }));
  }

  // ---- controls ----
  function setBand(b) {
    band = b; store.set('band', b);
    document.querySelectorAll('[data-band]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.band === b)));
    if (days.length) show(index, 0);
  }
  document.querySelectorAll('[data-band]').forEach(x => x.addEventListener('click', () => setBand(x.dataset.band)));
  $('calPrev').addEventListener('click', () => go(-1));
  $('calNext').addEventListener('click', () => go(1));
  $('calToday').addEventListener('click', () => openToDate(ymd(new Date())));
  const toggle = (btn, panel) => $(btn).addEventListener('click', () => {
    const p = $(panel); p.hidden = !p.hidden; $(btn).setAttribute('aria-expanded', String(!p.hidden));
    if (panel === 'calMonth' && !p.hidden) renderMonth();
  });
  toggle('calMonthBtn', 'calMonth'); toggle('calSettingsBtn', 'calSettings');
  const rebuild = key => { build(); openToDate(key, true); };
  $('calStart').value = start; $('calHol').checked = useHol;
  $('calStart').addEventListener('change', e => { if (!isKey(e.target.value)) return; start = e.target.value; store.set('start', start); rebuild(days[index].key); });
  $('calHol').addEventListener('change', e => { useHol = e.target.checked; store.set('hol', useHol ? '1' : '0'); rebuild(days[index].key); });
  $('calReset').addEventListener('click', () => {
    start = C.year.start; useHol = true; store.set('start', start); store.set('hol', '1');
    $('calStart').value = start; $('calHol').checked = true; build(); openToDate(ymd(new Date()));
  });
  const setProj = on => { document.body.classList.toggle('projecting', on); $('calProject').textContent = on ? 'Exit projector' : 'Project'; };
  $('calProject').addEventListener('click', () => {
    const on = !document.body.classList.contains('projecting'); setProj(on);
    const wrap = document.querySelector('.flip-wrap');
    if (on && wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('projecting')) setProj(false); });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
    else if (e.key === 't' || e.key === 'T') openToDate(ymd(new Date()));
    else if (e.key === 'Escape') {
      if (document.body.classList.contains('projecting') && !document.fullscreenElement) setProj(false);
      [['calMonth', 'calMonthBtn'], ['calSettings', 'calSettingsBtn']].forEach(([p, b]) => { if (!$(p).hidden) { $(p).hidden = true; $(b).setAttribute('aria-expanded', 'false'); $(b).focus(); } });
    }
  });
  let sx = null;
  flip.addEventListener('pointerdown', e => { sx = e.target.closest('summary, a, button') ? null : e.clientX; });
  flip.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 60) go(e.clientX < sx ? 1 : -1); sx = null; });

  // ---- start ----
  build();
  document.querySelectorAll('[data-band]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.band === band)));
  const hash = location.hash.slice(1);
  openToDate(isKey(hash) ? hash : ymd(new Date()), isKey(hash));
})();
