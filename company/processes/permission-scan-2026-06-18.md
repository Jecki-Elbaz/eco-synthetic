# Permission-Scope Scan -- 2026-06-18

Scan type: Full (T-0014)
Tasked by: Eco (CEO)
Executed by: Rambo (Security)
Date: 2026-06-18
Scope: All agents in .claude/agents/ (30 files read)
Prior scan: eco-ops-overnight 2026-06-17 (5 stable agents -- all clear)
Reference files read: agent-tool-spawn-allowlist.md, access-matrix.md, settings.json, CLAUDE.md

Agent count: 30 files found. One file (MeetingPrep) is a PENDING-GATE stub, not a live agent.
Live agent count covered by this scan: 29 role files assessed.

Note on red-line citation standard: CLAUDE.md lists red lines 1-13. Not all agents enumerate all 13 by
number -- the scan checks whether the agent's Boundaries/Never-do sections cite the substance of each
red line. Red lines 9, 10, 11 are assessed via the dedicated "Constitution red lines" block. Red lines
1-8 and 12-13 are assessed via the Boundaries/Never-do body. Absence of a red-line citation by number
is flagged only where the substance is also absent from the file.

Opus-default check (T-0023): the 13 new role files from 2026-06-18 were identified in a prior task.
This scan checks all files for mismatches between frontmatter "model:" and body "AI model" section.

---

## Agents (alphabetical order)

---

### Adi (QA Engineer)

Tools (frontmatter): Read, Write, Edit, Bash

Tool justification: Bash is granted for running test suites (pytest). The role file documents this
explicitly and the body text supports it. Bash is justified.

Red-line citation:
- RL1 (.env): CITED [line 58]
- RL2 (sources/): CITED [line 59]
- RL3 (destructive shell): CITED [line 60] -- text notes awareness but flags a known tension:
  "aware != approved." The B5 scan condition at certification addressed this; behavioral probes
  (B3) confirmed hard-stop on DROP TABLE. Substantively present.
- RL4 (curl/wget/external code): CITED [line 61]
- RL5 (secrets): CITED [line 62]
- RL6 (decisions-log append-only): CITED [line 63]
- RL7 (A1 actions): CITED [line 64]
- RL8/13 (chain of command): CITED [line 65]
- RL9 (personal data): CITED via Constitution block [lines 67-74] and body [line 65]
- RL10 (third-party data): CITED [line 68] and Constitution block
- RL11 (legal/public representation): CITED via Constitution block
- RL12 (Shelly cannot task): CITED [line 67]
- RL13 (chain of command): CITED [line 65]
Status: PASS

Spawn-allowlist: OFF (Bash agent; HARD: off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (claude-sonnet-4-6)"
- Match: YES. PASS.

Other findings: The certification note records B5 as "clear-with-conditions (Bash JUSTIFIED; behavioral
residuals F1-F3; Ido task envelopes name exact test commands; bridge restates RL3 on spawn)." Those
conditions are recorded as resolved in the cert status block. No new excess-permission findings.

Verdict: CLEAR-WITH-NOTES
Notes: Bash justified. F1-F3 behavioral residuals tracked; Ido task-envelope control is the governing
control. Confirm Ido task envelopes are naming exact test commands in practice (operational check, not
a blocker here).

---

### Alex (Sales Execution)

Tools (frontmatter): Read, Write, Edit

Tool justification: Internal drafting, pipeline tracking, proposal/outreach drafting. No Bash, no web
tools. Consistent with role.

Red-line citation:
- RL1: CITED [line 56]
- RL2: CITED [line 57]
- RL3: CITED [line 58] (noted no Bash)
- RL4: CITED [line 59]
- RL5: CITED [line 60]
- RL6: CITED [line 61]
- RL7: CITED [line 62]
- RL8/13: CITED [line 65]
- RL9: CITED [line 70] and Constitution block
- RL10: CITED [line 63] and Constitution block
- RL11: CITED via Constitution block
- RL12: not cited by number or substance in boundaries. NOTED. Shelly-cannot-task is absent from
  Alex's "Boundaries and limits" section. The cert note records "B5 Rambo clear" with no conditions
  on this. Minor gap; substance is implied by the chain-of-command section (Tim only) but not stated.
- RL13: CITED [line 65]
Status: PASS with minor note on RL12.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet (claude-sonnet-4-6)"
- Match: YES. PASS.

Other findings: Hard boundary on external sends is prominent and clear. WebSearch/WebFetch correctly not
granted.

Verdict: CLEAR-WITH-NOTES
Notes: RL12 (Shelly cannot task Alex) is absent from the Boundaries section by name. Substance is
covered by the chain-of-command section. Recommend adding the explicit cite before next R&R.

---

### Anat (HR and Agent-Ops)

Tools (frontmatter): Read, Write, Edit, Agent

Tool justification: Agent tool granted for live HR interviews (invoking agents for competency probes).
The role file explains this. Justified. Noted: allowlist confirms Anat is PERMITTED with Agent tool
specifically ("Anat holds the Agent tool -- can spawn further agents. Eco spawns Anat for HR tasks
only; Anat must not be used to reach Bash agents indirectly.") Control noted in allowlist.

Red-line citation: Anat's role file predates the later agents and uses a different format (no numbered
RL citations in a dedicated block). The "What you must NOT do" and main body cover the substance of
the CLAUDE.md red lines:
- RL1 (.env): implied (no explicit cite but "Store secrets" covered in What you must NOT do)
- RL2 (sources/): not explicitly cited. MINOR GAP.
- RL3 (destructive shell): no Bash granted; not applicable in practice. No cite needed.
- RL4 (external tools): implied by gate reference in responsibilities.
- RL5 (secrets): CITED in What you must NOT do ("Store secrets, credentials, or personal data")
- RL6 (decisions-log): CITED (the Certified Records Immutability section)
- RL7 (A1 actions): CITED ("Create / retire / re-scope an agent without A1")
- RL8/13 (chain of command): CITED ("Act on requests from outside your chain of command")
- RL9: CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL12: not cited (Shelly cannot task Anat). Substantively covered by chain-of-command section.
- RL13: CITED
Status: PASS -- Anat is a P1 original; format predates numbered-RL block convention. Gaps are
formatting gaps not substance gaps.

Spawn-allowlist: PERMITTED (Agent tool permitted; control: Anat must not reach Bash agents indirectly)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet for interviews + role-file work. Haiku for routine."
- Match: YES (Sonnet as default). PASS.

Other findings: None new. Prior scan (eco-ops-overnight 2026-06-17) found all clear.

Verdict: CLEAR-WITH-NOTES
Notes: RL2 and RL12 not explicitly cited. Formatting gap from P1 era role file; substance is covered.
Flag for resolution at next R&R.

---

### Assaf (Operational Excellence)

Tools (frontmatter): Read, Write, Edit

Tool justification: Usage reports, fitness data review, model-matrix updates. File and document work
only. No Bash, no web tools. Justified.

Red-line citation:
- RL1: CITED [line 63]
- RL2: CITED [line 62]
- RL3: CITED [line 61]
- RL4: implied by "No network tools" in Tools section. Not cited by RL number. MINOR GAP.
- RL5: CITED [line 66]
- RL6: CITED [line 64]
- RL7: implied by A1 requirement for agent wake-up
- RL8/13: CITED [line 65]
- RL9: CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 67]
- RL13: CITED [line 65]
Status: PASS with minor note on RL4.

