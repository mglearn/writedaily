# Daily Writing a Day

A school-year flip calendar for grades K–2, 3–5, and 6–8. Each school day has a **Fix It** sentence (Daily Oral Language: find and fix the errors) and a **Write** prompt aligned to the Texas ELAR TEKS writing strands. It takes about 10 minutes, with no prep and no devices.

Live at https://mglearn.github.io/writedaily/ · built on the same flipbook pattern as the ELE Daily Opener calendar.

- `data/plan.json`: the fixed year plan (37 weeks: theme, genre per band, conventions focus per band). Edit the table in `scripts/make-plan.js` and rerun it.
- `data/WRITING.md`: the content spec writers follow.
- `data/weeks/weeks-NN-NN.json`: the content.
- `scripts/teks.js`: TEKS code mapping (writing process, genres, DOL).

```sh
node scripts/validate.js      # fails on structure errors; warns on DOL error-count mismatches
node scripts/build.js         # writes index.html (single file, no runtime fetch)
node scripts/export-md.js     # writes daily-writing-prompts.md (everything in one readable file)
```

Weekly rhythm: Mon plan (11)(A)/(10)(A), Tue draft (B), Wed revise (C), Thu quick-write in the week's genre, Fri edit & share (D)(E) with an "I can" self-rating.
The calendar maps the Nth school week to week N and skips weekends and typical Texas 2026–27 holidays. Teachers can change their first day in the page.
