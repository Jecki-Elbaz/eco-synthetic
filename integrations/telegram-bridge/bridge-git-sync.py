"""
PROPOSAL -- not deployed. Deployment is owner A1 per git-sync-autonomous-recommendation.md.

bridge-git-sync.py -- persistent bridge-host git-sync daemon

Purpose:
    Runs alongside bridge.py on the bridge host. Handles two git-sync directions
    that GitSyncRunner (cloud session) cannot reach:

    Direction B (local->remote):
        Watches memory/ and integrations/ for file changes (watchdog or polling).
        Debounce 30s to batch rapid writes.
        Pull-before-push: fetch + ff-only merge of data-plane changes only.
        Stage scoped paths only (memory/, integrations/).
        Commit and push to origin master.
        Retry up to 3x with exponential backoff (2s/4s/8s).
        Never stages control-plane paths.

    Direction C (remote->local):
        Periodic ff-only pull every 5 minutes.
        Data-plane only -- if control-plane changes detected, log BLOCKED and
        wait for GitSyncRunner to resolve them first.

This file does NOT modify bridge.py. It is a separate process.
Bridge.py continues to operate independently.

Auth: A2 build (Ido). A1 required to deploy or run on bridge host.
Rambo clearance required before commit.

Dependencies (pinned versions -- never use 'latest'):
    watchdog==4.0.1
    gitpython==3.1.43

Do NOT add new dependencies without passing the Security + Legal gate
(CLAUDE.md red line 4). Pin all versions explicitly.

No em dashes, no curly quotes. Plain ASCII only.
"""

import os
import sys
import time
import logging
import subprocess
import re
import threading
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Dependency import with clear error on missing package
# ---------------------------------------------------------------------------
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False

# ---------------------------------------------------------------------------
# Configuration constants (owner pins REPO_ROOT at bootstrap)
# ---------------------------------------------------------------------------

REPO_ROOT = os.environ.get("GIT_SYNC_REPO_ROOT", "/home/user/eco-synthetic")

# Paths this daemon watches for local changes (Direction B).
# MUST match the data-plane list in the runner design Section 1.2.
WATCH_PATHS = [
    "memory",
    "integrations",
]

# Paths staged on commit. Only these are ever passed to git add.
# Control-plane paths are never staged by this daemon.
STAGE_PATHS = [
    "memory/",
    "integrations/",
]

# Paths this daemon NEVER stages, regardless of watchdog events.
# Listed explicitly as a defense-in-depth check against classification bugs.
NEVER_STAGE = [
    ".claude/",
    "CLAUDE.md",
    "company/governance/",
    "scripts/",
    "bridge.py",
    "company/constitution.md",
    ".env",
    "sources/",
]

# Control-plane regex pattern (canonical from recommendation.md Section 3.1).
CP_PATTERN = re.compile(
    r"^(\.claude/|CLAUDE\.md$|bridge\.py$|scripts/|company/governance/|company/constitution\.md$)"
)

# Data-plane prefixes (authoritative from runner design Section 1.2).
DP_PREFIXES = (
    "memory/",
    "projects/",
    "company/processes/",
    "company/decisions/",
    "integrations/",
    "logs/",
)

DEBOUNCE_SECONDS = 30
POLL_INTERVAL_SECONDS = 300  # 5 minutes for Direction C
PUSH_RETRY_DELAYS = [2, 4, 8]  # exponential backoff in seconds

LOG_PATH = os.path.join(REPO_ROOT, "logs", "bridge-sync.log")
AUDIT_LOG_PATH = os.path.join(REPO_ROOT, "logs", "gate-audit.log")
BOARD_MD_PATH = os.path.join(REPO_ROOT, "memory", "board.md")

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

def setup_logging():
    """Configure logging to file and stdout."""
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    log_format = "%(asctime)s UTC | %(levelname)s | %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler(LOG_PATH),
            logging.StreamHandler(sys.stdout),
        ],
    )
    # Force UTC timestamps
    logging.Formatter.converter = time.gmtime

logger = logging.getLogger("bridge-git-sync")

# ---------------------------------------------------------------------------
# Git helpers (all subprocess calls; no gitpython for core operations to
# keep the dependency surface minimal and auditable)
# ---------------------------------------------------------------------------

