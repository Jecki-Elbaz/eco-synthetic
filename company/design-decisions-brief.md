# Design Decisions Brief -- T-0002
# Author: Eco (CEO) | Date: 2026-06-14 | Status: APPROVED by owner 2026-06-16 (D1 = file-lock always; D2, D3, D4 as recommended)

Four small decisions that are cheap now and expensive to retrofit later.
Each is a [DESIGN] item from company/backlog.md. I am not executing any of them --
I am bringing you the options and my recommendation so you can approve the direction.

---

## Decision 1: Concurrency rule (backlog item 4)

Problem: two agents could be tasked simultaneously and try to write the same file --
board.md, decisions-log.md, a wiki page. No lock exists today.

Options:
- A) Soft convention only: last write wins; agents note conflicts and escalate.
- B) File-level lock: each agent that writes a shared file appends a lock-token first.
  Held for max 60 seconds. Any other agent seeing the lock waits or escalates.
- C) Serialized writes via Eco: all writes to shared files route through me.
  I queue and sequence them. Simplest to enforce; adds latency on every write.

My recommendation: start with A (soft convention), add B when we have more than
three concurrent agents active. C is too much bottleneck for the current team size.

Approve A? Or prefer B/C?

---

## Decision 2: Task log storage -- JSONL or SQLite (backlog item 8)

Problem: memory/log.md is human-readable prose. As the company grows, Assaf (OE)
will need to query by agent, task_id, time range -- prose does not support that.

Options:
- A) Keep JSONL (memory/log.jsonl already exists): append one line per event.
  No infra. Grep-able. Assaf reads it with simple tooling. Move to SQLite later.
- B) Move to SQLite now: single local file. Rich queries. Free. No data-out.
  Slightly more setup; needs a write schema.
- C) Leave it as prose only; revisit when Assaf is live.

My recommendation: stay on JSONL (A) now. The file exists and is working.
Set a trigger: when event count passes 2,000 lines, Assaf migrates to SQLite.
This avoids premature complexity while keeping the option open.

Approve A?

---

## Decision 3: Durable chat memory -- approach (backlog item 10)

Problem: each Claude session starts cold. I have no memory of past conversations
unless I read files. As conversation volume grows, reading everything each session
becomes expensive and unreliable.

Options:
- A) Structured wiki pages (current): I read relevant wiki pages at session start.
  Works well at low volume. Manual. Does not scale past ~50 significant decisions.
- B) SQLite + keyword search: store all significant messages and decisions in a
  local DB. Agent queries by keyword or topic at session start. Zero cost. No
  data leaves the machine.
- C) SQLite + embeddings (vector search): store + semantic retrieval via MCP.
  Best recall. Requires an embedding model call for writes and reads. Small cost.
  Needs Ido to build the MCP bridge.

My recommendation: stay on A until Assaf and Ido are live, then move to B as
a first step (Ido builds in one session). Graduate to C only if B proves
insufficient. Do not spend on embeddings before we have real volume.

Approve A for now, with B as the planned next step?

---

## Decision 4: Gemini for research / second-opinion (backlog item +)

Problem: Gemini free tier exists. It could be used for non-sensitive research tasks
(market scans, second-opinion analysis, reference lookups) to reduce Claude token
spend. Unlimited free is a myth -- it has tiered limits -- but the free tier is
generous for occasional use.

Gate required: Rambo (security clearance) + Eyal (terms review) + A1 (tool adoption).

Options:
- A) Evaluate after Rambo + Eyal are live: they run the gate properly, then we decide.
  Clean process. No risk of adopting without security/legal review.
- B) Skip Gemini: use Claude for everything. Simpler. No extra tool to manage.
- C) Pre-approve in principle now, gate runs when Rambo + Eyal are live.

My recommendation: C -- pre-approve in principle so it moves the moment Rambo
and Eyal are active, without needing another owner touch. If Rambo or Eyal find
a problem, it stops there.

Pre-approve in principle?

---

## Summary table (your decisions needed)

- Decision 1 (concurrency): approve soft convention (A) to start?
- Decision 2 (task log): approve stay on JSONL (A) with SQLite trigger at 2k lines?
- Decision 3 (durable memory): approve wiki-first (A) with SQLite as next step?
- Decision 4 (Gemini): pre-approve in principle (C), gate runs when Rambo + Eyal live?

Quick yes/no on each is enough. I execute once you confirm.
