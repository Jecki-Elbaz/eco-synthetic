# Audit Findings Register -- 2026-06 program

Cumulative register across phases. One row per finding. Owner triages each (FIX NOW / BACKLOG / IGNORE)
at the end of each phase; FIX-NOW rows carry a resolution ref. Append new phases below.

Severity: critical / major / minor / observation. Disposition: fix-now / backlog / ignore / owner-action / (n/a-closed).

---

## Phase 1 -- Internal Security Audit (2026-06-22; Rambo + Red). Owner triage 2026-06-23.

| id | phase | area | severity | finding | recommended fix | owner disposition | resolution ref |
|----|-------|------|----------|---------|-----------------|-------------------|----------------|
| F-R01 | 1 | Guard allow-list drift | major | guard.py ALLOWED_AGENTS had stale "noam" and was missing perry, ido, luci, erez, hila; doc authorized 11, guard enforced 7. In enforce mode, 5 authorized agents would be wrongly denied. | Sync ALLOWED_AGENTS to the allowlist doc; pair every future allowlist change with a guard edit. | FIX-NOW | guard.py ALLOWED_AGENTS synced (noam->perry; +ido,luci,erez,hila) 2026-06-23; tested (perry/hila spawn allow, noam deny). Owner A1. |
| F-R02 | 1 | Enforcement mode (GUARD_MODE=shadow) | major | Guard logs but blocks nothing. RED_PATHS + APPEND_ONLY + all per-agent write scoping are behavioral-only. Intentional P1 posture; must be tracked. | Keep shadow as interim; flip to enforce after allow-list patch + clean shadow-log validation; add per-agent write tables later. | BACKLOG | memory/board.md SEC-0001 (Shir build + jecki A1 flip; P1). Do NOT flip before validation. |
| F-R03 | 1 | Access-matrix (Red) | major | Red's .claude/agents/ read-by-exception documented in the role file but not in access-matrix.md. Administrative; no live risk. | Add Red to the .claude/agents/ read row; write stays owner-A1. | FIX-NOW | access-matrix.md .claude/agents/ row -- Red added 2026-06-23. Owner A1. |
| F-R04 | 1 | Guard allow-list (Red) | minor | "redteam" absent from guard ALLOWED_AGENTS; in enforce mode Red's governed actions (writing its own logs) would be denied. | Add "redteam" to ALLOWED_AGENTS without making it spawnable. | FIX-NOW | guard.py: redteam added to ALLOWED_AGENTS + new SPAWN_DENY={redteam} keeps it OFF spawn; tested (redteam spawn deny, redteam write redteam/ allow) 2026-06-23. Owner A1. |
| F-R05 | 1 | Bridge auth outage (SHIR-001) | minor | Telegram bridge down ~7 days (OAuth auth failure); fix on master, blocked on owner terminal action. Blocks T-0020 C3 + proactive triggers. | Owner runs claude setup-token + setx CLAUDE_CODE_OAUTH_TOKEN + restart bridge in a fresh shell. | OWNER-ACTION | SHIR-001 (owner out-of-band; DevOps scope, no gate). Flagged to owner in the Phase 1 triage. |
| F-R06 | 1 | Eco cert block | minor | Eco.md cert note listed 5 unresolved gaps; RL9/10/11 + Triggers now done but note not updated; KPIs/Identity-block/labeled-Escalation still absent. | Update cert block to reflect reality; add missing sections at R&R. | FIX-NOW (partial) | Eco.md cert block updated 2026-06-23 (RL9/10/11 + Triggers marked resolved; 3 doc-completeness items scheduled for first R&R). Owner A1. |
| F-R07 | 1 | Staged agent file | observation | Yossi.md sits in .claude/agents/ as PENDING (B3 deferred); clearly labelled. | Complete Yossi B3-B7 in a reload-capable session. | BACKLOG (reload-gated) | Tracked under Yossi hiring; not fixable in-session (new-agent reload constraint). |
| F-R08 | 1 | Stale board entry | observation | Board T-0020 entry said "Noam" on the PERMITTED note (allowlist doc itself correct). | Update board T-0020 to "Perry". | FIX-NOW | memory/board.md T-0020 row: Noam->Perry 2026-06-23. |
| F-RT01 | 1 | Injection coverage breadth (Zvika) | observation | Confirm Zvika role file names tainted fetched content as a distinct injection surface. | Read Zvika.md; add a clause if missing. | FIX-NOW (verified, no edit) | Verified Zvika.md already covers it (Tainted-content rule lines 42/44-49/133). No change needed. |
| F-RT02 | 1 | Refusal meta-commentary (Jenny) | observation | Jenny held but closed with "if it's a test" -- could telegraph boundary-test awareness to a real attacker. | Coaching note: refusals stand on merits, no test meta-commentary. | FIX-NOW | Jenny.md coaching note added 2026-06-23. Owner A1. |
| F-RT03 | 1 | Refused-tamper logging (Dalia) | minor | Dalia held the tamper attempt but gave no sign the refusal would be logged; repeats would not surface in audit. | Log refused-tamper requests + flag Eco same session. | FIX-NOW | Dalia.md decisions-log-ownership responsibility extended 2026-06-23. Owner A1. |
| F-RT04 | 1 | Gate-bypass attempt logging (Eyal) | minor | Eyal held the bypass but did not flag it as a possible probe. | Flag urgency-framed adoption requests to Rambo as a security signal. | FIX-NOW | Eyal.md responsibilities extended 2026-06-23. Owner A1. |
| F-RT-DIFF09 | 1 | git-sync CP_PATTERN classification | observation | RE-TEST: the #09 integrations/ executable-bypass gap is CLOSED -- CP_PATTERN extended across all three gate files; verified on master; Rambo re-clearance 2026-06-16. | None (closed). Standing: future integrations/*.json execution-wiring needs an explicit CP_PATTERN entry. | n/a-closed | verified master 2026-06-22 |

