# Eco-Synthetic: Task Board

Cross-company task board. Owned by Eco; Assaf (OE) monitors usage.
Per constitution section 5: each agent writes to its own rows. Eco orchestrates.

Format per task:
```
| task_id | agent | status | objective | priority | deadline | notes |
```

Status values: `open`, `in-progress`, `blocked`, `done`, `cancelled`.

---

## Owner-office (Shelly)

| task_id | agent | status | objective | priority | deadline | notes |
|---------|-------|--------|-----------|----------|----------|-------|
| S-0001 | Shelly | in-progress | Operate the owner's Telegram channel | P1 | active | Bot token set; bridge live |
| S-0002 | Shelly | open | Domain check: eco-synthetic.com vs .ai (+ non-hyphen variants), availability + pricing; present for owner approval; purchase only after A1 + payment | P1 | ASAP | A1 before purchase |
| S-0003 | Shelly | blocked | After domain approved: company email, drive, eco@/shelly@ mailboxes, rest in order (account-migration flagged) | P2 | after S-0002 | Blocked on domain purchase |
| S-0004 | Shelly | in-progress | Owner queue triage + awaiting-owner list + reminders | P1 | recurring | Active; approved per schedules.md |
| S-0005 | Shelly | open | WhatsApp adoption evaluation: cost, terms, Evolution-vs-Cloud-API tradeoff; recommendation to owner (A1 before any action) | P3 | later | From role file responsibilities |
| S-0006 | Shelly | open | Owner dashboard surfacing (when dashboards exist) | P3 | later | Blocked on dashboards build |
| S-0006a | Shelly | open | Sub-task of S-0006: surface pending approval requests (A1 actions / Claude Code permission prompts) in the owner dashboard, so the owner can see and act on them without hunting in the CLI/app. Each item shows: requesting agent, action, target path/resource, timestamp, approve/deny. | P2 | with dashboards build | Owner-requested 2026-06-13; today approvals only appear in Claude Code, not surfaced to owner |

## Company (Eco)