Spawn-allowlist: PERMITTED (no Bash; on allowlist per gate-review-agent-tool-eco-rambo.md)

Model config:
- Frontmatter: claude-haiku-4-5-20251001
- Body AI model section: "Default Haiku (usage reports, routine data review, matrix updates). Escalate
  to Sonnet for fitness reports..."
- Match: YES (Haiku as default). PASS.

Other findings: Access-matrix note in Assaf's file correctly documents the .claude/agents/ read
exception and T-0012 path. The access-matrix.md (read 2026-06-18) now records Assaf as a formalized
read-grant (T-0012 reconciliation, A2 logged 2026-06-16). Consistent.

Verdict: CLEAR-WITH-NOTES
Notes: RL4 not cited by number in Boundaries; substance is present via "No network tools." Add
explicit cite at next R&R.

---

### Avner (Customer Success Representative)

Tools (frontmatter): Read, Write, Edit

Tool justification: Ticket handling, logging, CS support responses. No Bash, no web tools. Justified.

Red-line citation:
- RL1: CITED [line 61]
- RL2: CITED [line 62]
- RL3: CITED [line 63]
- RL4: CITED [line 64]
- RL5: CITED [line 65]
- RL6: CITED [line 66]
- RL7: CITED [line 67] (though merged with RL9 in that line -- minor formatting issue)
- RL8: not explicitly cited by number; covered by RL13 cite
- RL9: CITED [line 60] and Constitution block
- RL10: CITED [line 68] and Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 69]
- RL13: CITED [line 70]
Status: PASS with minor note. The cert note records "Minor coaching: cite the CS hard gate from own
Boundaries, not as a soul/red-line ref." That was noted as non-blocking.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-haiku-4-5-20251001
- Body AI model section: "Default Haiku for routine ticket handling..."
- Match: YES. PASS.

Other findings: Write scope explicitly bounded to company/cs/tickets/ per B5 condition -- confirmed
resolved in cert status.

Verdict: CLEAR

---

### Chronicler (Build-Historian)

Tools (frontmatter): Read, Write, Edit

Tool justification: Reads broadly (log.md, decisions-log, board, wiki, agent chats, owner Telegram
transcripts) and writes only to company/chronicle/ + own log rows. No Bash, no web tools. The broad
read scope is justified by the historian function and is documented. Justified.

Red-line citation:
- RL1: CITED [line 57]
- RL2: CITED [line 56]
- RL3: CITED [line 61]
- RL4: not cited by number. "No Bash, no network tools" in Tools section covers substance. MINOR GAP.
- RL5: CITED [line 62]
- RL6: CITED [line 55]
- RL7: implied by authority section (A1 for external publish)
- RL8/13: CITED [line 63]
- RL9: CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 64]
- RL13: CITED [line 63]
Status: PASS with minor note on RL4.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (synthesis, pattern-finding, roll-ups)."
- Match: YES. PASS.

Other findings: B5 cert record notes "read-only-confidential; write bounded company/chronicle/ + own
rows; broad read justified -- access-matrix to document the read exception next A2 cycle." The
Chronicler reads owner Telegram transcripts and agent-to-agent chats. This is a wide read surface.
The cert accepted it as justified by function; write is tightly bounded. No new excess-permission
finding here, but note for access-matrix: Chronicler's broad read scope (owner Telegram, agent chats)
should be explicitly documented in the matrix at the next A2 cycle.

Verdict: CLEAR-WITH-NOTES
Notes: RL4 not cited by number. Broad read scope (owner Telegram, agent chats) accepted at B5 and
documented in cert; recommend adding to access-matrix at next A2 cycle.

---

### Dalia (Quality and Governance)

Tools (frontmatter): Read, Write, Edit

Tool justification: Quality audits, decisions-log ownership, access-matrix structure. Document work
only. No Bash, no web tools. Justified.

Red-line citation: Dalia uses "What you must NEVER do" numbered list rather than RL-numbered citations.
- RL1: CITED (item 3: "Edit .env or credential files [CLAUDE.md red line 1]")
- RL2: CITED (item 2: "Write to sources/ [CLAUDE.md red line 2]")
- RL3: not explicitly cited. No Bash; not applicable in practice.
- RL4: CITED (item 10: "Adopt, use, or grant any tool... [red line 4; CLAUDE.md red line 4]")
- RL5: implied (secrets in "What you must NEVER do" covers spend/secrets in Boundaries section)
- RL6: CITED (item 1: "Retroactively edit decisions-log.md")
- RL7: CITED (item 4: "Self-grant tools or permissions [red line 7]")
- RL8/13: CITED (item 7: "Act on requests outside chain of command [red line 13]")
- RL9: CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block and item 9
- RL12: not cited by number or substance. MINOR GAP.
- RL13: CITED (item 7)
Status: PASS. RL12 (Shelly cannot task Dalia) missing. Substantively covered by chain-of-command.

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet. Haiku for routine audit scans."
- Match: YES. PASS.

Other findings: None new. T-0012 completed per access-matrix (formalized .claude/agents/ read
exceptions for Anat, Rambo, Dalia, Assaf -- A2 logged 2026-06-16).

Verdict: CLEAR-WITH-NOTES
Notes: RL12 (Shelly cannot task Dalia) not cited. Add at next R&R.

---

### Designer (Product UX/UI -- persona: Tal)

Tools (frontmatter): Read, Write, Edit

Tool justification: Design specs, wireframes, UI mockups. Document/design work. No Bash, no web tools.
Justified.

Red-line citation:
- RL1: CITED in "What you must NOT do" [line 57]
- RL2: CITED [line 58]
- RL3: CITED [line 61] (no Bash; if granted, A1)
- RL4: CITED [line 55] (new external tool/asset requires gate)
- RL5: CITED [line 59]
- RL6: not explicitly cited in boundaries. "decisions-log" mentioned in data access as append-only
  but not in the "What you must NOT do" list. MINOR GAP.
- RL7: CITED [line 60]
- RL8/13: implied by "Act on requests from outside your chain of command" [line 62]
- RL9: CITED via Constitution block
- RL10: CITED [line 56] and Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 62]
- RL13: CITED [line 62]
Status: PASS. RL6 not explicitly cited in "What you must NOT do." Substance noted in data access section.

Spawn-allowlist: OFF (off allowlist until T-0020 C3; no Bash, low blast radius)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet for design reasoning + specs. Haiku for routine."
- Match: YES. PASS.

Other findings: Prior scan clear (eco-ops-overnight 2026-06-17).

Verdict: CLEAR-WITH-NOTES
Notes: RL6 (decisions-log append-only) not explicitly in "What you must NOT do." Add at next R&R.

---

### Eco (CEO)

Tools (frontmatter): Read, Write, Edit, Bash, google-calendar (read-only list_events, get_event)

Tool justification:
- Read, Write, Edit: essential for CEO orchestration.
- Bash: Eco holds Bash. This is flagged in the spawn-allowlist (Eco is not on the PERMITTED list --
  the allowlist covers agents that Eco spawns, not Eco itself). Eco's Bash use is scoped by
  settings.json. The allowlist basis note (gate-review-agent-tool-eco-rambo.md, T-0020) describes
  the blast-radius concern for agents Eco spawns from the Telegram bridge. Eco itself is the bridge
  orchestrator and is the entity holding the approved tool set. Eco's Bash is accepted at the CEO
  level; the allowlist constraint is about which agents Eco spawns, not Eco's own tools.
