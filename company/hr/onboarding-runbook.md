# Onboarding runbook -- 7 P1 agents, single-pass execution

Purpose: bring the seven P1 agents live in one Claude Code session (full tools), with one
batch A1 from jecki. Eco authored all prerequisites from the Telegram bridge 2026-06-14;
this runbook is the execution checklist for the full-tool session. ASCII only.

## Why a separate session is required
The Telegram bridge has Read/Write/Edit only and treats .claude/agents/ as read-only.
Instantiating a role file (write to .claude/agents/) and running Anat's interview (Agent
tool) both need a full Claude Code session. Nothing below can run from the bridge.

## Prerequisites -- all DONE (verify before starting)
- Role-file drafts: company/hr/role-drafts/{Rambo,Ido,Dalia,Lital,Eyal,Noam,Assaf}.md
- Hiring-manager briefs (mandatory cert input per Anat.md v1.1):
  company/hr/role-requirements-briefs.md
- Board pipeline: memory/board.md ONB-001..008
- Build-order rationale: company/hr/role-drafts/README.md

## Build order (security first, then R&D unlock, then the rest)
1. Rambo (Security) -- gate enforcement should exist before more agents land
2. Ido (VP R&D) -- unlocks the R&D group + his scope task (T-0001)
3. Dalia (Quality & Governance) -- unblocks T-0012 access-matrix reconciliation
4. Lital (CFO)
5. Eyal (Legal)
6. Noam (Product)
7. Assaf (Operational Excellence)
(Hila / ONB-001 is cert-only -- no build; run her interview in the same session.)

## One-time gate (jecki, start of session)
A1 batch approval: "Create these 7 agents from their drafts." Agent creation is A1
(red line 6). One approval covers the batch; the owner has seen every draft and brief.

## Per-agent steps (repeat for each, in order)
1. FINALIZE: copy company/hr/role-drafts/<Name>.md -> .claude/agents/<Name>.md, prepend
   the soul Core Block verbatim (per company/soul.md), keep ASCII.
2. GATE 3 -- owner review (A1 required before activation): present the finalized role file
   and a one-paragraph summary to jecki on Telegram. Ask for go-live approval. WAIT for A1.
   Do not proceed to step 3 without it. (3-gate delegation approved 2026-06-14.)
3. CERTIFY (after Gate 3 A1): Anat runs the interview using the brief in
   role-requirements-briefs.md; verifies each professional-qualification bar; writes the
   record to company/hr/interviews/<name>-interview.md.
4. AUTO-START: if the agent has AUTO-START tasks on the board, mark them in-progress
   immediately on activation (e.g., RAM-001 for Rambo; RD-001 for Ido).
5. RECORD: append a certification entry to company/decisions/decisions-log.md (append-only).
6. UPDATE: set the agent's row in memory/wiki/agent-roster.md (certification status) and
   close the matching ONB-00x row in memory/board.md.

## On completion
- Roster: all 7 + Hila marked certified in memory/wiki/agent-roster.md.
- Unblocks: ONB rows closed; HIL-001..004 move to open; T-0012 ready for Dalia; Ido scope
  task (T-0001) assignable; Rambo permission scans (T-0003) can begin.
- Eco reports go-live status to jecki on Telegram.

## Owner note
If any qualification bar in role-requirements-briefs.md should be stricter, jecki amends
that file before the session and Anat applies the amended brief.
