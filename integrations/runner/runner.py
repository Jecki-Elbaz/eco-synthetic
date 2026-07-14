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
import sys, os, re, json, subprocess, shutil, argparse
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
PROMPTS = ROOT / "integrations" / "runner" / "agent-prompts.md"
AUDIT_SCRIPT = ROOT / "integrations" / "git-hygiene" / "audit.py"
GIT_HYGIENE_KEY = "Shir:git-hygiene-audit"
# APS-022 retention purge (S8-SHIR-PURGEJOB, Sprint 8 envelope 2026-07-13)
PURGE_ARC_JOB_KEY = "purge_expired_arc_summaries"
APS_APP_DIR = ROOT / "projects" / "ai-patient-simulator" / "app"
PURGE_SCRIPT = APS_APP_DIR / "apps" / "api" / "src" / "scripts" / "purge-expired-arc-summaries.mjs"
BOARD = ROOT / "memory" / "board.md"
RUNLOG = ROOT / "memory" / "agent-runs.jsonl"
STATE = ROOT / "memory" / "runner-state.json"
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
    "Rambo:Adam Inbox Screen (every 2h; EXPIRES 2026-07-14 or on Adam reply)": (
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
    # GR-014 time-boxed exception LAPSED per its own terms: Adam replied 2026-07-10
    # (shared/handoff/inbox-screened/adam-reply-2026-07-10.md) and the 2026-07-14
    # expiry date is reached. The prompt-level step-0 self-expiry still exists; this
    # entry is the runner-layer hard stop (owner directive 2026-07-14, decisions-log).
    # Re-enabling ANY standing Gmail automation requires a fresh owner A1 + privacy
    # review per GR-014 M4/C-E5.
    "Rambo:Adam Inbox Screen (every 2h; EXPIRES 2026-07-14 or on Adam reply)": (
        "GR-014 exception lapsed 2026-07-14 (Adam replied 2026-07-10; time-box "
        "reached). Fresh owner A1 + privacy review required to re-enable any "
        "standing Gmail automation."
    ),
}
HOLD = ("on hold", "on-hold", "blocked on", "blocked-until", "waiting on",
        "waiting-on", "pending owner", "queued until")

# SHIR-FIX-02: per-model timeout table (seconds)
MODEL_TIMEOUTS = {"opus": 600, "sonnet": 300, "haiku": 180}
CLAUDE_TIMEOUT_DEFAULT = 300

# SHIR-FIX-03: Eco runner-path model override (interactive-session model unchanged).
# Eco's role file typically specifies Opus; the runner uses Sonnet by default to avoid
# session-limit + timeout failures (Ido A3 pre-approved 2026-07-11).
# Override via env: RUNNER_MODEL_OVERRIDE=<model-id>
RUNNER_ECO_MODEL = os.environ.get("RUNNER_MODEL_OVERRIDE", "claude-sonnet-4-6")

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
    for n in ("claude.cmd", "claude", "claude.ps1"):
        p = shutil.which(n)
        if p:
            return p
    cand = Path(os.environ.get("APPDATA", "")) / "npm" / "claude.cmd"
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


def _invoke_claude(cmd: list, stdin_data: bytes, env: dict, timeout: int, cwd: str) -> tuple:
    """SHIR-FIX-06: single claude CLI invocation. Returns (rc, raw_stdout, err_tag).
    err_tag is None on a clean run or a short string identifying a retryable failure."""
    try:
        r = subprocess.run(cmd, input=stdin_data, capture_output=True,
                           timeout=timeout, cwd=cwd, check=False, env=env)
        raw = r.stdout.decode("utf-8", "replace").strip()
        combined = (raw + " " + r.stderr.decode("utf-8", "replace")).lower()
        for pat in RETRY_PATTERNS:
            if pat in combined:
                return r.returncode, raw, pat
        return r.returncode, raw, None
    except subprocess.TimeoutExpired:
        return -1, "", "TimeoutExpired"
    except Exception as e:
        return -1, "", f"{type(e).__name__}: {str(e)[:100]}"


def _parse_json_output(raw: str) -> tuple:
    """SHIR-FIX-07: parse --output-format json stdout.
    Returns (text, cost_usd, model_used, usage_dict). Graceful fallback on non-JSON."""
    try:
        data = json.loads(raw)
        return (data.get("result", raw), data.get("cost_usd"),
                data.get("model"), data.get("usage", {}))
    except (json.JSONDecodeError, AttributeError, TypeError):
        return raw, None, None, {}


def agent_model(agent: str) -> str:
    try:
        txt = (AGENTS_DIR / f"{agent}.md").read_text(encoding="utf-8")
        m = re.search(r"(?mi)^model:\s*([A-Za-z0-9._-]+)", txt)
        return m.group(1) if m else "claude-sonnet-4-6"
    except OSError:
        return "claude-sonnet-4-6"


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


