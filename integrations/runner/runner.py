#!/usr/bin/env python3
"""Eco-Synthetic canonical proactivity runner (closes SHIR-005).

Multi-agent fan-out driven by integrations/runner/agent-prompts.md (Eco-authored task
envelopes) with the safety/cost engine:
  - Per-agent task prompts (specific) with generic fallback.
  - Cadence due-tracking via memory/runner-state.json (2h / daily[@HH] / weekly-Mon / monthly-1st).
  - Actionability cost-gate on the frequent Eco 2h job (skip the spawn if nothing can move).
  - Per-agent MODEL from .claude/agents/<Agent>.md frontmatter; persona loaded via
    --append-system-prompt (the role file).
  - TOOL STRIPPING (T-0020 C3): allowed tools are an explicit whitelist; Bash/WebFetch/
    WebSearch are NEVER granted. readonly -> Read; act -> Read,Write,Edit.
  - Routing: Telegram-facing -> sendMessage to owner (suppress on NO_ACTIONABLE_CONTENT);
    file-output -> the agent writes its own file, runner only logs.
  - ESCALATE_TO_ECO* protocol: a file-output agent can request an Eco surfacing this cycle.
  - Lital-before-Eyal ordering (they share compliance-backlog.md) -- enforced by file order.
  - SAFE_MODE kill switch; every run appended to memory/agent-runs.jsonl.

Usage: runner.py [--mode readonly|act] [--dry-run] [--only AgentName]
Run by Task Scheduler ~every 2h. The PreToolUse guard (.claude/hooks/guard.py) still
evaluates every write inside each spawned agent session.
"""
import sys, os, re, json, time, subprocess, shutil, argparse, contextlib
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
DECISIONS_LOG = ROOT / "company" / "decisions" / "decisions-log.md"

# AUD-001: load file-lock helper via importlib (directory name contains a hyphen).
import importlib.util as _ilu
_fl_spec = _ilu.spec_from_file_location(
    "file_lock",
    ROOT / "integrations" / "file-lock" / "file_lock.py",
)
_fl_mod = _ilu.module_from_spec(_fl_spec)
_fl_spec.loader.exec_module(_fl_mod)  # type: ignore[union-attr]
acquire_file_lock = _fl_mod.acquire_file_lock
release_all_held_locks = _fl_mod.release_all_held_locks

PROMPTS = ROOT / "integrations" / "runner" / "agent-prompts.md"
AUDIT_SCRIPT = ROOT / "integrations" / "git-hygiene" / "audit.py"
GIT_HYGIENE_KEY = "Shir:git-hygiene-audit"
DASH_SCRIPT = ROOT / "integrations" / "dashboard" / "agent_dashboard.py"
DASH_KEY = "Eco:agent-perf-dashboard"
# Guard proof-suite check (Rambo advisory 2026-07-26). The autonomy guard's own test
# suite had never once executed -- pytest was named as the framework in the global
# CLAUDE.md but was not installed in any interpreter, so 15 stale failures sat unseen
# for an unknown period while the C1 clearance rested on that suite as evidence.
# This job makes "the proof suite is green" a daily zero-token fact instead of a memory.
GUARD_SUITE_KEY = "Rambo:guard-proof-suite"
GUARD_SUITE_TEST = ROOT / ".claude" / "hooks" / "test_guard.py"
GUARD_SUITE_TMP = ROOT / ".pytest-basetemp"  # gitignored; see run_guard_suite()
# T-0045 zero-token task-hygiene scan (owner A1 2026-08-02). Open since 2026-07-14.
HYGIENE_KEY = "Eco:task-hygiene-scan"
HYGIENE_SCRIPT = ROOT / "integrations" / "task-hygiene" / "stale_detector.py"
HYGIENE_REPORT = ROOT / "memory" / "task-hygiene-report.md"
# APS-022 retention purge (S8-SHIR-PURGEJOB, Sprint 8 envelope 2026-07-13)
PURGE_ARC_JOB_KEY = "purge_expired_arc_summaries"
APS_APP_DIR = ROOT / "projects" / "ai-patient-simulator" / "app"
PURGE_SCRIPT = APS_APP_DIR / "apps" / "api" / "src" / "scripts" / "purge-expired-arc-summaries.mjs"
BOARD = ROOT / "memory" / "board.md"
# AUD-001: agent -> shared files map (populated here because BOARD and DECISIONS_LOG
# must be defined first).  Add new entries when a new runner-path agent writes board.md
# or decisions-log.md.  Values are lists of Path objects passed to acquire_file_lock().
_AGENT_LOCKS: dict[str, list] = {
    "eco": [BOARD, DECISIONS_LOG],   # Eco updates board rows + may log decisions
    "oracle": [DECISIONS_LOG],       # Oracle writes chronicle entries to decisions-log
}
RUNLOG = ROOT / "memory" / "agent-runs.jsonl"
STATE = ROOT / "memory" / "runner-state.json"
# DISPATCH 2026-08-02: per-cycle sub-agent dispatch budget, written by .claude/hooks/guard.py
# and read here for audit attribution. Agents are denied write access to it by the guard.
SPAWN_COUNT_FILE = ROOT / "memory" / "runner-spawn-count.json"
SAFE_MODE_FILE = ROOT / "memory" / "SAFE_MODE"
NOTIFY_MUTE_FILE = ROOT / "memory" / "MUTE_2H_UNTIL"  # ISO date = first day back to normal
AGENTS_DIR = ROOT / ".claude" / "agents"
OWNER_CHAT = "63160285"
TOOLS = {"readonly": "Read", "act": "Read,Write,Edit"}
# Per-job tool overrides: keys match job["key"]; values replace TOOLS[mode] for that job.
# REWIRED 2026-07-10 (owner A1, Google access restructure): the project .mcp.json now
# registers GR-009 workspace-mcp (server `google_workspace`, isolated eco-creds credential
# store), so the screen job uses mcp__google_workspace__* Gmail READ tools instead of the
# claude.ai connector tools (which attach only in claude.ai web sessions -- SHIR-007).
PER_JOB_TOOLS = {
    # DISPATCH 2026-08-02 (owner A1): the Eco 2h check-in owns the 72h stale-sweep, and until
    # now it could only append "REACTIVATED" notes no agent would ever read -- the runner path
    # could spawn nobody, so every task needing another agent waited for an owner session.
    # The Agent/Task tool is granted here ONLY for that job. The guard is the real boundary:
    # it allows dispatch only to RUNNER_SPAWN_ALLOW (rambo/eyal/dalia/anat), depth 1, act
    # cycles only, capped at RUNNER_SPAWN_CAP per cycle. Bash-holders stay owner-session-only
    # and get queued into memory/dispatch-queue.md instead.
    "Eco:2h Check-in (every 2h)": "Read,Write,Edit,Task,Agent",
    # The guaranteed once-daily FULL 72h stale-sweep lives in the AM brief (see the COST-TRIM
    # note below), so that job needs the same dispatch capability.
    "Eco:AM Brief (daily 08:00)": "Read,Write,Edit,Task,Agent",
    "Rambo:Adam Inbox Screen (every 2h; EXPIRES 2026-07-28 or on Adam reply)": (
        "Read,Write,Edit,"
        "mcp__google_workspace__search_gmail_messages,"
        "mcp__google_workspace__get_gmail_message_content,"
        "mcp__google_workspace__get_gmail_thread_content"
    ),
}
# Jobs registered but DISABLED pending a prerequisite. Key = job["key"]; value = reason.
# To re-enable: satisfy the prerequisite, remove the key, re-run the tool probe.
# 2026-07-10: Rambo inbox-screen RE-ENABLED after the Google access restructure wired
# workspace-mcp via .mcp.json (owner A1; the SHIR-007 prerequisite is satisfied).
# NOTE: the job stays inert until the owner completes the eco.synthetic.org@gmail.com
# OAuth consent into eco-creds -- until then Gmail calls fail and the job reports
# GMAIL_TOOLS_UNAVAILABLE per its prompt.
DISABLED_JOBS = {
    # APS-022 retention purge. Deletes ArcSessionSummary rows WHERE
    # retainUntil IS NOT NULL AND retainUntil < NOW(). DISABLED: enable
    # only at pilot go-live (owner A1) when real student data exists.
    # Zero-token (node script, not LLM). Ref: Sprint 8 envelope 2026-07-13.
    PURGE_ARC_JOB_KEY: (
        "APS-022 retention purge -- enable only at pilot go-live (owner A1) "
        "when real student data exists. Deletes ArcSessionSummary rows "
        "(retainUntil IS NOT NULL AND retainUntil < NOW()). Zero-token script. "
        "Ref: Sprint 8 envelope 2026-07-13."
    ),
    # NOTE 2026-07-14: an earlier same-day lapse entry for the Rambo Adam Inbox
    # Screen job was REMOVED -- superseded by the fresh owner A1 extension to
    # 2026-07-28 (agent-prompts.md AUTHORITY block, Phase 8 audit F-S815). The
    # job's prompt-level step-0 expiry now carries the extended terms.
}
HOLD = ("on hold", "on-hold", "blocked on", "blocked-until", "waiting on",
        "waiting-on", "pending owner", "queued until")

