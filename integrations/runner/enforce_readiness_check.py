#!/usr/bin/env python3
"""Enforce-readiness gate check (SEC-0001) -- pure code, deterministic, READ-ONLY.

Decides whether GUARD_MODE=enforce is SAFE to flip, by measuring -- while still in shadow --
whether the guard would wrongly block any legitimate work. Implements the gate ruleset from
company/security/reports/enforce-readiness-gate-design-2026-07-01.md (Rambo).

GREEN  = B1 + B2 deployed AND zero FALSE-BLOCKs in the trailing window (= 7 clean days)
         AND coverage C1..C4 met (the window actually exercised the rules).
SILENT = anything else. Prints a one-line status only; NO owner surface.

On the FIRST transition to GREEN it prints a READINESS_GREEN block (for the runner to relay
to the owner with an A1 request) and records that it surfaced, so it speaks exactly once.

This script NEVER flips GUARD_MODE and NEVER writes outside memory/enforce-readiness-state.json.
Run daily. Idempotent. Usage: enforce_readiness_check.py [--verbose]
"""
from __future__ import annotations
import json, sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(r"C:\Users\Jecki\DEV\projects\eco-synthetic")
GUARD_LOG = ROOT / "memory" / "agent-guard.log"
RUNS = ROOT / "memory" / "agent-runs.jsonl"
CONFIG = ROOT / "memory" / "enforce-readiness-config.json"
STATE = ROOT / "memory" / "enforce-readiness-state.json"

DEFAULTS = {
    "b1_deploy": None, "b2_deploy": None, "window_hours": 168,
    "coverage": {"C1_runner_starts": 14, "C2_owner_redpath": 1,
                 "C3_subagent_writes": 5, "C4_pure_append": 1},
}

# Underlying reason substrings that strict mode SHOULD deny (do NOT count against readiness).
GENUINE_MARKERS = (
    "path-scope violation",
    "not on the non-code allow-list",
    "OFF the permitted-spawn",
    "may be launched only from",
    "SAFE_MODE",
    "write is not a pure append",
    "secret pattern",
    "autonomous runner:",
    "readonly runner cycle",
    "fail-closed",
)
GOVERNED_WRITE = ("write", "edit", "multiedit")


def _load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def _read_jsonl(path: Path) -> list[dict]:
    out = []
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except ValueError:
                continue
    except OSError:
        pass
    return out


def _ts(rec) -> datetime | None:
    try:
        return datetime.fromisoformat(rec.get("ts", ""))
    except (ValueError, TypeError):
        return None


def _underlying(reason: str) -> str:
    for pfx in ("[shadow] would-DENY: ", "[shadow] allow: ", "[shadow] "):
        if reason.startswith(pfx):
            return reason[len(pfx):]
    return reason


def _is_denial(rec) -> bool:
    return rec.get("reason", "").startswith("[shadow] would-DENY:") or rec.get("decision") == "deny"


def _is_pass(rec) -> bool:
    return rec.get("decision") == "allow" and not rec.get("reason", "").startswith("[shadow] would-DENY")


def _is_redpath_target(target: str) -> bool:
    t = (target or "").replace("\\", "/")
    return ".claude/agents/" in t or t.endswith((
        ".claude/settings.json", ".claude/settings.local.json",
        "company/governance/access-matrix.md", "company/constitution.md",
    ))


def classify(rec, b1: datetime | None, b2: datetime | None) -> str:
    """Return 'genuine' or 'false' for a denial record."""
    reason = _underlying(rec.get("reason", ""))
    ts = _ts(rec)
    if "Red path" in reason:
        # After B1 deploy, owner red-paths log as allow; any remaining Red-path denial is a
        # sub-agent/runner = genuine. Before B1 (or unknown ts) it may be the owner = false.
        if b1 and ts and ts >= b1:
            return "genuine"
        return "false"
    if "in-place edit denied" in reason:
        if b2 and ts and ts >= b2:
            return "genuine"
        return "false"
    if any(m in reason for m in GENUINE_MARKERS):
        return "genuine"
    return "false"  # fail-safe: an unrecognized denial keeps the gate red for human review


