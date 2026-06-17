# T-0002 Design-Decisions Paper (Eco -> Owner)

Status: DRAFT for owner review. Prepared by Eco (CEO) on an isolated working branch, 2026-06-16.
Scope: three [DESIGN] backlog items only. Each item gives the problem, options with trade-offs,
Eco's recommendation, and exactly what owner approval (A1/A2) it needs.

## Exclusion note (read first)

File-locking / concurrency is INTENTIONALLY EXCLUDED from this paper. It is owned and already
DECIDED elsewhere -- see decisions-log entry "2026-06-16 -- T-0002 design decisions approved (A1)",
Decision 1 (concurrency): the owner chose file-level locking AT ALL TIMES (every agent writing a
shared file acquires a lock token first, held max 60s, others wait or escalate; applies always, not
only past 3 concurrent agents; implementation tracked under T-0002). This paper does not duplicate,
re-open, or contradict that decision. The three items below are the remaining [DESIGN] decisions.

---

## Item 1 -- Task-log storage migration: JSONL -> SQLite

### Problem
The activity/task log is an append-only JSONL file (memory/log.jsonl). It works today, but it grows
without bound and is only queryable by full scan. As the fleet grows (10+ agents, 2h wake-ups each,
plus event logging), we will want real queries and reporting: per-agent activity, escalation rate,
token spend, loop-cap breaches, "what happened on date X." JSONL gives us none of that cheaply, and
a large flat file gets slow and awkward to diff and read.

Note: the owner already set the near-term answer for this item in the same 2026-06-16 decision
(Decision 2): stay on JSONL now, migrate to SQLite when the log passes 2,000 lines, Assaf owns the
trigger. This paper restates the design rationale and the migration options so the build is clean
when the trigger fires. It does not re-open the approved direction.

### Options
- Option A -- Stay on JSONL indefinitely. Trade-off: zero migration cost, human-readable, git-diffable;
  but no indexed queries, slow at scale, reporting requires custom scan scripts each time.
- Option B -- Migrate to SQLite at a defined size trigger (RECOMMENDED, matches approved direction).
  Trade-off: real indexed queries and reporting, single-file embedded DB (no server, no spend);
  but a one-time migration step, SQLite rows are not git-diffable like text, and we must keep a
  JSONL export path for human readability and audit.
- Option C -- Jump straight to a hosted/managed DB (e.g. Supabase/Postgres). Trade-off: strongest
  query/reporting and multi-writer story; but it is a new external tool (gated adoption: Rambo +
  Eyal), likely a cost (A1, budget 0), and overkill for a single-runtime P1 log.

### Recommendation
Option B. Keep JSONL now; migrate to a local SQLite file when the log passes 2,000 lines, with Assaf
owning the size trigger. Build the migration as: a one-time importer (JSONL -> SQLite), a thin
append wrapper, and a JSONL export-on-demand for audit/human reading so we never lose the readable
trail. Defer any hosted DB (Option C) until a real multi-writer or external-reporting need exists.

### What needs owner approval
- Direction already A1-approved (Decision 2, 2026-06-16). No new owner approval needed to PROCEED on
  Option B. The migration BUILD itself is an A2 operational task for Eco/R&D when the 2,000-line
  trigger fires; Eco notifies the owner when it runs.
- A1 only if we deviate to Option C (hosted DB), because that is a new external tool (gated) and a
  likely expense (budget 0).

---

## Item 2 -- Durable chat memory (store + retrieval via MCP)

### Problem
Agents lose context between sessions. Each wake-up starts cold and relies on re-reading files
(board, decisions-log, wiki). That is fine for canonical state but poor for softer continuity:
prior reasoning, what an agent already tried, owner steering nuance, cross-session threads. We want
agents to retain and retrieve relevant context across sessions without re-reading everything, and
without inventing memory (NO GUESS still holds -- retrieved memory must be a real stored record,
not a confident reconstruction).

Note: the owner already set the near-term answer in the same 2026-06-16 decision (Decision 3):
wiki-first now; SQLite keyword-search as the planned next step once Assaf and Ido are live;
embeddings only if keyword search proves insufficient. This paper restates the options and
trade-offs behind that staged path.

### Options
- Option A -- Wiki-first (current). Trade-off: zero new tooling, human-curated, already the source of
  truth for decisions; but retrieval is manual, coverage depends on Eco maintaining pages, and it
  captures conclusions, not the full reasoning trail.
- Option B -- SQLite keyword-search memory store, read/write via a local MCP memory tool
  (RECOMMENDED next step, matches approved direction). Trade-off: real cross-session store with cheap
  keyword retrieval, single-file embedded DB (no spend, no external host); but keyword search misses
  semantic matches, and it needs a small MCP wrapper plus a write discipline (what gets stored, by
  whom, retention).
- Option C -- Embeddings / vector retrieval (semantic search). Trade-off: best recall on fuzzy
  queries; but it usually means an embedding model and/or a vector store -- potential third-party
  model call (HARD RULE: no customer/personal data to any third-party model without A1 + Eyal
  privacy sign-off), possible cost (A1, budget 0), and a gated tool adoption. Premature for P1.