# SHIR-FIX-02: per-model timeout table (seconds)
MODEL_TIMEOUTS = {"opus": 600, "sonnet": 300, "haiku": 180}
CLAUDE_TIMEOUT_DEFAULT = 300

# Per-agent timeout overrides (seconds). Use when a job's workload consistently exceeds
# the model-default timeout. Key = lowercase agent name; value overrides MODEL_TIMEOUTS.
# ORC-timeout-fix 2026-07-18 (Eco A2): Oracle daily chronicle reads many files across
# multiple batches; bumped to opus-tier 600s to prevent TimeoutExpired -> error_final.
PER_AGENT_TIMEOUTS: dict = {
    "oracle": 600,
}

# Per-JOB timeout overrides (seconds), applied after the per-agent override. Key = job["key"].
# Use this instead of PER_AGENT_TIMEOUTS when only one of an agent's jobs is slow.
# 2026-08-02:
#  - Eco's dispatching jobs now run sub-agents inside their own window; three dispatches will
#    not fit in the 300s Sonnet default.
#  - Rambo's weekly permission-drift scan has ended in error_final (TimeoutExpired) on EVERY
#    run since 2026-07-18 -- six consecutive weeks -- while the owner dashboard reported it
#    "OK" because the dashboard read the last run DATE and not the last TERMINAL event. The
#    scan reads ~32 role files plus the guard and the allowlist; 300s was never enough.
PER_JOB_TIMEOUTS: dict = {
    "Eco:2h Check-in (every 2h)": 900,
    "Eco:AM Brief (daily 08:00)": 900,
    "Rambo:Weekly Permission-Drift Scan (Mondays)": 900,
}

# Default model id for runner-path agents. ECO-MODEL-FIX 2026-07-24 (adopted from
# origin/master 293a9c8 during the 2026-07-25 reconcile): bumped from the retired
# "claude-sonnet-4-6" id (an unavailable model id makes `claude --print` exit 1 with the
# error on STDOUT and an EMPTY stderr -- the "rc=1: no stderr" class of silent failures
# the Eco 2h job was hitting) to the current Sonnet tier. Keep a "sonnet" substring so
# _model_timeout() still resolves to the 300s Sonnet timeout.
DEFAULT_MODEL = "claude-sonnet-5"

# SHIR-FIX-03: Eco runner-path model override (interactive-session model unchanged).
# Eco's role file typically specifies Opus; the runner uses Sonnet by default to avoid
# session-limit + timeout failures (Ido A3 pre-approved 2026-07-11).
# Override via env: RUNNER_MODEL_OVERRIDE=<model-id>
RUNNER_ECO_MODEL = os.environ.get("RUNNER_MODEL_OVERRIDE", DEFAULT_MODEL)

# SHIR-FIX-06: patterns in combined stdout+stderr that trigger one bounded retry
RETRY_PATTERNS = (
    "session limit",
    "connection refused",
    "failedtoopensocket",
    "stalled mid-stream",
    "response stalled",
)

# Path safety (2026-06-28): Claude Code reserves a bare relative "memory/" path as its own
# MANAGED per-project store (~/.claude/projects/<hash>/memory/). A runner agent writing a NEW
# file via a bare "memory/..." path lands THERE, not in the repo (verified: Assaf's cost
# snapshots were misrouted). Force agents onto absolute repo paths so writes reach the repo.
PATH_DIRECTIVE = (
    f"FILE PATHS (critical): this project's root is {ROOT}. Whenever a task names a file "
    "under memory/, company/, dashboards/, projects/, marketing/ or .claude/, read and WRITE "
    f"it at its ABSOLUTE path under the root -- e.g. {ROOT}\\memory\\wiki\\cost-snapshots\\<date>.md, "
    "NOT a bare 'memory/...' path. Claude Code reserves a bare relative 'memory/' path as a "
    "managed store, so a bare memory/ path will NOT reach this repo. Always use the absolute form."
)

# B2 fix (SEC-0001 2026-07-27 Shir): runner agents must never Edit append-only files.
# The guard hard-blocks Edit on APPEND_ONLY targets regardless of GUARD_MODE on the runner
# path (RUNNER_CONTEXT=1 is hard-enforced). memory/log.md writes are redundant on the runner
# path -- runner.py already logs every run to memory/agent-runs.jsonl.
APPEND_DISCIPLINE = (
    "APPEND-ONLY WRITE RULE (SEC-0001 B2): memory/log.md and "
    "company/decisions/decisions-log.md are APPEND-ONLY audit files protected by the "
    "security guard. NEVER use the Edit tool on either file -- the guard hard-blocks it "
    "on the runner path and logs a violation. "
    "Do NOT write to memory/log.md from runner-path jobs at all -- the runner already "
    "logs your run automatically to memory/agent-runs.jsonl; a separate log.md entry is "
    "redundant and will be blocked. "
    "If you must append to company/decisions/decisions-log.md, use Write with the FULL "
    "current file content followed by your new entry at the bottom (Write-append, not Edit)."
)


def now():
    return datetime.now(timezone.utc)


def log(rec: dict):
    rec["ts"] = now().isoformat()
    try:
        RUNLOG.parent.mkdir(parents=True, exist_ok=True)
        with open(RUNLOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec) + "\n")
    except OSError:
        pass


def safe_mode_active() -> bool:
    try:
        return SAFE_MODE_FILE.exists() and SAFE_MODE_FILE.read_text(encoding="utf-8").strip() != ""
    except OSError:
        return True  # fail-safe


