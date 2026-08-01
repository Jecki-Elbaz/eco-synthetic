"""Tests for model_router.router (Phase A).

Covers: role-file model reading, select_model fallback paths,
Phase A Claude guarantee, Phase B hook contract, and TaskContext fields.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Ensure the package root is on sys.path when pytest is invoked from any cwd.
_PKG_ROOT = Path(__file__).resolve().parent.parent
if str(_PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(_PKG_ROOT))

from model_router.router import (
    DEFAULT_CLAUDE_MODEL,
    TaskContext,
    _read_role_model,
    select_model,
)

# ---------------------------------------------------------------------------
# Fixtures / helpers
# ---------------------------------------------------------------------------

_ROLE_WITH_MODEL = """\
---
name: TestAgent
model: claude-test-1-0
---

You are TestAgent.
"""

_ROLE_WITHOUT_MODEL = """\
---
name: TestAgent
---

You are TestAgent without a model line.
"""


# ---------------------------------------------------------------------------
# _read_role_model
# ---------------------------------------------------------------------------


class TestReadRoleModel:
    """Unit tests for the private role-file model reader."""

    def test_reads_model_from_frontmatter(self, tmp_path: Path) -> None:
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITH_MODEL, encoding="utf-8")
        result = _read_role_model("TestAgent", tmp_path)
        assert result == "claude-test-1-0"

    def test_returns_none_when_no_model_line(self, tmp_path: Path) -> None:
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITHOUT_MODEL, encoding="utf-8")
        result = _read_role_model("TestAgent", tmp_path)
        assert result is None

    def test_returns_none_when_file_missing(self, tmp_path: Path) -> None:
        result = _read_role_model("NonExistent", tmp_path)
        assert result is None

    def test_model_line_mid_file(self, tmp_path: Path) -> None:
        """model: appearing in the body (not just frontmatter) should still match."""
        role = "name: Ido\n\nYou are Ido.\nmodel: claude-sonnet-4-6\n"
        (tmp_path / "Ido.md").write_text(role, encoding="utf-8")
        result = _read_role_model("Ido", tmp_path)
        assert result == "claude-sonnet-4-6"

    def test_model_with_dots_and_dashes(self, tmp_path: Path) -> None:
        role = "---\nmodel: claude-haiku-4-5-20251001\n---\n"
        (tmp_path / "Assaf.md").write_text(role, encoding="utf-8")
        result = _read_role_model("Assaf", tmp_path)
        assert result == "claude-haiku-4-5-20251001"


# ---------------------------------------------------------------------------
# select_model
# ---------------------------------------------------------------------------


class TestSelectModel:
    """Unit tests for the public select_model function."""

    def test_returns_model_from_role_file(self, tmp_path: Path) -> None:
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITH_MODEL, encoding="utf-8")
        ctx = TaskContext(task_id="T-0001", agent="TestAgent")
        result = select_model(ctx, agents_dir=tmp_path)
        assert result == "claude-test-1-0"

    def test_falls_back_to_default_when_file_missing(self, tmp_path: Path) -> None:
        ctx = TaskContext(task_id="T-0001", agent="NoAgent")
        result = select_model(ctx, agents_dir=tmp_path)
        assert result == DEFAULT_CLAUDE_MODEL

    def test_falls_back_to_default_when_no_model_line(self, tmp_path: Path) -> None:
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITHOUT_MODEL, encoding="utf-8")
        ctx = TaskContext(task_id="T-0001", agent="TestAgent")
        result = select_model(ctx, agents_dir=tmp_path)
        assert result == DEFAULT_CLAUDE_MODEL

    def test_phase_a_always_returns_claude(self, tmp_path: Path) -> None:
        """Phase A guarantee: any returned model must start with 'claude'."""
        (tmp_path / "Eco.md").write_text(
            "---\nname: Eco\nmodel: claude-opus-4-8\n---\nYou are Eco.\n",
            encoding="utf-8",
        )
        ctx = TaskContext(task_id="T-0002", agent="Eco")
        result = select_model(ctx, agents_dir=tmp_path)
        assert result.startswith("claude"), (
            f"Phase A must always return a Claude model; got: {result!r}"
        )

    def test_default_model_starts_with_claude(self) -> None:
        assert DEFAULT_CLAUDE_MODEL.startswith("claude")

    def test_phase_b_hook_is_called_when_provided(self, tmp_path: Path) -> None:
        """When a Phase B selector is wired in it overrides the Claude result."""
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITH_MODEL, encoding="utf-8")
        ctx = TaskContext(task_id="T-0003", agent="TestAgent")

        def _fake_phase_b(ctx: TaskContext, claude_model: str) -> str:
            return "local-llama-stub"

        result = select_model(
            ctx, agents_dir=tmp_path, _phase_b_selector=_fake_phase_b
        )
        assert result == "local-llama-stub"

    def test_phase_b_hook_receives_claude_model(self, tmp_path: Path) -> None:
        """The Phase B hook receives the resolved claude_model so it can inspect it."""
        (tmp_path / "TestAgent.md").write_text(_ROLE_WITH_MODEL, encoding="utf-8")
        ctx = TaskContext(task_id="T-0003", agent="TestAgent")
        received: list[str] = []

        def _capturing_hook(ctx: TaskContext, claude_model: str) -> str:
            received.append(claude_model)
            return claude_model  # pass-through

        select_model(ctx, agents_dir=tmp_path, _phase_b_selector=_capturing_hook)
        assert received == ["claude-test-1-0"]

    def test_no_phase_b_hook_by_default(self, tmp_path: Path) -> None:
        """Calling select_model without _phase_b_selector must not raise."""
        ctx = TaskContext(task_id="T-0004", agent="Ghost")
        result = select_model(ctx, agents_dir=tmp_path)
        assert isinstance(result, str)


# ---------------------------------------------------------------------------
# TaskContext
# ---------------------------------------------------------------------------


class TestTaskContext:
    """TaskContext field validation."""

    def test_required_fields(self) -> None:
        ctx = TaskContext(task_id="T-0004", agent="Gal")
        assert ctx.task_id == "T-0004"
        assert ctx.agent == "Gal"

    def test_optional_fields_default_none(self) -> None:
        ctx = TaskContext(task_id="T-0005", agent="Ido")
        assert ctx.tokens is None
        assert ctx.cost_usd is None
        assert ctx.latency_ms is None
        assert ctx.outcome is None

    def test_all_fields_populated(self) -> None:
        ctx = TaskContext(
            task_id="T-0006",
            agent="Gal",
            tokens=500,
            cost_usd=0.0,
            latency_ms=1200,
            outcome="done",
        )
        assert ctx.tokens == 500
        assert ctx.cost_usd == 0.0
        assert ctx.latency_ms == 1200
        assert ctx.outcome == "done"

    def test_context_is_mutable(self) -> None:
        """The runner sets output fields after the subprocess exits."""
        ctx = TaskContext(task_id="T-0007", agent="Eco")
        ctx.tokens = 800
        ctx.outcome = "done"
        assert ctx.tokens == 800
        assert ctx.outcome == "done"
