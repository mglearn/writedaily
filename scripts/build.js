// Builds index.html (the flip calendar) from data/plan.json + data/weeks/*.json.
// Usage: node scripts/build.js [--fragment out.html]
//   --fragment also writes a body-only copy (no doctype/head) for previewing as an Artifact.
const fs = require('fs'), path = require('path');
const { BANDS, PROCESS, DOL, GENRE, processCode } = require('./teks');
const ROOT = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// Typical Texas 2026–27 calendar; teachers can change the first day in the page.
const YEAR = {
  label: '2026–27', start: '2026-08-17',
  holidays: ['2026-09-07', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27',
    '2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-25', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01',
    '2027-01-18', '2027-02-15', '2027-03-15', '2027-03-16', '2027-03-17', '2027-03-18', '2027-03-19', '2027-03-26'],
};

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\p{L}\p{N}])\*(?!\s)(.+?)\*(?![\p{L}\p{N}])/gu, '$1<em>$2</em>');

const plan = read('data/plan.json').weeks;
const dir = path.join(ROOT, 'data/weeks');
const written = new Map(fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
  .flatMap(f => read('data/weeks/' + f).weeks).map(w => [w.week, w]));

const weeks = plan.filter(p => written.has(p.week)).map(p => {
  const w = written.get(p.week);
  const band = b => ({
    genre: GENRE[p.genre[b]].label[b] || GENRE.correspondence.label[b],
    genreCode: GENRE[p.genre[b]].code[b] || GENRE.correspondence.code[b],
    conv: p.conv[b], iCan: md(w.iCan[b]),
  });
  return {
    week: p.week, theme: p.theme, note: p.note, title: w.title, bigIdea: md(w.bigIdea),
    bands: Object.fromEntries(Object.keys(BANDS).map(b => [b, band(b)])),
    days: w.days.map(d => ({
      kind: d.kind, title: md(d.title), teacher: md(d.teacher),
      write: Object.fromEntries(Object.keys(BANDS).map(b => [b, md(d.write[b])])),
      dol: Object.fromEntries(Object.keys(BANDS).map(b => [b, { s: d.dol[b].s.replace(/\*/g, ''), fix: d.dol[b].fix, n: d.dol[b].n }])),
      code: Object.fromEntries(Object.keys(BANDS).map(b => {
        const g = p.genre[b] === 'argument' && b === 'k2' ? 'correspondence' : p.genre[b];
        return [b, processCode(d.kind, b, g)];
      })),
    })),
  };
});
if (weeks.length !== plan.length) console.warn(`warn: building ${weeks.length}/${plan.length} weeks (missing: ${plan.filter(p => !written.has(p.week)).map(p => p.week).join(', ')})`);
// contiguous weeks only, so the school-day mapping stays honest
const contiguous = []; for (const w of weeks) { if (w.week !== contiguous.length + 1) break; contiguous.push(w); }

const DATA = { year: YEAR, weeks: contiguous, bands: BANDS, kinds: Object.fromEntries(Object.entries(PROCESS).map(([k, v]) => [k, v[0]])), dol: DOL };

const css = fs.readFileSync(path.join(__dirname, 'page.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'page.js'), 'utf8');
const body = `<title>Daily Writing a Day</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Big+Shoulders+Display:wght@700;900&family=Bitter:wght@500;700;800&display=swap">
<style>${css}</style>
<a class="skip" href="#calFlip">Skip to today's page</a>
<main class="wrap">
  <header class="top">
    <div class="brand">
      <p class="eyebrow">Fix It + Write · ${esc(YEAR.label)} · ${contiguous.length} weeks of writing</p>
      <h1>Daily Writing a Day</h1>
      <p class="lede">One editing sentence and one writing prompt for every school day, for grades K–2, 3–5, and 6–8. About 10 minutes, with no prep and no devices.</p>
    </div>
    <div class="controls" role="toolbar" aria-label="Calendar controls">
      <div class="seg" role="group" aria-label="Grade band">${Object.entries(BANDS).map(([k, v]) => `<button type="button" data-band="${k}" aria-pressed="false">${v}</button>`).join('')}</div>
      <div class="btns">
        <button type="button" class="btn" id="calToday">Today</button>
        <button type="button" class="btn" id="calMonthBtn" aria-expanded="false" aria-controls="calMonth">Month</button>
        <button type="button" class="btn" id="calSettingsBtn" aria-expanded="false" aria-controls="calSettings">School calendar</button>
        <button type="button" class="btn btn-go" id="calProject">Project</button>
      </div>
    </div>
  </header>
  <section class="panel" id="calSettings" hidden aria-label="School calendar settings">
    <label for="calStart">First day of school <input type="date" id="calStart" value="${YEAR.start}"></label>
    <label for="calHol"><input type="checkbox" id="calHol" checked> Skip typical Texas holidays and breaks</label>
    <button type="button" class="btn" id="calReset">Reset</button>
    <p class="muted">Week 1 starts on your first day; each following school week gets the next week of writing. Saved in this browser only.</p>
  </section>
  <section class="panel month" id="calMonth" hidden aria-label="Month view"></section>
  <div class="flip-wrap">
    <button type="button" class="flip-nav prev" id="calPrev" aria-label="Previous school day">‹</button>
    <div class="flip" id="calFlip"></div>
    <button type="button" class="flip-nav next" id="calNext" aria-label="Next school day">›</button>
  </div>
  <p class="sr-only" id="calLive" aria-live="polite"></p>
  <p class="help muted">← → turn pages · T jumps to today · swipe on a phone · links like <code>#2026-10-20</code> open that day</p>
  <footer class="foot muted">
    <p><strong>How a week works.</strong> Monday plan, Tuesday draft, Wednesday revise, Thursday quick-write, Friday edit and share. Every prompt also works on its own, so you can skip a day.</p>
    <p><strong>Standards.</strong> Codes refer to the Texas English Language Arts and Reading TEKS (19 TAC §110.2–110.24). In K–5, the writing process is strand (11), genres are (12), and inquiry is (13). In 6–8 they are (10), (11), and (12). Fix It practices oral language (1) and editing for conventions. Sub-letters can vary slightly by grade, so check your grade's chapter.</p>
  </footer>
</main>
<script>window.DW=${JSON.stringify(DATA).replace(/</g, '\\u003c')};</script>
<script>${js}</script>`;

const full = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A school-year flip calendar of Daily Oral Language sentences and TEKS-aligned writing prompts for grades K–2, 3–5, and 6–8.">
</head><body>
${body}
</body></html>
`;
fs.writeFileSync(path.join(ROOT, 'index.html'), full);
const i = process.argv.indexOf('--fragment');
if (i > 0) fs.writeFileSync(process.argv[i + 1], body);
console.log(`index.html: ${contiguous.length} weeks, ${(full.length / 1024).toFixed(0)} KB`);
