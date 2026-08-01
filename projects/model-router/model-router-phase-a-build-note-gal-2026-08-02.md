# Model Router Phase A -- Build Note
Gal (Lead Dev) | 2026-08-02 | T-0004

---

## What was built

Three-file Python package at `projects/model-router/model_router/`:

- `router.py` -- `TaskContext` dataclass + `select_model()` function. Reads
  the agent's role-file `model:` frontmatter (same logic as runner.py
  `agent_model()`), falls back to `DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6"`.
  Phase A always returns a Claude model.

- `audit.py` -- `record_audit()` function. Appends one JSONL record per call
  to the audit log. All six design-doc fields present in every record:
  `ts`, `task_id`, `model`, `tokens`, `cost_usd`, `latency_ms`, `outcome`.
  Append-only (opens in "a" mode, never truncates). Creates parent directories
  on first write.

- `__init__.py` -- re-exports the public surface: `TaskContext`, `select_model`,
  `record_audit`, `DEFAULT_CLAUDE_MODEL`, `DEFAULT_AUDIT_LOG`.

Test suite at `projects/model-router/tests/` (39 tests, 39 passed):
- `test_router.py` -- unit tests for `_read_role_model`, `select_model`,
  `TaskContext`.
- `test_audit.py` -- unit tests for `record_audit` and `DEFAULT_AUDIT_LOG`.
- `test_integration.py` -- end-to-end dispatch flow (Sonnet, Opus, Haiku
  agents, missing-agent fallback, multi-agent cycle, public API imports).

Default audit log path: `projects/model-router/audit/model-router-audit.jsonl`
(configurable -- pass `audit_log=<Path>` to `record_audit`).

---

## How this maps to each done criterion

**Criterion 1 -- router.py callable from runner dispatch; returns model identifier.**

`select_model(ctx, agents_dir=AGENTS_DIR)` is a standalone callable. The
runner wires it at the dispatch point inside `run_job()` by replacing (or
wrapping) the existing `agent_model(agent)` call with:

```python
from model_router import TaskContext, select_model, record_audit

ctx = TaskContext(task_id=key, agent=agent)
model = select_model(ctx, agents_dir=AGENTS_DIR)
```

The returned string is passed directly to `--model`. No breaking change to
existing callers -- the module is additive.

NOTE (scope): runner.py is outside this session's write scope. The module is
ready; the owner or Ido needs to add the three-line integration to runner.py
and the two-line audit call after the subprocess exits.

**Criterion 2 -- Phase A always returns "claude" (role-specified variant).**

Enforced by the implementation: `select_model` reads the role-file `model:`
field and falls back to `DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6"`. The
`_phase_b_selector` hook that could override this is `None` by default and
MUST NOT be passed by callers in Phase A. Test
`test_phase_a_always_returns_claude` asserts the return value starts with
"claude" for an Opus agent (worst-case non-Sonnet input).

**Criterion 3 -- Audit log receives one structured entry per task;
fields: model, task_id, tokens, cost, latency, outcome; log path readable
by Dalia quality runs.**

`record_audit()` writes exactly these fields plus `ts` (timestamp) as a single
JSONL line. Default path: `projects/model-router/audit/model-router-audit.jsonl`.
The path is a module constant (`DEFAULT_AUDIT_LOG`) and is configurable. Dalia
can point her quality scripts at this path.

Test coverage: `test_required_fields_present` asserts all six design-doc fields
exist in every record. `test_ts_is_utc` asserts the timestamp carries a UTC
offset.

**Criterion 4 -- All existing agent flows pass regression.**

The module is NEW, additive, and not yet wired into runner.py. No existing code
path is modified by this build. When integration is applied (one-line model
assignment + one audit call in `run_job`), the runner's agent flow is unchanged
in behaviour -- `select_model` returns the same model string `agent_model()`
currently returns (reads the same role-file frontmatter). Regression check
should confirm no job fails after the three-line integration is applied. Adi
sign-off gates that step.

**Criterion 5 -- No new secrets, no new external calls, no gate required.**

Confirmed. The module is pure stdlib (re, json, dataclasses, datetime, pathlib).
Zero external calls. Zero secrets. Zero new dependencies. Gate not required.

**Criterion 6 -- Ido release-gate sign-off before merge to master.**

Pending. This build note is the pre-gate handoff. Ido signs off; merge follows.

---

## Deliberately deferred to Phase B

- Any non-Claude model. Phase A is Claude-only per the design doc and envelope.
- Second-opinion routing logic. The `_phase_b_selector` hook is the extension
  point; it is wired in Phase B, not called in Phase A.
- Failover to a local model on outage. Phase B concern.
- Model-matrix read in the router. Phase A reads role-file frontmatter directly
  (identical to runner.py's existing logic). A structured model-matrix query
  is a Phase B addition if needed.

---

## Location note (scope)

The intended long-term home for this module is `integrations/runner/` alongside
runner.py, or a top-level `model_router/` package. This session's write scope
was `projects/` only. Built at `projects/model-router/`. The owner or Ido
should move (or copy) the package to the canonical location before applying the
runner.py integration.

---

## How to run the tests

Standard run (from `projects/model-router/`):

```
python -m pytest tests/ -v
```

To avoid a Windows symlink-cleanup false-failure (same issue as guard suite --
exit code 1 even when all tests pass), use the same basetemp workaround the
runner already applies:

```
python -m pytest tests/ -v -p no:cacheprovider --basetemp <any-private-dir>
```

No external dependencies needed beyond pytest (stdlib only).
