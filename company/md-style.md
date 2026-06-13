# MD Style -- internal machine-facing files

Owner directive 2026-06-13. Goal: min tokens. These files load every invocation -> every word costs.

## Scope
APPLIES: `.claude/agents/*.md`, `.claude/commands/*.md`, soul Core Block, internal procedure/governance docs read by agents.
NOT: human prose (README, chat replies, owner-facing reports). Those stay readable prose.

## Rules
- Caveman/imperative. Drop articles (a/the), filler, hedging, restated context.
- One instruction per line. Fragments OK.
- Symbols over words: `->` = then/leads-to; `!=` = is-not; `&` = and.
- KEEP EXACT, never cut to save tokens: file paths, agent names, gate codes (A1/A2/A3), red-line refs, constitution § refs, numbers, thresholds.
- No restating rules already in the soul Core Block.
- No decorative prose. Examples only when needed for correctness.
- ASCII (soul Core Block rule 5).

## Test
Removing a word loses a constraint or changes meaning -> KEEP. Else CUT.
