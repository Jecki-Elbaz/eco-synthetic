# Gate Review: caveman skill (JuliusBrussee) -- Security
# Rambo (Security) | 2026-06-17

Verdict: PARTIAL-CLEAR -- conditions required before A2 grant.
Gate level: A2 (free, MIT; no borderline escalation to A1 required on cost grounds; A1 not required unless owner chooses).

---

## Files / URLs reviewed for this review

- https://github.com/JuliusBrussee/caveman (README, repo structure)
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/bin/install.js (via WebFetch analysis)
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/CLAUDE.md
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/AGENTS.md (file exists; contains only @-references to SKILL.md paths, no behavioral instructions)
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/skills/caveman/SKILL.md
- https://raw.githubusercontent.com/JuliusBrussee/caveman/main/LICENSE
- https://github.com/JuliusBrussee/caveman/blob/main/.cursorrules (HTTP 404 -- does not exist)
- company/governance/gate-register.md (format reference)
- company/governance/gate-review-agent-tool-eco-rambo.md (style reference)

---

## R1 -- Official install vector is a red line 4 violation

Severity: HIGH (structural -- applies to the official install method only)

Findings:
1. The official install is `curl -fsSL .../install.sh | bash` (macOS/Linux) or
   `irm .../install.ps1 | iex` (Windows). CLAUDE.md (project) red line 4 explicitly
   prohibits curl/wget pipe-to-shell and download-and-execute of external code.
   The official install method CANNOT be used.
2. install.sh and install.ps1 are shims that call `npx -y "github:JuliusBrussee/caveman"`.
   This fetches and executes the caveman npm package from GitHub at runtime -- a second
   network-fetch-and-execute layer. Even from a local clone, this path is unsafe without
   pinning to a specific commit SHA.
3. bin/install.js (the actual installer) writes to ~/.claude/settings.json (patches hook
   entries), creates files in ~/.claude/hooks/ (JS and shell scripts), and may spawn
   external commands (claude plugin list, gemini extensions list, npx skills add)
   that contact remote registries. It also optionally fetches hook files from GitHub
   raw URLs during installation, verified against SHA-256 checksums pinned to a release
   tag (per the installer code), but only when a local clone is not present.
4. This means a pipe-to-shell install is doubly unsafe: (a) red line 4 violation,
   (b) writes hook scripts into the Claude Code runtime config dir, (c) spawns agent
   registry lookups.

Assessment: the official install path is BLOCKED under red line 4 and red line 9
(never self-grant tools or expand permissions without the gate). A safe install path
exists and is required (see Recommendation).

---

## R2 -- Writes hooks into ~/.claude/ (settings.json + hooks/ dir)

Severity: MEDIUM-HIGH

Findings:
1. bin/install.js patches ~/.claude/settings.json to add SessionStart and UserPromptSubmit
   hook entries pointing to caveman-activate.js and caveman-mode-tracker.js.
   This modifies the Claude Code runtime config, not just the project workspace.
   It is a system-level write, not a local project file placement.
2. Hook scripts placed in ~/.claude/hooks/ run on every Claude Code session start and
   every user prompt submission system-wide, not just when /caveman is invoked.
   The caveman-mode-tracker.js tracks whether caveman mode is active across prompts.
3. The SessionStart hook and UserPromptSubmit hook architecture is legitimate Claude Code
   hook infrastructure (not an exploit), but it means caveman mode state persists across
   all sessions and all projects -- not scoped to eco-synthetic.
4. Safe install alternative confirmed: the SKILL.md can be placed manually as a Claude
   Code skill file (in .claude/skills/ or equivalent) without running any install script.
   This avoids all hook writes and settings.json modification. The skill fires only when
   /caveman is explicitly invoked. This is the correct install path for this use case.
5. Backup file settings.json.bak is created on first install. Uninstall path is described
   as "clean" (marker-fenced); cannot verify this claim without running the installer.
   With manual file placement (C1 below), uninstall is trivially clean: delete the skill file.

Mitigation required:
C1. Do NOT run the installer (install.sh, install.ps1, bin/install.js, or any npx invocation).
    Install by manually copying skills/caveman/SKILL.md from a pinned commit into the
    project workspace only (.claude/skills/ or the designated eco-synthetic skill path).
    No settings.json modification. No hook installation.

---

## R3 -- Pin to specific commit SHA; no floating main

Severity: MEDIUM

Findings:
1. The proposed install references the repo at HEAD (main branch). The main branch has
   201 commits as of review date. No pinned commit SHA has been designated.
2. Any future commit to JuliusBrussee/caveman could alter the SKILL.md content --
   changing compression behavior, adding new instructions, or introducing injection patterns.
   Without a pinned SHA, the skill content is mutable post-adoption.
3. The skill content at the pinned commit reviewed here (2026-06-17) is clean (see R5).
   Pinning locks that content.

Mitigation required:
C2. Pin to a specific commit SHA at time of manual file copy. Record the commit SHA
    in gate-register.md and in the file header (comment). Any update requires a new
    Rambo repo scan before the updated file is used.

---

## R4 -- Human-facing output risk (scope control)

Severity: MEDIUM

Findings:
1. The SKILL.md activates on the trigger phrase "/caveman" or on auto-trigger when
   "token efficiency is requested." The auto-trigger condition is broad: it fires on
   vague phrases, not just an explicit command.
2. The proposed scope is internal + agent-to-agent output only. Human-facing output
   (owner messages, Telegram responses, external memos) must remain normal ASCII prose
   per formatting_rules.md and soul.md.
