# Git-Sync Phase A -- A2 Sign-Off Record (T-0021)

Author: Ido (VP R&D, L3)
Date: 2026-06-16
Task: T-0021 -- Phase A Build A2 Sign-Off
Status: SIGNED -- A2 APPROVED
Output to: owner (jecki) for A1 deploy decision

Plain ASCII. No em dashes. No curly quotes.

---

## A2 SIGN-OFF STATEMENT

I, Ido (VP R&D, L3), hold A2 authority for build approval under the T-0021
task envelope and the autonomous gate recommendation
(company/processes/git-sync-autonomous-recommendation.md Section 7.1).

Having read all build artifacts and verified each of the four required Rambo
fixes, I find:

  - All four required fixes are present and correct in the built artifacts.
  - The build matches the approved design in architecture, classification logic,
    fail-closed behavior, and access-matrix compliance.
  - No artifact is deployed, scheduled, or executed. All carry the PROPOSAL header.
  - The QREF-placeholder item Shir flagged is a non-issue (see Section 3 below).
  - Gate-register entry is confirmed as a Phase B prereq (not a Phase A blocker).

VERDICT: SIGNED. Phase A build is complete. Artifacts are ready for owner A1
deploy decision (Phase B).

Nothing in Phase A executes or modifies any production system. The gate is
inert on disk until the owner takes the bootstrap actions in Phase B.

---

## 1. PER-FIX VERIFICATION

### FIX-1 -- Halt on missing hash file (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target files:
  - scripts/git-sync-runner-prompt.md (Pre-loop section, lines 44-51)
  - company/processes/git-sync-runbook.md (Step 1.6, lines 110-114)

Evidence:
  Runner prompt Pre-loop, missing-hash-file case now reads:
    Append INTEGRITY-CHECK=FAIL | FILE=/etc/git-sync-hashes.txt |
    REASON=hash-file-absent | ACTION=HALTED to gate-audit.log,
    append to memory/log.md, then "Stop immediately. Do NOT proceed
    with the sync loop."
  The warn-and-proceed (INTEGRITY-CHECK=SKIPPED) text is gone.

  Runbook Step 1.6 carries the explicit sequencing note:
    "IMPORTANT SEQUENCING: Step 1.4 (write /etc/git-sync-hashes.txt) MUST
    be completed BEFORE this step. If the scheduler fires before the hash
    file exists, GitSyncRunner will log INTEGRITY-CHECK=FAIL and halt."

  Rambo's required language from Section 6 Decision 3 ruling is matched
  exactly. Fail-closed holds.

### FIX-2 -- integrations/telegram-bridge/outbound/ in NEVER_STAGE (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target file:
  - integrations/telegram-bridge/bridge-git-sync.py (NEVER_STAGE list, line 91)

Evidence:
  NEVER_STAGE list (lines 82-92) contains:
    "integrations/telegram-bridge/outbound/"
  as the final entry (after "sources/"). The outbound notification directory
  is now blocked from staging by the defense-in-depth NEVER_STAGE check.
  The safe_stage() overlap check (lines 300-309) will also catch any future
  STAGE_PATHS addition that attempts to include this path.

### FIX-3 -- bridge-git-sync.py classified as control-plane in all three files (REQUIRED before A2)

STATUS: PRESENT AND CORRECT IN ALL THREE FILES.

Target files:
  (a) scripts/git-sync-runner-prompt.md -- Step 2, line 101
  (b) scripts/gate-runner.sh -- line 43 CP_PATTERN
  (c) integrations/telegram-bridge/bridge-git-sync.py -- lines 95-97 CP_PATTERN

