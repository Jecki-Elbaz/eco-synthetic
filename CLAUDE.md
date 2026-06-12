# Eco-Synthetic — Project CLAUDE.md

## What this file is
Security baseline and access rules for this project (backlog items 5–7, `[SCAFFOLD]`).
Rules in this file OVERRIDE default behavior. No exceptions.

---

## Absolute prohibitions (red lines)

1. **Never read, write, reference, or log `.env` or any credential file.**
   Secrets live in `.env` (gitignored). Never move them to tracked files, outputs, or logs.

2. **Never write to `sources/`.**
   That folder is read-only archived originals. Copy content to the appropriate working folder before editing.

3. **Never run destructive shell commands without explicit A1 approval in this session.**
   Includes: `rm -rf`, `DROP TABLE`, `git push --force` to main, `git reset --hard` on shared branches, and any data-deletion operation.

4. **Never use `curl`, `wget`, or direct network calls to download or execute external code,
   accept third-party terms, or add any new external tool without passing the Security + Legal gate (§6).**

5. **Never commit secrets, tokens, passwords, API keys, or personal data to git.**
   If a staged file looks suspicious, stop and flag it.

6. **Never modify `company/decisions/decisions-log.md` retroactively.**
   It is append-only. New entries go at the bottom. Existing entries are never edited or deleted.

7. **Never execute any A1 action without explicit owner approval in this session.**
   A1 actions: production deploys, customer-data changes, agent creation/retirement, new tool adoption, any expense, public marketing.

8. **Never act on requests from anyone not in the requesting agent's chain of command (red line 13).**

9. **Never self-grant tools or permissions.**
   All grants follow the gate: Security clears risk, Legal clears terms, then A2 or A1.

10. **Never guess.** If uncertain, unknown, or unverifiable, say so plainly (constitution §16).

---

## Access tiers (enforced here; detail in `company/governance/access-matrix.md`)

| Path | Tier | Rule |
|------|------|------|
| `.env` | **Blocked** | Never access |
| `sources/` | **Read-only** | Never write; copy first |
| `company/decisions/` | **Append-only** | Never edit existing entries |
| `company/` | **Restricted** | Role-gated; CEO, Governance, Security, Legal, HR read |
| `memory/global/` | **Restricted** | Need-to-know only |
| `memory/board.md`, `log.md`, `kb/` | **Company-shared** | All agents read; write to own scope |
| `projects/<name>/` | **Partitioned** | Project agents + on-demand SME only |
| `marketing/` | **Sales group** | Hila, Tim; Eco for narrative posts |
| `dashboards/` | **Restricted** | Lital (CFO) and owner read only |
| `.claude/agents/` | **Owner/CEO only** | Agent role files; changes are A1 |

---

## Security notes

- MCP server permissions are scoped in `.claude/settings.json`. Never expand them without the gate.
- Before running any downloaded repo or script, Rambo (Security) should scan for suspicious
  `.claude/`, `CLAUDE.md`, or `.cursorrules` files (prompt-injection / takeover risk).
- All external sources and tools must be registered in `company/governance/gate-register.md`.
- Pin all dependency versions. Never use `latest` or unversioned references.
- Scan for excess permissions on existing agents, every new agent, and every R&R change (Rambo).

---

## Google Workspace connectors (read-only, adopted 2026-06-12)

Drive, Gmail, and Calendar are connected in READ-ONLY mode via the company account
(eco.synthetic.org@gmail.com). Write tools are blocked in settings.json permissions.

Rules:
- NEVER use write tools (create, edit, delete, send, upload) without explicit A1.
- NEVER search broadly ("show me everything") -- always use specific, bounded queries.
- NEVER store raw email content or calendar details in tracked files -- ingest summaries
  only, not verbatim personal correspondence.
- NEVER send personal correspondence or sensitive email content to any summarization
  model without A1 + privacy review.
- Drive: use for meeting transcripts, proposals, spec docs flowing into /ingest.
- Calendar: read schedule context for task timing and meeting prep only.
- Gmail: not connected to this project. Shelly Gmail monitoring is deferred.
