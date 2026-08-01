# Owner Dashboard -- Eco-Synthetic

**Last refreshed: 2026-08-01 02:04**

---

## P1 Tasks (open / in-progress)

- **APS-027** Adam 3-session review relay -- **open / URGENT** -- jecki (relay) + Eco -- first days Aug = TODAY; hard gate 15-Aug
- **SEC-0001** Guard enforce-mode flip -- in-progress -- Shir+Rambo+jecki -- clean window day 5; gate GREEN ~08-03
- **T-0020** Bridge sender auth (R1+R2-CODE unbuilt) -- in-progress -- Shir -- OWNER_ONLY_MODE spoofable
- **SHIR-010** Rambo perm-drift scan failing weekly -- open -- Shir -- error_final every run since 07-18; timeout fix landed 08-02, awaiting a clean rc=0 scan
- ~~**AUD-007** Runner hardening~~ -- **CLOSED 2026-08-02 as FALSE ALARM** -- the "PM Summary consecutive misses" were a retired job (see Per-Trigger Health). Residual: FIX-05 owner Task Scheduler checkbox, listed under Pending Owner Actions.
- **SHIR-007** Git sort (commit/push/reconcile) -- open -- Shir -- ESCALATED 07-27; zero delivery
- **SHIR-001** Bridge async-ack -- in-progress -- Shir -- ESCALATED 07-26; no build (3rd cycle)
- **T-0045** Stale-task detector script -- in-progress -- Shir (script) / Eco (interim) -- 2nd reactivation
- **T-0004** Model router Phase A build -- in-progress -- Gal -- stalled 2nd cycle; no code on disk
- **AUD-002** Production-readiness SOPs -- open -- Shir+Assaf -- target 15-Aug APS rehearsal
- **T-0040** Shelly comms on every wake-up -- in-progress -- Shir+Eco -- recurring active
- **APS-004** APS tool/legal gate -- in-progress -- Eco -- production go-live gate (no urgent action)

---

## Pending Owner Actions

- **APS-027 TODAY**: dispatch Eco/Ido/Gal/Adi (interactive session) to regenerate fresh live 3-session run; owner relays package to Adam. First days of August = now open. Hard gate: 15-Aug rehearsal.
- **SHIR-007 + SHIR-001**: dispatch Shir in interactive session (escalated 07-26/27; runner cannot spawn)
- **T-0020 R1-CODE**: dispatch Shir to enforce OWNER_ONLY_MODE in bridge (any Telegram user can message Eco now)
- **T-0046 + T-0049** (Gmail filter gate + autonomous-send gate): dispatch Rambo+Eyal in interactive session
- **T-0047**: check console.anthropic.com tier (API vs Consumer) -- closes Eyal C-E4 blocker
- **AUD-013**: apply Anat red-team coaching clause batch to 6 role files (batch ready 07-26; A1 required)
- **AUD-011**: A1 -- add Designer.md marketing/brand + marketing/avatars write scope (Rambo C2)
- **SEC-0001**: A1 flip when gate surfaces GREEN (~08-03)
- **AUD-007 residual (FIX-05)**: tick "Run task as soon as possible after a scheduled start is missed" on the Eco-Synthetic Runner Task Scheduler job (exact steps: integrations/runner/aud-007-delivery-shir-2026-07-12.md). Carried forward when AUD-007 closed 2026-08-02; low urgency -- no observed miss is attributable to it.

---

## Run-Queue (by lane)

Queue NOT ARMED (gated on SEC-0001 flip).

**Desktop lane** (underlying tasks may be stale -- verify before executing):
- RQ-002 | T-0038 Eco.md verify-before-forward | queued
- RQ-003 | Commit Noa role file | queued (Noa live 07-08 -- likely stale)
- RQ-004 | Email-send gate (T-0037) | queued (T-0037 closed 07-14 -- likely stale)
- RQ-005 | WhatsApp gate (T-0039) | queued (T-0039 closed 07-20 -- likely stale)

**Runner lane:** empty

---

## Per-Trigger Health

**How to read this section (rule added 2026-08-02):** a job's health is its LAST TERMINAL EVENT in
memory/agent-runs.jsonl (`done` rc=0 = OK; `error_final` = FAILING), never its last run DATE. A job
that fails every single week still shows a recent date. And before flagging a job as missing, check
integrations/runner/agent-prompts.md -- that file is the job registry of record. Six days of
"missed run" escalations (07-28..08-01, AUD-007) were spent on a job that had been retired.

- Eco 2h check-in | 2h | last 08-01 01:57 | OK
- Eco AM Brief | daily AM | last 07-31 09:57 | OK (today not yet fired)
- ~~Eco PM Summary | daily PM~~ | **RETIRED 2026-07-27** (owner directive: one morning digest is the only scheduled owner touch). De-registered from agent-prompts.md; last run 07-26 21:57. NOT a defect, NOT overdue -- the earlier "OVERDUE -- 5 days (AUD-007)" line here was wrong and is withdrawn.
- Eco agent-perf dashboard | per cycle | last 08-01 01:57 | OK
- Assaf daily cost | daily | last 08-01 01:57 | OK
- Assaf monthly review (T-0009) | monthly | last 08-01 01:57 | OK
- Ido DASH-001 | daily | last 07-31 01:57 | OK (current run)
- Oracle daily chronicle | daily | last 07-31 01:57 | OK
- Shir git-hygiene | daily | last 08-01 01:57 | OK
- Rambo guard-proof suite | per cycle | last 08-01 01:57 | OK
- Assaf weekly fitness | weekly Mon | last 07-27 | OK
- **Rambo perm-drift scan | weekly Mon | last 07-27 | FAILING (SHIR-010)** -- last TERMINAL event is `error_final` 2026-07-27T02:15:10 (TimeoutExpired -> TimeoutExpired). Only successful run on record is 2026-07-18 (`done` rc=0). Every attempt since (07-20 error_final, 07-24 error_final, 07-25 start with no terminal record, 07-27 error_final) failed. It read "OK" here for the whole 15-day failing streak because this section was reading the last run DATE. Timeout fix already landed (runner.py PER_JOB_TIMEOUTS raises this job to 900s, 2026-08-02); row closes when a scan completes rc=0.
- Lital + Eyal compliance | weekly | last 07-27 | OK
- Dalia QA audit | weekly | last 07-27 | OK
- Yael doc-hygiene | weekly Mon | last 07-27 | OK
- Rambo Adam Inbox Screen | EXPIRED 07-28 | last 07-28 23:57 | EXPIRED (by design)
- Shir bridge uptime | 15-30min | -- | PENDING BUILD
- MeetingPrep | event | -- | PENDING BUILD

---

## Quick Agent Roster

- **Shir** -- ~8 tasks -- 2 ESCALATED (SHIR-001, SHIR-007); saturated; zero delivery on escalations
- **Eco** -- recurring coordination; PM Summary job RETIRED 07-27 (not overdue -- AUD-007 closed false alarm 08-02)
- **Gal** -- T-0004 model-router build stalled (2nd cycle; interactive dispatch needed)
- **Ido** -- T-0004 oversight + APS pre-prod mandates
- **Anat** -- HR-001 R&R sweep (interactive session needed)
- **Rambo** -- T-0046, T-0049 gates + T-0020; blocked on interactive dispatch
- **Eyal** -- T-0046, T-0047, T-0049; blocked on interactive dispatch
- **Oracle** -- ORC-001 daily chronicle; active
- **Assaf, Dalia, Lital, Yael** -- 1-3 tasks each; no overdue flags
