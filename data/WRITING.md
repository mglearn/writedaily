# Daily Writing a Day: content spec

A school-year flip calendar for grades K–2, 3–5, and 6–8. Each school day has two parts:

1. **Fix It (DOL, Daily Oral Language):** one sentence (or two short ones) with errors. Students find and fix them aloud and talk about why. 3–4 minutes.
2. **Write:** a quick-write prompt aligned to the ELAR TEKS writing strands. 5–8 minutes.

The year plan is fixed: `data/plan.json` gives each week's **theme**, **genre** per band, and **conventions focus** per band. Don't change it. Write content files as `data/weeks/weeks-<first>-<last>.json` = `{ "weeks": [ … ] }`, then run `node scripts/validate.js`.

## Week object

```jsonc
{
  "week": 8,
  "title": "Notes That Make a Day",   // 2–5 words, student-friendly, fits the plan's theme
  "bigIdea": "One sentence for the teacher: what this week's writing builds and why.",
  "iCan": {                            // Friday self-check, one per band, matches the week's genre
    "k2": "I can write a letter that tells someone something kind.",
    "g35": "I can write a friendly letter with all five parts.",
    "g68": "I can write a letter with a clear purpose and a tone that fits my reader."
  },
  "days": [ /* exactly 5, kinds in this order: plan, draft, revise, quick-write, edit-share */ ]
}
```

## Day object

```jsonc
{
  "kind": "plan",                      // plan | draft | revise | quick-write | edit-share (fixed order Mon→Fri)
  "title": "3–6 words",
  "dol": {
    "k2":  { "s": "my cat sat on the mat", "fix": "My cat sat on the mat.", "n": 2 },
    "g35": { "s": "…", "fix": "…", "n": 3 },
    "g68": { "s": "…", "fix": "…", "n": 3 }
  },
  "write": {
    "k2":  "Prompt a teacher can read aloud. 1–2 short sentences. Drawing is welcome.",
    "g35": "1–3 sentences.",
    "g68": "1–3 sentences, more nuance, real teen contexts."
  },
  "teacher": "One or two sentences: how to run it and the one thing to look for."
}
```

`s` is the sentence **with** the errors; `fix` is the corrected version; `n` is the exact number of errors (each missing/wrong capital, mark, word, or spelling = 1). Use `**bold**` or `*italics*` sparingly in prompts; plain text in DOL (no markdown in `s`/`fix`, except a title in 6–8 italics weeks may use *asterisks* in `fix` only).

## The weekly rhythm (writing process, TEKS (11)/(10))

Every prompt must **work on its own**. Teachers skip days, holidays fall on Mondays, and some classes join midweek. If a prompt builds on an earlier day, also give a fresh topic: "Use your plan from Monday, or …".

- **Mon `plan` (11)(A)/(10)(A):** generate and organize ideas for the week's genre on the week's theme: list, web, sketch, talk, choose. Ends with something on paper.
- **Tue `draft` (11)(B)/(10)(B):** write a short draft of one part (a beginning, a paragraph, a stanza, a claim and reason) in the week's genre.
- **Wed `revise` (11)(C)/(10)(C):** give students a weak model **in the prompt** (a flat sentence, a vague claim, a list-y paragraph in quotes) and one specific craft move to improve it: a strong verb, sensory detail, a reason with evidence, a transition, a simile, cutting repetition. Then they apply the move to their own writing.
- **Thu `quick-write` (genre code (12)/(11)):** a new, fun topic in the same genre, written fast. A different angle from Mon–Tue.
- **Fri `edit-share` (11)(D)(E)/(10)(D)(E):** students edit one piece from the week for the week's conventions focus, then share (partner read, author's chair, gallery). Mention the week's convention by name.

## DOL rules

- The DOL sentences connect to the week's theme, so the week feels like one story or topic.
- **Mon–Thu:** at least one error is the band's **conventions focus**. The others are review from earlier weeks (see the plan). **Fri:** two sentences that review the week's focus.
- Error counts: **K–2: 2–3**, **3–5: 3–4**, **6–8: 3–5**. Keep `s` short (K–2 ≤ 12 words; 3–5 ≤ 22; 6–8 ≤ 30).
- One correct answer only. Avoid style choices that could go two ways (an optional comma, "which" vs "that"). For K–2 keep to capitals, end marks, simple spelling, plurals, verb forms, and the week's focus.
- The `fix` must be fully correct standard English. Every change from `s` to `fix` counts toward `n`, and nothing else changes.
- Fictional names (reflect Texas classrooms: lots of Latino names, plus a wide mix), no brands, no real living people. Real places are fine: Texas cities, rivers, landmarks.

## Prompt rules

- Students write every day. No handouts, no devices, no prep.
- K–2: simple words a teacher can read aloud; "draw and write," "tell a partner, then write." Kindergarten students may dictate.
- 3–5: concrete and playful. 6–8: real teen situations and opinions they actually hold; avoid preachiness.
- Argument weeks: K–2 writes a letter that asks for something or persuades (correspondence); 3–5 an opinion; 6–8 a claim with reasons and evidence and a counterclaim later in the week.
- Research week (33): questions, where to find answers, notes in their own words, sharing a source.
- Avoid topics that require money, travel, specific holidays, or a particular family structure to answer ("a grown-up who cares about you," not "your mom and dad"). Holidays are named generally and optionally.
- Don't repeat a prompt idea from another week.
