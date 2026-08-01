"""Integration test: router + audit together (Phase A).

Simulates the full runner dispatch flow -- select model, populate output
fields, write audit record -- using in-memory fixtures instead of the real
agents directory and audit log path.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

_PKG_ROOT = Path(__file__).resolve().parent.parent
if str(_PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(_PKG_ROOT))

from model_router import TaskContext, record_audit, select_model

_ROLE_IDO = "---\nname: Ido\nmodel: claude-sonnet-4-6\n---\nYou are Ido.\n"
_ROLE_ECO = "---\nname: Eco\nmodel: claude-opus-4-8\n---\nYou are Eco.\n"
_ROLE_ASSAF = (
    "---\nname: Assaf\nmodel: claude-haiku-4-5-20251001\n---\nYou are Assaf.\n"
)


class TestFullDispatchFlow:
    """Simulates runner dispatch: select, (fake) run, audit record."""

    def test_select_and_audit_for_sonnet_agent(self, tmp_path: Path) -> None:
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        (agents_dir / "Ido.md").write_text(_ROLE_IDO, encoding="utf-8")
        audit_log = tmp_path / "audit" / "router.jsonl"

        ctx = TaskContext(task_id="T-INTEG-01", agent="Ido")
        model = select_model(ctx, agents_dir=agents_dir)

        # Simulate runner populating ctx after subprocess exits.
        ctx.tokens = 800
        ctx.cost_usd = 0.0
        ctx.latency_ms = 1500
        ctx.outcome = "done"

        record_audit(
            ctx.task_id,
            model,
            tokens=ctx.tokens,
            cost_usd=ctx.cost_usd,
            latency_ms=ctx.latency_ms,
            outcome=ctx.outcome,
            audit_log=audit_log,
        )

        assert model == "claude-sonnet-4-6"
        data = json.loads(audit_log.read_text(encoding="utf-8").strip())
        assert data["model"] == "claude-sonnet-4-6"
        assert data["task_id"] == "T-INTEG-01"
        assert data["outcome"] == "done"
        assert data["cost_usd"] == 0.0
        assert data["tokens"] == 800
        assert data["latency_ms"] == 1500

    def test_select_and_audit_for_opus_agent(self, tmp_path: Path) -> None:
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        (agents_dir / "Eco.md").write_text(_ROLE_ECO, encoding="utf-8")
        audit_log = tmp_path / "audit" / "router.jsonl"

        ctx = TaskContext(task_id="T-INTEG-02", agent="Eco")
        model = select_model(ctx, agents_dir=agents_dir)

        # Phase A: even Opus agents return a Claude model.
        assert model.startswith("claude")

        ctx.tokens = 2000
        ctx.cost_usd = 0.0
        ctx.latency_ms = 5000
        ctx.outcome = "done"

        record_audit(
            ctx.task_id,
            model,
            tokens=ctx.tokens,
            cost_usd=ctx.cost_usd,
            latency_ms=ctx.latency_ms,
            outcome=ctx.outcome,
            audit_log=audit_log,
        )

        data = json.loads(audit_log.read_text(encoding="utf-8").strip())
        assert data["model"] == "claude-opus-4-8"
        assert data["task_id"] == "T-INTEG-02"

    def test_select_and_audit_for_haiku_agent(self, tmp_path: Path) -> None:
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        (agents_dir / "Assaf.md").write_text(_ROLE_ASSAF, encoding="utf-8")
        audit_log = tmp_path / "audit" / "router.jsonl"

        ctx = TaskContext(task_id="T-INTEG-03", agent="Assaf")
        model = select_model(ctx, agents_dir=agents_dir)

        assert model == "claude-haiku-4-5-20251001"

        ctx.tokens = 150
        ctx.cost_usd = 0.0
        ctx.latency_ms = 400
        ctx.outcome = "done"

        record_audit(
            ctx.task_id,
            model,
            tokens=ctx.tokens,
            cost_usd=ctx.cost_usd,
            latency_ms=ctx.latency_ms,
            outcome=ctx.outcome,
            audit_log=audit_log,
        )

        data = json.loads(audit_log.read_text(encoding="utf-8").strip())
        assert data["model"] == "claude-haiku-4-5-20251001"

    def test_missing_agent_fallback_is_audited(self, tmp_path: Path) -> None:
        """When an agent file is missing, DEFAULT_CLAUDE_MODEL is audited."""
        from model_router.router import DEFAULT_CLAUDE_MODEL

        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        audit_log = tmp_path / "audit" / "router.jsonl"

        ctx = TaskContext(task_id="T-INTEG-04", agent="Ghost")
        model = select_model(ctx, agents_dir=agents_dir)

        assert model == DEFAULT_CLAUDE_MODEL

        ctx.tokens = 0
        ctx.cost_usd = 0.0
        ctx.latency_ms = 100
        ctx.outcome = "error"

        record_audit(
            ctx.task_id,
            model,
            tokens=ctx.tokens,
            cost_usd=ctx.cost_usd,
            latency_ms=ctx.latency_ms,
            outcome=ctx.outcome,
            audit_log=audit_log,
        )

        data = json.loads(audit_log.read_text(encoding="utf-8").strip())
        assert data["model"] == DEFAULT_CLAUDE_MODEL
        assert data["outcome"] == "error"

    def test_multiple_dispatches_accumulate_in_log(self, tmp_path: Path) -> None:
        """A full cycle with multiple agents produces one record per dispatch."""
        agents_dir = tmp_path / "agents"
        agents_dir.mkdir()
        (agents_dir / "Ido.md").write_text(_ROLE_IDO, encoding="utf-8")
        (agents_dir / "Eco.md").write_text(_ROLE_ECO, encoding="utf-8")
        audit_log = tmp_path / "audit" / "router.jsonl"

        for agent_name, task_id, outcome in [
            ("Ido", "T-CYCLE-01", "done"),
            ("Eco", "T-CYCLE-02", "done"),
        ]:
            ctx = TaskContext(task_id=task_id, agent=agent_name)
            model = select_model(ctx, agents_dir=agents_dir)
            ctx.tokens = 500
            ctx.cost_usd = 0.0
            ctx.latency_ms = 1000
            ctx.outcome = outcome
            record_audit(
                ctx.task_id,
                model,
                tokens=ctx.tokens,
                cost_usd=ctx.cost_usd,
                latency_ms=ctx.latency_ms,
                outcome=ctx.outcome,
                audit_log=audit_log,
            )

        lines = [ln for ln in audit_log.read_text(encoding="utf-8").splitlines() if ln.strip()]
        assert len(lines) == 2
        records = [json.loads(ln) for ln in lines]
        assert records[0]["task_id"] == "T-CYCLE-01"
        assert records[1]["task_id"] == "T-CYCLE-02"

    def test_public_api_imports_from_package_root(self) -> None:
        """The package __init__ re-exports all public symbols."""
        import model_router

        assert hasattr(model_router, "TaskContext")
        assert hasattr(model_router, "select_model")
        assert hasattr(model_router, "record_audit")
        assert hasattr(model_router, "DEFAULT_CLAUDE_MODEL")
        assert hasattr(model_router, "DEFAULT_AUDIT_LOG")