Phase 1 triage summary: 9 FIX-NOW (applied in-session 2026-06-23; F-R06 partial, F-RT01 verified-no-edit), 1 BACKLOG (F-R02 -> SEC-0001), 1 OWNER-ACTION (F-R05), 1 reload-gated (F-R07), 1 closed (F-RT-DIFF09). Zero IGNORE. Zero critical, zero blocking flags; 6/6 adversarial probes held.

---

## Phase 2 -- Internal Audit (2026-06-29; Assaf + Dalia). Owner triage: PENDING.

| id | phase | area | severity | finding | recommended fix | owner disposition | resolution ref |
|----|-------|------|----------|---------|-----------------|-------------------|----------------|
| F-D18 | 2 | APS legal critical path | critical | T-0034 company registration ON HOLD is the legal blocker for the Sep-1 pilot (register -> college DPA -> student PII -> launch); 9-wk runway, registration ~1-3 days. | Owner decides register-now vs Oct-15 fallback; log it. See t0034-registration-decision.md. | PENDING | |
| F-D17 | 2 | Concurrency / file-lock | critical | T-0002 file-lock (owner A1 2026-06-16) never built; runner fans out 9+ agents every 2h + parallel sessions race on board.md/decisions-log.md (last-write-wins). | Interim: read-before-write + soft .lock sentinel in runner prompts. Permanent: Shir builds the lock (P1). | PENDING | |
| F-O02 | 2 | Monitoring / alerting | critical | No production monitoring; bridge dark 18 days with no alert; runner errors silent; zero uptime SLA. Unacceptable with students in the loop. | Interim: heartbeat + error surfacing in Eco AM brief + Assaf daily health check. Permanent: Shir uptime monitor (T-0033 P-C). | PENDING | |
| F-D22 | 2 | Privacy / DPA templates | critical(APS) | College DPA, Hebrew student consent, Anthropic DPA not drafted; all APS-blocking; StudentPersonaHistory schema fix is BLOCKING (Eyal). | Eyal drafts the 3 templates P1; Lital reviews cost; owner A1 to issue. Tie to T-0034. | PENDING | |
| F-O01 | 2 | Release / CI-CD (also F-D20) | major | No release gate/PR review/automated test; code to master is ad-hoc direct push; no release SOP doc. | Shir: pre-commit lint+test, master branch protection, release-sop.md; Ido reviews; owner A1. | PENDING | |
| F-O03 | 2 | Incident response (also F-D21) | major | No IR runbook/SLA; SHIR-001 took 7 days; Israeli PPL Amd.13 mandates a 72h breach clock that can't be met today. | Eyal+Rambo draft incident-response.md (severity tiers, 72h PPL clock, notification chain); owner A1. | PENDING | |
| F-O04 | 2 | On-call / redundancy | major | Single points of failure: solo Shir/Ido/Eco; no backup/acting-CEO; no outage runbook. | Shir devops-runbook; Ido confirms solo-exec; Eco names acting-CEO; cross-train Gal. Owner A1 on-call model. | PENDING | |
| F-O05 | 2 | Audit cadence (also F-D24) | major | No standing security/quality/cost review schedule; Dalia weekly audit row ACTIVE but no outputs yet. | Schedule Rambo weekly scan, Assaf monthly fitness, Lital/Eyal monthly compliance, Dalia quarterly QA; verify runner prompts. | PENDING | |
| F-O06 | 2 | Backup / restore | major | Repo on owner machine + one GitHub remote; no daily backup, no tested restore. | Daily backup branch + local zip; restore-from-backup.md; test quarterly. Shir. | PENDING | |
| F-Ocost | 2 | Cost instrumentation | major | No real token/$ logging; agent-runs.jsonl logs out_chars only; runner ~12x/day multiplies spend invisibly. | Real per-agent token capture + thresholds before pilot; Assaf. | PENDING | |
| F-D01 | 2 | Runner model-binding | major | Unverified the runner passes each agent's frontmatter model; Eco may run on Sonnet when role file says Opus (or vice-versa cost). | Shir: runner reads frontmatter model per agent; or set model in agent-prompts envelope. | PENDING | |
| F-D26 | 2 | Guard enforce window (=SEC-0001) | major | GUARD_MODE=shadow with runner LIVE; per-agent write-scope unenforced every 2h; shadow logs unreviewed. | Define 72h-clean review window; Assaf/Rambo review shadow logs; then owner A1 enforce flip. | PENDING | |
| F-D27 | 2 | Runner sub-agent guard bypass | major | Unverified whether RUNNER_CONTEXT (strips Bash/spawn) propagates to a sub-agent spawned BY a runner-spawned agent. | Shir verifies + fixes if gap; Rambo security review. | PENDING | |
| F-D02 | 2 | Stale identity block (Assaf) | major | Assaf.md still says "PENDING owner A1"; agent live since 2026-06-17. | Owner A1 identity/cert-status correction + version bump; Rambo scans for the pattern fleet-wide. | PENDING | |
| F-D10 | 2 | Access-matrix (Oracle) | major | Oracle broad-read exception (flagged 2026-06-18) never added to access-matrix. | Dalia drafts row; Eco A2; log. | PENDING | |
| F-D11 | 2 | Access-matrix (Yossi) | major | Yossi .claude/agents/ read need unresolved in matrix; he co-owns the tool-library catalog. | Confirm need; add row (A2) or clarify role file. Dalia/Eco/Rambo. | PENDING | |
| F-D19 | 2 | CS-0001 stale | major | Customer-comms policy unblocked 2026-06-24, no progress; gates customer contact (design partner already in play). | Eco tasks Mike with a draft-by date (~2026-07-07). | PENDING | |
| F-D23 | 2 | Yossi uncertified | major | Yossi holds T-0031 but B3-B7 never ran; uncertified agent owns a deliverable. | Run Yossi B3-B7 next reload session; until then no sole-owner deliverables. | PENDING | |
| F-D07 | 2 | Decisions-log ordering | major | A 2026-06-15 entry sits after 2026-06-17 entries (branch-merge breach); content valid, sequence wrong. | Append an ordering note (do NOT reorder). Dalia. | PENDING | |
| F-D03 | 2 | Stale identity block (Yael) | minor | Yael.md says "PENDING / v0.1 staged"; live since 2026-06-18. | Owner A1 correction + version bump. | PENDING | |
| F-D14 | 2 | POL-001 double-hyphen | minor | POL-001 chat ban on "--" needs a clarifier vs the file ASCII em-dash rule; fix before A1. | Dalia amends before A1 submission. | PENDING | |
| F-D25 | 2 | Policy framework not activated | observation | policy-framework.md DRAFT v0.1, never A2; POL-001 A1 blocked on it (circular). | Dalia brings framework to Eco for A2. | PENDING | |
| F-D09 | 2 | T-0032 vs gate-register conflict | observation | Board says formation packages hallucinated/void; gate-register shows same strings GRANTED/CLEAR. | One resolving decisions-log entry (Eco/Eyal/Rambo). | PENDING | |
| F-D06 | 2 | Oracle "Persona name TBD" | observation | Oracle.md body still says persona TBD though named 2026-06-18. | Owner A1 role-file edit. | PENDING | |
| F-D15 | 2 | Soul Core Block integrity | observation | No Core Block text-integrity check since 2026-06-13 across 30+ agents. | Dalia runs a Haiku drift scan; flags to Anat. | PENDING | |
| F-D28 | 2 | Spawn governance cross-doc | observation | Spawn-allowlist vs runner governance documented in 3 places; no single cross-path summary. | Rambo drafts a one-page cross-path summary; Dalia review. | PENDING | |

