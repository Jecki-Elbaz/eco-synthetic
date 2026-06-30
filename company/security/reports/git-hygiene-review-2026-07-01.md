# Security Review: Git/CI-CD Hygiene Automation
# Date: 2026-07-01
# Reviewer: Rambo (Security, L3)
# Task: Owner A1 2026-06-30 -- close loop before activation
# Verdict: CLEAR-WITH-CONDITIONS

---

## Scope Reviewed

1. integrations/git-hygiene/audit.py -- deterministic audit script
2. integrations/runner/runner.py -- run_git_hygiene() function + main() call site
3. .claude/hooks/guard.py -- guard integrity check (no-edit verification)
4. .claude/agents/Shir.md -- role scope and chain-of-command boundaries

---

## Findings

### F-01 | Severity: LOW | audit.py lines 62-64 -- diff commands present but SAFE

Three `git diff` calls exist:
  - Line 62: `git diff --cached --name-only`
  - Line 63: `git diff --name-only`
  - Line 64: `git ls-files --others --exclude-standard`

All three use `--name-only` or equivalent (ls-files lists paths). None dump file
contents or diff hunks. `git diff` without `--name-only` would print contents;
with `--name-only` it prints paths only. The red-line-1 constraint is honoured.
No `.env` path handling; the script never filters for or opens `.env` itself.

Mitigation: none required. The `--name-only` flag is the correct guard and it is
present on every diff call. Document this as reviewed for future maintainers.

### F-02 | Severity: LOW | audit.py line 77 -- path parsing of porcelain output

The script parses `git status --porcelain` line 76-80 to extract area paths. The
parse is `ln[3:]` (strips the two-char status code plus space). No shell expansion,
no eval, no exec. The extracted string is used only as a dict key for counting.
No path traversal risk: the result is never passed to a filesystem call or another
subprocess.

Mitigation: none required.

### F-03 | Severity: NONE | No shell=True anywhere in audit.py

`_git()` at line 43 uses `subprocess.run(["git", *args], ...)` -- a fixed argv
list. No string interpolation of external input into the command. No shell=True.
No command injection surface. Arguments to `_git()` are all hardcoded string
literals in `collect()` -- no caller-supplied strings are ever spliced in.

### F-04 | Severity: NONE | runner.py run_git_hygiene() does NOT touch guard.py

`run_git_hygiene()` (lines 254-288) calls:
  `subprocess.run([sys.executable, str(AUDIT_SCRIPT)], ...)`
This spawns a plain Python process, not a claude/LLM session. It does not set
RUNNER_CONTEXT=1 (that env var is set only on `run_job()` claude invocations at
line 228). The audit.py subprocess therefore runs outside the guard hook entirely
-- by design, because it is NOT an LLM agent session. The guard only fires on
PreToolUse events inside a claude session. This is architecturally correct.

No new Bash surface is introduced. The LLM/agent guard Bash block is untouched.

### F-05 | Severity: NONE | SAFE_MODE is respected

runner.py main() at lines 298-300 checks `safe_mode_active()` and returns early
(exit 0) before reaching the `run_git_hygiene()` call at line 314. SAFE_MODE
correctly halts the audit subprocess along with all agent jobs.

Wait -- re-checking call order: `safe_mode_active()` check is lines 298-300;
`run_git_hygiene()` call is line 314. The early return at line 300 (`return 0`
inside `if safe_mode_active() and not a.dry_run`) happens before line 314.
Confirmed: SAFE_MODE halts git hygiene too.

### F-06 | Severity: LOW | audit.py writes to integrations/git-hygiene/ -- within Shir PATH_SCOPE

`write_reports()` writes to:
  - integrations/git-hygiene/last-audit.md (overwrite)
  - integrations/git-hygiene/audit-log.md (append)

audit.py runs as a Python subprocess, not as a Shir agent session, so guard.py
PATH_SCOPE rules do not apply at the OS level. The write destinations are within
integrations/ which is Shir's allowed write scope per both Shir.md and guard.py
PATH_SCOPE (line 127: "integrations/"). No drift outside that scope is possible
given the hardcoded ROOT/HYGIENE_DIR constants.

