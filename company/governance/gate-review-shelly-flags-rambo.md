# Gate Review: Shelly Standalone Repo -- Cross-Project Security Flags
Reviewer: Rambo (Security)
Date: 2026-06-21
Tasked by: Eco (CEO)
Scope: 3 flags routed from Shelly T-0028 (GR-008, GR-004, GR-009). Shelly standalone repo has no
resident Rambo; findings route back to Shelly repo gate-register via Eco.
Basis: WebFetch read-only scan. No code executed. No repos cloned.

---

## GR-008 -- Sefaria MCP (BLOCKED)

### Background
Prior pinned install: `git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986`
That SHA returned 404 in the Shelly session. Gate-register (eco-synthetic) row recorded SHA b8ceef7.

### Research

**Sivan22/mcp-sefaria-server status:**
- Repo still resolves at github.com/Sivan22/mcp-sefaria-server (33 stars).
- Last updated Jun 17, 2025 (12 months ago -- effectively unmaintained).
- 29 commits on main. Specific SHA b8ceef7 is not resolvable (deleted or force-pushed history).
- No releases or tags published on this repo (confirmed at original review and now).
- Log file (`sefaria_jewish_library.log`) present in repo -- server writes locally.
- Tools accept `image_url` user parameter and download arbitrary URLs (get_manuscript_image).
  This is a SSRF / arbitrary-fetch vector: user-supplied URL passed to backend without
  confirmed sanitization.

**Alternative -- Sefaria/sefaria-mcp (official Sefaria org repo):**
- URL: github.com/Sefaria/sefaria-mcp
- 32 releases. Latest: v1.7.1 (2026-02-19).
- Pinnable tag + commit: v1.7.1 @ `6e4ad7489a42c9f0b8d75aeee7d93493d02c427c` (verified; signed by GitHub).
- FastMCP + FastAPI + Prometheus. Python. MIT license (unconfirmed -- Eyal to verify before adopt).
- Network: sefaria.org API only per README. Also exposes SSE endpoint + metrics port (configurable;
  server-mode, not stdio -- see deployment note below).
- No .claude/, CLAUDE.md, .cursorrules found (WebFetch scan; cannot guarantee -- full repo scan
  pending if adopted; confirm before install).
- OAuth metadata declared with `"authorization_servers": []` -- no auth enforcement in v1.7.1.
- Injection surface: same class as Sivan22 (user-supplied references and queries to Sefaria API;
  manuscript image tool fetches arbitrary image_url). Surface is lower than Sivan22 because active
  maintenance means fixes are more likely; still requires prompt-injection guard at bridge layer.
- Deployment: ships a Dockerfile and SSE transport. This is a server-mode MCP, not stdio.
  For Shelly (CLI, stdio), this is an architectural mismatch -- additional config required.
  A stdio-compatible install path must be confirmed before adopting.
- Content license: Sefaria text library is CC-BY-NC. Original condition (Shelly shortlist 2026-06-18
  C: CC-BY-NC = owner personal use + attribution) carries forward.

### Verdict: BLOCKED on Sivan22 (SHA unresolvable). CONDITIONAL-CANDIDATE on Sefaria/sefaria-mcp.

**Findings:**

F1. The previously pinned SHA (b8ceef7 on Sivan22) is not resolvable. The Sivan22 repo is
    ~12 months unmaintained. Prior PARTIAL-CLEAR on Sivan22 is voided.

F2. get_manuscript_image tool accepts arbitrary user-supplied image_url -- SSRF/arbitrary-fetch
    vector. Present in both Sivan22 and (likely) Sefaria/sefaria-mcp.

F3. Sefaria/sefaria-mcp is server-mode (SSE/HTTP). Shelly uses stdio CLI. Architectural
    mismatch -- install path for stdio must be confirmed before adoption.

F4. License for Sefaria/sefaria-mcp server code unconfirmed. Eyal must verify before adopt.
    Sefaria text content remains CC-BY-NC regardless (personal/orientation use only).

