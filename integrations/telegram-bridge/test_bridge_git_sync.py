"""Tests for the bridge sequencer pre-flight added in ae3a6bb.

Run: pytest integrations/telegram-bridge/test_bridge_git_sync.py -q

Why this matters: commit_and_push() runs `git commit -m <auto msg>`. Before the
pre-flight, firing while a merge was half finished would have silently FINALIZED that
unrelated merge under the bridge's own auto message. These tests pin the guard shut.

Every git call is stubbed -- no test here touches a real repository, and REPO_ROOT is
redirected to a temp dir before import so the module's path constants stay inert.
"""
from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
import tempfile
import types
from pathlib import Path

import pytest

# REPO_ROOT is read from the environment at import time, so redirect it first.
_TMP_ROOT = tempfile.mkdtemp(prefix="bridge-git-sync-test-")
os.environ["GIT_SYNC_REPO_ROOT"] = _TMP_ROOT


def _stub_watchdog_if_missing():
    """Let these tests run without the watchdog daemon dependency installed.

    bridge-git-sync.py imports watchdog in a try/except but then uses
    FileSystemEventHandler as an unconditional base class at module level, so a missing
    watchdog is an import-time NameError, not a graceful degrade. The sync logic under
    test does not touch watchdog at all, so stub just enough to let the module load.
    """
    try:
        import watchdog.events  # noqa: F401
        import watchdog.observers  # noqa: F401
        return False
    except ImportError:
        pass
    pkg = types.ModuleType("watchdog")
    pkg.__path__ = []
    events = types.ModuleType("watchdog.events")
    events.FileSystemEventHandler = type("FileSystemEventHandler", (), {})
    observers = types.ModuleType("watchdog.observers")
    observers.Observer = type("Observer", (), {})
    sys.modules.update({
        "watchdog": pkg,
        "watchdog.events": events,
        "watchdog.observers": observers,
    })
    return True


WATCHDOG_STUBBED = _stub_watchdog_if_missing()

_spec = importlib.util.spec_from_file_location(
    "bridge_git_sync", Path(__file__).with_name("bridge-git-sync.py")
)
bgs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bgs)


def cp(returncode=0, stdout=""):
    return subprocess.CompletedProcess(args=["git"], returncode=returncode, stdout=stdout)


def fake_git(monkeypatch, *, present=(), git_path=None):
    """Stub bgs.git. `present` names refs that verify; git_path is the --git-path reply."""
    calls = []

    def fake(*args, **kwargs):
        calls.append(args)
        if args[:3] == ("rev-parse", "--verify", "--quiet"):
            ref = args[3]
            if ref in present:
                return cp(0, "1111111111111111111111111111111111111111\n")
            return cp(1, "")
        if args[:2] == ("rev-parse", "--git-path"):
            return cp(0, git_path) if git_path else cp(0, "")
        return cp(0, "")

    monkeypatch.setattr(bgs, "git", fake)
    return calls


# --- pending_sequencer_state() ---

def test_clean_repo_returns_none(monkeypatch):
    fake_git(monkeypatch)
    assert bgs.pending_sequencer_state() is None


@pytest.mark.parametrize("ref,label", [
    ("MERGE_HEAD", "merge"),
    ("CHERRY_PICK_HEAD", "cherry-pick"),
    ("REVERT_HEAD", "revert"),
])
def test_each_sequencer_ref_is_detected(monkeypatch, ref, label):
    fake_git(monkeypatch, present=(ref,))
    assert bgs.pending_sequencer_state() == label


def test_merge_head_is_the_state_we_actually_hit(monkeypatch):
    """The c02bbcd incident state: MERGE_HEAD present, everything else clean."""
    fake_git(monkeypatch, present=("MERGE_HEAD",))
    assert bgs.pending_sequencer_state() == "merge"


def test_empty_stdout_with_zero_exit_is_not_a_pending_state(monkeypatch):
    """rev-parse --quiet can exit 0 with no output; that must not read as pending."""
    monkeypatch.setattr(bgs, "git", lambda *a, **k: cp(0, "   \n"))
    assert bgs.pending_sequencer_state() is None


@pytest.mark.parametrize("statedir", ["rebase-merge", "rebase-apply"])
def test_rebase_state_directory_is_detected(monkeypatch, statedir):
    """A rebase leaves no ref, only a directory, so it needs the --git-path branch."""
    rel = os.path.join(".git", statedir)
    os.makedirs(os.path.join(_TMP_ROOT, rel), exist_ok=True)
    try:
        fake_git(monkeypatch, git_path=rel)
        assert bgs.pending_sequencer_state() == "rebase"
    finally:
        os.rmdir(os.path.join(_TMP_ROOT, rel))


