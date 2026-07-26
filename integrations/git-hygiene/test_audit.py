"""Tests for the git-hygiene audit checks added in ae3a6bb.

Run: pytest integrations/git-hygiene/test_audit.py -q

Covers the two flags introduced after c02bbcd landed with the git message template
folded into its subject line: unfinished-merge detection and template-in-subject
detection over unpushed commits. `collect()` normally shells out to real git, so the
parsing tests stub `_git` and assert on the parse, never on this repo's live state.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

_spec = importlib.util.spec_from_file_location("audit", Path(__file__).with_name("audit.py"))
audit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(audit)


def stats(**over):
    """A CLEAN stats dict; override single keys per test."""
    s = {
        "branch": "master",
        "detached": False,
        "has_upstream": True,
        "ahead": 0,
        "behind": 0,
        "total": 0,
        "staged": 0,
        "unstaged": 0,
        "untracked": 0,
        "mid_merge": False,
        "bad_msgs": [],
        "top_areas": [],
    }
    s.update(over)
    return s


TEMPLATE_BODY = (
    "Merge branch 'master' of https://github.com/Jecki-Elbaz/eco-synthetic\n"
    "# Please enter a commit message to explain why this merge is necessary,\n"
    "# especially if it merges an updated upstream into a topic branch.\n"
    "#\n"
    "# Lines starting with '#' will be ignored, and an empty message aborts\n"
    "# the commit.\n"
)
CLEAN_BODY = "chore(company): SHIR-007 backlog + 2026-07-26 deliverables\n"


# --- judge(): the two new flags ---

def test_clean_state_has_no_flags():
    verdict, flags = audit.judge(stats())
    assert verdict == "CLEAN"
    assert flags == []


def test_mid_merge_flagged():
    verdict, flags = audit.judge(stats(mid_merge=True))
    assert verdict == "ATTENTION"
    hits = [f for f in flags if "merge is started but not finished" in f]
    assert len(hits) == 1
    # The flag must tell the owner how to finish it, with the cleanup fix included.
    assert "--cleanup=strip" in hits[0]


def test_template_subject_flagged_with_shas():
    verdict, flags = audit.judge(stats(bad_msgs=["ae3a6bb", "c02bbcd"]))
    assert verdict == "ATTENTION"
    hits = [f for f in flags if "message template stuck" in f]
    assert len(hits) == 1
    assert "2 unpushed commit(s)" in hits[0]
    assert "ae3a6bb" in hits[0] and "c02bbcd" in hits[0]
    # Must steer to --amend, never to a force-push (that is an A1 action).
    assert "--amend" in hits[0]
    assert "force" not in hits[0].lower()


def test_both_new_flags_can_fire_together():
    _, flags = audit.judge(stats(mid_merge=True, bad_msgs=["deadbee"]))
    assert any("merge is started but not finished" in f for f in flags)
    assert any("message template stuck" in f for f in flags)


def test_new_flags_do_not_disturb_existing_ones():
    """A pile of uncommitted work still flags as before, independent of the new checks."""
    _, flags = audit.judge(stats(total=99, untracked=99))
    assert any("99 changed files uncommitted" in f for f in flags)
    assert not any("merge is started" in f for f in flags)


# --- collect(): parsing, with git stubbed ---

def _fake_git(monkeypatch, *, log_records=(), merge_head="", upstream="origin/master"):
    """Stub audit._git. log_records is a list of (sha, body) pairs."""
    raw = "".join(
        f"{sha}{audit._FLD}{body}{audit._REC}" for sha, body in log_records
    )

    def fake(*args):
        if args[0] == "branch":
            return "master"
        if args[0] == "status":
            return ""
        if args[0] == "diff":
            return ""
        if args[0] == "ls-files":
            return ""
        if args[:2] == ("rev-parse", "--abbrev-ref"):
            return upstream
        if args[:3] == ("rev-parse", "--verify", "--quiet"):
            return merge_head
        if args[0] == "rev-list":
            return "0"
        if args[0] == "log":
            # The audit builds this format by concatenation; assert it stays intact.
            assert args[1] == "@{u}..HEAD"
            assert args[2] == "--format=%h%x1f%B%x1e"
            return raw
        return ""

    monkeypatch.setattr(audit, "_git", fake)


def test_collect_detects_mid_merge(monkeypatch):
    _fake_git(monkeypatch, merge_head="293a9c84ed37be864a996efcce99e36b849ce63b")
    assert audit.collect()["mid_merge"] is True


def test_collect_reports_no_merge_when_rev_parse_is_empty(monkeypatch):
    _fake_git(monkeypatch, merge_head="")
    assert audit.collect()["mid_merge"] is False


def test_collect_finds_template_commit(monkeypatch):
    _fake_git(monkeypatch, log_records=[("c02bbcd", TEMPLATE_BODY)])
    assert audit.collect()["bad_msgs"] == ["c02bbcd"]


def test_collect_ignores_clean_commit(monkeypatch):
    _fake_git(monkeypatch, log_records=[("098bba1", CLEAN_BODY)])
    assert audit.collect()["bad_msgs"] == []


def test_collect_separates_multiple_records(monkeypatch):
    """Bodies contain newlines, so the record split must rely on _REC, not lines."""
    _fake_git(monkeypatch, log_records=[
        ("098bba1", CLEAN_BODY),
        ("c02bbcd", TEMPLATE_BODY),
        ("ae3a6bb", CLEAN_BODY),
    ])
    assert audit.collect()["bad_msgs"] == ["c02bbcd"]


def test_collect_catches_lines_starting_marker_alone(monkeypatch):
    """Either template marker is enough; git's wording has varied across versions."""
    body = "Merge branch 'x'\n# Lines starting with '#' will be ignored\n"
    _fake_git(monkeypatch, log_records=[("beefbee", body)])
    assert audit.collect()["bad_msgs"] == ["beefbee"]


