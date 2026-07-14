# Guard Diff -- Consolidated Pre-Flip Proposal
# Rambo (Security) | 2026-07-14
# Tasked by: Eco (CEO) | Context: SEC-0001 enforce-mode pre-flip gate
#
# Consolidates: AUD-008 item 1 (F-S803) + all of AUD-009 (F-S804..S807)
#               + AUD-013 Phase-8 sharpenings (F-S814)
#
# STATUS: PROPOSAL ONLY. Do NOT apply. Owner A1 required; Shir applies.
# Sources read: .claude/hooks/guard.py (full); memory/board.md (AUD-008,009,013);
#   company/security/reports/enforce-readiness-gate-design-2026-07-01.md;
#   company/security/reports/guard-write-scoping-design-2026-06-30.md;
#   .claude/agents/<all 12 non-ALLOWED_AGENTS agents> (Data/memory access sections)

---

## PART 1 -- INDIVIDUAL CHANGES (one-line rationale + exact diff)

---

### F-S803 / AUD-008(1): add "noa" to OWNER_SPAWN_ONLY

RATIONALE: Noa holds Bash (confirmed: Noa.md tools line "Read, Write, Edit, Bash"). She
is in ALLOWED_AGENTS but absent from OWNER_SPAWN_ONLY. In enforce mode, any allow-listed
sub-agent could spawn her via Agent/Task, bypassing the Bash-holding restriction. Adding
her to OWNER_SPAWN_ONLY closes this gap; only the owner top-level session (origin empty,
not runner) can spawn Noa.

```diff
-OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren"}
+OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren", "noa"}
```

SHADOW-SAFE: In shadow mode the spawn-denial is wrapped as "[shadow] would-DENY" and
allowed through. Adding "noa" here only causes a genuine deny in enforce mode or on the
runner path. No current shadow-mode behavior changes.

---

### F-S804 / AUD-009(1): add "oracle" and "yael" to ALLOWED_AGENTS

RATIONALE: Both agents have PATH_SCOPE entries in the live guard.py (oracle -> lines
116-117; yael -> lines 119-121). The ALLOWED_AGENTS origin check fires BEFORE PATH_SCOPE
(guard.py evaluate() ~line 292-296). Without ALLOWED_AGENTS membership, any governed
write by oracle or yael is denied before PATH_SCOPE is evaluated -- the existing PATH_SCOPE
entries are dead code. Chronicle writes (oracle) and file-index writes (yael) would hard-fail
the moment enforce mode flips. Tools verified: both Read, Write, Edit only (no Bash); neither
needs OWNER_SPAWN_ONLY.

```diff
 ALLOWED_AGENTS = {
     "anat", "assaf", "dalia", "eyal", "rambo", "lital",
     "perry", "ido", "luci", "erez", "hila", "redteam", "noa",
     # Code-builders (SEC-0001, 2026-06-30):
     "gal", "shir", "adi", "oren",
+    # AUD-009 F-S804: oracle + yael -- PATH_SCOPE existed but ALLOWED_AGENTS was missing
+    "oracle", "yael",
 }
```

SHADOW-SAFE: currently oracle/yael writes log as "[shadow] would-DENY: acting sub-agent
not on allow-list". After this change, those entries become "[shadow] allow: ..." in shadow
mode. This is a false-block correction, not a new denial. Shadow mode behavior improves;
no regression.

---

### F-S805 / AUD-009(2): Dalia PATH_SCOPE += company/policies/, company/post-mortems/,
                                               company/governance/quality-audit-log.md

RATIONALE: Dalia owns the policy framework (DAL-001) and quality/governance operations.
company/policies/ is the canonical home for approved policy files (CS-0001 final landing
per Mike.md; DAL-001 activation). company/post-mortems/ is a Dalia-owned governance path.
company/governance/quality-audit-log.md is the quality-audit record Dalia produces each
cycle. All three are within Dalia's stated governance scope; all were missing from PATH_SCOPE,
which means they would hard-deny in enforce mode despite being legitimate Dalia writes.

```diff
 "dalia": [
     "company/governance/access-matrix.md", "company/soul.md", "memory/wiki/",
     "memory/board.md", "memory/log.md", "company/decisions/decisions-log.md",
+    "company/policies/", "company/post-mortems/",
+    "company/governance/quality-audit-log.md",
 ],
```

