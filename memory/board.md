# Eco-Synthetic: Task Board

Cross-company task board. Owned by Eco; Assaf (OE) monitors usage.
Per constitution section 5: each agent writes to its own rows. Eco orchestrates.

Task schema (owner-required 2026-06-15):
| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |

Status values: open, in-progress, blocked, done, cancelled.
Accountability rule: assigned_to agent owns the due date. Escalate to Eco (then owner) BEFORE the date slips. A silent miss is logged as a process miss.

---

## Owner-office (Shelly)

NOTE 2026-06-20: Shelly SEPARATED to her standalone repo C:\Users\Jecki\DEV\projects\Shelly (T-0010 executed, owner-reported). The owner-office rows below are MIGRATED to the Shelly repo's own board; kept here for history only. New owner-office work happens in the Shelly repo, not eco-synthetic. eco-synthetic no longer hosts owner-office memory.

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| S-0001 | Operate owner Telegram channel | in-progress | Operate the owner Telegram channel. Bot token set; bridge live. | jecki | Shelly | 2026-06-12 | active | P1 |
| S-0002 | Domain name check and recommendation | open | Domain check: eco-synthetic.com vs .ai (+ non-hyphen variants), availability + pricing; present for owner approval; purchase only after A1 + payment. | jecki | Shelly | 2026-06-12 | ASAP | P1 |
| S-0003 | Company email and Drive setup | blocked | After domain approved: company email, drive, eco@/shelly@ mailboxes, rest in order (account-migration flagged). Blocked on S-0002. | jecki | Shelly | 2026-06-12 | after S-0002 | P2 |
| S-0004 | Owner queue triage and reminders | in-progress | Owner queue triage + awaiting-owner list + reminders. Active; approved per schedules.md. | jecki | Shelly | 2026-06-12 | recurring | P1 |
| S-0005 | WhatsApp adoption evaluation | open | WhatsApp adoption evaluation: cost, terms, Evolution-vs-Cloud-API tradeoff; recommendation to owner. A1 before any action. | Shelly role file | Shelly | 2026-06-12 | later | P3 |
| S-0006 | Owner dashboard surfacing | open | Surface owner dashboard when dashboards exist. Blocked on dashboards build. | jecki | Shelly | 2026-06-12 | later | P3 |
| S-0006a | Pending approvals in dashboard | open | Sub-task of S-0006: surface pending A1 actions / Claude Code permission prompts in owner dashboard. Each item: requesting agent, action, target, timestamp, approve/deny. | jecki 2026-06-13 | Shelly | 2026-06-13 | with dashboards build | P2 |
| S-0007 | Shelly move: capability handover | done | DONE -- owner reported migration COMPLETE 2026-06-20; Shelly now operates from C:\Users\Jecki\DEV\projects\Shelly; owner-office board rows + memory migrated there. UNVERIFIABLE FROM ECO-SYNTHETIC (project-scoped session): whether her 8 shortlist tools actually installed in her repo + whether T-0028 cert ran there -- confirm in a Shelly-repo session. Original scope: On Shelly's separation to her standalone repo (T-0010): execute the handover per company/processes/shelly-move-initial-audit.md. FIRST step on move = Shelly requests the initial capability audit from Eco (audit produced 2026-06-18). ONE-TIME MIGRATION (Eco+Shelly+owner): new project CLAUDE.md (red lines, ASCII rule, Google read-only, no-auto-update policy); her own gate-register with carried grants at their pins; install the 8 shortlist tools + meeting-prep sub-agent; Telegram token into the new .env (owner, manual, never committed); owner-office memory + board rows; 2h check-in trigger. STANDING CROSS-PROJECT SERVICES (route back to eco-synthetic): Security gate (Rambo), Legal (Eyal), HR cert (Anat); any NEW tool or UPDATE runs the company gate first. whatsapp-mcp is NOT migrated -- fresh gated install (QR + Shir + 9 conditions). CHANNEL (no native cross-repo agent messaging): owner-relay + shared async drop-folder under C:\Users\Jecki\DEV\shared\; behavioral cert/audit (B3/B5) runs with company auditors INSIDE Shelly's repo, static reviews (Legal/gate) on shared/ snapshots; real-time inter-bridge is a later Shir build (P2). See audit section 4.5. Handover package (exact content to apply IN the Shelly repo): company/processes/shelly-handover-package.md. | jecki 2026-06-18 | Eco/Shelly | 2026-06-18 | on move (T-0010) | P2 |

