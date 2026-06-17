# Gate Review: hebrew-rtl-best-practices (skills-il)

Reviewer: Rambo (Security, L3)
Date: 2026-06-17
Target: skills-il/localization@v1.3.0-hebrew-rtl-best-practices
Install command: `npx skills-il add skills-il/localization@v1.3.0-hebrew-rtl-best-practices --skill hebrew-rtl-best-practices -a claude-code`
Requested by: Eco (gate task, for Designer/Gal/Shir + Hila)
Basis: constitution S6, red line 4
Model: Sonnet (standard gate; not an LLM provider or broad-data-access integration)

---

## Verdict

PARTIAL-CLEAR -- A2 sufficient; 4 conditions (C1-C4) must be met before any install.

---

## Source identification

Verified sources (web investigation, no code executed):

- Skill content repo: https://github.com/skills-il/localization/tree/master/hebrew-rtl-best-practices
- CLI tool (npm): https://www.npmjs.com/package/skills-il (package: skills-il, v1.10.0 latest)
- CLI source repo: https://github.com/skills-il/skills-il-cli
- Platform: https://agentskills.co.il (operator: YooTech, alex@yootech.io)
- Maintainer on npm: yootech

Source is identifiable and consistent across npm, GitHub, and the platform.
Trust score 88/100 per platform. 2,552+ installs per platform claim.
Cannot independently verify install-count figures -- platform-reported only.

---

## Findings

### F1 -- What `npx skills-il add` actually does

RED LINE 4 FOCUS. The command does three things at runtime:

1. Downloads the `skills-il` npm package via npx (fetches from registry.npmjs.org).
   No preinstall, install, or postinstall hooks are defined in package.json.
   The `prepare` script runs `husky` -- this is a dev-only git-hooks tool,
   does NOT run on `npx` consumer invocation.