Condition: the hardcoded ROOT path (line 28: `Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")`)
must match the production deploy path. If the repo ever moves, audit.py writes
will silently go to the old hardcoded location. Flag to Shir/Ido at any repo
relocation.

### F-07 | Severity: NONE | guard.py integrity confirmed -- NOT modified

guard.py was read in full. The RUNNER_CONTEXT Bash block (lines 253-264) is
intact. The RED_PREFIXES/RED_EXACT deny lists (lines 145-153) are intact. The
runner-path early returns (`tool == "bash"` -> DENY, lines 256-257; `tool in
("task","agent")` -> DENY, lines 258-259) are unchanged. The decide() function
hard-enforcement for RUNNER_CONTEXT (lines 391-402) is intact. No weakening
found. Guard.py was NOT edited by the git-hygiene work.

### F-08 | Severity: LOW | Shir chain-of-command exception is bounded

Shir.md lines 63-66 define the narrow exception: git/CI-CD hygiene function only,
tasked by Eco/owner directly. The exception explicitly states it does NOT extend to
other tasks and does not create a general Eco->Shir bypass. The cert note at lines
163-168 restates this boundary. The exception is textually confined.

The runner invokes audit.py as a subprocess, not as a Shir agent session, so no
Shir agent chain-of-command concern arises from the automated path. When Shir
runs as an LLM agent for fix work, the narrow exception applies only to the
hygiene function.

### F-09 | Severity: NONE | Dry-run honoured in run_git_hygiene()

Lines 269-271 show `if dry: print(...); return` before any subprocess call. The
dry-run flag correctly suppresses audit.py execution.

### F-10 | Severity: LOW | Telegram alert reuses existing send_telegram() -- no new egress

Line 285 calls `send_telegram(f"[Git hygiene -- Shir]\n\n{msg}")`. This is the
same function at lines 194-205 used by all other runner jobs. No new HTTP client,
no new endpoint, no new token. The 3900-char truncation cap is inherited. No new
egress surface.

The message content is constructed from audit.py stdout (lines 283-284): the
first stdout line is dropped (it is the machine status line) and the remainder is
the deterministic owner message from `owner_message()`. That function (audit.py
lines 116-124) builds from flag strings only -- never file contents. Safe.

---

## Future Automation (Proposal -- NOT activated)

Shir proposed pre-commit, pre-push, and session-end hooks. These are currently
proposals only. Switching ANY of these on requires:
  1. Full Rambo gate review (risk + scope).
  2. Eyal gate review (terms / legal exposure if hooks touch external services).
  3. Owner A1 approval.

This is confirmed. No hook is active. This review does NOT clear those proposals.
They remain proposals until the gate runs.

---

## Verdict: CLEAR-WITH-CONDITIONS

The git/CI-CD hygiene automation as built is safe to activate. The design correctly
sidesteps the guard Bash block by running a deterministic Python subprocess rather
than a claude/LLM tool call. guard.py is intact and unweakened. No secret
exfiltration path exists in audit.py. No new shell surface is introduced.

Conditions (all LOW severity; none are activation blockers):

C1: Document in integrations/git-hygiene/procedure.md (or a code comment) that
    the three `git diff --name-only` calls are intentionally name-only and have
    been security-reviewed. This makes future audits faster and prevents a
    well-meaning dev from "fixing" them to show content.

C2: Add a hardcoded-ROOT note to audit.py (or procedure.md): if the repo path
    ever changes, ROOT must be updated in audit.py or write targets will silently
    mismatch. Low risk now; medium risk if the repo relocates.

C3: Future pre-commit/pre-push/session-end hook proposals must run the full gate
    (Rambo + Eyal + owner A1) before any activation. Confirmed above; record here
    for the audit trail.

guard.py integrity: CONFIRMED INTACT. No edits, no weakening.