3. The SKILL.md includes an Auto-Clarity carve-out: reverts to normal style for security
   warnings, irreversible action confirmations, and ambiguous multi-step sequences.
   This partially mitigates human-facing risk but does not cover all owner-message cases.
4. If Eco or Assaf activates /caveman in a session that also produces owner-facing output,
   the compression will bleed into those messages. The skill is session-scoped and
   "ACTIVE EVERY RESPONSE" once triggered.
5. The formatting_rules.md memory note explicitly flags this: "whether the skill content
   could alter human-facing output (must stay internal-only)." This is a real risk,
   not hypothetical.

Mitigation required:
C3. Steward (Assaf) must document a session discipline rule: /caveman is only invoked
    in sessions that produce zero owner-facing output. If a session transitions to
    owner-facing output mid-session, /caveman must be explicitly deactivated ("stop
    caveman" / "normal mode") before any owner message is composed or sent.
C4. Eco must NOT activate /caveman in Telegram bridge sessions. Telegram bridge sessions
    are definitionally owner-facing. This is a hard scope boundary.

---

## R5 -- Prompt injection / takeover vector assessment

Severity: LOW (verified clean at pinned review date)

Findings:
1. CLAUDE.md (in the caveman repo): reviewed. Contains legitimate maintainer documentation
   only (hook architecture, file ownership, CI sync). No override of Claude safety rules,
   no jailbreak patterns, no hidden system prompts. CLEAN.
2. .cursorrules: HTTP 404 -- does not exist. CLEAN.
3. AGENTS.md: file exists but contains only @-references to SKILL.md paths. No behavioral
   instructions. CLEAN.
4. skills/caveman/SKILL.md: reviewed in full (complete raw text). The skill is a style
   modification instruction only. It drops filler words and articles; preserves technical
   terms, code, and errors verbatim. The Auto-Clarity rule explicitly reverts to normal
   prose for security warnings and irreversible action confirmations. No external calls,
   no telemetry, no data transmission instructions. No override of refusal behaviors or
   safety rules. CLEAN.
5. No telemetry, no phone-home, no network egress from the skill itself at runtime.
   The /caveman-stats command reads local Claude Code session logs only (per README).
   CLEAN.
6. Risk note: the caveman ecosystem includes caveman-shrink MCP middleware (deferred
   separately per the task scope). The skill reviewed here is the SKILL.md only.
   The MCP middleware is NOT covered by this review and must not be adopted under this clear.

---

## R6 -- License

Severity: NONE (positive finding)

MIT License, copyright (c) 2026 Julius Brussee.
Text confirmed verbatim: standard MIT; no additional conditions, no attribution requirements
in output, no copyleft. Full license text available at
https://raw.githubusercontent.com/JuliusBrussee/caveman/main/LICENSE.
Forward to Eyal for Legal gate confirmation (standard MIT; no new terms expected).

---

## Overall verdict

PARTIAL-CLEAR -- 4 conditions (C1-C4) required before A2 grant.

Gate level: A2. Reasons:
1. Free tool (MIT); no cost trigger requiring A1.
2. No blast-radius expansion: SKILL.md placement adds no new agent capabilities,
   no new network access, no new write permissions. Risk profile is LOW once installed
   correctly (C1).
3. The risks are all in the install method (R1, R2) and scope discipline (R4), both of
   which have clean mitigations.

NOT FLAG-BLOCKED. The skill content is clean. The install method is the only structural
risk, and it is entirely avoided by manual file placement (C1). Risk after C1-C4
applied: LOW.

Legal gate (Eyal): MIT license; no new vendor terms expected. Eyal confirm standard MIT
is clear before A2 grant, or owner waives Legal review at A2 with documentation.

---

## Conditions summary (C1-C4)

C1. Install method: manually copy skills/caveman/SKILL.md from a pinned commit into the
    project .claude/skills/ path (or designated location). Do NOT run install.sh,
    install.ps1, bin/install.js, or any npx invocation. No settings.json modification.
    No hook installation. Steward: Assaf.
C2. Pin to a specific commit SHA at time of file copy. Record SHA in gate-register.md
    row and in a comment in the copied SKILL.md. Any future update requires a new Rambo
    repo scan before the updated file is used.
C3. Assaf documents a session discipline rule: /caveman invoked only in sessions with
    zero owner-facing output. Deactivate explicitly ("stop caveman") before composing
    any owner or Telegram message.
C4. Eco must not activate /caveman in Telegram bridge sessions. Hard scope boundary.
    Add this constraint to Eco bridge context block at next R&R or at Agent tool grant (C1
    of gate-review-agent-tool-eco-rambo.md).

Legal gate condition: Eyal confirms MIT license carries no new terms or conditions.
Separate from C1-C4. A2 cannot be issued until Eyal confirms (or owner explicitly waives).

---

## Draft gate-register.md row (conditional -- for owner if A2 granted)

| caveman skill (JuliusBrussee) | Claude Code skill (SKILL.md, MIT) | free | [Eco A2, DATE] / [jecki A1 if required, DATE] | Scope: internal + agent-to-agent sessions only. Manual install: copy SKILL.md from pinned commit SHA [RECORD SHA]. No installer, no hooks, no settings.json mod. Steward: Assaf. C1-C4 applied (gate-review-caveman-rambo.md, 2026-06-17). Eyal: MIT confirmed [DATE]. Caveman-shrink MCP middleware NOT included -- requires separate gate. |

---

## Rambo sign-off

Rambo | Security | L3 | 2026-06-17
Finding delivered to Eco for relay to jecki (A2 decision; A1 not required unless owner chooses).
