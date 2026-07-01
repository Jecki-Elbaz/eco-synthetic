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
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HANDOFF_PATH = Path("C:/Users/Jecki/DEV/shared/handoff")
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
    "perry", "ido", "luci", "erez", "hila", "redteam", "noa",
    # Code-builders (SEC-0001, 2026-06-30): added with PATH_SCOPE containment below so
    # enforce mode does not block their legitimate project/infra writes. Design:
    # company/security/reports/guard-write-scoping-design-2026-06-30.md (Rambo).
    "gal", "shir", "adi", "oren",
}

# Agents that may ACT (above) but may NOT be spawned via the Agent/Task tool. RedTeam is OFF
# the permitted-spawn allowlist per its certification condition (until T-0020 C3).
SPAWN_DENY = {"redteam"}

# Agents that may be launched ONLY from an owner/top-level session, never spawned by another
# sub-agent (SEC-0001, owner directive 2026-06-30). The code-builders may ACT (PATH_SCOPE) and
# may be launched by the owner's own Claude Code session (origin empty), but an allow-listed
# sub-agent (e.g. anat) may NOT spawn them. The runner cannot spawn anyone (RUNNER_CONTEXT) and
# the Telegram bridge has no Agent tool, so "origin empty" reliably means the owner's session.
OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren"}

# Per-agent write-path scope (SEC-0001, 2026-06-30; Rambo design). For any KNOWN sub-agent
# (origin set) that is in this map, a governed write whose repo-relative path does not start
# with one of the agent's allowed prefixes is DENIED. Paths match _relpath() output (forward
# slashes). memory/board.md and memory/log.md are listed individually (not bare "memory/") to
# prevent drift into memory/GUARD_MODE / memory/SAFE_MODE / memory/owner-office/. The existing
# Red-path, SAFE_MODE, and append-only rules still apply on top. Eco is intentionally ABSENT:
# the CEO write scope is company-wide, so the path-scope check is skipped for eco (same as a
# main/owner session). Agents not in this map but on ALLOWED_AGENTS (eco) are unconstrained here.
PATH_SCOPE: dict[str, list[str]] = {
    "anat": [
        "company/hr/", "company/roster.md", "company/org-chart.mermaid",
        "memory/board.md", "memory/log.md", "company/decisions/decisions-log.md",
    ],
    "dalia": [
        "company/governance/access-matrix.md", "company/soul.md", "memory/wiki/",
        "memory/board.md", "memory/log.md", "company/decisions/decisions-log.md",
    ],
    "assaf": [
        "company/model-matrix.md", "dashboards/",
        "memory/board.md", "memory/log.md", "company/decisions/decisions-log.md",
    ],
    "rambo": [
        "company/governance/gate-register.md", "company/governance/security-baseline.md",
        "company/security/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "eyal": [
        "company/governance/gate-register.md", "company/governance/compliance-backlog.md",
        "memory/board.md", "memory/log.md",
    ],
    "lital": [
        "company/governance/compliance-backlog.md", "dashboards/",
        "memory/board.md", "memory/log.md", "company/decisions/decisions-log.md",
    ],
    "perry": [
        "projects/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "ido": [
        "projects/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "hila": [
        "marketing/", "memory/board.md", "memory/log.md",
    ],
    "luci": [
        "memory/", "company/decisions/decisions-log.md",
    ],
    "erez": [
        "projects/", "memory/log.md", "company/decisions/decisions-log.md",
    ],
    "oracle": [
        "company/chronicle/", "memory/log.md",
    ],
    "yael": [
        "company/governance/file-index.md", "memory/log.md",
    ],
    "gal": [
        "projects/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "shir": [
        "integrations/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "adi": [
        "projects/delivery-saas/docs/qa/", "memory/log.md",
    ],
    "noa": [
        "projects/ai-patient-simulator/", "memory/log.md",
    ],
    "oren": [
        "projects/delivery-saas/docs/review/", "memory/log.md",
    ],
    "redteam": [
        "company/audits/redteam/", "memory/log.md",
    ],
}

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

