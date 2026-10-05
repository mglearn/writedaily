// One-off: writes data/plan.json (the fixed year plan writers follow). Edit the table, rerun.
const fs = require('fs'), path = require('path');
const G = { n: 'narrative', f: 'fiction', p: 'poetry', i: 'informational', h: 'procedural', a: 'argument', c: 'correspondence', r: 'research' };
// week | Monday | theme | note | genre k2,g35,g68 | conventions k2 | g35 | g68
const rows = `
1|2026-08-17|New Beginnings|first week of school|n,n,n|Capitalize the first word of a sentence|Complete sentences, not fragments|Sentence fragments
2|2026-08-24|Friends and Teamwork||n,n,n|End marks: period and question mark|Capital letters and end punctuation|Run-ons and comma splices
3|2026-08-31|Our School||i,i,i|Capitalize names and the word I|Capitalizing proper nouns|Capitalizing proper nouns and proper adjectives
4|2026-09-07|Helpers and Jobs|Monday is Labor Day|h,h,h|Complete sentences: who + what they do|Commas in a series|Compound sentences: comma + FANBOYS
5|2026-09-14|Family Stories|many schools begin celebrating Hispanic Heritage Month around now|n,n,n|Plural nouns (-s, -es)|Commas in dates and addresses|Commas after introductory words, phrases, and clauses
6|2026-09-21|Autumn and Change||p,p,p|Adjectives and the articles a/an|Comparative and superlative adjectives|Comparative and superlative forms, including irregular ones
7|2026-09-28|Amazing Animals||i,i,i|Subject–verb agreement (is/are, runs/run)|Subject–verb agreement|Subject–verb agreement with tricky subjects
8|2026-10-05|Kindness Counts||c,c,c|Capitals and commas in a letter (Dear ___, / Love, ___)|Friendly letter parts and commas|Business letter conventions and formal tone
9|2026-10-12|Mysteries and Wonders||f,f,f|Past-tense verbs (-ed)|Verb tense: past, present, future|Consistent verb tense
10|2026-10-19|Smart and Safe Online|around Digital Citizenship Week|c,a,a|Question marks and asking sentences|Apostrophes in contractions|its/it's, your/you're, their/there/they're
11|2026-10-26|Harvest and Food||h,h,h|Commas in a series|Homophones (to/too/two, there/their/they're)|Semicolons
12|2026-11-02|Making Choices||c,a,a|Irregular past-tense verbs (ran, saw, went)|Irregular verbs|Pronoun–antecedent agreement
13|2026-11-09|Service and Thanks|many schools honor veterans this week|c,c,c|Capitalize days, months, and holidays|Capitalizing holidays, titles, and historical events|Capitalizing titles, organizations, and events
14|2026-11-16|Gratitude||p,p,p|Pronouns (I/me, he/him, she/her)|Subject and object pronouns|Pronoun case (I/me, who/whom)
15|2026-11-30|Inventions and Problem Solving|first week back after Thanksgiving break|i,i,i|Adverbs that tell how and when|Singular possessive nouns|Plural and irregular possessive nouns
16|2026-12-07|Codes and Patterns|around Computer Science Education Week|h,h,h|End marks review (. ? !)|Commas after introductory and sequence words|Transitions and conjunctive adverbs
17|2026-12-14|Winter and Traditions|last week before winter break|n,n,n|Capitalize names of holidays and places|Quotation marks in dialogue|Punctuating dialogue
18|2027-01-04|New Year, New Goals|first week back after winter break|i,i,i|Complete sentences review|Run-on sentences|Complex sentences: subordinating conjunctions and commas
19|2027-01-11|Dreams and Leaders|the week before Martin Luther King Jr. Day|c,a,a|Verbs was and were|Compound sentences with coordinating conjunctions|Parallel structure
20|2027-01-18|Kind Words|Monday is Martin Luther King Jr. Day|c,c,c|Contractions (can't, don't, it's)|Commas with yes, no, and names (direct address)|Commas with appositives and nonessential clauses
21|2027-01-25|Weather and Sky||i,i,i|Plural nouns review|Adverbs, including comparative adverbs|Misplaced and dangling modifiers
22|2027-02-01|News and Facts|around National News Literacy Week|i,i,i|Capitalize names of places|Capitalizing geographic names|Quotation marks for direct quotations and article titles
23|2027-02-08|Friendship|Valentine's Day is this weekend|p,p,p|Describing words for the five senses|Prepositions and prepositional phrases|Commas between coordinate adjectives
24|2027-02-15|Leaders Who Made a Difference|Monday is Presidents' Day; many schools celebrate Black History Month|i,i,i|Capitalize titles of people (Mr., Mrs., Dr.)|Abbreviations and titles of people|Active and passive voice
25|2027-02-22|Texas, Our Home|Texas Independence Day is early next week|i,i,i|Commas in dates|Commas with cities, states, and dates|Commas review: dates, places, introductory elements
26|2027-03-01|Books We Love|many schools celebrate reading this week|c,a,a|Capitalize book titles|Titles of books and stories|Italics vs. quotation marks for titles
27|2027-03-08|Into the Future|last week before spring break|f,f,f|Prepositions (in, on, under, behind)|Commas in compound sentences review|Relative pronouns: who, that, which
28|2027-03-22|Earth and Nature|first week back after spring break; Friday is Good Friday|p,p,p|Spelling high-frequency words|Good/well and irregular comparisons (good, better, best)|Commonly confused words (affect/effect, than/then, accept/except)
29|2027-03-29|Speak Up!||c,a,a|Subject–verb agreement review|Pronoun–antecedent agreement|Vague pronouns and pronoun clarity
30|2027-04-05|Play and Sports||n,n,n|Contractions review|Plural vs. possessive nouns|Apostrophes review
31|2027-04-12|Art and Imagination||f,f,f|Exclamation points|Interjections and exclamation points|Colons and dashes
32|2027-04-19|Our Earth|around Earth Day|c,c,c|Letter capitals and commas review|Letter format review|Formal vs. informal language
33|2027-04-26|I Wonder…||r,r,r|Asking sentences review|Spelling plurals (-y → -ies, -f → -ves)|Integrating quotations from sources
34|2027-05-03|Calm and Confident|testing season in many schools|n,n,n|Capitals and end marks review|Fragments and run-ons review|Sentence variety: combining sentences
35|2027-05-10|People Who Help Us Grow|many schools celebrate teachers and families now|c,c,c|Mixed review: capitals and commas|Mixed review: commas|Mixed review: punctuation
36|2027-05-17|Summer Is Coming||h,h,h|Mixed review: verbs and nouns|Mixed review: capitals and apostrophes|Mixed review: usage and commonly confused words
37|2027-05-24|Looking Back, Looking Ahead|last week of school|n,n,n|Mixed review: the whole year|Mixed review: the whole year|Mixed review: the whole year`;
const weeks = rows.trim().split('\n').map(r => {
  const [w, monday, theme, note, g, k2, g35, g68] = r.split('|');
  const [gk, g3, g6] = g.split(',').map(x => G[x]);
  return { week: +w, monday, theme, note, genre: { k2: gk, g35: g3, g68: g6 }, conv: { k2, g35, g68 } };
});
fs.writeFileSync(path.join(__dirname, '../data/plan.json'), JSON.stringify({ weeks }, null, 1) + '\n');
console.log(weeks.length, 'weeks');