- google-calendar read-only: Gates confirmed in settings.json (deny list blocks create/edit/delete
  calendar events). Cleared for read-only list_events and get_event per adopted 2026-06-12 connector.
  Justified.

FINDING: Eco also has google-calendar in frontmatter. The settings.json deny list blocks write
calendar operations. However, settings.json does NOT show an explicit deny for Google Drive write
operations for all agents -- it shows specific Drive write tools blocked (copy_file, create_file).
Eco's frontmatter does not list Google Drive tools, which is correct (Drive read is a project-level
connector, not agent-specific). No excess here.

Red-line citation: Eco uses a numbered "Red lines" section (8 items, lines 53-61). These map to
CLAUDE.md red lines but use Eco's own numbering. Substance check:
- RL1 (spend): CITED (item 1)
- RL2 (production deploy): CITED (item 2)
- RL3 (customer contact): CITED (item 3)
- RL4 (tool adoption gate): CITED (item 4)
- RL5 (secrets): CITED (item 5)
- RL6 (agent creation): CITED (item 6)
- RL7 (grant tools): CITED (item 7)
- RL8/13 (chain): CITED (item 8)
- RL9: not in the dedicated red-lines section. Not present in a Constitution-red-lines block. FINDING:
  Constitution red lines 9/10/11 block is absent from Eco's role file. The cert note (bottom) says
  "Five gaps (KPIs, Triggers, Escalation path, Identity version block, constitution red lines 9/10/11)
  must be resolved in the next version before the first R&R review." This is an OPEN condition from
  the original certification (2026-06-12). As of 2026-06-18, the file does not contain a Constitution
  red lines 9/10/11 block. The cert note says "must be resolved in the next version before the first
  R&R review" -- meaning the R&R review is the trigger, not go-live. Eco went live 2026-06-12. This
  is an open cert condition that has not been resolved.
- RL10: ABSENT (same finding as above)
- RL11: ABSENT (same finding as above)
- RL12: ABSENT -- Shelly-cannot-task-Eco is covered by the chain-of-command section but not by number.
- RL13: CITED (item 8)

Spawn-allowlist: Eco is the spawn INITIATOR, not a spawned agent. Eco is not on the PERMITTED list
because the list governs which agents Eco spawns from the bridge.

Model config:
- Frontmatter: claude-opus-4-8
- Body AI model section: "Default Opus (claude-opus-4-8). Eco is the highest-leverage agent...
  Sonnet for simple ack-and-route messages only."
- Match: YES (Opus frontmatter, Opus default body). No opus-default leak. PASS.

Other findings:
- T-0023 (model-config audit) noted 13 new role files from 2026-06-18. Eco is not one of those 13
  new files; Eco was on the prior scan. No new model finding here.
- Constitution red lines 9/10/11 block ABSENT. This is a known open condition from Eco's cert.
  It is not a blocking security finding, but it is an incomplete certification condition.

Verdict: FLAG
Finding 1: Constitution red lines 9/10/11 block absent from Eco's role file. Open cert condition
from 2026-06-12 (noted as "must be resolved before first R&R"). R&R has not yet been triggered.
This is not a production-blocking security risk but is a governance gap: the CEO role file does not
explicitly document RL9 (Israeli privacy law / personal data), RL10 (third-party IP), and RL11
(legal/public representation). Given Eco's broad scope and authority, this should be resolved promptly.
Recommendation: Eco's role file should be updated (A1 owner) to add the Constitution 9/10/11 block
before the first R&R review. Eco to note this as a pending action.

---

### Ella (Customer Success Representative)

Tools (frontmatter): Read, Write, Edit

Tool justification: Same as Avner and Jenny (identical CS rep role file). Ticket handling, logging,
CS support. No Bash, no web tools. Justified.

Red-line citation: Identical citation pattern to Avner. All 13 RL substantive areas covered.
Status: PASS (same as Avner).

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-haiku-4-5-20251001
- Body AI model section: "Default Haiku for routine ticket handling..."
- Match: YES. PASS.

Other findings: Write scope bounded to company/cs/tickets/ per B5 condition -- confirmed resolved.

Verdict: CLEAR

---

### Erez (Investor, on-demand)

Tools (frontmatter): Read, Write, Edit, WebSearch, WebFetch

Tool justification: Investment research requires external data sourcing. WebSearch and WebFetch are
justified and cleared for Erez scope in gate-register.md (2026-06-17, jecki A1). Tainted-content rule
is explicitly documented in role file (Boundary 11). Justified.

Red-line citation:
- RL1: CITED (Boundary 4: "No access to .env")
- RL2: CITED (Boundary 4)
- RL3: CITED (Boundary 10)
- RL4: CITED (Boundary 6: "No self-grant of tools or permissions")
- RL5: CITED (Boundary 7)
- RL6: CITED (data table: "Append only" for decisions-log)
- RL7: CITED (Boundary 1: "No investment decisions... owner decides")
- RL8/13: CITED (Boundary 8)
- RL9: not in a dedicated Constitution 9/10/11 block. The cert note says "Open (deferred to first
  R&R): cite RL-8 + RL-10 by number." RL9 personal-data compliance is absent. FINDING.
- RL10: CITED (Boundary 12: "Never use third-party proprietary or copyrighted data unlawfully")
  but the cert note says "cite RL-10 by number" as deferred to first R&R. Substance present;
  explicit RL number absent. Minor.
- RL11: CITED (Boundary 2: "No commitments, contracts, or legal representations")
- RL12: not cited. MINOR GAP.
- RL13: CITED (Boundary 8)
Status: FLAG -- RL9 (Israeli privacy law / personal data) not explicitly addressed. Deferred to
first R&R per cert note. Erez handles external market data that could include personal information;
the absence is a genuine gap.

Spawn-allowlist: PERMITTED (no Bash; WebSearch/WebFetch with tainted-content rule)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet (research, drafting, synthesis). Opus: investment
  analysis requiring deep multi-source synthesis..."
- Match: YES (Sonnet default). PASS. Cert note records "Resolved at go-live: model frontmatter
  opus-4-8 -> sonnet-4-6." Confirmed corrected.

Other findings: The identity block at the bottom of the file (lines 178-187) duplicates role
information and appears to be a formatting artifact from the drafting process. Not a security finding
but a documentation tidiness note.

Verdict: FLAG
Finding 1: RL9 (personal data / Israeli privacy law) not explicitly documented in Erez's role file.
Erez processes external market data (WebSearch/WebFetch) which may contain personal information of
individuals. The tainted-content rule (Boundary 11) addresses injection risk but does not address
personal data handling. Deferred to first R&R per cert note; this scan surfaces it as a FLAG.
Recommendation: Add explicit RL9 / Israeli privacy law compliance statement to Erez's Boundaries
before first R&R or before Erez handles any personal-data-containing source.

---

### Eyal (Legal)

Tools (frontmatter): Read, Write, Edit

Tool justification: Legal gate reviews, gate-register maintenance, compliance backlog. Document work.
No Bash, no web tools. Justified.