---

## Company (Eco)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| T-0001 | Go-live structure and R&R review | in-progress | Go-live structure and R&R review + VP Product decision + Ido scope task. Includes Eco HR cert gap resolution. | go-live | Eco | 2026-06-12 | immediate | P1 |
| T-0002 | Design decisions brief for owner | done | Backlog design decisions to bring owner: concurrency rule; task-log storage (JSONL->SQLite); durable chat memory (store+retrieval via MCP); Gemini for non-sensitive research. Brief at company/memos/design-decisions-brief-2026-06-14.md. OVERDUE. Decisions made by owner (A1) 2026-06-16 -- see decisions-log entry. Implementation tracked separately under each relevant task. | company/backlog.md [DESIGN] | Eco | 2026-06-14 | done 2026-06-16 | P1 |
| T-0003 | Backlog QUEUE items execution | open | Work company/backlog.md [QUEUE] items by priority: Rambo permission scans; fitness/discovery loop; listener/scout agent proposal; CFO tooling incl. GreenInvoice lead; per-agent knowledge files; Sales proposal-pipeline. | Eco backlog review | Eco | 2026-06-12 | queued | P2 |
| T-0004 | Model router Phase A skeleton | open | Model router Phase A skeleton: selection + logging, Claude-only. Per company/model-router-design.md Phase A. Queued until R&D staffed. | company/model-router-design.md | Eco | 2026-06-12 | queued (R&D when staffed) | P2 |
| T-0005 | Compliance backlog tracking | open | Compliance backlog tracking with Eyal + Lital: registration, invoicing, privacy, account migration. Per company/governance/compliance-backlog.md. | compliance-backlog.md | Eco | 2026-06-12 | queued, proactive | P2 |
| T-0006 | WhatsApp-transcript comparison | open | WhatsApp-transcript comparison: file in /sources; compare to our practices; bring recommendation. | jecki | Eco | 2026-06-12 | queued | P2 |
| T-0007 | Owner presentations intake | open | Owner presentations intake: photos/audio-transcript/web-extract -> feed into structure review when provided by owner. | jecki | Eco | 2026-06-12 | waiting-on-owner | P2 |
| T-0008 | Wiki seed and maintain | open | Seed and maintain memory/wiki/ -- update pages as decisions are logged; owner steers topics. Seeded 2026-06-12; ongoing. | jecki | Eco | 2026-06-12 | ongoing | P2 |
| T-0009 | Monthly on-demand agent review | open | Monthly: review on-demand/later agents vs current workload; draft wake-up proposals; escalate A1; log in decisions-log. Transfer to Assaf (OE) when built. | Eco role file | Eco | 2026-06-12 | monthly recurring | P2 |
| T-0010 | Shelly separation assessment | done | DONE -- separation EXECUTED (owner-reported 2026-06-20); recommendation realized; Shelly now operating from C:\Users\Jecki\DEV\projects\Shelly. Original scope: Evaluate whether Shelly stays in eco-synthetic repo/runtime or separates into independent private repo+process. Deliverables: privacy/security analysis; ops cost; company-facing duties across boundary; trigger conditions; migration sketch. Recommendation only -- actual separation is A1. | jecki 2026-06-12 | Eco | 2026-06-12 | queued | P2 |
| T-0011 | Wiki feature evaluation post-ingest | blocked | Evaluate and recommend each feature for adoption: /readiness score; /daily full loop; /query wiki-search; wiki /lint; /meeting-prep agent; /guy proposal pipeline; /pull active data capture. Each: fit, effort, overlap, net value. A1 for new agent; A2 for new skill. Blocked until wiki setup complete. | jecki 2026-06-13 | Eco | 2026-06-13 | blocked-until wiki setup | P2 |
| T-0012 | Access-matrix agents/ reconciliation | done | Formalize .claude/agents/ read access for Anat (HR), Rambo (Security), Dalia (Q&G), Assaf (OE) in access-matrix.md. A2 decision; Dalia + Rambo review; log in decisions-log.md. Completed on eco-ops-overnight branch 2026-06-17 (access-matrix.md updated); all files confirmed in master 2026-06-18. Dalia owns ongoing. | Rambo certification 2026-06-14 | Dalia | 2026-06-14 | done 2026-06-18 | P3 |
| T-0013 | Gate-register bootstrapping review | done | On activation: read gate-register.md bootstrapping note for Rambo tools. Confirm no legal terms gap. If clear: append confirmation to gate-register.md. Completed by Eyal on eco-ops-overnight branch 2026-06-17: no legal terms gap; gate-register.md confirmation appended. Files confirmed in master 2026-06-18. | Rambo go-live 2026-06-14 | Eyal | 2026-06-14 | done 2026-06-18 | P3 |
| T-0014 | Initial permission scan all live agents | done | Full scan of all 21 live agents by Rambo 2026-06-18. Report: company/processes/permission-scan-2026-06-18.md. Overall: 5 BLOCKING FLAGS, 14 CLEAR-WITH-NOTES, 11 CLEAR. Flags tracked as T-0025 to T-0030. No opus-default leaks (T-0023 covered). | Rambo go-live 2026-06-14 | Rambo | 2026-06-14 | done 2026-06-18 | P1 |
| T-0015 | P1 agent drafts (all 10 pending) | done | Draft role files for all pending P1 agents: Ido, Eyal, Lital, Dalia, Noam, Assaf, Gal, Shir, Luci, Erez. Drafts complete 2026-06-14. Now blocked on T-0019 (competency testing) before owner go-live A1. All 10 P1 agents certified and live (owner A1, 2026-06-17). Full P1 set complete. | jecki 2026-06-14 | Eco | 2026-06-14 | done 2026-06-17 | P1 |
| T-0016 | Wiki refresh (backlog + roster) | done | Update memory/wiki/backlog-summary.md and agent-roster.md to match current board.md and roster. Wiki stale since 2026-06-12. Do after T-0015 drafts complete. backlog-summary.md fully rewritten 2026-06-18 (21 live agents, stale ONB entries removed, new tasks added). agent-roster.md was already current as of this session. | Eco self-identified | Eco | 2026-06-14 | done 2026-06-18 | P1 |
| T-0017 | Israeli law + finance tools process | open | When Lital or Eyal identify a tool need: Eco asks owner for candidate. Then: Rambo risk review + Eyal/Lital terms review + A2 Eco + A1 owner. Eco does not source tools independently. | jecki 2026-06-14 | Eco | 2026-06-14 | on-need | P2 |
| T-0031 | Tool-library catalog ownership + maintenance | open | Yossi (Training) + Assaf (OE) own company/governance/tool-library-catalog.md: keep current with sources/, fold in the full IL Skills file list (named items are representative only), update status as tools are gated/adopted, surface candidate tools to Eco as live agents develop needs. Adoption stays NEEDS-DRIVEN + gated (gate-register is the adoption record). | owner 2026-06-21 | Assaf/Yossi | 2026-06-21 | ongoing | P2 |
| T-0032 | Install formation/compliance batch | open | Install the A2-granted batch in eco-synthetic .claude/skills (owner terminal, PROJECT scope, pinned skills-il CLI): Startup Toolkit (developer-tools@v1.2.0-israeli-startup-toolkit), Legal research (security-compliance@v1.3.0-hebrew-legal-research), Privacy shield (security-compliance@v1.4.1-israeli-privacy-shield --skill israeli-privacy-shield -- C1 RESOLVED 2026-06-21). Full cmds: `CI=true npx skills-il@1.10.0 add <source> --skill <slug> -a claude-code` (slugs: israeli-startup-toolkit, hebrew-legal-research, israeli-privacy-shield), choose PROJECT scope. Orientation-only boundary; version-currency at use. | owner 2026-06-21 | Eco/owner | 2026-06-21 | when convenient | P3 |
| T-0018 | Assaf agents/ access expansion | open | Expand T-0012 scope to include Assaf (OE). Same read need as Anat/Rambo/Dalia. A2 Eco decision; Dalia formalizes in T-0012 matrix update. No owner A1 required. | Eco 2026-06-14 | Eco | 2026-06-14 | with T-0012 | P3 |
| T-0019 | Competency testing all 11 P1 agents | done | For each of 11 P1 agents (10 new + Hila): produce competency spec (domain reqs + 3 test scenarios + pass criteria); direct manager runs tests; document results; Anat reviews. Assemble Stage C packages. Owner go-live A1 only after all complete. Per company/processes/agent-hiring.md. B1 DONE: all 11 role files in .claude/agents/. B2 DONE 2026-06-15: all 11 specs in company/hr/competency/ (Hila spec added 2026-06-15). Onboarding runbook rewritten to B3-forward 2026-06-15. Eco B7 preliminary assessment written (eco-b7-preliminary.md). B3 test-results shells created 2026-06-15: all 11 in company/hr/competency/<Name>-test-results.md (scenarios pre-structured; B6 role-file accuracy pre-confirmed by Eco; outputs and results PENDING). Stage A batch approval formally logged in decisions-log.md 2026-06-15. B3 pending (needs Claude Code session with Anat + Agent tool). Sequence: L3 agents first (Eco evaluator), then Gal+Shir after Ido live. All 11 P1 agents tested (3/3 PASS each), certified, live as of 2026-06-17. | jecki 2026-06-14 | Eco | 2026-06-14 | done 2026-06-17 | P1 |
| DASH-001 | Owner dashboard (automated, self-refreshing) | in-progress | Engineered auto-refreshing owner dashboard showing all task queues, pending approvals, and company status. Scope and build by Ido (R&D). Interim version at memory/owner-dashboard.md. Ido live 2026-06-17; tasked 2026-06-18. | jecki 2026-06-15 | Ido | 2026-06-15 | ASAP | P1 |
| T-0023 | Model-config audit -- include new role files | done | Rambo confirmed during T-0014 full scan (2026-06-18): NO opus-default leaks across any agent; all 2026-06-18 role files have Sonnet frontmatter matching body. No fixes needed. | jecki 2026-06-18 | Assaf | 2026-06-18 | done 2026-06-18 | P2 |
| T-0024 | Understand the eco-ops-overnight effort | done | Investigated per owner ask. The `claude/eco-ops-overnight` branch (parallel session, 2026-06-16/17) ran a NON-HIRING ops batch: T-0021 git-sync governance leg, T-0012 access-matrix reconciliation, T-0013 gate-register legal review, T-0014 permission scan (5 stable agents, all clear), T-0002 design paper, T-0016 wiki-recurrence. Merge confirmed 2026-06-18: git reports "already up to date" -- overnight branch content is in master. T-0012 and T-0013 marked done. Owner A1 2026-06-18. | jecki 2026-06-18 | Eco | 2026-06-18 | done 2026-06-18 | P2 |
| T-0025 | Eco.md RL9/10/11 block addition | done | RL9/10/11 block added to Eco.md (owner A1 2026-06-18, folded into the rename/persona lock-in). | T-0014 scan 2026-06-18 | Eco/jecki | 2026-06-18 | done 2026-06-18 | P1 |
| T-0026 | Shir.md RL9/10/11 block addition | done | RL9/10/11 block added to Shir.md (owner A1 2026-06-18). RL9 framed for Shir's infra/log/Bash access (scrub personal data before storing). | T-0014 scan 2026-06-18 | Shir/jecki | 2026-06-18 | done 2026-06-18 | P1 |
| T-0027 | Erez.md RL9 addition | done | Constitution RL9/10/11 block added to Erez.md (owner A1 2026-06-18); RL9 covers personal data in fetched web content. | T-0014 scan 2026-06-18 | Erez/jecki | 2026-06-18 | done 2026-06-18 | P2 |
| T-0028 | Shelly HR certification at first audit | open | OWNER DIRECTIVE 2026-06-18: Eco completes Shelly's hiring/certification (Anat B4 + Rambo B5) as part of the FIRST audit / fitness review Eco-Synthetic runs for her. Not a standalone task -- folded into the first audit pass. Shelly keeps running (Telegram channel) until then. Still interacts with T-0010 (separation): if Shelly separates, certify in the destination repo. OWNER A1 2026-06-18: sequenced as Shelly's FIRST post-move milestone -- run in the destination repo immediately after the initial audit + handover (S-0007). Anat (B4) + Rambo (B5) route back as standing cross-project services. OPEN ITEM 2026-06-20: migration reported complete, but whether the cert actually RAN in the Shelly destination repo is NOT verifiable from eco-synthetic -- confirm; if not done, it remains the first milestone in her repo. | jecki 2026-06-18 | Eco/Anat | 2026-06-18 | confirm in Shelly repo | P2 |
| T-0029 | MeetingPrep gate + certification | done | Rambo re-scanned the source repo 2026-06-18 -- CLEAR (static markdown, MIT, zero injection vectors); the T-0014 flag was a doc gap, not a security gap. Eyal MIT clearance already on gate-register (2026-06-13). MeetingPrep CERTIFIED + LIVE (v1.0) under Sales (Sally), owner A1 2026-06-18. B3 3/3, Anat certify (conditions resolved in v1.0), Sally B6. | T-0014 scan 2026-06-18 | Rambo/Eco | 2026-06-18 | done 2026-06-18 | P1 |
| T-0030 | Ido allowlist entry update | done | Ido moved DENIED -> PERMITTED on the Agent-tool spawn-allowlist (owner A1 2026-06-18). Bash was removed at go-live 2026-06-17, so Ido is a no-Bash planning agent like Perry/Dalia. Also fixed the stale "Noam" -> "Perry" reference on the allowlist. File: company/governance/agent-tool-spawn-allowlist.md. | T-0014 scan 2026-06-18 | Eco/jecki | 2026-06-18 | done 2026-06-18 | P3 |

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
- Tim (VP Sales): role design APPROVED by owner 2026-06-17; role file BUILT (.claude/agents/Tim.md, B1 done); spec at company/hr/competency/Tim-spec.md. B3 APPROVED by owner A1 2026-06-18 (morning session); running this session. B4 (Anat) + B5 (Rambo) + B6/B7 (Eco) + Stage C owner A1 to follow.
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
| ONB-001 | Certify Hila (Marketing) | done | B1 done (role file). B2 done (spec 2026-06-15). Certified + LIVE 2026-06-17 (light track). ORG-001 full-track activation completed 2026-06-18. See ORG-001. | jecki 2026-06-10 | Eco/Anat | 2026-06-12 | done 2026-06-18 | P1 |
| ONB-002 | Rambo go-live | done | Certified + owner A1 (2026-06-14). Role file in .claude/agents/Rambo.md. Decisions-log entry exists. | jecki 2026-06-14 | Eco/Anat | 2026-06-14 | done 2026-06-14 | P1 |
| ONB-003 | Bring up Ido (VP R&D) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). Bash removed (A1). | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-004 | Bring up Dalia (Q&G) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). T-0012 now unblocked. | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-005 | Bring up Lital (CFO) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). Rambo B5 cleared. | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-006 | Bring up Eyal (Legal) | done | LIVE 2026-06-17. B3 3/3 PASS; Anat B4 certify (no conditions); Rambo B5 clear (no conditions). Zero-condition -> auto-go-live under owner standing A1. Interview moved to company/hr/interviews/Eyal-interview.md. T-0013 auto-started. | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-007 | Bring up Noam (Product) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). VP Product title confirmed (T-0001 resolved). | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-008 | Bring up Assaf (OE) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). .claude/agents/ read access granted (owner A1). | T-0019 | Eco/Anat | 2026-06-14 | done 2026-06-17 | P1 |
| ONB-009 | Bring up Gal (Lead Developer) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1). Ido B6 confirmed. Bash justified. | T-0019 | Eco/Ido | 2026-06-15 | done 2026-06-17 | P1 |
| ONB-010 | Bring up Shir (DevOps) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1). Ido B6 confirmed. Bash justified. | T-0019 | Eco/Ido | 2026-06-15 | done 2026-06-17 | P1 |
| ONB-011 | Bring up Luci (Devil's Advocate) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). Model corrected opus->sonnet. | T-0019 | Eco | 2026-06-15 | done 2026-06-17 | P1 |
| ONB-012 | Bring up Erez (Investor, on-demand) | done | B3-B7 complete. CERTIFIED + LIVE 2026-06-17 (owner A1 batch). WebSearch+WebFetch gate-registered. Model corrected opus->sonnet. | T-0019 | Eco | 2026-06-15 | done 2026-06-17 | P1 |
| ONB-013 | Bring up Tim (VP Sales) | blocked | B1-B7 complete (all done 2026-06-17 per Tim-test-results.md: 3/3 PASS, Anat certify, Rambo clear-with-2-conditions, Eco B6/B7 GO). B3 re-confirmed 2026-06-18 (3 isolated worktree runs, 3/3 PASS, zero conditions). BLOCKED on A1: Tim.md still reads "pending certification" -- role file update is owner A1. Owner must update Tim.md cert-status and go-live line. Board ORG-002 rows says done but role file disagrees. | jecki 2026-06-17 | Eco | 2026-06-18 | owner A1 needed | P1 |

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
| HIRE-001 | Knowledge/Documentation manager sub-agent | done | Sub-agent under Dalia (Q&G); persona Yael. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3; Anat certify; Rambo clear; Dalia B6. Indexer-not-rewriter. Owns DAL-002 documentation-standard work going forward. | jecki 2026-06-15 | Anat/Eco/Dalia | 2026-06-15 | done 2026-06-18 | P2 |
| HIRE-002 | Chronicler / build-historian agent | done | Build-historian; reports to Eco, dotted Dalia + Hila. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 incl. confidentiality + decisions-log-write hard-blocks; Anat certify; Rambo clear; Eco B6. Read-only confidential; writes only company/chronicle/. First task: capture this 2026-06-18 build-out into the chronicle. | jecki 2026-06-15 | Anat/Eco | 2026-06-15 | done 2026-06-18 | P1 |

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
| HIRE-005 | Jenny / Avner / Ella (CS reps) | done | L4, report to Mike. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 (Jenny full 3/3; Avner+Ella boundary); Anat certify; Rambo clear (write -> company/cs/tickets/); Mike B6. HARD: no customer contact until CS-0001 approved + product live. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco/Mike | 2026-06-18 | done 2026-06-18 | P3 |
| HIRE-006 | Alex (Sales) | done | L4, reports to Tim. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 (send boundary held under owner pressure); Anat certify; Rambo clear; Tim B6. HARD: no prospect send until product + pricing + Tim/owner A1. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco/Tim | 2026-06-18 | done 2026-06-18 | P3 |
| HIRE-007 | Zvika (Research) | done | L4, gated/on-demand (A2 wake), reports to Eco. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 incl. injection boundary; Anat certify; Rambo clear (gate-register web-tools row added, jecki A1; tainted-content rule); Eco B6. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-008 | Roman (Algorithm Specialist) | done | L4, on-demand (Ido invokes, A2), reports to Ido. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3; Anat certify; Rambo clear (Ido confirm prototypes/ not auto-exec before 1st invoke); Ido B6. No Bash. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco/Ido | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-009 | Adi (QA) | done | L4, reports to Ido. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 incl. Bash-safety boundary; Anat certify; Rambo clear (Bash JUSTIFIED, test-exec only); Ido B6. HARD: off spawn-allowlist until T-0020 C3 (Bash agent). | jecki A1 2026-06-18 | Eco/Ido | 2026-06-18 | done 2026-06-18 | P2 |
| HIRE-010 | Sami (SME advisor) | done | On-demand, per-project, one instance per active project. CERTIFIED + LIVE 2026-06-18 (owner A1). B3 3/3 incl. both partition hard-blocks; Anat certify; Rambo clear; Eco B6. Reads/writes only assigned partition. Off spawn-allowlist until T-0020 C3. | jecki A1 2026-06-18 | Eco | 2026-06-18 | done 2026-06-18 | P2 |

---

## DevOps / Bridge (Shir -- on go-live)

| task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created | due | priority |
|---------|------------|--------|---------------|--------------|-------------|---------|-----|----------|
| SHIR-003 | Cross-project inter-bridge channel | open | Durable real-time channel between separate agent repos (Shelly's standalone project <-> eco-synthetic). NEEDED because Claude Code agents are repo-scoped and cannot natively message across projects (see company/processes/shelly-move-initial-audit.md section 4.5). INTERIM (no build, use now): owner-relay + shared async drop-folder under C:\Users\Jecki\DEV\shared\. THIS TASK = the replacement: two Telegram bridges sharing an owner group OR a small relay/queue so one project's session can hand a gate/audit request to another and receive the verdict. MUST preserve gate routing (Shelly -> Eco -> Rambo/Eyal -> back) and NEVER transit secrets through shared/tracked paths [red line 5]. Note: SHIR-002 is reserved for the whatsapp-mcp bridge-layer sanitization + sender allowlist (R1/R4 permanent). Depends on Shir go-live + Shelly separation (T-0010/S-0007). | jecki 2026-06-18 | Shir | 2026-06-18 | after Shir go-live; when shared/-folder interim outgrows | P2 |
| SHIR-004 | Reconcile two bridge.py versions | open | Two bridge.py cleanups diverged (both remove Shelly after her move): the version now on master (from the shelly-separation branch) and the alternate on branch wip/bridge-status-done (PR #5: https://github.com/Jecki-Elbaz/eco-synthetic/pull/5). Shir: compare, decide keep-master / take-PR / merge-intents, then close PR #5. No data lost (both preserved). | Eco 2026-06-21 | Shir | 2026-06-21 | first sprint after Shir go-live | P2 |
| SHIR-001 | Bridge async ack + timeout fix | in-progress | The Telegram bridge has a 120s hard timeout. If Eco's processing takes longer, Telegram drops the response and the user sees an error. The requested pattern (jecki 2026-06-16): (1) Bridge receives message -> immediately pushes "On it, Jecki..." to Telegram before calling Claude. (2) Calls Claude asynchronously in the background. (3) When Claude finishes, pushes the full response as a second Telegram message. This makes Eco appear async to the user even though Claude is still synchronous. Eco cannot self-push mid-processing -- no channel is open between invocations. All of this must be built at the bridge layer. Also evaluate: extend timeout window, support streaming/partial sends. No A1 needed beyond go-live (DevOps scope). | jecki 2026-06-16 | Shir | 2026-06-16 | first sprint after Shir go-live | P1 |
