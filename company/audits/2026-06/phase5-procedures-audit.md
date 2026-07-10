# Phase 5 -- Company Procedures & Workflow Audit

Program: company/audits/audit-program-plan.md (expansion, Phase 5). Date: 2026-07-11.
Auditors: Dalia (Q&G -- the procedures register + workflow walk) + Assaf (Op-Ex -- adherence + operational reality).
Synthesized by Eco, with an independent Eco verification of the headline finding. Register: company/governance/procedures-register.md.

---

## 1. Executive summary

The company has strong governance *rules* but thin *procedures* -- much is embedded in role files, the constitution, or
the runner prompt rather than in standalone SOPs, and several critical operational procedures do not exist at all. The
30-procedure register (company/governance/procedures-register.md) is the new canonical catalogue. Three findings dominate:

1. **CRITICAL, LIVE: the autonomous runner is degraded and the company's scheduled safety net has been dark ~12 days.**
   Independently verified from memory/runner-state.json + memory/agent-runs.jsonl: every weekly Monday job -- Rambo
   permission scan, Dalia quality/tone audit, Assaf fitness loop, Lital + Eyal compliance, Yael doc-hygiene -- last ran
   **2026-06-29**; the 07-06 Monday cycle never fired. Eco's PM summary is stale (last 07-09). The run log shows real
   failures: `TimeoutExpired` on the Opus Eco jobs, `ConnectionRefused`/`FailedToOpenSocket`, "Response stalled
   mid-stream", and "You've hit your session limit." An Eco 2h check-in on 07-10 flagged it itself. Root cause is a mix:
   the machine was almost certainly off/asleep on Monday 07-06 and Task Scheduler has **no missed-run catch-up**;
   account **session-limit + connectivity** errors on later days; and the **300s timeout is too tight for Opus Eco jobs**.
   Net: for ~12 days the standing security scan, quality audit, and compliance check have produced nothing.
2. **Procedures that don't exist:** incident response (proc 6 -- and Israeli PPL Amd.13's 72h breach clock cannot be
   met), release/deploy (proc 5), backup/restore (proc 7), on-call/acting-CEO (proc 8), concurrency/file-lock (proc 15 --
   T-0002's owner-approved lock was never built). These are the production-readiness gaps the APS pilot makes real.
3. **Procedures that exist but adherence is unverified:** the quality-audit log, permission-drift reports, and the
   lessons-learned process (zero confirmed runs -- SHIR-001, the 7-day outage, was never processed through it).

Tally (deduped): 3 critical, ~11 major, ~8 minor/observation. Much overlaps already-tracked board items
(AUD-001 file-lock, AUD-002 SOPs, AUD-004 CS-0001, AUD-006 matrix, SEC-0001 guard) -- Phase 5 confirms status and adds
the live runner-degradation finding, the "exists-but-unverified" class, and the register itself.

## 2. The procedures register

Delivered as company/governance/procedures-register.md -- 30 procedures, each rated Exists / Current / Followed / owner /
gap / severity. It is the answer to "does procedure X exist, and is it followed?" and the baseline for future audits.

## 3. Adherence reality (Assaf leg, Eco-verified)

- **Runner cadence:** 2h + daily jobs fire (with intermittent failures); **weekly jobs dark since 06-29** (verified).
- **Cost monitoring:** the daily snapshot runs but the token pipeline (memory/log.jsonl) has been **offline since ~07-01**
  -- snapshots correctly self-report DEGRADED but are blind to token/$ drift. (F-PA03/F-P11)
- **Git hygiene:** daily audit runs; recurring `rc=1` on Shir's audit script (edge case; non-blocking). (F-PA04)
- **Decision-logging / board:** append-only holds; board discipline maintained (some rows lack due dates). (F-P08)
- **Guard:** still shadow-mode; per-agent write scoping is inert; SEC-0001 B2 unconfirmed. (F-P07/F-P20)

## 4. End-to-end workflow walk (Dalia)

Two real traces (a task lifecycle via T-0041; a gate/decision via T-0037/GR-012) found six broken seams: no intake
validation, no routing SLA (a gate filed on Tuesday waits for the Monday-only Rambo cycle), the runner assignment is a
standing scan not a per-task envelope, no file-lock on gate-register.md, Edit-vs-Write-append ambiguity on the log, and no
gate-closure confirmation step (gates sit "in-progress" with owner actions untracked). These are procedural, fixable seams.

## 5. Findings

Full detail: Dalia F-P01..F-P20, Assaf F-PA01..F-PA13 (register rows below). The new-vs-known split:
- **New in Phase 5:** the live runner degradation (F-PA01/02/12), cost pipeline offline (F-PA03), quality-audit-log
  unverified (F-P10), lessons-learned never run (F-P17), Eyal EA-1/EA-2 overdue and runner-fixable (F-P12), the missing
  minor SOPs (SAFE_MODE runbook, secrets rotation, gate-request template, board-lifecycle, B1/B2), and the register itself.
- **Confirmed-still-open from Phase 2:** incident (AUD-002), release (AUD-002), backup (AUD-002), on-call (AUD-002),
  file-lock (AUD-001), CS-0001 (AUD-004), access-matrix drift (AUD-006), guard flip (SEC-0001), cost instrumentation (AUD-002).

## 6. Recommendation

The register + workflow walk answer "are the procedures in place?" -- mostly no, or embedded. But the *urgent* Phase 5
output is operational, not documentary: the scheduled audit machinery is failing silently in production. Fix the runner
first (catch-up + timeout + the session-limit reality), then the missing-SOP backlog rides the existing AUD-002 with the
APS 15-Aug target. Triage below.
