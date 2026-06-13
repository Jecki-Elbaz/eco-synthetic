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
| T-0010 | Eco | done | Shelly separation assessment: evaluate whether Shelly stays in eco-synthetic repo/runtime or separates into independent private repo+process. RESOLVED 2026-06-13 by A1 decision: Shelly separated into standalone project C:\Users\Jecki\DEV\projects\Shelly with personal-account access (gated writes, earned-autonomy ledger). See decisions-log 2026-06-13. | P2 | done | Owner A1 2026-06-13; Shelly decommissioned from this repo |
| T-0011 | Eco | blocked | Wiki feature evaluation (post-ingest): evaluate and recommend each of the following for adoption -- (1) /readiness score; (2) /daily full loop; (3) /query wiki-search; (4) wiki /lint health check; (5) /meeting-prep agent; (6) /guy proposal pipeline vs T-0008; (7) /pull active data capture. For each: assess fit, effort, overlap with existing, net value. Prioritized recommendation to owner. Execute only with owner approval (A1 new agent; A2 new skill). | P2 | blocked-until: Tasks 1-4 wiki setup complete | Owner-approved 2026-06-13; unblocked when /ingest is working and wiki has real content |

## Marketing (P1 light track -- Hila)

| task_id | agent | status | objective | priority | deadline | notes |
|---------|-------|--------|-----------|----------|----------|-------|
| HIL-001 | Hila | blocked | Brand basics: logo, palette, typography -- present options for A1 | P2 | after certification | Blocked on Hila certification |
| HIL-002 | Hila | blocked | Agent avatars: present style choice (Badge vs Persona) for A1 | P2 | after certification | Blocked on Hila certification |
| HIL-003 | Hila | blocked | LinkedIn page: set up once domain + company email available | P2 | after S-0002 and S-0003 | Blocked on domain + email |
| HIL-004 | Hila | blocked | Secure social handles for Eco-Synthetic | P3 | after domain | Blocked on domain |
