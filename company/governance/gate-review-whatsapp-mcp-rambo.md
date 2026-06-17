# Gate Review: WhatsApp MCP (@lharries)
# Rambo (Security) | 2026-06-17 | Tasked by: Eco (CEO)

Verdict: PARTIAL-CLEAR -- 9 conditions required before A1 grant.
Gate level: A1 (owner sign-off required).

---

## Files / sources read for this review

- https://github.com/lharries/whatsapp-mcp (repo root, directory listing)
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/README.md
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-bridge/main.go
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-bridge/go.mod
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-mcp-server/main.py
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-mcp-server/whatsapp.py
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-mcp-server/audio.py
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/whatsapp-mcp-server/pyproject.toml
- https://raw.githubusercontent.com/lharries/whatsapp-mcp/main/.gitignore
- company/governance/gate-register.md
- company/governance/security-baseline.md
- company/governance/gate-review-agent-tool-eco-rambo.md (format reference)
- memory/board.md

Read-only review only. Nothing cloned, downloaded, or executed.

---

## Why A1, not A2

Constitution §3 + §6: borderline -> A1.

Three reasons this is A1, not routine A2:

1. Unofficial API. whatsmeow is not sanctioned by Meta/WhatsApp. Account-ban risk is real and
   the README acknowledges it. The owner has accepted this risk (secondary number, low volume).
   That acceptance is an owner-level judgment call that must be documented explicitly.

2. Write capability over a personal messaging platform. send_message, send_file, send_audio_message
   expose our agents to send arbitrary content on behalf of the account holder. Blast radius
   from a compromised agent session is high.

3. Lethal-trifecta risk acknowledged in the README itself. The repo author flags prompt injection
   -> private data exfiltration as an explicit known risk. Adopting this tool means accepting
   that risk category. That is an A1 decision.

Eyal (Legal) review is also required before grant: ToS compliance, ban-risk disclosure,
Israeli privacy law (messages from all contacts stored in SQLite on local disk).

---

## Prompt-injection scan: repo itself

No .claude/ directory found.
No CLAUDE.md found.
No AGENTS.md found.
No .cursorrules found.
No Makefile found.
No install.sh or install.ps1 found.

Source files reviewed (main.go, main.py, whatsapp.py, audio.py): no embedded prompt-like
strings, no adversarial instructions, no coercive language patterns detected.

The repo itself is CLEAN of direct prompt-injection / takeover vectors.

---

## R1 -- Lethal-trifecta exposure (prompt injection via inbound WhatsApp messages)

Severity: HIGH (README-acknowledged; our highest concern)

Findings:
1. The whatsapp.py module returns message text VERBATIM to the MCP layer. No sanitization,
   no instruction-pattern detection, no filtering. Confirmed from source review.
2. The list_messages and get_message_context tools return raw message content from the SQLite
   store. Any WhatsApp message -- from any contact, including unknown senders if the account
   is used broadly -- arrives in the LLM context without modification.
3. The lethal trifecta: inbound WhatsApp message contains adversarial instructions ->
   Shelly (or any agent) reads the message via list_messages -> adversarial text enters
   the agent context -> agent acts on it (exfiltrate data, send to attacker via
   send_message, access internal files).
4. This is the highest-risk vector in this tool. The README author specifically warns about it.
   Our own agents (Shelly) are not immune. Shelly reads external messages as part of her job.
