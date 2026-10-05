// Builds the site from data/plan.json + data/weeks/*.json.
// Writes index.html (month calendar) and day/index.html (day pages). Usage: node scripts/build.js [--fragment dir]
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

const asset = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Big+Shoulders+Display:wght@700;900&family=Bitter:wght@500;700;800&display=swap">`;
const bandSeg = `<div class="seg" role="group" aria-label="Grade band">${Object.entries(BANDS).map(([k, v]) => `<button type="button" data-band="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`;
const brand = `<div class="brand">
      <p class="eyebrow">Fix It + Write · ${esc(YEAR.label)} · ${contiguous.length} weeks of writing</p>
      <h1>Daily Writing a Day</h1>
      <p class="lede">One editing sentence and one writing prompt for every school day, for grades K–2, 3–5, and 6–8. About 10 minutes, with no prep and no devices.</p>
    </div>`;
const settings = `<section class="panel" id="calSettings" hidden aria-label="School calendar settings">
    <label for="calStart">First day of school <input type="date" id="calStart" value="${YEAR.start}"></label>
    <label for="calHol"><input type="checkbox" id="calHol" checked> Skip typical Texas holidays and breaks</label>
    <button type="button" class="btn" id="calReset">Reset</button>
    <p class="muted">Week 1 starts on your first day; each following school week gets the next week of writing. Saved in this browser for both the calendar and the day pages.</p>
  </section>`;
