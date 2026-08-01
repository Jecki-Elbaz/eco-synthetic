"""Regression tests for the owner-notification gate (2026-08-01 noise-reduction rollout).

Covers the three mechanics that cut the ~16 pushes/day to ~1: the robust NO_ACTIONABLE
suppression (the old endswith() shipped the 'no new mail' spam), the owner-local quiet-hours
window (dependency-free Israel DST math -- this box has no tzdata), and the owner_notify gate
that drops non-emergency pushes during quiet hours.

Run: python -m pytest integrations/runner/test_runner_notify.py -q
Fallback (no pytest): python integrations/runner/test_runner_notify.py
"""
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import runner as R  # noqa: E402


# --- Suppression: the sentinel counts whether it is first OR last non-empty line ---

def test_no_actionable_sentinel_only():
    assert R._is_no_actionable("NO_ACTIONABLE_CONTENT") is True


def test_no_actionable_sentinel_first_with_trailing_note():
    # The exact shape that used to slip through endswith() and spam the owner.
    out = "NO_ACTIONABLE_CONTENT\n\nScreen complete -- no new mail from Adam. Run 7 note appended."
    assert R._is_no_actionable(out) is True


def test_no_actionable_sentinel_last_with_preamble():
    out = "Checked the board and handoff.\n\nNO_ACTIONABLE_CONTENT"
    assert R._is_no_actionable(out) is True


def test_actionable_when_urgent_present():
    out = "URGENT: sign the Adam package by 15:00\n\nDetails follow."
    assert R._is_no_actionable(out) is False


def test_actionable_when_no_sentinel():
    assert R._is_no_actionable("Nine P1 items are open.") is False


def test_empty_output_is_not_actionable_but_not_suppressible():
    # Empty output is guarded separately by `out and not no_actionable` in run_job.
    assert R._is_no_actionable("") is False


# --- Israel offset: DST +3, standard +2, dependency-free ---

def test_israel_offset_summer_is_three():
    assert R._israel_offset_hours(datetime(2026, 7, 1, tzinfo=timezone.utc)) == 3


def test_israel_offset_winter_is_two():
    assert R._israel_offset_hours(datetime(2026, 1, 1, tzinfo=timezone.utc)) == 2


# --- Quiet hours: owner-local [22:00, 09:00) ---

def _q(y, mo, d, h, mi=0):
    return R.quiet_hours_active(datetime(y, mo, d, h, mi, tzinfo=timezone.utc))


def test_quiet_hours_summer_night():
    assert _q(2026, 7, 27, 20) is True   # 23:00 local (UTC+3)


def test_quiet_hours_summer_early_morning():
    assert _q(2026, 7, 27, 5, 30) is True   # 08:30 local


def test_quiet_hours_end_boundary_open():
    assert _q(2026, 7, 27, 6, 30) is False  # 09:30 local -- window is [22,9)


def test_quiet_hours_midday_clear():
    assert _q(2026, 7, 27, 12) is False  # 15:00 local


def test_quiet_hours_winter_night():
    assert _q(2026, 1, 15, 20, 30) is True  # 22:30 local (UTC+2)


# --- owner_notify: quiet hours drop non-emergency, emergencies pierce ---

def _install_capture(monkeypatch_sent):
    sent = []
    R.send_telegram = lambda text: (sent.append(text) or True)  # type: ignore[assignment]
    return sent


def test_owner_notify_drops_routine_in_quiet_hours(monkeypatch):
    sent = []
    monkeypatch.setattr(R, "send_telegram", lambda text: sent.append(text) or True)
    monkeypatch.setattr(R, "quiet_hours_active", lambda t=None: True)
    monkeypatch.setattr(R, "log", lambda rec: None)
    assert R.owner_notify("routine", emergency=False) is False
    assert sent == []


def test_owner_notify_emergency_pierces_quiet_hours(monkeypatch):
    sent = []
    monkeypatch.setattr(R, "send_telegram", lambda text: sent.append(text) or True)
    monkeypatch.setattr(R, "quiet_hours_active", lambda t=None: True)
    monkeypatch.setattr(R, "log", lambda rec: None)
    assert R.owner_notify("incident", emergency=True) is True
    assert sent == ["incident"]


def test_owner_notify_sends_routine_outside_quiet_hours(monkeypatch):
    sent = []
    monkeypatch.setattr(R, "send_telegram", lambda text: sent.append(text) or True)
    monkeypatch.setattr(R, "quiet_hours_active", lambda t=None: False)
    monkeypatch.setattr(R, "log", lambda rec: None)
    assert R.owner_notify("daytime routine", emergency=False) is True
    assert sent == ["daytime routine"]


# --- Fallback runner when pytest is not installed in the runner interpreter ---

if __name__ == "__main__":
    import types

    class _MP:
        """Tiny monkeypatch shim so the file runs without pytest."""
        def __init__(self):
            self._undo = []
        def setattr(self, obj, name, val):
            self._undo.append((obj, name, getattr(obj, name)))
            setattr(obj, name, val)
        def undo(self):
            for obj, name, val in reversed(self._undo):
                setattr(obj, name, val)

    passed = failed = 0
    for _name, _fn in sorted(globals().items()):
        if _name.startswith("test_") and isinstance(_fn, types.FunctionType):
            mp = _MP()
            try:
                _fn(mp) if _fn.__code__.co_argcount else _fn()
                passed += 1
            except Exception as exc:  # noqa: BLE001
                failed += 1
                print(f"FAIL {_name}: {exc}")
            finally:
                mp.undo()
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)
