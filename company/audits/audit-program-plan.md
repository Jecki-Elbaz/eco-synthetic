# Eco-Synthetic Company Audit + Dry-Run Program (approved 2026-06-18)

Status: APPROVED by owner (jecki), 2026-06-18. Execute one phase per dedicated session.
Owner triages every finding (FIX NOW / BACKLOG / IGNORE) before the next phase starts.

## Context

The company has ~31 agents (29 certified+live, Shelly running, Yossi staged) plus the full governance stack.
Before moving to real product work, the owner wants independent assurance that: (1) every agent works as
designed -- independently AND as a team; (2) all necessary processes and workflows are in place.

Owner decisions baked in: (a) hire a permanent **Red-Team agent first** (Phase 0); (b) external audit (Phase
3) against **ISO 9001 + ISO 27001 + AI-company best practice**; (c) dry run (Phase 4) = the **delivery-saas
Phase-1 planning package**; (d) **one dedicated session per phase**.

## How to execute

- One Claude Code session per phase (0, 1, 2, 3, 4). Each ends by presenting that phase's findings register
  for owner triage. Next phase does not start until triage is done and FIX-NOW items are resolved.
- Output: `company/audits/2026-06/` -- one report per phase + one cumulative master findings register.
- Findings register row: `| id | phase | area | severity (critical/major/minor/observation) | finding |
  recommended fix | owner disposition (fix-now/backlog/ignore) | resolution ref |`.
- Triage: FIX-NOW -> fix in-session (role-file/governance edits are owner A1; use the established lock-in
  pattern). BACKLOG -> add a row to `memory/board.md` with owner + priority. IGNORE -> record rationale.
  Log the triage as one entry in `company/decisions/decisions-log.md`.
- Sandbox discipline (every test): fresh isolated sub-agents; work-product only; do NOT write governance
  files during tests; seal answer keys; `git status` + revert stray writes after each batch.
- Runtime: Phases 1-4 run in a Claude Code session via the Agent tool (Bash agents ARE spawnable there; the
  Telegram-bridge spawn-allowlist is bridge-only). New agent types are not spawnable until a session reload
  (Phase 0 accounts for this).

## Phase 0 -- Stand up the Red Team (hire)
Stage A owner A1 -> B1 role file (Red-Team Security Tester, L4, reports to Rambo; adversarial INTERNAL
testing only; hard ethical boundary -- never real exfiltration / never external targets / authorized sandbox
only / log everything; least-privilege: Read/Grep/Glob + Write scoped to company/audits/redteam/, no Bash) ->
B2 spec (3 scenarios incl. the refuse-a-real-attack boundary) -> reload -> B3/B4(Anat)/B5(Rambo)/B6(Rambo)/
B7(Eco) -> Stage C owner A1 -> live. Also write `company/processes/red-team-charter.md`.

## Phase 1 -- Internal Security Audit (Rambo + Red Team)
Rambo: refresh full permission scan of all 31 agents (least-privilege, RL coverage, model-config, write-path,
spawn-allowlist, secrets hygiene, audit-trail integrity, T-0020 status). Red Team: sandbox adversarial
simulations across a sample (prompt injection, permission-escalation/self-grant, chain-of-command bypass,
data-exfil, decisions-log tampering, gate-bypass); re-test the git-sync diff-09 classification gap. Each
finding carries a mitigation. -> `phase1-security-audit.md` + register -> owner triage.

## Phase 2 -- Internal Audit (Assaf + Dalia)
Assaf: fitness loop across all agents + usage/cost baseline + operational-gap flags (release/CI-CD/monitoring/
incident SOPs, audit cadence). Dalia: quality-sample outputs vs constitution/soul/red-lines; decisions-log
integrity (+ DAL-003 dedup); access-matrix consistency; tone governance; the process-gap register (CS-0001,
human-comms policy A1, release SOP, incident response, privacy/DPA templates, training curriculum/Yossi,
audit cadence, concurrency lock). Cross-check orchestration design on paper. -> `phase2-internal-audit.md` +
register -> owner triage.

## Phase 3 -- External Audit (Claude as independent ISO/Quality auditor)
Audit the company AND the internal-audit machinery against ISO 9001 + ISO 27001 + AI-company best practice.
Classify findings (major/minor nonconformity / observation / OFI); formal report with exec summary, scope,
method, clause-by-clause findings, prioritized recommendations for Eco + owner. Coverage: QMS (leadership,
document control, competence/training, operation, performance evaluation, continual improvement); ISMS (risk
treatment, access control, supplier/tool control, ops security, incident mgmt, audit logging, continuity);
AI best practice (least-privilege, injection defenses, human-in-loop gates, truthfulness, model governance,
orchestration safety). -> `phase3-external-audit-report.md` + register -> owner triage.

## Phase 4 -- Dry Run (delivery-saas Phase-1 planning package)
Real end-to-end project exercising EVERY agent. Owner gives a short brief; Eco routes via the chain:
Perry (PRD) -> Tal (UX/wireframe) -> Ido+Gal (architecture/feasibility) + Shir (infra) + Roman (routing algo)
+ Adi (QA strategy) -> Sami (IL SME) -> Lital (cost) + Eyal (privacy/terms) -> Sally+Hila+Alex (positioning/
pricing/GTM) -> Mike+Jenny+Jack+Ella (CS-0001 + onboarding/training/support) -> Rambo+Red-Team (security
review) -> Assaf+Dalia (ops/quality) -> Oracle (chronicle) + Yael (index) -> Luci (challenge) -> Erez
(viability) -> Eco synthesize -> owner A1. Artifacts land in `projects/delivery-saas/docs/`. Also capture
`phase4-dry-run-observations.md`: per agent, did it work independently + as a team; orchestration friction;
runtime issues. These are findings. -> owner triage. (Product GO is a separate A1.)

## Constraints
Reload constraint (Phase 0). Sandbox + seal all tests. Decisions-log append-only (supersedes-notes only).
FIX-NOW role-file/governance edits are owner A1. Phase 3 must stay independent (not rubber-stamp internal
findings). Commit each phase (pull/rebase first; never commit .env).

## Verification
Phases 0-3 each produce a report in company/audits/2026-06/ + register rows with owner dispositions (FIX-NOW
rows show a resolution ref). Phase 4 produces a real planning package in projects/delivery-saas/docs/ with a
traceable contribution from every live agent + an observations report. The two questions are answered with
evidence. A closing decisions-log entry records the program outcome + dispositions.

(Mirror of the working plan at ~/.claude/plans/the-only-thing-left-idempotent-key.md.)