const NAV = [['', 'Calendar'], ['day/', 'Today'], ['guide/', 'Guide'], ['teks/', 'TEKS'], ['elps/', 'ELPS'], ['sst/', 'SST'], ['udl/', 'UDL'], ['about/', 'About']];
const sitenav = (root, cur) => `<nav class="sitenav" aria-label="Site"><a class="sn-home" href="${root || './'}">Daily Writing a Day</a><span class="sn-links">${NAV.map(([p, l]) => `<a href="${root}${p}"${l === cur ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</span></nav>`;
const sitefoot = root => `<p class="credit">Daily Writing a Day © 2026 TCEA, created by Miguel Guhlin · Content <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a> · Code MIT · <a href="${root}about/">Licensing &amp; provenance</a></p>`;
const footer = root => `<footer class="foot muted">
    <p><strong>How a week works.</strong> Monday plan, Tuesday draft, Wednesday revise, Thursday quick-write, Friday edit and share. Every prompt also works on its own, so you can skip a day.</p>
    <p><strong>Standards.</strong> Codes refer to the Texas English Language Arts and Reading TEKS (19 TAC §110.2–110.24). In K–5, the writing process is strand (11), genres are (12), and inquiry is (13). In 6–8 they are (10), (11), and (12). Fix It practices oral language (1) and editing for conventions. Sub-letters can vary slightly by grade, so check your grade's chapter. <a href="${root}teks/">Full TEKS alignment</a> · <a href="${root}elps/">ELPS</a> · <a href="${root}sst/">SST</a> · <a href="${root}udl/">UDL</a></p>
    ${sitefoot(root)}
  </footer>`;

// ---- month calendar (front page): titles only, no prompt text ----
const MONTH = { ...DATA, weeks: contiguous.map(w => ({ week: w.week, theme: w.theme, bands: Object.fromEntries(Object.entries(w.bands).map(([b, x]) => [b, { genre: x.genre, conv: x.conv }])), days: w.days.map(d => ({ kind: d.kind, title: d.title })) })) };
const monthBody = `<title>Daily Writing a Day</title>
${fonts}
<style>${asset('page.css')}${asset('month.css')}</style>
<a class="skip" href="#mSheet">Skip to the calendar</a>
<main class="wrap">
  ${sitenav('', 'Calendar')}
  <header class="top">
    ${brand}
    <div class="controls" role="toolbar" aria-label="Calendar controls">
      ${bandSeg}
      <div class="btns">
        <button type="button" class="btn" id="mThisMonth">This month</button>
        <button type="button" class="btn" id="calSettingsBtn" aria-expanded="false" aria-controls="calSettings">School calendar</button>
        <a class="btn btn-go" id="mTodayLink" href="day/">Today's page →</a>
      </div>
    </div>
  </header>
  ${settings}
  <nav class="mtabs" id="mTabs" aria-label="Months"></nav>
  <div class="mc-wrap">
    <button type="button" class="flip-nav prev" id="mPrev" aria-label="Previous month">‹</button>
    <div class="mc-sheet" id="mSheet"></div>
    <button type="button" class="flip-nav next" id="mNext" aria-label="Next month">›</button>
  </div>
  <p class="sr-only" id="mLive" aria-live="polite"></p>
  <p class="help muted">Pick a day to open its page · ← → flip months · T goes to this month · striped days are holidays and breaks</p>
  ${footer('')}
</main>
<script>window.DW=${json(MONTH)};</script>
<script>${asset('core.js')}</script>
<script>${asset('month.js')}</script>`;

// ---- day pages (flipbook) ----
const dayBody = `<title>Daily Writing a Day</title>
${fonts}
<style>${asset('page.css')}</style>
<a class="skip" href="#calFlip">Skip to today's page</a>
<main class="wrap">
  ${sitenav('../', 'Today')}
  <header class="top">
    ${brand}
    <div class="controls" role="toolbar" aria-label="Calendar controls">
      ${bandSeg}
      <div class="btns">
        <a class="btn" id="calMonthLink" href="../">← Month</a>
        <button type="button" class="btn" id="calToday">Today</button>
        <button type="button" class="btn" id="calSettingsBtn" aria-expanded="false" aria-controls="calSettings">School calendar</button>
        <button type="button" class="btn btn-go" id="calProject">Project</button>
      </div>
    </div>
  </header>
  ${settings}
  <div class="flip-wrap">
    <button type="button" class="flip-nav prev" id="calPrev" aria-label="Previous school day">‹</button>
    <div class="flip" id="calFlip"></div>
    <button type="button" class="flip-nav next" id="calNext" aria-label="Next school day">›</button>
  </div>
  <p class="sr-only" id="calLive" aria-live="polite"></p>
  <p class="help muted">← → turn pages · T jumps to today · swipe on a phone · links like <code>day/#2026-10-20</code> open that day</p>
  ${footer('../')}
</main>
<script>window.DW=${json(DATA)};</script>
<script>${asset('core.js')}</script>
<script>${asset('page.js')}</script>`;

const wrapDoc = (body, desc) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${esc(desc)}">
</head><body>
${body}
</body></html>
`;
const out = (rel, html) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); return `${rel} ${(html.length / 1024).toFixed(0)} KB`; };
console.log(`${contiguous.length} weeks:`,
  out('index.html', wrapDoc(monthBody, 'A month-by-month calendar of Daily Oral Language sentences and TEKS-aligned writing prompts for grades K–2, 3–5, and 6–8, 2026–27.')), '·',
  out('day/index.html', wrapDoc(dayBody, 'Today’s Fix It sentence and writing prompt for grades K–2, 3–5, and 6–8, aligned to the Texas ELAR TEKS.')));
// ---- teacher pages ----
for (const pg of require('./docs')({ plan, esc })) {
  const body = `<title>${esc(pg.title)} · Daily Writing a Day</title>
${fonts}
<style>${asset('page.css')}${asset('doc.css')}</style>
<a class="skip" href="#main">Skip to content</a>
<main class="wrap">
  ${sitenav('../', pg.nav)}
  <article class="doc" id="main">${pg.body}</article>
  <footer class="foot muted">${sitefoot('../')}</footer>
</main>`;
  console.log('  ' + out(`${pg.dir}/index.html`, wrapDoc(body, pg.desc)));
}
// --fragment <dir>: body-only copies (no doctype/head) for previewing as an Artifact
const i = process.argv.indexOf('--fragment');
if (i > 0) { fs.writeFileSync(path.join(process.argv[i + 1], 'month.html'), monthBody); fs.writeFileSync(path.join(process.argv[i + 1], 'day.html'), dayBody); }
