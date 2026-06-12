# Glossary

| Term | Meaning |
|------|---------|
| A1 | Owner (jecki) approval required before execution |
| A2 | CEO (Eco) decides; jecki notified |
| A3 | Responsible agent decides within policy; logged |
| L1-L5 | Hierarchy levels: L1=Owner, L2=CEO, L3=VP/staff, L4=manager/senior, L5=employee |
| P1 / P2 / P3 | Company phases: P1=foundation, P2=growth, P3=scale |
| OE | Operational Excellence (Assaf) |
| R&R | Roles and Responsibilities (per agent role file) |
| R&D | Research and Development (VP: Ido) |
| CS | Customer Success (VP: Mike, P3) |
| Go-live | Phase 1 activation: Telegram bridge running, Eco + Shelly active |
| Bridge context | Block injected into every agent system prompt; enforces honesty + tool limits |
| CLAUDE_CODE_OAUTH_TOKEN | Long-lived OAuth token for Claude Max subscription auth |
| Constitution section 16 | Truthfulness rule: never guess; state uncertainty plainly |
| Wake-up task | Scheduled 2h autonomous check-in from agent to jecki; see company/governance/schedules.md |
| Board | memory/board.md -- company task board; Eco owns; Assaf monitors |
| KB | This knowledge base at memory/wiki/; quick-reference wiki for agents |
| Gate | Security + Legal clearance required before tool adoption or contract |
| Sami pattern | One on-demand SME per active project; advisory only |
| OWNER_ONLY_MODE | Bridge config flag (True = personal OAuth only; False = customer-facing API key) |
| Frontmatter | YAML header in agent .md files; stripped by bridge before use as system prompt |
| Task envelope | Standard per-invocation format: task_id, requester, objective, context_refs, inputs, constraints/gate, output_format, priority/deadline, report_back |
| Result envelope | Standard output format: result, artifacts, decisions, escalations, tokens_used, status |
