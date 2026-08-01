"""model_router -- Phase A skeleton (Claude-only model selection + audit log).

Public surface::

    from model_router import TaskContext, select_model, record_audit

Phase A: ``select_model`` always returns a Claude model identifier sourced
from the agent's role-file frontmatter, with ``DEFAULT_CLAUDE_MODEL`` as the
fallback.  ``record_audit`` appends one JSONL record per invocation to the
audit log.

Phase B extension: pass ``_phase_b_selector`` to ``select_model`` (see
``router.py`` docstring).  The rest of the public API is unchanged.
"""
from .audit import DEFAULT_AUDIT_LOG, record_audit
from .router import DEFAULT_CLAUDE_MODEL, TaskContext, select_model

__all__ = [
    "TaskContext",
    "select_model",
    "record_audit",
    "DEFAULT_CLAUDE_MODEL",
    "DEFAULT_AUDIT_LOG",
]
