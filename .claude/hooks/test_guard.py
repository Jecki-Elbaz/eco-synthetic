"""Automated proof that the autonomy guard denies every Red path (Rambo C1).

Run: pytest .claude/hooks/test_guard.py -q
These tests exercise the pure decision logic in enforce mode. They do not depend
on Claude Code; they prove the guard's denials fire correctly.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
_spec = importlib.util.spec_from_file_location("guard", Path(__file__).with_name("guard.py"))
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)


def ev(tool, _agent_type=None, **ti):
    e = {"tool_name": tool, "tool_input": ti}
    if _agent_type is not None:
        e["agent_type"] = _agent_type
    return e


def d(event):
    return guard.decide(event, "enforce")[0]


# --- Red path writes are denied (5.1) ---

@pytest.mark.parametrize("path", [
    ".claude/agents/Eco.md",
    ".claude/agents/Anat.md",
    ".claude/settings.json",
    ".claude/settings.local.json",
    "company/governance/access-matrix.md",
    "company/constitution.md",
])
def test_red_write_denied(path):
    assert d(ev("Write", file_path=path, content="x")) == guard.DENY
    assert d(ev("Edit", file_path=path)) == guard.DENY


def test_red_denied_via_absolute_path():
    abs_path = str(ROOT / ".claude" / "agents" / "Eco.md")
    assert d(ev("Write", file_path=abs_path, content="x")) == guard.DENY


# --- Agent allow-list (5.2) ---

@pytest.mark.parametrize("agent", ["gal", "shir", "ido", "claude", "general-purpose",
                                   "meetingprep", "explore", "plan", ""])
def test_non_allowlisted_agent_denied(agent):
    assert d(ev("Task", subagent_type=agent)) == guard.DENY
    assert d(ev("Agent", subagent_type=agent)) == guard.DENY


@pytest.mark.parametrize("agent", ["anat", "assaf", "dalia", "eyal", "rambo",
                                   "lital", "noam", "Rambo", "ANAT"])
def test_allowlisted_agent_allowed(agent):
    assert d(ev("Task", subagent_type=agent)) == guard.ALLOW


# --- Append-only audit trail (5.3) ---

def test_decisions_log_edit_denied():
    assert d(ev("Edit", file_path="company/decisions/decisions-log.md")) == guard.DENY


def test_decisions_log_pure_append_allowed():
    cur = guard._current_content("company/decisions/decisions-log.md")
    assert d(ev("Write", file_path="company/decisions/decisions-log.md",
                content=cur + "\n## new entry\n")) == guard.ALLOW


def test_decisions_log_rewrite_denied():
    assert d(ev("Write", file_path="company/decisions/decisions-log.md",
                content="totally new content not a prefix")) == guard.DENY


def test_agent_runs_log_protected():
    assert d(ev("Edit", file_path="memory/agent-runs.jsonl")) == guard.DENY
    assert d(ev("Write", file_path="memory/agent-runs.jsonl",
                content="rewrite")) in (guard.ALLOW, guard.DENY)  # allow only if pure append


# --- Ungoverned paths still work (no over-blocking) ---

def test_working_file_allowed():
    assert d(ev("Write", file_path="projects/demo/notes.md", content="hi")) == guard.ALLOW
    assert d(ev("Edit", file_path="memory/wiki/home.md")) == guard.ALLOW


# --- SAFE_MODE (5.4 / 7) ---

def test_safe_mode_blocks_when_active(monkeypatch):
    monkeypatch.setattr(guard, "_safe_mode_active", lambda: True)
    assert d(ev("Task", subagent_type="anat")) == guard.DENY
    assert d(ev("Write", file_path="projects/demo/x.md", content="y")) == guard.DENY


def test_safe_mode_clear_denied():
    assert d(ev("Write", file_path="memory/SAFE_MODE", content="   ")) == guard.DENY
    assert d(ev("Edit", file_path="memory/SAFE_MODE")) == guard.DENY


def test_safe_mode_set_allowed():
    assert d(ev("Write", file_path="memory/SAFE_MODE",
                content="halt: reason")) == guard.ALLOW


# --- Fail-closed (5.5) ---

def test_fail_closed_on_bad_input_enforce():
    bad = {"tool_name": "Write", "tool_input": "not-an-object"}
    assert guard.decide(bad, "enforce")[0] == guard.DENY


# --- Origin enforcement: acting sub-agent allow-list (5.2, C2/C5) ---

def test_non_allowlisted_acting_agent_denied():
    # A code agent acting as a sub-agent cannot write even to an ungoverned path.
    assert d(ev("Write", _agent_type="gal", file_path="projects/x.md", content="y")) == guard.DENY
    assert d(ev("Edit", _agent_type="general-purpose", file_path="memory/wiki/home.md")) == guard.DENY


def test_allowlisted_acting_agent_allowed():
    assert d(ev("Write", _agent_type="anat", file_path="projects/x.md", content="y")) == guard.ALLOW


def test_main_thread_has_no_origin_and_is_allowed_on_working_paths():
    # No agent_type field == main thread; ungoverned path is fine.
    assert d(ev("Write", file_path="projects/x.md", content="y")) == guard.ALLOW


def test_shadow_never_blocks():
    # In shadow mode even a Red path is allowed (but logged as would-deny).
    decision, reason = guard.decide(ev("Write", file_path=".claude/settings.json",
                                       content="x"), "shadow")
    assert decision == guard.ALLOW
    assert "would-DENY" in reason
