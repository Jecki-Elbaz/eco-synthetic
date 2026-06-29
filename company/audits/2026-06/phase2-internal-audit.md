# Phase 2 -- Internal Audit (Operational Excellence + Quality & Governance)

Program: company/audits/audit-program-plan.md. Date: 2026-06-29.
Auditors: Assaf (Op-Ex; fitness, cost, operational gaps) + Dalia (Q&G; quality, decisions-log integrity,
access-matrix, tone, process-gap register, orchestration). Synthesized by Eco. Register rows: findings-register.md.

> Context shift since the program was approved (2026-06-18): the company is no longer pre-product. The
> autonomous runner (SHIR-005) is LIVE and fires every 2h; the Telegram bridge is restored; and a real
> product -- the AI Patient Simulator (APS) -- is in the gate+feasibility phase heading to a 1-Sep pilot.
> Phase 2 is read through that lens: operational + governance maturity now gates a real launch, not a hypo.

---

## 1. Executive summary

Strong governance discipline at the document layer; the gaps are where a one-person, fast-moving company
meets a real product with student PII and a hard deadline. **No critical agent-behaviour failures** -- the
issues are operational SOPs that don't exist yet, governance records that drifted as the fleet 5x'd, and a
live autonomous runner that introduced new enforcement surface while the guard is still in shadow mode.

Three things are genuinely urgent and converge on the **1-Sep APS pilot**:
1. **T-0034 (company registration) is on hold but is the legal critical path** for the pilot (registration ->
   college DPA -> student PII -> launch). 9 weeks of runway; registration itself is ~1-3 days. (F-D18)
2. **No production SOPs** -- release, monitoring/alerting, incident response, backup, on-call. The bridge was
   dark 18 days with no alert; that cannot happen with students in the loop. (F-O01/02/03/04/06)
3. **The live runner races on shared files** with no lock (T-0002's file-lock decision was never built) and
   the guard is still shadow-mode, so per-agent write scoping is behavioural-only every 2h. (F-D17, F-D26)

Tally: 3 critical, ~14 major, ~11 minor/observation across both legs. Full per-finding detail: register.

## 2. Fitness loop (Assaf)

29 internal agents live (+ Shelly separated/external, Yossi staged). Most L4 specialists are ready but idle,
awaiting product work -- correct for this stage. Only 4 agents fire on the runner (Eco 2h+AM/PM, Assaf daily,
Yael weekly, Oracle daily); the rest are ad-hoc/triggered -- also correct (no broadcast). Signals:
- **Eco overloaded on Opus** -- frontmatter pins claude-opus-4-8 for every task; should default Sonnet +
  escalate. Cost leak; the runner multiplies it ~12x/day. (fitness + F-D01 model-binding)
- **No real token/cost instrumentation** -- agent-runs.jsonl logs out_chars, not tokens or $ -- so cost-drift
  is invisible. Manual snapshots only. Needs real instrumentation before the pilot. (F-O02-cost)
- 11 agents <2 weeks old; first true utilisation read at the 30-day R&R.

## 3. Operational-gap flags (Assaf) -- production readiness for the pilot

| id | gap | sev |
|---|---|---|
| F-O01 | No release/CI-CD gate -- code reaches master via ad-hoc direct pushes, no PR review, no automated test/lint | major |
| F-O02 | No monitoring/alerting -- bridge dark 18 days with no alert; runner errors silent; zero uptime SLA | **critical** |
| F-O03 | No incident-response runbook or escalation SLA -- SHIR-001 took 7 days to diagnose | major |
| F-O04 | Single points of failure -- solo Shir (DevOps), Ido, Eco; no backup/acting-CEO; no outage runbook | major |
| F-O05 | No standing audit cadence -- security/quality/cost reviews are ad-hoc, not scheduled | major |
| F-O06 | No backup/restore strategy -- repo lives on the owner machine + one GitHub remote; nothing tested | major |

## 4. Quality + governance findings (Dalia)

- **Stale role-file identity blocks** -- Assaf (F-D02) and Yael (F-D03) role files still say "PENDING owner
  A1" / "staged, not live" though both certified+live since 2026-06-17/18; Oracle still says "Persona name
  TBD" (F-D06). Live agents whose own files report the wrong status. Quick owner-A1 corrections.
- **Decisions-log integrity** -- append-only holds (no edits); DAL-003 dedup is clean (F-D08). Two items: a
  2026-06-15 entry sits after 2026-06-17 entries from a branch-merge ordering breach -- fix by appending a
  note, never reorder (F-D07); and the T-0032 "hallucinated packages" board status conflicts with the
  gate-register's "GRANTED" rows -- needs one resolving entry (F-D09).
- **Access-matrix drift** -- Oracle's broad-read exception (flagged 2026-06-18) still not in the matrix
  (F-D10); Yossi's .claude/agents/ need unresolved (F-D11); runner output paths + project security-report
  paths not reflected (F-D12/D13). Batch at the next A2 revision.
- **Tone/policy** -- POL-001 human-comms policy + policy-framework are still DRAFT, never A2/A1-activated
  (circular dependency, F-D25); POL-001's "no double-hyphen" needs a chat-only clarifier vs the file ASCII
  rule (F-D14); no soul Core Block integrity check since the fleet 5x'd (F-D15).

## 5. Orchestration design cross-check (Dalia) -- new risk from the live runner

- **F-D26 / SEC-0001** -- GUARD_MODE=shadow with the runner LIVE means per-agent write-scope is unenforced
  every 2h. The shadow-validation window started 2026-06-28 but nobody is reviewing the shadow logs. Needs a
  defined review (e.g. 72h clean) before the enforce flip. (major; ties to Phase 1 SEC-0001)
- **F-D27** -- unverified whether RUNNER_CONTEXT (which strips Bash/spawn on the runner path) propagates to a
  sub-agent spawned BY a runner-spawned agent (e.g. Eco). If not, a runner-context spawn could regain full
  tools -- a guard-bypass. Shir to verify. (major)
- **F-D17** -- the T-0002 file-lock (owner A1 2026-06-16) was never built; the runner fan-out + parallel
  sessions race on board.md/decisions-log.md with last-write-wins. Now a real build item, not hygiene.
  (critical)

## 6. APS critical-path process gaps (Dalia) -- converge on the pilot

- **F-D18** -- T-0034 registration on hold is THE legal blocker for the Sep-1 pilot (see the decision brief).
- **F-D22** -- DPA templates (college DPA, Hebrew student consent, Anthropic DPA) not drafted; all
  APS-blocking; Eyal P1.
- **F-D21** -- no incident-response process, and Israeli PPL Amendment 13 mandates a 72-hour breach-
  notification clock that cannot currently be met -- required before any student data is handled.
- **F-D19** -- CS-0001 customer-comms policy unblocked 2026-06-24, no progress since; gates any customer
  contact (the design partner is already in play via owner relay).
- **F-D23** -- Yossi holds T-0031 but his B3-B7 never ran; an uncertified agent owns a deliverable.

## 7. Recommendation

Phase 2 confirms the company is sound but operationally immature for a real launch. The path forward is NOT
more audit -- it is to turn the APS pilot deadline into the forcing function for the SOPs and the legal
critical path. Triage below; the T-0034 decision (company/audits/2026-06/t0034-registration-decision.md) is
the one that can't wait.
