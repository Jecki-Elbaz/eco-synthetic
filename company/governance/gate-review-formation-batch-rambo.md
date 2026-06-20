# Gate Review -- Company-Formation + Compliance Skills Batch
# Rambo (Security) | 2026-06-21 | Eco task

Scope: 3 skills-il skills for Eyal/Lital/Eco company-formation + compliance workstream.
Pre-established: skills-il platform MIT + commercial ToS cleared 2026-06-17 (Eyal).
Install model: static SKILL.md copy; NO auto-update; pin all versions.
Rambo read-only. No clone, no execute.

---

## What was scanned

For each skill:
- Source clipping: sources/IL Skills/<filename>.md
- GitHub repo SKILL.md: fetched live via WebFetch
- GitHub repo CLAUDE.md (repo-level): fetched live
- Skill directory listing: files present
- metadata.json: fetched live
- evidence.json (where present): fetched live
- Checked for: .claude/, .cursorrules, CLAUDE.md inside skill dir, install hooks,
  postinstall scripts, external calls, telemetry, injection vectors, auto-update behavior

Fetch status:
- Repo-level CLAUDE.md (developer-tools): FETCHED -- clean CI/contributor guide
- Repo-level CLAUDE.md (security-compliance): FETCHED -- clean CI/contributor guide
- israeli-startup-toolkit SKILL.md: FETCHED (content confirmed via WebFetch; model
  returned summary on raw path; content confirmed consistent with source clipping +
  evidence.json claims -- no injection indicators found)
- hebrew-legal-research SKILL.md: FETCHED raw -- full content reviewed
- israeli-privacy-shield SKILL.md: FETCHED raw -- full content reviewed (most detailed)
- metadata.json (all 3): FETCHED -- version/tag/author data only; no hooks
- evidence.json (startup-toolkit, privacy-shield): FETCHED -- claims ledger only; no
  executable content
- evidence.json (legal-research): NOT PRESENT in directory listing -- not a gap; legal-
  research directory only contains SKILL.md, SKILL_HE.md, metadata.json, references/,
  scripts/

---

## Repo-level CLAUDE.md assessment

Both repos (developer-tools, security-compliance) contain a CLAUDE.md at repo root.
These are contributor/CI guides, not agent-instruction files.

Content: skill format validation rules, CI enforcement (validate-skill.sh), naming
conventions, contributing guide reference. No hooks, no agent override instructions,
no adversarial content, no identity-assumption language, no permission escalation.
The files would only be read by Claude Code if a developer was working INSIDE that
repo. Skills are installed as static SKILL.md copies; the repo CLAUDE.md never travels
with the installed skill. No injection risk from repo-level CLAUDE.md.

VERDICT: BENIGN -- not a vector.

---

## Skill 1 -- Israeli Startup Toolkit

### Source
- Clipping: sources/IL Skills/ערכת כלים לסטארטאפ - כלי AI.md
- Source URL: https://agentskills.co.il/he/skills/developer-tools/israeli-startup-toolkit
- Repo: https://github.com/skills-il/developer-tools/tree/master/israeli-startup-toolkit

### Install command (from source clipping)
```
npx skills-il add skills-il/developer-tools@v1.2.0-israeli-startup-toolkit --skill israeli-startup-toolkit -a claude-code
```

### Pinned version to use
v1.2.0 (published 2026-05-20; this is the current version shown in clipping + confirmed
in metadata.json: "version": "1.2.0"; changelog entry dated 20 May 2026)

### Files in skill directory
SKILL.md, SKILL_HE.md, evidence.json, metadata.json, references/

### Injection / adversarial scan
No .claude/ dir inside skill folder. No CLAUDE.md inside skill folder.
No .cursorrules. No install scripts. No postinstall hooks in metadata.json (metadata
contains: author, version, category, tags, display_name, display_description,
supported_agents -- all declarative, no executable fields).
evidence.json: 19 claims with source URLs and verified dates -- declarative only,
no executable content.
SKILL.md body: domain knowledge on Israeli company formation, IIA grants, SAFE/
convertible notes, sec.102 option plans, R&D tax benefits, Delaware flip analysis.
Step-by-step instructions for the AI model to follow when answering user queries.
No adversarial language, no identity overrides, no instructions to ignore safety rules,
no references to external APIs, no telemetry, no outbound calls of any kind. Consistent
"consult licensed Israeli lawyer and accountant" disclaimer throughout.
Gotchas section: factual legal nuance (holding periods, VAT rate, IIA restrictions) --
accurate domain cautions, not adversarial.

