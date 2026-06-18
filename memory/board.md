# Eco-Synthetic: Task Board

Cross-company task board. Owned by Eco; Assaf (OE) monitors usage.
Per constitution section 5: each agent writes to its own rows. Eco orchestrates.

Task schema (owner-required 2026-06-15):
| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |

Status values: open, in-progress, blocked, done, cancelled.
Accountability rule: assigned_to agent owns the due date. Escalate to Eco (then owner) BEFORE the date slips. A silent miss is logged as a process miss.

---

## Owner-office (Shelly)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| S-0001 | Operate owner Telegram channel | in-progress | Operate the owner Telegram channel. Bot token set; bridge live. | jecki | Shelly | 2026-06-12 | active | P1 |
| S-0002 | Domain name check and recommendation | open | Domain check: eco-synthetic.com vs .ai (+ non-hyphen variants), availability + pricing; present for owner approval; purchase only after A1 + payment. | jecki | Shelly | 2026-06-12 | ASAP | P1 |
| S-0003 | Company email and Drive setup | blocked | After domain approved: company email, drive, eco@/shelly@ mailboxes, rest in order (account-migration flagged). Blocked on S-0002. | jecki | Shelly | 2026-06-12 | after S-0002 | P2 |
| S-0004 | Owner queue triage and reminders | in-progress | Owner queue triage + awaiting-owner list + reminders. Active; approved per schedules.md. | jecki | Shelly | 2026-06-12 | recurring | P1 |
| S-0005 | WhatsApp adoption evaluation | open | WhatsApp adoption evaluation: cost, terms, Evolution-vs-Cloud-API tradeoff; recommendation to owner. A1 before any action. | Shelly role file | Shelly | 2026-06-12 | later | P3 |
| S-0006 | Owner dashboard surfacing | open | Surface owner dashboard when dashboards exist. Blocked on dashboards build. | jecki | Shelly | 2026-06-12 | later | P3 |
| S-0006a | Pending approvals in dashboard | open | Sub-task of S-0006: surface pending A1 actions / Claude Code permission prompts in owner dashboard. Each item: requesting agent, action, target, timestamp, approve/deny. | jecki 2026-06-13 | Shelly | 2026-06-13 | with dashboards build | P2 |

---

