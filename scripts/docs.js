// Teacher pages: Guide, TEKS, ELPS, SST, UDL, About (licensing & provenance).
// Returns [{ dir, nav, title, desc, body }]; build.js wraps each in the site layout.
// Standards text is paraphrased for planning, never reproduced; each page says where to confirm it.
const { BANDS, PROCESS, GENRE } = require('./teks');

module.exports = function docs({ plan, esc }) {
  const B = Object.keys(BANDS);
  const genreOf = (p, b) => (GENRE[p.genre[b]].label[b] ? p.genre[b] : 'correspondence');   // K–2 argument weeks are letters
  const fmtDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const KINDS = Object.keys(PROCESS);
  const DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const table = (head, rows, cls = '') => `<div class="tbl"><table class="${cls}"><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const note = s => `<p class="callout">${s}</p>`;
  const pages = [];

  // ---------------- Guide ----------------
  pages.push({ dir: 'guide', nav: 'Guide', title: 'Teacher Guide', desc: 'How to run the 10-minute Fix It + Write routine with the Daily Writing a Day calendar.', body: `
<h1>Teacher Guide</h1>
<p class="lede">Ten minutes a day: one sentence to fix out loud, one prompt to write. Here is how to run it, and how the year is put together.</p>

<h2>The daily routine</h2>
${table(['Step', 'Time', 'What happens'], [
    ['1. Project', '30 sec', 'Open <a href="../day/">today\'s page</a>, choose your grade band, and press <b>Project</b>. Teacher notes and TEKS codes hide on the projector.'],
    ['2. Fix It alone', '1–2 min', 'Students copy the sentence and fix it in their notebook or on a whiteboard. The page tells them how many errors to find.'],
    ['3. Fix It together', '1–2 min', 'Partners compare. Then students say each fix and <em>why</em> ("<i>Monday</i> needs a capital because it is the name of a day."). Open <b>Show the fix</b>; the red pen marks every change.'],
    ['4. Write', '5–8 min', 'Read the prompt aloud. Students write in the same notebook. K–2 students may draw first or dictate.'],
    ['5. Share (Fridays)', '2–3 min', 'Students read a piece aloud and rate themselves 1–4 fingers on the week\'s "I can" statement.'],
  ])}
<p>Keep one writing notebook for the whole routine. By Friday each student has a week of drafts to choose from, and by May they have a year of writing.</p>

<h2>The weekly rhythm</h2>
<p>Every week has one theme, one genre, and one conventions focus per band. The days follow the writing process, but every prompt also works on its own, so a holiday or an absence never breaks the week.</p>
${table(['Day', 'Write', 'Fix It'], [
    ['Monday', '<b>Plan</b>: list, web, sketch, or talk to find an idea in the week\'s genre.', 'The week\'s focus, plus review'],
    ['Tuesday', '<b>Draft</b> one part: a beginning, a paragraph, a stanza, a claim and reason.', 'The week\'s focus, plus review'],
    ['Wednesday', '<b>Revise</b> a weak model sentence with one named craft move, then do the same to your own draft.', 'The week\'s focus, plus review'],
    ['Thursday', '<b>Quick-write</b> a fresh topic in the same genre, fast.', 'The week\'s focus, plus review'],
    ['Friday', '<b>Edit &amp; share</b>: edit one piece for the week\'s convention, then share it.', 'Two sentences reviewing the week\'s focus'],
  ])}

<h2>Fixing the calendar to your district</h2>
<ul>
  <li><b>School calendar</b> (on the calendar and day pages) sets your first day of school. Week 1 starts that day, and each following school week gets the next week of writing.</li>
  <li><b>Skip typical Texas holidays and breaks</b> is on by default (Labor Day, Thanksgiving week, winter break, MLK Day, Presidents' Day, spring break, Good Friday). Turn it off if your district is different and you would rather skip days by hand.</li>
  <li>When a Monday is a holiday, that week starts on Tuesday's draft. Monday's plan is still on the calendar if you want to use it.</li>
  <li>Settings and your grade band are saved in your browser only.</li>
</ul>

<h2>Differentiating with the grade bands</h2>
<p>The same day exists in three versions: K–2, 3–5, and 6–8. They share a theme, so a teacher can project one band and hand another band's version to a small group. A fourth grader still working on capital letters can do the K–2 Fix It and the 3–5 prompt. See <a href="../udl/">UDL</a> and <a href="../elps/">ELPS</a> for more supports.</p>

<h2>Grading lightly</h2>
<p>Fix It is practice, not a quiz: count participation, not right answers. Collect Friday pieces every few weeks and look at two things: the week's convention used correctly in the student's own writing, and the week's genre features. That evidence is also what the <a href="../sst/">SST</a> checkpoints will ask for.</p>

<h2>Shortcuts</h2>
<ul>
  <li><b>← →</b> turn pages and months; <b>T</b> jumps to today; swipe on a phone.</li>
  <li>Every month and day has its own link to share: <code>writedaily/#2026-10</code>, <code>writedaily/day/#2026-10-05</code>.</li>
  <li>All prompts and answer keys are also in one long, printable file: <a href="https://github.com/mglearn/writedaily/blob/main/daily-writing-prompts.md">daily-writing-prompts.md</a>.</li>
</ul>` });

  // ---------------- TEKS ----------------
  const strandRows = [
    ['Fix It (daily)', '(1) oral language · (11)(D) edit for conventions', '(1) oral language · (11)(D) edit for conventions', '(1) oral language · (10)(D) edit for conventions'],
    ...KINDS.map((k, i) => {
      const genres = { k2: '(12)(A)–(C)', g35: '(12)(A)–(D)', g68: '(11)(A)–(D)' };
      const q = b => (k === 'quick-write' ? `genre of the week: ${genres[b]}` : PROCESS[k][b === 'g68' ? 2 : 1]);
      return [`${DOW[i]}: ${PROCESS[k][0]}`, q('k2'), q('g35'), q('g68')];
    }),
    ['Friday "I can"', '(11)(E) share · self-assessment', '(11)(E) publish · self-assessment', '(10)(E) publish · self-assessment'],
  ];
  const genreCount = b => {
    const n = {}; plan.forEach(p => { const g = genreOf(p, b); const l = `${GENRE[g].label[b]} ${GENRE[g].code[b]}`; n[l] = (n[l] || 0) + 1; });
    return Object.entries(n).sort((a, z) => z[1] - a[1]).map(([l, c]) => `<li>${esc(l)}: <b>${c}</b> week${c > 1 ? 's' : ''}</li>`).join('');
  };
  const weekRows = plan.map(p => [
    `<span class="wk">Week ${p.week}</span><span class="dt">${fmtDate(p.monday)}</span>`,
    `<b>${esc(p.theme)}</b>${p.note ? `<br><span class="muted">${esc(p.note)}</span>` : ''}`,
    ...B.map(b => { const g = genreOf(p, b); return `${esc(GENRE[g].label[b])} <span class="code">${GENRE[g].code[b]}</span><br><span class="conv">${esc(p.conv[b])}</span>`; }),
  ]);
  pages.push({ dir: 'teks', nav: 'TEKS', title: 'TEKS Alignment', desc: 'How Daily Writing a Day aligns to the Texas ELAR TEKS writing strands, with the full week-by-week scope and sequence.', body: `
<h1>TEKS Alignment</h1>
<p class="lede">Daily Writing a Day is aligned to the writing and oral-language strands of the Texas English Language Arts and Reading TEKS (19 TAC Chapter 110, Subchapters A and B), adopted in 2017.</p>
${note('Codes are aligned to, not reproduced from, the official standards. K–5 share one strand numbering and 6–8 shift down by one, but sub-letters can vary slightly by grade. Confirm against your grade\'s chapter (§110.2–§110.7 for K–5, §110.22–§110.24 for 6–8) before adopting.')}

<h2>Where the strands show up</h2>
<p>In K–5, the writing process is strand (11), genres are (12), and inquiry and research is (13). In 6–8, the same strands are (10), (11), and (12). Oral language is strand (1) in every grade.</p>
${table(['Part of the day', 'K–2', '3–5', '6–8'], strandRows)}
<dl class="defs">
  <dt>(1) Oral language</dt><dd>Students listen actively, speak clearly, and work with others. Fix It is done out loud: students explain each fix to a partner and the class.</dd>
  <dt>(11)(A) / (10)(A) Plan</dt><dd>Generate ideas and plan a draft for a chosen genre and purpose (K–2: through drawing and discussion).</dd>
  <dt>(11)(B) / (10)(B) Draft</dt><dd>Develop drafts into a focused, structured, coherent piece with an engaging idea and details.</dd>
  <dt>(11)(C) / (10)(C) Revise</dt><dd>Revise for clarity, word choice, and sentence structure by adding, deleting, combining, and rearranging.</dd>
  <dt>(11)(D) / (10)(D) Edit</dt><dd>Edit drafts using standard English conventions: complete sentences, verbs, nouns and pronouns, modifiers, conjunctions, capitalization, punctuation, and spelling. This is the daily Fix It focus.</dd>
  <dt>(11)(E) / (10)(E) Publish</dt><dd>Publish or share writing for an appropriate audience. This is Friday's share.</dd>
  <dt>(12) / (11) Genres</dt><dd>(A) literary texts: personal narrative, fiction, poetry. (B) informational texts, including procedural writing. (C) argumentative texts: opinion essays in 3–5, argumentative essays in 6–8; correspondence in K–2. (D) correspondence such as letters in 3–8.</dd>
  <dt>(13) / (12) Inquiry and research</dt><dd>Generate questions, find and record information from sources, and share what was learned. Week 33 is the research week.</dd>
</dl>

<h2>Genres across the year</h2>
<div class="cols3">${B.map(b => `<section><h3>${BANDS[b]}</h3><ul>${genreCount(b)}</ul></section>`).join('')}</div>

<h2>Scope and sequence</h2>
<p>Each band's genre (with its TEKS code) and Fix It conventions focus for every week. Dates assume the typical Texas 2026–27 calendar that the site uses by default.</p>
${table(['Week', 'Theme', 'K–2', '3–5', '6–8'], weekRows, 'scope')}
<p class="muted">Every Fix It item also reviews conventions from earlier weeks, so the sequence spirals. Weeks 35–37 are mixed review.</p>` });

  // ---------------- ELPS ----------------
  const elpsRows = [
    ['Fix It', '<b>5(D)</b> edit writing for standard grammar and usage, including subject–verb agreement, pronoun agreement, and verb tenses<br><b>5(C)</b> spell familiar words, using English spelling patterns and rules<br><b>5(E)</b> use increasingly complex grammatical structures<br><b>1(B)</b> monitor language and use self-corrective techniques<br><b>3(E)</b> share information in cooperative learning interactions'],
    ['Monday: Plan', '<b>1(A)</b> use prior knowledge and experiences<br><b>1(C)</b> use strategic learning techniques such as concept mapping and drawing<br><b>3(G)</b> express ideas and opinions'],
    ['Tuesday: Draft', '<b>5(B)</b> write using newly acquired basic and grade-level vocabulary<br><b>5(G)</b> narrate, describe, and explain with increasing specificity and detail'],
    ['Wednesday: Revise', '<b>5(F)</b> write using a variety of sentence lengths, patterns, and connecting words<br><b>1(E)</b> internalize new language by using and reusing it in speaking and writing'],
    ['Thursday: Quick-write', '<b>5(B)</b>, <b>5(G)</b>; fluency in a familiar genre'],
    ['Friday: Edit &amp; share', '<b>5(D)</b> edit for grammar and usage<br><b>3(H)</b> narrate, describe, and explain orally<br><b>2(I)</b> show listening comprehension by responding to a classmate\'s piece'],
    ['Letter weeks, week 32', '<b>1(G)</b> distinguish formal and informal English and use each when appropriate<br><b>3(I)</b> adapt spoken language for formal and informal purposes'],
  ];
  const levels = [
    ['Beginning', 'Copies words and short patterned sentences; relies on drawing and the home language.', 'Read the sentence aloud twice and chorally. Point to each error spot ("Look here: what does a sentence start with?"). Accept a fix shown with editing marks, not words.', 'Draw first, then label. Give a sentence frame for the prompt and a theme word bank. Writing in the home language is fine for Monday\'s plan.'],
    ['Intermediate', 'Writes simple sentences with high-frequency words; errors in verb forms, plurals, and word order.', 'Give the error count and a hint about the focus. Frame the talk: "I changed ___ to ___ because ___."', 'Two-part frames ("First… Then…"). Partner talk before writing. Accept invented spelling on drafts.'],
    ['Advanced', 'Writes connected sentences on familiar topics; errors with complex structures.', 'Partners find the errors without hints, then explain the rule. Ask which fix matters most to a reader.', 'Ask for one connecting word and one detail. Point to the Wednesday craft move as a model.'],
    ['Advanced high', 'Writes at or near grade level with occasional errors.', 'Ask students to write a new sentence with the same error for a partner to fix.', 'Full prompt with the band above as a stretch. Focus feedback on precision and audience.'],
  ];
  pages.push({ dir: 'elps', nav: 'ELPS', title: 'ELPS Supports', desc: 'Using Daily Writing a Day with emergent bilingual students, aligned to the Texas English Language Proficiency Standards.', body: `
<h1>ELPS Supports</h1>
<p class="lede">How to use the daily Fix It and Write routine with emergent bilingual (EB) students, aligned to the Texas English Language Proficiency Standards (19 TAC §74.4).</p>
${note('<b>Start from assets.</b> Students bring a home language, cultural knowledge, and a lifetime of stories. Fix It teaches the conventions of standard written English for school and public audiences. It is never a correction of how a family speaks.')}

<h2>The routine is already a language routine</h2>
<p>Every day students <b>listen</b> to a sentence read aloud, <b>speak</b> to explain a fix, <b>read</b> a prompt, and <b>write</b>. That covers all four ELPS domains in ten minutes. The ELPS cross-curricular student expectations below are paraphrased and keyed to their numbers in §74.4(c).</p>
${table(['Part of the day', 'ELPS student expectations it practices'], elpsRows)}

<h2>Supporting each proficiency level</h2>
<p>These are the ELPS proficiency levels used by TELPAS. A student may be at different levels in different domains, so match the support to the writing level. Every student does the same thinking; only the support changes.</p>
${table(['Level', 'What you may see in writing', 'Fix It support', 'Write support'], levels)}

<h2>Cross-language notes for the Fix It focus</h2>
<p>Some conventions work differently in other languages. Naming the difference helps students transfer what they know instead of treating it as a mistake.</p>
<ul>
  <li><b>Capitalizing days, months, and languages</b> (weeks 13, 22): Spanish, French, and Portuguese write <i>lunes</i>, <i>octubre</i>, <i>español</i> in lowercase. English capitalizes them.</li>
  <li><b>Plural nouns</b> (weeks 5, 21): Vietnamese, Chinese, and Korean usually don't mark plurals on the noun. Expect "two dog" and teach the <i>-s</i> as the signal English uses.</li>
  <li><b>Past tense</b> (weeks 9, 12): Vietnamese and Chinese show time with words like <i>yesterday</i>, not verb endings. Point to the time word in the sentence, then to the <i>-ed</i>.</li>
  <li><b>Sentence fragments</b> (week 1): Spanish can drop the subject (<i>Fue al parque</i>). English needs it: <i>He went to the park.</i></li>
  <li><b>Adjectives</b> (weeks 6, 23): Spanish often puts the adjective after the noun (<i>perro grande</i>); English puts it before (<i>big dog</i>).</li>
  <li><b>Question and exclamation marks</b> (weeks 2, 10, 31): Spanish opens with <i>¿</i> and <i>¡</i>. English uses only the closing mark.</li>
  <li><b>Cognates</b> help with spelling and vocabulary in Spanish: <i>familia/family</i>, <i>animal/animal</i>, <i>información/information</i>. Watch for false friends such as <i>embarazada</i>.</li>
</ul>

<h2>Five quick wins</h2>
<ul>
  <li><b>Read everything aloud.</b> The sentence, the prompt, and the fix. Listening comes before writing.</li>
  <li><b>Post a word bank</b> for the week's theme on Monday and add to it all week.</li>
  <li><b>Pair thoughtfully.</b> A partner who shares the home language can help with Monday's plan; an English-proficient partner can help with Friday's edit.</li>
  <li><b>Let planning happen in any language.</b> Ideas first, English second.</li>
  <li><b>Use the band toggle.</b> The K–2 version of the same day is a ready-made scaffold for older newcomers.</li>
</ul>
<p class="cite">Standards: Texas Education Agency, <i>English Language Proficiency Standards</i>, 19 TAC §74.4. Student expectations are summarized and paraphrased for planning; they are not a substitute for the official standards. Confirm current TEA guidance before adoption.</p>` });

  // ---------------- SST ----------------
  pages.push({ dir: 'sst', nav: 'SST', title: 'Student Success Tool', desc: 'How Daily Writing a Day builds the editing, revising, and extended writing that the Texas Student Success Tool (SST) will assess.', body: `
<h1>Preparing for the Student Success Tool</h1>
<p class="lede">Texas is replacing STAAR with the Student Success Tool (SST). Daily Writing a Day builds the writing it will ask for, a few minutes at a time, all year.</p>

<h2>The timeline</h2>
<ul>
  <li><b>STAAR stays in place through 2026–27</b>, the year this calendar covers.</li>
  <li>Under House Bill 8, <b>SST begins in 2027–28</b> with beginning-of-year (BOY), middle-of-year (MOY), and end-of-year (EOY) assessments. Grades 3–8 use all three checkpoints.</li>
  <li>BOY and MOY are adaptive. EOY is static, so its questions can be released.</li>
  <li><b>RLA writing has its own April window</b>, before other EOY testing in May. Results must reach districts within two business days after a window closes.</li>
</ul>
<p>Details and the current draft blueprints are on TEA's <a href="https://tea.texas.gov/data-reports/student-assessment-overview/house-bill-8-student-assessment">House Bill 8 Student Assessment page</a>. See the draft <a href="https://tea.texas.gov/data-reports/staar/sst-3-rla-summative-blueprint.pdf">Grade 3 RLA blueprint</a> for an example.</p>

<h2>What the RLA blueprints ask for</h2>
<p>The RLA blueprints group assessed TEKS into two reporting strands, <b>reading</b> and <b>writing</b>. BOY and MOY use inline-choice, multipart, multiple-choice, and multiselect questions. The EOY summative adds an <b>extended constructed response</b>. Regular evidence-based writing, revision, and editing prepare students for that better than a late burst of test practice.</p>
${table(['SST asks students to…', 'Where Daily Writing a Day practices it'], [
    ['Choose the correct form of a word or punctuation in a sentence (inline choice, multiple choice)', '<b>Fix It</b>, every day. The week\'s focus plus spiraled review covers capitalization, punctuation, verb forms, agreement, and commonly confused words.'],
    ['Pick the best way to revise a sentence or paragraph for clarity, detail, or transitions', '<b>Wednesday revise</b>: a weak model and one named craft move, such as combining sentences, adding a transition, or replacing a vague word.'],
    ['Find every error or every strong choice (multiselect)', 'Fix It tells students how many errors to find, which builds the habit of searching the whole sentence.'],
    ['Write an extended constructed response with a clear idea, organization, and evidence', '<b>The week\'s genre cycle</b>: informational and argument weeks move from plan to draft to revision. The research week (33) practices using and citing sources.'],
    ['Edit their own writing', '<b>Friday edit &amp; share</b>: students edit their own piece for the week\'s convention.'],
  ])}
${note('<b>K–2:</b> SST starts in grade 3. The K–2 band builds the foundation it depends on: complete sentences, capitals and end marks, and the habit of planning, drafting, and sharing.')}

<h2>Three checkpoints, one teaching loop</h2>
<p>When SST arrives, its checkpoints line up with places already in this calendar. You can practice the loop this year with Friday pieces.</p>
${table(['Checkpoint', 'Teacher move', 'Use from this calendar'], [
    ['BOY', 'Find a baseline and unfinished learning', 'Friday pieces from weeks 2–4: complete sentences, capitals and end marks, and a first narrative and informational piece.'],
    ['MOY', 'Regroup, reteach, and adjust scaffolds', 'Weeks 18–19 (January): run-ons, complex and compound sentences, and the first argument week of the spring.'],
    ['EOY', 'Check mastery and growth; tell the next teacher', 'Weeks 34–37 (May): fragments and run-ons review, then mixed review across the whole year.'],
  ])}

<h2>Make the thinking visible with ACE</h2>
<p>The <a href="https://mglearn.github.io/activities/sst/">ACE the SST</a> routine from the Learning Activities Hub fits the Friday share:</p>
<ul>
  <li><b>Articulate:</b> read one sentence you fixed and say what you changed.</li>
  <li><b>Connect:</b> name the rule or craft move behind it.</li>
  <li><b>Extend:</b> how would the sentence change for a different reader or genre?</li>
</ul>
<p class="cite">SST details are summarized from TEA's House Bill 8 Student Assessment resources and the Learning Activities Hub roadmap <i>From STAAR to SST</i>. Blueprints are drafts: confirm current TEA guidance, and keep teaching every student expectation in full, not only those on a blueprint.</p>` });

  // ---------------- UDL ----------------
  const udl = (h, sub, areas, apply) => `<section class="udl"><h2>${h}</h2><p class="muted">${sub}</p><div class="cols3">${areas.map(([t, items]) => `<div><h3>${t}</h3><ul>${items.map(([s, n]) => `<li>${s} <b>(${n})</b></li>`).join('')}</ul></div>`).join('')}</div><div class="apply"><b>In this calendar:</b><ul>${apply.map(a => `<li>${a}</li>`).join('')}</ul></div></section>`;
  pages.push({ dir: 'udl', nav: 'UDL', title: 'UDL Supports', desc: 'Universal Design for Learning (CAST UDL Guidelines 3.0) supports for the Daily Writing a Day routine.', body: `
<h1>UDL Supports</h1>
<p class="lede">Practical ways to open the daily Fix It and Write routine to every learner, organized by the three principles of the CAST Universal Design for Learning Guidelines 3.0.</p>
${note('<b>The goal of UDL is learner agency</b>: learners who are purposeful and reflective, resourceful and authentic, and strategic and action-oriented. Design for the edges and the whole class benefits.')}
${udl('Multiple Means of Engagement', 'The "why" of learning: recruit interest, sustain effort, and support self-regulation.', [
    ['Welcoming interests and identities', [['Optimize choice and autonomy', '7.1'], ['Optimize relevance, value, and authenticity', '7.2'], ['Nurture joy and play', '7.3'], ['Address biases, threats, and distractions', '7.4']]],
    ['Sustaining effort and persistence', [['Clarify the meaning and purpose of goals', '8.1'], ['Optimize challenge and support', '8.2'], ['Foster collaboration, interdependence, and collective learning', '8.3'], ['Foster belonging and community', '8.4'], ['Offer action-oriented feedback', '8.5']]],
    ['Emotional capacity', [['Recognize expectations, beliefs, and motivations', '9.1'], ['Develop awareness of self and others', '9.2'], ['Promote individual and collective reflection', '9.3'], ['Cultivate empathy and restorative practices', '9.4']]],
  ], [
    'Most prompts offer a choice: "use Monday\'s idea, or…" <b>(7.1)</b>. Themes come from students\' lives and Texas places <b>(7.2)</b>.',
    'Fix It is a hunt with a known number of errors, not a test <b>(7.3)</b>. Nothing on the page is graded.',
    'Each week names its goal in the "I can" statement on Friday <b>(8.1)</b>, and the red-pen reveal gives instant, specific feedback <b>(8.5)</b>.',
    'Partners fix and share together <b>(8.3)</b>. Friday\'s 1–4 finger self-rating builds reflection <b>(9.3)</b>.',
  ])}
${udl('Multiple Means of Representation', 'The "what" of learning: perception, language and symbols, and building knowledge.', [
    ['Perception', [['Support opportunities to customize the display of information', '1.1'], ['Support multiple ways to perceive information', '1.2'], ['Represent a diversity of perspectives and identities in authentic ways', '1.3']]],
    ['Language and symbols', [['Clarify vocabulary, symbols, and language structures', '2.1'], ['Support decoding of text, mathematical notation, and symbols', '2.2'], ['Cultivate understanding and respect across languages and dialects', '2.3'], ['Address biases in the use of language and symbols', '2.4'], ['Illustrate through multiple media', '2.5']]],
    ['Building knowledge', [['Connect prior knowledge to new learning', '3.1'], ['Highlight and explore patterns, critical features, big ideas, and relationships', '3.2'], ['Cultivate multiple ways of knowing and making meaning', '3.3'], ['Maximize transfer and generalization', '3.4']]],
  ], [
    'Projector mode, large type, a reading-friendly typeface, and light or dark display <b>(1.1)</b>. Read every sentence and prompt aloud <b>(1.2)</b>. Names in the sentences reflect Texas classrooms <b>(1.3)</b>.',
    'Each page names the day\'s focus and shows a key to the editing marks <b>(2.1)</b>. Fix It is framed as standard written English for a reader, not a judgment on how anyone talks <b>(2.3, 2.4)</b>.',
    'One conventions focus a week, spiraled back in later weeks, makes the pattern visible <b>(3.2)</b>. Friday asks students to apply it to their own writing <b>(3.4)</b>.',
  ])}
${udl('Multiple Means of Action and Expression', 'The "how" of learning: interaction, expression and communication, and strategy.', [
    ['Interaction', [['Vary and honor the methods for response, navigation, and movement', '4.1'], ['Optimize access to accessible materials and assistive and accessible technologies and tools', '4.2']]],
    ['Expression and communication', [['Use multiple media for communication', '5.1'], ['Use multiple tools for construction, composition, and creativity', '5.2'], ['Build fluencies with graduated support for practice and performance', '5.3'], ['Address biases related to modes of expression and communication', '5.4']]],
    ['Strategy development', [['Set meaningful goals', '6.1'], ['Anticipate and plan for challenges', '6.2'], ['Organize information and resources', '6.3'], ['Enhance capacity for monitoring progress', '6.4'], ['Challenge exclusionary practices', '6.5']]],
  ], [
    'Students can fix with editing marks, on a whiteboard, aloud, or in writing <b>(4.1)</b>. The pages work with screen readers and keyboard navigation <b>(4.2)</b>.',
    'K–2 students draw, dictate, or write <b>(5.1)</b>. The week moves from plan to draft to revise to edit, so support fades as skill grows <b>(5.3)</b>.',
    'Monday\'s plan organizes ideas before drafting <b>(6.3)</b>. Friday\'s "I can" rating, kept in the notebook, lets students track their own progress <b>(6.1, 6.4)</b>.',
  ])}

<h2>Five quick wins</h2>
<ul>
  <li><b>Say the error count out loud.</b> "There are three errors" turns guessing into searching.</li>
  <li><b>Accept every way of showing a fix:</b> marks, words, pointing, or a partner's voice.</li>
  <li><b>Use the band toggle</b> to give a small group a lower- or higher-band version of the same day.</li>
  <li><b>Normalize revision.</b> Wednesday's weak model shows that good writers change their sentences on purpose.</li>
  <li><b>End with the reader.</b> Ask who the writing is for and what they need to understand it.</li>
</ul>
<p class="cite">Framework: CAST (2024). <i>Universal Design for Learning Guidelines version 3.0</i>. Lynnfield, MA: Author. <a href="https://udlguidelines.cast.org">udlguidelines.cast.org</a>. The guideline names are listed for planning support; this site is not endorsed by CAST.</p>` });

  // ---------------- About: licensing & provenance ----------------
  pages.push({ dir: 'about', nav: 'About', title: 'Licensing & Provenance', desc: 'Who made Daily Writing a Day, how you may reuse it, how to credit it, and where it came from.', body: `
<h1>Licensing &amp; Provenance</h1>
<p class="lede">Who owns this material, how you may reuse it, how to credit it, and where it came from.</p>

<h2>Copyright and ownership</h2>
<p>© 2026 TCEA. Created by Miguel Guhlin (<span class="sel">mguhlin@tcea.org</span> · <a href="https://mguhlin.org">mguhlin.org</a>) in the course of his work at TCEA, the Texas Computer Education Association. Daily Writing a Day complements TCEA's professional-learning programs: the TCEA blog, workshops, and conference sessions. Copyright is held by TCEA.</p>

<h2>How you may use it</h2>
${table(['Part', 'License', 'What that covers'], [
    ['Content', '<a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>', 'Fix It sentences and answer keys, writing prompts, teacher notes, the year plan, and these teacher pages'],
    ['Code', '<a href="https://opensource.org/license/mit">MIT</a>', 'HTML, CSS, and JavaScript source, including the build and validation scripts'],
  ])}
<div class="cols2">
  <section><h3>Yes, without asking</h3><ul><li>Use it with your students, in class or remotely</li><li>Print and share it with colleagues</li><li>Host your own copy on a school or district server</li><li>Adapt, translate, or remix it for your classroom</li><li>Share your adaptations, as long as you credit the original</li></ul></section>
  <section><h3>Not without written permission</h3><ul><li>Selling it, or any adaptation of it</li><li>Including it in paid training, workshops, or courses</li><li>Bundling it into a commercial product or subscription</li></ul><p class="muted">Commercial use needs separate written permission from TCEA. Ask; permission isn't automatically refused.</p></section>
</div>

<h2>How to credit</h2>
<p>Include the name, the copyright holder, the creator, and the license:</p>
<p class="quote">Daily Writing a Day © 2026 TCEA, created by Miguel Guhlin. Licensed CC BY-NC 4.0.</p>
<p>If you adapted it, say so: <i>"Adapted from Daily Writing a Day © 2026 TCEA, created by Miguel Guhlin. CC BY-NC 4.0."</i> Where you can, link to <span class="sel">mglearn.github.io/writedaily</span>.</p>

<h2>Provenance</h2>
<ul>
  <li><b>Where it came from.</b> Daily Writing a Day grew out of TCEA's professional-learning work. It uses the "one page a day" flipbook pattern first built for the <a href="https://mglearn.github.io/eles/calendar/">TCEA ELE Daily Opener a Day</a> and the Contraband banned-books daily opener.</li>
  <li><b>Teacher supports.</b> The UDL and ELPS pages are adapted from the teacher-support pages of TCEA's Critical Thinking Online Breakouts. The SST page draws on the <a href="https://mglearn.github.io/activities/sst/">Learning Activities Hub</a> roadmap <i>From STAAR to SST</i> and the ACE the SST routine.</li>
  <li><b>Standards.</b> TEKS, ELPS, and CAST UDL references are aligned to and paraphrased from the official documents, never reproduced. Confirm against the official sources before adoption.</li>
  <li><b>How it was written.</b> The year plan, Fix It sentences, prompts, and code were produced with the help of generative-AI tools and refined under Miguel Guhlin's direction and editorial review; a human stays in the loop on every decision. Every answer key passed an automated check that its error count matches the corrections, then an independent proofreading pass for correctness and for sentences with more than one fair answer.</li>
  <li><b>People and places.</b> Names in Fix It sentences are fictional. Places such as Texas cities, rivers, and landmarks are real. Week 24 invites students to write about real leaders they choose.</li>
  <li><b>Fonts.</b> Andika, Big Shoulders Display, and Bitter, from Google Fonts under the SIL Open Font License.</li>
</ul>

<h2>Privacy</h2>
<p>There are no logins, no accounts, and no tracking. Nothing is uploaded and no student data is collected. Your grade band and school-calendar settings are saved only in your own browser.</p>

<h2>Contact</h2>
<p>For permissions, corrections, or to report an accessibility barrier, contact Miguel Guhlin at <span class="sel">mguhlin@tcea.org</span>. Students and families should contact their teacher first.</p>` });

  return pages;
};