def git(*args, check=True):
    """
    Run a git command in REPO_ROOT. Returns CompletedProcess.
    Raises subprocess.CalledProcessError on non-zero exit if check=True.

    Allowed commands: fetch, diff, merge --ff-only, add (scoped), commit, push,
    rev-parse, rev-list, for-each-ref, log.
    This function does NOT enforce a command allowlist -- the caller must only
    pass safe commands. Destructive commands (reset --hard, push --force, rebase,
    rm -rf) are never called anywhere in this file.
    """
    cmd = ["git"] + list(args)
    return subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=check,
    )

def utc_now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def append_audit_log(line):
    """Append a line to the audit log (append-only, never truncated)."""
    os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
    with open(AUDIT_LOG_PATH, "a") as f:
        f.write(line + "\n")

def append_board_blocked(reason):
    """Append a BLOCKED row to memory/board.md to signal the owner."""
    ts = utc_now_iso()
    row = f"| BLOCKED | {ts} | bridge-git-sync | {reason} | owner-review |"
    with open(BOARD_MD_PATH, "a") as f:
        f.write(row + "\n")
    logger.warning("Board BLOCKED row written: %s", reason)

# ---------------------------------------------------------------------------
# Classification helpers
# ---------------------------------------------------------------------------

def is_control_plane(path):
    """
    Returns True if path is a control-plane file.
    Rule 1: matches CP_PATTERN.
    Rule 2 (residual): does NOT start with any DP_PREFIX.
    Residual defaults to control-plane (fail-closed).
    """
    if CP_PATTERN.match(path):
        return True
    # Check if it matches any data-plane prefix
    for prefix in DP_PREFIXES:
        if path.startswith(prefix):
            return False
    return True  # residual: unknown path is control-plane


def has_control_plane_changes():
    """
    Checks whether origin/master..HEAD diff contains any control-plane file.
    Used in Direction C before pulling to decide whether to block.
    Returns (bool has_cp, list cp_files).
    """
    try:
        result = git("diff", "HEAD..origin/master", "--name-only", check=False)
        if result.returncode != 0:
            logger.error("diff failed: %s", result.stderr)
            return True, ["DIFF_ERROR"]  # fail-closed: treat as control-plane

        changed = [f for f in result.stdout.strip().splitlines() if f]
        cp_files = [f for f in changed if is_control_plane(f)]
        return bool(cp_files), cp_files
    except Exception as exc:
        logger.error("has_control_plane_changes exception: %s", exc)
        return True, ["EXCEPTION"]  # fail-closed


def is_behind_origin():
    """Returns True if local HEAD is behind origin/master."""
    try:
        result = git("rev-list", "HEAD..origin/master", "--count", check=False)
        if result.returncode != 0:
            return False  # cannot determine; assume not behind
        count = int(result.stdout.strip() or "0")
        return count > 0
    except Exception:
        return False

# ---------------------------------------------------------------------------
# Pull logic (Direction C and pull-before-push)
# ---------------------------------------------------------------------------

def fetch():
    """Fetch from origin. Returns True on success."""
    try:
        git("fetch", "origin")
        return True
    except subprocess.CalledProcessError as exc:
        logger.error("git fetch failed: %s", exc.stderr)
        return False


def pull_data_plane_only():
    """
    Attempt a ff-only pull for data-plane changes only.
    If control-plane changes are pending, log BLOCKED and return False.
    Returns True on clean success, False on block or failure.
    """
    if not fetch():
        logger.warning("PULL: fetch failed -- skipping merge")
        return False

    if not is_behind_origin():
        return True  # already up to date

    has_cp, cp_files = has_control_plane_changes()
    ts = utc_now_iso()

    if has_cp:
        msg = f"BLOCKED: control-plane files in origin/master, waiting for GitSyncRunner. files={cp_files}"
        logger.warning("PULL: %s", msg)
        append_audit_log(
            f"{ts} | BRIDGE-PULL | ACTION=BLOCKED | REASON=CONTROL-PLANE-PENDING | FILES={cp_files}"
        )
        return False

    # Data-plane only: proceed with ff-only merge
    try:
        result = git("merge", "--ff-only", "origin/master", check=False)
        if result.returncode == 0:
            sha = git("rev-parse", "HEAD").stdout.strip()
            append_audit_log(
                f"{ts} | BRIDGE-PULL | ACTION=FF-MERGED | SHA={sha}"
            )
            logger.info("PULL: ff-only merge complete sha=%s", sha)
            return True
        else:
            logger.error("PULL: ff-only merge refused: %s", result.stderr)
            append_audit_log(
                f"{ts} | BRIDGE-PULL | ACTION=FF-MERGE-FAILED | STDERR={result.stderr.strip()}"
            )
            append_board_blocked(f"bridge ff-only pull failed: {result.stderr.strip()[:120]}")
            return False
    except Exception as exc:
        logger.error("PULL: exception during merge: %s", exc)
        return False

