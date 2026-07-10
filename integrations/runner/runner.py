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
DISABLED_JOBS = {}
HOLD = ("on hold", "on-hold", "blocked on", "blocked-until", "waiting on",
        "waiting-on", "pending owner", "queued until")
CLAUDE_TIMEOUT = 300

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
    try:
        STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")
    except OSError:
        pass


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
    # Per-job tool override: some jobs need tools beyond the runner default (e.g., Gmail MCP).
    tools = PER_JOB_TOOLS.get(key, TOOLS[mode])
    if dry:
        print(f"  WOULD RUN {key} | cadence={job['cadence']} | tg={job['tg']} | model={model} | tools={tools}")
        return {"ran": False, "reason": "dry"}
    prompt = f"[Scheduled run: {now().isoformat()}]\n\n{PATH_DIRECTIVE}\n\n{job['prompt']}"
    log({"key": key, "event": "start", "mode": mode, "model": model, "tg": job["tg"]})
    try:
        # Tag the spawned agent so the PreToolUse guard can enforce the runner
        # policy (no Bash, no sub-agent spawns; in readonly, no writes at all).
        # This is the real enforcement layer -- --allowedTools alone does NOT
        # strip Bash and does NOT guarantee read-only (verified 2026-06-28).
        env = {**os.environ, "RUNNER_CONTEXT": "1", "RUNNER_MODE": mode}
        r = subprocess.run(
            [find_claude(), "--print", "--model", model, "--allowedTools", tools,
             "--append-system-prompt", role_text(agent)],
            input=prompt.encode("utf-8"),
            capture_output=True, timeout=CLAUDE_TIMEOUT, cwd=str(ROOT), check=False,
            env=env,
        )
        out = r.stdout.decode("utf-8", "replace").strip()
    except Exception as e:
        log({"key": key, "event": "error", "err": f"{type(e).__name__}: {str(e)[:150]}"})
        return {"ran": True, "error": True}

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
    log({"key": key, "event": "done", "rc": r.returncode, "out_chars": len(out),
         "sent": sent, "escalate": escalate, "summary": out[-600:]})
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

    escalated = False
    for job in jobs:  # file order -> Lital before Eyal
        if a.only and job["agent"].lower() != a.only.lower():
            continue
        if not a.only and not is_due(job, state, t):
            continue
        res = run_job(job, a.mode, a.dry_run)
        if res.get("ran") and not a.dry_run:
            state.setdefault(job["key"], {})["last"] = t.isoformat()
        if res.get("escalate"):
            escalated = True

    # If a file-output agent escalated, ensure Eco surfaces it this cycle.
    if escalated and not a.dry_run:
        eco_2h = next((j for j in jobs if j["agent"].lower() == "eco" and "2h" in j["cadence"]), None)
        if eco_2h:
            log({"event": "escalation_triggered_eco"})
            run_job(eco_2h, a.mode, False)
            state.setdefault(eco_2h["key"], {})["last"] = t.isoformat()

    # Enforce-readiness gate (SEC-0001) -- silent until GREEN, then one owner surface.
    if not a.only or a.only.lower() in ("readiness", "enforce"):
        run_readiness_check(a.dry_run)

    if not a.dry_run:
        save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
