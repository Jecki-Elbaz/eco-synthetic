"""Audit-log hook for the model router (Phase A).

Appends one structured JSONL record per task invocation to the configured
log file.  Required fields per design doc section 1.2:
    model, task_id, tokens, cost, latency, outcome.

The log is append-only: each write opens the file in "a" mode and never
truncates.  Parent directories are created automatically on first write.

Default log path: ``projects/model-router/audit/model-router-audit.jsonl``
(relative to the repo root).  Pass ``audit_log`` to override the path when
calling from the runner or a test.

Usage example::

    from model_router.audit import record_audit

    record_audit(
        "T-0004",
        "claude-sonnet-4-6",
        tokens=1200,
        cost_usd=0.0,
        latency_ms=3400,
        outcome="done",
    )

Each record is a single-line JSON object, newline-terminated, suitable for
streaming-log tools and for the ``jsonl`` queries Dalia runs in quality checks.

Spec: company/model-router-design.md section 1.2.
Envelope: company/r-and-d/model-router-phase-a-envelope-ido-2026-07-25.md.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Default audit log path.
# Layout: projects/model-router/model_router/audit.py
#   parent     -> model_router/
#   parent x2  -> projects/model-router/
_MODULE_DIR: Path = Path(__file__).resolve().parent.parent
DEFAULT_AUDIT_LOG: Path = _MODULE_DIR / "audit" / "model-router-audit.jsonl"


def record_audit(
    task_id: str,
    model: str,
    *,
    tokens: Optional[int] = None,
    cost_usd: Optional[float] = None,
    latency_ms: Optional[int] = None,
    outcome: Optional[str] = None,
    audit_log: Optional[Path] = None,
) -> None:
    """Append one structured audit record to the JSONL log file.

    The file is created (including parent directories) on first write.
    Subsequent calls append; the file is never truncated.

    Args:
        task_id: Task identifier (e.g., "T-0004" or a runner job key such as
            "Eco:2h Check-in (every 2h)").
        model: Model identifier selected by the router (e.g.,
            "claude-sonnet-4-6").
        tokens: Total token count for the invocation, if known.  ``None``
            when the caller has not captured token usage.
        cost_usd: Cost in USD.  Always 0.0 in Phase A because Claude is the
            only model and is already in use -- no new provider spend is
            introduced.  Defaults to ``0.0`` when ``None`` is passed.
        latency_ms: Wall-clock latency in milliseconds from dispatch to
            subprocess exit.  ``None`` when not measured.
        outcome: Terminal outcome string ("done", "error", "blocked",
            "timeout", etc.).  ``None`` when the caller has not yet resolved
            the outcome.
        audit_log: Path to the JSONL log file.  Defaults to
            ``DEFAULT_AUDIT_LOG`` (``projects/model-router/audit/
            model-router-audit.jsonl``).

    Raises:
        OSError: If the log file cannot be written (permissions, disk full,
            etc.).  The caller may choose to suppress this if audit loss is
            acceptable versus crashing the runner.
    """
    log_path = audit_log or DEFAULT_AUDIT_LOG
    record: dict = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "task_id": task_id,
        "model": model,
        "tokens": tokens,
        "cost_usd": cost_usd if cost_usd is not None else 0.0,
        "latency_ms": latency_ms,
        "outcome": outcome,
    }
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
