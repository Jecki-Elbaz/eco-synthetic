"""Tests for model_router.audit (Phase A).

Covers: file creation, required fields, append-only behaviour, optional fields,
ISO timestamp format, and the DEFAULT_AUDIT_LOG constant.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

import pytest

_PKG_ROOT = Path(__file__).resolve().parent.parent
if str(_PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(_PKG_ROOT))

from model_router.audit import DEFAULT_AUDIT_LOG, record_audit

# ---------------------------------------------------------------------------
# record_audit
# ---------------------------------------------------------------------------


class TestRecordAudit:
    """Unit tests for the audit-log writer."""

    def test_creates_file_and_directory_on_first_write(
        self, tmp_path: Path
    ) -> None:
        log = tmp_path / "audit" / "sub" / "test.jsonl"
        record_audit("T-0001", "claude-sonnet-4-6", audit_log=log)
        assert log.exists()

    def test_writes_valid_json(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0001", "claude-sonnet-4-6", audit_log=log)
        # Should not raise
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert isinstance(data, dict)

    def test_required_fields_present(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0002", "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        required = ("ts", "task_id", "model", "tokens", "cost_usd", "latency_ms", "outcome")
        for field_name in required:
            assert field_name in data, f"Missing required field: {field_name!r}"

    def test_task_id_and_model_written_correctly(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0003", "claude-haiku-4-5-20251001", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["task_id"] == "T-0003"
        assert data["model"] == "claude-haiku-4-5-20251001"

    def test_cost_defaults_to_zero_when_none_passed(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0004", "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["cost_usd"] == 0.0

    def test_explicit_cost_usd_written(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0005", "claude-sonnet-4-6", cost_usd=0.0, audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["cost_usd"] == 0.0

    def test_optional_fields_written_when_provided(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit(
            "T-0006",
            "claude-sonnet-4-6",
            tokens=1500,
            cost_usd=0.0,
            latency_ms=2400,
            outcome="done",
            audit_log=log,
        )
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["tokens"] == 1500
        assert data["latency_ms"] == 2400
        assert data["outcome"] == "done"

    def test_optional_fields_are_null_when_not_provided(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0007", "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["tokens"] is None
        assert data["latency_ms"] is None
        assert data["outcome"] is None

    def test_appends_multiple_records(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0001", "claude-a", audit_log=log)
        record_audit("T-0002", "claude-b", audit_log=log)
        lines = [ln for ln in log.read_text(encoding="utf-8").splitlines() if ln.strip()]
        assert len(lines) == 2
        r1 = json.loads(lines[0])
        r2 = json.loads(lines[1])
        assert r1["task_id"] == "T-0001"
        assert r2["task_id"] == "T-0002"

    def test_never_truncates_pre_existing_content(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        log.write_text('{"pre_existing": true}\n', encoding="utf-8")
        record_audit("T-0008", "claude-sonnet-4-6", audit_log=log)
        lines = [ln for ln in log.read_text(encoding="utf-8").splitlines() if ln.strip()]
        assert len(lines) == 2
        assert json.loads(lines[0])["pre_existing"] is True
        assert json.loads(lines[1])["task_id"] == "T-0008"

    def test_ts_is_valid_iso_format(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0009", "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        # Must not raise ValueError
        datetime.fromisoformat(data["ts"])

    def test_ts_is_utc(self, tmp_path: Path) -> None:
        log = tmp_path / "test.jsonl"
        record_audit("T-0010", "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        # ISO format with timezone offset ("+00:00" or "Z" suffix)
        assert "+" in data["ts"] or data["ts"].endswith("Z")

    def test_runner_job_key_as_task_id(self, tmp_path: Path) -> None:
        """Runner job keys (with colons and spaces) are valid task_ids."""
        log = tmp_path / "test.jsonl"
        key = "Eco:2h Check-in (every 2h)"
        record_audit(key, "claude-sonnet-4-6", audit_log=log)
        data = json.loads(log.read_text(encoding="utf-8").strip())
        assert data["task_id"] == key


# ---------------------------------------------------------------------------
# DEFAULT_AUDIT_LOG
# ---------------------------------------------------------------------------


class TestDefaultAuditLog:
    def test_constant_is_defined(self) -> None:
        assert DEFAULT_AUDIT_LOG is not None

    def test_constant_ends_with_jsonl(self) -> None:
        assert str(DEFAULT_AUDIT_LOG).endswith(".jsonl")

    def test_constant_is_path(self) -> None:
        assert isinstance(DEFAULT_AUDIT_LOG, Path)
