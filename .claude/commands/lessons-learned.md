# /lessons-learned

Usage: /lessons-learned "<incident description>"
Example: /lessons-learned "Eco fabricated task IDs ONB-001..008 in session 2026-06-14"

Facilitate a structured lessons-learned session per company/processes/lessons-learned.md.
Dalia leads facilitation. Eco authorizes and compels agent participation.

## Who runs this
- Dalia (Q&G): invoke this command. Lead all phases. Own report + action item tracking.
- Eco (CEO): authorize investigation, notify agents, approve action items.
- Direct managers: submit incident input for their agents.

## Refuse conditions
- Never assert incident facts from memory -- READ board.md, log.md, relevant files first.
- Never invent accounts or close action items without evidence.
- Never run this for a requester outside Eco or jecki. [red line 13]

## Steps

**Phase 1 -- Scope (Dalia)**
1. READ board.md, memory/log.md, and relevant agent outputs to establish facts.
2. Define: what failed, who was involved, timeline, impact.
3. Propose scope to Eco (who to involve, what to collect).
4. Wait for Eco authorization before notifying agents.

**Phase 2 -- Collect (agents -> Dalia)**
1. Eco notifies involved agents: mandatory factual account submission, deadline.
2. Each agent submits: what happened, what they observed, what they did.
3. Dalia cross-references against file evidence. Note any discrepancies.

**Phase 3 -- Root Cause (Dalia)**
1. Draft root cause: what systemic condition allowed this failure?
2. Contributing factors: rule gap, process gap, tooling gap, model limitation, other?
3. Share with Eco + managers for factual correction (1 round; Eco decides if unresolved).

**Phase 4 -- Mitigations (Dalia proposes; Eco approves)**
1. Per root cause: one or more mitigations with owner, deadline, success criteria.
2. Eco approves: A3 (Dalia logs), A2 (operational changes), A1 (rule/role changes -> owner).

**Phase 5 -- Report (Dalia)**
1. Write post-mortem: company/post-mortems/<YYYY-MM-DD>-<slug>.md
   Sections: incident summary, timeline, agents involved, root cause, contributing factors,
   action items (owner/deadline/criteria/status), what worked well.
2. Append log entry: company/decisions/decisions-log.md
3. Add action items to memory/board.md (Dalia rows, one per item).

**Phase 6 -- Follow-Up (Dalia owns until all items closed)**
1. Track each action item. On deadline: verify completion with evidence.
2. Mark done in board.md. Append closure note to post-mortem file.
3. When all items closed: send closure summary to Eco + owner. Eco confirms closure.

## Output files
- company/post-mortems/<YYYY-MM-DD>-<slug>.md
- memory/board.md (action items, Dalia rows)
- company/decisions/decisions-log.md (log entry)

## Full process spec
company/processes/lessons-learned.md