### Recommendation
Staged: keep wiki-first now (Option A), build the SQLite keyword-search memory store with an MCP
read/write tool (Option B) once Assaf and Ido are live, and only move to embeddings (Option C) if
keyword search proves insufficient in practice. Define a write discipline up front: what classes of
memory are stored, who may write, retention window, and an explicit rule that retrieved memory is
cited as a stored record (never used to manufacture certainty). Keep the store LOCAL (no third-party
model, no host) so it stays inside budget 0 and outside the gated/privacy surface.

### What needs owner approval
- Direction already A1-approved (Decision 3, 2026-06-16). No new owner approval to PROCEED on the
  Option B local SQLite + MCP build; that build is an A2 operational task for Eco/R&D once Assaf and
  Ido are live, owner notified.
- A1 required BEFORE Option C (embeddings) if it would (a) send any data to a third-party/hosted
  model -- then also Eyal privacy sign-off, or (b) adopt a hosted vector store -- then the Rambo +
  Eyal adoption gate -- or (c) incur any cost (budget 0). A purely-local embedding model with no
  data leaving the runtime would still need Rambo review but not the privacy/cost gate.

---

## Item 3 -- Gemini (or other second model) for non-sensitive research / second opinion

### Problem
We are Claude-only by design (model router Phase A, Claude-only skeleton; decisions-log 2026-06-10).
There is a real future value in a second model for NON-sensitive work: independent research,
second-opinion / cross-check on analysis, and cost diversity. The constraints are firm: budget is 0,
a hosted model is a gated tool adoption, and the HARD privacy rule applies to any third-party model.

Note: the owner already pre-approved this in principle in the same 2026-06-16 decision (Decision 4):
Gemini pre-approved in principle, the Rambo (Security) + Eyal (Legal) tool-adoption gate runs when
both are live, does not proceed if either flags, no spend / free tier only, any paid use is a
separate A1. This paper restates the design and the hard constraints behind that pre-approval.

### Options
- Option A -- Stay Claude-only (status quo). Trade-off: simplest, no new gate, no privacy surface,
  no spend; but no independent second opinion and a single-vendor dependency.
- Option B -- Add Gemini free tier for non-sensitive research / second-opinion only (RECOMMENDED,
  matches the in-principle pre-approval). Trade-off: independent cross-check and research breadth at
  zero cost (free tier); but it is a third-party hosted model -- so it MUST pass the Rambo + Eyal
  adoption gate, and the HARD RULE binds: NO customer or personal data to Gemini (or any third-party
  model) without explicit A1 + Eyal privacy sign-off. Scope must be fenced to non-sensitive,
  non-customer, non-personal inputs only.
- Option C -- Add a different / local open-weight second model instead. Trade-off: avoids the
  third-party-data and free-tier-terms surface if run locally; but heavier to host, possible compute
  cost, and weaker than a hosted frontier model for research quality.

### Recommendation
Option B, fenced. Proceed with Gemini free tier for NON-sensitive research and second-opinion ONLY,
through the Rambo + Eyal tool-adoption gate once both are live (both are now certified, so the gate
can run). Hard guardrails baked in: free tier only (any paid use is a separate A1); a written
allow-list of input classes (public/non-customer/non-personal research material only); an explicit
block on sending any customer or personal data without A1 + Eyal privacy sign-off; and the adoption
does NOT proceed if either Rambo or Eyal flags. Hosted = gated adoption -- this is not a self-grant.

### What needs owner approval
- Direction already A1-approved in principle (Decision 4, 2026-06-16). To ACTIVATE: run the Rambo
  (Security) + Eyal (Legal) tool-adoption gate; it does not proceed if either flags. No additional
  owner A1 is needed to RUN the gate for the free tier under the stated constraints.
- A1 (new, separate) required for ANY paid use of Gemini (budget 0).
- A1 + Eyal privacy sign-off required (separate, hard rule) BEFORE any customer or personal data is
  ever sent to Gemini or any third-party model. This is non-negotiable and independent of the
  adoption gate.

---

## Summary of asks to the owner

- Item 1 (JSONL -> SQLite): no new approval to proceed on Option B; build is A2 when the 2,000-line
  trigger fires (Assaf owns trigger). A1 only if we switch to a hosted DB.
- Item 2 (durable memory): no new approval to proceed on the local SQLite + MCP store (Option B) once
  Assaf and Ido are live; A2 build. A1 (plus Eyal privacy sign-off and/or adoption gate) only if we
  go to embeddings or any third-party/hosted/paid path.
- Item 3 (Gemini): pre-approved in principle; ACTIVATION = Rambo + Eyal adoption gate (free tier,
  non-sensitive only). Separate A1 for any paid use; separate A1 + Eyal sign-off before any
  customer/personal data ever reaches a third-party model.

All three keep budget at 0 and stay inside the gated-adoption and privacy rules. None of them touch
the excluded file-locking/concurrency decision.