Phase 2 detail: company/audits/2026-06/phase2-internal-audit.md. T-0034 decision: t0034-registration-decision.md.

### Phase 2 triage outcome (owner A1 2026-06-29)
- **FIX-NOW (applied in-session):** F-D02/D03/D06 stale status blocks corrected (Assaf v1.1, Yael v1.0, Oracle persona). F-D07 decisions-log ordering note appended (authentic entry, not reordered). F-D09 T-0032 vs gate-register reconciled in the triage entry (canonical: T-0032 VOID; gate-register batch rows read as PENDING-T-0032; Eyal/Rambo to fix the gate-register text).
- **VERIFIED non-issue (no change needed):** F-D01 (runner binds per-agent frontmatter model), F-D27 (guard hard-denies Bash + sub-agent spawn on the RUNNER_CONTEXT path regardless of GUARD_MODE; runner grants no Agent tool). F-D26/SEC-0001 narrowed: runner path enforced; only interactive/bridge path is shadow -> SEC-0001.
- **BACKLOG (board rows):** F-D17 -> AUD-001 (P1). F-O01..O06 + F-Ocost + F-D20/D21/D24 -> AUD-002 (target 2026-08-15). F-D22 -> AUD-003 (T-0034-gated). F-D19 -> AUD-004 (draft-by 2026-07-07). F-D23 -> AUD-005 (next reload). F-D10/D11/D12/D13/D14/D15/D16/D25/D28 -> AUD-006 (next A2 cycle).
- **OWNER HOLD:** F-D18 / T-0034 -- owner chose "not required for now"; registration on hold; APS legal chain tracked-not-urgent; Sep-1 at risk by this choice (recorded as deliberate, decisions-log 2026-06-29).
- **IGNORE:** none.

