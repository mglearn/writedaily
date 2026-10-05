// Validates data/weeks/*.json against data/plan.json and data/WRITING.md.
// Usage: node scripts/validate.js [--strict]   (strict = DOL count mismatches fail too)
const fs = require('fs'), path = require('path');
const { KINDS } = require('./teks');
const ROOT = path.join(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/plan.json'), 'utf8')).weeks;
const strict = process.argv.includes('--strict');
const errors = [], warns = [];
const BANDS = ['k2', 'g35', 'g68'];
const LIMITS = { k2: [2, 3, 12], g35: [3, 4, 22], g68: [3, 5, 30] };
const BAD = /\b(TODO|TBD|lorem|ipsum|XXX)\b|\[(Name|name|Topic|topic)\]/;

// token-level edit distance: a missing capital, mark, or word is one edit
const toks = s => s.match(/[\p{L}\p{N}’']+|[^\s\p{L}\p{N}]/gu) || [];
function dist(a, b) {
  const x = toks(a), y = toks(b), d = Array.from({ length: x.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return d[x.length][y.length];
}
const words = s => (s.match(/[\p{L}\p{N}’']+/gu) || []).length;

const dir = path.join(ROOT, 'data/weeks');
const files = fs.readdirSync(dir).filter(f => /^weeks-\d\d-\d\d\.json$/.test(f)).sort();
const seen = new Map(), titles = new Map();
for (const f of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { errors.push(`${f}: bad JSON: ${e.message}`); continue; }
  const [, a, b] = f.match(/weeks-(\d\d)-(\d\d)/).map(Number);
  for (const w of data.weeks || []) {
    const at = `${f} week ${w.week}`;
    if (!plan.find(p => p.week === w.week)) { errors.push(`${at}: not in plan`); continue; }
    if (w.week < a || w.week > b) errors.push(`${at}: outside file range`);
    if (seen.has(w.week)) errors.push(`${at}: duplicate (also in ${seen.get(w.week)})`); seen.set(w.week, f);
    const need = (v, name, min = 8) => { if (typeof v !== 'string' || v.trim().length < min) errors.push(`${at}: ${name} missing/short`); else if (BAD.test(v)) errors.push(`${at}: ${name} looks like a placeholder`); };
    need(w.title, 'title', 3); need(w.bigIdea, 'bigIdea', 30);
    for (const bd of BANDS) need(w.iCan && w.iCan[bd], `iCan.${bd}`, 15);
    if (!Array.isArray(w.days) || w.days.length !== 5) { errors.push(`${at}: needs exactly 5 days`); continue; }
    w.days.forEach((d, i) => {
      const dt = `${at} day ${i + 1}`;
      if (d.kind !== KINDS[i]) errors.push(`${dt}: kind should be ${KINDS[i]}, got ${d.kind}`);
      need(d.title, `day ${i + 1} title`, 3); need(d.teacher, `day ${i + 1} teacher`, 25);
      const tk = (d.title || '').toLowerCase(); if (titles.has(tk)) warns.push(`${dt}: title repeats ${titles.get(tk)}`); titles.set(tk, dt);
      for (const bd of BANDS) {
        need(d.write && d.write[bd], `day ${i + 1} write.${bd}`, 20);
        const q = d.dol && d.dol[bd];
        if (!q || typeof q.s !== 'string' || typeof q.fix !== 'string' || !Number.isInteger(q.n)) { errors.push(`${dt}: dol.${bd} needs s, fix, n`); continue; }
        const [lo, hi, maxW] = LIMITS[bd];
        if (q.s === q.fix) errors.push(`${dt}: dol.${bd} s equals fix`);
        if (q.n < lo || q.n > hi) errors.push(`${dt}: dol.${bd} n=${q.n} outside ${lo}–${hi}`);
        if (words(q.s) > maxW) warns.push(`${dt}: dol.${bd} is ${words(q.s)} words (max ${maxW})`);
        if (!/^[\p{Lu}"“¿¡]/u.test(q.fix.replace(/^\*/, ''))) errors.push(`${dt}: dol.${bd} fix should start with a capital`);
        if (!/[.?!]["”’*)]?$/.test(q.fix)) errors.push(`${dt}: dol.${bd} fix should end with . ? or !`);
        if (/\*\*/.test(q.s + q.fix)) errors.push(`${dt}: dol.${bd} uses bold markdown`);
        const e = dist(q.s.replace(/\*/g, ''), q.fix.replace(/\*/g, ''));
        if (e === 0) errors.push(`${dt}: dol.${bd} only differs in markdown`);
        else if (e !== q.n) (Math.abs(e - q.n) > 2 || strict ? errors : warns).push(`${dt}: dol.${bd} n=${q.n} but ${e} token edits — "${q.s}" → "${q.fix}"`);
      }
    });
  }
}
const missing = plan.map(p => p.week).filter(w => !seen.has(w));
if (missing.length) warns.push(`weeks not written yet: ${missing.join(', ')}`);
warns.forEach(w => console.log('warn  ' + w));
errors.forEach(e => console.log('ERROR ' + e));
console.log(`${files.length} files, ${seen.size}/${plan.length} weeks, ${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