def run_job(job: dict, mode: str, dry: bool) -> dict:
    agent, key = job["agent"], job["key"]
    # Cost gate on the frequent Eco 2h check-in only.
    if agent.lower() == "eco" and "2h" in job["cadence"]:
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
    if dry:
        print(f"  WOULD RUN {key} | cadence={job['cadence']} | tg={job['tg']} | model={model} | tools={tools}")
        return {"ran": False, "reason": "dry"}
    prompt = f"[Scheduled run: {now().isoformat()}]\n\n{PATH_DIRECTIVE}\n\n{job['prompt']}"
    log({"key": key, "event": "start", "mode": mode, "model": model, "tg": job["tg"]})
    # Tag the spawned agent so the PreToolUse guard can enforce the runner policy
    # (no Bash, no sub-agent spawns; in readonly, no writes at all). This is the real
    # enforcement layer -- --allowedTools alone does NOT strip Bash (verified 2026-06-28).
    env = {**os.environ, "RUNNER_CONTEXT": "1", "RUNNER_MODE": mode}
    # SHIR-FIX-07: --output-format json to capture cost_usd + model + token counts
    cmd = [find_claude(), "--print", "--output-format", "json", "--model", model,
           "--allowedTools", tools, "--append-system-prompt", role_text(agent)]
    stdin_data = prompt.encode("utf-8")
    # SHIR-FIX-06: one bounded retry on session-limit / connection / stall errors
    rc, raw, err_tag = _invoke_claude(cmd, stdin_data, env, timeout, str(ROOT))
    if err_tag:
        log({"key": key, "event": "retry", "err": err_tag})
        rc, raw, err_tag2 = _invoke_claude(cmd, stdin_data, env, timeout, str(ROOT))
        if err_tag2:
            final_err = f"{err_tag} -> {err_tag2}"
            log({"key": key, "event": "error_final", "err": final_err})
            # Alert via the existing Telegram pathway; failure is also in agent-runs.jsonl.
            send_telegram(
                f"[Runner FAIL -- {agent}]\n"
                f"Job failed after 1 retry.\n"
                f"Key: {key}\n"
                f"Error: {final_err}"
            )
            return {"ran": True, "error": True}
    # SHIR-FIX-07: extract text + cost fields from JSON envelope
    out, cost_usd, model_used, usage = _parse_json_output(raw)
    last_line = out.splitlines()[-1].strip() if out else ""
    escalate = last_line.startswith("ESCALATE_TO_ECO")
    sent = False
    # Suppress on the sentinel even when the agent prepended reasoning (Opus often does):
    # treat output whose LAST non-empty line is the sentinel as "nothing actionable".
    no_actionable = out.rstrip().endswith("NO_ACTIONABLE_CONTENT")
    if job["tg"].startswith(("YES", "CONDITIONAL")) and out and not no_actionable:
        if agent.lower() == "eco" and "2h" in job["cadence"] and two_h_notify_muted():
            log({"key": key, "event": "tg_muted_2h"})  # work ran; owner ping suppressed
        else:
            sent = send_telegram(f"[Proactivity -- {agent}]\n\n{out}")
    log({"key": key, "event": "done", "rc": rc, "out_chars": len(out),
         "sent": sent, "escalate": escalate, "summary": out[-600:],
         "cost_usd": cost_usd, "model": model_used,
         "input_tokens": (usage or {}).get("input_tokens"),
         "output_tokens": (usage or {}).get("output_tokens")})
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
    print(f"[cycle {t.isoformat()}] mode={a.mode} jobs={len(jobs)}")

    # Daily zero-token git/CI-CD hygiene audit (Shir's function). Runs on a full cycle
    # or when explicitly targeted; independent of the LLM agent jobs below.
    if not a.only or a.only.lower() in ("shir", "git", "git-hygiene"):
        run_git_hygiene(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)  # SHIR-FIX-01: persist after git hygiene updates state

    # Weekly zero-token ArcSessionSummary purge (APS-022 -- DISABLED until pilot go-live).
    # Enabling this job requires removing PURGE_ARC_JOB_KEY from DISABLED_JOBS (owner A1).
    if not a.only or a.only.lower() in ("shir", "purge", "purge-arc"):
        run_purge_arc_summaries(state, t, a.dry_run)
        if not a.dry_run:
            save_state(state)

    escalated = False
    for job in jobs:  # file order -> Lital before Eyal
        if a.only and job["agent"].lower() != a.only.lower():
            continue
        if not a.only and not is_due(job, state, t):
            continue
        res = run_job(job, a.mode, a.dry_run)
        if res.get("ran") and not a.dry_run:
            state.setdefault(job["key"], {})["last"] = t.isoformat()
            save_state(state)  # SHIR-FIX-01: persist after each completed job
        if res.get("escalate"):
            escalated = True

    # If a file-output agent escalated, ensure Eco surfaces it this cycle.
    if escalated and not a.dry_run:
        eco_2h = next((j for j in jobs if j["agent"].lower() == "eco" and "2h" in j["cadence"]), None)
        if eco_2h:
            log({"event": "escalation_triggered_eco"})
            run_job(eco_2h, a.mode, False)
            state.setdefault(eco_2h["key"], {})["last"] = t.isoformat()
            save_state(state)  # SHIR-FIX-01: persist after escalation-triggered Eco run

    # Enforce-readiness gate (SEC-0001) -- silent until GREEN, then one owner surface.
    if not a.only or a.only.lower() in ("readiness", "enforce"):
        run_readiness_check(a.dry_run)

    if not a.dry_run:
        save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