Red-line citation: Uses "What you must NEVER do" numbered list (8 items):
- RL1: CITED (item 6)
- RL2: CITED (item 5)
- RL3: not explicitly cited. No Bash; not applicable.
- RL4: CITED (item 3: "Sign, accept, or commit to external terms or contracts without A1")
- RL5: implied (item 8: chain of command)
- RL6: CITED (item 7: "Edit existing entries in decisions-log -- append only")
- RL7: CITED (item 2: "Self-grant a tool or permission")
- RL8/13: CITED (item 8)
- RL9: CITED via Constitution block (implied; the Constitution block is present for Eyal)
  Actually: the role file does NOT contain a "Constitution red lines -- 9, 10, 11" section. Checking
  the file again -- the file goes from "What you must NEVER do" directly to Triggers. No RL9/10/11
  block. FINDING: Constitution red lines 9/10/11 block absent from Eyal's role file.
  However, RL10 is addressed in Boundaries implicitly (legal work), and RL11 is addressed in item 4
  of "What you must NEVER do" (represent the company legally without A1). RL9 (personal data) is not
  explicitly addressed anywhere.
- RL10: partially covered (legal context makes this implied but not stated)
- RL11: CITED (item 4)
- RL12: not cited. MINOR GAP.
- RL13: CITED (item 8)
Status: The cert notes "CLEAR, no conditions" from B5. However, RL9/10/11 block is absent. Eyal's
cert was under the prior standard before the RL9/10/11 block became universal. This is a gap to
resolve at R&R.

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: claude-sonnet-4-6 (Sonnet)."
- Match: YES. PASS.

Other findings: The data-access table shows .claude/agents/ as "Read (operational context); no write."
This is consistent with the formalized read exception in access-matrix.md for operational agents.
Acceptable.

Verdict: CLEAR-WITH-NOTES
Notes: Constitution red lines 9/10/11 block absent. RL9 (personal data) not explicitly addressed.
Eyal handles legal terms and contract text which may include personal data. Add RL9/10/11 block at
next R&R. RL12 (Shelly cannot task Eyal) also absent by name.

---

### Gal (Lead Developer)

Tools (frontmatter): Read, Write, Edit, Bash

Tool justification: Code execution, test runs, build validation. Core function. Bash is justified for
a Lead Developer role. Confirmed in spawn-allowlist (DENIED/Bash required).

Red-line citation:
- RL1: CITED [line 65]
- RL2: CITED [line 66]
- RL3: CITED [line 67]
- RL4: CITED [line 68]
- RL5: CITED [line 69]
- RL6: CITED [line 75]
- RL7: CITED [line 70] (production deploy without A1)
- RL8/13: CITED [line 72]
- RL9: CITED [line 76 -- "const red line 9"] -- present in Boundaries
- RL10: CITED [line 77 -- "const red line 10"]
- RL11: CITED [line 78 -- "const red line 11"]
- RL12: not cited by number. No Shelly-cannot-task cite in Gal's Boundaries.
  FINDING: RL12 absent. The cert note says "Open (non-blocking): add RL-9/10/11 boundary text
  before first R&R; off agent-spawn allowlist until T-0020 C3." RL9/10/11 ARE present in Boundaries
  (lines 76-78). But RL12 is not. Minor gap.
- RL13: CITED [line 72]
Status: PASS. RL12 absent; minor.