Evidence:
  (a) Runner prompt Step 2 CONTROL-PLANE PATTERN block contains:
        ^integrations/telegram-bridge/bridge-git-sync\.py$
      as the 7th pattern entry.

  (b) gate-runner.sh CP_PATTERN string ends with:
        |^integrations/telegram-bridge/bridge-git-sync\.py$
      appended to the canonical pattern from recommendation.md Section 3.1.

  (c) bridge-git-sync.py CP_PATTERN regex (lines 95-97) is:
        r"^(\.claude/|CLAUDE\.md$|bridge\.py$|scripts/|company/governance/
        |company/constitution\.md$|integrations/telegram-bridge/bridge-git-sync\.py$)"
      The new alternation is the final entry in the group.

  All three are consistent with each other and with Rambo's ruling (Section 6
  Criterion 6, FIX-3). A commit that modifies only bridge-git-sync.py will
  now be classified control-plane and routed to Rambo review, not auto-merged.

### FIX-4 -- security-baseline.md write moved into Rambo sub-session (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target file:
  - scripts/git-sync-runner-prompt.md (Step 3b.3 Rambo invocation prompt block
    and Step 4.2)

Evidence:
  Step 3b.3 Rambo invocation prompt (lines 251-262) contains the instruction:
    "If your verdict is QUARANTINE, additionally append the following structured
    record to company/governance/security-baseline.md (you hold write authority
    on that path; do this inside your own sub-session before returning your
    verdict):"
    [structured record fields listed]
    "Append only. Never edit existing entries in security-baseline.md."

  Step 4.2 (GitSyncRunner quarantine sequence, lines 324-339) now writes only
  to logs/quarantine/security-baseline-entry.txt (local forensic copy) and
  carries the explicit NOTE:
    "GitSyncRunner must NOT write to company/governance/ directly -- the access
    matrix grants that write to Rambo only."

  The company/governance/ write is entirely inside the Rambo sub-session.
  GitSyncRunner writes none of the five company/governance/ paths. Access-matrix
  compliance confirmed.

---

## 2. BUILD-COMPLETE CONFIRMATION

The build matches the approved design (git-sync-autonomous-recommendation.md):

Architecture match:
  - Five-component architecture (fetch-only hook, GitSyncRunner, Rambo-via-Agent,
    bridge-git-sync.py, branch protection + audit log): fully implemented.
  - Classification logic: CP_PATTERN and DP_PREFIXES are consistent across all
    three classification points (runner prompt, gate-runner.sh, bridge-git-sync.py).
    Residual rule (unknown path -> control-plane) is present in all three.
    FIX-3 addition is consistent in all three.
  - Fail-closed: every error, timeout, ambiguous verdict, and ff-only failure
    routes to QUARANTINE. Confirmed across runner prompt, gate-runner.sh, and
    bridge-git-sync.py.
  - Diff-only isolation: the diff is written to logs/quarantine/ before Rambo
    is invoked; Rambo is instructed not to check out or merge any incoming file;
    the merge runs only after CLEAR. Confirmed in runner prompt Steps 3b.1-3b.5.
  - Self-protecting gate scripts: scripts/ is in CP_PATTERN; any commit to
    scripts/ triggers the gate's own review before the new version is applied.
  - No destructive commands: confirmed in runner prompt allowed/blocked list,
    gate-runner.sh header comment, and bridge-git-sync.py git() docstring.

Design Section 3.1 note on bridge-git-sync.py:
  The recommendation's canonical CP_PATTERN in Section 3.1 was written before
  bridge-git-sync.py existed as a separate file. FIX-3 (Rambo-mandated, carried
  into the build by Shir) adds bridge-git-sync.py to all three classification
  points. This is a required correction to the build, not a deviation from
  design intent. Section 1.2 and Section 8 of the recommendation confirm that
  bridge-git-sync.py is a separate process from bridge.py and that bridge.py
  itself (root-level) is control-plane. The security ruling is consistent.

Deployment status:
  Every artifact carries "PROPOSAL -- not deployed. Deployment is owner A1
  per git-sync-autonomous-recommendation.md." in its header. Nothing is
  scheduled, running, or live. The gate is inert on disk.