def find_claude() -> str:
    """Resolve the claude CLI, PREFERRING the real .exe over the npm .cmd shim.

    ECO-CMDLINE-FIX 2026-07-18 (root cause of silent rc=1 job failures 07-17/18):
    claude.cmd is a batch shim that routes through cmd.exe, which enforces an
    8191-character command-line limit. The runner passes the agent role file
    (~8000 chars) as an --append-system-prompt ARGUMENT, so total argv length
    sits at the limit's edge; the per-job Gmail tools list pushed jobs over ->
    instant "The command line is too long." on stderr, rc=1, empty stdout,
    logged as a clean done (see the rc!=0 fix in run_job). Invoking the .exe
    directly uses CreateProcess (32767-char limit) and removes the failure mode.
    """
    appdata_npm = Path(os.environ.get("APPDATA", "")) / "npm"
    exe = appdata_npm / "node_modules" / "@anthropic-ai" / "claude-code" / "bin" / "claude.exe"
    if exe.exists():
        return str(exe)
    for n in ("claude.cmd", "claude", "claude.ps1"):
        p = shutil.which(n)
        if p:
            # If which() found the .cmd shim, try to resolve its sibling .exe too.
            sib = Path(p).parent / "node_modules" / "@anthropic-ai" / "claude-code" / "bin" / "claude.exe"
            if sib.exists():
                return str(sib)
            return p
    cand = appdata_npm / "claude.cmd"
    return str(cand) if cand.exists() else "claude"


def load_state() -> dict:
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_state(state: dict):
    # SHIR-FIX-01: atomic write-temp-then-rename; a crash mid-write never corrupts STATE
    try:
        tmp = STATE.with_suffix(".tmp")
        tmp.write_text(json.dumps(state, indent=2), encoding="utf-8")
        tmp.replace(STATE)
    except OSError:
        pass


def _model_timeout(model: str) -> int:
    """SHIR-FIX-02: return per-model timeout from MODEL_TIMEOUTS table."""
    ml = model.lower()
    for key, val in MODEL_TIMEOUTS.items():
        if key in ml:
            return val
    return CLAUDE_TIMEOUT_DEFAULT


def _stdout_diag(raw: str) -> str:
    """Extract a human-readable error message from CLI stdout for failure logging.

    ECO-STDOUT-FIX 2026-07-25 (same class of bug SHIR-001 found in the bridge on
    2026-06-22): the claude CLI writes fatal errors to STDOUT, not stderr -- e.g.
    "Failed to authenticate: OAuth session expired and could not be refreshed" --
    often with EMPTY stderr. Under --output-format json a failure may arrive as a
    JSON envelope ({is_error, result}); a pre-JSON fatal (auth) arrives as plain
    text. Return the most meaningful bounded snippet, or '' when stdout is empty."""
    raw = (raw or "").strip()
    if not raw:
        return ""
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            msg = data.get("result") or data.get("error") or data.get("message")
            if msg:
                return " ".join(str(msg).split())
    except (json.JSONDecodeError, TypeError):
        pass
    return " ".join(raw.split())


def _invoke_claude(cmd: list, stdin_data: bytes, env: dict, timeout: int, cwd: str) -> tuple:
    """SHIR-FIX-06: single claude CLI invocation. Returns (rc, raw_stdout, err_tag).
    err_tag is None on a clean run or a short string identifying a retryable failure."""
    try:
        r = subprocess.run(cmd, input=stdin_data, capture_output=True,
                           timeout=timeout, cwd=cwd, check=False, env=env)
        raw = r.stdout.decode("utf-8", "replace").strip()
        stderr_text = r.stderr.decode("utf-8", "replace").strip()
        combined = (raw + " " + stderr_text).lower()
        for pat in RETRY_PATTERNS:
            if pat in combined:
                return r.returncode, raw, pat
        # ECO-CMDLINE-FIX 2026-07-18: a nonzero exit is a FAILURE even when stderr
        # matches no retry pattern. Previously rc=1 + empty stdout was logged as a
        # clean "done" -- jobs failed silently for ~36h ("command line is too long").
        # ECO-STDOUT-FIX 2026-07-25: the CLI emits auth and other fatal errors on
        # STDOUT with empty stderr, so the old stderr-only tag logged "no stderr"
        # and discarded the real cause (e.g. the OAuth-expired message). Prefer
        # stderr, then fall back to a stdout-extracted diagnostic.
        if r.returncode != 0:
            diag = stderr_text or _stdout_diag(raw) or "no stderr/stdout"
            return r.returncode, raw, f"rc={r.returncode}: {diag[:200]}"
        return r.returncode, raw, None
    except subprocess.TimeoutExpired:
        return -1, "", "TimeoutExpired"
    except Exception as e:
        return -1, "", f"{type(e).__name__}: {str(e)[:100]}"


def _extract_error_detail(raw: str) -> str:
    """ECO-STDOUT-SURFACE 2026-07-24: pull a human-readable error snippet from the
    `claude --output-format json` STDOUT. With --output-format json the CLI writes its
    real failure to STDOUT (a JSON envelope), NOT stderr -- so the runner's stderr-only
    err_tag reports "rc=1: no stderr" while the actual cause sits unshown in stdout.
    Best-effort: parse the envelope for an error/result field; fall back to a truncated
    raw string. Returns '' when stdout is empty (nothing to add to the alert)."""
    if not raw:
        return ""
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            for k in ("error", "result", "message", "subtype"):
                v = data.get(k)
                if isinstance(v, str) and v.strip():
                    return v.strip()[:300]
    except (json.JSONDecodeError, TypeError):
        pass
    return raw.strip()[:300]


def _parse_json_output(raw: str) -> tuple:
    """SHIR-FIX-07: parse --output-format json stdout.
    Returns (text, cost_usd, model_used, usage_dict, duration_api_ms). Fallback on non-JSON."""
    try:
        data = json.loads(raw)
        # ECO-CMDLINE-FIX 2026-07-18: the CLI envelope uses total_cost_usd (not
        # cost_usd) and carries models under modelUsage keys (no top-level model).
        cost = data.get("total_cost_usd", data.get("cost_usd"))
        model = data.get("model")
        if not model and isinstance(data.get("modelUsage"), dict):
            model = ",".join(sorted(data["modelUsage"].keys()))
        # DASH-DURATION 2026-07-29: the envelope also carries duration_api_ms + duration_ms;
        # surface the API duration for the dashboard's compute-time column.
        dur = data.get("duration_api_ms") or data.get("duration_ms")
        return (data.get("result", raw), cost, model, data.get("usage", {}) or {}, dur)
    except (json.JSONDecodeError, AttributeError, TypeError):
        return raw, None, None, {}, None


def agent_model(agent: str) -> str:
    try:
        txt = (AGENTS_DIR / f"{agent}.md").read_text(encoding="utf-8")
        m = re.search(r"(?mi)^model:\s*([A-Za-z0-9._-]+)", txt)
        return m.group(1) if m else DEFAULT_MODEL
    except OSError:
        return DEFAULT_MODEL


def role_text(agent: str) -> str:
    try:
        return (AGENTS_DIR / f"{agent}.md").read_text(encoding="utf-8")[:8000]
    except OSError:
        return f"You are {agent} at Eco-Synthetic. Follow your role file and the project CLAUDE.md."