def evaluate_gate(now: datetime) -> dict:
    cfg = {**DEFAULTS, **_load_json(CONFIG, {})}
    cov = {**DEFAULTS["coverage"], **(cfg.get("coverage") or {})}
    b1 = datetime.fromisoformat(cfg["b1_deploy"]) if cfg.get("b1_deploy") else None
    b2 = datetime.fromisoformat(cfg["b2_deploy"]) if cfg.get("b2_deploy") else None
    window_start = now - timedelta(hours=int(cfg.get("window_hours", 168)))

    guard = [r for r in _read_jsonl(GUARD_LOG) if (_ts(r) and _ts(r) >= window_start)]
    runs = [r for r in _read_jsonl(RUNS) if (_ts(r) and _ts(r) >= window_start)]

    # False-blocks in window
    false_recs = [r for r in guard if _is_denial(r) and classify(r, b1, b2) == "false"]

    # Coverage
    c1 = sum(1 for r in runs if r.get("event") == "start")
    c2 = sum(1 for r in guard if _is_pass(r) and r.get("origin", "") == ""
             and not r.get("runner") and _is_redpath_target(r.get("target", "")))
    c3 = sum(1 for r in guard if _is_pass(r) and (r.get("tool", "") or "").lower() in GOVERNED_WRITE
             and r.get("origin", "") not in ("", None))
    c4 = sum(1 for r in guard if _is_pass(r) and "pure append" in r.get("reason", ""))

    checks = {
        "B1_deployed": b1 is not None,
        "B2_deployed": b2 is not None,
        "false_blocks_0": len(false_recs) == 0,
        "C1_runner_starts": c1 >= cov["C1_runner_starts"],
        "C2_owner_redpath": c2 >= cov["C2_owner_redpath"],
        "C3_subagent_writes": c3 >= cov["C3_subagent_writes"],
        "C4_pure_append": c4 >= cov["C4_pure_append"],
    }
    green = all(checks.values())
    return {
        "green": green, "checks": checks,
        "metrics": {"false_blocks": len(false_recs), "C1": c1, "C2": c2, "C3": c3, "C4": c4,
                    "guard_events_in_window": len(guard)},
        "false_sample": [{"ts": r.get("ts"), "reason": r.get("reason", "")[:80]} for r in false_recs[:5]],
        "window_start": window_start.isoformat(), "now": now.isoformat(),
    }


def owner_surface(result: dict) -> str:
    return (
        "READINESS_GREEN\n"
        "[Eco -- strict-mode readiness gate MET]\n\n"
        "The guard's strict-mode (enforce) readiness gate is GREEN. For the last 7 days the "
        "guard would NOT have wrongly blocked any legitimate work, and the test window actually "
        "exercised the rules (runner cycles, an owner role-file edit, sub-agent writes, and a "
        "proper log append all observed).\n\n"
        "Reminder of what this is: flipping GUARD_MODE shadow -> enforce makes the security guard "
        "actually BLOCK (not just log) out-of-scope writes, bad spawns, and red-path edits -- the "
        "safety floor for letting the runner clear queued tasks on its own.\n\n"
        "This is your A1 call. Reply to approve the flip, or ask for the evidence. "
        "Nothing flips without your go.\n"
        f"(Evidence: {json.dumps(result['metrics'])})"
    )


def main() -> int:
    verbose = "--verbose" in sys.argv
    now = datetime.now(timezone.utc)
    result = evaluate_gate(now)
    state = _load_json(STATE, {})
    already_surfaced = bool(state.get("surfaced"))

    new_state = {
        "last_run": now.isoformat(), "green": result["green"],
        "checks": result["checks"], "metrics": result["metrics"],
        "surfaced": already_surfaced or result["green"],
        "first_green": state.get("first_green") or (now.isoformat() if result["green"] else None),
    }
    try:
        STATE.write_text(json.dumps(new_state, indent=2), encoding="utf-8")
    except OSError:
        pass

    if result["green"] and not already_surfaced:
        print(owner_surface(result))
    else:
        failed = [k for k, v in result["checks"].items() if not v]
        print(f"READINESS_SILENT: not green ({len(failed)} unmet: {', '.join(failed)}); "
              f"false_blocks={result['metrics']['false_blocks']}")
    if verbose:
        print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