# ---------------------------------------------------------------------------
# Commit-and-push logic (Direction B)
# ---------------------------------------------------------------------------

def safe_stage():
    """
    Stage only STAGE_PATHS. Never stages NEVER_STAGE paths.
    Returns True if there are staged changes, False if nothing to stage.
    """
    # Verify none of the NEVER_STAGE paths are about to be staged.
    # This is a defense-in-depth check; the path list itself prevents it.
    for path in STAGE_PATHS:
        for blocked in NEVER_STAGE:
            if path.startswith(blocked) or blocked.startswith(path):
                logger.error(
                    "STAGE SAFETY: STAGE_PATHS contains or overlaps NEVER_STAGE path %s -- aborting",
                    blocked,
                )
                return False

    try:
        for path in STAGE_PATHS:
            git("add", path, check=False)
    except Exception as exc:
        logger.error("git add failed: %s", exc)
        return False

    # Check if anything is actually staged
    result = git("diff", "--cached", "--quiet", check=False)
    has_staged = result.returncode != 0  # non-zero means there are staged changes
    return has_staged


def commit_and_push():
    """
    Pull-before-push, then stage, commit, and push with retry.
    Returns True on success, False on failure after all retries.
    """
    # Pull-before-push: get latest remote state first
    if not pull_data_plane_only():
        logger.warning("PUSH: pull-before-push failed or blocked -- skipping commit cycle")
        return False

    if not safe_stage():
        logger.info("PUSH: nothing staged after git add -- no commit needed")
        return True  # not a failure; just nothing to do

    ts = utc_now_iso()
    commit_msg = f"auto: bridge agent sync {ts}"

    try:
        git("commit", "-m", commit_msg)
    except subprocess.CalledProcessError as exc:
        logger.error("PUSH: git commit failed: %s", exc.stderr)
        return False

    sha = git("rev-parse", "HEAD", check=False).stdout.strip()
    logger.info("PUSH: committed sha=%s msg=%s", sha, commit_msg)

    for attempt, delay in enumerate(PUSH_RETRY_DELAYS, start=1):
        try:
            result = git("push", "origin", "master", check=False)
            if result.returncode == 0:
                append_audit_log(
                    f"{ts} | BRIDGE-PUSH | SHA={sha} | ACTION=PUSHED | ATTEMPT={attempt}"
                )
                logger.info("PUSH: success on attempt %d sha=%s", attempt, sha)
                return True
            else:
                logger.warning(
                    "PUSH: attempt %d failed: %s -- retrying in %ds",
                    attempt, result.stderr.strip(), delay
                )
        except Exception as exc:
            logger.error("PUSH: attempt %d exception: %s -- retrying in %ds", attempt, exc, delay)

        if attempt < len(PUSH_RETRY_DELAYS):
            time.sleep(delay)

    # All retries exhausted
    logger.error("PUSH: all retries failed for sha=%s -- PUSH_FAILED", sha)
    append_audit_log(
        f"{ts} | BRIDGE-PUSH | SHA={sha} | ACTION=PUSH_FAILED | RETRIES={len(PUSH_RETRY_DELAYS)}"
    )
    append_board_blocked(f"bridge push failed after {len(PUSH_RETRY_DELAYS)} retries sha={sha}")
    return False

# ---------------------------------------------------------------------------
# Watchdog event handler (Direction B trigger)
# ---------------------------------------------------------------------------

