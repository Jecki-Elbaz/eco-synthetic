# Eco-Synthetic: Idea & Decision Backlog

A living capture of the owner's ideas, thoughts, and inputs. **Nothing here executes until jecki approves its disposition.** Once approved, Eco prioritizes queued items post-launch. Foundational items marked `[SCAFFOLD]` are cheap now and painful to retrofit, so they should be baked in when the repo is scaffolded.

Disposition legend: `[SCAFFOLD]` do at/just-after scaffolding · `[DESIGN]` small design decision to settle with the owner before/at execution · `[QUEUE]` Eco/team task post-launch · `[BOARD]` Initiative Review Board, later phase · `[REVIEW]` I analyze and bring a recommendation back.

---

## From `to do or check.txt`

| # | Idea (short) | My take | Proposed disposition |
|---|--------------|---------|----------------------|
| 1 | Per-agent access table: which folder/tool each agent may touch; deny the rest | This is the ACL/access-matrix (constitution section 9). Framework decided; needs a concrete v1 table | `[SCAFFOLD]` build access-matrix v1 (Dalia + Rambo) |
| 2 | Rambo scans for excess permissions -- on existing agents, every new agent, and every change | Right instinct; least-privilege as a standing check | `[SCAFFOLD]` codify the policy; `[QUEUE]` Rambo runs scans ongoing |
| 3 | Find the best definition per agent; check better ones online/Anthropic; HR + Training keep agents improving | This is the section 10 fitness/discovery loop | `[QUEUE]` OE + HR + Training, post-launch |
| 4 | Parallel vs serial execution; prevent two managers invoking agents that share a resource | Real orchestration gap -- needs a concurrency/resource-lock rule | `[DESIGN]` settle a short rule now; Eco enforces |
| 5 | Rambo: detect prompt injection, a shared safety-guidelines file, red-team / token-theft defense, ensure skills | Security depth; the AI-tips file gives concrete material | `[SCAFFOLD]` security baseline + CLAUDE.md deny-list; `[QUEUE]` Rambo executes |
| 6 | Uploaded source media protected from edit/delete; edit only on copies | Data-integrity rule; easy to enshrine | `[SCAFFOLD]` read-only `sources/` dir + ACL + rule |
| 7 | Define what must never reach Git; enforce; maybe an "allowed to push" zone | Extends the .env/secrets policy | `[SCAFFOLD]` .gitignore policy + allowlist |
| 8 | Concise append-only inter-agent task log (task_id threaded; Assaf-only smart read; per-agent color; maybe local dashboard) | Concrete + valuable. Storage: see note below | `[DESIGN]` choose storage now; `[SCAFFOLD]` build the skeleton |
| 9 | New-project viability research, VC-grade deliverables (SWOT, profit, competitors, plan, etc.) | Already framework'd as the Initiative Board (section 15) led by Erez | `[BOARD]` enrich Erez's deliverables when the board spins up |
| 10 | Pipe WhatsApp/Telegram into a DB for durable context without re-reading everything; MCP or vector? | Both: a store + retrieval (RAG). See note below | `[DESIGN]` approach now; `[QUEUE]` build with the Telegram bridge |
| 11 | WhatsApp transcript of similar projects -- compare to ours | Worth a proper read | `[REVIEW]` I analyze and bring a comparison |
| 12 | New "listener/scout" agent: sit in meetings/calls/groups, capture, filter, spawn tasks; feed a summarizer | Text channels feasible; live video/voice harder; consent/ToS via Eyal | `[QUEUE]` researched proposal, P2/P3 |
| + | Gemini free + which tasks fit | You have it; "unlimited free" is a myth (tiered limits). Good for research/second-opinion on non-sensitive data | `[DESIGN]` slot Gemini for non-customer-data research/second-opinion |
| + | Rambo verifies reliability of every external source/connection | Folds into the security baseline | `[SCAFFOLD]` part of item 5 |
| + | Library of approved external sources; pin versions; no auto-latest | Matches AI-tips; Legal owns the tool/source register (section 6) | `[SCAFFOLD]` source/tool register + version pinning |

## From `AI Tips.txt` (security best practices)

| Idea | My take | Proposed disposition |
|------|---------|----------------------|
| Scope MCP permissions (allow/deny per server); pin MCP versions, never `latest` | Directly actionable; high value | `[SCAFFOLD]` into `.claude/settings.json` + tool register |
| Claude Code `allowedDirectories` / `allowedTools` / `denyTools` | Least-privilege at the tool layer | `[SCAFFOLD]` |
| `CLAUDE.md` deny-list (secrets, destructive cmds, network, CI/CD) | The exact secrets/destructive guardrails we want | `[SCAFFOLD]` create project `CLAUDE.md` |
| Scan downloaded repos for suspicious `.claude/`, `CLAUDE.md`, `.cursorrules` before running | You already have a `temp-repo-scan` folder -- formalize it as Rambo's intake | `[SCAFFOLD]` policy; `[QUEUE]` Rambo executes |

## From the Automation Flow slides (benchmark / inspiration only)

| Observation | Possible borrow | Proposed disposition |
|-------------|-----------------|----------------------|
| Per-agent knowledge files ("Best Practice", "Brand Context", "Humanizer") | A writing-style/"humanizer" guide for Hila; knowledge slices per agent | `[QUEUE]` enrich role files |
| AI-CFO with dashboards + receipts OCR + invoicing integration (GreenInvoice = Israeli invoicing) | Concrete lead for Lital + the Eyal/Lital compliance backlog (Israeli tax-compliant invoicing) | `[QUEUE]` CFO tooling, tie to compliance backlog |
| Multi-agent proposal pipeline -> docx to Google Drive; "asks instead of guessing" | Matches our section 16; pattern for a future Sales proposal flow | `[QUEUE]` Sales-group design, later |

---

## Storage recommendations (for items 8 and 10)

- **Item 8 (inter-agent task log):** start as append-only **JSONL** (one line per event: `task_id, agent, action, target, ts`) -- trivial, greppable by `task_id`, zero infra, fits budget 0. Move to **local SQLite** (free, single file, stays on-machine, no data-out) once Assaf needs real filtering/aggregation across a large, growing log. A local dashboard (jecki-only) reads it and colors text per agent. Avoid a hosted DB early (data-out + cost).
- **Item 10 (durable chat context):** it's a **store + retrieval** problem. Persist messages to a DB (local SQLite, or Supabase if you want managed later), then add **embeddings + a vector index** so agents fetch only the relevant slice instead of re-reading everything (token-efficient). Agents reach it through an **MCP/tool** interface. Start simple (store + recency/keyword), add vector search when volume warrants. Customer/personal data stays under the privacy rules and the no-third-party-model rule.