F5. No .claude/CLAUDE.md/.cursorrules identified in top-level scan. Full repo scan required
    if adoption proceeds (Rambo standard: cannot guarantee clean without reading all dirs).

**Recommendation:**
Shelve Sivan22 permanently (SHA gone, unmaintained). If Sefaria access is still needed,
Sefaria/sefaria-mcp v1.7.1 is the candidate -- but requires: (a) Eyal license confirm;
(b) stdio compatibility confirm; (c) full Rambo repo scan before install; (d) image_url
SSRF mitigation (deny-list write tool or bridge-layer URL filter); (e) re-gate as new tool
(not a continuation of the Sivan22 partial-clear). Until those 5 conditions are met, Sefaria
stays SHELVED in Shelly repo. Do not install Sefaria/sefaria-mcp before conditions close.

**Pin (if adopted after conditions close):**
`git+https://github.com/Sefaria/sefaria-mcp@6e4ad7489a42c9f0b8d75aeee7d93493d02c427c`
(tag v1.7.1; verified signed commit 2026-02-19)

---

## GR-004 -- israeli-linkedin-strategy skill (TAG DISCREPANCY)

### Background
Gate-register (eco-synthetic) records install string:
`skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy`
Shelly T-0028 flagged this for tag verification.

### Research

**GitHub releases on skills-il/marketing-growth (all 3 pages fetched):**
No tag `v1.1.0-israeli-linkedin-strategy` exists on GitHub.

Actual tag found: `v1.0.2-israeli-linkedin-strategy`
- Commit: `da2a48ebb24a0d0206bda9479e60a0ea57211b5d`
- Date: 2026-04-20 02:30 UTC (created by github-actions)
- 15 commits to master since this tag (repo has continued activity).

**metadata.json for the skill directory (master branch):**
- `"version": "1.1.0"` -- this is the INTERNAL content version declared in metadata, not a git tag.
- Slug: `israeli-linkedin-strategy` (confirmed correct).
- Display name: "Israeli LinkedIn Strategy" / "אסטרטגיית לינקדאין ישראלית".
- Author: skills-il.

**Discrepancy explanation:**
The gate-register install string `@v1.1.0-israeli-linkedin-strategy` does not exist as a git tag.
It appears the install string was constructed from the internal metadata version (1.1.0) rather
than the actual git tag (v1.0.2). This means any install attempt using the gate-register string
will fail or fall back to an unpinned/floating resolution.

### Verdict: TAG MISMATCH -- gate-register install string is incorrect.

**Findings:**

F1. Tag `v1.1.0-israeli-linkedin-strategy` does not exist on GitHub (searched all 3 release pages).
    The recorded install string is uninstallable as written.

F2. Correct tag is `v1.0.2-israeli-linkedin-strategy` @ `da2a48ebb24a0d0206bda9479e60a0ea57211b5d`.

F3. Internal metadata.json declares version `1.1.0` -- this is content versioning, not the git tag.
    The mismatch between content version and git tag created the incorrect install string.

F4. 15 commits on master since v1.0.2. No newer tag for this skill exists. If a v1.1.0 tag ships
    later, it requires Rambo advance approval + fresh content scan before install.

F5. Slug `israeli-linkedin-strategy` is correct (confirmed in metadata.json and directory name).

**Recommendation:**
Correct the install string in Shelly repo gate-register to:
`skills-il/marketing-growth@v1.0.2-israeli-linkedin-strategy`
Full corrected install command:
`CI=true npx skills-il@1.10.0 add skills-il/marketing-growth@v1.0.2-israeli-linkedin-strategy --skill israeli-linkedin-strategy -a claude-code`
Eco should flag the eco-synthetic gate-register row for the same correction (row references
v1.1.0-israeli-linkedin-strategy in both the Shelly shortlist section and the adopted-Shelly
batch section). No new content scan required (original CLEAR stands; skill content at v1.0.2
is the same file type; confirm tag resolves cleanly at install). No Eyal re-review needed
(terms and license unchanged).

---

## GR-009 -- google_workspace MCP (SECURITY ASPECT)