def test_collect_does_not_flag_hash_inside_message_text(monkeypatch):
    """A '#123' issue ref or a mid-line '#' must not be mistaken for the template."""
    body = "fix(api): handle #123 and a # in prose\n\nBody mentions # here too.\n"
    _fake_git(monkeypatch, log_records=[("cafe123", body)])
    assert audit.collect()["bad_msgs"] == []


def test_collect_skips_scan_without_upstream(monkeypatch):
    """No upstream means @{u} would error; the scan must be skipped, not crash."""
    _fake_git(monkeypatch, log_records=[("c02bbcd", TEMPLATE_BODY)], upstream="")
    s = audit.collect()
    assert s["has_upstream"] is False
    assert s["bad_msgs"] == []


def test_separators_are_source_escapes_not_raw_bytes():
    """Regression guard: these were once written into the file as literal 0x1e/0x1f."""
    src = Path(audit.__file__).read_bytes()
    assert bytes([30]) not in src
    assert bytes([31]) not in src
    assert audit._FLD == "\x1f"
    assert audit._REC == "\x1e"


# --- write_reports(): the new report lines ---

def test_report_renders_new_state_lines(tmp_path, monkeypatch):
    monkeypatch.setattr(audit, "HYGIENE_DIR", tmp_path)
    monkeypatch.setattr(audit, "LAST_AUDIT", tmp_path / "last-audit.md")
    monkeypatch.setattr(audit, "AUDIT_LOG", tmp_path / "audit-log.md")
    s = stats(mid_merge=True, bad_msgs=["c02bbcd"])
    audit.write_reports(s, *audit.judge(s))
    text = (tmp_path / "last-audit.md").read_text(encoding="utf-8")
    assert "Merge in progress: YES -- unfinished" in text
    assert "Unpushed commits with template text in the subject: 1" in text


def test_report_omits_alarm_when_clean(tmp_path, monkeypatch):
    monkeypatch.setattr(audit, "HYGIENE_DIR", tmp_path)
    monkeypatch.setattr(audit, "LAST_AUDIT", tmp_path / "last-audit.md")
    monkeypatch.setattr(audit, "AUDIT_LOG", tmp_path / "audit-log.md")
    s = stats()
    audit.write_reports(s, *audit.judge(s))
    text = (tmp_path / "last-audit.md").read_text(encoding="utf-8")
    assert "Merge in progress: no" in text
    assert "Unpushed commits with template text in the subject: 0" in text


def test_reports_never_contain_commit_message_text(tmp_path, monkeypatch):
    """Red line 1 posture: SHAs and counts only, never message bodies."""
    monkeypatch.setattr(audit, "HYGIENE_DIR", tmp_path)
    monkeypatch.setattr(audit, "LAST_AUDIT", tmp_path / "last-audit.md")
    monkeypatch.setattr(audit, "AUDIT_LOG", tmp_path / "audit-log.md")
    s = stats(bad_msgs=["c02bbcd"])
    audit.write_reports(s, *audit.judge(s))
    both = (tmp_path / "last-audit.md").read_text(encoding="utf-8")
    both += (tmp_path / "audit-log.md").read_text(encoding="utf-8")
    assert "Please enter a commit message" not in both


# --- owner_message(): stays inside the Telegram budget ---

@pytest.mark.parametrize("over", [
    {"mid_merge": True},
    {"bad_msgs": ["a1b2c3d", "e4f5a6b", "c7d8e9f"]},
    {"mid_merge": True, "bad_msgs": ["a1b2c3d"], "total": 99, "untracked": 99, "ahead": 3},
])
def test_owner_message_stays_within_budget(over):
    s = stats(**over)
    msg = audit.owner_message(s, audit.judge(s)[1])
    assert len(msg) <= 700
    assert msg.isascii()  # formatting rule: plain ASCII in agent output
