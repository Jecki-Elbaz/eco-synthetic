# Proposal: Agent Hiring Delegation (3-Gate Model)

Status: APPROVED -- owner A1, 2026-06-14. Enacted in constitution v2.3 (section 4). See decisions-log.md 2026-06-14 entry.
Author: Eco (CEO)
Date: 2026-06-14
Affects: constitution agent-creation rule (currently per-agent A1), board ONB tasks

## Problem
Today every agent creation is a single per-agent A1. That means the owner is in the
loop for the whole lifecycle of every hire -- need, build, certify, activate -- even
for roles already agreed as needed. The CEO cannot move the hiring pipeline without
the owner present for each agent. This bottlenecks go-live.

## Proposal
Replace the single per-agent A1 with a 3-gate model. The CEO owns the middle of the
pipeline autonomously; the owner keeps two clear decision points.

### Gate 1 -- Initiate (CEO autonomous, for pre-approved roles only)
For any agent the owner has ALREADY approved as needed (the roster's approved P1/P2
roles), the CEO may initiate the hiring process without further approval:
build the role file, write the hiring brief, and hand to Anat (HR) to run the
interview and certification. No owner approval needed to START this for an
already-approved role.

### Gate 2 -- Need approval (owner A1, for NEW roles only)
If the CEO judges the company needs an agent that is NOT already on the approved
roster, the CEO must get owner approval that the role is actually needed BEFORE
building anything. The CEO presents: the gap, why existing agents cannot cover it,
proposed scope, and reporting line. Owner approves the NEED, then Gate 1 applies.

### Gate 3 -- Activation (owner A1, every agent)
After the hiring process is complete (role file built, interview run, certified by
Anat) and BEFORE the agent does any real work, the CEO presents to the owner:
the process results, Anat's certification outcome, any conditional gaps, and the
CEO's recommendation. Owner approves ACTIVATION. Only then does the agent go live.

## What changes vs today
- CEO no longer needs owner present to build + certify an already-approved agent.
- Owner's involvement concentrates at two clean points: approving genuinely new
  roles (Gate 2) and approving go-live after seeing the finished result (Gate 3).
- The owner still sees and signs off every activation. No agent works unreviewed.

## What stays the same (red lines untouched)
- No agent goes live without owner A1 at Gate 3.
- New, unapproved roles still need owner A1 at Gate 2.
- All other A1 gates (spend, production, pricing, tools, external customers) unchanged.
- Append-only decisions log; every gate decision is logged.

## Open question for the owner
Gate 1 and Gate 3 still require a full-tool Claude Code session to execute the
actual creation and activation (the Telegram bridge has no Agent tool or write
access to .claude/agents/). This proposal removes the per-agent approval friction;
it does not remove the need for one privileged session to run the mechanics.
If you want the CEO to also batch-execute creations, that is a separate tooling
decision.

## Decision requested
Approve this 3-gate model to replace per-agent A1 for agent hiring (A1).
On approval: CEO updates the constitution and decisions log, then runs the
approved-roster hires through Gates 1 and 3.