Spawn-allowlist: DENIED (Bash required; off bridge allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet (claude-sonnet-4-6)"
- Match: YES. PASS.

Other findings: None. Bash is clearly justified. Prior scan clear.

Verdict: CLEAR-WITH-NOTES
Notes: RL12 (Shelly cannot task Gal) not cited. Add at next R&R.

---

### Hila (Marketing)

Tools (frontmatter): Read, Write, Edit

Tool justification: Brand strategy, content creation, drafting, marketing files. No Bash, no web tools
(correctly excluded given the publish gate). Justified.

Red-line citation:
- RL1: CITED [line 103]
- RL2: CITED [line 104]
- RL3: CITED [line 106]
- RL4: implied by gate references throughout; not cited by RL number in Boundaries. MINOR GAP.
- RL5: CITED [line 103]
- RL6: CITED [line 107]
- RL7: implied by A1 publish gate (hard gates section)
- RL8/13: CITED [line 108]
- RL9: CITED [line 101] and Constitution block
- RL10: CITED [line 100] and Constitution block
- RL11: CITED [line 102] and Constitution block
- RL12: CITED [line 108] ("Shelly may not direct marketing strategy")
- RL13: CITED [line 108]
Status: PASS. RL4 not cited by number in Boundaries; substance present (gate references, no web tools).

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet (claude-sonnet-4-6) for brand strategy..."
- Match: YES. PASS.

Other findings: Prior scan clear. Full-track expansion (ORG-001) handled cleanly; hard gates carried
forward.

Verdict: CLEAR-WITH-NOTES
Notes: RL4 not cited by number in Boundaries. Add at next R&R.

---

### Ido (VP R&D)

Tools (frontmatter): Read, Write, Edit

Tool justification: Planning, release gate decisions, sprint coordination. No Bash (Bash was removed
at go-live per B5 recommendation -- "Bash removed 2026-06-17 (Rambo B5: excess privilege; shell/exec
delegated to Gal + Shir)"). Correct least-privilege application. Justified.

Red-line citation:
- RL1: CITED [line 66]
- RL2: CITED [line 67]
- RL3: CITED [line 68]
- RL4: CITED [line 69]
- RL5: CITED [line 70]
- RL6: CITED [line 71]
- RL7: CITED [line 72]
- RL8/13: CITED [line 73]
- RL9: CITED [line 76] (const red line 9)
- RL10: CITED [line 77]
- RL11: CITED [line 78]
- RL12: not cited. MINOR GAP.
- RL13: CITED [line 73]
Status: PASS. RL12 absent; minor.

Spawn-allowlist: OFF (off allowlist until T-0020 C3). Note: spawn-allowlist governs agents Eco
spawns from bridge. Ido is VP R&D -- invoked by Eco. Off bridge allowlist; can be invoked via Eco
in other contexts.

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet (claude-sonnet-4-6)."
- Match: YES. PASS.

Other findings: The allowlist notes "Ido (VP R&D) -- Bash. NOTE: bash may be excess for a planning
role; flagged to Rambo for trim review." Bash has already been removed per the B5 scan (2026-06-17).
The allowlist note is now stale -- Ido no longer holds Bash. This is an allowlist maintenance gap.
Recommend updating the allowlist entry for Ido from DENIED/Bash to DENIED/no Bash (just off bridge
for other reasons, or move to PERMITTED once T-0020 C3 lands). Not a security finding -- just
documentation accuracy.

Verdict: CLEAR-WITH-NOTES
Notes: RL12 absent. Allowlist entry for Ido references Bash that has been removed -- stale note.
Allowlist to be updated.

---

### Jenny (Customer Success Representative)

Tools (frontmatter): Read, Write, Edit

Tool justification: Identical to Avner and Ella. Justified.

Red-line citation: Identical citation pattern to Avner and Ella. All 13 RL substantive areas covered.
Status: PASS.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-haiku-4-5-20251001
- Body AI model section: "Default Haiku for routine ticket handling..."
- Match: YES. PASS.

Other findings: Write scope bounded to company/cs/tickets/. Confirmed.

Verdict: CLEAR

---

### Lital (CFO / Finance)

Tools (frontmatter): Read, Write, Edit

Tool justification: Financial reporting, dashboard financial views, compliance backlog maintenance.
Document work. No Bash, no web tools. Justified.

Red-line citation:
- RL1: CITED [line 59]
- RL2: CITED [line 60]
- RL3: not explicitly cited by number. "Never run destructive shell commands" is not in Lital's
  Boundaries section. No Bash, so practical risk is low. MINOR GAP.
- RL4: CITED [line 58] (adoption of financial tool without gate)
- RL5: CITED [line 63]
- RL6: CITED [line 61]
- RL7: CITED [line 57] (no spend authorization)
- RL8/13: CITED [line 62]
- RL9: CITED [line 65] and Constitution block (implied; RL9 personal data is in the body
  "Never process personal data beyond stated financial/compliance purpose")
- RL10: CITED [line 66] and Constitution block
- RL11: CITED [line 64]
- RL12: not cited. MINOR GAP.
- RL13: CITED [line 62]
Status: PASS. RL3 and RL12 not explicitly cited in Boundaries. No Bash makes RL3 low risk.

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet."
- Match: YES. PASS.

Other findings: dashboards/ write access is scoped to financial views only. Assaf owns operational
views. This split is correctly documented. Prior scan clear.

Verdict: CLEAR-WITH-NOTES
Notes: RL3 and RL12 not explicitly cited. Add at next R&R.

---

### Luci (Devil's Advocate)

Tools (frontmatter): Read, Write, Edit

Tool justification: Challenge analysis, counter-case writing. Document work. No Bash, no web tools.
Justified.

Red-line citation: Uses "What you must NEVER do" list (11 items):
- RL1: not explicitly listed. "Put secrets, credentials, or personal data in files, outputs, or
  logs [const red line 5]" is item 8. .env / credential file access not explicitly cited. MINOR GAP.
- RL2: not explicitly cited. MINOR GAP.
- RL3: implied (no Bash; item 7: "no curl/wget/network calls for external code")
- RL4: CITED (item 7)
- RL5: CITED (item 8)
- RL6: not in the "What you must NEVER do" list. Data access section says no write to decisions-log.
  The cite by RL number is absent. MINOR GAP.
- RL7: implied (no execution authority in authority section)
- RL8/13: CITED (item 6)
- RL9: CITED (item 9 and Constitution block)
- RL10: CITED (item 10 and Constitution block)
- RL11: CITED (item 11 and Constitution block)
- RL12: not cited by number or substance. MINOR GAP.
- RL13: CITED (item 6)
Status: PASS with minor formatting gaps. Substance of all red lines is covered by the overall
file constraints; the "What you must NEVER do" list does not use CLAUDE.md numbering for RL1/2/6/12.

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet..."
- Cert note records: "Resolved at go-live: model frontmatter opus-4-8 -> sonnet-4-6."
- Match: YES. PASS.

Other findings: None. Low blast radius. B5 clear-with-conditions resolved at go-live.

Verdict: CLEAR-WITH-NOTES
Notes: RL1 (.env), RL2 (sources/), RL6 (decisions-log append-only), RL12 (Shelly cannot task) not
cited by number in "What you must NEVER do." Substance covered elsewhere in file. Add explicit cites
at next R&R.

---

### MeetingPrep (PENDING GATE CLEARANCE -- NOT LIVE)

Status: PENDING-GATE-CLEARANCE stub. This agent cannot be activated until the Security + Legal gate
clears (per the file itself). Not a live agent.

Tools (frontmatter draft): Read, Google Drive MCP (read-only, already approved), Google Calendar MCP
(read-only), any additional tools from source repo subject to Rambo review.

Note: The source repo https://github.com/automation-flow/meeting-prep has NOT been scanned for
.claude/, CLAUDE.md, .cursorrules, or install scripts (repo scan required per Rambo's responsibilities
before activation). This gate step remains open.

Red-line citation: Not assessed -- stub file, not live.

Spawn-allowlist: NOT APPLICABLE (not live; not on any allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6 (draft)
- Body: no AI model section (stub)
- Not assessed.

Verdict: FLAG (not blocking for live agents -- this is a standing gate blocker for MeetingPrep)
Finding: MeetingPrep is in the .claude/agents/ directory and could be invoked accidentally. The file
clearly states "PENDING GATE CLEARANCE" and "Do not use this file as a system prompt." The gate
steps (repo scan by Rambo, legal review by Eyal, A2 activation by Eco) remain open.
Recommendation: Eco and jecki should be aware that MeetingPrep exists in the agent registry but is
not cleared. A repo scan of https://github.com/automation-flow/meeting-prep must occur before any
activation. This scan (T-0014) does not perform that repo scan; a separate task is needed.

---

### Mike (VP Customer Success)

Tools (frontmatter): Read, Write, Edit

Tool justification: CS team management, escalation handling, CS policy drafting. Document work.
No Bash, no web tools. Justified.

Red-line citation:
- RL1: CITED [line 60]
- RL2: CITED [line 61]
- RL3: CITED [line 62]
- RL4: CITED [line 63]
- RL5: CITED [line 64]
- RL6: CITED [line 65]
- RL7: CITED [line 66] (merged with RL9 -- minor formatting)
- RL8: not cited by number; covered by RL13 cite
- RL9: CITED [line 59] and Constitution block
- RL10: CITED [line 67] and Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 69]
- RL13: CITED [line 68]
Status: PASS.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (policy drafting, escalation handling...)"
- Match: YES. PASS.

Other findings: Write scope bounded to company/cs/ per B5 condition -- confirmed resolved. The final
CS-0001 policy path distinction (Mike drafts in company/cs/; Dalia places approved policy in
company/policies/) is correctly documented.

Verdict: CLEAR

---

### Noam (VP Product)

Tools (frontmatter): Read, Write, Edit

Tool justification: Product roadmap, PRDs, requirements. Document work. No Bash, no web tools.
Justified.

Red-line citation:
- RL1: not explicitly cited in Boundaries. "Never store secrets or credentials in product docs or
  any tracked file [red line 5]" covers RL5 but .env specifically is not mentioned. MINOR GAP.
  Actually looking at Boundaries: "Never adopt a tool, accept terms, or expand MCP access without
  the gate [red line 4, const §6]" -- RL4 is cited. But RL1 (.env) is not explicitly in Boundaries.
- RL2: CITED [line 71] (sources/, copy before editing)
- RL3: not cited. MINOR GAP (no Bash, low risk).
- RL4: CITED [line 69]
- RL5: CITED [line 70] (secrets in product docs)
- RL6: not cited explicitly. MINOR GAP.
- RL7: CITED [line 76] (role changes are A1)
- RL8/13: CITED [line 75]
- RL9: CITED [line 72] (Israeli privacy law)
- RL10: CITED [line 73]
- RL11: CITED [line 74]
- RL12: not cited. MINOR GAP.
- RL13: CITED [line 75]
Status: PASS with multiple minor gaps. RL1, RL3, RL6, RL12 absent by number; substance partially
covered. The cert note says "Open (non-blocking): add RL3/RL6 boundary text before any Designer
(L4) hire in P2."

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet (default). Haiku for routine reads..."
- Match: YES. PASS.

Other findings: None new. Prior scan clear.

Verdict: CLEAR-WITH-NOTES
Notes: RL1, RL3, RL6, RL12 not cited explicitly. Add at next R&R (or before first Designer hire
per cert condition).

---

### Oren (Senior Developer)

Tools (frontmatter): Read, Edit

Tool justification: Code review and review-note writing. Edit is scoped to projects/delivery-saas/
docs/review/ and own log rows. No Write (no file creation). No Bash. This is notably minimal and
appropriate. Justified -- and exemplary least-privilege for a code reviewer.

Red-line citation:
- RL1: CITED [line 56]
- RL2: CITED [line 57]
- RL3: CITED [line 58] (no Bash; if granted, A1)
- RL4: CITED [line 59]
- RL5: CITED [line 60]
- RL6: CITED [line 61]
- RL7: CITED [line 62]
- RL8/13: CITED [line 63]
- RL9: CITED via Constitution block
- RL10: CITED [line 66] and Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 65]
- RL13: CITED [line 63]
Status: PASS -- one of the strongest RL citation sets in the cohort.