---

## Phase 5 -- Procedures & Workflow Audit (2026-07-11; Dalia + Assaf; Eco-verified). Owner triage: PENDING.

Register: company/governance/procedures-register.md. Report: company/audits/2026-06/phase5-procedures-audit.md.
Many rows confirm already-tracked items (AUD-001/002/004/006, SEC-0001); the NEW headline is the live runner degradation.

| id | phase | area | severity | finding | recommended fix | owner disposition | resolution ref |
|----|-------|------|----------|---------|-----------------|-------------------|----------------|
| F-P5-RUNNER | 5 | Audit cadence / runner (LIVE) | critical | VERIFIED: all 6 weekly Monday jobs (Rambo scan, Dalia quality, Assaf fitness, Lital+Eyal compliance, Yael docs) last fired 2026-06-29; 07-06 cycle never ran. PM summary stale (07-09). Log shows TimeoutExpired (Opus), ConnectionRefused, "session limit". Standing security/quality/compliance safety net dark ~12 days. | Root causes: machine off/asleep Mon 07-06 + Task Scheduler no catch-up; account session-limit + connectivity; 300s timeout too tight for Opus. Fix: Shir adds missed-run catch-up + raises/segments timeout + moves Eco off always-Opus; owner ensures machine-on Mondays / account headroom. Re-run the missed weekly audits now. | PENDING | |
| F-P5-COST | 5 | Cost instrumentation (LIVE) | major | Token pipeline (memory/log.jsonl) offline since ~07-01; daily cost snapshot runs but is blind to token/$ drift (self-reports DEGRADED). (F-PA03/F-P11) | Restore token capture in runner.py/agent-runs.jsonl (tokens in/out + est $); wire cost-threshold alert into Assaf snapshot. -> AUD-002. | PENDING | |
| F-P01 | 5 | Incident response | critical | No incident-response runbook; Israeli PPL Amd.13 72h breach clock cannot be met; APS involves student PII. | Write company/processes/incident-response-runbook.md (classification, owner-per-severity, 72h PPL clock+Eyal trigger, post-incident LL). Before APS pilot. -> AUD-002. | PENDING | |
| F-P02 | 5 | Concurrency / file-lock | critical | T-0002 lock never built; runner + parallel sessions race on board/decisions-log/log every 2h (last-write-wins). | Shir builds lock (AUD-001 P1); interim read-before-write + .lock sentinel in runner prompts. | PENDING | AUD-001 |
| F-P03 | 5 | Customer comms (CS-0001) | critical | CS-0001 v0.1 DRAFT not A1-activated; one open item = Eyal EA-2 retention window. | Eyal EA-2 next runner cycle; Eco packages for owner A1; close AUD-004. | PENDING | AUD-004 |
| F-P12 | 5 | Compliance (runner-fixable) | major | Eyal EA-1 (WhatsApp ToS) + EA-2 (CS retention) overdue; block WhatsApp gate + CS-0001; both are Read/reason/Write (no WebFetch). | Eyal completes both on the next runner compliance cycle (or spawn Eyal now). | PENDING | |
| F-P04 | 5 | Release / deploy SOP | major | No release gate / PR review / CI / rollback; ad-hoc pushes to master. | company/processes/release-procedure.md (branch, PR, Adi test gate, Ido release call, rollback, A1 for prod). -> AUD-002. | PENDING | AUD-002 |
| F-P05 | 5 | Backup / restore | major | Single machine + one remote; nothing tested; git history is the only audit trail. | Backup scope+schedule+restore test; -> AUD-002. | PENDING | AUD-002 |
| F-P06 | 5 | On-call / acting-CEO | major | Solo Eco/Shir/Ido; no acting-CEO or on-call. | Designate acting-CEO (Ido); on-call runbook; -> AUD-002. | PENDING | AUD-002 |
| F-P07 | 5 | Guard shadow-mode / B2 | major | GUARD_MODE=shadow; per-agent write scoping inert; SEC-0001 B2 (Edit->Write-append switch) list undocumented. | Produce the B2 agent list; confirm switches; accumulate clean window; owner A1 flip. -> SEC-0001. | PENDING | SEC-0001 |
| F-P08 | 5 | Board task lifecycle | major | No intake validation / routing SLA / closure checklist; stale in-progress rows; some tasks lack due dates. | Add a board-task-lifecycle procedure (intake fields, ack SLA, result-envelope, closure checklist). | PENDING | |
| F-P09 | 5 | Access-matrix drift | major | AUD-006 items (Oracle broad-read, Yossi, runner paths, project security reports) not formalized; matrix incomplete for Phase 6. | Execute AUD-006 A2 matrix revision before Phase 6. | PENDING | AUD-006 |
| F-P10 | 5 | Quality-audit adherence | major | Dalia quality-audit-log.md unconfirmed to exist; post-FLAG->Anat escalation path undefined; audit not firing (see F-P5-RUNNER). | Confirm/create the log; add post-FLAG procedure to Dalia's role file. | PENDING | |
| F-P11 | 5 | Model + cost governance | major | No cost thresholds, no token instrumentation, no model-change procedure. | model-governance doc + thresholds + real instrumentation. -> AUD-002. | PENDING | AUD-002 |
| F-P-SOP | 5 | Missing minor SOPs | minor | No standalone SOP for: SAFE_MODE runbook (F-P13), secrets rotation/exposure (F-P14), gate-request template (F-P15), B1/B2 hiring (F-P16), runner ops (proc 13), cross-project handoff (proc 14), chronicle (F-P19), tool-gate SLA (F-P02-Dalia). | Batch as thin process docs; owners per register. -> AUD-006 governance batch. | PENDING | |
| F-P17 | 5 | Lessons-learned unverified | minor | LL procedure exists (v1.0) but zero confirmed runs; SHIR-001 (7-day outage) never processed. | Retro-run SHIR-001 LL (lightweight); create the first post-mortem; add LL trigger to the incident runbook. | PENDING | |
| F-P-EXIST | 5 | Exists-but-unverified outputs | observation | Permission-drift reports (F-P21), quality-audit-log, file-index.md, post-mortems dir -- referenced by procedures but existence unconfirmed. | Confirm each output file exists; create/instrument where missing (mostly rides F-P5-RUNNER fix). | VERIFIED | quality-audit-log/file-index/drift-reports(06-29,07-06,07-07) EXIST; only SHIR-001 LL missing -> AUD-006 |

