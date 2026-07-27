# Permission-Drift Scan -- 2026-07-27

Scan type: weekly (Monday)
Scanner: runner invocation 2026-07-27
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md (all 710 lines),
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md
Additional: company/security/reports/permission-drift-2026-07-20.md (prior scan baseline)
GR-009 addendum coverage:
  .mcp.json pin: carried from prior scan (CONFIRMED 2026-07-20)
  guard.py google-boundary constants: carried from prior scan (CONFIRMED 2026-07-20)
  credential-store directory scan: PARTIAL -- Glob of eco-creds succeeded this scan
    (first time readable on runner path). Findings below under BF-3 / GR-009 check.

---

## BLOCKING FLAGS

### BF-1: Agent files in .claude/agents/ with no roster entry (SEVENTH CONSECUTIVE SCAN)

Five agents have certified + live role files absent from company/roster.md (v2.2).
Deadline set at 2026-07-18 scan (2026-07-25) -- TWO DAYS OVERDUE with no remediation.
All five agents are fully operational with no authorization paper trail in the roster.

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; no roster row or pending-section entry |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; no roster row |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | No roster row |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | No roster row |
| Yossi.md | FULLY CERTIFIED 2026-07-14 | Roster section 6 notes gap; no row |

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five rows. Owner A1
required. Coordinate with BF-2 and R-5 in one A1 batch.

---

### BF-2: Roster entries with no matching agent file (name drift) (SEVENTH CONSECUTIVE SCAN)

Three roster rows name agents whose files no longer exist under those names.
Deadline set at 2026-07-18 scan (2026-07-25) -- TWO DAYS OVERDUE.

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | T-0001 VP Product title, owner A1 2026-06-17 |
| Avner (Customer Success) | Jack.md | Renamed + re-scoped v2.0, certified LIVE 2026-06-18 |

ACTION REQUIRED: Anat updates roster rows Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename. Batch with BF-1 and R-5.

---

### BF-3: Credential-store non-token files (GR-009 addendum C2 breach + C3 new findings)

NEW THIS SCAN. Glob of eco-creds succeeded on runner path for the first time.
Credential store: C:\Users\Jecki\.google_workspace_mcp\eco-creds\

Contents found:
| File | Expected? | Status |
|---|---|---|
| eco.synthetic.org@gmail.com.json | YES -- active token | EXPECTED |
| eco-synthetic-audit-mid-summary.pptx | NO -- misplaced document | C2 BREACH -- flagged in GR-009 addendum 2026-07-26; action assigned to Shir/owner; still present one day later |
| eco.synthetic.org@gmail.com.json.old-client.bak | NO -- stale credential backup | NEW FINDING -- backup created during T-0042 OAuth client swap; no longer needed; stale credential artifact per C3 |
| oauth_states.json | AMBIGUOUS -- OAuth state tracking | NEW FINDING -- may be a normal operational file of workspace-mcp; review required |

Rambo cannot access credential directories directly (red line 5; CLAUDE.md). Glob read is a
scan-mode read of file existence only; file contents are NOT inspected.

Condition C2 (GR-009 addendum 2026-07-26): "move the misplaced eco-synthetic-audit-mid-summary.pptx
out of eco-creds/ (Shir/owner)." This is a binding gate condition added 2026-07-26. Still present
2026-07-27. C2 is in breach.

Condition C3 (GR-009 addendum 2026-07-26): "extend the weekly permission-drift scan to flag any
non-token file in a credential-store directory (Rambo)." Two non-token files flagged: the PPTX
(C2 breach) and the .old-client.bak (stale artifact). oauth_states.json is flagged for review.

ACTION REQUIRED:
- Shir/owner: remove eco-synthetic-audit-mid-summary.pptx from eco-creds (C2 close)
- Shir/owner: remove eco.synthetic.org@gmail.com.json.old-client.bak (stale artifact cleanup)
- Shir: confirm whether oauth_states.json is a normal workspace-mcp operational file or a
  stale artifact; document in gate-register or security-baseline

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed (SEVENTH CONSECUTIVE SCAN -- CRITICALLY OVERDUE)

Adi.md description frontmatter reads:
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."
Confirmed by direct read this scan. No CLEAR or CLEAR-WITH-CONDITIONS verdict recorded.
Seventh consecutive scan; 21 days overdue from first flag (2026-07-06).

ACTION REQUIRED: Rambo conducts B5 scrutiny of Adi Bash grant this session. Records verdict
in Adi.md cert block and gate-register. Removes deferred-scrutiny note from description.
Eco to assign IMMEDIATELY -- this is now critically overdue.