def parse_prompts() -> list:
    """Parse agent-prompts.md into jobs: {key, agent, task, cadence, tg, prompt}."""
    try:
        txt = PROMPTS.read_text(encoding="utf-8")
    except OSError:
        return []
    jobs = []
    # Each section: "## <Agent> -- <Task> (<cadence>)\nTelegram-facing: <x>\n...```\n<prompt>\n```"
    pat = re.compile(
        r"^##\s+(?P<agent>[^\-\n]+?)\s+--\s+(?P<task>.+?)\n"
        r"Telegram-facing:\s*(?P<tg>.+?)\n.*?```\n(?P<prompt>.*?)\n```",
        re.DOTALL | re.MULTILINE,
    )
    for m in pat.finditer(txt):
        agent = m.group("agent").strip()
        task = m.group("task").strip()
        cad = task.lower()  # scan the whole title for cadence keywords (handles multi-paren titles)
        # Extract hard expiry date from task title (EXPIRES YYYY-MM-DD -- code-level gate).
        exp_m = re.search(r"\bEXPIRES\s+(\d{4}-\d{2}-\d{2})\b", task, re.IGNORECASE)
        jobs.append({
            "key": f"{agent}:{task}",
            "agent": agent,
            "task": task,
            "cadence": cad,
            "tg": m.group("tg").strip().upper(),
            "prompt": m.group("prompt").strip(),
            "expiry": exp_m.group(1) if exp_m else None,
        })
    return jobs


def is_due(job: dict, state: dict, t: datetime) -> bool:
    # Hard expiry gate: code-level (authoritative); prompt-level is defense-in-depth only.
    expiry = job.get("expiry")
    if expiry:
        try:
            if t.date() > datetime.fromisoformat(expiry).date():
                return False
        except ValueError:
            pass
    last = state.get(job["key"], {}).get("last")
    last_dt = None
    if last:
        try:
            last_dt = datetime.fromisoformat(last)
        except ValueError:
            last_dt = None
    cad = job["cadence"]
    hh = None
    mh = re.search(r"(\d{1,2}):\d{2}", cad)
    if mh:
        hh = int(mh.group(1))
    # Most-specific first (a title like "daily, fold into eco 2h" is DAILY, not 2h).
    if "month" in cad:
        if t.day != 1:
            return False
        return not (last_dt and (last_dt.year, last_dt.month) == (t.year, t.month))
    if "week" in cad or "monday" in cad:
        # SHIR-FIX-04: catch-up -- fire regardless of weekday if >8 days since last successful run
        if last_dt and (t.date() - last_dt.date()).days > 8:
            return True
        if t.weekday() != 0:  # Monday
            return False
        return not (last_dt and last_dt.isocalendar()[:2] == t.isocalendar()[:2])
    if "daily" in cad:
        if last_dt and last_dt.date() == t.date():
            return False
        return hh is None or t.hour >= hh
    if "2h" in cad:
        return last_dt is None or (t - last_dt).total_seconds() >= 2 * 3600 - 300
    # Unknown cadence -> treat like daily (err toward running, per Assaf).
    return not (last_dt and last_dt.date() == t.date())


def actionable_gate() -> int:
    """Pure-code gate for the cost-sensitive Eco 2h job. Returns actionable count;
    -1 on parse failure (caller treats as run)."""
    try:
        n = 0
        for line in BOARD.read_text(encoding="utf-8").split("\n"):
            if not line.lstrip().startswith("|"):
                continue
            parts = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(parts) < 3 or parts[2].lower() not in ("open", "in-progress"):
                continue
            if any(mk in line.lower() for mk in HOLD):
                continue
            n += 1
        return n
    except Exception:
        return -1


# COST-TRIM surgical (b) 2026-07-29 (Eco A2): change-based gate for the Eco 2h check-in.
# The 2h cycle exists to TRIAGE new input (newly-blocked/past-due tasks, overdue triggers,
# owner-action needs, Shelly handoffs, Adam's Rambo-screened replies). If NONE of its watched
# inputs changed since the last 2h run, there is nothing new to triage -> skip the expensive
# spawn. This is only safe because the time-based full 72h stale-sweep now runs in the daily
# AM-brief prompt (guaranteed once/day), so the 2h cycle no longer fires "just in case".
# Pure-code, zero-token. Fail-OPEN (return True) on ANY uncertainty -- never silently skip work.
_ECO_2H_INPUT_FILES = [BOARD, DECISIONS_LOG, ROOT / "company" / "governance" / "schedules.md"]
_ECO_2H_INPUT_DIRS = [
    Path(r"C:\Users\Jecki\DEV\shared\handoff\shelly-outbox"),   # Shelly's incoming messages
    ROOT / "shared" / "handoff" / "inbox-screened",             # Rambo-screened Adam mail
]


def eco_2h_inputs_changed(state_key: str) -> bool:
    """True if any watched Eco-2h input was modified after the last 2h run for state_key."""
    try:
        st = json.loads(STATE.read_text(encoding="utf-8"))
        last = st.get(state_key, {}).get("last")
        if not last:
            return True  # never ran -> fire
        last_ts = datetime.fromisoformat(last).timestamp()
    except (OSError, ValueError, KeyError, TypeError):
        return True  # fail open
    newest = 0.0
    for p in _ECO_2H_INPUT_FILES:
        try:
            newest = max(newest, p.stat().st_mtime)
        except OSError:
            pass
    for d in _ECO_2H_INPUT_DIRS:
        try:
            newest = max(newest, d.stat().st_mtime)  # dir mtime catches file add/remove
            for f in d.iterdir():
                try:
                    newest = max(newest, f.stat().st_mtime)
                except OSError:
                    pass
        except OSError:
            pass
    return newest > last_ts


def two_h_notify_muted() -> bool:
    """Time-boxed owner-notification mute for the 2h check-in (auto-expires).
    The job still RUNS and logs; only the owner Telegram ping is suppressed while
    today < the date in memory/MUTE_2H_UNTIL. Missing/blank/invalid file => not muted
    (fail-open to normal notifications)."""
    try:
        raw = NOTIFY_MUTE_FILE.read_text(encoding="utf-8").strip()[:10]
        if not raw:
            return False
        until = datetime.strptime(raw, "%Y-%m-%d").date()
    except (OSError, ValueError):
        return False
    return datetime.now().date() < until


def _spawn_count() -> int:
    """Dispatches taken so far in the current cycle, per the guard's counter file.

    The guard owns this file (it is the only writer that matters -- agents are denied it);
    the runner only READS it, to attribute dispatches to the job that made them. Any error
    reads as 0, which under-reports rather than inventing dispatches that never happened.
    """
    try:
        data = json.loads(SPAWN_COUNT_FILE.read_text(encoding="utf-8"))
        if data.get("cycle_id") != os.environ.get("RUNNER_CYCLE_ID"):
            return 0
        return int(data.get("count", 0))
    except (OSError, ValueError, TypeError, AttributeError):
        return 0


def send_telegram(text: str) -> bool:
    try:
        from dotenv import load_dotenv
        import httpx
        load_dotenv(ROOT / ".env")
        token = os.environ.get("ECO_TELEGRAM_BOT_TOKEN")
        if not token:
            return False
        r = httpx.post(f"https://api.telegram.org/bot{token}/sendMessage",
                       json={"chat_id": int(OWNER_CHAT), "text": text[:3900]}, timeout=30)
        return bool(r.json().get("ok"))
    except Exception:
        return False


def _last_sunday(year: int, month: int) -> datetime:
    """Naive date (00:00) of the last Sunday of a given month."""
    if month == 12:
        d = datetime(year, 12, 31)
    else:
        d = datetime(year, month + 1, 1) - timedelta(days=1)
    return d - timedelta(days=(d.weekday() - 6) % 7)