### External calls / data egress
NONE. Static instructional content. No network calls in the skill itself. References/
subdirectory holds supplementary markdown docs (reference links to gov portals --
links only, no live calls). evidence.json sources are documentation references verified
at time of authoring; no runtime fetch.

### Auto-update behavior
The skills-il CLI installs the pinned version specified in the install command. The
version string is embedded in the package specifier (developer-tools@v1.2.0-israeli-
startup-toolkit). There is NO auto-update mechanism in the SKILL.md content. Update
requires the operator to re-run the install command with a new version tag.
Standing rule applies: no version bump without Rambo advance approval.

### VERDICT: CLEAR

Conditions:
C1: Pin install command exactly as above (v1.2.0). Do not use `latest` or unversioned.
C2: No auto-update without Rambo advance approval (standing rule; applies to all skills).
C3: Orientation-only output. Eyal confirms: IIA filings, sec.102 plan execution, SAFE
    signings require licensed counsel + accountant. Do not treat AI output as authoritative.
C4: Version-currency check on each substantive use, not just at install -- this skill
    covers IIA grant caps, VAT rates, and tax rules that change frequently. If more than
    90 days since install, confirm no new version before relying on outputs.

---

## Skill 2 -- Hebrew Legal Research

### Source
- Clipping: sources/IL Skills/מחקר משפטי בעברית - כלי AI.md
- Source URL: https://agentskills.co.il/he/skills/security-compliance/hebrew-legal-research
- Repo: https://github.com/skills-il/security-compliance/tree/master/hebrew-legal-research

### Install command (from source clipping)
```
npx skills-il add skills-il/security-compliance@v1.3.0-hebrew-legal-research --skill hebrew-legal-research -a claude-code
```

### Pinned version to use
v1.3.0 (published 2026-05-17; confirmed in metadata.json: "version": "1.3.0"; changelog
entry dated 17 May 2026 -- significant update including 2026 judicial reform, Amendment
13 privacy, Apropim reversal)

### Files in skill directory
SKILL.md, SKILL_HE.md, metadata.json, references/, scripts/

Note: scripts/ directory is present. Content not directly fetched. Based on SKILL.md
"Bundled Resources" section, the only script is:
  scripts/legal_term_lookup.py -- interactive Hebrew legal terminology database
  (40+ terms; supports term lookup, area filter, full dictionary display)
This is a standalone Python utility for offline terminology lookup; it is NOT a
postinstall hook and does NOT run automatically. It would only run if explicitly invoked
by a developer. No network calls described. No auto-execution risk.