| task_id | agent | status | objective | priority | deadline | notes |
|---------|-------|--------|-----------|----------|----------|-------|
| T-0001 | Eco | in-progress | Go-live structure and R&R review + VP Product decision + Ido scope task | P1 | immediate | First task post go-live; includes Eco HR cert gap resolution |
| T-0002 | Eco | open | Backlog design decisions to bring the owner: concurrency rule; task-log storage (JSONL->SQLite); durable chat memory (store+retrieval via MCP); Gemini for non-sensitive research/second-opinion | P1 | queued | Per company/backlog.md [DESIGN] items |
| T-0003 | Eco | open | Work company/backlog.md [QUEUE] items by priority: Rambo permission scans; fitness/discovery loop (OE+HR+Training); listener/scout agent proposal (feasibility + Eyal consent); CFO tooling incl. GreenInvoice lead; per-agent knowledge files; Sales proposal-pipeline pattern (later) | P2 | queued | Eco prioritizes; owner approval per item |
| T-0004 | Eco | open | Model router Phase A skeleton: selection + logging, Claude-only | P2 | queued (R&D when staffed) | Per company/model-router-design.md Phase A |
| T-0005 | Eco | open | Compliance backlog tracking with Eyal + Lital: registration, invoicing, privacy, account migration | P2 | queued, proactive | Per company/governance/compliance-backlog.md |
| T-0006 | Eco | open | WhatsApp-transcript comparison: file in /sources; compare to our practices; bring recommendation | P2 | queued | Source file present in sources/ |
| T-0007 | Eco | open | Owner presentations intake: photos/audio-transcript/web-extract -> feed into structure review when provided by owner | P2 | waiting-on-owner | Owner to share files when ready |
| T-0008 | Eco | open | LLM Wiki: seed and maintain memory/wiki/ -- update pages as decisions are logged; owner steers topics | P2 | ongoing | Seeded 2026-06-12; maintain going forward |
| T-0009 | Eco | open | Monthly: review on-demand/later agents against current workload; draft wake-up proposals for any warranting autonomous work; escalate A1; log in decisions-log | P2 | monthly recurring | Transfer to Assaf (OE) when built |
| T-0010 | Eco | open | Shelly separation assessment: evaluate whether Shelly stays in eco-synthetic repo/runtime or separates into independent private repo+process. Deliverables: (1) privacy/security analysis of personal data in company repo vs separated; (2) ops cost of second repo/runtime/scheduler; (3) handling of company-facing duties across boundary if split; (4) recommended trigger conditions for split; (5) migration sketch. Produces recommendation only -- any actual separation is A1. | P2 | queued | Owner-requested 2026-06-12; feeds T-0006 |
| T-0011 | Eco | blocked | Wiki feature evaluation (post-ingest): evaluate and recommend each of the following for adoption -- (1) /readiness score; (2) /daily full loop; (3) /query wiki-search; (4) wiki /lint health check; (5) /meeting-prep agent; (6) /guy proposal pipeline vs T-0008; (7) /pull active data capture. For each: assess fit, effort, overlap with existing, net value. Prioritized recommendation to owner. Execute only with owner approval (A1 new agent; A2 new skill). | P2 | blocked-until: Tasks 1-4 wiki setup complete | Owner-approved 2026-06-13; unblocked when /ingest is working and wiki has real content |
| T-0012 | Dalia | blocked | Access-matrix reconciliation (scope expanded 2026-06-14, further expanded on Dalia go-live): formalize .claude/agents/ read-by-exception for Anat (HR), Rambo (Security), AND Dalia (Q&G) in company/governance/access-matrix.md. All three exceptions bootstrapped by owner A1; Dalia to confirm no gaps, raise concerns, and log as a single A2 decision with Rambo review. | P3 | when Dalia built | Originally Anat-only; expanded to include Rambo (2026-06-14); expanded again to include Dalia's own read-by-exception (Dalia go-live). Do not act before Dalia exists. |
| T-0013 | Eyal | blocked | Gate-register bootstrapping review: on activation, read company/governance/gate-register.md bootstrapping note for Rambo tools (Read, Write, Edit, Grep, Glob, WebFetch -- cleared as Claude Code runtime subset, A1 2026-06-12). Confirm no legal terms gap exists for those tools as used by Rambo. Raise any concern to Eco. If no gap: append confirmation note to gate-register.md. | P3 | when Eyal built | Eyal did not exist at Rambo go-live; bootstrapping exception logged in decisions-log.md 2026-06-14. |
| T-0014 | Rambo | open | Initial permission scan: run permission-scope scan on all currently live agents (Eco, Anat, Hila, Shelly, Designer). Output per-agent report to Eco. Flag any excess permissions before next agent goes live. | P1 | immediate | First task post go-live; unblocks future agent certs per access-matrix scan policy. |
| T-0015 | Eco | in-progress | Parallel P1 agent build: draft role files for ALL pending P1 agents simultaneously -- Ido, Eyal, Lital, Dalia, Noam, Assaf, Gal, Shir, Luci, Erez. Drafts complete 2026-06-14. Now blocked on T-0019 (competency testing) before owner go-live A1 can be requested. | P1 | immediate | Drafts done; go-live A1 blocked until T-0019 complete per owner instruction 2026-06-14 |
| T-0016 | Eco | open | Wiki refresh: update memory/wiki/backlog-summary.md and agent-roster.md to match current board.md and roster. Wiki is stale (last sync 2026-06-12); caused Eco to misread task state. Do after T-0015 draft builds complete. | P1 | after T-0015 starts | Root cause of ONB- confabulation. |
| T-0017 | Eco | open | Israeli law + finance tools gate: owner confirmed intent 2026-06-14 to give Lital and Eyal Israeli-law and finance domain tools/skills. Run full gate: Rambo risk review + Eyal terms review (Eyal reviews his own tools -- flag to Eco if conflict) + A2 Eco recommendation + A1 owner before any adoption. Propose candidate tools to owner first. | P2 | queued | Gate required before any adoption per const §6 |
| T-0018 | Eco | open | Assaf .claude/agents/ access: owner A1 decision required. Option (a): add Assaf to bootstrap exception note in access-matrix alongside Anat + Rambo, expand T-0012 scope to include Assaf. Option (b): defer -- Assaf goes live with limited fitness-loop. Eco to present options to owner at Assaf go-live Stage C. | P2 | before Assaf go-live | Flagged at Assaf build (C1) |
| T-0019 | Eco | open | Competency testing for all 10 P1 agent drafts: for each agent, produce competency spec (domain requirements + 3 test scenarios + pass criteria), direct manager runs tests, results documented. Anat reviews test results. Then assemble Stage C packages. Only after all Stage B complete -> owner go-live A1 per /hiring process. Process: company/processes/agent-hiring.md. | P1 | before any go-live A1 | Owner-required 2026-06-14; go-live A1 blocked until complete |

## Marketing (P1 light track -- Hila)

| task_id | agent | status | objective | priority | deadline | notes |
|---------|-------|--------|-----------|----------|----------|-------|
| HIL-001 | Hila | blocked | Brand basics: logo, palette, typography -- present options for A1 | P2 | after certification | Blocked on Hila certification |
| HIL-002 | Hila | blocked | Agent avatars: present style choice (Badge vs Persona) for A1 | P2 | after certification | Blocked on Hila certification |
| HIL-003 | Hila | blocked | LinkedIn page: set up once domain + company email available | P2 | after S-0002 and S-0003 | Blocked on domain + email |
| HIL-004 | Hila | blocked | Secure social handles for Eco-Synthetic | P3 | after domain | Blocked on domain |
