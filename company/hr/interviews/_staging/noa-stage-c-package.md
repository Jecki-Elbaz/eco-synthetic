# Noa (Senior Developer 2) -- Stage-C Go-Live Package

Status: READY FOR OWNER STAGE-C (A1). Prepared by Eco (B7 go-recommendation), 2026-06-29.
Role: Full-stack TS engineer (NestJS, Next.js App Router, Prisma/PostgreSQL, Bash), R&D group,
reports to Ido. Hired for AI Patient Simulator Sprint 2 (builder for items 5-9: case authoring
UI, Hebrew RTL, credit/token mgmt, StubProvider, failure-sim hooks). Stage-A approved owner A1
2026-06-29 (APS-009).

## Certification trail
- B1 role-file draft + B2 spec: Anat. B2 APPROVED -- Ido counter-signed the added hands-on
  build Scenario 4 (Bash actually invoked; valid TS; missing field surfaced not guessed).
- B3: DOC-REVIEW PASS (Eco-approved method). Live behavioral B3 DEFERRED to Sprint-1 week 2
  (~2026-07-21) as a HARD confirmatory gate -- can still fail and trigger R&R.
- B4: PROVISIONAL certification (Anat), full cert suspended until live B3 passes.
- B5 security (Rambo): CLEAR-WITH-CONDITIONS. Bash justified (Gal/Adi basis); least-privilege PASS.
- B6 manager sign-off (Ido): APPROVE.
- B7 go-recommendation (Eco): GO, with the conditions below.

## Conditions baked into the role file (Rambo C1-C4)
- C1: Noa stays OFF the agent-tool permitted-spawn allowlist until T-0020 C3 is resolved
  (does NOT block certification or direct-CLI go-live).
- C2: Bash scope = build commands only (git, pnpm, docker-compose, Prisma migrations,
  Next.js/NestJS build); no admin/destructive ops (rm -rf, DROP TABLE, force-push main) without
  explicit A1 in-session; ambiguous command = stop and flag Ido.
- C3: Ido task envelopes name exact build/migration commands (behavioral; Ido owns).
- C4: red-line-3 restatement injected into Noa's spawn context every spawn.

## C4 confirmation (Ido B6 condition) -- RESOLVED for the real spawn path (Shir, 2026-06-29)
- Direct-CLI / dev-session path (how Noa is actually spawned near-term): CONFIRMED. The
  red-line-3 restatement is already verbatim in Noa's role-file Boundaries; it loads every
  session once the role file is committed at Stage C.
- Runner path: N/A (Noa is not a scheduled runner agent).
- Bridge path (defense-in-depth only; if Noa is ever invoked via the Telegram bridge): small
  STAGED bridge.py change -- add Noa to _AGENT_ACCESS/_AGENT_TOOLS + a per-Bash-agent red-line-3
  block in _build_bridge_context(). A3 config change: Ido authorizes -> Shir wires (staged, not
  deployed). Tracked as go-live prep; does NOT block Stage C (Noa's real path is direct CLI).

## What Stage-C requires from the owner (A1)
1. Session RELOAD -- a new agent type is not spawnable/testable until reload.
2. Stage-C GO-LIVE approval (A1) -- commit noa-role-file-draft-b1.md to .claude/agents/ as Noa.
   (Owner-only path; .claude/agents/ changes are A1.)
- Earliest Stage-C-ready: 2026-07-02. Realistic window: 2026-07-03 to 2026-07-07. Holds the
  1 Sep pilot if confirmed by 07-07.

## Post-go-live confirmatory gate
- Live behavioral B3 in Sprint-1 week 2 (~2026-07-21): runs the 4 scenarios against the spawned
  Noa; confirms Scenario 3 RTL depth + Scenario 4 live Bash/TS. Pass -> full cert. Fail -> R&R,
  go-live suspended.
