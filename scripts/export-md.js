// Writes daily-writing-prompts.md: every week's DOL sentences, fixes, and prompts in one readable file.
const fs = require('fs'), path = require('path');
const { BANDS, PROCESS, DOL, GENRE, processCode } = require('./teks');
const ROOT = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const plan = read('data/plan.json').weeks;
const written = new Map(fs.readdirSync(path.join(ROOT, 'data/weeks')).filter(f => f.endsWith('.json')).sort()
  .flatMap(f => read('data/weeks/' + f).weeks).map(w => [w.week, w]));
const DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const out = ['# Daily Writing a Day: Fix It + Write, 2026–27', '',
  'A Daily Oral Language (DOL) sentence and a TEKS-aligned writing prompt for every school day, grades K–2, 3–5, and 6–8.',
  'Codes refer to the Texas ELAR TEKS (19 TAC §110.2–110.24): K–5 writing process (11), genres (12), inquiry (13); 6–8 writing process (10), genres (11), inquiry (12). Sub-letters can vary slightly by grade.', ''];
for (const p of plan) {
  const w = written.get(p.week); if (!w) continue;
  out.push(`## Week ${p.week} (${p.monday}): ${p.theme} · ${w.title}`, '', w.bigIdea + (p.note ? ` *Note: ${p.note}.*` : ''), '');
  out.push('| Band | Genre | Conventions focus | I can |', '|---|---|---|---|');
  for (const [b, label] of Object.entries(BANDS)) {
    const g = GENRE[p.genre[b]].label[b] ? p.genre[b] : 'correspondence';
    out.push(`| ${label} | ${GENRE[g].label[b]} ${GENRE[g].code[b]} | ${p.conv[b]} | ${w.iCan[b]} |`);
  }
  out.push('');
  w.days.forEach((d, i) => {
    out.push(`### ${DOW[i]}: ${PROCESS[d.kind][0]} · ${d.title}`, '');
    for (const [b, label] of Object.entries(BANDS)) {
      const g = GENRE[p.genre[b]].label[b] ? p.genre[b] : 'correspondence';
      const q = d.dol[b];
      out.push(`**${label}**`, `- Fix It (${q.n} errors): ${q.s}`, `- Fixed: ${q.fix}`, `- Write ${processCode(d.kind, b, g)}: ${d.write[b]}`, '');
    }
    out.push(`*Teacher:* ${d.teacher}`, '');
  });
}
fs.writeFileSync(path.join(ROOT, 'daily-writing-prompts.md'), out.join('\n'));
console.log(`daily-writing-prompts.md: ${written.size} weeks`);