### Background
Shelly repo uses a "google_workspace" MCP pinned ==1.21.3 with `--single-user` transport.
Eco asked: identify package/source, Google scopes, read-only vs write, injection/egress surface,
and delta from eco-synthetic's original read-only connectors (adopted 2026-06-12, A1).

### Research

**Package identification:**
This is `taylorwilsdon/google_workspace_mcp` (GitHub), installable via pip as a Python package.
PyPI package name `google-workspace-mcp` (Arclio) does NOT have a version 1.21.3 -- Arclio's
versions top out at 2.0.4. The version 1.21.3 maps to the `taylorwilsdon` repo releases.

Confirmed: taylorwilsdon/google_workspace_mcp has:
- v1.21.3 released 2026-06-17, commit `f974a12`, labeled "Small security update & bugfix".
- This is the same repo already reviewed in eco-synthetic gate-register (2026-06-18 row, entry
  "taylorwilsdon/google_workspace_mcp", CLEARED-WITH-CONDITIONS, Eyal PENDING).
- The v1.21.3 pin is a newer version than was in scope at the 2026-06-18 eco-synthetic review.

**--single-user transport:**
Confirmed in repo README: `uv run main.py --single-user` provides simplified authentication.
README explicitly notes: single-user mode cannot be used with OAuth 2.1 mode. It bypasses the
full OAuth 2.1 flow and uses simplified credentials. This reduces OAuth complexity but eliminates
the OAuth 2.1 PKCE protections; credentials stored at `~/.google_workspace_mcp/credentials/`
(permissions 0o600 per prior eco-synthetic review).

**Google API scopes:**
Covers 10+ Google Workspace services including Gmail, Drive, Calendar, Docs, Sheets, Slides,
Forms, Tasks, Contacts, and Chat. Services are configured via granular scope groups.
Examples: `gmail.readonly`, `gmail.send`, `drive.readonly`, `calendar.readonly`, and write
equivalents. Read-only mode is configurable but NOT default -- write tools are available
unless explicitly denied.

**Write capabilities:**
Full write surface: send email (gmail.send), create/update/delete Drive files and permissions,
create/update Calendar events, create/update Docs/Sheets/Slides/Forms, manage Tasks,
update Contacts, send Chat messages. This is a broad write blast radius across all Google
services.

**Injection / egress surface:**
- Repo README explicitly warns: "emails, events and files could potentially contain prompt
  injections" and flags "indirect prompt injection risks where malicious instructions in
  content might coerce exfiltration of local files."
- Any tool that reads Gmail, Drive, or Calendar content and acts on it (e.g., reply, create)
  is a prompt-injection-to-write-action pipeline. HIGH risk.
- Network egress: Google APIs only (googleapis.com). No other external egress identified.
- Python deps use `>=` (not pinned) in upstream repo. Supply chain drift risk. Must verify
  uv.lock is present and locked in the Shelly install.

**Delta from eco-synthetic read-only connectors:**
- Eco-synthetic adopted Google Drive MCP + Google Calendar MCP in READ-ONLY mode (A1, gate
  bypassed 2026-06-12). These are separate connectors (nspady/google-calendar-mcp +
  taylorwilsdon in PENDING-Eyal state) and are scoped with write tools deny-listed.
- taylorwilsdon/google_workspace_mcp was CLEARED-WITH-CONDITIONS in eco-synthetic (2026-06-18)
  with a hard condition: deny-list all write/send/delete tools in settings.json before go-live.
  Eyal review was PENDING. That review has not been confirmed closed.
- Shelly's `--single-user` usage is a NARROWER auth config (single user, no OAuth 2.1) but
  does NOT reduce the write blast radius unless write tools are also deny-listed.
- v1.21.3 is newer than what was reviewed in eco-synthetic (no specific version was pinned
  in the eco-synthetic gate row). The June 17 "small security update" is unreviewed.
- SCOPE DELTA: Shelly's pin covers Gmail, Drive, Calendar, Docs, Sheets, Slides, Forms,
  Tasks, Contacts, Chat -- significantly broader than eco-synthetic's Drive + Calendar only.

