#!/usr/bin/env python3
"""Eco-Synthetic autonomy guard -- PreToolUse enforcement.

Implements the deterministic enforcement layer from
company/governance/proposals/agent-autonomy-supervision.md (sections 5.1-5.5).

Principle: CODE enforces, AGENTS review. This script is the circuit breaker.

Modes (memory/GUARD_MODE, default "shadow"):
  - shadow : evaluate every governed call, LOG the decision, but ALLOW it.
             Used in Phase 1 so the guard does not disrupt owner/admin sessions
             while it is being validated. Flipping to "enforce" is a later gated step.
  - enforce: evaluate and return the real allow/deny decision.

Fail-closed: an evaluation error while in enforce mode DENIES (never fail open).
Mode resolution itself defaults to shadow (a usability default, not a security
failure) when the mode file is absent.

Hook contract: reads the PreToolUse JSON event on stdin; emits an advanced-JSON
permission decision on stdout. Allow -> exit 0. Deny -> permissionDecision "deny"
plus a reason on stderr and exit code 2 (belt-and-suspenders for versions that
read the exit code instead of the JSON).
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODE_FILE = ROOT / "memory" / "GUARD_MODE"
LOG_FILE = ROOT / "memory" / "agent-guard.log"
SAFE_MODE_FILE = ROOT / "memory" / "SAFE_MODE"

# Section 5.2 -- agents that may perform governed actions (spawn + write/edit).
# Synced to company/governance/agent-tool-spawn-allowlist.md (Phase 1 audit F-R01, owner A1
# 2026-06-22): noam renamed -> perry; ido/luci/erez/hila added (PERMITTED in the allowlist doc).
# redteam (Red) is included so it may perform governed actions (write its own audit logs in
# enforce mode, F-R04) but is held OUT of spawnability by SPAWN_DENY below -- the guard
# otherwise conflates "may act" with "may be spawned".
ALLOWED_AGENTS = {
    "anat", "assaf", "dalia", "eyal", "rambo", "lital",
    "perry", "ido", "luci", "erez", "hila", "redteam",
}

# Agents that may ACT (above) but may NOT be spawned via the Agent/Task tool. RedTeam is OFF
# the permitted-spawn allowlist per its certification condition (until T-0020 C3).
SPAWN_DENY = {"redteam"}

# Section 4/5.1 -- Red paths: writes denied for everyone (owner A1 only, out of band).
RED_PREFIXES = (
    ".claude/agents/",
)
RED_EXACT = {
    ".claude/settings.json",
    ".claude/settings.local.json",
    "company/governance/access-matrix.md",
    "company/constitution.md",
}

# Section 5.3 -- append-only audit trail.
APPEND_ONLY = {
    "company/decisions/decisions-log.md",
    "memory/log.jsonl",
    "memory/log.md",
    "memory/agent-runs.jsonl",
}

SAFE_MODE_REL = "memory/SAFE_MODE"

ALLOW = "allow"
DENY = "deny"


def _relpath(file_path: str) -> str:
    """Return path relative to repo root with forward slashes; raw if outside."""
    if not file_path:
        return ""
    p = Path(file_path)
    try:
        if not p.is_absolute():
            p = (ROOT / p)
        rel = p.resolve().relative_to(ROOT)
        return str(rel).replace("\\", "/")
    except (ValueError, OSError):
        return file_path.replace("\\", "/")


def _is_red(rel: str) -> bool:
    if rel in RED_EXACT:
        return True
    return any(rel.startswith(pfx) for pfx in RED_PREFIXES)


def _safe_mode_active() -> bool:
    try:
        return SAFE_MODE_FILE.exists() and SAFE_MODE_FILE.read_text(
            encoding="utf-8"
        ).strip() != ""
    except OSError:
        # Cannot determine -> treat as active (fail safe: halt).
        return True


def _current_content(rel: str) -> str:
    try:
        return (ROOT / rel).read_text(encoding="utf-8")
    except (OSError, ValueError):
        return ""


def evaluate(event: dict) -> tuple[str, str]:
    """Pure decision function. Returns (allow|deny, reason). Raises on bad input."""
    tool = str(event.get("tool_name", "")).lower()
    ti = event.get("tool_input") or {}
    if not isinstance(ti, dict):
        raise ValueError("tool_input is not an object")

    governed = tool in ("write", "edit", "multiedit", "task", "agent")

    # --- Autonomous runner path (real tool-stripping enforcement) ---
    # The scheduled runner (integrations/runner/runner.py) sets RUNNER_CONTEXT=1 and
    # RUNNER_MODE on every spawned agent. --allowedTools is NOT a reliable boundary
    # (verified 2026-06-28: it does not strip Bash, and readonly still allowed writes
    # to non-sensitive paths), so the guard is the enforcement layer for that path.
    if os.environ.get("RUNNER_CONTEXT") == "1":
        runner_mode = os.environ.get("RUNNER_MODE", "").lower()
        # No shell and no recursive sub-agent spawning from a scheduled agent, ever.
        if tool == "bash":
            return DENY, "autonomous runner: Bash is disabled on the scheduled path"
        if tool in ("task", "agent"):
            return DENY, "autonomous runner: sub-agent spawning is disabled"
        # Readonly cycle = genuinely zero writes, regardless of path.
        if runner_mode == "readonly" and tool in ("write", "edit", "multiedit"):
            return DENY, "readonly runner cycle: all writes blocked"
        # act cycle falls through to the path rules below (Red paths / SAFE_MODE /
        # append-only). Own-scope is not hard-enforced here (path rules only).

    # Origin enforcement (5.2, verified C2/C5): Claude Code populates a top-level
    # agent_type when a tool call is made from inside a sub-agent. A governed action
    # coming from a sub-agent that is NOT on the non-code allow-list is denied -- this
    # enforces the allow-list on the ACTING agent, independent of the spawn-time field.
    origin = str(event.get("agent_type", "")).lower()
    if governed and origin and origin not in ALLOWED_AGENTS:
        return DENY, (
            f"acting sub-agent '{origin}' is not on the non-code allow-list (5.2); "
            f"allowed: {', '.join(sorted(ALLOWED_AGENTS))}"
        )

    # --- Sub-agent spawn (Agent tool; underlying tool name is "Task") ---
    if tool in ("task", "agent"):
        sub = str(ti.get("subagent_type", "") or ti.get("agent_type", "")).lower()
        if _safe_mode_active():
            return DENY, "SAFE_MODE active: all sub-agent spawns halted (5.4/7)"
        if sub in SPAWN_DENY:
            return DENY, (
                f"agent '{sub}' is OFF the permitted-spawn allowlist "
                f"(certification condition; until T-0020 C3)"
            )
        if sub not in ALLOWED_AGENTS:
            return DENY, (
                f"agent '{sub or '(unspecified)'}' not on the non-code allow-list "
                f"(5.2); allowed: {', '.join(sorted(ALLOWED_AGENTS))}"
            )
        return ALLOW, f"allow-listed sub-agent '{sub}'"

    # --- File writes (Write / Edit / MultiEdit) ---
    if tool in ("write", "edit", "multiedit"):
        fp = ti.get("file_path") or ti.get("path") or ""
        rel = _relpath(str(fp))

        # SAFE_MODE flag protection (5.4) -- evaluated before generic rules.
        if rel == SAFE_MODE_REL:
            if tool in ("edit", "multiedit"):
                return DENY, "SAFE_MODE may not be edited (clearing is owner-only, 5.4)"
            content = str(ti.get("content", ""))
            if content.strip() == "":
                return DENY, "clearing/emptying SAFE_MODE is owner-only A1 (5.4)"
            return ALLOW, "setting SAFE_MODE flag"

        # Red paths (5.1) -- owner-only A1, blocked regardless of SAFE_MODE.
        if _is_red(rel):
            return DENY, f"Red path '{rel}': owner-only A1 (section 4/5.1)"

        # SAFE_MODE halts all other writes (7).
        if _safe_mode_active():
            return DENY, "SAFE_MODE active: writes halted until owner clears (7)"

        # Append-only audit trail (5.3).
        if rel in APPEND_ONLY:
            if tool in ("edit", "multiedit"):
                return DENY, f"append-only '{rel}': in-place edit denied (5.3)"
            new = str(ti.get("content", ""))
            cur = _current_content(rel)
            if not new.startswith(cur):
                return DENY, f"append-only '{rel}': write is not a pure append (5.3)"
            return ALLOW, f"pure append to '{rel}'"

        return ALLOW, f"ungoverned path '{rel}'"

    # Any other tool is not governed by this guard.
    return ALLOW, f"ungoverned tool '{tool}'"


def _mode() -> str:
    try:
        m = MODE_FILE.read_text(encoding="utf-8").strip().lower()
        return m if m in ("shadow", "enforce") else "shadow"
    except OSError:
        return "shadow"


def decide(event: dict, mode: str) -> tuple[str, str]:
    """Apply mode. In shadow, always allow but record what enforce would do."""
    try:
        decision, reason = evaluate(event)
    except Exception as exc:  # noqa: BLE001 -- fail-closed
        if mode == "enforce":
            return DENY, f"fail-closed: guard could not evaluate ({exc})"
        return ALLOW, f"[shadow] eval-error (would fail-closed): {exc}"
    if mode == "enforce":
        return decision, reason
    if decision == DENY:
        return ALLOW, f"[shadow] would-DENY: {reason}"
    return ALLOW, f"[shadow] allow: {reason}"


def _log(event: dict, mode: str, decision: str, reason: str) -> None:
    try:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        rec = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "mode": mode,
            "tool": event.get("tool_name"),
            "target": (event.get("tool_input") or {}).get("file_path")
            or (event.get("tool_input") or {}).get("subagent_type"),
            "decision": decision,
            "reason": reason,
        }
        with LOG_FILE.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(rec) + "\n")
    except OSError:
        pass  # logging must never block a decision


def main() -> int:
    raw = sys.stdin.read()
    try:
        event = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        event = {}
    mode = _mode()
    decision, reason = decide(event, mode)
    _log(event, mode, decision, reason)

    if decision == DENY:
        out = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
        print(json.dumps(out))
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