SHADOW-SAFE: in shadow mode, writes to these three paths by Dalia currently log as
would-DENY (path-scope violation if Dalia is in PATH_SCOPE -- confirmed she is, lines 78-83).
After this change, those writes log as allow. False-block correction only.

---

### F-S806 / AUD-009(3): Eyal PATH_SCOPE += company/decisions/decisions-log.md,
                                              company/legal/

RATIONALE: Eyal's current PATH_SCOPE (guard.py lines 91-94) is missing decisions-log and
company/legal/. Eyal appends legal decisions to decisions-log (confirmed: many board entries
show Eyal writing decisions, e.g. T-0039, T-0041, AUD-004). He also produces DPA drafts and
legal memos that need a bounded write path. company/legal/ is the correct home. The directory
does not exist yet -- see prerequisite flag below.

APPEND_ONLY CONFIRMATION: "company/decisions/decisions-log.md" IS in the APPEND_ONLY set
(guard.py line 157-161). Adding it to Eyal PATH_SCOPE only permits the path to reach the
append-only check. The append-only rule then fires independently and prevents retroactive edits.
Both rules compose correctly.

PREREQUISITE -- OWNER/SHIR ACTION: company/legal/ does not exist on disk. Shir or owner
must create the directory (e.g., an empty .gitkeep) before this guard change is useful for
Eyal. The guard change itself is safe to deploy before the dir exists; a path-scope allow on
a non-existent directory does no harm. Eyal's first write to company/legal/ will create the
file (Write tool creates intermediate dirs as needed in most shell environments -- verify
during apply).

```diff
 "eyal": [
     "company/governance/gate-register.md", "company/governance/compliance-backlog.md",
     "memory/board.md", "memory/log.md",
+    "company/decisions/decisions-log.md", "company/legal/",
 ],
```

