# Sprint 9 Delta Review -- Oren
# Round 1 | 2026-07-15 | Requester: Eco (CEO), standing quality gate
# Scope: S9-GAL-GAP1, S9-GAL-EVICT, S9-ADI-TRYFIN (code) + rehearsal runbook +
#        dress-run report (documents)
# PROVENANCE: Oren delivered in-session; Eco persisted as review of record.
# Fix status at bottom.

## VERDICT: CONDITIONAL PASS
0 BLOCKER | 2 MAJOR | 2 MINOR | 4 INFO
All four code artifacts CORRECT. Both MAJORs are runbook-document defects that
would have broken or falsified rehearsal-day results if uncorrected.

## CODE RESULTS (all clean)

Q1 SIZE BOUND: FIFO (not LRU) and honestly labeled -- Map.get() does not refresh
insertion order; eviction is oldest-by-insertion. Off-by-one correct (guard fires
after .set() at size > MAX; cache never exceeds MAX; boundary test verifies). New
key never self-evicts (set only inside !has()). No interaction with the COMPLETED
delete. F3 MINOR: add an explicit FIFO-not-LRU warning to the comment.
Q2 GAP1 ASSERTION: binds causally (4th it-block reads the row the 1st block's
processTurn wrote; jest runs blocks sequentially) and cannot pass vacuously
(toBeDefined() throws before the not-null check on a missing row).
Q3 TRY/FINALLY RETROFIT: mid-seed failure -> disconnect + rethrow; afterAll's
per-table try/catch + undefined-guards clean up whatever WAS created; one table's
failure does not abort the rest; disconnect in outer finally; FK order correct;
all 12 assertions unchanged. F6 INFO: catch(_){} swallows teardown errors by
design (accepted convention trade-off). F7 INFO: cosmetic indentation.
Q5 RED LINES: no new deps; zero behavior change outside the cache bound; ASCII.

## DOCUMENT FINDINGS

F1 MAJOR -- runbook criterion (b) step 2: SQL used "guardVerdict" + "trustValue";
schema columns are guardResult + trust. Query would fail on Postgres on the day;
required evidence uncapturable. No addendum covered it.
F2 MAJOR -- runbook criterion (f) steps 4 + 12: body said POST /actions with
OVERRIDE_HARD_LIMIT and hardLimit=0. No such actionType/route exists, AND
hardLimit=0 produces a FALSE PASS (creditBalance = balance - 0 > 0; the gate never
fires; the tester would record a normal turn as a blocked-credit pass). Addendum 1
corrected the mechanism but did not strike the body steps -- two contradictory
instructions with no per-step override.
F4 MINOR -- criterion (c) step 1 kept the VERIFY-ON-DAY information_schema block
despite Addendum 1's resolution (harmless but unnecessary; also carried the same
trustValue defect).
F5 INFO -- simulation-turn.integration.spec.ts was touched this sprint (GAP1
assertion) and per the H3 retrofit-on-touch convention qualifies for the
try/finally retrofit; track for next touch.
F8 INFO -- dress-run FLAG-DR-001 (E2E re-confirm 8/34 after dress-run) correctly
diagnosed as procedural (arc caps consumed); Addendum 3's re-seed rule is the fix.
Addenda 2 (Sami fixes) and 3 (dress-run corrections): clean supersessions, no
contradictions.

## FIX STATUS (Eco, 2026-07-15, same session)

- F1: FIXED in the runbook BODY -- query corrected to "guardResult" + "trust"
  (in-place edit, not another addendum, per the F2 lesson).
- F2: FIXED in the runbook BODY -- steps 4 + 12 rewritten in place: read current
  balance, PATCH /admin/credits/:ledgerId/limits with hardLimit = current balance
  (dress-run-verified flow); reset via the same PATCH to 2000. The false-pass
  hardLimit=0 instruction is gone.
- F4: FIXED -- information_schema block removed; criterion (c) query corrected to
  "analyserOutput" + "trust" with the resolution noted inline.
- F3: FIXED -- FIFO-not-LRU warning added to the MAX_ARC_CACHE_ENTRIES comment.
- F5: TRACKED -- simulation-turn spec retrofit on next touch (H3 convention note
  in the Sprint-9 envelope).
- F6/F7/F8: accepted as noted.
- Post-fix close gate (Eco, independently run): api tsc 0; nest build 0; api unit
  317/0-fail/8-skip; integration 9/9 91/0-fail/2-skip; engine 212/212; web 43/43 +
  tsc 0; fresh seed -> E2E 34/34.
