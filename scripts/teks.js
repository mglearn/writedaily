// TEKS codes for the 2017 English Language Arts and Reading TEKS (19 TAC §110.2–110.24).
// K–5 share one strand numbering (writing process 11, genres 12, inquiry 13);
// 6–8 shift down one (writing process 10, genres 11, inquiry 12). Sub-letters can
// differ slightly by grade, so the page tells teachers to check their grade's chapter.
const BANDS = { k2: 'K–2', g35: '3–5', g68: '6–8' };
const PROCESS = {
  // day kind -> [label, K-5 code, 6-8 code]
  plan: ['Plan', '(11)(A)', '(10)(A)'],
  draft: ['Draft', '(11)(B)', '(10)(B)'],
  revise: ['Revise', '(11)(C)', '(10)(C)'],
  'quick-write': ['Quick-write', null, null], // uses the week's genre code
  'edit-share': ['Edit & share', '(11)(D), (11)(E)', '(10)(D), (10)(E)'],
};
const DOL = { k2: '(1), (11)(D)', g35: '(1), (11)(D)', g68: '(1), (10)(D)' };
const GENRE = {
  narrative: { label: { k2: 'Personal narrative', g35: 'Personal narrative', g68: 'Personal narrative' }, code: { k2: '(12)(A)', g35: '(12)(A)', g68: '(11)(A)' } },
  fiction: { label: { k2: 'Story', g35: 'Fiction', g68: 'Fiction' }, code: { k2: '(12)(A)', g35: '(12)(A)', g68: '(11)(A)' } },
  poetry: { label: { k2: 'Poem', g35: 'Poetry', g68: 'Poetry' }, code: { k2: '(12)(A)', g35: '(12)(A)', g68: '(11)(A)' } },
  informational: { label: { k2: 'All-about writing', g35: 'Informational writing', g68: 'Informational essay' }, code: { k2: '(12)(B)', g35: '(12)(B)', g68: '(11)(B)' } },
  procedural: { label: { k2: 'How-to writing', g35: 'How-to (procedural) writing', g68: 'Procedural writing' }, code: { k2: '(12)(B)', g35: '(12)(B)', g68: '(11)(B)' } },
  argument: { label: { g35: 'Opinion essay', g68: 'Argumentative writing' }, code: { g35: '(12)(C)', g68: '(11)(C)' } },
  correspondence: { label: { k2: 'Letter', g35: 'Letter', g68: 'Letter' }, code: { k2: '(12)(C)', g35: '(12)(D)', g68: '(11)(D)' } },
  research: { label: { k2: 'Wonder & research', g35: 'Research writing', g68: 'Research writing' }, code: { k2: '(13)', g35: '(13)', g68: '(12)' } },
};
const KINDS = ['plan', 'draft', 'revise', 'quick-write', 'edit-share'];
const processCode = (kind, band, genre) => {
  if (kind === 'quick-write') return GENRE[genre].code[band];
  return PROCESS[kind][band === 'g68' ? 2 : 1];
};
module.exports = { BANDS, PROCESS, DOL, GENRE, KINDS, processCode };
