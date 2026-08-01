"""Model router -- Phase A (Claude-only selection skeleton).

Phase A behaviour: always returns the Claude model configured in the agent's
role-file frontmatter (``model:`` field), falling back to DEFAULT_CLAUDE_MODEL
when the role file is absent or carries no parseable model line.

Phase B extension point: pass a callable as ``_phase_b_selector``. It receives
``(ctx: TaskContext, claude_model: str) -> str`` and may return an alternate
model (e.g., a local open-weight model). In Phase A callers MUST NOT pass
this argument -- it is reserved for Phase B wiring only and will not be
called when ``None`` (the default).

Usage example (Phase A)::

    from model_router.router import TaskContext, select_model

    ctx = TaskContext(task_id="T-0004", agent="Gal")
    model = select_model(ctx)          # -> "claude-sonnet-4-6"

Integration: the runner imports ``select_model`` and ``TaskContext``, builds a
context at dispatch time, calls ``select_model(ctx, agents_dir=AGENTS_DIR)``,
and passes the returned string to the ``--model`` CLI flag.  After the
subprocess exits, the caller populates ``ctx`` output fields (tokens, cost_usd,
latency_ms, outcome) and calls ``record_audit``.

Spec: company/model-router-design.md (FINAL 2026-06-10).
Envelope: company/r-and-d/model-router-phase-a-envelope-ido-2026-07-25.md.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

# Default model returned when a role file cannot be read or has no model line.
# Kept in sync with runner.py DEFAULT_MODEL (both are the active Sonnet tier).
DEFAULT_CLAUDE_MODEL: str = "claude-sonnet-4-6"

# Canonical agents directory under the repo root.  Resolved at import time so
# the module works without the caller passing agents_dir on every call.
# Layout: projects/model-router/model_router/router.py
#   parent     -> model_router/
#   parent x2  -> projects/model-router/
#   parent x3  -> projects/
#   parent x4  -> <repo root>
_REPO_ROOT: Path = Path(__file__).resolve().parent.parent.parent.parent
AGENTS_DIR: Path = _REPO_ROOT / ".claude" / "agents"


@dataclass
class TaskContext:
    """Per-invocation context passed to the router and the audit hook.

    The caller populates ``task_id`` and ``agent`` before calling
    ``select_model``.  After the task subprocess exits, the caller
    populates the output fields (``tokens``, ``cost_usd``, ``latency_ms``,
    ``outcome``) and then calls ``record_audit``.

    Attributes:
        task_id: Task identifier (e.g., "T-0004" or a runner job key).
        agent: Agent name matching the role-file basename under
            ``.claude/agents/`` (e.g., "Gal" for "Gal.md").
        tokens: Total token count populated after the task runs.
        cost_usd: Cost in USD populated after the task runs.  Always 0.0
            in Phase A because Claude is the only model and is already
            in use -- no new provider spend is introduced.
        latency_ms: Wall-clock latency in milliseconds populated after
            the task runs.
        outcome: Terminal outcome string populated after the task runs.
            Typical values: "done", "error", "blocked", "timeout".
    """

    task_id: str
    agent: str
    tokens: Optional[int] = field(default=None)
    cost_usd: Optional[float] = field(default=None)
    latency_ms: Optional[int] = field(default=None)
    outcome: Optional[str] = field(default=None)


def _read_role_model(agent: str, agents_dir: Path) -> Optional[str]:
    """Read the ``model:`` value from a role-file's YAML frontmatter.

    Args:
        agent: Agent name (e.g., "Gal").  The role file is looked up at
            ``agents_dir / f"{agent}.md"``.
        agents_dir: Directory that holds the agent role files.

    Returns:
        The model identifier string, or ``None`` when the file is absent,
        unreadable, or carries no ``model:`` line.
    """
    try:
        txt = (agents_dir / f"{agent}.md").read_text(encoding="utf-8")
        m = re.search(r"(?mi)^model:\s*([A-Za-z0-9._-]+)", txt)
        return m.group(1) if m else None
    except OSError:
        return None


def select_model(
    ctx: TaskContext,
    *,
    agents_dir: Optional[Path] = None,
    _phase_b_selector: Optional[Callable[[TaskContext, str], str]] = None,
) -> str:
    """Select a model for the given task context.

    Phase A always returns a Claude model identifier sourced from the agent's
    role-file frontmatter, with ``DEFAULT_CLAUDE_MODEL`` as the fallback.

    Args:
        ctx: Per-invocation context containing at minimum ``agent`` and
            ``task_id``.
        agents_dir: Directory containing agent role files.  Defaults to the
            canonical ``.claude/agents/`` path under the repo root.
        _phase_b_selector: RESERVED -- do not pass in Phase A.  In Phase B,
            a callable ``(ctx, claude_model) -> str`` that may return an
            alternate model (e.g., a local open-weight model).  When ``None``
            (the default), this function always returns Claude.

    Returns:
        A model identifier string (e.g., "claude-sonnet-4-6").  In Phase A
        this always begins with "claude".
    """
    resolved_dir = agents_dir or AGENTS_DIR
    claude_model = _read_role_model(ctx.agent, resolved_dir) or DEFAULT_CLAUDE_MODEL

    # Phase B hook: called only when explicitly wired in (never in Phase A).
    if _phase_b_selector is not None:
        return _phase_b_selector(ctx, claude_model)

    return claude_model
