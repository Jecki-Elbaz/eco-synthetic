# Lessons-Learned Process

Version: 1.0 | Created: 2026-06-14 | Owner: Dalia (Q&G) + Eco (CEO)

Post-incident investigation and follow-up. Dalia leads facilitation and tracks to closure.
Eco authorizes and ensures agent participation. No blame; only facts, causes, and fixes.

Trigger: Eco or owner requests a LL session after a significant failure, near-miss, or
pattern of problems. Dalia may also propose one after a quality audit finding.

---

## Phase 1 -- Scope and Notify

Dalia + Eco.

1. Dalia reads existing records (board.md, log.md, relevant agent outputs, decisions-log.md).
   Never assert incident facts from memory -- read the files first. [soul rule 2]
2. Dalia defines: what failed, who was involved, timeline, impact.
3. Dalia proposes scope to Eco (which agents to involve, what evidence to collect).
4. Eco authorizes the investigation and notifies involved agents:
   "Mandatory LL session for [incident]. Submit factual account to Dalia by [date]."
   Eco's backing makes participation mandatory -- not optional.

---

## Phase 2 -- Collect Accounts

Involved agents -> Dalia.

1. Each involved agent submits a factual account: what happened, when, what they observed,
   what decision or action they took. No editorializing, no self-exoneration.
2. Dalia cross-references accounts against file evidence. Flags discrepancies.
3. Agents that do not respond: noted as "no response received" -- Eco follows up.
4. No blame language in accounts -- only facts, timelines, and system behavior.

---

## Phase 3 -- Root Cause Analysis

Dalia leads.

1. Dalia drafts root cause: what systemic condition allowed this failure?
2. Contributing factors: rule gap, tooling gap, process gap, training gap, model limitation,
   verify-then-claim failure, loop-cap miss, other?
3. Dalia shares root cause draft with Eco and direct managers for factual correction.
   One round only -- if disagreement: Eco decides.
4. Root cause is finalized before mitigations are proposed.

---

## Phase 4 -- Mitigations and Action Items

Dalia proposes; Eco approves.

1. For each root cause: one or more proposed mitigations.
2. Each mitigation has: owner (agent or person responsible), deadline, success criteria.
3. Eco reviews and approves action items:
   - A3 (Dalia): log and track items.
   - A2 (Eco): operational process changes.
   - A1 (owner): rule changes, role file edits, model changes, agent creation/retirement.
4. Action items with A1 are flagged to owner before execution.

---

## Phase 5 -- Report and File

Dalia.

1. Dalia writes the final post-mortem report.
   File: company/post-mortems/<YYYY-MM-DD>-<slug>.md
   Sections:
   - Incident summary (1-2 sentences).
   - Timeline (what happened and when).
   - Agents involved.
   - Root cause.
   - Contributing factors.
   - Action items (owner, deadline, success criteria, status: open).
   - What worked well (what prevented this from being worse, if anything).
2. Dalia appends entry to company/decisions/decisions-log.md (log only -- not a decision entry
   unless the LL produced a binding decision).
3. Dalia files action items in memory/board.md (Dalia rows; one row per action item).

---

## Phase 6 -- Follow-Up

Dalia owns until all items confirmed complete.

1. Dalia tracks each action item. On deadline: check status with responsible agent.
2. Responsible agent confirms completion with evidence (file change, test result, log entry).
3. Dalia verifies evidence is genuine (not self-reported only). Eco confirms for high-stakes items.
4. Dalia marks item done in board.md. Appends closure note to post-mortem file.
5. When all items closed: Dalia sends closure summary to Eco and owner.
6. Eco confirms LL is closed. Dalia updates post-mortem file with closure date.

---

## Output files

- company/post-mortems/<YYYY-MM-DD>-<slug>.md -- post-mortem report
- memory/board.md -- action items (Dalia rows)
- company/decisions/decisions-log.md -- log entry (and any binding decisions)

---

## Rules

- Never assert incident facts without reading the source files first. [soul rule 2]
- Never allow agent self-exoneration to substitute for file evidence.
- Never close an action item without confirming the fix exists (file, test, log).
- Never invent root causes -- every root cause must trace to specific file evidence or
  a documented system behavior.
- LL report is factual and specific -- cite files and lines where relevant.
- No editorial padding or blame language in any LL output.