def test_git_path_reply_without_a_real_directory_is_clean(monkeypatch):
    """git always answers --git-path; only an existing directory means a live rebase."""
    fake_git(monkeypatch, git_path=os.path.join(".git", "rebase-merge"))
    assert bgs.pending_sequencer_state() is None


def test_refs_are_checked_before_rebase_directories(monkeypatch):
    calls = fake_git(monkeypatch, present=("MERGE_HEAD",))
    bgs.pending_sequencer_state()
    assert calls[0][:4] == ("rev-parse", "--verify", "--quiet", "MERGE_HEAD")
    # Short-circuits: no --git-path probing once a ref has matched.
    assert not any(c[:2] == ("rev-parse", "--git-path") for c in calls)


# --- commit_and_push() pre-flight ---

@pytest.fixture
def spy(monkeypatch):
    """Capture the side-effect writes and explode if any git mutation is attempted."""
    seen = {"audit": [], "board": [], "reached_pull": False}

    monkeypatch.setattr(bgs, "append_audit_log", lambda line: seen["audit"].append(line))
    monkeypatch.setattr(bgs, "append_board_blocked", lambda r: seen["board"].append(r))

    def boom_stage():
        raise AssertionError("safe_stage() must not run while a sequencer op is pending")

    def boom_pull():
        seen["reached_pull"] = True
        return False

    monkeypatch.setattr(bgs, "safe_stage", boom_stage)
    monkeypatch.setattr(bgs, "pull_data_plane_only", boom_pull)
    monkeypatch.setattr(bgs, "git", lambda *a, **k: (_ for _ in ()).throw(
        AssertionError(f"no git call expected during a blocked cycle: {a}")))
    return seen


def test_commit_and_push_refuses_mid_merge(monkeypatch, spy):
    monkeypatch.setattr(bgs, "pending_sequencer_state", lambda: "merge")
    assert bgs.commit_and_push() is False
    assert spy["reached_pull"] is False  # pull is skipped too, not just the commit


def test_blocked_cycle_leaves_an_audit_trail(monkeypatch, spy):
    monkeypatch.setattr(bgs, "pending_sequencer_state", lambda: "merge")
    bgs.commit_and_push()
    assert len(spy["audit"]) == 1
    line = spy["audit"][0]
    assert "ACTION=BLOCKED" in line
    assert "REASON=SEQUENCER-IN-PROGRESS" in line
    assert "STATE=merge" in line


def test_blocked_cycle_signals_the_owner_on_the_board(monkeypatch, spy):
    monkeypatch.setattr(bgs, "pending_sequencer_state", lambda: "rebase")
    bgs.commit_and_push()
    assert len(spy["board"]) == 1
    assert "rebase" in spy["board"][0]


@pytest.mark.parametrize("label", ["merge", "cherry-pick", "revert", "rebase"])
def test_every_pending_state_blocks(monkeypatch, spy, label):
    monkeypatch.setattr(bgs, "pending_sequencer_state", lambda: label)
    assert bgs.commit_and_push() is False
    assert f"STATE={label}" in spy["audit"][0]


def test_clean_repo_still_proceeds_to_pull(monkeypatch, spy):
    """The guard must not become a blanket stop: a clean repo reaches the normal path."""
    monkeypatch.setattr(bgs, "pending_sequencer_state", lambda: None)
    assert bgs.commit_and_push() is False  # our stub pull returns False
    assert spy["reached_pull"] is True
    assert spy["audit"] == [] and spy["board"] == []


def test_preflight_runs_before_pull(monkeypatch):
    """Ordering guard: the pre-flight must gate the pull, not follow it."""
    order = []
    monkeypatch.setattr(bgs, "pending_sequencer_state",
                        lambda: (order.append("preflight"), "merge")[1])
    monkeypatch.setattr(bgs, "pull_data_plane_only",
                        lambda: (order.append("pull"), False)[1])
    monkeypatch.setattr(bgs, "append_audit_log", lambda line: None)
    monkeypatch.setattr(bgs, "append_board_blocked", lambda r: None)
    bgs.commit_and_push()
    assert order == ["preflight"]


def test_env_redirect_kept_repo_root_out_of_the_real_repo():
    """Guard against these tests ever pointing at the live checkout."""
    assert bgs.REPO_ROOT == _TMP_ROOT
    assert "eco-synthetic" not in str(Path(bgs.LOG_PATH).parents[1].name)