class AgentWriteHandler(FileSystemEventHandler):
    """
    Handles filesystem events in the watched paths (memory/, integrations/).
    Debounces 30s to batch rapid writes before committing.
    """

    def __init__(self, trigger_callback):
        super().__init__()
        self._timer = None
        self._lock = threading.Lock()
        self._trigger = trigger_callback

    def _schedule_commit(self):
        """(Re)schedule the debounced commit."""
        with self._lock:
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(DEBOUNCE_SECONDS, self._run_commit)
            self._timer.daemon = True
            self._timer.start()

    def _run_commit(self):
        """Called after debounce period elapses."""
        with self._lock:
            self._timer = None
        logger.info("WATCHDOG: debounce elapsed -- triggering commit cycle")
        self._trigger()

    def on_any_event(self, event):
        # Skip directory events and hidden/temp files
        if event.is_directory:
            return
        path = event.src_path
        # Skip .git internals and files that should never be staged
        if "/.git/" in path or path.endswith(".swp") or path.endswith("~"):
            return
        logger.debug("WATCHDOG: event path=%s type=%s", path, event.event_type)
        self._schedule_commit()

# ---------------------------------------------------------------------------
# Polling loop (Direction C)
# ---------------------------------------------------------------------------

def direction_c_poll_loop(stop_event):
    """
    Periodically pulls data-plane changes from origin every POLL_INTERVAL_SECONDS.
    Runs in its own thread. Stops when stop_event is set.
    """
    logger.info("Direction C poll loop started (interval=%ds)", POLL_INTERVAL_SECONDS)
    while not stop_event.is_set():
        try:
            pull_data_plane_only()
        except Exception as exc:
            logger.error("Direction C poll exception: %s", exc)
        stop_event.wait(POLL_INTERVAL_SECONDS)
    logger.info("Direction C poll loop stopped")

# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def main():
    setup_logging()
    logger.info("bridge-git-sync.py starting -- REPO_ROOT=%s", REPO_ROOT)
    logger.info("PROPOSAL: not deployed. Deployment requires owner A1.")

    # Validate REPO_ROOT exists and is a git repo
    if not os.path.isdir(REPO_ROOT):
        logger.error("REPO_ROOT does not exist: %s -- exiting", REPO_ROOT)
        sys.exit(1)
    git_dir = os.path.join(REPO_ROOT, ".git")
    if not os.path.isdir(git_dir):
        logger.error("REPO_ROOT is not a git repo (no .git/): %s -- exiting", REPO_ROOT)
        sys.exit(1)

    # Create logs directory if absent (Direction B/C write audit logs there)
    os.makedirs(os.path.join(REPO_ROOT, "logs"), exist_ok=True)
    os.makedirs(os.path.join(REPO_ROOT, "logs", "quarantine"), exist_ok=True)

    # Initial pull on startup (Direction C bootstrap)
    logger.info("Startup: pulling latest data-plane changes from origin")
    pull_data_plane_only()

    stop_event = threading.Event()

    # Start Direction C poll loop in background thread
    poll_thread = threading.Thread(
        target=direction_c_poll_loop,
        args=(stop_event,),
        daemon=True,
        name="direction-c-poll",
    )
    poll_thread.start()

    # Start Direction B watchdog
    if WATCHDOG_AVAILABLE:
        logger.info("Starting watchdog observer for Direction B")
        observer = Observer()
        handler = AgentWriteHandler(trigger_callback=commit_and_push)
        for rel_path in WATCH_PATHS:
            abs_path = os.path.join(REPO_ROOT, rel_path)
            if os.path.isdir(abs_path):
                observer.schedule(handler, abs_path, recursive=True)
                logger.info("Watching: %s", abs_path)
            else:
                logger.warning("Watch path does not exist yet: %s -- skipping", abs_path)
        observer.start()
    else:
        logger.warning(
            "watchdog library not available. Direction B will use polling fallback "
            "every %ds instead of inotify events. Install watchdog==4.0.1 for "
            "event-driven operation.",
            DEBOUNCE_SECONDS,
        )
        observer = None

    logger.info("bridge-git-sync.py running. Press Ctrl+C to stop.")

    try:
        if observer is not None:
            # Watchdog available: sleep in main thread; watchdog handles events
            while True:
                time.sleep(60)
        else:
            # Polling fallback for Direction B (no watchdog)
            # Poll every DEBOUNCE_SECONDS for local changes
            while True:
                logger.debug("Polling fallback: checking for local changes")
                commit_and_push()
                time.sleep(DEBOUNCE_SECONDS)
    except KeyboardInterrupt:
        logger.info("Received KeyboardInterrupt -- shutting down")
    finally:
        stop_event.set()
        if observer is not None:
            observer.stop()
            observer.join(timeout=10)
        poll_thread.join(timeout=10)
        logger.info("bridge-git-sync.py stopped cleanly")


if __name__ == "__main__":
    main()