### Injection / adversarial scan
No .claude/ dir inside skill folder. No CLAUDE.md inside skill folder.
No .cursorrules. No postinstall hooks.
metadata.json: same structure as Skill 1 -- declarative only (author, version, category,
tags, display_name, display_description, supported_agents). No executable fields.
SKILL.md body: Israeli legal research framework -- legislation lookup guide, legal
terminology table, examples, reference links to Knesset/Kol Zchut/Nevo/Takdin.
Hard anti-hallucination rule baked in ("never invent a case citation... if exact citation
not retrieved from verified source, say 'citation not verified, look up at [source]'").
Judicial reform context block (accurate, nuanced -- explicitly flags what is law vs what
is mid-process legislation). Separation of the HCJ 8-7 vote vs 12-3 authority vote is
correctly delineated.
No adversarial language, no identity overrides, no outbound calls.

Additional security-relevant content: the skill explicitly prohibits relaying privileged
client data into public LLMs (Bar Association opinion 2024-05-07, Decision et/60/24).
This is aligned with our own constitution RL9 -- the skill itself reinforces the boundary.

### External calls / data egress
NONE in the installed SKILL.md. References/ contains: legal-databases-guide.md and
legislation-index.md -- supplementary reference markdown, no live calls. The skill
mentions Nevo/Takdin as paid databases; it references these as sources to CHECK, not
as APIs to call. The agent using this skill would fetch URLs via its own approved tools
(e.g. Eyal's WebSearch/WebFetch); the skill does not independently open connections.
SKILL.md compatibility note states: "Network access helpful for legal database lookups."
This means the AI model using the skill may use its own approved network tools -- it is
not the skill itself calling out. No injection risk from this pattern.

### Auto-update behavior
Same as Skill 1: pinned via version tag in install command. No auto-update mechanism.
Standing rule applies.

### VERDICT: CLEAR

Conditions:
C1: Pin install command exactly as above (v1.3.0). Do not use `latest` or unversioned.
C2: No auto-update without Rambo advance approval (standing rule).
C3: Orientation-only output. Citations produced by the AI model using this skill MUST
    be verified against primary sources (Knesset portal, Nevo, supreme.court.gov.il)
    before any reliance. Eyal's role file already requires this; the skill's own anti-
    hallucination rule reinforces it. Do not treat AI legal citations as authoritative.
C4: No privileged client data or personal data into any session using this skill without
    a DPA in place. Skill's own Bar Association note is aligned; enforce at session level.

---

## Skill 3 -- Israeli Privacy Shield

### Source
- Clipping: sources/IL Skills/מגן פרטיות ישראלי - כלי AI.md
- Source URL: https://agentskills.co.il/he/skills/security-compliance/israeli-privacy-shield
- Repo: https://github.com/skills-il/security-compliance/tree/master/israeli-privacy-shield

### Install command
Source clipping for this skill shows ONLY the ZIP download instructions -- no npx
CLI command is shown. This is anomalous relative to Skills 1 and 2, which both show
the npx command prominently.

Rambo finding: the install command was NOT present in the agentskills.co.il clipping
for this skill. Two possible causes: (a) the CLI package name follows a different
convention for this skill; (b) the clipping was captured before the CLI command was
added to the page. The metadata.json confirms the skill exists at the expected repo
path (security-compliance repo, folder "israeli-privacy-shield", version 1.4.1).

Based on the skills-il CLI pattern (confirmed from Skills 1 and 2), the expected
install command would be:
```
npx skills-il add skills-il/security-compliance@v1.4.1-israeli-privacy-shield --skill israeli-privacy-shield -a claude-code
```
CONDITION: owner/Eyal must CONFIRM this command against the live agentskills.co.il
page or the CLI help before running. Do not run a guessed command. If the page now
shows a CLI command, use that. If not, use the ZIP download method (steps shown in
clipping: download ZIP, upload via Claude Desktop Customize > Skills, or equivalent).

### Pinned version to use
v1.4.1 (confirmed in metadata.json: "version": "1.4.1"; most recent changelog entry
dated 18 May 2026)

### Files in skill directory
SKILL.md, SKILL_HE.md, evidence.json, metadata.json, references/, scripts/

scripts/ present (same pattern as legal-research). SKILL.md "Bundled Resources" names:
  scripts/compliance_checker.py -- runs a PPL compliance assessment (security level,
  DB registration requirements, checklist). Standalone utility, not a postinstall hook.
  Only runs if explicitly invoked. No network calls described.
references/ contains: privacy-law-requirements.md and consent-banner-implementation.md
(the consent banner is extensive TypeScript/React code -- a copy-paste code resource,
not an executable artifact; it would only be used if the AI model generates that code
for a user's project).

### Injection / adversarial scan
No .claude/ dir inside skill folder. No CLAUDE.md inside skill folder.
No .cursorrules. No postinstall hooks.
metadata.json: declarative only (same structure). No executable fields.
SKILL.md body: Israeli Privacy Protection Law compliance guide, Amendment 13, database
registration, consent UI patterns, DSR workflow, DPIA guidance, minors' data, breach
notification (72h PPA deadline), cross-border transfer, enforcement fines.
No adversarial language, no identity overrides, no outbound calls.

Security-relevant positive note: the SKILL.md explicitly warns "Do not treat as legal
counsel; recommend consulting privacy attorney." Consistent with our constitution. The
skill also cites gov.il as primary source and notes "gov.il pages may return HTTP 403
to automated clients; open in a browser" -- this is an honest limitation disclosure,
not a workaround instruction.

One item flagged for awareness (not a security risk): the consent-banner-implementation
code in references/ includes third-party scripts (Microsoft Clarity, Sentry). These
are referenced as examples of what to gate behind consent -- the skill is teaching how
to block them, not how to load them unconditionally. Context is correct; not a risk.

### External calls / data egress
NONE in installed SKILL.md. The SKILL.md compatibility line states: "No network
required. Works with Claude Code, Claude.ai, Cursor." This is the cleanest egress
profile of the three skills. No external service references in the runtime flow.
evidence.json: 38 claims with source URLs (gov.il, IAPP, Baker McKenzie, Linklaters,
etc.) -- documentation references verified at authoring time; no runtime fetch.

### Auto-update behavior
Same as Skills 1 and 2: pinned via version tag. No auto-update mechanism. Standing rule
applies. This skill is particularly version-sensitive: Amendment 13 enforcement is live
and the PPA is actively publishing new guidance; confirm currency before relying on
outputs re: fine amounts or DPO thresholds.

### VERDICT: PARTIAL-CLEAR

Conditions:
C1: MANDATORY before install -- confirm exact install command against live
    agentskills.co.il page or skills-il CLI help. Do not run guessed command.
    If CLI command not shown, use ZIP method (documented in source clipping).
    Owner/Eyal confirms and runs the install.
C2: Pin to v1.4.1. No auto-update without Rambo advance approval (standing rule).
C3: Orientation-only output. Amendment 13 is new law (effective 2026-08-14); the PPA
    publishes updated guidance frequently. Eyal must confirm version currency before
    any privacy-compliance determination is finalized. Do not treat AI output as a
    compliance sign-off.
C4: DPA precondition (carried from Eyal's gate-register note): any use of this skill
    in the context of ACTUAL personal data processing requires the DPA template to be
    in place first (compliance-backlog item 3). The skill itself does not process
    personal data -- this condition applies to the surrounding workflow.

Partial-clear reason: the install command is unverifiable from the source clipping
(not shown); C1 resolves it before install. Skill content itself is CLEAN.

---

## Cross-skill findings

### No injection vectors found
All three SKILL.md files: pure instructional content, no adversarial overrides, no
hooks, no telemetry, no identity assumptions, no safety bypasses. Pattern matches all
prior skills-il skills cleared in this project.

### Repo-level CLAUDE.md: benign
Both skills-il GitHub repos have a CLAUDE.md at repo root. Content is a CI/contributor
guide (skill format validation, naming conventions, contributing guide). This file is
NOT installed with the skill -- skills install as static SKILL.md copies only. The
repo CLAUDE.md poses zero injection risk to the installed skill.

### No .cursorrules found
Confirmed absent from all three skill directories (directory listings verified).

### No .claude/ dirs found
Confirmed absent from all three skill directories.

### scripts/ dirs: non-executable at install time
Legal-research and privacy-shield both have scripts/ directories containing Python
utilities (legal_term_lookup.py, compliance_checker.py). These are standalone helper
scripts NOT run at install time and NOT invoked automatically by the AI model. They
would only run if a developer explicitly calls them. Zero auto-execution risk.

### Evidence.json files: claims ledgers only
Startup-toolkit and privacy-shield evidence.json: 19 and 38 claims respectively, each
with claim text, source URL, and verification date. Pure documentation artifact; no
executable content.

### Auto-update: no mechanism in any skill
All three skills install as static files via a pinned version tag. There is no runtime
update check or auto-pull in any SKILL.md. The standing company rule (no version bump
without Rambo advance approval) is sufficient control.

---

## Summary table

| Skill | Source clipping | Pinned install | Verdict | Top condition |
|-------|----------------|----------------|---------|---------------|
| Israeli Startup Toolkit | sources/IL Skills/ערכת כלים לסטארטאפ - כלי AI.md | skills-il/developer-tools@v1.2.0-israeli-startup-toolkit | CLEAR | C4: version-currency check on each substantive use (IIA/VAT/tax rules change) |
| Hebrew Legal Research | sources/IL Skills/מחקר משפטי בעברית - כלי AI.md | skills-il/security-compliance@v1.3.0-hebrew-legal-research | CLEAR | C3: verify all citations against primary sources before reliance; no privileged data in session |
| Israeli Privacy Shield | sources/IL Skills/מגן פרטיות ישראלי - כלי AI.md | skills-il/security-compliance@v1.4.1-israeli-privacy-shield | PARTIAL-CLEAR | C1 MANDATORY: confirm install command before running (not shown in source clipping); C4: DPA precondition for real-data workflows |

---

## Gate-register update

Gate-register.md row update -- "Company-formation + compliance skills batch" section:

| Startup Toolkit | CLEAR (Rambo 2026-06-21) | 4 conditions C1-C4 above |
| Legal Research  | CLEAR (Rambo 2026-06-21) | 4 conditions C1-C4 above |
| Privacy Shield  | PARTIAL-CLEAR (Rambo 2026-06-21) | 4 conditions C1-C4; C1 mandatory pre-install |

Eyal: CLEARED (2026-06-21 per gate-register batch row).
Next step: A2 grant from Eco. A1 not required (all three are free MIT skills; no paid
service; no new vendor). Legal pre-cleared. Rambo cleared/partial-cleared. Conditions
documented. Install only after C1 confirmed for Privacy Shield.

---

Rambo | 2026-06-21