2. CLI resolves `skills-il/localization@v1.3.0-hebrew-rtl-best-practices` by:
   (a) querying the agentskills.co.il registry API to resolve the bare name, then
   (b) cloning or fetching the matching GitHub path
   (https://github.com/skills-il/localization/tree/master/hebrew-rtl-best-practices).
   This is a git fetch of static markdown + JSON files, not executable code.

3. Copies SKILL.md (and SKILL_HE.md) into `.claude/skills/` (for Claude Code target `-a claude-code`).
   Creates a symlink or file copy locally. No further network egress after install.

The CLI itself has zero runtime npm dependencies (all devDependencies).
The installed skill artifact is static markdown -- not a script or binary.

Risk from the install path: MEDIUM (network egress to two external hosts: registry.npmjs.org
and api.agentskills.co.il for name resolution; then GitHub). Version v1.3.0 is pinned
in the command -- this reduces supply-chain risk but does NOT eliminate it (see F3).

### F2 -- Prompt-injection scan of skill content

Read SKILL.md content for hebrew-rtl-best-practices via raw GitHub:
https://raw.githubusercontent.com/skills-il/localization/master/hebrew-rtl-best-practices/SKILL.md

Findings:
- No .claude/ directory in skill repo.
- No CLAUDE.md in skill repo.
- No AGENTS.md in skill repo (AGENTS.md exists only in the CLI repo, github.com/skills-il/skills-il-cli,
  as standard contributor documentation -- not a prompt-injection vector).
- No .cursorrules in skill repo.
- No shell scripts or executables in skill repo.
- SKILL.md content: technical RTL/CSS best practices (CSS logical properties, :dir(),
  Tailwind RTL, Next.js setup, icon mirroring, Hebrew typography). Pure instructional markdown.
- No adversarial override instructions found.
- No data exfiltration requests.
- No external URL calls embedded in skill instructions.
- metadata.json: standard fields (name, version, category, tags, supported agents). No suspicious fields.

Skill content verdict: CLEAN. No prompt-injection vectors detected.

### F3 -- Supply-chain risk: version pinning

The install command pins `@v1.3.0`. This is a git tag on the localization repo.
The CLI fetches the tagged state from GitHub at install time.
Risk: if the tag is moved (mutable tag), the pinned content could change silently.
Cannot determine at review time whether the tag is protected or immutable.
The npm package version (CLI itself) is NOT pinned in the npx command -- `npx skills-il`
fetches the npm `latest` tag (currently 1.10.0). If the CLI package is compromised
or a breaking change lands, the install behavior could change.

Severity: MEDIUM. Mitigable by inspecting SKILL.md content post-install
and locking the CLI version as well.

### F4 -- Anonymous telemetry

CLI source (AGENTS.md, README) states the CLI collects anonymous telemetry.
Telemetry is disabled in CI environments.
Content of telemetry: cannot determine without running the tool (read-only review).
Likely usage signals (commands run, skill names). Personal data: unknown.

Severity: LOW-MEDIUM. Must be confirmed before install in any environment
where company or agent data could appear in telemetry signals.

### F5 -- License

Skill (SKILL.md, metadata.json): MIT.
CLI package (skills-il npm): MIT (LICENSE file confirmed in package dist).
Platform content (curation, scoring, translations): proprietary to YooTech.

The installed artifact (SKILL.md copy in .claude/skills/) is MIT.
Using the skill does not require agreeing to any runtime license beyond MIT.

### F6 -- Terms of service (platform)

Platform ToS (agentskills.co.il/he/terms) reviewed.
Key finding: "commercial use of platform content requires explicit approval."
Individual skills are MIT-licensed, but platform's curation metadata is proprietary.
Installing and using the SKILL.md file (MIT) in our agent pipeline is within MIT terms.
Browsing the platform or scraping skill metadata is restricted.

Jurisdiction: Tel Aviv-Tel Aviv District Courts, Israeli law.
Indemnification clause: standard; no unusual exposure.
Data shared with third-party AI providers: applies to agentskills.co.il chat features,
NOT to locally installed SKILL.md files used in our own pipeline.

Legal gate: Eyal review required before A2 (constitution S6). ToS has no obvious
hard-blockers on MIT skill use, but Eyal must confirm.

### F7 -- Data egress during skill USE (post-install)

After install, SKILL.md is a local file injected as context to the Claude Code agent.
No runtime network egress from the skill itself -- it is static markdown.
The skill instructs the agent on RTL/CSS practices. No embedded URLs that fire at runtime.
Agent (Claude Code) sends SKILL.md content as context to Anthropic API --
this is within existing approved Claude (Anthropic API) data flow. No new egress path.

### F8 -- Registry API dependency

The CLI queries api.agentskills.co.il to resolve bare skill names to GitHub paths.
This is a new external host that is not currently in gate-register.md.
If the registry API is unavailable or compromised, the install fails or resolves
to a wrong target. Mitigation: post-install, compare SKILL.md content to the
clipping (Clippings/IL Skills/) to verify integrity.

---

## Risk summary

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| R1 | npx fetches CLI from npm (no postinstall hook; devDep-only; low risk) | LOW | Mitigable: C1 |
| R2 | CLI resolves skill via agentskills.co.il API then clones GitHub tag | MEDIUM | Mitigable: C1, C2 |
| R3 | npm CLI version not pinned in install command (`npx skills-il` = latest) | MEDIUM | Mitigable: C2 |
| R4 | Anonymous telemetry from CLI (scope unknown without execution) | LOW-MEDIUM | Mitigable: C3 |
| R5 | Eyal (Legal) gate not yet run; ToS commercial-use clause needs confirm | MEDIUM | Hard condition: C4 |
| R6 | Tag mutability on GitHub skill repo | LOW | Accept with C1 post-install check |

No HIGH risks found. No prompt-injection vectors in skill content.
No data exfiltration in skill content. MIT license confirmed.

---

## Recommended mitigation / solution

For each risk, interim and permanent mitigations:

R1 -- npx CLI fetch:
  Interim: require owner or Gal to inspect SKILL.md after install against known-good clipping.
  Permanent: same (static file; no runtime execution; one-time check sufficient).
  Owner: Gal (or Shir) confirms post-install.

R2 -- Registry API + GitHub clone:
  Interim: use the `--skill` + `-a claude-code` flags as in the documented command
  (limits scope to one file, one agent target). Confirm installed file matches clipping.
  Permanent: pin CLI version explicitly (see C2).

R3 -- Unpinned CLI version:
  Interim: run `npm view skills-il version` before install to confirm latest == 1.10.0
  (current known-good). Document the CLI version used.
  Permanent: use `npx skills-il@1.10.0 add ...` to pin the CLI version at install time.

R4 -- Telemetry:
  Interim: run install with `CI=true` environment variable (disables telemetry per CLI docs).
  Permanent: same pattern; confirm in any CI/automation context.

R5 -- Legal gate:
  Interim: HOLD install until Eyal reviews ToS.
  Permanent: Eyal confirm in writing (gate-register.md Eyal column) before any use.

R6 -- Tag mutability:
  Interim: post-install, hash the installed SKILL.md and record it.
  Permanent: same; one-time action; skill is static.

Mitigation summary table:

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|---------------|----------------|-----------------|-----------------|
| R1 | Gal/Shir | Post-install SKILL.md spot-check vs clipping | Gal/Shir | Same (one-time) |
| R2 | Eco/jecki | Use documented command with --skill + -a flags | Gal/Shir | Confirm file matches clipping |
| R3 | Gal/Shir | Verify `npm view skills-il version` == 1.10.0 before install | Gal/Shir | Pin CLI: `npx skills-il@1.10.0 add ...` |
| R4 | Gal/Shir | Run install with `CI=true` | Gal/Shir | Always set CI=true in any automated install |
| R5 | Eyal | Review ToS before A2 (hard blocker) | Eyal | Confirm in gate-register.md |
| R6 | Gal/Shir | Hash SKILL.md post-install; record | Gal/Shir | One-time; done at install |

---

## Conditions for adoption

C1 -- Post-install content check (Gal or Shir):
  After install, read .claude/skills/hebrew-rtl-best-practices/SKILL.md.
  Confirm it matches the content documented in the clipping at
  Clippings/IL Skills/shitot avoda mumlatset l-RTL.
  If content diverges: halt, report to Eco -> Rambo re-review.

C2 -- Pin CLI version explicitly:
  Use `npx skills-il@1.10.0 add skills-il/localization@v1.3.0-hebrew-rtl-best-practices --skill hebrew-rtl-best-practices -a claude-code`
  not bare `npx skills-il add ...`.
  Document CLI version used in gate-register.md notes field.

C3 -- Install with CI=true to disable telemetry:
  `CI=true npx skills-il@1.10.0 add ...`
  This is the install command that must be used. No exceptions.

C4 -- Eyal (Legal) gate required before A2 grant:
  Eyal must review agentskills.co.il/he/terms and confirm:
  (a) MIT skill use in our agent pipeline is within ToS.
  (b) No blocking clause on commercial pipeline use.
  (c) No Israeli law exposure from the indemnification clause.
  Eyal output goes to Eco. Eco decides A2 grant only after Eyal clears.

---

## Recommended adoption path (safe, in order)

1. Eyal reviews ToS (C4 -- do first; blocks all other steps).
2. Eco grants A2 (only after C4 clear).
3. Gal or Shir runs: `CI=true npx skills-il@1.10.0 add skills-il/localization@v1.3.0-hebrew-rtl-best-practices --skill hebrew-rtl-best-practices -a claude-code`
4. Post-install: read .claude/skills/ output; compare to clipping (C1).
5. Record in gate-register.md: CLI version 1.10.0, skill tag v1.3.0, install date, C1 confirmed, C3 used.

Do NOT clone or run the CLI repo itself. npx install only (C2/C3 command above).
Do NOT install in a production pipeline until C1-C4 all confirmed.

---

## Gate-register update (draft -- Eco to paste into gate-register.md pending section)

| Tool / Service | Type | Source | Flagged by | Rambo | Eyal | Notes |
|----------------|------|--------|------------|-------|------|-------|
| hebrew-rtl-best-practices (skills-il) | AI agent skill (Claude Code) | https://github.com/skills-il/localization/tree/master/hebrew-rtl-best-practices ; CLI: https://github.com/skills-il/skills-il-cli | Eco (2026-06-17) | PARTIAL-CLEAR (Rambo, 2026-06-17) -- A2 sufficient; 4 conditions C1-C4; findings: company/governance/gate-review-hebrew-rtl-rambo.md | PENDING (C4 hard blocker -- Eyal must review agentskills.co.il ToS before A2 grant) | Skill content: clean (no injection vectors, MIT license). CLI: no postinstall hooks, zero runtime deps. R1 LOW, R2-R5 MEDIUM, R6 LOW. Install command must include: version pin `skills-il@1.10.0`, `--skill hebrew-rtl-best-practices -a claude-code`, and `CI=true`. Post-install content check required (C1). |