SHADOW-SAFE: Eyal writes to decisions-log regularly; those currently pass through (Eyal IS
in ALLOWED_AGENTS, and decisions-log is in APPEND_ONLY so it gets the append check, not the
path-scope check -- wait, clarification: the PATH_SCOPE check fires on any governed write
for an agent IN PATH_SCOPE, and decisions-log was not in Eyal's scope, so those writes
currently log as "[shadow] would-DENY: path-scope violation". Adding decisions-log here
corrects that false-block. company/legal/ writes are currently absent (path doesn't exist),
so no shadow log impact until the dir is created.

---

### F-S807 / AUD-009(4): 12 agents -- per-agent analysis and ALLOWED_AGENTS + PATH_SCOPE

RATIONALE: 12 certified-live agents with Write/Edit tools are absent from ALLOWED_AGENTS.
In enforce mode any governed action from these agents (write, edit, spawn) is denied by the
origin check. Each agent below has been analysed against its role file's Data/memory access
section to determine the correct PATH_SCOPE. Yossi is the single exception (see below).

#### PER-AGENT ANALYSIS

**SALLY** -- VP Sales | Certified + live 2026-06-17 | tools: Read, Write, Edit | no Bash
- Spawn path: Eco spawns Sally. Sally spawns Alex.
- Write scope confirmed: marketing/ (role file: "marketing/ -- read/write (Sales group)"),
  memory/board.md, memory/log.md, company/decisions/decisions-log.md.
- No OWNER_SPAWN_ONLY needed (no Bash).

**ALEX** -- Sales Execution | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Sally spawns Alex.
- Write scope confirmed: memory/board.md, memory/log.md, company/decisions/decisions-log.md.
  (Alex does not write to marketing/ or projects/ per role file.)

**MIKE** -- VP CS | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Eco spawns Mike. Mike spawns Jenny, Jack, Ella.
- Write scope confirmed: company/cs/ (role file: "Write: company/cs/ ONLY"),
  memory/board.md, memory/log.md, company/decisions/decisions-log.md.

**JENNY** -- Customer Support tier-1 | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Mike spawns Jenny.
- Write scope confirmed: company/cs/tickets/ (role file: "Write scoped to company/cs/tickets/"),
  memory/log.md.

**JACK** -- CSM + Account Manager | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Mike spawns Jack.
- Write scope confirmed: company/cs/accounts/ (role file: "Write scoped to company/cs/accounts/"),
  memory/log.md.

**ELLA** -- Customer Trainer | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Mike spawns Ella.
- Write scope confirmed: company/cs/training/ (role file: "Write scoped to company/cs/training/"),
  memory/log.md.

**SAMI** -- SME Advisor (on-demand per project) | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Perry or Eco spawns Sami on demand.
- Write scope confirmed: projects/<assigned-name>/ (role file hard-partition: "reads and writes
  ONLY inside projects/<assigned-name>/"), memory/log.md.
- Guard PATH_SCOPE uses projects/ as the prefix (cannot enforce the per-project partition at the
  guard level without per-invocation config changes; the behavioral hard-partition is enforced by
  the role file and the task envelope, not the guard).

**ROMAN** -- Algorithm Specialist (on-demand) | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Ido spawns Roman (A2).
- Write scope confirmed: projects/delivery-saas/docs/algorithms/ (role file: "Write: scoped to
  projects/delivery-saas/docs/algorithms/ and own activity rows in memory/log.md"), memory/log.md.

**ZVIKA** -- Research Analyst (on-demand) | Certified + live 2026-06-18 | tools: Read, Write, Edit, WebSearch, WebFetch | no Bash
- Spawn path: Eco spawns Zvika (A2 gated).
- Write scope confirmed: projects/ (confirmed by T-0043: wrote to projects/ai-patient-simulator/docs/),
  company/research/ (role file: "typically projects/<name>/research/ or company/research/"),
  memory/log.md.
  NOTE: company/research/ does not exist yet. Eco designates the exact path per task. Including
  both prefixes here because both are stated in the role file; prevents a false-block if Eco
  designates company/research/ on a future task.

**DESIGNER (Tal)** -- Product UX/UI | Certified + live 2026-06-18 | tools: Read, Write, Edit | no Bash
- Spawn path: Perry spawns Designer (or Eco).
- Write scope confirmed by role file write-scope section: "projects/delivery-saas/docs/ and its
  subdirectories (incl. design/) ONLY" + memory/log.md.
- MARKETING SCOPE GATED: Designer.md explicitly states marketing/ write requires "a fresh Rambo
  permission scan + an access-matrix A2 update" (AUD-011). marketing/ is NOT included in this diff.
  It will be added in a SEPARATE guard edit only after AUD-011 gate clears (Rambo scan + Dalia A2).

**MEETINGPREP** -- Meeting Prep Specialist (on-demand) | Certified + live 2026-06-18 | tools: Read, Google Drive MCP (read-only), Google Calendar MCP (read-only) | no Write tool, no Bash
- Spawn path: Sally (or Eco) spawns MeetingPrep.
- Write scope: MeetingPrep has NO Write or Edit tool. It cannot perform governed write actions.
  ALLOWED_AGENTS membership is needed ONLY for spawn to be permitted (the spawn check at guard.py
  ~line 325 checks if sub in ALLOWED_AGENTS). Adding a minimal PATH_SCOPE [memory/log.md] is
  belt-and-suspenders in case the tool grant is ever expanded.

**YOSSI** -- Training & Enablement | EXCLUDED FROM THIS DIFF
- Status: conditionally certified by Anat 2026-07-01 (Eco A2 granted). CONDITIONS OUTSTANDING:
  C1 Rambo B5 (not yet run -- AUD-008 confirms "Yossi Rambo B5 still outstanding, correctly gated,
  no fleet risk"); C2 Assaf B6 (due ~2026-07-08, status unconfirmed); C3 live B3 (target 2026-07-31).
- Decision: do NOT add Yossi to ALLOWED_AGENTS until C1 (Rambo B5) completes. Any spawn attempt
  for Yossi correctly DENIES until then. Yossi guard entry will be added in a separate change
  after C1/C2/C3 close. Intended PATH_SCOPE when ready:
  ["company/training/", "company/governance/skills-register.md", "memory/log.md"]

#### EXACT CODE CHANGE -- ALLOWED_AGENTS (append to existing set)

```diff
 ALLOWED_AGENTS = {
     "anat", "assaf", "dalia", "eyal", "rambo", "lital",
     "perry", "ido", "luci", "erez", "hila", "redteam", "noa",
     # Code-builders (SEC-0001, 2026-06-30):
     "gal", "shir", "adi", "oren",
+    # AUD-009 F-S804:
+    "oracle", "yael",
+    # AUD-009 F-S807: all certified-live write-capable agents
+    "sally", "alex", "mike", "jenny", "jack", "ella",
+    "sami", "roman", "zvika", "designer", "meetingprep",
 }
```

#### EXACT CODE CHANGE -- PATH_SCOPE (append entries at end of dict, before closing brace)

```diff
     "redteam": [
         "company/audits/redteam/", "memory/log.md",
     ],
+    # AUD-009 F-S807: CS group
+    "sally": [
+        "marketing/", "memory/board.md", "memory/log.md",
+        "company/decisions/decisions-log.md",
+    ],
+    "alex": [
+        "memory/board.md", "memory/log.md",
+        "company/decisions/decisions-log.md",
+    ],
+    "mike": [
+        "company/cs/", "memory/board.md", "memory/log.md",
+        "company/decisions/decisions-log.md",
+    ],
+    "jenny": [
+        "company/cs/tickets/", "memory/log.md",
+    ],
+    "jack": [
+        "company/cs/accounts/", "memory/log.md",
+    ],
+    "ella": [
+        "company/cs/training/", "memory/log.md",
+    ],
+    # AUD-009 F-S807: on-demand / SME agents
+    "sami": [
+        "projects/", "memory/log.md",
+    ],
+    "roman": [
+        "projects/delivery-saas/docs/algorithms/", "memory/log.md",
+    ],
+    "zvika": [
+        "projects/", "company/research/", "memory/log.md",
+    ],
+    # AUD-009 F-S807: Design
+    "designer": [
+        "projects/delivery-saas/docs/", "memory/log.md",
+        # NOTE: marketing/ is GATED -- add only after AUD-011 activates (Rambo scan + Dalia A2)
+    ],
+    # AUD-009 F-S807: read-only agent; PATH_SCOPE is belt-and-suspenders (no Write tool)
+    "meetingprep": [
+        "memory/log.md",
+    ],
 }
```

SHADOW-SAFE (F-S807 as a whole): currently any governed action by these 11 agents
(sally/alex/mike/jenny/jack/ella/sami/roman/zvika/designer/meetingprep) logs as
"[shadow] would-DENY: acting sub-agent not on allow-list." After this change, their
governed writes log as shadow-allow or (where applicable) shadow-path-scope-allow. No
new denials are introduced in shadow mode. All changes are false-block corrections.

---

### F-S814 / AUD-013(3): add explicit manage_gmail_filter runner-path deny

RATIONALE: --allowedTools already excludes manage_gmail_filter from the runner, so this
is a belt-and-suspenders guard-level hard-enforce. manage_gmail_filter can set forwarding
rules and effectively redirect mail -- it is equivalent-blast-radius to send. Adding an
explicit runner-path deny in the google-boundary block matches the existing
send_gmail_message runner-path deny (guard.py line 258-259) and makes the posture
symmetric and explicit. Theoretical today; structural tomorrow if --allowedTools config
ever drifts.

SHADOW MODE NOTE: google-boundary denies are HARD-ENFORCED regardless of GUARD_MODE
(see decide() logic: google_block = DENY and reason starts with "google boundary" -> real
deny even in shadow). This change is therefore NOT shadow-mode-inert. However, since
manage_gmail_filter is not in --allowedTools, the tool call never reaches the guard in
practice. Practical impact in shadow mode = ZERO. The hard-enforce property is CORRECT
(same posture as send_gmail_message).

```diff
     if short == "send_gmail_message" and os.environ.get("RUNNER_CONTEXT") == "1":
         return DENY, "google boundary: send_gmail_message never available on the runner path"
+    if short == "manage_gmail_filter" and os.environ.get("RUNNER_CONTEXT") == "1":
+        return DENY, "google boundary: manage_gmail_filter never available on the runner path"
     if email and email != ECO_GOOGLE_ACCOUNT:
```

---

## PART 2 -- CONSOLIDATED SHADOW-SAFETY STATEMENT

All 6 items (F-S803, F-S804, F-S805, F-S806, F-S807, F-S814) are SHADOW-SAFE with the
single explicit exception of F-S814:

- F-S803 (noa -> OWNER_SPAWN_ONLY): shadow-safe. Would-DENY only activates on spawn by
  a sub-agent; in shadow mode that becomes a shadow-would-DENY and is allowed through.
  No current sessions are spawning Noa from a sub-agent context.

- F-S804 (oracle + yael -> ALLOWED_AGENTS): corrects false-blocks. In shadow mode,
  chronicle and file-index writes by oracle/yael improve from would-DENY to allow.
  No regression.

- F-S805 (Dalia PATH_SCOPE): corrects false-blocks. Shadow log improves. No regression.

- F-S806 (Eyal PATH_SCOPE): corrects false-blocks for decisions-log writes. company/legal/
  is new (dir does not exist) so no shadow log impact from that addition. No regression.

- F-S807 (11 agents -> ALLOWED_AGENTS + PATH_SCOPE): corrects false-blocks fleet-wide.
  Shadow log improves from mass would-DENYs to allow. No regression.

- F-S814 (manage_gmail_filter runner deny): HARD-ENFORCED even in shadow mode (google
  boundary rule). Practically inert because the tool is not in --allowedTools and the call
  never reaches the guard. If by some configuration error manage_gmail_filter were somehow
  called on the runner path, this would now hard-deny in shadow mode. That is the CORRECT
  behavior. Risk of false-block: zero under current --allowedTools config.

SUMMARY: deploying this diff in shadow mode causes zero legitimate operation to newly fail.
The 7-clean-day window counter is not reset by any of these changes. The changes only fix
would-DENYs (false blocks). The readiness-gate counter can continue accumulating.

---

## PART 3 -- PREREQUISITES BEFORE APPLYING

1. company/legal/ directory: does not exist. Create with an empty .gitkeep or the first
   Eyal legal draft before expecting Eyal to write there. The guard change can be deployed
   first; the missing dir causes no harm to the guard itself.

2. AUD-011 gate (Designer marketing/ scope): DO NOT add "marketing/" to Designer PATH_SCOPE
   until: (a) Rambo permission scan of the expanded scope completes (fresh scan, not this
   one); (b) Dalia A2 adds Designer write to marketing/ in access-matrix.md. This is a
   separate future guard edit, tracked under AUD-011. Current diff intentionally excludes it.

3. Yossi guard entry: DO NOT add Yossi to ALLOWED_AGENTS until C1 (Rambo B5) is run and
   conditions C2 (Assaf B6) and C3 (live B3) are met. Tracked under AUD-005 / HR-002.
   Intended PATH_SCOPE when ready: ["company/training/", "company/governance/skills-register.md",
   "memory/log.md"]. A separate guard edit will cover it at that time.

---

## PART 4 -- GATE-REGISTER UPDATE

No new gate-register row is warranted. The gate-register tracks external tool and service
adoption (CLAUDE.md: "all external sources and tools must be registered"). This diff
modifies internal guard.py security configuration only. No new external tool is adopted.
SEC-0001 is already the governance record for the enforce-mode flip decision.

---

## PART 5 -- APPLY STEPS (Shir applies after owner A1)

Apply order matters; do all five edits in a single editing pass on guard.py to avoid
a partially-patched intermediate state.

STEP 1 (F-S803): In the OWNER_SPAWN_ONLY set literal (line 63 of current guard.py),
add "noa".
  Before: OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren"}
  After:  OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren", "noa"}

STEP 2 (F-S804 + F-S807 combined): In the ALLOWED_AGENTS set literal (lines 45-52),
add the 13 agent names after the existing "gal", "shir", "adi", "oren" line.
See exact diff in Part 1, F-S804 and F-S807 ALLOWED_AGENTS block above.
Total additions: oracle, yael, sally, alex, mike, jenny, jack, ella, sami, roman, zvika,
designer, meetingprep (13 names). NOT adding: yossi (pending conditions).

STEP 3 (F-S805): In Dalia's PATH_SCOPE entry (lines 78-82), append the 3 new paths.
See exact diff in Part 1, F-S805 above.

STEP 4 (F-S806): In Eyal's PATH_SCOPE entry (lines 91-94), append 2 new paths.
See exact diff in Part 1, F-S806 above.

STEP 5 (F-S807 PATH_SCOPE): After the "redteam" entry closing bracket (line 141-142),
add the 11 new agent PATH_SCOPE entries.
See exact diff in Part 1, F-S807 PATH_SCOPE block above.

STEP 6 (F-S814): In the google-boundary block inside evaluate() (after the
send_gmail_message runner-path check, ~line 259), add the manage_gmail_filter check.
See exact diff in Part 1, F-S814 above.

STEP 7 (PREREQUISITE): Create company/legal/ directory. Can be done before or after
the guard edit; the guard does not depend on the directory existing.

STEP 8 (VERIFY): After applying, run a manual review of guard.py for:
- ALLOWED_AGENTS count matches expected (current 16 + 13 new = 29, excluding eco which
  is intentionally absent from PATH_SCOPE but would be in ALLOWED_AGENTS if listed;
  verify the comment block count)
- OWNER_SPAWN_ONLY has 5 members: gal, shir, adi, oren, noa
- PATH_SCOPE dict has entries for all named agents (count: was 19, now 30; verify)
- google-boundary block has two runner-path denies: send_gmail_message and manage_gmail_filter
- No syntax errors: run "python -c 'import guard'" or equivalent before deploying

STEP 9 (DEPLOY): Replace live .claude/hooks/guard.py with the patched version.
GUARD_MODE remains "shadow" -- this is NOT the enforce flip. The flip is a separate
A1 step after the 7-clean-day window and coverage conditions are met.

---

## PART 6 -- ITEMS STILL NEEDING A SEPARATE DECISION

1. AUD-011 (Designer/Tal marketing/ scope): Requires fresh Rambo permission scan +
   Dalia access-matrix A2 BEFORE adding marketing/ to Designer PATH_SCOPE. Tracked
   under AUD-011. NOT covered by this diff.

2. Yossi guard entry: Requires Rambo B5 completion + C2/C3 conditions met. NOT covered
   by this diff. Tracked under AUD-005 / HR-002.

3. SEC-0001 enforce flip itself: This diff covers only the guard-coverage portion of
   the pre-flip gate. The flip also requires B2 (agent behavioral fix: Edit->Write-append
   on decisions-log/log.md) + 7 consecutive clean days + coverage conditions C1-C4. Those
   are not Rambo's gate items; they are tracked under SEC-0001 and the enforce-readiness
   check script.

4. company/legal/ directory creation: Required before Eyal can use his new PATH_SCOPE
   entry. Owner or Shir action; not a guard-file change.

---

## PART 7 -- DOES THIS CLEAR THE GUARD-COVERAGE PORTION OF THE SEC-0001 PRE-FLIP GATE?

YES -- with the exceptions noted above. Once this diff is applied (owner A1 + Shir):

- F-S803: Noa spawn gap closed. OWNER_SPAWN_ONLY is complete for all Bash-holding agents.
- F-S804: Oracle and Yael can write in enforce mode. No false-blocks from dead PATH_SCOPE.
- F-S805: Dalia's governance paths (policies, post-mortems, quality-audit-log) are in scope.
- F-S806: Eyal can append decisions-log and write to company/legal/ in enforce mode.
- F-S807: All certified-live agents with Write/Edit tools are either in ALLOWED_AGENTS with
  PATH_SCOPE (11 agents) or explicitly excluded with documented rationale (Yossi: not yet
  certifiable). No certified-live agent will hard-fail due to the origin-check in enforce mode.
- F-S814: manage_gmail_filter runner-path deny is explicit. Google boundary is complete.

Remaining pre-flip blockers (NOT this diff's scope):
- B2 behavioral fix (not deployed yet per SEC-0001 board)
- 7 clean shadow days + coverage C1-C4
- AUD-011 Designer/marketing gate (separate gate; does not block the main flip if Designer
  is excluded from marketing/ writes, which she is until AUD-011 clears)
- Yossi (not blocking -- spawn denied is the correct safe state until conditions met)

---

END OF REPORT
Sources verified: guard.py (full read); memory/board.md (all relevant rows read);
enforce-readiness-gate-design-2026-07-01.md (full read);
guard-write-scoping-design-2026-06-30.md (full read);
.claude/agents/{Sally,Alex,Mike,Jenny,Jack,Ella,Sami,Roman,Zvika,Designer,MeetingPrep,Yossi}.md
(all read in full, Data/memory access sections used for scope derivation);
.claude/agents/{Noa,Oracle,Yael}.md (tools line verified);
company/governance/gate-register.md (header read -- no new row warranted);
company/legal/ glob (not found -- dir does not exist).