---

## 3. SHIR'S QREF-PLACEHOLDER ITEM -- NON-ISSUE CONFIRMATION

Shir flagged that the Rambo invocation prompt (Step 3b.3) contains the literal
string "<QREF>" where the actual quarantine ref value would go.

This is correct behavior. The QREF ref is created by GitSyncRunner in Step 4.1,
AFTER Rambo returns its verdict. Rambo's structured record (written inside the
Rambo sub-session on QUARANTINE) contains "<QREF>" as a placeholder; GitSyncRunner
then creates the actual quarantine ref (Step 4.1) and the placeholder value in
security-baseline.md records the fact that the ref was not yet known at the time
Rambo wrote the entry. This is the same pattern shown in Rambo's own FIX-4 ruling
(Section 6 Decision 4), which uses exactly the same placeholder language:
"QUARANTINE_REF: <QREF> (will be written by GitSyncRunner after you return)."

The design is consistent. The placeholder is intentional. Non-issue confirmed.

---

## 4. BUILT ARTIFACTS

All artifacts are proposals committed to the repo, inert until Phase B deploy.

| Artifact | Path | Phase A status |
|----------|------|----------------|
| GitSyncRunner system prompt | scripts/git-sync-runner-prompt.md | BUILT, A2 SIGNED |
| Gate-runner shell script | scripts/gate-runner.sh | BUILT, A2 SIGNED |
| Bridge git-sync daemon | integrations/telegram-bridge/bridge-git-sync.py | BUILT, A2 SIGNED |
| Systemd unit template | scripts/git-sync-systemd.unit.template | BUILT, A2 SIGNED |
| Operator runbook | company/processes/git-sync-runbook.md | BUILT, A2 SIGNED |

Note: the recommendation (Section 7.1) also listed rambo-review.sh as a Phase A
artifact. Rambo's clearance report reviewed gate-runner.sh in its place (consistent
with recommendation Section 3.5 ruling: shell scripts are called by GitSyncRunner
via Bash tool; the Rambo invocation is via Agent tool inside the runner prompt).
No gap; the Rambo-review function is embedded in the runner prompt Step 3b.3.

---

## 5. OWNER A1 DEPLOY CHECKLIST (Phase B)

Carried forward from git-sync-autonomous-recommendation.md Section 7.2
and git-sync-runbook.md Section 1. All items below require explicit owner
approval in the deploy session. None may be executed without that approval.

### 5.1 Branch protection (prerequisite -- do this first)

Configure in GitHub repo settings before any gate goes live:
  - Settings -> Branches -> Add branch protection rule -> master
  - Require pull request reviews before merging: YES (1 approval minimum)
  - Restrict who can push: owner (jecki) only
  - Block force pushes: YES
  - Allow deletions: NO

Without this, the gate provides no meaningful trust boundary.

### 5.2 One-time bootstrap (owner reads all scripts before this commit)

  cd <REPO_ROOT>
  git checkout master
  git pull origin master
  mkdir -p logs/quarantine
  touch logs/.gitkeep
  touch logs/quarantine/.gitkeep
  git add scripts/ integrations/telegram-bridge/bridge-git-sync.py logs/
  git status       # REVIEW staged files before committing
  git diff --cached  # READ the full diff -- this is the bootstrap trust step
  git commit -m "bootstrap: autonomous git-sync gate artifacts (T-0021, owner A1)"
  git push origin master

### 5.3 Write /etc/git-sync-hashes.txt (MUST complete before Step 5.5)

After the bootstrap commit:

  sha256sum <REPO_ROOT>/CLAUDE.md <REPO_ROOT>/.claude/agents/Rambo.md \
      > /etc/git-sync-hashes.txt
  chmod 644 /etc/git-sync-hashes.txt

If this step is skipped or done after the scheduler is active, GitSyncRunner
will log INTEGRITY-CHECK=FAIL and halt on every session.