def _israel_offset_hours(t: datetime) -> int:
    """UTC offset for Israel: +3 in DST, else +2. Dependency-free on purpose -- this box
    has no system tz database and tzdata is not installed, so zoneinfo cannot resolve
    'Asia/Jerusalem' (verified 2026-08-01, Python 3.14). Israel DST runs from the Friday
    before the last Sunday of March (02:00 local) to the last Sunday of October (02:00
    local); boundaries are approximated to the hour, which never matters for the broad
    22:00-09:00 quiet window."""
    year = t.year
    dst_start = (_last_sunday(year, 3) - timedelta(days=2)).replace(tzinfo=timezone.utc)
    dst_end = _last_sunday(year, 10).replace(tzinfo=timezone.utc)
    return 3 if dst_start <= t < dst_end else 2


def owner_local(t: datetime | None = None) -> datetime:
    """Owner-local (Israel) wall-clock for a UTC instant. Used for the quiet-hours check;
    the returned datetime's .hour is owner-local."""
    t = t or now()
    if t.tzinfo is None:
        t = t.replace(tzinfo=timezone.utc)
    return t + timedelta(hours=_israel_offset_hours(t))


QUIET_START_HOUR = 22  # inclusive, owner-local
QUIET_END_HOUR = 9     # exclusive, owner-local


def quiet_hours_active(t: datetime | None = None) -> bool:
    """True during the owner-local quiet window [22:00, 09:00). The owner is out of office
    then; only EMERGENCY notifications pierce it (owner directive 2026-08-01). Everything
    held is re-derived by the ~09:00 digest."""
    h = owner_local(t).hour
    return h >= QUIET_START_HOUR or h < QUIET_END_HOUR


def _is_no_actionable(out: str) -> bool:
    """True when the agent output signals 'nothing to send' -- the sentinel appears as the
    FIRST or LAST non-empty line. Robust to a trailing note after the sentinel (Rambo's inbox
    screen) or a reasoning preamble before it (Eco). Replaces a fragile endswith() that shipped
    the 'no new mail' spam whenever any text followed the sentinel (fixed 2026-08-01)."""
    lines = [ln.strip() for ln in out.splitlines() if ln.strip()]
    return bool(lines) and (
        lines[0] == "NO_ACTIONABLE_CONTENT" or lines[-1] == "NO_ACTIONABLE_CONTENT"
    )


def owner_notify(text: str, *, emergency: bool = False) -> bool:
    """Single owner-facing Telegram gate. Non-emergency pushes are dropped during quiet
    hours (the morning digest re-derives state); emergencies always go through. Returns
    True if a message was actually sent.

    NOTIFY-FIX 2026-08-02: the emergency parameter existed from the start but NO caller ever
    set it, so the "emergencies always go through" promise was never real -- every urgent
    escalation, including Eco's APS-027 P1 escalation on 07-31 and 08-01, was silently
    dropped overnight with no owner-visible trace. Callers now classify (see run_job).
    """
    if not emergency and quiet_hours_active():
        log({"event": "notify_quiet_hours_drop", "chars": len(text)})
        return False
    if emergency and quiet_hours_active():
        # Audit every quiet-hours pierce so over-use of the URGENT bar is visible in the
        # daily cost/health snapshot rather than being an invisible judgement call.
        log({"event": "notify_emergency_pierce", "chars": len(text)})
    return send_telegram(text)


