# Eco-Synthetic Company Audit + Dry-Run Program (approved 2026-06-18)

Status: APPROVED 2026-06-18; EXPANDED by owner directive 2026-06-29 (Phases 5-8 added; Phases 3-4 re-scoped).
Execute one phase per dedicated session. Owner triages every finding (FIX NOW / BACKLOG / IGNORE) before the
next phase starts. PROGRESS: Phases 0, 1, 2 DONE (reports in company/audits/2026-06/); Phases 5-8 PENDING owner
green light; Phase 3 (external ISO) HELD until after the APS 2026-08-15 go/no-go; Phase 4 folded into the live
AI-Patient-Simulator retro.

## Context

The company has ~31 agents (29 certified+live, Shelly running, Yossi staged) plus the full governance stack.
Before moving to real product work, the owner wants independent assurance that: (1) every agent works as
designed -- independently AND as a team; (2) all necessary processes and workflows are in place.

Owner decisions baked in: (a) hire a permanent **Red-Team agent first** (Phase 0); (b) external audit (Phase
3) against **ISO 9001 + ISO 27001 + AI-company best practice**; (c) dry run (Phase 4) = the **delivery-saas
Phase-1 planning package**; (d) **one dedicated session per phase**.

## Program expansion (owner directive 2026-06-29)

On TOP of Phases 0-4, the audit must now verify -- for the WHOLE company and EVERY live agent -- (1) all work
procedures/workflows, (2) R&R correctness, (3) agent performance, (4) security, and the two load-bearing
questions the owner named: (5a) is each agent CAPABLE of doing its job 100% (has everything it needs), and
(5b) is each agent DOING its job 100% (delivering against its mandate). Added as Phases 5-8 below. Same
execution rules (one session per phase, fresh sealed sub-agents, no agent grades itself, independent assessors,
owner triage before the next phase, commit per phase). Re-scope confirmed 2026-06-29: Phase 3 held until after
the APS 2026-08-15 engine go/no-go; Phase 4 folded into the live APS retro. Recommended order for the new work:
5 -> 6 -> 7 -> 8 (procedures inform R&R; capability precedes performance; the adversarial security sweep caps it).

**Two-axis Agent Fitness definition (used in Phases 6-7):**
- **CAPABLE ("can do 100%")** = for EVERY responsibility in its role file, the agent has sufficient TOOLS (not
  merely non-excess), ACCESS (read/write paths), INPUTS (produced by live upstreams), DEPENDENCIES (the agents/
  systems it relies on are live), MODEL fit, and demonstrated COMPETENCY. This is the MIRROR of Phase 1: Phase 1
  checked "not too much" (excess / least-privilege); Phase 6 checks "enough" (sufficiency). A capability gap =
  a stated responsibility the agent cannot execute today, with the specific blocker named.
- **DOING ("is doing 100%")** = actual deliverables + quality vs its responsibilities + KPIs, measured against
  what was DUE given its triggers/tasks to date -- NOT raw activity. A correctly-idle on-demand or pre-product
  agent that performs when invoked scores 100%. The gap = a due responsibility with missing or substandard output.
- Every live agent lands on ONE Agent Fitness Scorecard (Capable% x Doing%) in one of four quadrants:
  FIT / capable-but-idle / willing-but-blocked / neither -- with evidence + the specific blocker or miss per gap.

## Phase 5 -- Company Procedures & Workflow Audit (Dalia lead + Assaf; per-owner input)
Build the canonical PROCEDURES REGISTER (company/governance/procedures-register.md): enumerate every work
procedure/workflow the company needs -- hiring+cert, tool gate, escalation, decision-logging, release/deploy,
incident response, backup/restore, on-call, audit cadence, comms (CS-0001 + human-comms), chronicle, runner ops,
cross-project handoff, concurrency/file-lock, model/cost governance. For EACH: EXISTS? (documented) / CURRENT?
(matches reality) / FOLLOWED? (adherence evidence) / owner / gap + fix. Then an end-to-end walk of a real task
lifecycle (intake -> routing -> delivery -> logging) to find broken seams. Absorbs the Phase 2 SOP gaps (board
AUD-002) into a structured register rather than a fresh list. -> phase5-procedures-audit.md + register rows -> triage.

## Phase 6 -- R&R + Agent Capability Audit ("can each agent do its job 100%?") (Anat lead + each manager + Rambo access-sufficiency)
Per agent, two parts:
(6a) R&R CORRECTNESS: role file vs the gold template AND vs reality -- complete (all sections incl. KPIs,
triggers, escalation, identity/version block), accurate (status/persona/model current -- Phase 2 found stale
blocks), coherent chain of command; plus ORG-LEVEL no-overlap / no-gap: every needed function owned by exactly
one agent, no orphan responsibility, no duplicate ownership.
(6b) CAPABILITY: for each responsibility confirm sufficient tools/access/inputs/dependencies/model, THEN a
fresh sealed LIVE capability spot-test (reuse the B3 competency harness): a representative real task -> did the
agent actually deliver with what it has? Capability% = share of responsibilities executable today; name every
blocker. Independent: managers + Anat evaluate; Rambo confirms access sufficiency; no agent tests itself; seal
the answer keys; git status + revert stray writes after each batch. -> phase6-rr-capability-audit.md + per-agent
capability scorecard -> triage.

## Phase 7 -- Agent Performance Audit ("is each agent doing its job 100%?") (Assaf lead + Dalia quality + each manager)
Per agent: actual DELIVERABLES vs responsibilities + KPIs; invoked-when-it-should-be? delivers-when-invoked?
work-product QUALITY (Dalia sample vs constitution/soul/red-lines); UTILIZATION + escalation/loop-cap behaviour
(Assaf, from agent-runs.jsonl / board / real deliverables). Measured against DUE output, not raw activity
(idle-by-design is fine if it performs on invocation). Performance% = quality-weighted delivery vs due
responsibilities; name every miss. MERGE 6+7 into the single AGENT FITNESS SCORECARD (Capable% x Doing% quadrant
per agent, company/audits/2026-06/agent-fitness-scorecard.md). -> phase7-performance-audit.md + scorecard -> triage.

## Phase 8 -- Security Refresh & Full Red-Team Sweep (Rambo + Red)
Re-run Phase 1 across the EXPANDED surface: the live runner + guard (verify the RUNNER_CONTEXT hard-enforcement
and SEC-0001 enforce-readiness -- is the shadow-log window clean enough to flip to enforce?), the APS project
partition, and the NEW agents (RedTeam/Red, Noa/Senior-Dev-2 with scoped Bash). Red adversarial sims across a
sample from EVERY group + the new agents + a runner-context escape attempt + an APS cross-partition read. Refresh
diff-09. Each finding carries a mitigation. -> phase8-security-refresh.md + register -> triage.

## How to execute

- One Claude Code session per phase (0-8). Each ends by presenting that phase's findings register for owner
  triage. Next phase does not start until triage is done and FIX-NOW items are resolved. Per-agent phases (6,
  7, 8) fan out across the fleet via parallel sub-agents; they are the token-heavy phases.
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