# Patterns for credential/secret scanning on shared/handoff/ writes.
_SECRET_PATTERNS = [
    re.compile(r"(?i)(password|passwd|secret|token|api[-_]?key)\s*[:=]\s*\S{6,}"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{36}"),
    re.compile(r"xox[bpoa]-[A-Za-z0-9\-]{10,}"),
    re.compile(r"AIza[A-Za-z0-9\-_]{35}"),
    re.compile(r"AKIA[A-Za-z0-9]{16}"),
    re.compile(r"Bearer\s+[A-Za-z0-9\-_\.]{20,}"),
    re.compile(r"eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+"),
]

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


def _is_handoff(file_path: str) -> bool:
    try:
        return Path(file_path).resolve().is_relative_to(HANDOFF_PATH.resolve())
    except (ValueError, OSError):
        return False


def _contains_secret(content: str) -> str | None:
    content = content[:50_000]  # cap to limit regex exposure
    for pat in _SECRET_PATTERNS:
        m = pat.search(content)
        if m:
            return m.group(0)[:40]
    return None


def _targets_handoff(cmd: str) -> bool:
    norm = cmd.replace("\\", "/")
    return "shared/handoff" in norm


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

    # Per-agent write-path scope (SEC-0001 -- least-privilege path containment).
    # Fires only for governed WRITE actions from a known sub-agent whose origin IS in
    # PATH_SCOPE. eco is excluded from PATH_SCOPE by design (CEO scope is company-wide).
    # Main/owner-session writes (origin empty) never enter this block. This can only ADD
    # denials for out-of-scope paths; it never permits anything the rules below would deny.
    # The SAFE_MODE kill-switch path is exempt so halting is never blocked for any agent.
    if tool in ("write", "edit", "multiedit") and origin and origin in PATH_SCOPE:
        fp_check = ti.get("file_path") or ti.get("path") or ""
        rel_check = _relpath(str(fp_check))
        if rel_check != SAFE_MODE_REL:
            allowed_prefixes = PATH_SCOPE[origin]
            if not any(rel_check == pfx or rel_check.startswith(pfx) for pfx in allowed_prefixes):
                return DENY, (
                    f"path-scope violation: agent '{origin}' may not write "
                    f"'{rel_check}' (allowed prefixes: {', '.join(allowed_prefixes)})"
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
        # Owner-sessions-only launch: a restricted-spawn agent may be launched only from a
        # top-level/owner session (origin empty), not spawned by another sub-agent.
        if sub in OWNER_SPAWN_ONLY and origin:
            return DENY, (
                f"agent '{sub}' may be launched only from an owner/top-level session, "
                f"not spawned by sub-agent '{origin}' (SEC-0001 owner-spawn restriction)"
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
        # Exemption (B1, SEC-0001 2026-07-01): the owner's LIVE interactive session
        # (origin empty AND not the scheduled runner) may write Red paths -- the out-of-band
        # A1 channel for role-file edits. Sub-agents (origin set) and every runner-spawned
        # agent (RUNNER_CONTEXT=1) are still denied unconditionally.
        if _is_red(rel):
            if origin == "" and os.environ.get("RUNNER_CONTEXT") != "1":
                pass  # owner interactive session -- allow (falls through to ungoverned ALLOW)
            else:
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

        # shared/handoff/ writes: scan for secrets (hard-enforced, no shadow bypass).
        if _is_handoff(str(fp)):
            content = str(ti.get("content") or ti.get("new_string") or "")
            hit = _contains_secret(content)
            if hit:
                return DENY, (
                    f"secret pattern detected in handoff write ('{hit}...'); write blocked"
                )

        return ALLOW, f"ungoverned path '{rel}'"

    # Bash commands targeting the handoff path: scan command string for secrets.
    # Hard-enforced (see decide() below) -- no shadow bypass for credential leakage.
    if tool == "bash" and not os.environ.get("RUNNER_CONTEXT"):
        cmd = str(ti.get("command") or "")
        if _targets_handoff(cmd):
            hit = _contains_secret(cmd)
            if hit:
                return DENY, f"secret pattern in Bash targeting handoff ('{hit}...'); blocked"

    # Any other tool is not governed by this guard.
    return ALLOW, f"ungoverned tool '{tool}'"


def _mode() -> str:
    try:
        m = MODE_FILE.read_text(encoding="utf-8").strip().lower()
        return m if m in ("shadow", "enforce") else "shadow"
    except OSError:
        return "shadow"


def decide(event: dict, mode: str) -> tuple[str, str]:
    """Apply mode. In shadow, always allow but record what enforce would do.

    EXCEPTIONS (always hard-enforced regardless of GUARD_MODE):
    - Autonomous runner path (RUNNER_CONTEXT=1): no-Bash / no-spawn /
      readonly-no-write guarantees must bite immediately and unconditionally.
    - shared/handoff/ secret scan: credential leakage into shared/ is a
      hard security control, not a phase-in rule.
    """
    runner = os.environ.get("RUNNER_CONTEXT") == "1"
    try:
        decision, reason = evaluate(event)
    except Exception as exc:  # noqa: BLE001 -- fail-closed
        if mode == "enforce" or runner:
            return DENY, f"fail-closed: guard could not evaluate ({exc})"
        return ALLOW, f"[shadow] eval-error (would fail-closed): {exc}"
    handoff_block = decision == DENY and "handoff write" in reason
    if runner or mode == "enforce" or handoff_block:
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
            # origin/runner added (SEC-0001 2026-07-01) so the enforce-readiness check can
            # distinguish owner (origin empty, not runner) from sub-agents and runner agents.
            "origin": str(event.get("agent_type", "") or ""),
            "runner": os.environ.get("RUNNER_CONTEXT") == "1",
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