### R-3: Yossi guard.py ALLOWED_AGENTS -- AUD-009 STILL OPEN (CARRIED FORWARD)

Yossi is FULLY CERTIFIED + LIVE (2026-07-14). guard.py ALLOWED_AGENTS does not include
"yossi" (confirmed at 2026-07-20 scan). BF-1 roster gap also blocks runner-spawn.
In shadow mode, governed writes log would-DENY but pass. Enforce-mode readiness blocked.

ACTION REQUIRED: Add "yossi" to guard.py ALLOWED_AGENTS and PATH_SCOPE. Resolve BF-1 roster
entry in parallel. Coordinate as AUD-009 closure.

### R-4: Eyal gate-register Agent-tool confirmation (SEVENTH CONSECUTIVE SCAN)

Gate-register "Agent tool (for Eco, Telegram bridge)" Eyal column still reads:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation)"
Eyal has been live since 2026-06-17. Column not updated. Seventh consecutive scan.

ACTION REQUIRED: Eyal records confirmation in gate-register.md (same subscription, no new
vendor terms, no new data pipeline). Eco to task Eyal immediately.

### R-5: Designer persona name "Tal" not in roster (SEVENTH CONSECUTIVE SCAN)

Designer.md persona name confirmed as "Tal" this scan. Roster row still shows "(unnamed)"
and manager field still shows "Noam" (stale -- Perry is current manager per BF-2).

ACTION REQUIRED: Update Designer row in BF-1/BF-2 owner A1 batch: name "(unnamed)" -> "Tal";
manager "Noam" -> "Perry."

### R-8: guard.py allows Noa to spawn -- policy/enforcement gap (CARRIED FORWARD)

guard.py ALLOWED_AGENTS includes "noa" (confirmed 2026-07-20 scan). Noa.md description
still reads "OFF the auto-spawn allowlist until T-0020 C3" (condition stale: T-0020 C3
was resolved 2026-06-28). agent-tool-spawn-allowlist.md PERMITTED list does not name Noa.
Policy and enforcement disagree.

ACTION REQUIRED: Rambo + Anat determine Noa's bridge-path spawn status; align guard.py and
allowlist doc; remove stale "until T-0020 C3" from Noa.md description. Owner A1 if PERMITTED.

### R-9: Credential-store scan -- PARTIAL UPGRADE this scan

R-9 from prior scans noted that the credential store was unreadable on the runner path.
This scan: Glob of eco-creds succeeded. File existence confirmed (see BF-3 above).
R-9 is partially resolved -- existence scan now works. Contents of files are NOT readable
(Rambo cannot open credential files per red line 5). BF-3 captures the actionable findings.

This item is CLOSED as a standalone limitation. Findings now live in BF-3.

### R-11: Oracle and Yael in PATH_SCOPE but absent from ALLOWED_AGENTS (CARRIED FORWARD)

guard.py PATH_SCOPE defines write paths for "oracle" and "yael." Neither appears in
guard.py ALLOWED_AGENTS (confirmed 2026-07-20 scan). In shadow mode, governed writes log
would-DENY but pass. Enforce-mode readiness blocked for both agents.

ACTION REQUIRED: Rambo review Oracle and Yael for ALLOWED_AGENTS inclusion; add with
appropriate PATH_SCOPE. Owner A1. Coordinate with AUD-009 (Yossi) in one hardening pass.

### R-12: Runner file review -- Rambo confirmation still outstanding (CARRIED FORWARD)

Commit b920e8f "fix(runner): silent job failures root-caused + fixed -- cmd.exe 8191-char limit"
and related runner commits have not had explicit Rambo security-review confirmation recorded.
Required before R-12 can close.

ACTION REQUIRED: Rambo confirm review of runner.py, agent-prompts.md, oracle-oneshot.md as
committed in b920e8f and related commits. Record confirmation in gate-register or
security-baseline.md. Confirm: no RUNNER_CONTEXT guard bypass; no tainted-input rule
weakening; oracle-oneshot.md scope is appropriate.

---

## GR-009 Addendum Verification (2026-07-10 + 2026-07-26 scope)