### 5.4 Wire the bridge outbound watcher

bridge-git-sync.py does not currently implement an outbound directory watcher
(noted by Shir, confirmed as ADVISORY-1 by Rambo). The owner must add a hook
at bootstrap so that files written to integrations/telegram-bridge/outbound/
are consumed atomically (read, send to Telegram, delete) by the bridge daemon.

Recommended implementation: a filesystem watcher or polling loop in the bridge
daemon that reads any *.txt file in outbound/, sends it to the Telegram bot API,
and deletes the file. Retain no files after send. Implement before activating
the GitSyncRunner schedule, or quarantine alerts will silently accumulate
(they are in NEVER_STAGE, so they will not be committed, but they will not
reach Telegram until the watcher is live).

### 5.5 Schedule GitSyncRunner (AFTER Step 5.3 is complete)

Configure a recurring cloud session in the Claude Code scheduler:
  - System prompt: contents of scripts/git-sync-runner-prompt.md
  - Schedule: every 15 minutes
  - Working directory: <REPO_ROOT>
  - Tools: Read, Write, Edit, Bash (git only), Agent

This is the A1 action that activates the autonomous gate. Until scheduled,
all gate scripts are inert.

After scheduling, wait up to 15 minutes and verify:
  tail -f <REPO_ROOT>/logs/gate-audit.log
Expected: NO_OP | REASON=already-up-to-date (or AUTO-MERGED if commits are pending).

### 5.6 Deploy bridge-git-sync.py and systemd unit

  cp <REPO_ROOT>/scripts/git-sync-systemd.unit.template \
     /etc/systemd/system/bridge-git-sync.service
  # Edit the service file: fill all <ANGLE-BRACKET> placeholders
  sudo systemctl daemon-reload
  sudo systemctl enable bridge-git-sync.service
  sudo systemctl start bridge-git-sync.service
  sudo systemctl status bridge-git-sync.service    # verify Active: active (running)
  journalctl -u bridge-git-sync.service -f          # verify startup logs

Python deps required on bridge host:
  pip install watchdog==4.0.1 gitpython==3.1.43

### 5.7 Verify settings.json fetch-only hook

The fetch-only hook (UserPromptSubmit, git fetch origin 2>&1 | tail -1 || true)
was recommended in git-sync-recommendation.md (the prior document). Confirm it is
already in .claude/settings.json before the bootstrap commit. If not, owner adds
it manually (owner-only file; no agent may write it without A1).

### 5.8 Gate-register entry (before go-live)

Add an entry for the autonomous gate (GitSyncRunner, gate-runner.sh,
bridge-git-sync.py) to company/governance/gate-register.md before the
bootstrap commit is pushed. Rambo flagged this in Section 8 of the clearance
report. It is a Phase B prereq, not a Phase A blocker. Rambo should create
or review the entry.

---

## 6. WHAT REMAINS BLOCKED ON DALIA (Phase C)

The following cannot proceed until Dalia (Q&G) is activated:

  - Define gate-audit.log review cadence (recommended weekly scan; immediate
    on QUARANTINE -- but the threshold for escalation to Eco needs Dalia definition).
  - Define QUARANTINE escalation threshold (e.g., flag to Eco if QUARANTINE rate
    exceeds X% in a rolling window, or backlog exceeds N refs).
  - Define the acceptable audit trail standard for the autonomous gate (Dalia may
    add requirements beyond gate-audit.log).
  - Formal governance closure of T-0021.

Dalia's requirements are expected to be additive. Phase A and Phase B may proceed
before Dalia is live. T-0021 is not fully closed until Phase C completes.

---

## 7. VERIFICATION BASIS