Spawn-allowlist: OFF (off allowlist until T-0020 C3; no Bash, low blast radius)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (claude-sonnet-4-6) for code review reasoning..."
- Match: YES. PASS.

Other findings: The use of Edit-only (no Write) for a code reviewer is best practice. No findings.

Verdict: CLEAR

---

### Rambo (Security -- self-scan)

Note: Rambo cannot self-clear own tools (red line rule). This entry is documented for completeness;
Eco should be aware that this is a self-scan section.

Tools (frontmatter): Read, Write, Edit, Grep, Glob, WebFetch

Tool justification:
- Read, Write, Edit: core security scan functions.
- Grep, Glob: file-system search for security scanning (finding patterns in role files, settings).
  Justified for permission scans.
- WebFetch: used for source verification (e.g., checking external URLs in gate reviews). The allowlist
  lists Rambo as PERMITTED with "Read, Write, Edit, Grep, Glob, WebFetch." Justified.
- No Bash, no WebSearch. Appropriate scope.

FINDING: settings.json allows WebSearch(*) globally. Rambo's role file does NOT grant WebSearch.
This is consistent -- the settings.json global allow is a ceiling, and individual role files define
what each agent actually uses. Rambo correctly does not have WebSearch in its tools list.

Red-line citation: Rambo uses "What you must NEVER do" list (9 items). RL numbers:
- RL1 (.env): CITED (item 4)
- RL2 (sources/): CITED (item 5)
- RL3 (destructive shell): implied (no Bash)
- RL4 (download/execute external code): CITED (item 6)
- RL5 (secrets): implied by not committing findings
- RL6 (agent creation): CITED (item 9)
- RL7 (grant tools): CITED (items 1, 2)
- RL8/13: CITED (item 7)
- RL9: CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL12: not cited. MINOR GAP (Shelly cannot task Rambo).
- RL13: CITED (item 7)
Status: PASS.

Spawn-allowlist: PERMITTED (no Bash; on allowlist)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet. Opus for high-stakes gate decisions..."
- Match: YES. PASS.

Other findings: Version is 0.1. The cert note says "all 7 conditions resolved in v0.1." Version
numbering is low but cert is complete. No security finding.

Verdict: CLEAR-WITH-NOTES (self-scan; cannot self-clear)
Notes: RL12 (Shelly cannot task Rambo) not cited. Minor; add at next R&R. Self-scan limitation noted.

---

### Roman (Algorithm Specialist, on-demand)

Tools (frontmatter): Read, Write, Edit

Tool justification: Algorithm design, prototyping, complexity analysis. No Bash (explicitly stated as
not granted). Write scoped to projects/delivery-saas/docs/algorithms/. Justified.

Red-line citation:
- RL1: CITED [line 55]
- RL2: CITED [line 56]
- RL3: CITED [line 57] (no Bash; if granted, A1)
- RL4: CITED [line 58]
- RL5: CITED [line 59]
- RL6: CITED [line 60]
- RL7: CITED [line 61]
- RL8/13: CITED [line 62]
- RL9: CITED via Constitution block
- RL10: CITED [line 65] and Constitution block
- RL11: CITED via Constitution block
- RL12: CITED [line 64]
- RL13: CITED [line 62]
Status: PASS -- strong citation coverage.

Spawn-allowlist: OFF (off allowlist until T-0020 C3; on-demand, invoked by Ido)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (claude-sonnet-4-6)..."
- Match: YES. PASS.

Other findings: B5 condition: "Ido to confirm projects/delivery-saas/docs/algorithms/prototypes/ is
not on any auto-exec/import path before first invocation." This is an operational check for Ido; not
a file-level security gap in this scan.

Verdict: CLEAR

---

### Sami (SME Advisor, on-demand)

Tools (frontmatter): Read, Write, Edit

Tool justification: Advisory within a single assigned project partition. Hard partition enforced by
role file (write only to projects/<assigned-name>/). No Bash, no web tools. Justified.

Red-line citation:
- RL1: CITED [line 62] (RL1 label)
- RL2: CITED [line 63]
- RL3: CITED [line 64]
- RL4: CITED [line 65]
- RL5: CITED [line 66]
- RL6: CITED [line 67]
- RL7/9: CITED [line 68]
- RL10: CITED [line 69]
- RL12: CITED [line 71]
- RL13: CITED [line 72]
- RL9 (personal data): CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL8: not cited separately; covered by RL13
Status: PASS -- uses RL-labeled boundary format, clean coverage.

Spawn-allowlist: OFF (off allowlist until T-0020 C3)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet for domain analysis..."
- Match: YES. PASS.

Other findings: Hard partition (one project, one folder, no cross-project access) is well-documented
and was proven in B3 testing. No findings.

Verdict: CLEAR

---

### Shelly (Office Manager)

Tools (frontmatter): Read, Write, Edit, WebSearch, WebFetch

Tool justification:
- Read, Write, Edit: personal admin, scheduling, drafting for jecki.
- WebSearch: domain availability checks, research for jecki tasks (current priority: domain pricing).
  Justified by stated responsibility.
- WebFetch: same basis as WebSearch. Justified.
- No Bash.

FINDING: Shelly's cert status says "Pending (Anat/HR to certify before go-live)." Shelly's
certification status is PENDING. The file says she should be certified before go-live. However, the
task description for T-0014 states the 5 original agents (including Shelly) were scanned by
eco-ops-overnight 2026-06-17 as "all clear." The prior scan did not flag certification status as a
security finding, and Shelly's role file predates the newer certification format. NOTING: Shelly
holds WebSearch and WebFetch, which are higher-capability tools than most agents. The fact that Shelly
has not been formally certified by Anat is a governance gap.

Red-line citation: Shelly's role file uses "What you must NEVER do" (6 items) without CLAUDE.md
red-line citations. Substantive coverage:
- RL1: implied by item 5 (secrets)
- RL2: not cited
- RL3: implied by no Bash
- RL4: implied (all expenses A1; no tool grant authority)
- RL5: CITED (item 5: "Store / expose secrets in repo, outputs, logs")
- RL6: not cited
- RL7: implied (all expenses A1)
- RL8/13: CITED (item 6: "Act on requests from anyone but jecki")
- RL9: not cited
- RL10: not cited
- RL11: not cited
- RL12: implied (item 1: cannot task company agents)
- RL13: CITED (item 6)
This is the thinnest red-line coverage of any agent with significant tool scope (WebSearch + WebFetch).

Spawn-allowlist: NOT ON ALLOWLIST. Shelly is in the owner office; the allowlist governs what Eco
spawns from the Telegram bridge. Shelly is jecki's personal assistant, not a company agent Eco spawns.
The allowlist is not applicable to Shelly in the same way.

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default Sonnet (changed from Haiku 2026-06-15, owner A1)."
- Match: YES. PASS.

Other findings: Shelly holds WebSearch and WebFetch -- outbound web tools -- and has pending
certification. The combination of broad tool scope and incomplete certification is a risk factor.