## Company (Eco)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| T-0001 | Go-live structure and R&R review | in-progress | Go-live structure and R&R review + VP Product decision + Ido scope task. Includes Eco HR cert gap resolution. | go-live | Eco | 2026-06-12 | immediate | P1 |
| T-0002 | Design decisions brief for owner | open | Backlog design decisions to bring owner: concurrency rule; task-log storage (JSONL->SQLite); durable chat memory (store+retrieval via MCP); Gemini for non-sensitive research. Brief at company/memos/design-decisions-brief-2026-06-14.md. OVERDUE. | company/backlog.md [DESIGN] | Eco | 2026-06-14 | 2026-06-15 | P1 |
| T-0003 | Backlog QUEUE items execution | open | Work company/backlog.md [QUEUE] items by priority: Rambo permission scans; fitness/discovery loop; listener/scout agent proposal; CFO tooling incl. GreenInvoice lead; per-agent knowledge files; Sales proposal-pipeline. | Eco backlog review | Eco | 2026-06-12 | queued | P2 |
| T-0004 | Model router Phase A skeleton | open | Model router Phase A skeleton: selection + logging, Claude-only. Per company/model-router-design.md Phase A. Queued until R&D staffed. | company/model-router-design.md | Eco | 2026-06-12 | queued (R&D when staffed) | P2 |
| T-0005 | Compliance backlog tracking | open | Compliance backlog tracking with Eyal + Lital: registration, invoicing, privacy, account migration. Per company/governance/compliance-backlog.md. | compliance-backlog.md | Eco | 2026-06-12 | queued, proactive | P2 |
| T-0006 | WhatsApp-transcript comparison | open | WhatsApp-transcript comparison: file in /sources; compare to our practices; bring recommendation. | jecki | Eco | 2026-06-12 | queued | P2 |
| T-0007 | Owner presentations intake | open | Owner presentations intake: photos/audio-transcript/web-extract -> feed into structure review when provided by owner. | jecki | Eco | 2026-06-12 | waiting-on-owner | P2 |
| T-0008 | Wiki seed and maintain | open | Seed and maintain memory/wiki/ -- update pages as decisions are logged; owner steers topics. Seeded 2026-06-12; ongoing. | jecki | Eco | 2026-06-12 | ongoing | P2 |
| T-0009 | Monthly on-demand agent review | open | Monthly: review on-demand/later agents vs current workload; draft wake-up proposals; escalate A1; log in decisions-log. Transfer to Assaf (OE) when built. | Eco role file | Eco | 2026-06-12 | monthly recurring | P2 |
| T-0010 | Shelly separation assessment | open | Evaluate whether Shelly stays in eco-synthetic repo/runtime or separates into independent private repo+process. Deliverables: privacy/security analysis; ops cost; company-facing duties across boundary; trigger conditions; migration sketch. Recommendation only -- actual separation is A1. | jecki 2026-06-12 | Eco | 2026-06-12 | queued | P2 |
| T-0011 | Wiki feature evaluation post-ingest | blocked | Evaluate and recommend each feature for adoption: /readiness score; /daily full loop; /query wiki-search; wiki /lint; /meeting-prep agent; /guy proposal pipeline; /pull active data capture. Each: fit, effort, overlap, net value. A1 for new agent; A2 for new skill. Blocked until wiki setup complete. | jecki 2026-06-13 | Eco | 2026-06-13 | blocked-until wiki setup | P2 |
| T-0012 | Access-matrix agents/ reconciliation | blocked | Formalize .claude/agents/ read access for Anat (HR), Rambo (Security), Dalia (Q&G), Assaf (OE) in access-matrix.md. A2 decision; Dalia + Rambo review; log in decisions-log.md. Blocked on Dalia going live. | Rambo certification 2026-06-14 | Dalia | 2026-06-14 | when Dalia built | P3 |
| T-0013 | Gate-register bootstrapping review | blocked | On activation: read gate-register.md bootstrapping note for Rambo tools. Confirm no legal terms gap. If clear: append confirmation to gate-register.md. Blocked on Eyal going live. | Rambo go-live 2026-06-14 | Eyal | 2026-06-14 | when Eyal built | P3 |
| T-0014 | Initial permission scan all live agents | open | Run permission-scope scan on all live agents (Eco, Anat, Hila, Shelly, Designer). Per-agent report to Eco. Flag excess permissions before next agent goes live. | Rambo go-live 2026-06-14 | Rambo | 2026-06-14 | immediate | P1 |
| T-0015 | P1 agent drafts (all 10 pending) | in-progress | Draft role files for all pending P1 agents: Ido, Eyal, Lital, Dalia, Noam, Assaf, Gal, Shir, Luci, Erez. Drafts complete 2026-06-14. Now blocked on T-0019 (competency testing) before owner go-live A1. | jecki 2026-06-14 | Eco | 2026-06-14 | immediate | P1 |
| T-0016 | Wiki refresh (backlog + roster) | open | Update memory/wiki/backlog-summary.md and agent-roster.md to match current board.md and roster. Wiki stale since 2026-06-12. Do after T-0015 drafts complete. | Eco self-identified | Eco | 2026-06-14 | after T-0015 | P1 |
| T-0017 | Israeli law + finance tools process | open | When Lital or Eyal identify a tool need: Eco asks owner for candidate. Then: Rambo risk review + Eyal/Lital terms review + A2 Eco + A1 owner. Eco does not source tools independently. | jecki 2026-06-14 | Eco | 2026-06-14 | on-need | P2 |
| T-0018 | Assaf agents/ access expansion | open | Expand T-0012 scope to include Assaf (OE). Same read need as Anat/Rambo/Dalia. A2 Eco decision; Dalia formalizes in T-0012 matrix update. No owner A1 required. | Eco 2026-06-14 | Eco | 2026-06-14 | with T-0012 | P3 |
| T-0019 | Competency testing all 11 P1 agents | in-progress | For each of 11 P1 agents (10 new + Hila): produce competency spec (domain reqs + 3 test scenarios + pass criteria); direct manager runs tests; document results; Anat reviews. Assemble Stage C packages. Owner go-live A1 only after all complete. Per company/processes/agent-hiring.md. B1 DONE: all 11 role files in .claude/agents/. B2 DONE 2026-06-15: all 11 specs in company/hr/competency/ (Hila spec added 2026-06-15). Onboarding runbook rewritten to B3-forward 2026-06-15. Eco B7 preliminary assessment written (eco-b7-preliminary.md). B3 test-results shells created 2026-06-15: all 11 in company/hr/competency/<Name>-test-results.md (scenarios pre-structured; B6 role-file accuracy pre-confirmed by Eco; outputs and results PENDING). Stage A batch approval formally logged in decisions-log.md 2026-06-15. B3 pending (needs Claude Code session with Anat + Agent tool). Sequence: L3 agents first (Eco evaluator), then Gal+Shir after Ido live. | jecki 2026-06-14 | Eco | 2026-06-14 | before any go-live A1 | P1 |
| DASH-001 | Owner dashboard (automated, self-refreshing) | blocked | Engineered auto-refreshing owner dashboard showing all task queues, pending approvals, and company status. Scope and build by Ido (R&D). Interim version at memory/owner-dashboard.md. Blocked on Ido going live. | jecki 2026-06-15 | Ido | 2026-06-15 | within 24h of Ido go-live | P1 |
| T-0023 | Model-config audit -- include new role files | open | Extends the standing ASSAF-AUDIT (owner A1 2026-06-17). Audit model-config across ALL role files (frontmatter `model` vs body "AI model" section); catch opus-default leaks (like Luci/Erez had). MUST include the 13 role files built/changed 2026-06-18 (Designer/Tal, Chronicler, Oren, Roman, Adi, Mike, Jenny, Avner, Ella, Alex, Yael, Zvika, Sami, Hila v2.0). Report mismatches to Eco; fixes are owner A1. | jecki 2026-06-18 | Assaf | 2026-06-18 | not urgent | P2 |
| T-0024 | Understand the eco-ops-overnight effort | done | Investigated per owner ask. The `claude/eco-ops-overnight` branch (parallel session, 2026-06-16/17) ran a NON-HIRING ops batch: T-0021 git-sync governance leg, T-0012 access-matrix reconciliation, T-0013 gate-register legal review, T-0014 permission scan (5 stable agents, all clear), T-0002 design paper, T-0016 wiki-recurrence. All proposal-state on the branch; held for merge to master AFTER the hiring session completes (owner agreed). FLAG: that merge is now due -- hiring run for this session is finishing; coordinate merge to avoid board/decisions-log conflict. Files documented in decisions-log 2026-06-17 entries. | jecki 2026-06-18 | Eco | 2026-06-18 | merge now due | P2 |

