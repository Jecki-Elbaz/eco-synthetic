# Eco-Synthetic Procedures Register

Canonical list of every work procedure/workflow the company needs, with adherence status.
Owner: Dalia (Q&G). Created 2026-07-11 (audit Phase 5). Review cadence: quarterly + on any new procedure.
Legend -- EXISTS: yes (dedicated doc) / partial (scattered or embedded) / no. CURRENT: yes / stale / n/a.
FOLLOWED: yes / partial / no / unverified / n/a (not yet triggered). SEV of the gap where one exists.

| # | Procedure | Owner | Exists | Current | Followed | Gap (short) | Sev |
|---|-----------|-------|--------|---------|----------|-------------|-----|
| 1 | Hiring + certification (B1-B7/Stage C) | Anat + Eco | partial | yes | yes* | B1/B2 not proceduralized; Yossi/Noa exceptions | minor |
| 2 | Tool-adoption gate | Rambo + Eyal | partial | yes | yes | no initiation->closure SOP; no leg SLA; no closure confirm | minor |
| 3 | Escalation (chain of command) | Eco | partial | yes | partial | no standalone SOP; loop caps behavioral | minor |
| 4 | Decision-logging (append-only) | Dalia | yes | yes | yes* | SEC-0001 B2 (Edit->Write-append) unconfirmed; F-D07 ordering | minor |
| 5 | Release / deploy | Shir + Ido | **no** | n/a | **no** | no release gate, PR review, CI, rollback SOP | **major** |
| 6 | Incident response (+ PPL 72h clock) | unassigned | **no** | n/a | **no** | no runbook; PPL breach clock cannot be met | **critical** |
| 7 | Backup / restore | unassigned | **no** | n/a | **no** | single machine + one remote; nothing tested | **major** |
| 8 | On-call / acting-CEO | unassigned | **no** | n/a | **no** | solo Eco/Shir/Ido; no backup designation | **major** |
| 9 | Audit cadence | Dalia/Rambo/Assaf | partial | yes | **partial/FAILING** | weekly audits not firing since 06-29 (see report) | **critical** |
| 10 | Customer comms (CS-0001) | Mike | partial | stale | n/a | v0.1 DRAFT, not A1; Eyal EA-2 open | major |
| 11 | Human comms policy (POL-001) | Dalia | yes | yes | partial | live 07-09; local-time bridge dependency | observation |
| 12 | Chronicle capture (Oracle) | Oracle | partial | yes | yes | embedded in runner prompt; no process file | observation |
| 13 | Runner / proactivity ops | Assaf + Shir | partial | yes | yes | no runner-down / job-management runbook | minor |
| 14 | Cross-project handoff (Shelly) | Eco + Shir | partial | partial | partial | no SOP, no response SLA (T-0040 wiring) | minor |
| 15 | Concurrency / file-lock | Shir | **no** | n/a | **no** | T-0002 lock never built; runner races (AUD-001) | **critical** |
| 16 | Model + cost governance | Assaf + Eco | partial | partial | partial | no token instrumentation; no cost thresholds | major |
| 17 | Access-matrix change process | Dalia + Rambo + Eco | yes | yes | partial | AUD-006 drift items not formalized | major |
| 18 | SAFE_MODE / kill-switch | Rambo + owner | partial | partial | n/a | no operational runbook | minor |
| 19 | Secrets handling | Rambo | partial | yes | yes | no rotation policy or exposure-response | minor |
| 20 | Lessons-learned / post-incident | Dalia | yes | yes | **unverified** | zero confirmed runs; SHIR-001 not processed | minor |
| 21 | Permission-drift scan (Rambo weekly) | Rambo | yes | yes | **FAILING** | not firing since 06-29; output files unconfirmed | major |
| 22 | R&R review cadence | Anat | partial | yes | yes | no sweep-vs-live-interview procedure doc | observation |
| 23 | Quality + tone audit (Dalia weekly) | Dalia | partial | yes | **unverified/FAILING** | log file unconfirmed; not firing since 06-29; no post-FLAG path | major |
| 24 | Compliance-deadline check (Lital+Eyal weekly) | Eyal + Lital | yes | yes | partial | EA-1/EA-2 overdue; not firing since 06-29 | major |
| 25 | Board task lifecycle (intake->closure) | Eco | partial | yes | partial | no intake validation/closure checklist; stale rows | major |
| 26 | Gate-review initiation | Eco + Rambo | partial | yes | yes | no gate-request format | minor |
| 27 | Wiki / KB maintenance | Yael + Oracle + Eco | partial | yes | partial | no maintenance SOP; file-index existence unconfirmed | observation |
| 28 | Guard enforce-mode flip (shadow->enforce) | Rambo + Shir + owner | partial | partial | partial | B2 list undocumented; SEC-0001 | major |
| 29 | Git / commit hygiene | Shir | yes | yes | yes | recurring audit rc=1 (edge case) | minor |
| 30 | Model-config / opus-leak audit | Assaf | partial | yes | partial | folded into cost governance; runner model-bind OK | observation |

\* "yes*" = the rule is adhered to with a noted exception or open sub-item.

Detail + findings: company/audits/2026-06/phase5-procedures-audit.md (findings F-P01..F-P20, F-PA01..F-PA13).
Headline: procedures 6, 9, 15 are the critical gaps; procedure 9 (audit cadence) is actively FAILING in production
-- the weekly security/quality/compliance audits have not run since 2026-06-29.