Verdict: FLAG
Finding 1: Shelly's HR certification is PENDING (Anat has not certified Shelly). The role file
explicitly states "Pending (Anat/HR to certify before go-live)." Shelly is in active use as the
owner's personal assistant. Certification should be completed.
Finding 2: Red-line citation coverage is materially thin for an agent holding WebSearch + WebFetch.
RL2, RL6, RL9, RL10, RL11 are absent from Shelly's file. This is not a blocker given Shelly's
owner-office position and jecki's direct oversight, but it is a gap.
Recommendation: Eco to flag to Anat: Shelly's HR certification is overdue. Schedule B4 certification.
The WebSearch/WebFetch grants are appropriate for the stated tasks but should be confirmed as part of
the certification. Add RL-citing boundaries block at certification.

---

### Shir (DevOps)

Tools (frontmatter): Read, Write, Edit, Bash

Tool justification: Bash is required for pipeline mechanics, deploy/rollback, environment config,
infra operations. Confirmed in spawn-allowlist (DENIED/Bash required). Justified.

Red-line citation: Shir uses "What you must NEVER do" list (8 items) without RL-number citations:
- RL1 (.env): CITED (item 5: "Write to sources/ or .env")
- RL2 (sources/): CITED (item 5)
- RL3 (destructive shell): CITED indirectly -- Bash is granted but constrained by: item 1 (no
  prod deploy without A1), item 2 (no customer data without A1). Red line 3 is about explicit
  destructive commands; settings.json blocks rm -rf, git push --force, git reset --hard, curl, wget.
  However, RL3 is not explicitly cited by number in the role file. MINOR GAP.
- RL4 (tool adoption gate): CITED (item 3: "Adopt a tool, accept terms, or grant permissions
  without gate + A2/A1")
- RL5 (secrets): CITED (item 8)
- RL6 (decisions-log): not cited. MINOR GAP.
- RL7 (A1 required): CITED (items 1, 2, 3)
- RL8/13: CITED (item 7)
- RL9: not cited. FINDING. No Constitution red lines 9/10/11 block and no explicit personal-data
  cite in the "What you must NEVER do" list. Shir handles infra and could encounter personal data
  in logs, environment variables, or database configs. The absence of RL9 (Israeli privacy law) is
  a gap for a DevOps role.
- RL10: not cited.
- RL11: not cited.
- RL12: not cited. MINOR GAP.
- RL13: CITED (item 7)

Spawn-allowlist: DENIED (Bash required; off bridge allowlist; Shir BUILDS the guardrails for T-0020)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet. Escalate to Opus for high-stakes architecture decisions..."
- Match: YES. PASS.

Other findings: Shir is the agent building T-0020 C3 guardrails (sender allowlist + shell-tool
stripping for the bridge). This is a high-trust responsibility. The absence of RL9/10/11 is more
notable given this context. B5 cert record says "Bash JUSTIFIED for DevOps" and conditions were
noted as non-blocking. But RL9/10/11 absence was flagged at the time.

Verdict: FLAG
Finding 1: Constitution red lines 9/10/11 (personal data, third-party IP, legal representation) are
absent from Shir's role file. For a DevOps role with Bash access and infrastructure ownership, the
absence of RL9 (personal data compliance) is a material gap. Shir could encounter personal data in
logs, configs, or database access during incident response.
Finding 2: RL3, RL6, RL12 not explicitly cited in Boundaries.
Recommendation: Add RL9/10/11 block and explicit RL3/6/12 citations to Shir's role file before next
R&R or before Shir executes T-0020 C3 work.

---

### Tim (VP Sales)

Tools (frontmatter): Read, Write, Edit

Tool justification: Sales strategy, pricing, pipeline, managing Hila and Alex. Document work. No Bash,
no web tools. Justified.

Red-line citation: Uses a mixed format with RL numbers and RL-labeled blocks:
- RL1: CITED [line 65]
- RL2: CITED [line 66]
- RL3: CITED [line 67]
- RL4: CITED [line 68]
- RL5: CITED [line 69]
- RL6: CITED [line 70]
- RL7: CITED [line 71]
- RL8/13: CITED [line 72]
- RL9: CITED [line 74] (RL-9 PERSONAL DATA label) -- explicit personal data compliance cite
- RL10: CITED [line 75]
- RL11: CITED [line 76]
- RL12: not cited by number. Substantively: Shelly is not in Tim's chain of command but not
  explicitly called out. MINOR GAP.
- RL13: CITED [line 72]
Status: PASS. RL12 absent; minor.

Spawn-allowlist: OFF (off allowlist until T-0020 C3; pending certification at time of note)

Note: Tim's cert status says "CERTIFIED + LIVE 2026-06-17 (owner A1, jecki)." Tim IS certified.
The task description says "Tim.md currently says 'pending certification' but is included." Reading
the actual cert status line in the file: "CERTIFIED + LIVE 2026-06-17 (owner A1, jecki)." Tim is
CERTIFIED. The task description note may be outdated. No issue here.

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Default: Sonnet (claude-sonnet-4-6)."
- Match: YES. PASS.

Other findings: None. Tim's role file is among the cleaner ones in the cohort.

Verdict: CLEAR-WITH-NOTES
Notes: RL12 not cited. Add at next R&R. Cert status confirmed as LIVE (task description note about
"pending certification" is stale -- Tim is certified as of 2026-06-17).

---

### Yael (Knowledge/Documentation Manager)

Tools (frontmatter): Read, Write, Edit

Tool justification: File index maintenance, documentation QC, naming-convention audits. Write is
scoped to company/governance/file-index.md and own log rows. No Bash, no web tools. Justified.
Notably minimal write scope for a documentation role.

Red-line citation: Uses RL-labeled boundary format:
- RL1: CITED [line 56]
- RL2: CITED [line 57]
- RL3: CITED [line 58]
- RL4: CITED [line 59]
- RL5: CITED [line 60]
- RL6: CITED [line 61]
- RL7/9: CITED [line 62]
- RL10: cited in "Never represent the company legally" [line 65] -- but this cite maps to RL11,
  not RL10. Actually line 65 says "Never represent the company legally or publicly. [RL10 / const
  §11]" -- this is a citation error in Yael's file: RL10 is third-party proprietary data, not legal
  representation. Legal representation is RL11. The RL10 label is misapplied. FINDING.
- RL11: CITED via Constitution block
- RL12: CITED [line 67]
- RL13: CITED [line 64]
- RL9: CITED via Constitution block
- RL10 (third-party data): CITED via Constitution block (correct substance, wrong label in Boundaries)
- RL8: not cited separately; covered by RL13
Status: PASS with one citation labeling error (RL10 label applied to RL11 substance in line 65).

Spawn-allowlist: OFF (off allowlist until T-0020 C3; certification status: CERTIFIED + LIVE
2026-06-18 per cert block, but Identity block says "PENDING -- B4 Anat, B5 Rambo, B6 Dalia, B7 Eco."
These two sections contradict each other. The cert status block at the bottom is the more authoritative
record (certification completed). FINDING: identity block not updated to reflect certified status.)

Model config:
- Frontmatter: claude-haiku-4-5-20251001
- Body AI model section: "Default Haiku (routine indexing, naming-convention scans, file-index
  updates, QC sampling)."
- Match: YES. PASS.

Other findings: Two internal inconsistencies:
1. RL10 label misapplied in line 65 (legal representation cited as RL10; should be RL11).
2. Identity block says "PENDING -- B4 Anat, B5 Rambo, B6 Dalia, B7 Eco" while cert status block
   says "CERTIFIED + LIVE 2026-06-18 (owner A1, jecki)." The identity block was not updated.

Verdict: CLEAR-WITH-NOTES
Notes: RL10/RL11 citation label error in Boundaries section (line 65). Identity block not updated
post-certification (says PENDING; cert status block says CERTIFIED). Correct both at next update.