| T-0020 | Security gate -- Agent tool for Eco (Telegram bridge) | in-progress | A1 GRANTED 2026-06-15 (jecki): interim, non-Bash agents only; spawns logged. Full Rambo findings are in the RESTRICTED report company/security/reports/T-0020-2026-06-15.md (Rambo + owner read only; A1 for others) -- detailed verdict deliberately NOT duplicated on this shared board. Verdict summary: PARTIAL-CLEAR, four conditions to reach CLEAR. Permitted-spawn allowlist (single source of truth): company/governance/agent-tool-spawn-allowlist.md. PERMITTED (no Bash): Anat/Dalia/Lital/Eyal/Noam/Assaf/Luci/Erez/Hila/Rambo. DENIED (hold Bash): Ido/Gal/Shir -- separate R&D plan. R4-LOGGING active. Eyal confirms no new legal terms. OPEN follow-up (Eco + Rambo + Shir): R1-CODE sender chat-ID allowlist, R2-CODE strip Bash/WebFetch on bridge spawns (SHIR-001 group); when both land, Rambo + Erez join allowlist and R&D trio gets its plan. STANDING (jecki item 3): every Rambo assessment must include a proposed mitigation, not just a verdict -- already implemented in security-baseline.md (Rambo, 2026-06-15); applied to T-0020 report. Role-file output-spec mirror is A1, pending Claude Code. | jecki 2026-06-15 | Rambo | 2026-06-15 | interim live; R&D pending Shir | P1 |

---

## Onboarding (Anat + Eco)

All agent go-lives require owner A1. B3 tests need a Claude Code session with Anat having the Agent tool.
All 11 test-results shells created 2026-06-15 in company/hr/competency/<Name>-test-results.md.
Runbook: company/hr/onboarding-runbook.md

