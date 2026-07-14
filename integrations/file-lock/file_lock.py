#!/usr/bin/env python3
"""Sentinel-file locking for shared memory files (AUD-001, 2026-07-14).

Soft cross-process advisory lock: no external dependencies, no portalocker.
Sentinel files (.board.md.lock, .decisions-log.md.lock) live in the project
root (LOCK_DIR) and are gitignored.

Protocol:
  1. Check <target-basename>.lock in LOCK_DIR.
     - Absent -> create immediately (step 2).
     - Present, age < STALE_TIMEOUT_S -> another writer is active; wait 1s,
       retry; give up after `timeout` seconds (soft fail -- never deadlock).
     - Present, age >= STALE_TIMEOUT_S -> stale (crashed writer); clear it,
       proceed to step 2.
  2. Write sentinel: ISO timestamp + writer identity.
  3. Perform writes to the protected file.
  4. Delete sentinel on context exit (normal and exception paths).

Limits:
  - SOFT lock (advisory). Callers that skip this protocol can still race.
    Every write-path caller must participate -- see procedure.md.
  - Stale timeout: 30s. After that, a lock is assumed abandoned.
  - Wait timeout: configurable, default 30s. On expiry caller proceeds without
    lock and logs a warning (never deadlocks company operations).

API:
  acquire_file_lock(target, writer, timeout) -> contextmanager
  release_all_held_locks()                   -> cleanup for runner finally block
  lock_path_for(target)                      -> returns sentinel Path

Importable from runner.py via importlib (hyphenated directory):
  see runner.py header for the importlib pattern.
"""
from __future__ import annotations

import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
LOCK_DIR = ROOT          # sentinels live in project root, gitignored
STALE_TIMEOUT_S = 30    # seconds after which a held lock is considered stale

# Registry of sentinel Paths held by THIS process. Used by release_all_held_locks()
# to clean up after a crash.
_held_locks: list[Path] = []


def lock_path_for(target: Path) -> Path:
    """Return the sentinel path for a given target file (always in LOCK_DIR)."""
    return LOCK_DIR / f".{target.name}.lock"


def _sentinel_age(lp: Path) -> float | None:
    """Seconds since sentinel was last written; None if it does not exist."""
    try:
        return time.time() - lp.stat().st_mtime
    except OSError:
        return None


def _write_sentinel(lp: Path, writer: str) -> bool:
    """Create/overwrite the sentinel file. Returns True on success."""
    try:
        lp.write_text(
            f"{datetime.now(timezone.utc).isoformat()} | writer={writer}\n",
            encoding="utf-8",
        )
        return True
    except OSError:
        return False


def _remove_sentinel(lp: Path) -> None:
    """Delete sentinel and deregister from _held_locks (best-effort)."""
    try:
        lp.unlink(missing_ok=True)
    except OSError:
        pass
    if lp in _held_locks:
        _held_locks.remove(lp)


@contextmanager
def acquire_file_lock(
    target: Path,
    writer: str = "runner",
    timeout: int = 30,
) -> Generator[None, None, None]:
    """Acquire sentinel lock for `target` before a write; release on exit.

    Args:
        target:  Path of the file to protect (e.g. BOARD or DECISIONS_LOG).
        writer:  Identity string written into the sentinel file (agent:job_key).
        timeout: Max seconds to wait for a held lock before proceeding without
                 it. Soft limit -- never deadlocks.

    Usage:
        with acquire_file_lock(BOARD, writer="Eco:2h-checkin", timeout=30):
            # perform writes to board.md here
            ...
    """
    lp = lock_path_for(target)
    deadline = time.monotonic() + timeout
    acquired = False

    while True:
        age = _sentinel_age(lp)

        if age is None:
            # No lock present -- create it now.
            if _write_sentinel(lp, writer):
                _held_locks.append(lp)
                acquired = True
            # If write failed (race with another process right now), we still
            # proceed -- best-effort sentinel, not a hard OS lock.
            break

        if age >= STALE_TIMEOUT_S:
            # Stale sentinel: previous writer crashed or timed out. Clear and acquire.
            _remove_sentinel(lp)
            if _write_sentinel(lp, writer):
                _held_locks.append(lp)
                acquired = True
            break

        # Lock held within stale window -- wait 1s and retry.
        if time.monotonic() >= deadline:
            # Timeout reached: soft fail, proceed without lock to avoid deadlock.
            print(
                f"[file-lock] WARN: .{target.name}.lock held within stale window; "
                f"waited {timeout}s -- proceeding without lock (soft fail)."
            )
            break

        time.sleep(1)

    try:
        yield
    finally:
        if acquired:
            _remove_sentinel(lp)


def release_all_held_locks() -> None:
    """Delete all sentinel files held by this process.

    Call in runner main() finally block to clean up sentinels left after a
    crash or KeyboardInterrupt. Idempotent -- safe to call even if no locks held.
    """
    for lp in list(_held_locks):
        _remove_sentinel(lp)


# ---------------------------------------------------------------------------
# Stand-alone smoke test (python file_lock.py)
# ---------------------------------------------------------------------------
def _smoke_test() -> int:
    import tempfile, os
    tgt = Path(tempfile.mktemp(suffix=".md"))
    tgt.touch()
    try:
        print(f"Smoke test -- protecting {tgt.name}")
        with acquire_file_lock(tgt, writer="smoke-test", timeout=5):
            lp = lock_path_for(tgt)
            assert lp.exists(), "sentinel not created inside context"
            print(f"  Lock created: {lp}")
            content = lp.read_text(encoding="utf-8")
            assert "writer=smoke-test" in content, "sentinel missing writer"
        assert not lp.exists(), "sentinel not removed after context"
        print("  Lock removed after context exit. PASS.")
        return 0
    except AssertionError as exc:
        print(f"  FAIL: {exc}")
        return 1
    finally:
        tgt.unlink(missing_ok=True)
        lock_path_for(tgt).unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(_smoke_test())