### Verdict: FLAG -- conditions not met; do not go live as-is.

**Findings:**

F1. Write blast radius is HIGH. All Google Workspace write operations are available unless
    explicitly deny-listed in Shelly repo's mcp.json/settings.json. Must verify write tools
    are deny-listed before go-live. (Same condition as eco-synthetic C1.)

F2. Indirect prompt injection -> write-action pipeline is HIGH risk. Email/file content can
    carry adversarial instructions that trigger send/create/delete via the MCP tools. No
    sanitization layer visible at the MCP level.

F3. v1.21.3 is an unreviewed version. The eco-synthetic CLEARED-WITH-CONDITIONS row was for
    the repo, not a specific version. A "security update" on 2026-06-17 should be examined
    before go-live (could fix or introduce behavior). Full diff review recommended.

F4. Single-user mode bypasses OAuth 2.1. This is a reduced-security auth path. Acceptable
    for personal-use (Shelly = owner personal assistant) but must be documented as a known
    condition, not an oversight.

F5. Scope of Shelly's usage (all 10 services) is broader than eco-synthetic's original
    connectors (Drive + Calendar only). Gmail in particular adds a high-risk write surface
    (send_email). Confirm which services Shelly actually needs; scope-limit at adoption.

F6. Eyal legal review for taylorwilsdon/google_workspace_mcp is PENDING in eco-synthetic.
    That review must be completed (or Shelly repo must run its own Eyal review) before
    go-live. MIT license expected but not confirmed by Eyal.

F7. Python dep pinning: must verify uv.lock is present and locked at install (supply chain).

**Recommendation:**
Do not go live until: (C1) deny-list all write/send/delete tools in Shelly mcp.json for
every service not needed in Phase 1; (C2) confirm which of the 10 services are actually in
scope for Shelly -- restrict to that list; (C3) Eyal legal review complete (MIT confirm +
terms); (C4) v1.21.3 security-update diff reviewed by Rambo (WebFetch or read-only; flag
if behavior changes); (C5) document --single-user auth path as accepted condition (owner A1
acknowledgment); (C6) verify uv.lock present and locked at install.
Interim: block go-live. Flag to Eco for Shelly repo decision.
Permanent: write-deny-list in settings + scope-limit services + OAuth 2.1 when Shelly moves
to multi-user or customer context (not applicable in P1).

---

## Summary table

| Flag | Verdict | Pinned ref (if applicable) | Action required |
|------|---------|---------------------------|-----------------|
| GR-008 Sefaria MCP (Sivan22) | BLOCKED (SHA unresolvable; repo unmaintained) | None -- shelve Sivan22 | Shelve; candidate: Sefaria/sefaria-mcp@v1.7.1@6e4ad748 after 5 conditions close |
| GR-008 Sefaria/sefaria-mcp | CONDITIONAL-CANDIDATE (not cleared) | v1.7.1 @ 6e4ad7489a42c9f0b8d75aeee7d93493d02c427c | Eyal license, stdio confirm, full repo scan, SSRF mitigation, re-gate |
| GR-004 LinkedIn skill | TAG MISMATCH (install string wrong) | v1.0.2-israeli-linkedin-strategy @ da2a48ebb24a0d0206bda9479e60a0ea57211b5d | Correct to v1.0.2 tag; eco-synthetic gate-register needs same correction |
| GR-009 google_workspace MCP | FLAG -- do not go live as-is | v1.21.3 @ f974a12 (pin confirmed) | 6 conditions (C1-C6) must close; Eyal review; write-deny-list mandatory |

---

## Routing note

Findings route to Shelly repo via Eco. Eco-synthetic gate-register row for israeli-linkedin-strategy
also needs the tag corrected (same discrepancy). Eyal review for taylorwilsdon MCP is shared
workload -- once Eyal clears it for eco-synthetic, that clearing should be noted in Shelly repo
gate-register too (same repo, same MIT license).