def run_job(job: dict, mode: str, dry: bool, *, escalation: bool = False) -> dict:
    """Run one job. `escalation=True` marks the Eco run triggered by another agent's
    ESCALATE_TO_ECO -- that run must never be gated away, because the whole point of the
    escalation protocol is that something needs surfacing NOW (NOTIFY-FIX 2026-08-02)."""
    agent, key = job["agent"], job["key"]
    # Cost gate on the frequent Eco 2h check-in only.
    if agent.lower() == "eco" and "2h" in job["cadence"] and not escalation:
        # COST-TRIM 2026-07-29 (Eco A2, cadence tweak): during owner quiet hours the 2h
        # check-in CANNOT notify (owner_notify drops non-emergencies 22:00-09:00) and its
        # write-work (stale-sweep, handoff replies) is not time-critical overnight -- so skip
        # the expensive spawn entirely. ~4-5 spawns/night at ~$1.4 each were the single biggest
        # slice of Eco runner cost. Urgent overnight signals still come from the other jobs
        # (Rambo inbox screen, git-hygiene) which run regardless; the 09:00 cycle catches up.
        if quiet_hours_active():
            log({"key": key, "event": "gate_skip", "reason": "quiet_hours"})
            return {"ran": False, "reason": "quiet_hours"}
        # COST-TRIM surgical (b): skip if no watched input changed since the last 2h run.
        if not eco_2h_inputs_changed(key):
            log({"key": key, "event": "gate_skip", "reason": "no_change"})
            return {"ran": False, "reason": "no_change"}
        if actionable_gate() == 0:
            log({"key": key, "event": "gate_skip", "actionable": 0})
            return {"ran": False, "reason": "gate_skip"}
    # Disabled-jobs gate: job registered but blocked on an unmet prerequisite.
    disabled_reason = DISABLED_JOBS.get(key)
    if disabled_reason:
        if dry:
            print(f"  DISABLED {key} -- {disabled_reason[:120]}")
        else:
            log({"key": key, "event": "job_disabled", "reason": disabled_reason[:200]})
        return {"ran": False, "reason": "disabled"}
    model = agent_model(agent)
    # SHIR-FIX-03: on the runner path, Eco jobs use RUNNER_ECO_MODEL (default: sonnet).
    # Interactive-session model defined in Eco's role file is never modified here.
    if agent.lower() == "eco":
        model = RUNNER_ECO_MODEL
    # Per-job tool override: some jobs need tools beyond the runner default (e.g., Gmail MCP).
    tools = PER_JOB_TOOLS.get(key, TOOLS[mode])
    timeout = _model_timeout(model)  # SHIR-FIX-02
    timeout = PER_AGENT_TIMEOUTS.get(agent.lower(), timeout)  # per-agent override (ORC-timeout-fix 2026-07-18)
    timeout = PER_JOB_TIMEOUTS.get(key, timeout)  # per-job override (2026-08-02)
    if dry:
        print(f"  WOULD RUN {key} | cadence={job['cadence']} | tg={job['tg']} | model={model} | tools={tools}")
        return {"ran": False, "reason": "dry"}
    prompt = f"[Scheduled run: {now().isoformat()}]\n\n{PATH_DIRECTIVE}\n\n{APPEND_DISCIPLINE}\n\n{job['prompt']}"
    log({"key": key, "event": "start", "mode": mode, "model": model, "tg": job["tg"]})
    pre_spawns = _spawn_count()  # DISPATCH 2026-08-02: audit sub-agent dispatches per job
    # Tag the spawned agent so the PreToolUse guard can enforce the runner policy
    # (no Bash, no sub-agent spawns; in readonly, no writes at all). This is the real
    # enforcement layer -- --allowedTools alone does NOT strip Bash (verified 2026-06-28).
    env = {**os.environ, "RUNNER_CONTEXT": "1", "RUNNER_MODE": mode}
    # SHIR-FIX-07: --output-format json to capture cost_usd + model + token counts
    cmd = [find_claude(), "--print", "--output-format", "json", "--model", model,
           "--allowedTools", tools, "--append-system-prompt", role_text(agent)]
    stdin_data = prompt.encode("utf-8")
    # SHIR-FIX-06: one bounded retry on session-limit / connection / stall errors
    t0 = time.monotonic()
    rc, raw, err_tag = _invoke_claude(cmd, stdin_data, env, timeout, str(ROOT))
    if err_tag:
        log({"key": key, "event": "retry", "err": err_tag})
        rc, raw, err_tag2 = _invoke_claude(cmd, stdin_data, env, timeout, str(ROOT))
        if err_tag2:
            final_err = f"{err_tag} -> {err_tag2}"
            # ECO-STDOUT-SURFACE 2026-07-24 (origin 293a9c8) + ECO-STDOUT-FIX 2026-07-25:
            # the err_tag now embeds a stdout-derived diagnostic; additionally persist a
            # bounded raw-stdout snippet on the error_final record and in the Telegram
            # alert so failures are self-diagnosing even when the tag is truncated.
            stdout_snip = _stdout_diag(raw)
            log({"key": key, "event": "error_final", "err": final_err,
                 "stdout": raw[:600],
                 "duration_ms": int((time.monotonic() - t0) * 1000)})
            # Alert via the existing Telegram pathway; failure is also in agent-runs.jsonl.
            send_telegram(
                f"[Runner FAIL -- {agent}]\n"
                f"Job failed after 1 retry.\n"
                f"Key: {key}\n"
                f"Error: {final_err}"
                + (f"\nStdout: {stdout_snip[:300]}" if stdout_snip else "")
            )
            return {"ran": True, "error": True}
    # SHIR-FIX-07: extract text + cost fields from JSON envelope
    out, cost_usd, model_used, usage, dur_api_ms = _parse_json_output(raw)
    # DASH-DURATION/TOKENS 2026-07-29: wall-clock duration is always present (even on the
    # JSON-fallback path); tokens_total includes cache tokens (bare input_tokens omits them).
    duration_ms = int((time.monotonic() - t0) * 1000)
    tokens_total = sum((usage or {}).get(k) or 0 for k in
                       ("input_tokens", "cache_creation_input_tokens",
                        "cache_read_input_tokens", "output_tokens"))
    lines_out = [ln.strip() for ln in out.splitlines() if ln.strip()] if out else []
    last_line = lines_out[-1] if lines_out else ""
    escalate = last_line.startswith("ESCALATE_TO_ECO")
    # NOTIFY-FIX 2026-08-02: urgency is derived in CODE from the URGENT: first-line protocol
    # the agent prompts already mandate -- an agent can never set the emergency flag directly.
    urgent = bool(lines_out) and lines_out[0].startswith("URGENT:")
    post_spawns = _spawn_count()
    dispatched = max(0, post_spawns - pre_spawns)
    if dispatched:
        log({"key": key, "event": "spawn_dispatch", "n": dispatched,
             "cycle_total": post_spawns})
    sent = False
    no_actionable = _is_no_actionable(out)
    if job["tg"].startswith(("YES", "CONDITIONAL")) and out and not no_actionable:
        if (agent.lower() == "eco" and "2h" in job["cadence"]
                and two_h_notify_muted() and not urgent):
            log({"key": key, "event": "tg_muted_2h"})  # work ran; owner ping suppressed
        else:
            # Routine cadence content is held during owner quiet hours (22:00-09:00 local);
            # an URGENT: message pierces the window (owner directive 2026-08-01).
            sent = owner_notify(f"[Proactivity -- {agent}]\n\n{out}", emergency=urgent)
    log({"key": key, "event": "done", "rc": rc, "out_chars": len(out),
         "sent": sent, "escalate": escalate, "urgent": urgent,
         "spawns": dispatched, "summary": out[-600:],
         "cost_usd": cost_usd, "model": model_used,
         "input_tokens": (usage or {}).get("input_tokens"),
         "output_tokens": (usage or {}).get("output_tokens"),
         "tokens_total": tokens_total, "duration_ms": duration_ms,
         "duration_api_ms": dur_api_ms})
    return {"ran": True, "escalate": escalate}


def run_git_hygiene(state: dict, t: datetime, dry: bool) -> None:
    """Daily ZERO-TOKEN git/CI-CD hygiene audit (Shir's function, owner A1 2026-06-30).

    Runs integrations/git-hygiene/audit.py as a plain subprocess -- NOT a claude/LLM
    call -- so it costs no tokens and never enters the guard Bash path (the runner
    deliberately blocks Bash inside agent sessions; this deterministic script sidesteps
    that entirely). On ATTENTION (exit 1) it alerts the owner on Telegram. CLEAN is silent.
    """
    last = state.get(GIT_HYGIENE_KEY, {}).get("last")
    if last:
        try:
            if datetime.fromisoformat(last).date() == t.date():
                return  # already audited today
        except ValueError:
            pass
    if dry:
        print(f"  WOULD RUN {GIT_HYGIENE_KEY} (daily, zero-token git audit script)")
        return
    log({"key": GIT_HYGIENE_KEY, "event": "start", "mode": "script"})
    try:
        r = subprocess.run([sys.executable, str(AUDIT_SCRIPT)],
                           capture_output=True, timeout=120, cwd=str(ROOT), check=False)
        out = r.stdout.decode("utf-8", "replace").strip()
    except Exception as e:
        log({"key": GIT_HYGIENE_KEY, "event": "error", "err": f"{type(e).__name__}: {str(e)[:150]}"})
        return
    attention = r.returncode == 1
    sent = False
    if attention and out:
        # audit.py prints a status line then the plain-language owner message; send the message.
        msg = "\n".join(out.splitlines()[1:]).strip() or out
        sent = send_telegram(f"[Git hygiene -- Shir]\n\n{msg}")
    state.setdefault(GIT_HYGIENE_KEY, {})["last"] = t.isoformat()
    log({"key": GIT_HYGIENE_KEY, "event": "done", "rc": r.returncode,
         "attention": attention, "sent": sent})


def run_agent_dashboard(state: dict, t: datetime, dry: bool) -> None:
    """Per-cycle ZERO-TOKEN agent-performance dashboard snapshot (Eco, owner A1 2026-07-27).

    Runs integrations/dashboard/agent_dashboard.py as a plain subprocess -- no LLM, no tokens,
    no Bash-in-agent -- to refresh dashboards/agent-performance.html from the live telemetry +
    board every cycle. The dynamic browser view is the SAME script's `serve` mode, run as a
    separate always-on local service (127.0.0.1 only, read-only). Silent unless it errors.
    """
    if dry:
        print(f"  WOULD RUN {DASH_KEY} (per-cycle, zero-token dashboard snapshot)")
        return
    try:
        r = subprocess.run([sys.executable, str(DASH_SCRIPT), "snapshot"],
                           capture_output=True, timeout=60, cwd=str(ROOT), check=False)
    except Exception as e:
        log({"key": DASH_KEY, "event": "error", "err": f"{type(e).__name__}: {str(e)[:150]}"})
        return
    state.setdefault(DASH_KEY, {})["last"] = t.isoformat()
    log({"key": DASH_KEY, "event": "done", "rc": r.returncode})