| Check | Result |
|---|---|
| .mcp.json workspace-mcp version | Carried from 2026-07-20 scan: workspace-mcp==1.21.3 -- MATCHES |
| .mcp.json WORKSPACE_MCP_CREDENTIALS_DIR | Carried: eco-creds -- CORRECT |
| .mcp.json tools scope | Carried: gmail calendar drive -- CORRECT |
| guard.py ECO_GOOGLE_ACCOUNT | Carried: eco.synthetic.org@gmail.com -- CORRECT |
| guard.py runner-path send denial | Carried: send_gmail_message denied when RUNNER_CONTEXT=1 -- CORRECT |
| guard.py google-boundary enforcement | Carried: hard-enforced regardless of GUARD_MODE -- CORRECT |
| Credential-store directory contents | CHECKED THIS SCAN (Glob succeeded) -- see BF-3 |
| C2: PPTX removal | NOT DONE -- eco-synthetic-audit-mid-summary.pptx still present |
| C3: non-token files flagged | DONE -- PPTX + .old-client.bak flagged as BF-3 |
| GR-009 addendum 2026-07-26 (T-0042) | RECORDED IN GATE-REGISTER -- read confirmed |

---

## CLEAR

### Tools vs. gate-register: CLEAR (no ungated tools found)

All tools across all 32 role files map to approved gate-register entries. Same finding as
all prior scans; gate-register confirms no new rows added between 2026-07-20 and 2026-07-27
that would change the picture.

- Read, Write, Edit: Claude Code built-ins; owner A1 2026-06-12 runtime approval.
- Bash (Eco, Gal, Shir, Adi, Noa): Claude Code built-in; Adi B5 scrutiny open (R-1) but
  Bash grant itself has a registered entry. Noa scoped per B5 C2 (build commands only).
- Grep, Glob (Rambo): gate-registered bootstrapping exception A1 2026-06-14; T-0013 closed.
- Grep, Glob (RedTeam): Claude Code built-ins; internal security testing only; B5 CLEAR 2026-06-22.
- WebFetch (Rambo): gate-registered explicit row (A1 2026-06-14; T-0013 closed 2026-06-16).
- WebFetch (Eyal): gate-registered explicit row (A1 2026-06-23). Scope: public legal/terms.
- WebSearch + WebFetch (Erez): gate-registered explicit row (A1 2026-06-17).
- WebSearch + WebFetch (Zvika): gate-registered explicit row (A1 2026-06-18).
- Google Drive MCP read-only (MeetingPrep): gate-registered A1 2026-06-12 (GR-005).
- Google Calendar MCP read-only (MeetingPrep, Eco): gate-registered A1 2026-06-12 (GR-006).
- Agent (Anat): owner A1 2026-06-15 (interim grant); T-0020 conditions on record.

No agent holds a tool not covered by an approved gate-register entry.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md (confirmed by direct read this scan).
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).

### Agent files vs. roster: 24 agents CLEAR by name (unchanged)

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman,
Oren, Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Five agents have no roster match (BF-1). Three roster rows have no agent file (BF-2).

### Role files changed since 2026-07-20 baseline: NO CHANGES DETECTED

No .claude/agents/*.md files appear as modified or untracked in git status at scan start.
No new role files added this scan.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 3 (BF-1: SEVENTH scan; BF-2: SEVENTH scan; BF-3: NEW -- credential store C2 breach) |
| REVIEW items open | 7 (R-1, R-3/AUD-009, R-4, R-5, R-8, R-11, R-12) |
| REVIEW items closed this scan | 1 (R-9: upgraded to BF-3 with actionable findings) |
| New REVIEW or BLOCKING items this scan | 1 (BF-3) |
| CLEAR | 32/32 agents no ungated tools; 24/32 roster name-exact match; GR-009 verifiable items |

Escalation urgency (ranked):
1. BF-1 + BF-2 + R-5: SEVENTH scan; 21 days since first flag; 2 days past owner deadline.
   Anat must open batch roster-update task with owner A1 this session.
2. BF-3 (C2 breach): binding gate condition from 2026-07-26 addendum; PPTX still present;
   stale .bak credential artifact also present. Shir/owner action required.
3. R-1 (Adi Bash): SEVENTH scan; CRITICALLY OVERDUE (21 days); Rambo action IMMEDIATE.
4. R-11 (Oracle + Yael ALLOWED_AGENTS): blocks enforce-mode readiness; coordinate with AUD-009.
5. R-3/AUD-009 (Yossi guard.py + roster): blocks runner-spawn and enforce mode for Yossi.
6. R-4 (Eyal Agent-tool confirmation): one-session close; seven scans overdue.
7. R-8 (Noa guard.py/allowlist mismatch): policy/enforcement divergence; Rambo + Anat needed.
8. R-12 (runner file review): Rambo written confirmation still outstanding.

---

ESCALATE_TO_ECO_BLOCKING