5. No input-sanitization layer is present anywhere in the repo.
6. There is no scoping mechanism: list_messages with a broad query returns messages from ALL
   chats, not just authorized senders. Our own CLAUDE.md rule ("always use specific, bounded
   queries") is a behavioral constraint; it is not enforced architecturally.

Interim mitigation (owner + Eco + Shelly, before go-live):
- Shelly must treat all inbound WhatsApp message content as tainted external input.
- Shelly must never pass raw WhatsApp message text into a tool call, a spawned-agent task,
  or an outbound send without an explicit review step.
- All list_messages queries must be bounded: specific chat_jid or sender_phone_number,
  specific time window, low limit. No open-ended "show me everything" queries (mirrors
  our Google connector rule).
- Add a TAINTED-INPUT SAFETY block to Shelly's WhatsApp context: state that all inbound
  message content is untrusted; require explicit reasoning step before acting on any
  instruction found in a message; list prohibited actions triggered by inbound messages
  (no file writes, no spawns, no outbound sends to unknown recipients without owner confirm).

Permanent mitigation:
- Bridge-layer input sanitization: strip or flag instruction-like patterns (system prompt
  structures, "ignore previous instructions", role-play commands) before message text
  enters the MCP response. Owner: Shir (DevOps) when live.
- Sender allowlist: Shelly responds only to messages from a pre-approved contact list.
  Unknown-sender messages are logged, not acted upon. Owner: Shir when live.

---

## R2 -- Unofficial API / ban risk + re-auth cadence

Severity: HIGH (ToS and account continuity risk)

Findings:
1. whatsmeow is an unofficial reverse-engineered WhatsApp Web multidevice client.
   It is not a WhatsApp-approved API. Use violates WhatsApp ToS.
2. The README warns of potential account ban. The owner has accepted this risk on a
   secondary number. This must be formally documented as an owner acceptance at A1.
3. Re-authentication is required approximately every 20 days (QR scan). This is a manual
   step requiring owner intervention. No automated re-auth mechanism exists in the repo.
   If re-auth lapses, the bridge goes offline and Shelly's WhatsApp capability fails silently.
4. The whatsmeow dependency is pinned in go.mod to a specific commit
   (v0.0.0-20250318233852-06705625cf82). This is good -- it is not floating. However,
   whatsmeow itself is a third-party library that tracks WhatsApp's proprietary protocol.
   Protocol changes by WhatsApp can break the bridge with no notice.
5. The last repo commit was 2025-07-13 (README update only). The bridge Go source has
   not been updated since at least March-April 2025 based on commit history. Maintenance
   activity is low. If WhatsApp changes its protocol, this repo may not be updated.

Interim mitigation:
- Use secondary number only (owner already decided).
- Document owner A1 formal acceptance of ban risk.
- Set a 15-day re-auth reminder (before the 20-day window expires). Owner: jecki/Shelly.
- Monitor whatsmeow issue tracker for protocol-break warnings.

Permanent mitigation:
- Evaluate transition to WhatsApp Cloud API (official, in gate-register as deferred)
  when business-verification and per-conversation cost becomes acceptable. Owner: Shelly.

---

## R3 -- Data egress: raw message storage in SQLite + what reaches the LLM

Severity: HIGH (Israeli privacy law + our own CLAUDE.md rules)

Findings:
1. The Go bridge stores ALL messages from ALL chats in a local SQLite database
   (whatsapp-bridge/store/messages.db). This includes: message text, sender JID, chat JID,
   timestamps, media metadata (type, filename, URL, encryption keys, SHA256 hashes, size).
2. Media files are downloaded and cached locally in store/[chat_id]/ directories.
3. This means private correspondence from all contacts on the secondary number is stored
   on the local laptop disk in plaintext (SQLite, no encryption at rest confirmed from
   source review -- go-sqlite3 default is unencrypted).
4. The MCP tools return this data to the LLM on demand. list_messages with no filters
   returns raw message text verbatim. This is a data-egress path from private
   correspondence to the LLM context.
5. Our own CLAUDE.md privacy rule: "NEVER store raw email content or calendar details in
   tracked files -- ingest summaries only, not verbatim personal correspondence."
   This rule was written for Google connectors but the principle applies here.
   WhatsApp messages are personal correspondence. Raw message text must not be stored
   in tracked files or passed to the LLM without a summary/filter step.
6. Israeli privacy law (Protection of Privacy Law 5741-1981): storing personal
   correspondence from third parties (contacts) on a local database constitutes
   processing of personal information. Eyal must assess whether this requires a
   privacy notice to contacts or any other compliance action.
7. .gitignore covers *.db (good -- the SQLite file will not be committed). Confirmed.

Interim mitigation:
- Restrict which chats/contacts the bridge indexes. If whatsmeow allows selective sync,
  limit to specific contacts. Cannot confirm from source review whether this is supported.
  If not supported, document as a known gap.
- Shelly must only query messages from specific, bounded chat_jid or sender targets.
  No broad message dumps into LLM context.
- Media download (download_media tool): require explicit owner confirmation before any
  media file is downloaded. Do not auto-download.
- Raw message text must not be written to any tracked company file. Summaries only.

Permanent mitigation:
- Encryption at rest for the SQLite store (SQLCipher or equivalent). Owner: Shir when live.
- Selective-sync config if whatsmeow supports it. Owner: Shir to evaluate on build.
- Eyal legal review of storage and processing obligations under Israeli privacy law.

---

## R4 -- Write capability blast radius (send_message, send_file, send_audio_message)

Severity: HIGH

Findings:
1. The MCP exposes three write tools: send_message, send_file, send_audio_message.
2. send_message accepts a recipient (phone number or JID) and arbitrary message text.
   No recipient allowlist. No confirmation step in the tool itself.
3. send_file accepts a recipient and a media_path (local file path). This means an agent
   with access to local files could send any file from the local filesystem to any
   WhatsApp number.
4. send_audio_message: same pattern; uses audio.py which invokes FFmpeg via subprocess.
5. A compromised agent session (R1 injection or otherwise) could use these tools to:
   - Exfiltrate internal company files to an external number.
   - Impersonate the owner's number to contacts.
   - Spam or harass contacts.
6. No confirmation, rate-limiting, or allowlist is implemented in the repo.
7. media_path in send_file is a local path string. If an agent can be prompted to send
   an arbitrary local path, sensitive files (e.g., .env, company governance files) could
   be exfiltrated over WhatsApp.

Interim mitigation:
- Add a recipient allowlist to Shelly's WhatsApp context block: Shelly may only send
  to a pre-approved list of numbers/JIDs. Sending to any other recipient requires
  explicit owner confirmation in-session.
- Add a file-send prohibition: Shelly must not use send_file without explicit owner
  A1 confirmation naming the specific file and recipient in-session.
- Add a send-rate limit (behavioral): no more than N messages per session without
  owner re-confirmation. Owner: jecki decides N.

Permanent mitigation:
- Bridge-layer recipient allowlist enforcement (not just behavioral). Owner: Shir.
- Remove send_file from Shelly's allowed MCP tool set entirely, or gate it behind
  a separate bridge confirmation step. Owner: Shir.
- settings.json: if MCP tool-level allow/deny is supported, deny send_file for Shelly.
  Confirm whether Claude Code settings.json supports per-MCP-tool deny. Cannot confirm
  from current file review.

---

## R5 -- Dependency version pinning + supply chain

Severity: MEDIUM

Findings:
1. Go bridge: whatsmeow pinned to a specific commit hash (go.mod). Good.
   go-sqlite3 pinned to v1.14.24. golang.org/x/crypto pinned to v0.36.0. All others pinned.
   Go side is well-pinned.
2. Python MCP server: pyproject.toml specifies minimum versions only (>=), not exact pins.
   httpx >= 0.28.1, mcp[cli] >= 1.6.0, requests >= 2.32.3.
   However, uv.lock exists in the repo. If installation uses `uv sync` with the lockfile,
   exact versions are pinned via the lockfile. If installation uses `pip install` without
   the lockfile, versions float.
3. Installation instructions in README say to run the bridge with `go run main.go` and
   configure the MCP server path. No explicit `uv sync` instruction was visible in the
   README summary. Cannot confirm whether the install flow uses the lockfile.
4. The uv.lock file was not fetched and reviewed (its contents are not critical for this
   review given the lockfile exists; the key risk is whether it is used).

Interim mitigation:
- Manual install only: follow README steps manually, reviewed by owner.
- Use `uv sync` (not `uv run` with auto-install) so the lockfile is respected.
- Document the exact Go bridge commit used at install time.

Permanent mitigation:
- Pin all Python dependencies to exact versions in pyproject.toml as well as uv.lock.
  Owner: Shir on build.
- Periodic dependency audit (monthly or on each whatsmeow protocol-change advisory).

---

## R6 -- Install process (no install scripts; manual install required)

Severity: LOW-MEDIUM

Findings:
1. No install.sh, install.ps1, or Makefile found. The install is entirely manual:
   clone repo, run Go bridge, configure MCP path in Claude Desktop config.
2. Manual install reduces the risk of a malicious install script running automatically.
   This is better than an automated installer.
3. The install requires CGO_ENABLED=1 on Windows and an MSYS2 C compiler. This is a
   non-trivial setup. The C compiler requirement means native code is being compiled
   locally (go-sqlite3 uses CGO). Cannot audit the compiled binary from this review.
4. No automated persistence (no launchd, no systemd, no Windows service registration
   detected in the repo). The bridge runs in a terminal window and stops when closed.
   This is consistent with our current bridge posture (security-baseline.md item 1).

Mitigation:
- Owner performs manual install following README, not any third-party guide.
- Install in a dedicated directory outside the eco-synthetic repo (no overlap with
  tracked files).
- Bridge process is not registered as a Windows service without explicit A1.

---

## R7 -- Local SQLite store path + git hygiene

Severity: LOW

Findings:
1. .gitignore at repo root covers *.db. The SQLite message store will not be committed.
2. Media files stored in store/[chat_id]/ are NOT explicitly gitignored (only *.db is
   listed). If the bridge repo is ever initialized as a git repo, media files could be
   committed.
3. The whatsapp.log file is gitignored. Good.
4. The store/ directory itself is not gitignored -- only the .db files inside it.

Mitigation:
- Add store/ to .gitignore (or confirm the bridge directory is never a tracked git repo).
  Owner: jecki at install time.
- Never initialize a git repo inside the whatsapp-bridge directory.

---

## Cross-check: our own rules

| Rule | Status |
|------|--------|
| CLAUDE.md: never store raw correspondence in tracked files | REQUIRES CONDITION -- raw messages in SQLite; must not copy to tracked files. Add to Shelly context. |
| CLAUDE.md: bounded queries only | REQUIRES CONDITION -- no architectural enforcement; behavioral rule for Shelly. |
| CLAUDE.md: never send personal correspondence to summarization model without A1 + privacy review | REQUIRES CONDITION -- Eyal must assess. |
| CLAUDE.md: secrets in .env only | OK -- bridge uses QR auth (no API key); no secret to manage beyond the SQLite store. |
| gate-register.md: every tool registered before use | REQUIRES CONDITION -- gate-register row needed before go-live. |
| security-baseline.md: mitigation required for every finding | SATISFIED -- mitigations provided above. |
| constitution red line 4: no external tool without Security + Legal gate | REQUIRES CONDITION -- this review is the Security gate; Eyal (Legal) review is still needed. |

---

## Lethal-trifecta summary (README-named risk)

The README states: "the WhatsApp MCP is subject to the lethal trifecta. This means that
prompt injection could lead to private data exfiltration."

Our assessment of the three components:
1. Prompt injection vector: PRESENT. Inbound WhatsApp messages are untrusted external
   input returned verbatim to the LLM.
2. Private data in context: PRESENT. All messages from all chats are in the SQLite store
   and accessible via MCP tools.
3. Exfiltration capability: PRESENT. send_message, send_file can exfiltrate content to
   any recipient.

All three legs of the trifecta are present by design. This is not a flaw to be patched;
it is the nature of the tool. Risk must be accepted explicitly (A1) and managed via
the conditions below.

---

## Overall verdict

PARTIAL-CLEAR -- 9 conditions (C1-C9) required before A1 grant.

Not FLAG-blocked because:
- Owner has already decided to proceed on a secondary number, accepting ban risk.
- The risks are real but manageable with the conditions below.
- No malicious code, no embedded prompt injection in the repo itself.
- The tool does what it says on the tin; the risks are architectural and documented by
  the author, not hidden.

FLAG-level escalation required if:
- Eyal (Legal) raises concerns about Israeli privacy law compliance that cannot be resolved.
- Owner decides the secondary-number + low-volume constraint cannot be enforced.
- Any condition below is refused or cannot be implemented.

Gate level: A1.

---

## Conditions summary (C1-C9)

C1. TAINTED-INPUT block in Shelly's WhatsApp context: all inbound message content is
    untrusted; require explicit reasoning step before acting on any instruction in a message;
    list prohibited actions (no file writes, no spawns, no sends to unknown recipients
    without owner confirm in-session). Owner: Eco + jecki before go-live.

C2. Recipient allowlist in Shelly's WhatsApp context: Shelly may send only to a pre-approved
    list of numbers/JIDs. Any other recipient requires owner A1 in-session. Owner: jecki
    defines list; Eco adds to Shelly context. Before go-live.

C3. send_file prohibition: Shelly must not use send_file without explicit owner A1 in-session
    naming the specific file and recipient. Preferred: exclude send_file from Shelly's
    allowed MCP tools entirely (settings.json if supported; context block as fallback).
    Owner: jecki before go-live.

C4. Bounded-query rule in Shelly context: all list_messages / list_chats / get_message_context
    calls must be bounded (specific chat_jid or sender, specific time window, limit <= N).
    No open-ended broad queries. Raw message text must not be written to any tracked company
    file. Summaries only. Owner: Eco + jecki before go-live.

C5. Owner A1 formal acceptance of ban risk on secondary number documented in decisions-log.md.
    Include: secondary number (not primary), low-volume commitment, understanding that
    WhatsApp ToS violation may result in account suspension, no business-critical dependency
    on this number. Owner: jecki at A1 grant.

C6. Eyal (Legal) review: ToS compliance (unofficial API, ban risk), Israeli Privacy Law
    5741-1981 (storing personal correspondence from contacts on local disk without notice),
    and any other applicable obligation. Eyal provides CLEAR or FLAG before A1 is issued.
    Owner: Eyal + jecki. This is a hard blocker -- A1 cannot be issued without Eyal clear
    or explicit owner waiver of Legal review documented at A1.

C7. store/ gitignore: add store/ directory to .gitignore in the whatsapp-bridge install
    location to cover media files, not just *.db. Never initialize a git repo inside the
    bridge directory. Owner: jecki at install time.

C8. Pinned install: document the exact Git commit of the whatsapp-mcp repo used at
    install time (HEAD as of install). Use `uv sync` with the lockfile for the Python
    server. Do not use unversioned `uv run` auto-install. Owner: jecki at install time.

C9. gate-register.md row added before go-live. Rambo clears risk column (this review).
    Eyal clears terms column (C6). A1 grant documented. Owner: Eco adds row after
    all clears obtained.

Standing condition (inherits from T-0020 R1-CODE group): when Shir is live, implement
bridge-layer input sanitization and sender allowlist as permanent mitigation for R1.
This does not block go-live but must be tracked as a SHIR-002 task.

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|---------------|----------------|-----------------|------------------|
| R1 (lethal trifecta / prompt injection) | Eco + jecki | TAINTED-INPUT block in Shelly context (C1); bounded queries (C4) | Shir | Bridge-layer input sanitization + sender allowlist (SHIR-002) |
| R2 (ban risk / re-auth cadence) | jecki | Secondary number; A1 acceptance (C5); 15-day re-auth reminder | Shelly | Evaluate Cloud API transition (long-term) |
| R3 (raw message storage / privacy) | jecki | Bounded queries only (C4); no raw text to tracked files; Eyal review (C6) | Shir | Encryption at rest for SQLite store; selective sync if available |
| R4 (write blast radius) | Eco + jecki | Recipient allowlist in context (C2); send_file prohibition (C3) | Shir | Bridge-layer recipient allowlist enforcement; remove/gate send_file |
| R5 (dependency pinning) | jecki | uv sync with lockfile; document Go commit at install (C8) | Shir | Exact version pins in pyproject.toml; periodic dep audit |
| R6 (install process) | jecki | Manual install only; no service registration | Shir | N/A (manual install is acceptable) |
| R7 (git hygiene) | jecki | Add store/ to .gitignore at install (C7) | N/A | Permanent via gitignore |

---

## Draft gate-register.md row (conditional -- after A1 granted)

| whatsapp-mcp (@lharries, unofficial) | WhatsApp MCP bridge | free (MIT) | jecki (A1, [DATE]) | Secondary number only; low volume; ban risk accepted (A1). Conditions C1-C9 applied (gate-review-whatsapp-mcp-rambo.md, 2026-06-17). Eyal Legal clear [DATE]. SHIR-002 (bridge-layer sanitization + allowlist) tracks permanent R1/R4 mitigations. |

---

## Rambo sign-off

Rambo | Security | L3 | 2026-06-17
Finding delivered to Eco for relay to jecki (A1 decision) and Eyal (Legal gate, C6).