def run_guard_suite(state: dict, t: datetime, dry: bool) -> None:
    """Daily ZERO-TOKEN check that the autonomy guard's proof suite is green.

    Runs pytest over .claude/hooks/test_guard.py as a plain subprocess -- not an LLM
    call -- so it costs no tokens. GREEN is silent; anything else alerts the owner on
    Telegram. Deliberately distinguishes the failure modes, because the one that hid
    this problem for months was the boring one:
      rc 0        -> suite green, silent
      pytest gone -> the check itself is dead; that is the recurrence we are preventing
      rc 5        -> no tests collected; the suite has been emptied or collection broke
      other rc    -> real failures, send the tail of the output
    """
    last = state.get(GUARD_SUITE_KEY, {}).get("last")
    if last:
        try:
            if datetime.fromisoformat(last).date() == t.date():
                return  # already checked today
        except ValueError:
            pass
    if dry:
        print(f"  WOULD RUN {GUARD_SUITE_KEY} (daily, zero-token pytest on the guard suite)")
        return
    if not GUARD_SUITE_TEST.is_file():
        log({"key": GUARD_SUITE_KEY, "event": "error", "err": "suite file missing"})
        send_telegram(
            "[Guard proof suite -- Rambo]\n\n"
            f"The guard's test suite is MISSING at {GUARD_SUITE_TEST.name}. "
            "The autonomy guard is running with no proof it denies anything."
        )
        return
    log({"key": GUARD_SUITE_KEY, "event": "start", "mode": "script"})
    try:
        # --basetemp + no:cacheprovider (2026-08-02): pytest's default tmp root is a SHARED
        # per-user dir with a `pytest-current` symlink. When a previous run created it under a
        # different process context, teardown raises PermissionError [WinError 5] and pytest
        # exits 1 with every test passing -- this check would then report the guard RED for a
        # reason that has nothing to do with the guard. Verified locally: 94 passed, exit 1.
        # A private basetemp under the repo makes the result depend only on the tests.
        r = subprocess.run([sys.executable, "-m", "pytest", str(GUARD_SUITE_TEST), "-q",
                            "-p", "no:cacheprovider", "--basetemp", str(GUARD_SUITE_TMP)],
                           capture_output=True, timeout=300, cwd=str(ROOT), check=False)
        out = (r.stdout.decode("utf-8", "replace")
               + r.stderr.decode("utf-8", "replace")).strip()
    except Exception as e:
        log({"key": GUARD_SUITE_KEY, "event": "error",
             "err": f"{type(e).__name__}: {str(e)[:150]}"})
        send_telegram(
            "[Guard proof suite -- Rambo]\n\n"
            f"Could not run the guard proof suite: {type(e).__name__}. "
            "The guard may be fine, but nothing is verifying it."
        )
        return
    # pytest absent looks like an ordinary failure on the exit code alone, so name it.
    pytest_missing = "No module named pytest" in out
    if pytest_missing:
        msg = ("pytest is NOT INSTALLED in the runner interpreter, so the guard proof "
               "suite cannot run at all. This is exactly how 15 stale failures went "
               "unnoticed. Fix: python -m pip install -r requirements-dev.txt")
    elif r.returncode == 5:
        msg = ("The guard proof suite collected NO TESTS. The suite has been emptied or "
               "collection is broken -- the guard is unproven.")
    elif r.returncode != 0:
        tail = "\n".join(out.splitlines()[-12:])
        msg = f"The guard proof suite is RED (exit {r.returncode}):\n\n{tail}"
    else:
        msg = None
    sent = False
    if msg:
        sent = send_telegram(f"[Guard proof suite -- Rambo]\n\n{msg[:900]}")
    state.setdefault(GUARD_SUITE_KEY, {})["last"] = t.isoformat()
    log({"key": GUARD_SUITE_KEY, "event": "done", "rc": r.returncode,
         "green": msg is None, "pytest_missing": pytest_missing, "sent": sent})


def run_purge_arc_summaries(state: dict, t: datetime, dry: bool) -> None:
    """Weekly ZERO-TOKEN ArcSessionSummary retention purge (APS-022).

    Invokes node purge-expired-arc-summaries.mjs --apply from the APS app dir.
    CWD must be APS_APP_DIR so the script resolves logs/ correctly.
    Job is registered in DISABLED_JOBS and will not fire until the owner removes
    the key (owner A1 at pilot go-live when real student data exists).
    """
    key = PURGE_ARC_JOB_KEY
    disabled_reason = DISABLED_JOBS.get(key)
    if disabled_reason:
        if dry:
            print(f"  DISABLED {key} -- {disabled_reason[:120]}")
        else:
            log({"key": key, "event": "job_disabled", "reason": disabled_reason[:200]})
        return
    # Weekly cadence: fire on Mondays; catch-up if >8 days since last run (SHIR-FIX-04 pattern).
    last = state.get(key, {}).get("last")
    last_dt = None
    if last:
        try:
            last_dt = datetime.fromisoformat(last)
        except ValueError:
            pass
    if last_dt and (t.date() - last_dt.date()).days > 8:
        pass  # catch-up: fire regardless of weekday
    elif t.weekday() != 0:  # Monday only
        return
    elif last_dt and last_dt.isocalendar()[:2] == t.isocalendar()[:2]:
        return  # already ran this week
    if dry:
        print(f"  WOULD RUN {key} (weekly, zero-token node script, --apply)")
        return
    log({"key": key, "event": "start", "mode": "script"})
    try:
        r = subprocess.run(
            ["node", str(PURGE_SCRIPT), "--apply"],
            capture_output=True, timeout=120,
            cwd=str(APS_APP_DIR), check=False,
        )
        out = r.stdout.decode("utf-8", "replace").strip()
    except Exception as e:
        log({"key": key, "event": "error",
             "err": f"{type(e).__name__}: {str(e)[:150]}"})
        return
    attention = r.returncode != 0
    if attention and out:
        send_telegram(f"[Purge arc summaries -- Shir]\n\nExit {r.returncode}\n{out[:800]}")
    state.setdefault(key, {})["last"] = t.isoformat()
    log({"key": key, "event": "done", "rc": r.returncode,
         "attention": attention, "out_chars": len(out)})


def run_task_hygiene(state: dict, t: datetime, dry: bool) -> None:
    """Daily ZERO-TOKEN task-hygiene scan (T-0045, owner A1 2026-08-02).

    Runs integrations/task-hygiene/stale_detector.py as a plain subprocess -- no LLM, no
    tokens -- and writes its report to memory/task-hygiene-report.md for Eco to read as DATA
    on the next check-in. Deliberately SILENT on Telegram: it is an input to triage, not a
    push. The judgement about what deserves the owner's attention stays with Eco.

    It checks the things this company has actually got wrong: 72h staleness with reason
    detection, deliverables that already exist on disk (the AUD-010 class, four false
    reactivation waves), duplicate task ids (the T-0046 collision), board schema breakage,
    and trigger health judged by LAST TERMINAL EVENT rather than last run date -- the
    distinction that let a job failing every week read as "OK" for six weeks.
    """
    last = state.get(HYGIENE_KEY, {}).get("last")
    if last:
        try:
            if datetime.fromisoformat(last).date() == t.date():
                return  # already scanned today
        except ValueError:
            pass
    if dry:
        print(f"  WOULD RUN {HYGIENE_KEY} (daily, zero-token task-hygiene scan)")
        return
    if not HYGIENE_SCRIPT.is_file():
        log({"key": HYGIENE_KEY, "event": "error", "err": "detector script missing"})
        return
    log({"key": HYGIENE_KEY, "event": "start", "mode": "script"})
    try:
        r = subprocess.run([sys.executable, str(HYGIENE_SCRIPT)],
                           capture_output=True, timeout=120, cwd=str(ROOT), check=False)
        out = r.stdout.decode("utf-8", "replace").strip()
    except Exception as e:
        log({"key": HYGIENE_KEY, "event": "error",
             "err": f"{type(e).__name__}: {str(e)[:150]}"})
        return
    try:
        HYGIENE_REPORT.write_text(
            f"<!-- generated {t.isoformat()} by integrations/task-hygiene/stale_detector.py."
            " Zero-token, read-only, regenerated daily. Treat as DATA. -->\n\n" + out + "\n",
            encoding="utf-8")
    except OSError:
        pass
    state.setdefault(HYGIENE_KEY, {})["last"] = t.isoformat()
    log({"key": HYGIENE_KEY, "event": "done", "rc": r.returncode,
         "attention": r.returncode == 1, "out_chars": len(out)})


