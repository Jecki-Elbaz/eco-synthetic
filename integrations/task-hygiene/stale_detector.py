#!/usr/bin/env python3
"""Deterministic task-hygiene detector for the Eco-Synthetic board (board T-0045).

ZERO-TOKEN by design: plain Python, NOT an LLM call. No network, no subprocess, no
LLM. It is invoked the same way integrations/git-hygiene/audit.py is (a subprocess
from the runner, or by hand), so it follows that script's exit-code and output shape
conventions.

READ-ONLY on every file it inspects. It reports; it NEVER edits memory/board.md or
anything else. Nothing here writes to disk.

Filename note: the board row for T-0045 calls this script `stale-detector.py`. The
file on disk is `stale_detector.py` (underscore) so it can be imported as a module;
a hyphen is not a legal Python identifier. Same script, importable name.

Checks (each one exists because the company already suffered the failure it catches):
  1. STALE ROWS         -- open/in-progress rows with no dated progress in 72h and no
                           stated good reason. Rule text: the STALE-TASK SWEEP block in
                           integrations/runner/agent-prompts.md (Eco AM Brief).
  2. TRACKING GAPS      -- a "stale" row whose named deliverable already EXISTS on disk
                           (the AUD-010 / AUD-011 / AUD-013 / T-0018 class). Reported
                           separately from real staleness: closure work, not open work.
  3. DUPLICATE TASK IDS -- the T-0046 class (two sessions, one id, permanent collision).
  4. SCHEMA VIOLATIONS  -- rows whose pipe-field count is not 9 (owner + dates shift
                           silently), plus empty / group / multi-owner assigned_to.
  5. TRIGGER HEALTH     -- last TERMINAL event per job (not last run date), registry
                           drift between agent-prompts.md and schedules.md, and overdue
                           jobs. The AUD-007 + Rambo-permission-scan class.
  6. --next-id          -- next free id per prefix across board + archive (the
                           collision fix).

API:
  build_report() -> dict   # machine-readable; same payload as --json
  next_ids() -> dict       # prefix -> next free id
Exit code when run as __main__: 0 = CLEAN, 1 = ATTENTION, 2 = detector error.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
BOARD = ROOT / "memory" / "board.md"
ARCHIVE = ROOT / "memory" / "board-archive.md"
PROMPTS = ROOT / "integrations" / "runner" / "agent-prompts.md"
SCHEDULES = ROOT / "company" / "governance" / "schedules.md"
RUNLOG = ROOT / "memory" / "agent-runs.jsonl"
AGENTS_DIR = ROOT / ".claude" / "agents"

# Declared board schema (memory/board.md header, owner-required 2026-06-15).
SCHEMA_COLS = 9
COL_ID, COL_STATUS, COL_DESC, COL_OWNER, COL_CREATED, COL_DUE = 0, 2, 3, 5, 6, 7

# 72h, evaluated at date granularity because board notes carry dates, not timestamps.
STALE_DAYS = 3
ACTIVE_STATUS = ("open", "in-progress")

# Directory prefixes a repo-relative deliverable path can start with.
PATH_ROOTS = (
    "company",
    "memory",
    "integrations",
    "projects",
    "dashboards",
    "marketing",
    "shared",
    "kb",
    "sources",
)
_PATH_RE = re.compile(
    r"(?<![A-Za-z0-9_./\\-])((?:" + "|".join(PATH_ROOTS) + r")[/\\][A-Za-z0-9_./\\-]+)"
)
# Ambient infrastructure files. Nearly every row names one of these as the place it
# records progress, not as the thing it delivers. Counting them as "the deliverable
# exists" would mark almost the whole board as a tracking gap and make check 2 useless.
AMBIENT_FILES = {
    "memory/board.md",
    "memory/board-archive.md",
    "memory/log.md",
    "memory/log.jsonl",
    "memory/agent-runs.jsonl",
    "memory/runner-state.json",
    "memory/owner-dashboard.md",
    "company/decisions/decisions-log.md",
    "company/governance/schedules.md",
    "company/governance/gate-register.md",
    "company/governance/access-matrix.md",
    "integrations/runner/runner.py",
    "integrations/runner/agent-prompts.md",
    "company/backlog.md",
    "company/soul.md",
    "company/constitution.md",
    "company/md-style.md",
}
_DATE_RE = re.compile(r"\b(20\d{2})-(\d{2})-(\d{2})\b")
_ID_RE = re.compile(r"^([A-Za-z]+)-(\d+)([a-z]?)$")
_EXPIRES_RE = re.compile(r"\bEXPIRES\s+(\d{4}-\d{2}-\d{2})\b", re.IGNORECASE)

# --- staleness reason vocabulary -------------------------------------------------
# Deliberately narrow. These are matched against the `due` column and against the TAIL
# of detailed_desc (the most recent note) -- never the whole description. Scanning a
# 5000-char history for "gate" would excuse every row that ever passed a gate, which is
# how a naive sweep reports "nothing is stale" and hides real drift.
DUE_REASONS = (
    "recurring",
    "ongoing",
    "monthly",
    "weekly",
    "daily",
    "on-need",
    "on need",
    "active",
    "waiting-on-owner",
    "waiting on owner",
    "blocked",
    "on hold",
    "on-hold",
    "pending",
    "event",
    "per cycle",
    "when ",
    "with dashboards",
)
TAIL_REASONS = (
    "blocked on",
    "blocked-until",
    "blocked pending",
    "blocked until",
    "waiting on",
    "waiting-on",
    "waiting for",
    "pending owner",
    "owner a1",
    "a1 required",
    "requires owner",
    "owner keystrokes",
    "owner action",
    "owner decision",
    "owner to ",
    "jecki to ",
    "depends on",
    "dependent on",
    "prerequisite",
    "gate required",
    "pending gate",
    "awaiting",
    "recurring",
    "ongoing",
)
TAIL_CHARS = 500

# `due` values that explicitly are NOT a good reason. Board precedent: T-0006 was
# reactivated 2026-07-27 with "queued is not a stated blocker/gate/future-due/
# waiting-owner/recurring reason". Encoded so the script matches the company's own call.
# Matched on WORD boundaries: a plain substring test would fire on the "--" inside any
# long due note and silently disable the whole reason check for that row.
NON_REASON_RE = re.compile(r"\b(queued|later|tbd|no target date|none)\b")
EMPTY_DUE = ("", "-", "--", "?", "n/a")

# assigned_to must name ONE agent (owner norm: single task owner, ownership is a baton).
GROUP_WORDS = (
    "r&d",
    "team",
    "group",
    "everyone",
    "all agents",
    "sales",
    "product",
    "customer success",
    "cs group",
    "engineering",
    "department",
    "owner office",
    "done",
    "n/a",
    "tbd",
)
MULTI_OWNER_RE = re.compile(r"(?:\s\+\s|/| and |,)")
# Entities that legitimately own a row but have no .claude/agents/<name>.md file here.
KNOWN_NON_AGENT_OWNERS = ("jecki", "owner", "shelly", "eco-synthetic")

# --- cadence model ----------------------------------------------------------------
# Maximum age (HOURS) of a job's last TERMINAL event before it is overdue against its
# own cadence. Hours, not days: a 2h job cannot be judged at date granularity. Weekly
# is 9 days, matching runner.py's own >8-day catch-up rule (SHIR-FIX-04). Each value
# allows roughly two missed fires before it alerts, so a single skipped cycle is quiet.
OVERDUE_HOURS = {
    "sub-daily": 3,
    "cycle-2h": 6,
    "daily": 36,
    "weekly": 9 * 24,
    "monthly": 40 * 24,
}
TERMINAL_EVENTS = ("done", "error_final", "error", "job_disabled", "gate_skip")
FAILURE_EVENTS = ("error_final", "error")
SKIP_EVENTS = ("job_disabled", "gate_skip")

_STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "into",
    "from",
    "that",
    "this",
    "fold",
    "every",
    "run",
    "job",
    "not",
    "llm",
    "min",
}


# ---------------------------------------------------------------------------------
# low-level helpers
# ---------------------------------------------------------------------------------
def _today() -> date:
    """Today in LOCAL time.

    Deliberately not UTC (audit.py uses UTC because git timestamps are UTC). Every date
    in board.md, schedules.md and the chronicle is written by an owner-local session, so
    comparing them against a UTC date makes every evening run report yesterday and
    silently shifts the whole 72h window by a day.
    """
    return datetime.now().date()


def _read(path: Path, warnings: list[str]) -> str:
    """Read a text file; on any OS/decode error record a warning and return ''."""
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        warnings.append(f"unreadable: {path.name} ({type(exc).__name__})")
        return ""


def _dates_in(text: str) -> list[date]:
    """Every well-formed YYYY-MM-DD in `text`. Impossible dates are dropped."""
    out: list[date] = []
    for y, m, d in _DATE_RE.findall(text or ""):
        try:
            out.append(date(int(y), int(m), int(d)))
        except ValueError:
            continue
    return out


def _tokens(text: str) -> set[str]:
    """Significant lowercase word tokens, used for fuzzy job-name matching."""
    return {
        w
        for w in re.findall(r"[a-z0-9]+", (text or "").lower())
        if len(w) >= 3 and w not in _STOPWORDS
    }


def cadence_of(text: str) -> tuple[str, str | None]:
    """Classify a cadence string.

    Args:
        text: Free-text cadence, e.g. "Every 2h", "daily 08:00", "Weekly (Mon)".

    Returns:
        A (class, daypart) pair. Class is one of sub-daily, cycle-2h, daily, weekly,
        monthly, event, unknown. Daypart is "am", "pm" or None and only ever set for
        the daily class -- it is what separates a morning brief from an evening one.
    """
    t = (text or "").lower()
    daypart = None
    hh = re.search(r"\b(\d{1,2}):(\d{2})\b", t)
    if hh:
        daypart = "am" if int(hh.group(1)) < 12 else "pm"
    elif re.search(r"\b(am|morning)\b", t):
        daypart = "am"
    elif re.search(r"\b(pm|evening)\b", t):
        daypart = "pm"
    if "event" in t:
        return ("event", None)
    if "month" in t:
        return ("monthly", None)
    if "week" in t or "monday" in t:
        return ("weekly", None)
    if "daily" in t or "day" in t:
        return ("daily", daypart)
    if "2h" in t or "per cycle" in t or "cycle" in t:
        return ("cycle-2h", None)
    if "hour" in t or "min" in t:
        return ("sub-daily", None)
    return ("unknown", daypart)


# ---------------------------------------------------------------------------------
# board parsing
# ---------------------------------------------------------------------------------
def parse_board(text: str, source: str) -> list[dict]:
    """Parse markdown pipe-table rows out of a board file.

    Header rows and separator rows are skipped. Rows are returned even when their field
    count is wrong -- that is exactly what check 4 needs to see.

    Args:
        text: Full file content.
        source: Short label for the file, used in findings.

    Returns:
        One dict per data row: line, source, fields, and the schema columns that could
        be resolved (missing columns come back as '').
    """
    rows: list[dict] = []
    for lineno, raw in enumerate(text.split("\n"), 1):
        line = raw.strip()
        if not line.startswith("|"):
            continue
        fields = [c.strip() for c in line.strip("|").split("|")]
        if not fields:
            continue
        if fields[0].lower() == "task_id":
            continue
        if set("".join(fields)) <= set("- :"):
            continue

        def get(idx: int) -> str:
            return fields[idx] if idx < len(fields) else ""

        rows.append(
            {
                "line": lineno,
                "source": source,
                "n_fields": len(fields),
                "fields": fields,
                "task_id": get(COL_ID),
                "status": get(COL_STATUS).lower(),
                "desc": get(COL_DESC),
                "assigned_to": get(COL_OWNER),
                "created": get(COL_CREATED),
                "due": get(COL_DUE),
                "text": line,
            }
        )
    return rows


def load_rows(warnings: list[str]) -> tuple[list[dict], list[dict]]:
    """Load board.md rows and board-archive.md rows. Either may come back empty."""
    board = parse_board(_read(BOARD, warnings), "board.md")
    archive = parse_board(_read(ARCHIVE, warnings), "board-archive.md")
    if not board:
        warnings.append("board.md produced ZERO parseable rows -- checks 1-4 are blind")
    return board, archive


# ---------------------------------------------------------------------------------
# check 1 + 2: staleness and the deliverable-exists tracking gap
# ---------------------------------------------------------------------------------
def deliverable_paths(row: dict) -> list[str]:
    """Candidate deliverable FILE paths named anywhere in a board row.

    Only paths whose last segment carries an extension are returned. A bare directory
    reference ("memory/wiki/") is not a deliverable and would make every row that
    mentions a folder look complete.

    Args:
        row: A parsed board row.

    Returns:
        Repo-relative POSIX-style paths, de-duplicated, in first-seen order.
    """
    seen: list[str] = []
    for match in _PATH_RE.findall(row.get("text", "")):
        cand = match.replace("\\", "/").rstrip(".,;:)]\"'")
        tail = cand.rsplit("/", 1)[-1]
        if "." not in tail or tail.startswith("."):
            continue
        if cand in AMBIENT_FILES:
            continue
        if cand not in seen:
            seen.append(cand)
    return seen


def existing_deliverables(row: dict) -> list[str]:
    """Subset of deliverable_paths(row) that actually exists as a file on disk."""
    found: list[str] = []
    for rel in deliverable_paths(row):
        try:
            if (ROOT / rel).is_file():
                found.append(rel)
        except OSError:
            continue
    return found


def stated_reason(row: dict) -> str:
    """Return the good reason this row is allowed to sit, or '' if there is none.

    Good reasons, per the STALE-TASK SWEEP rule in agent-prompts.md: a named blocker,
    a gate, a future due date, waiting-on-owner, or a recurring cadence.
    """
    due = (row.get("due") or "").lower().strip()
    # A future due date is a good reason on its own.
    today = _today()
    for d in _dates_in(due):
        if d >= today:
            return f"future due date {d.isoformat()}"
    if due not in EMPTY_DUE and not NON_REASON_RE.search(due):
        for word in DUE_REASONS:
            if word in due:
                return f"due says '{row.get('due')[:60]}'"
    tail = (row.get("desc") or "")[-TAIL_CHARS:].lower()
    for word in TAIL_REASONS:
        if word in tail:
            return f"latest note states '{word}'"
    return ""


def check_stale(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    """Split active rows into genuine stale hits and deliverable-exists tracking gaps.

    Args:
        rows: Parsed board.md rows.

    Returns:
        (stale, tracking_gaps). A row lands in tracking_gaps -- never in stale -- when
        it names a deliverable file that already exists (the AUD-010 class).
    """
    today = _today()
    stale: list[dict] = []
    gaps: list[dict] = []
    for row in rows:
        if row["status"] not in ACTIVE_STATUS:
            continue
        note_dates = [d for d in _dates_in(row["desc"]) if d <= today]
        last_note = max(note_dates) if note_dates else None
        if last_note and (today - last_note).days <= STALE_DAYS:
            continue
        reason = stated_reason(row)
        if reason:
            continue
        created = _dates_in(row["created"])
        age = (today - min(created)).days if created else None
        finding = {
            "task_id": row["task_id"],
            "status": row["status"],
            "assigned_to": row["assigned_to"] or "(empty)",
            "age_days": age,
            "last_dated_note": last_note.isoformat() if last_note else None,
            "due": row["due"],
            "line": row["line"],
        }
        exists = existing_deliverables(row)
        if exists:
            finding["deliverables_on_disk"] = exists
            gaps.append(finding)
        else:
            stale.append(finding)
    return stale, gaps


# ---------------------------------------------------------------------------------
# check 3: duplicate task ids
# ---------------------------------------------------------------------------------
def check_duplicate_ids(rows: list[dict]) -> list[dict]:
    """Report any task_id that appears on more than one row (the T-0046 class)."""
    seen: dict[str, list[dict]] = {}
    for row in rows:
        tid = row["task_id"]
        if not tid:
            continue
        seen.setdefault(tid, []).append(row)
    out = []
    for tid, hits in sorted(seen.items()):
        if len(hits) > 1:
            out.append(
                {
                    "task_id": tid,
                    "count": len(hits),
                    "locations": [f"{h['source']}:{h['line']}" for h in hits],
                }
            )
    return out


# ---------------------------------------------------------------------------------
# check 4: schema violations
# ---------------------------------------------------------------------------------
def agent_names(warnings: list[str]) -> set[str]:
    """Agent names from the .claude/agents/ directory listing (filenames only).

    Only the directory listing is read -- never the role files themselves.
    """
    try:
        return {p.stem.lower() for p in AGENTS_DIR.glob("*.md")}
    except OSError as exc:
        warnings.append(f"cannot list .claude/agents ({type(exc).__name__})")
        return set()


def check_schema(rows: list[dict], known: set[str]) -> tuple[list[dict], list[dict]]:
    """Check field count and assigned_to on every row.

    Args:
        rows: Parsed board.md rows.
        known: Lowercase agent names from the .claude/agents/ listing.

    Returns:
        (field_count_violations, owner_violations).
    """
    bad_shape: list[dict] = []
    bad_owner: list[dict] = []
    for row in rows:
        if row["n_fields"] != SCHEMA_COLS:
            bad_shape.append(
                {
                    "task_id": row["task_id"],
                    "line": row["line"],
                    "n_fields": row["n_fields"],
                    "expected": SCHEMA_COLS,
                    "effect": (
                        "extra pipe -- owner/dates shift right"
                        if row["n_fields"] > SCHEMA_COLS
                        else "missing pipe -- owner/dates shift left"
                    ),
                }
            )
            continue  # every later column is unreliable on a wrong-width row
        if row["status"] not in ACTIVE_STATUS:
            continue  # only live rows need a dispatchable single owner
        owner = row["assigned_to"]
        low = owner.lower()
        problem = ""
        if not owner:
            problem = "empty assigned_to"
        elif any(g in low for g in GROUP_WORDS):
            problem = "names a group/department, not a single agent"
        elif MULTI_OWNER_RE.search(re.sub(r"\([^)]*\)", "", owner)):
            problem = "names multiple owners (single-owner baton rule)"
        else:
            head = re.split(r"[\s(]", owner, maxsplit=1)[0].lower()
            if head not in known and head not in KNOWN_NON_AGENT_OWNERS:
                problem = f"'{head}' has no .claude/agents/ role file"
        if problem:
            bad_owner.append(
                {
                    "task_id": row["task_id"],
                    "line": row["line"],
                    "assigned_to": owner,
                    "problem": problem,
                }
            )
    return bad_shape, bad_owner


# ---------------------------------------------------------------------------------
# check 5: trigger health
# ---------------------------------------------------------------------------------
def parse_registry(text: str) -> list[dict]:
    """Parse the job registry of record: agent-prompts.md section headers.

    A section counts as a registered job when its header is "## <Agent> -- <Task>" AND
    the section carries a "Telegram-facing:" line. That second condition is what keeps
    prose sections ("## SHIR Wiring Note -- 2026-07-10") out of the registry, while
    keeping the deterministic script job (Shir's git-hygiene audit) in it.

    Args:
        text: Full agent-prompts.md content.

    Returns:
        One dict per job: key, agent, task, cadence class/daypart, expiry, has_prompt.
    """
    jobs: list[dict] = []
    blocks = re.split(r"(?m)^##\s+", text)
    for block in blocks[1:]:
        header, _, body = block.partition("\n")
        header = header.strip()
        if " -- " not in header:
            continue
        agent, _, task = header.partition(" -- ")
        agent, task = agent.strip(), task.strip()
        if not agent or not task:
            continue
        if not re.search(r"(?mi)^Telegram-facing:", body):
            continue
        exp = _EXPIRES_RE.search(task)
        cls, daypart = cadence_of(task)
        jobs.append(
            {
                "key": f"{agent}:{task}",
                "agent": agent,
                "task": task,
                "cadence_class": cls,
                "daypart": daypart,
                "expiry": exp.group(1) if exp else None,
                "has_prompt": "```" in body,
            }
        )
    return jobs


def parse_retired(text: str) -> list[dict]:
    """Parse RETIRED job markers left as HTML comments in agent-prompts.md.

    A retired job is deliberately kept as a comment (not a heading) so the runner's
    parser never registers it. This function finds those markers so a schedules.md row
    that still lists the job can be named as retired rather than as a phantom defect.
    """
    out: list[dict] = []
    for body in re.findall(r"<!--(.*?)-->", text or "", re.DOTALL):
        m = re.search(r"([^\n]*?)\bRETIRED\b\s*(\d{4}-\d{2}-\d{2})?", body)
        if not m:
            continue
        name = m.group(1).strip()
        if not name:
            continue
        out.append(
            {
                "name": name,
                "agent": name.split()[0],
                "retired_on": m.group(2),
                "tokens": _tokens(name),
            }
        )
    return out


def parse_schedules(text: str) -> list[dict]:
    """Parse the human-facing schedule table in company/governance/schedules.md.

    Rows whose Status says PENDING are marked not_live -- they are declared future
    builds, not drift, and must not be reported as missing jobs.
    """
    rows: list[dict] = []
    for lineno, raw in enumerate((text or "").split("\n"), 1):
        line = raw.strip()
        if not line.startswith("|"):
            continue
        f = [c.strip() for c in line.strip("|").split("|")]
        if len(f) < 4 or f[0].lower() == "agent":
            continue
        if set("".join(f)) <= set("- :"):
            continue
        cls, daypart = cadence_of(f[2])
        status = f[3].lower()
        for agent in [a.strip() for a in f[0].split("+") if a.strip()]:
            rows.append(
                {
                    "agent": agent,
                    "task": f[1],
                    "cadence": f[2],
                    "cadence_class": cls,
                    "daypart": daypart,
                    "status": f[3],
                    "not_live": "pending" in status,
                    "line": lineno,
                    "tokens": _tokens(f[1]),
                }
            )
    return rows


def last_terminal_events(warnings: list[str]) -> dict[str, dict]:
    """Last TERMINAL event per job key from memory/agent-runs.jsonl.

    The last terminal event -- not the last run date -- is the only thing that says
    whether a job WORKED. Reading the last run date is precisely how Rambo's weekly
    permission-drift scan showed "OK" on the dashboard while error_final'ing every
    single week since 2026-07-18.

    Malformed JSON lines are counted into a warning and skipped, never raised.
    """
    out: dict[str, dict] = {}
    bad = 0
    try:
        with RUNLOG.open("r", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except ValueError:
                    bad += 1
                    continue
                if not isinstance(rec, dict):
                    bad += 1
                    continue
                key, event = rec.get("key"), rec.get("event")
                if not key or event not in TERMINAL_EVENTS:
                    continue
                out[key] = {
                    "event": event,
                    "ts": rec.get("ts"),
                    "rc": rec.get("rc"),
                    "err": str(rec.get("err"))[:120] if rec.get("err") else None,
                }
    except OSError as exc:
        warnings.append(f"unreadable: {RUNLOG.name} ({type(exc).__name__})")
        return {}
    if bad:
        warnings.append(f"{bad} malformed line(s) skipped in {RUNLOG.name}")
    return out


def _event_dt(rec: dict | None) -> datetime | None:
    """Timezone-aware timestamp of a terminal-event record, or None if unparseable."""
    if not rec or not rec.get("ts"):
        return None
    try:
        dt = datetime.fromisoformat(str(rec["ts"]))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _age_hours(dt: datetime | None) -> float | None:
    """Hours elapsed since `dt`, computed in UTC. Duration, so never date-granular."""
    if dt is None:
        return None
    return (datetime.now(timezone.utc) - dt).total_seconds() / 3600.0


def _match_runlog(job: dict, runlog: dict[str, dict]) -> str | None:
    """Resolve a registry job to its run-log key: exact first, then token overlap."""
    if job["key"] in runlog:
        return job["key"]
    want = _tokens(job["task"])
    best, best_score = None, 0
    for key in runlog:
        agent, _, task = key.partition(":")
        if agent.lower() != job["agent"].lower():
            continue
        score = len(want & _tokens(task))
        if score > best_score:
            best, best_score = key, score
    return best if best_score >= 2 else None


def check_triggers(warnings: list[str]) -> dict:
    """Cross-reference the job registry, the human schedule, and the run log.

    Returns:
        A dict of finding lists: failing, registry_drift, missing_from_schedules,
        overdue, never_run, cadence_disagreement, and info (non-actionable notes).
    """
    registry = parse_registry(_read(PROMPTS, warnings))
    retired = parse_retired(_read(PROMPTS, warnings))
    schedule = parse_schedules(_read(SCHEDULES, warnings))
    runlog = last_terminal_events(warnings)
    today = _today()
    if not registry:
        warnings.append(
            "agent-prompts.md produced ZERO jobs -- trigger health is blind"
        )

    res: dict[str, list] = {
        "failing": [],
        "registry_drift": [],
        "missing_from_schedules": [],
        "overdue": [],
        "never_run": [],
        "cadence_disagreement": [],
        "info": [],
    }

    # Tier 1: match schedule rows to registry jobs on (agent, cadence class, daypart).
    used_jobs: set[int] = set()
    for row in schedule:
        row["match"] = None
        if row["not_live"]:
            continue
        for i, job in enumerate(registry):
            if i in used_jobs or job["agent"].lower() != row["agent"].lower():
                continue
            if job["cadence_class"] != row["cadence_class"]:
                continue
            if job["daypart"] and row["daypart"] and job["daypart"] != row["daypart"]:
                continue
            used_jobs.add(i)
            row["match"] = job
            break

    # Tier 2: same agent, exactly one unmatched row and one unmatched job left. That is
    # a pairing, not drift -- but the cadences disagree and that is worth naming.
    for row in schedule:
        if row["not_live"] or row["match"]:
            continue
        cands = [
            i
            for i, job in enumerate(registry)
            if i not in used_jobs and job["agent"].lower() == row["agent"].lower()
        ]
        peers = [
            r
            for r in schedule
            if not r["not_live"]
            and not r["match"]
            and r["agent"].lower() == row["agent"].lower()
        ]
        if len(cands) == 1 and len(peers) == 1:
            job = registry[cands[0]]
            used_jobs.add(cands[0])
            row["match"] = job
            res["cadence_disagreement"].append(
                {
                    "agent": row["agent"],
                    "schedules_task": row["task"],
                    "schedules_cadence": row["cadence"],
                    "registry_task": job["task"],
                    "registry_cadence_class": job["cadence_class"],
                    "line": row["line"],
                }
            )

    # Tier 3: an unmatched schedule row is drift -- annotated with whatever the run log
    # actually knows, so a live runner.py script job is not mislabelled as a phantom.
    for row in schedule:
        if row["not_live"] or row["match"]:
            continue
        evidence_key, evidence_score = None, 0
        for key in runlog:
            agent, _, task = key.partition(":")
            if agent.lower() != row["agent"].lower():
                continue
            score = len(row["tokens"] & _tokens(task))
            if score > evidence_score:
                evidence_key, evidence_score = key, score
        rec = runlog.get(evidence_key) if evidence_score >= 2 else None
        seen_dt = _event_dt(rec)
        seen = seen_dt.date() if seen_dt else None
        limit = OVERDUE_HOURS.get(row["cadence_class"], 72)
        age = _age_hours(seen_dt)
        live = age is not None and age <= limit
        retired_hit = None
        for r in retired:
            if r["agent"].lower() != row["agent"].lower():
                continue
            if len(r["tokens"] & row["tokens"]) >= 2:
                retired_hit = r
                break
        entry = {
            "agent": row["agent"],
            "schedules_task": row["task"],
            "cadence": row["cadence"],
            "line": row["line"],
            "runlog_key": evidence_key if rec else None,
            "runlog_last_terminal": (rec or {}).get("event"),
            "runlog_last_date": seen.isoformat() if seen else None,
        }
        if retired_hit:
            entry["retired_marker"] = retired_hit["name"]
            entry["retired_on"] = retired_hit["retired_on"]
            flagged = "retired" in row["status"].lower()
            entry["note"] = (
                "RETIRED in agent-prompts.md and still listed in schedules.md -- "
                + (
                    "the schedules Status column already says RETIRED, so delete the "
                    "row when convenient; it is NOT a defect to chase"
                    if flagged
                    else "the schedules row still reads as live; this is the phantom "
                    "defect class -- mark or delete it"
                )
            )
            res["registry_drift"].append(entry)
        elif live:
            entry["note"] = (
                "not in agent-prompts.md but running -- registered directly in "
                "runner.py as a script job; schedules.md is the only human record"
            )
            res["info"].append(entry)
        else:
            entry["note"] = (
                "listed in schedules.md, absent from agent-prompts.md, no recent "
                "run-log evidence -- phantom job"
            )
            res["registry_drift"].append(entry)

    scheduled_jobs = {id(r["match"]) for r in schedule if r.get("match")}
    for i, job in enumerate(registry):
        expired = False
        if job["expiry"]:
            try:
                expired = datetime.fromisoformat(job["expiry"]).date() < today
            except ValueError:
                pass
        key = _match_runlog(job, runlog)
        rec = runlog.get(key) if key else None
        seen_dt = _event_dt(rec)
        seen = seen_dt.date() if seen_dt else None
        base = {
            "key": job["key"],
            "agent": job["agent"],
            "cadence_class": job["cadence_class"],
            "runlog_key": key,
            "last_terminal": (rec or {}).get("event"),
            "last_terminal_date": seen.isoformat() if seen else None,
            "expired": expired,
        }
        if id(job) not in scheduled_jobs and i not in used_jobs:
            res["missing_from_schedules"].append(
                {**base, "task": job["task"], "note": "no schedules.md row"}
            )
        if rec and rec["event"] in FAILURE_EVENTS:
            res["failing"].append(
                {
                    **base,
                    "err": rec.get("err"),
                    "note": "last TERMINAL event is a failure",
                }
            )
            continue
        if expired:
            continue
        if not rec:
            res["never_run"].append(
                {**base, "note": "no terminal event in the run log"}
            )
            continue
        if rec["event"] in SKIP_EVENTS:
            res["info"].append(
                {**base, "note": f"last terminal event was a {rec['event']}"}
            )
        limit = OVERDUE_HOURS.get(job["cadence_class"])
        age = _age_hours(seen_dt)
        if limit and age is not None and age > limit:
            res["overdue"].append(
                {
                    **base,
                    "hours_since": round(age, 1),
                    "allowed_hours": limit,
                }
            )
    return res


# ---------------------------------------------------------------------------------
# check 6: next-id allocator
# ---------------------------------------------------------------------------------
def next_ids() -> dict:
    """Next free task id per prefix across board.md and board-archive.md.

    Returns:
        {"prefixes": {prefix: {"max_seen", "next", "count"}}, "warnings": [...]}.
    """
    warnings: list[str] = []
    board, archive = load_rows(warnings)
    highest: dict[str, tuple[int, int, int]] = {}
    for row in board + archive:
        m = _ID_RE.match(row["task_id"] or "")
        if not m:
            if row["task_id"]:
                warnings.append(
                    f"unparseable id '{row['task_id'][:24]}' "
                    f"at {row['source']}:{row['line']}"
                )
            continue
        prefix, num, width = m.group(1), int(m.group(2)), len(m.group(2))
        cur = highest.get(prefix, (0, 0, 0))
        highest[prefix] = (max(cur[0], num), max(cur[1], width), cur[2] + 1)
    out = {}
    for prefix in sorted(highest):
        top, width, count = highest[prefix]
        out[prefix] = {
            "max_seen": f"{prefix}-{top:0{width}d}",
            "next": f"{prefix}-{top + 1:0{width}d}",
            "count": count,
        }
    return {"prefixes": out, "warnings": warnings}


# ---------------------------------------------------------------------------------
# report assembly
# ---------------------------------------------------------------------------------
def build_report() -> dict:
    """Run every check and return the machine-readable report (same as --json)."""
    warnings: list[str] = []
    board, archive = load_rows(warnings)
    known = agent_names(warnings)
    stale, gaps = check_stale(board)
    dups = check_duplicate_ids(board + archive)
    bad_shape, bad_owner = check_schema(board, known)
    triggers = check_triggers(warnings)

    counts = {
        "stale": len(stale),
        "tracking_gaps": len(gaps),
        "duplicate_ids": len(dups),
        "schema_field_count": len(bad_shape),
        "schema_owner": len(bad_owner),
        "trigger_failing": len(triggers["failing"]),
        "trigger_registry_drift": len(triggers["registry_drift"]),
        "trigger_missing_from_schedules": len(triggers["missing_from_schedules"]),
        "trigger_overdue": len(triggers["overdue"]),
        "trigger_never_run": len(triggers["never_run"]),
        "trigger_cadence_disagreement": len(triggers["cadence_disagreement"]),
    }
    verdict = "ATTENTION" if any(counts.values()) else "CLEAN"
    return {
        "verdict": verdict,
        "date": _today().isoformat(),
        "rows_scanned": len(board),
        "archive_rows_scanned": len(archive),
        "counts": counts,
        "stale": stale,
        "tracking_gaps": gaps,
        "duplicate_ids": dups,
        "schema_field_count": bad_shape,
        "schema_owner": bad_owner,
        "triggers": triggers,
        "warnings": warnings,
    }


def _verdict_line(rep: dict) -> str:
    """One-line verdict, first line of both the human and the log output."""
    c = rep["counts"]
    return (
        f"task-hygiene: {rep['verdict']} | {c['stale']} stale | "
        f"{c['tracking_gaps']} tracking-gap | {c['duplicate_ids']} dup-id | "
        f"{c['schema_field_count'] + c['schema_owner']} schema | "
        f"{c['trigger_failing']} trigger-fail | "
        f"{c['trigger_registry_drift']} registry-drift | "
        f"{c['trigger_overdue']} overdue"
    )


def render_human(rep: dict) -> str:
    """Render the paste-into-a-check-in report: verdict line, then grouped findings."""
    out: list[str] = [_verdict_line(rep)]
    out.append(
        f"scanned {rep['rows_scanned']} board rows "
        f"+ {rep['archive_rows_scanned']} archive rows on {rep['date']} "
        "(read-only, zero-token)"
    )
    t = rep["triggers"]

    def section(title: str, lines: list[str]) -> None:
        out.append("")
        out.append(f"## {title} ({len(lines)})")
        out.extend(lines or ["  - none"])

    section(
        "STALE ROWS -- no dated progress in 72h, no stated reason",
        [
            f"  - {s['task_id']} | owner {s['assigned_to']} | age "
            f"{s['age_days'] if s['age_days'] is not None else '?'}d | last dated note "
            f"{s['last_dated_note'] or 'NONE EVER'} | due '{s['due'][:40]}'"
            for s in rep["stale"]
        ],
    )
    section(
        "TRACKING GAPS -- deliverable already on disk (AUD-010 class)",
        [
            f"  - {g['task_id']} | owner {g['assigned_to']} | last dated note "
            f"{g['last_dated_note'] or 'NONE EVER'} | on disk: "
            f"{', '.join(g['deliverables_on_disk'][:3])}"
            for g in rep["tracking_gaps"]
        ],
    )
    section(
        "DUPLICATE TASK IDS (T-0046 class)",
        [
            f"  - {d['task_id']} x{d['count']} at {', '.join(d['locations'])}"
            for d in rep["duplicate_ids"]
        ],
    )
    section(
        "SCHEMA -- wrong field count",
        [
            f"  - line {b['line']} | {b['task_id'] or '(no id)'} | "
            f"{b['n_fields']} fields "
            f"(expected {b['expected']}) -- {b['effect']}"
            for b in rep["schema_field_count"]
        ],
    )
    section(
        "SCHEMA -- assigned_to not a single named agent (active rows)",
        [
            f"  - {b['task_id']} | '{b['assigned_to'][:52]}' -- {b['problem']}"
            for b in rep["schema_owner"]
        ],
    )
    section(
        "TRIGGERS -- last terminal event is a FAILURE",
        [
            f"  - {f['key']} | {f['last_terminal']} on {f['last_terminal_date']} "
            f"| {f['err'] or 'no error text'}"
            for f in t["failing"]
        ],
    )
    section(
        "TRIGGERS -- registry drift (in schedules.md, not in agent-prompts.md)",
        [
            f"  - {d['agent']} | '{d['schedules_task'][:48]}' (schedules.md line "
            f"{d['line']}) -- {d['note']}"
            for d in t["registry_drift"]
        ],
    )
    section(
        "TRIGGERS -- in agent-prompts.md, missing from schedules.md",
        [
            f"  - {m['key'][:80]}{' [EXPIRED]' if m['expired'] else ''}"
            for m in t["missing_from_schedules"]
        ],
    )
    section(
        "TRIGGERS -- overdue against own cadence",
        [
            f"  - {o['key'][:70]} | {o['cadence_class']} | last terminal "
            f"{o['last_terminal']} {o['last_terminal_date']} ({o['hours_since']}h ago, "
            f"allowed {o['allowed_hours']}h)"
            for o in t["overdue"]
        ],
    )
    section(
        "TRIGGERS -- registered but never run",
        [f"  - {n['key'][:80]} -- {n['note']}" for n in t["never_run"]],
    )
    section(
        "TRIGGERS -- cadence disagreement between the two files",
        [
            f"  - {c['agent']} | schedules.md says '{c['schedules_cadence']}' | "
            f"registry says '{c['registry_cadence_class']}' ({c['registry_task'][:40]})"
            for c in t["cadence_disagreement"]
        ],
    )
    if t["info"]:
        out.append("")
        out.append(f"## NOTES (not counted, no action implied) ({len(t['info'])})")
        for i in t["info"]:
            label = i.get("key") or (
                f"{i.get('agent')} | {i.get('schedules_task', '')[:40]}"
            )
            out.append(f"  - {label[:76]} -- {i['note']}")
    if rep["warnings"]:
        out.append("")
        out.append(f"## WARNINGS -- degraded input ({len(rep['warnings'])})")
        out.extend(f"  - {w}" for w in rep["warnings"])
    return "\n".join(out)


def render_next_ids(data: dict) -> str:
    """Render --next-id output: one line per prefix, next free id first."""
    out = [
        "task-hygiene next-id: next free id per prefix "
        "(board.md + board-archive.md)"
    ]
    for prefix, info in data["prefixes"].items():
        out.append(
            f"  {info['next']:<12} (prefix {prefix}-, {info['count']} rows, "
            f"highest seen {info['max_seen']})"
        )
    if not data["prefixes"]:
        out.append("  (no ids found)")
    for w in data["warnings"]:
        out.append(f"  WARN: {w}")
    return "\n".join(out)


def main() -> int:
    """CLI entry point. 0 = CLEAN, 1 = ATTENTION, 2 = detector error."""
    ap = argparse.ArgumentParser(
        description="Zero-token task-hygiene detector for memory/board.md (T-0045)."
    )
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    ap.add_argument(
        "--next-id",
        action="store_true",
        dest="next_id",
        help="print the next free task id per prefix and exit 0",
    )
    args = ap.parse_args()

    try:
        if args.next_id:
            data = next_ids()
            print(json.dumps(data, indent=2) if args.json else render_next_ids(data))
            return 0
        rep = build_report()
    except Exception as exc:  # noqa: BLE001 -- the detector must never crash a caller
        print(f"task-hygiene detector error: {type(exc).__name__}: {exc}")
        return 2
    print(json.dumps(rep, indent=2) if args.json else render_human(rep))
    return 1 if rep["verdict"] == "ATTENTION" else 0


if __name__ == "__main__":
    raise SystemExit(main())