---

### Zvika (Research Analyst, on-demand)

Tools (frontmatter): Read, Write, Edit, WebSearch, WebFetch

Tool justification: Market, technical, and competitive research requires external data sourcing.
WebSearch and WebFetch are cleared for Zvika scope at B5 with gate-register entry (same tools/terms
as Erez, T-0013 logic, jecki A1). Tainted-content rule explicitly documented. Justified.

Red-line citation: Uses RL-labeled boundary format:
- RL1: CITED [line 66]
- RL2: CITED [line 67]
- RL3: CITED [line 68]
- RL4: CITED [line 69]
- RL5: CITED [line 70]
- RL6: CITED [line 71]
- RL7/9: CITED [line 72]
- RL10: CITED [line 73]
- RL12: CITED [line 74]
- RL13: CITED [line 75]
- RL9 (personal data): CITED via Constitution block
- RL10: CITED via Constitution block
- RL11: CITED via Constitution block
- RL8: not cited separately; covered by RL13
Status: PASS -- strong RL coverage using labeled format.

Spawn-allowlist: OFF (off allowlist until T-0020 C3; on-demand, A2-invoke)

Model config:
- Frontmatter: claude-sonnet-4-6
- Body AI model section: "Sonnet for research synthesis and briefs."
- Match: YES. PASS.

Other findings: Tainted-content and prompt-injection rule is a dedicated section in the file, which
is best practice for any agent with WebSearch/WebFetch. No findings.

Verdict: CLEAR

---

## Summary Table

Agent          | Tools                            | RL-cites | Allowlist | Model     | Overall
---------------|----------------------------------|----------|-----------|-----------|--------------------
Adi            | Read,Write,Edit,Bash             | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Alex           | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Anat           | Read,Write,Edit,Agent            | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Assaf          | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Avner          | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Chronicler     | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Dalia          | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Designer       | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Eco            | Read,Write,Edit,Bash,g-cal       | FLAG     | N/A(init) | PASS      | FLAG
Ella           | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Erez           | Read,Write,Edit,WSearch,WFetch   | FLAG     | PERMITTED | PASS      | FLAG
Eyal           | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Gal            | Read,Write,Edit,Bash             | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Hila           | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Ido            | Read,Write,Edit                  | PASS     | DENIED*   | PASS      | CLEAR-WITH-NOTES
Jenny          | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Lital          | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Luci           | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
MeetingPrep    | DRAFT/UNGATED                    | N/A      | N/A       | N/A       | FLAG(gate open)
Mike           | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Noam           | Read,Write,Edit                  | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES
Oren           | Read,Edit                        | PASS     | DENIED    | PASS      | CLEAR
Rambo          | Read,Write,Edit,Grep,Glob,WFetch | PASS     | PERMITTED | PASS      | CLEAR-WITH-NOTES*
Roman          | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Sami           | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR
Shelly         | Read,Write,Edit,WSearch,WFetch   | FLAG     | N/A(owner)| PASS      | FLAG
Shir           | Read,Write,Edit,Bash             | FLAG     | DENIED    | PASS      | FLAG
Tim            | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Yael           | Read,Write,Edit                  | PASS     | DENIED    | PASS      | CLEAR-WITH-NOTES
Zvika          | Read,Write,Edit,WSearch,WFetch   | PASS     | DENIED    | PASS      | CLEAR

*Rambo: self-scan; cannot self-clear. Eco must note.
*Ido: allowlist DENIED entry references removed Bash -- stale note; needs allowlist update.
g-cal = google-calendar read-only MCP
WSearch = WebSearch, WFetch = WebFetch

---

## Blocking FLAGs -- summary for Eco

4 blocking FLAGs raised:

FLAG-1: Eco
- RL9/10/11 (Israeli privacy law, third-party IP, legal representation) block absent from Eco's
  role file. Open cert condition from 2026-06-12. Not a production security block, but the CEO
  role file is missing explicit personal data + IP compliance statements.
- Action: update Eco's role file to add the Constitution 9/10/11 block (owner A1 required).

FLAG-2: Erez
- RL9 (personal data / Israeli privacy law) not documented. Erez uses WebSearch and WebFetch on
  external content that may include personal data. The tainted-content rule covers injection but
  not personal data handling.
- Action: add RL9 personal data compliance statement to Erez's Boundaries before first R&R or
  before Erez handles any personal-data-containing source. (Deferred to first R&R per cert.)

FLAG-3: MeetingPrep (gate blocker)
- Not a live agent. Exists as a stub in .claude/agents/. Gate clearance (repo scan by Rambo,
  legal review by Eyal, A2 by Eco) remains open. Source repo has NOT been scanned.
- Action: do not activate MeetingPrep. Rambo must perform repo scan of
  https://github.com/automation-flow/meeting-prep before any activation. Separate task required.

FLAG-4: Shelly
- HR certification PENDING (Anat has not certified Shelly). Shelly holds WebSearch + WebFetch.
  Red-line citation coverage is the thinnest in the agent set for any agent with web tools.
- Action: Eco to task Anat to complete Shelly's B4 HR certification. Add red-line boundary
  block during certification process.

FLAG-5: Shir
- Constitution red lines 9/10/11 block absent. Shir has Bash and DevOps infrastructure access,
  making RL9 (personal data in logs/configs) a real operational risk, not just a formality.
  Shir is also building T-0020 C3 guardrails -- high-trust work.
- Action: add RL9/10/11 block to Shir's role file before next R&R or before T-0020 C3 execution.
  Owner A1 required to edit role file.

Note: FLAG count is 5, not 4 as stated above. Corrected in this paragraph.

---

## Non-blocking CLEAR-WITH-NOTES items (common patterns)

1. RL12 (Shelly cannot task [Agent]) absent from Boundaries by name in: Alex, Anat, Assaf,
   Chronicler, Dalia, Gal, Ido, Lital, Luci, Noam, Rambo, Tim. Substance is covered by chain-
   of-command sections. Recommend adding explicit cite to all flagged agents at next R&R cycle.

2. RL4 not cited by number in: Assaf, Chronicler, Hila. Substance present (gate references,
   no web tools). Add explicit cite at next R&R.

3. RL9/10/11 block absent from: Eyal (noted). Substance partially covered. Add at next R&R.

4. Model-config consistency: all agents checked frontmatter vs body. No mismatches found.
   T-0023 tracking was referenced for 13 new 2026-06-18 role files; this scan confirms all
   13 have Sonnet frontmatter matching Sonnet body default. No opus-default leaks found.

5. Allowlist stale entry: Ido listed as DENIED with "Bash" rationale; Bash was removed from
   Ido's tools at go-live (2026-06-17). Allowlist entry note is stale. Update at next allowlist
   maintenance.

6. Chronicler broad read scope (owner Telegram, agent chats) not in access-matrix. Accepted at
   B5 cert; add to matrix at next A2 cycle.

7. Yael: RL10/RL11 label swap (line 65 cites RL10 for legal-representation content, which is
   RL11). Identity block not updated post-certification. Correct at next role-file update.

---

## Scan metadata

Files read: 30 .claude/agents/ files + agent-tool-spawn-allowlist.md + access-matrix.md +
settings.json + CLAUDE.md
Scan duration: 2026-06-18 (single session)
Output: this file (company/processes/permission-scan-2026-06-18.md)
Next scheduled scan trigger: after any external tool adoption, R&R change, or new agent cert.