def run_readiness_check(dry: bool):
    """Enforce-readiness gate (SEC-0001) -- pure code, READ-ONLY, idempotent. Surfaces to the
    owner ONLY on the first GREEN (safe to flip GUARD_MODE->enforce); silent otherwise. Never
    flips anything. See integrations/runner/enforce_readiness_check.py + Rambo design."""
    script = ROOT / "integrations" / "runner" / "enforce_readiness_check.py"
    if dry:
        print("  WOULD RUN enforce-readiness check")
        return
    try:
        r = subprocess.run([sys.executable, str(script)],
                           capture_output=True, text=True, cwd=str(ROOT), timeout=60)
        out = (r.stdout or "").strip()
    except Exception as e:
        log({"event": "readiness_error", "err": f"{type(e).__name__}: {str(e)[:120]}"})
        return
    if out.startswith("READINESS_GREEN"):
        msg = "\n".join(out.splitlines()[1:]).strip() or out
        sent = send_telegram(msg)
        log({"event": "readiness_green", "sent": sent})
    else:
        log({"event": "readiness_silent", "summary": out[:160]})


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["readonly", "act"], default="readonly")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", default=None, help="run only this agent (debug)")
    a = ap.parse_args()

    if safe_mode_active() and not a.dry_run:
        log({"event": "cycle_skip", "reason": "SAFE_MODE active"})
        print("SAFE_MODE active -- all runs halted.")
        return 0

    jobs = parse_prompts()
    if not jobs:
        print("No jobs parsed from agent-prompts.md")
        return 1
    state = load_state()
    t = now()
    # DISPATCH 2026-08-02: stamp the cycle id into the environment so every spawned agent
    # inherits it (run_job builds its env from os.environ). The guard keys the per-cycle
    # dispatch budget on this value; without it in the env, the guard fails closed and
    # denies all dispatches.
    os.environ["RUNNER_CYCLE_ID"] = t.isoformat()
    if not a.dry_run:
        try:
            SPAWN_COUNT_FILE.write_text(
                json.dumps({"cycle_id": t.isoformat(), "count": 0, "cap": 3}),
                encoding="utf-8")
        except OSError:
            pass  # the guard self-heals on a cycle_id mismatch; this is just initialization
    print(f"[cycle {t.isoformat()}] mode={a.mode} jobs={len(jobs)}")

    # Daily zero-token git/CI-CD hygiene audit (Shir's function). Runs on a full cycle
    # or when explicitly targeted; independent of the LLM agent jobs below.
    if not a.only or a.only.lower() in ("shir", "git", "git-hygiene"):
        run_git_hygiene(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)  # SHIR-FIX-01: persist after git hygiene updates state

    # Per-cycle zero-token agent-performance dashboard snapshot (Eco, owner A1 2026-07-27).
    if not a.only or a.only.lower() in ("eco", "dashboard", "dash"):
        run_agent_dashboard(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)

    # Daily zero-token check that the autonomy guard's proof suite is still green
    # (Rambo advisory 2026-07-26). Independent of the LLM agent jobs below.
    if not a.only or a.only.lower() in ("rambo", "guard", "guard-suite"):
        run_guard_suite(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)

    # Daily zero-token task-hygiene scan (T-0045). Writes memory/task-hygiene-report.md for
    # Eco to read as DATA on the next check-in; never pushes to Telegram itself.
    if not a.only or a.only.lower() in ("eco", "hygiene", "task-hygiene"):
        run_task_hygiene(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)

    # Weekly zero-token ArcSessionSummary purge (APS-022 -- DISABLED until pilot go-live).
    # Enabling this job requires removing PURGE_ARC_JOB_KEY from DISABLED_JOBS (owner A1).
    if not a.only or a.only.lower() in ("shir", "purge", "purge-arc"):
        run_purge_arc_summaries(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)

    # AUD-001: wrap job loop + escalation in try/finally so that sentinel files are
    # always cleaned up even on KeyboardInterrupt or unexpected exception.
    escalated = False
    try:
        for job in jobs:  # file order -> Lital before Eyal
            if a.only and job["agent"].lower() != a.only.lower():
                continue
            if not a.only and not is_due(job, state, t):
                continue
            # AUD-001: acquire sentinel lock(s) for agents known to write shared files.
            # Lock is held for the full duration of the spawned agent subprocess so that
            # two concurrent runner cycles cannot overlap their board/decisions-log writes.
            lock_targets = _AGENT_LOCKS.get(job["agent"].lower(), [])
            with contextlib.ExitStack() as stack:
                for tgt in lock_targets:
                    if a.dry_run:
                        print(f"  [file-lock] ACQUIRE .{tgt.name}.lock for {job['agent']} (dry-run)")
                    stack.enter_context(
                        acquire_file_lock(tgt,
                                          writer=f"{job['agent']}:{job['key'][:40]}",
                                          timeout=30)
                    )
                res = run_job(job, a.mode, a.dry_run)
            if res.get("ran") and not a.dry_run:
                state.setdefault(job["key"], {})["last"] = t.isoformat()
                save_state(state)  # SHIR-FIX-01: persist after each completed job
            if res.get("escalate"):
                escalated = True

        # If a file-output agent escalated, ensure Eco surfaces it this cycle.
        if escalated and not a.dry_run:
            eco_2h = next(
                (j for j in jobs if j["agent"].lower() == "eco" and "2h" in j["cadence"]),
                None,
            )
            if eco_2h:
                log({"event": "escalation_triggered_eco"})
                # AUD-001: lock the escalation-triggered Eco run as well.
                with contextlib.ExitStack() as stack:
                    for tgt in _AGENT_LOCKS.get("eco", []):
                        stack.enter_context(
                            acquire_file_lock(tgt,
                                              writer="Eco:escalation-triggered",
                                              timeout=30)
                        )
                    # escalation=True: this run must not be gated away by quiet hours or the
                    # no-change/actionable gates -- another agent asked for a surfacing NOW.
                    run_job(eco_2h, a.mode, False, escalation=True)
                state.setdefault(eco_2h["key"], {})["last"] = t.isoformat()
                save_state(state)  # SHIR-FIX-01: persist after escalation-triggered Eco run
    finally:
        # AUD-001: clean up any sentinel files left by an unexpected exit.
        release_all_held_locks()

    # Enforce-readiness gate (SEC-0001) -- silent until GREEN, then one owner surface.
    if not a.only or a.only.lower() in ("readiness", "enforce"):
        run_readiness_check(a.dry_run)

    if not a.dry_run:
        save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