HIRING RUN 2026-06-17 (jecki: full process, all agents, managers first, no corners; auto-go-live only zero-condition):
- LIVE: Eyal (zero-condition pass; activated under owner standing A1). ONB-006 done.
- HELD for owner A1 batch (B3-B7 + Stage C done, 3/3 PASS, light conditions): Ido, Dalia, Noam, Lital, Assaf.
  Packages: company/hr/stage-c/<Name>-stage-c.md. ONB-003/004/005/007/008 -> in-progress (Stage C ready, awaiting A1).
- NOW LIVE 2026-06-17: Luci (model opus->sonnet, scope fix, RL4/5/9/10/11), Erez (model opus->sonnet, tainted-content rule). ONB-011/012 -> DONE.
- ASSAF-AUDIT (new, owner A1 2026-06-17): Assaf audits model-config across ALL role files (frontmatter vs body) and fixes opus-default leaks like Luci/Erez had. Assigned Assaf; with Dalia (model-matrix). P2.
- Gal, Shir: B3-B6 COMPLETE 2026-06-17 (Ido live, B6 CONFIRM both). Both 3/3 PASS. HELD for owner A1 (Bash agents -> not zero-condition). Gal: RL9/10/11 doc (before R&R) + off spawn-allowlist until T-0020 C3. Shir: S3 escalation coaching (Ido) + off allowlist (Shir BUILDS C3 fix) + A1 prod-deploy gate in bridge + integrations/ task-envelope. ONB-009/010 -> Stage C ready. Packages in company/hr/stage-c/.
- Tim (VP Sales): role design APPROVED by owner 2026-06-17; role file BUILT (.claude/agents/Tim.md, B1 done); spec staged (company/hr/competency/Tim-spec.md). B3-B7 run NEXT session (new agent type not in this session's Agent registry). Then Hila full-track + Alex.
- Shelly: process check folded into migration plan (T-0010) per owner, not a standalone retro.
- CROSS-AGENT FLAG: Luci + Erez role-file frontmatter pins claude-opus-4-8 while body says Sonnet-default; reconcile (possible wider model-config audit -- Assaf/Rambo when live).
- Owner A1 decisions needed at 9AM: activate the 5 held agents (+ Ido needs Bash-removal A1 first). See stage-c packages.
- Harness fixes logged (lessons-learned): sandbox B3 writes; seal pass-criteria from candidates.
- OWNER DIRECTIVES 2026-06-17 (for the session that handles the 9AM A1 batch):
  - AUTO-CONTINUE: once owner approves the A1 batch, Eco runs the next wave WITHOUT per-wave check-in --
    Luci + Erez + Shelly-retro immediately; Gal + Shir once Ido is live; then Tim. Same zero-condition
    auto-go-live rule; conditional agents held for owner.
  - RL-9/10/11 batch-fix: owner to decide at 9AM (explained to owner). If approved, Eco pastes standard
    RL-9/10/11 boundary text into all affected role files in one pass (A1 role-file edits). HOLD until owner says.
  - TIM: Eco drafts role file + competency spec and shows owner BEFORE any B3 (show-draft-before-approval).
    Drafts prepared 2026-06-17 at company/hr/drafts/Tim-role-file.md and company/hr/drafts/Tim-spec.md -- awaiting owner review.

SKILL-001 (standing, jecki A1 2026-06-17): every repeated action becomes a skill (.claude/commands/<name>.md).
Register + practice: company/governance/skills-register.md (owner: Dalia when live, Eco interim). Done 2026-06-17:
hardened /hiring; created /permission-scan, /usage-report, /tool-gate. Candidates catalogued (build when owning
agent live / on 2nd use). Each agent proposes skills for its own repeated tasks; Eco approves (A2); register updated.

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| ONB-001 | Certify Hila (Marketing) | open | B1 done (role file). B2 done (spec 2026-06-15). B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING -- needs Claude Code session with Anat + Agent tool. OVERDUE. | jecki 2026-06-10 | Eco/Anat | 2026-06-12 | OVERDUE | P1 |
| ONB-002 | Rambo go-live | done | Certified + owner A1 (2026-06-14). Role file in .claude/agents/Rambo.md. Decisions-log entry exists. | jecki 2026-06-14 | Eco/Anat | 2026-06-14 | done 2026-06-14 | P1 |
| ONB-003 | Bring up Ido (VP R&D) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15 (company/hr/competency/Ido-test-results.md). B3+B4+B5+B6+B7 PENDING. CRITICAL: Ido must go live before Gal and Shir can complete B6. | T-0019 | Eco/Anat | 2026-06-14 | 2026-06-16 | P1 |
| ONB-004 | Bring up Dalia (Q&G) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. On go-live: T-0012 auto-starts. | T-0019 | Eco/Anat | 2026-06-14 | 2026-06-16 | P1 |
| ONB-005 | Bring up Lital (CFO) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. B5 (Rambo scan) required before certification per Anat doc-review conditions. | T-0019 | Eco/Anat | 2026-06-14 | 2026-06-17 | P1 |
| ONB-006 | Bring up Eyal (Legal) | done | LIVE 2026-06-17. B3 3/3 PASS; Anat B4 certify (no conditions); Rambo B5 clear (no conditions). Zero-condition -> auto-go-live under owner standing A1. Interview moved to company/hr/interviews/Eyal-interview.md. T-0013 auto-started. | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-007 | Bring up Noam (Product) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. T-0001 VP Product decision to resolve before or at Stage C. | T-0019 | Eco/Anat | 2026-06-14 | 2026-06-17 | P1 |
| ONB-008 | Bring up Assaf (OE) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. Needs Dalia live first for T-0012 before Assaf can access .claude/agents/. | T-0019 | Eco/Anat | 2026-06-14 | 2026-06-17 | P1 |
| ONB-009 | Bring up Gal (Lead Developer) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15 (company/hr/competency/Gal-test-results.md). B3+B4+B5+B6+B7 PENDING. SEQUENCING: B3 runs after Ido certified; Ido does B6 sign-off. Cannot present Stage C until Ido go-live. | T-0019 | Eco/Ido | 2026-06-15 | after Ido go-live | P1 |
| ONB-010 | Bring up Shir (DevOps) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15 (company/hr/competency/Shir-test-results.md). Same Ido dependency as Gal. | T-0019 | Eco/Ido | 2026-06-15 | after Ido go-live | P1 |
| ONB-011 | Bring up Luci (Devil's Advocate) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. Eco evaluates; jecki awareness given Luci reports to owner. No blocking sequencing dependency. | T-0019 | Eco | 2026-06-15 | next CC session | P1 |
| ONB-012 | Bring up Erez (Investor, on-demand) | open | B1 done. B2 done. B3 test-results shell created 2026-06-15. B3+B4+B5+B6+B7 PENDING. B5 must confirm WebSearch+WebFetch scope before certification. On-demand; jecki reviews results. | T-0019 | Eco | 2026-06-15 | next CC session | P1 |

---

## Customer Success (Mike)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| CS-0001 | Customer communication policy | blocked | Draft formal company policy governing all customer communication. Cover: what may and may not be communicated; mandatory politeness standard; address rules (use the customer name if a specific person is known, "Dear Customer" if unknown); tone; data-sharing limits; escalation. RULE: every customer-related procedure requires A1 approval before use. Blocked on Mike (VP CS) go-live (P3). If any customer-facing work starts before Mike is built, pull forward -- Eco or Dalia drafts an interim version for A1. | jecki 2026-06-15 | Mike | 2026-06-15 | P2 |

---

## Marketing (P1 light track -- Hila)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| HIL-001 | Brand basics (logo, palette, type) | blocked | Brand basics: logo, palette, typography -- present options for A1. Blocked on Hila certification. | Hila role file | Hila | 2026-06-12 | after certification | P2 |
| HIL-002 | Agent avatars style choice | blocked | Agent avatars: present style choice (Badge vs Persona) for A1. Blocked on Hila certification. | Hila role file | Hila | 2026-06-12 | after certification | P2 |
| HIL-003 | LinkedIn page setup | blocked | LinkedIn page: set up once domain + company email available. Blocked on S-0002, S-0003. | Hila role file | Hila | 2026-06-12 | after S-0002+S-0003 | P2 |
| HIL-004 | Secure social handles | blocked | Secure social handles for Eco-Synthetic. Blocked on domain. | Hila role file | Hila | 2026-06-12 | after domain | P3 |

---

## Governance & Policy (Dalia)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| DAL-001 | Company policy framework + human-comms policy | open | Own the policy framework: define what qualifies as a policy (real need, value, no contradiction, no overload), where policies live (company/policies/, role-gated), access, version control. Then finalize the human-communication policy (DRAFT at company/policies/human-communication-policy.md, written by Eco 2026-06-15 for review) with HR input (agent-to-human) and CS input (customer-facing). jecki A1 2026-06-15. Dalia R&R update for policy ownership is an A1 role-file edit -- pending Claude Code. | jecki 2026-06-15 | Dalia | 2026-06-15 | when Dalia live | P2 |
| DAL-002 | Documentation & knowledge-management standard | open | Own documentation QC: naming conventions, a legend/index of every informational file and its purpose, version control, structure. jecki A1 2026-06-15. When volume justifies, split into a dedicated Knowledge/Documentation manager sub-agent under Dalia (see HIRE-001). Dalia R&R update is an A1 role-file edit -- pending Claude Code. | jecki 2026-06-15 | Dalia | 2026-06-15 | when Dalia live | P2 |
| DAL-003 | Decisions-log dedup pass | open | A parallel session created near-duplicate decisions-log entries (e.g. Ido double-certification, already documented). Add "supersedes" / "see also" notes to reconcile duplicates. NEVER delete or edit existing entries -- append-only (CLAUDE.md red line 6). Output: a reconciliation note appended at the bottom + supersedes pointers. | jecki 2026-06-18 | Dalia | 2026-06-18 | not urgent | P2 |
| DAL-004 | Role-file override back-merge audit | open | A prior session took "ours" on 8 agent role files at merge commit 845934f, superseding a parallel session's edits (in git history). Diff the superseded versions against current; back-merge anything substantive that was lost. Joint with Assaf (OE). Report findings to Eco; any role-file edit is owner A1. | jecki 2026-06-18 | Dalia/Assaf | 2026-06-18 | not urgent | P2 |

---

## New roles (A1 approved 2026-06-15 -- via hiring; need Claude Code)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| HIRE-001 | Knowledge/Documentation manager sub-agent | in-progress | New sub-agent under Dalia (Q&G) owning company documentation QC, naming, legend/index, version control. jecki A1 2026-06-15 (item 2). Persona name Yael. B1 role file + B2 spec BUILT 2026-06-18 (.claude/agents/Yael.md, company/hr/competency/Yael-spec.md). B3 deferred to next session (new agent type not spawnable until reload); then B4/B5/B6(Dalia)/B7 -> Stage C owner A1. | jecki 2026-06-15 | Anat/Eco/Dalia | 2026-06-15 | B3 next session | P2 |
| HIRE-002 | Chronicler / build-historian agent | in-progress | Build-historian: documents the build in near-real-time (decisions, mistakes, wins). jecki A1 2026-06-15 (item 3). Reports to Eco, dotted to Dalia + Hila. Read-only confidential; never writes what it reads; summaries not verbatim. B1 role file + B2 spec BUILT 2026-06-18 (.claude/agents/Chronicler.md, company/hr/competency/Chronicler-spec.md). B3 deferred to next session; then B4/B5/B6(Eco)/B7 -> Stage C owner A1. | jecki 2026-06-15 | Anat/Eco | 2026-06-15 | B3 next session | P1 |

---

## Org / phasing changes (A1 approved 2026-06-15 -- need Claude Code)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| ORG-001 | Hila -> full marketing track | done | jecki A1 2026-06-15 (item 4) + activation A1 2026-06-18. Hila expanded P1 light -> FULL track (Hila.md v2.0): full brand build + multi-channel cadence + owner personal-presence (draft-only). Supplementary B3 re-test 3/3 PASS zero-condition. All publish/account/claims gates preserved (A1 + Legal+Security). SEQUENCING note still holds: real account creation + public posting need the gate + A1 per action, and are blocked on domain/email (S-0002/S-0003). | jecki 2026-06-15 | Eco/Anat | 2026-06-15 | done 2026-06-18 | P1 |
| ORG-002 | Pull VP Sales (Tim) forward | done | jecki A1 2026-06-15 (items 4+5). Tim (VP Sales, L3) built + certified + LIVE 2026-06-17 (owner A1). Manages Hila; now also manages Alex (staged). | jecki 2026-06-15 | Eco/Anat | 2026-06-15 | done 2026-06-17 | P1 |

---

## Staged hires (B1+B2 built 2026-06-18; B3 deferred to next session)

Stage A owner A1 2026-06-18 (decisions-log). All B1 role files + B2 specs built + QC'd this session.
B3 cannot run until session reload (new agent types not spawnable). Next session: B3 -> B4 (Anat) ->
B5 (Rambo) -> B6 (manager) -> B7 (Eco) -> Stage C owner A1. None are live. All OFF the spawn-allowlist
until T-0020 C3. B5 flags: Adi has Bash (QA); Zvika has WebSearch/WebFetch (gate).

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| HIRE-003 | Oren (Senior Developer) | done | L4 R&D code reviewer, reports to Ido. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3; Anat certify; Rambo clear; Ido B6. Read/Edit only. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco/Ido | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-004 | Mike (VP Customer Success) | done | L3, reports to Eco. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3; Anat certify; Rambo clear (write path -> company/cs/); Eco B6. Owns CS-0001. Hard gate: no customer contact pre-approval+product. Unblocks CS reps B6. | jecki A1 2026-06-18 | Eco/Anat | 2026-06-18 | done 2026-06-18 | P3 |
| HIRE-005 | Jenny / Avner / Ella (CS reps) | open | L4, report to Mike. Front-line support; all customer contact A1 + blocked until CS-0001 approved and product live. Shared CS-rep-spec.md. B1+B2 done 2026-06-18. B6 = Mike (Eco stand-in until Mike live). | jecki A1 2026-06-18 | Eco/Mike | 2026-06-18 | B3 next session | P3 |
| HIRE-006 | Alex (Sales) | open | L4, reports to Tim. Pipeline/proposals/outreach drafting; all prospect contact A1 + blocked until product + pricing exist. B1+B2 done 2026-06-18. B6 = Tim. | jecki A1 2026-06-18 | Eco/Tim | 2026-06-18 | B3 next session | P3 |
| HIRE-007 | Zvika (Research) | open | L4, gated/on-demand (A2 wake), reports to Eco. General research; web tools (WebSearch/WebFetch) need B5 gate confirm + tainted-content rule. B1+B2 done 2026-06-18. | jecki A1 2026-06-18 | Eco | 2026-06-18 | B3 next session | P2 |
| HIRE-008 | Roman (Algorithm Specialist) | done | L4, on-demand (Ido invokes, A2), reports to Ido. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3; Anat certify; Rambo clear (Ido confirm prototypes/ not auto-exec before 1st invoke); Ido B6. No Bash. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco/Ido | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-009 | Adi (QA) | done | L4, reports to Ido. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 incl. Bash-safety boundary; Anat certify; Rambo clear (Bash JUSTIFIED, test-exec only); Ido B6. HARD: off spawn-allowlist until T-0020 C3 (Bash agent). | jecki A1 2026-06-18 | Eco/Ido | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-010 | Sami (SME advisor) | open | On-demand, per-project, one instance per active project. Hard partition boundary (projects/<name>/ only). B1+B2 done 2026-06-18. | jecki A1 2026-06-18 | Eco | 2026-06-18 | B3 next session | P2 |

---

## DevOps / Bridge (Shir -- on go-live)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| SHIR-001 | Bridge async ack + timeout fix | open | The Telegram bridge has a 120s hard timeout. If Eco's processing takes longer, Telegram drops the response and the user sees an error. The requested pattern (jecki 2026-06-16): (1) Bridge receives message -> immediately pushes "On it, Jecki..." to Telegram before calling Claude. (2) Calls Claude asynchronously in the background. (3) When Claude finishes, pushes the full response as a second Telegram message. This makes Eco appear async to the user even though Claude is still synchronous. Eco cannot self-push mid-processing -- no channel is open between invocations. All of this must be built at the bridge layer. Also evaluate: extend timeout window, support streaming/partial sends. No A1 needed beyond go-live (DevOps scope). | jecki 2026-06-16 | Shir | 2026-06-16 | first sprint after Shir go-live | P1 |