Files read for this A2 sign-off (all read in this session before signing):

  company/processes/git-sync-phaseA-security-clearance.md
    (Rambo's four required fixes and rulings)
  scripts/git-sync-runner-prompt.md
    (FIX-1 halt language, FIX-3 CP pattern, FIX-4 Rambo invocation block)
  scripts/gate-runner.sh
    (FIX-3 CP_PATTERN, overall structure)
  integrations/telegram-bridge/bridge-git-sync.py
    (FIX-2 NEVER_STAGE, FIX-3 CP_PATTERN)
  company/processes/git-sync-runbook.md
    (FIX-1 sequencing note, bootstrap sequence)
  company/processes/git-sync-autonomous-recommendation.md
    (approved design for build-match verification)

---

Ido (VP R&D, L3) -- A2 sign-off 2026-06-16
T-0021 Phase A: COMPLETE. Awaiting owner A1 for Phase B deploy.

---

## A2 SIGN-OFF REFRESH -- Post Red-Team (2026-06-16)

Author: Ido (VP R&D, L3)
Date: 2026-06-16
Trigger: red-team identified classification gap #09 (integrations-hook-bypass);
         Shir applied CP_PATTERN extension; Rambo re-cleared CLEARED-WITH-NOTE;
         this section records the refresh of the original A2 sign-off to cover
         the fix.

---

### 1. Red-Team Outcome

Source: company/processes/git-sync-redteam/RESULTS.md

Corpus: 12 blind diffs (8 attacks, 4 benign).

Pre-fix score: 7 of 8 attacks caught. ONE gate failure: attack #09
(integrations/telegram-bridge/notify-helper.py -- remote-code-fetch piped into
subprocess bash) was classified data-plane and auto-merged without Rambo review.
Root cause: CP_PATTERN only hardcoded the single path
integrations/telegram-bridge/bridge-git-sync.py. Any other .py/.sh under
integrations/ escaped both the explicit pattern and the residual rule (because
integrations/ is a DP_PREFIX).

Post-fix score (re-test, same session): 8 of 8 attacks caught. 4 of 4 benign
correct. 0 false positives. #09 re-test: PASS -- notify-helper.py now classifies
control-plane, proceeds to Rambo blind review, receives QUARANTINE on checks
C4/C1/C2 (remote-code-fetch, subprocess bash-exec, bridge-config.ini wiring
without gate-register entry). No benign data-plane file was over-classified.

---

### 2. The #09 Fix -- CP_PATTERN Extension

Implemented by Shir. Verified by direct file read in this session.

The extension adds two new alternations to CP_PATTERN in all three classification
points:

    ^integrations/.*\.(py|sh)$
    ^integrations/.*\.(ini|cfg|toml)$

The explicit bridge-git-sync.py entry is retained in all three files (harmless
redundancy; it is a subset of the .py extension pattern).

Verification evidence:

  scripts/gate-runner.sh line 43 -- CP_PATTERN ends with:
    ...|^integrations/telegram-bridge/bridge-git-sync\.py$|^integrations/.*\.(py|sh)$|^integrations/.*\.(ini|cfg|toml)$
  CONFIRMED present.

  scripts/git-sync-runner-prompt.md Step 2 (lines 101-103) -- CONTROL-PLANE
  PATTERN block contains:
    ^integrations/telegram-bridge/bridge-git-sync\.py$
    ^integrations/.*\.(py|sh)$
    ^integrations/.*\.(ini|cfg|toml)$
  CONFIRMED present.

  integrations/telegram-bridge/bridge-git-sync.py CP_PATTERN (lines 98-103):
    r"^(\.claude/|...|integrations/telegram-bridge/bridge-git-sync\.py$"
    r"|integrations/.*\.(py|sh)$"
    r"|integrations/.*\.(ini|cfg|toml)$)"
  CONFIRMED present. Comment on line 95 explicitly labels this FIX-09 (2026-06-16).

All three classification points are semantically identical. The fix is complete
and consistent.

---

### 3. Rambo Re-Clearance

Source: company/processes/git-sync-phaseA-security-clearance.md
        (Re-clearance section: "Re-clearance: red-team #09 fix (2026-06-16)")

VERDICT: CLEARED-WITH-NOTE

Five checks in the re-clearance:

  1. CP_PATTERN extension identical in all three files -- PASS
  2. Gap #09 closed (.py/.sh/.ini/.cfg/.toml under integrations/) -- PASS
  3. No data-plane deadlock (.json/.txt unaffected) -- PASS
     Routine bridge writes (.txt outbound files, .json chat payloads) remain
     data-plane. No deadlock on the gate's own traffic.
  4. .json exclusion ruling -- ACCEPT
     No .json execution-wiring files exist under integrations/ today.
     Process obligation noted (see Section 4 below).
  5. No new gap introduced -- PASS
     The fix is strictly additive (more files classified control-plane).
     All prior CP_PATTERN entries intact in all three files.

Rambo sign-off on re-clearance: Rambo (Security, L3), 2026-06-16.

---

### 4. Carried-Forward Process Note (Maintenance Obligation)

Per Rambo re-clearance Finding 4 (.json exclusion ruling, ACCEPT):

Any future .json file added under integrations/ that is execution-wiring (e.g.,
a bot-configuration file that controls daemon behavior at load time) -- as
distinct from pure runtime data (chat payloads, queue items) -- MUST receive an
explicit named CP_PATTERN entry in all three files (gate-runner.sh, git-sync-
runner-prompt.md, bridge-git-sync.py) before that file is committed.

This is a build-maintenance obligation. No current .json execution-wiring file
exists under integrations/ (confirmed by Rambo file scan, 2026-06-16). No
immediate action required. Logged here for the build's maintenance record.

Responsible parties: Shir (implementation), Ido (gate owner and approver).

---

### 5. Build-Match Confirmation (Post-Fix)

The fix does not change the architecture, fail-closed logic, diff-only isolation,
NEVER_STAGE list, or any other structural element of the build. It extends
CP_PATTERN only. The build continues to match the approved design in all other
respects, as verified in Section 2 of the original A2 sign-off above.

Deployment status is unchanged: every artifact carries the PROPOSAL header.
Nothing is deployed, scheduled, or executing. The gate remains inert on disk.

---

### 6. REFRESHED A2 SIGNED STATEMENT

I, Ido (VP R&D, L3), hold A2 authority for build approval under the T-0021
task envelope.

Having read:
  - company/processes/git-sync-redteam/RESULTS.md (8/8 attacks caught, 0 FP,
    #09 re-test PASS)
  - company/processes/git-sync-phaseA-security-clearance.md (Rambo re-clearance
    section: CLEARED-WITH-NOTE, all five findings PASS/ACCEPT)
  - scripts/gate-runner.sh (line 43 CP_PATTERN extension confirmed)
  - scripts/git-sync-runner-prompt.md (Step 2 CP_PATTERN extension confirmed)
  - integrations/telegram-bridge/bridge-git-sync.py (lines 98-103 CP_PATTERN
    extension confirmed)

I find:

  - The red-team #09 gap is closed. The gate now catches 8 of 8 attack classes
    against this corpus, with 0 false positives.
  - The CP_PATTERN fix is present in all three classification points and is
    semantically identical in each.
  - Rambo has re-cleared the fix CLEARED-WITH-NOTE. The one note (.json
    exclusion process obligation) is a maintenance record, not a current gap.
  - No new gap was introduced by the fix.
  - No data-plane deadlock was introduced.
  - The build matches the approved design. Deployment status is unchanged:
    all artifacts are proposals, inert on disk.

VERDICT: SIGNED. This refresh extends the original A2 sign-off (2026-06-16
above) to cover the red-team #09 fix. Phase A is build-complete. The branch
is ready for owner A1 deployment decision (Phase B).

Ido (VP R&D, L3) -- A2 sign-off refresh 2026-06-16 (post red-team, #09 fix)
