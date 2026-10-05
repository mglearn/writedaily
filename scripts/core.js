// Shared by the month calendar and the day pages: dates, saved settings, and the school-day mapping.
// The Nth school week gets week N's writing; the weekday picks the day (Mon plan … Fri edit & share).
// Weekends and, by default, typical Texas holidays are skipped. Local dates throughout, never UTC.
window.DWCore = (function () {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const ym = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d || 1); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  const fmt = (d, o) => d.toLocaleDateString('en-US', o);
  const isKey = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const isMonth = s => /^\d{4}-\d{2}$/.test(s);
  const store = {
    get(k, d) { try { return localStorage.getItem('dw.' + k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dw.' + k, v); } catch (e) { /* storage blocked */ } },
  };

  // Saved per browser, shared by both pages (same origin, same keys).
  function settings(C) {
    let band = store.get('band', 'g35'); if (!C.bands[band]) band = 'g35';
    let start = store.get('start', C.year.start); if (!isKey(start)) start = C.year.start;
    return { band, start, useHol: store.get('hol', '1') === '1' };
  }

  // -> [{ date, key, w (week index), d (weekday index 0–4) }]
  function schoolDays(C, start, useHol) {
    const days = [], hol = new Set(useHol ? C.year.holidays : []);
    let d = parse(start), lastMon = null, weekNo = 0;
    for (let guard = 0; guard < 500; guard++, d = addDays(d, 1)) {
      const wd = d.getDay();
      if (wd === 0 || wd === 6 || hol.has(ymd(d))) continue;
      const mon = ymd(mondayOf(d));
      if (mon !== lastMon) { weekNo++; lastMon = mon; }   // a week counts only if it has a school day
      if (weekNo > C.weeks.length) break;
      days.push({ date: new Date(d), key: ymd(d), w: weekNo - 1, d: wd - 1 });
    }
    return days;
  }

  // The "School calendar" panel is the same on both pages; onChange gets called after a save.
  function wireSettings(C, s, onChange) {
    const $ = id => document.getElementById(id);
    const btn = $('calSettingsBtn'), panel = $('calSettings');
    btn.addEventListener('click', () => { panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); });
    $('calStart').value = s.start; $('calHol').checked = s.useHol;
    $('calStart').addEventListener('change', e => { if (!isKey(e.target.value)) return; s.start = e.target.value; store.set('start', s.start); onChange(false); });
    $('calHol').addEventListener('change', e => { s.useHol = e.target.checked; store.set('hol', s.useHol ? '1' : '0'); onChange(false); });
    $('calReset').addEventListener('click', () => {
      s.start = C.year.start; s.useHol = true; store.set('start', s.start); store.set('hol', '1');
      $('calStart').value = s.start; $('calHol').checked = true; onChange(true);
    });
  }

  function wireBands(s, onChange) {
    const btns = document.querySelectorAll('[data-band]');
    const mark = () => btns.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.band === s.band)));
    btns.forEach(x => x.addEventListener('click', () => { s.band = x.dataset.band; store.set('band', s.band); mark(); onChange(); }));
    mark();
  }

  return { pad, ymd, ym, parse, addDays, mondayOf, fmt, isKey, isMonth, store, settings, schoolDays, wireSettings, wireBands };
})();