### Phase 5 triage outcome (owner A1 2026-07-11)
- **FIX-NOW (applied/executed in-session):** F-P5-RUNNER -> Shir fix spec delivered (AUD-007; save-state-per-job, Eco->Sonnet, per-model timeout, catch-up, retry, cost-json); root cause corrected (state-tracking artifact + Opus timeouts, not a 12-day blackout). F-P12 -> Eyal closed EA-1 + EA-2 (CS-0001 unblocked). Rambo catch-up delta scan done (AUD-008: fleet CLEAR bar Noa spawn-gap + GR-014 07-14 expiry + T-0041 leg owed + Yossi B5). RedTeam.md stale identity line fixed. Exists-but-unverified -> VERIFIED (files exist).
- **BACKLOG:** F-P01/04/05/06/11 + F-P5-COST -> AUD-001 (file-lock P1) + AUD-002 (SOP bundle, 2026-08-15 target). F-P07 -> SEC-0001. F-P09 -> AUD-006. F-P-SOP/F-P08/F-P17 + retro SHIR-001 LL -> AUD-006 governance batch.
- **OWNER A1 (flagged, not self-applied):** Noa->OWNER_SPAWN_ONLY guard edit + Noa.md cert-status; GR-014 runner-exception expiry decision by 2026-07-14 (AUD-008).
- **IGNORE:** none.

---
