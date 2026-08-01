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
# The cross-project drop folder above lives OUTSIDE the repo. The two-stage inbox screen
# (Rambo -> Eco) writes to an in-repo handoff dir as well, which the secret scan missed
# entirely until 2026-08-02 -- _is_handoff() resolved against the absolute path only, so a
# Write into shared/handoff/inbox-screened/ bypassed the hard-enforced credential check.
REPO_HANDOFF_PATH = ROOT / "shared" / "handoff"
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
    # AUD-009 F-S804 (owner A1 2026-07-26): oracle + yael -- PATH_SCOPE existed but
    # ALLOWED_AGENTS was missing (entries were dead code).
    "oracle", "yael",
    # AUD-009 F-S807 (owner A1 2026-07-26): all certified-live write-capable agents.
    # Yossi deliberately EXCLUDED pending Rambo B5 + C2/C3 (see guard-diff report Part 3).
    "sally", "alex", "mike", "jenny", "jack", "ella",
    "sami", "roman", "zvika", "designer", "meetingprep",
    # 2026-08-02 (owner A1): yossi was certified-live with A3 write duties but was never
    # added here or to PATH_SCOPE, so every write his role file promises would have broken
    # the moment GUARD_MODE flipped to enforce. Added with a tight PATH_SCOPE below; the
    # pending Rambo B5 review is recorded in the runner-spawn review artifact.
    "yossi",
}

# Agents that may ACT (above) but may NOT be spawned via the Agent/Task tool. RedTeam is OFF
# the permitted-spawn allowlist per its certification condition (until T-0020 C3).
SPAWN_DENY = {"redteam"}

# Agents that may be launched ONLY from an owner/top-level session, never spawned by another
# sub-agent (SEC-0001, owner directive 2026-06-30). The code-builders may ACT (PATH_SCOPE) and
# may be launched by the owner's own Claude Code session (origin empty), but an allow-listed
# sub-agent (e.g. anat) may NOT spawn them.
# 2026-08-02: the old comment here asserted "the runner cannot spawn anyone, so origin empty
# reliably means the owner's session". RUNNER_SPAWN_ALLOW makes that false, so the check below
# now tests RUNNER_CONTEXT/BRIDGE_CONTEXT explicitly instead of relying on origin alone.
OWNER_SPAWN_ONLY = {"gal", "shir", "adi", "oren", "noa"}

# --- Runner-path sub-agent dispatch (owner A1 2026-08-02) ----------------------
# Until now the scheduled runner was hard-denied from spawning ANY agent. The consequence was
# structural: Eco's 72h stale-sweep could only append "REACTIVATED" notes into board rows that
# no agent would ever read, so every task needing another agent stalled until the owner opened
# an interactive session (SHIR-007, T-0004, the T-0046/T-0049 gate reviews).
# The runner may now dispatch a small set of NON-Bash agents, under four hard limits:
#   1. allowlist only (below)          3. act cycles only (no dispatch on readonly)
#   2. depth 1 (no nested spawn)       4. capped per cycle (RUNNER_SPAWN_CAP)
# Bash-holders and code-builders stay owner-session-only; work needing them is queued in
# memory/dispatch-queue.md and drained at interactive session start.
# Oren is deliberately EXCLUDED despite holding no Bash: he is in OWNER_SPAWN_ONLY per the
# SEC-0001 code-builder restriction, and lifting that needs its own owner A1.
# Sync: company/governance/agent-tool-spawn-allowlist.md.
RUNNER_SPAWN_ALLOW = {"rambo", "eyal", "dalia", "anat"}
RUNNER_SPAWN_CAP = 3  # dispatches per runner cycle, all jobs combined
SPAWN_COUNT_REL = "memory/runner-spawn-count.json"
SPAWN_COUNT_FILE = ROOT / "memory" / "runner-spawn-count.json"

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
        # AUD-009 F-S805 (owner A1 2026-07-26):
        "company/policies/", "company/post-mortems/",
        "company/governance/quality-audit-log.md",
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
        # AUD-009 F-S806 (owner A1 2026-07-26): decisions-log reaches the append-only
        # check (both rules compose); company/legal/ is the legal-drafts home.
        "company/decisions/decisions-log.md", "company/legal/",
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
        "projects/", "memory/log.md", "memory/board.md",
        "company/decisions/decisions-log.md",
    ],
    "oracle": [
        "company/chronicle/", "memory/log.md", "memory/board.md",
    ],
    "yael": [
        "company/governance/file-index.md", "memory/wiki/file-index.md",
        "memory/log.md", "memory/board.md",
    ],
    # 2026-08-02 (owner A1): yossi is certified-live with A3 write duties (training material,
    # skills-register upkeep) but held no scope at all -- an enforce-mode break waiting to happen.
    "yossi": [
        "company/training/", "company/governance/skills-register.md",
        "memory/log.md", "memory/board.md",
    ],
    "gal": [
        "projects/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "shir": [
        "integrations/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    # BOARD-WRITE 2026-08-02 (owner A1): memory/board.md is the company's only working status
    # channel, yet 22 of 32 agents could not write it -- their status existed only inside an
    # ephemeral spawn transcript, which is a large part of why ownership looked invisible.
    # Every acting agent may now write its OWN rows (single-owner discipline stays behavioral;
    # the file-lock in integrations/file-lock/ handles concurrency).
    "adi": [
        "projects/delivery-saas/docs/qa/", "memory/log.md", "memory/board.md",
    ],
    "noa": [
        "projects/ai-patient-simulator/", "memory/log.md", "memory/board.md",
    ],
    "oren": [
        "projects/delivery-saas/docs/review/", "memory/log.md", "memory/board.md",
    ],
    "redteam": [
        "company/audits/redteam/", "memory/log.md", "memory/board.md",
    ],
    # AUD-009 F-S807 (owner A1 2026-07-26): Sales + CS group
    "sally": [
        "marketing/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "alex": [
        "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "mike": [
        "company/cs/", "memory/board.md", "memory/log.md",
        "company/decisions/decisions-log.md",
    ],
    "jenny": [
        "company/cs/tickets/", "memory/log.md", "memory/board.md",
    ],
    "jack": [
        "company/cs/accounts/", "memory/log.md", "memory/board.md",
    ],
    "ella": [
        "company/cs/training/", "memory/log.md", "memory/board.md",
    ],
    # AUD-009 F-S807: on-demand / SME agents
    "sami": [
        "projects/", "memory/log.md", "memory/board.md",
    ],
    "roman": [
        "projects/delivery-saas/docs/algorithms/", "memory/log.md", "memory/board.md",
    ],
    "zvika": [
        "projects/", "company/research/", "memory/log.md", "memory/board.md",
    ],
    # AUD-009 F-S807: Design
    "designer": [
        "projects/delivery-saas/docs/", "memory/log.md", "memory/board.md",
        # NOTE: marketing/ is GATED -- add only after AUD-011 activates (Rambo scan
        # delivered 2026-07-25 CLEAR-WITH-CONDITIONS C1: marketing/brand/ +
        # marketing/avatars/ only; Dalia A2 leg still pending -> separate guard edit).
    ],
    # AUD-009 F-S807: read-only agent; PATH_SCOPE is belt-and-suspenders (no Write tool)
    "meetingprep": [
        "memory/log.md",
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
    # Send whitelist -- owner-only editable (WS4, 2026-08-01). The autonomous-send guard
    # reads this file at runtime, so an off-owner edit would poison the recipient allowlist.
    "company/governance/email-send-whitelist.md",
}

# Section 5.3 -- append-only audit trail.
APPEND_ONLY = {
    "company/decisions/decisions-log.md",
    "memory/log.jsonl",
    "memory/log.md",
    "memory/agent-runs.jsonl",
    "memory/append-canary.md",  # C4 gate -- pure-append coverage target (Rambo 2026-08-01, owner A1 2026-08-02)
}

SAFE_MODE_REL = "memory/SAFE_MODE"

# --- Google account boundary (owner A1 2026-07-10) ---------------------------
# The project's workspace-mcp server (.mcp.json `google_workspace`) is pinned to
# the company account; its credential store is isolated (eco-creds). This rule is
# HARD-ENFORCED regardless of GUARD_MODE (like the handoff secret scan): a wrong
# account or a runner-path send is a security boundary, not a phase-in rule.
ECO_GOOGLE_ACCOUNT = "eco.synthetic.org@gmail.com"

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
# Guard-issued explicit approval: main() emits permissionDecision:"allow" JSON so the hook
# owns the grant instead of falling through to settings.json (which has no send_gmail_message
# allow entry and would auto-deny it on the runner). Only ever produced on the runner path for
# a fully-whitelisted send (WS4, 2026-08-01).
EXPLICIT_ALLOW = "explicit_allow"


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
        p = Path(file_path).resolve()
    except (ValueError, OSError):
        return False
    for base in (HANDOFF_PATH, REPO_HANDOFF_PATH):
        try:
            if p.is_relative_to(base.resolve()):
                return True
        except (ValueError, OSError):
            continue
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


def _runner_spawn_take_slot() -> "tuple[bool, str]":
    """Claim one runner-cycle dispatch slot. Returns (granted, detail).

    The guard is stateless per call, so the per-cycle budget lives in
    memory/runner-spawn-count.json keyed on the RUNNER_CYCLE_ID the runner stamps into the
    spawned agent's environment. A stale cycle_id resets the count. Every error path is
    fail-CLOSED: no cycle id, an unwritable counter, or a corrupt file all deny the dispatch
    rather than granting an uncounted one. A retried job reuses the same RUNNER_CYCLE_ID, so
    the retry cannot double the cycle's budget.
    """
    cycle = os.environ.get("RUNNER_CYCLE_ID", "")
    if not cycle:
        return False, "no RUNNER_CYCLE_ID in env (fail-closed)"
    try:
        data = json.loads(SPAWN_COUNT_FILE.read_text(encoding="utf-8"))
        count = int(data.get("count", 0)) if data.get("cycle_id") == cycle else 0
    except (OSError, ValueError, TypeError, AttributeError):
        count = 0
    if count >= RUNNER_SPAWN_CAP:
        return False, f"per-cycle dispatch cap {RUNNER_SPAWN_CAP} reached"
    try:
        SPAWN_COUNT_FILE.parent.mkdir(parents=True, exist_ok=True)
        SPAWN_COUNT_FILE.write_text(
            json.dumps({"cycle_id": cycle, "count": count + 1, "cap": RUNNER_SPAWN_CAP}),
            encoding="utf-8",
        )
    except OSError:
        return False, "dispatch counter unwritable (fail-closed)"
    return True, f"slot {count + 1}/{RUNNER_SPAWN_CAP}"


def _current_content(rel: str) -> str:
    try:
        return (ROOT / rel).read_text(encoding="utf-8")
    except (OSError, ValueError):
        return ""


# --- Autonomous send whitelist (WS4, 2026-08-01) -------------------------------
# send_gmail_message is auto-approved on the runner ONLY when every recipient is on this
# owner-only list. The file is in RED_EXACT, so only the owner's interactive session can edit
# it. Absent/unreadable = capability not activated = fail-closed (all sends denied).
SEND_WHITELIST_PATH = ROOT / "company" / "governance" / "email-send-whitelist.md"


def _load_send_whitelist() -> "set[str] | None":
    """Lowercased address set from the owner-only send whitelist, or None if the file is
    missing/unreadable (caller MUST deny -- fail-closed). Blank lines, comment lines (#...),
    and Markdown list markers (-/*) are stripped; only lines containing '@' count as an
    address. ValueError is caught so a corrupt-UTF-8 whitelist also fails closed."""
    try:
        text = SEND_WHITELIST_PATH.read_text(encoding="utf-8")
    except (OSError, ValueError):
        return None
    addrs: set[str] = set()
    for raw in text.splitlines():
        line = raw.strip().lstrip("-*").strip()
        if not line or line.startswith("#"):
            continue
        if "@" in line:
            addrs.add(line.lower())
    return addrs


def _parse_recipients(ti: dict) -> "list[str]":
    """Stripped (raw-case) recipient addresses from to/cc/bcc. Each field may be a str (plain
    or comma-separated) or a list of str. The whitelist match at the call site case-folds AND
    rejects non-ASCII, so a homoglyph cannot .lower() into a whitelisted ASCII address."""
    out: list[str] = []
    for field in ("to", "cc", "bcc"):
        val = ti.get(field)
        if val is None:
            continue
        items = val if isinstance(val, list) else str(val).split(",")
        for item in items:
            addr = str(item).strip()
            if addr:
                out.append(addr)
    return out


def evaluate(event: dict) -> tuple[str, str]:
    """Pure decision function. Returns (allow|deny, reason). Raises on bad input."""
    tool_raw = str(event.get("tool_name", ""))
    tool = tool_raw.lower()
    ti = event.get("tool_input") or {}
    if not isinstance(ti, dict):
        raise ValueError("tool_input is not an object")

    # --- Google account boundary (hard-enforced; see ECO_GOOGLE_ACCOUNT above) ---
    if tool_raw.startswith("mcp__google_workspace__"):
        short = tool_raw[len("mcp__google_workspace__"):]
        email = str(ti.get("user_google_email") or "").strip().lower()
        if short == "send_gmail_message":
            # Account pin first (independent of the whitelist outcome).
            if email and email != ECO_GOOGLE_ACCOUNT:
                return DENY, (
                    f"google boundary: google_workspace is pinned to {ECO_GOOGLE_ACCOUNT}; "
                    f"call attempted user_google_email='{email}'"
                )
            # Whitelist gate (WS4). Every DENY here starts with "google boundary" so it is
            # hard-enforced regardless of GUARD_MODE (see decide()).
            whitelist = _load_send_whitelist()
            if whitelist is None:
                return DENY, (
                    "google boundary: send_gmail_message denied -- send whitelist missing or "
                    "unreadable (fail-closed; capability not activated)"
                )
            recipients = _parse_recipients(ti)
            if not recipients:
                return DENY, "google boundary: send_gmail_message denied -- no recipients (WS4)"
            # A recipient counts as whitelisted only if it is ASCII AND its lowercase form is
            # on the list. The ASCII check is on the RAW address so a homoglyph cannot
            # .lower()/fold into a whitelisted ASCII string (adversary finding 2026-08-01).
            non_wl = [r for r in recipients if not (r.isascii() and r.lower() in whitelist)]
            runner_send = os.environ.get("RUNNER_CONTEXT") == "1"
            if non_wl:
                if runner_send:
                    return DENY, (
                        "google boundary: send_gmail_message denied on runner -- "
                        f"recipient(s) not on whitelist: {', '.join(non_wl)}"
                    )
                # Interactive: hand off to the owner prompt (owner may confirm any recipient).
                return ALLOW, (
                    "send_gmail_message: non-whitelisted recipient(s) -- interactive owner prompt"
                )
            # Every recipient whitelisted:
            if runner_send:
                # Autonomous path -> auto-approve via EXPLICIT_ALLOW (main() emits allow JSON).
                return EXPLICIT_ALLOW, (
                    "send_gmail_message: all recipients whitelisted -- auto-approved on runner (WS4)"
                )
            # Interactive whitelisted send still prompts the owner (owner directive 2026-08-01).
            return ALLOW, (
                "send_gmail_message: all recipients whitelisted -- interactive owner prompt (WS4)"
            )
        # AUD-013 F-S814 (owner A1 2026-07-26): forwarding rules are send-equivalent
        # blast radius; explicit hard deny mirrors send_gmail_message posture.
        if short == "manage_gmail_filter" and os.environ.get("RUNNER_CONTEXT") == "1":
            return DENY, "google boundary: manage_gmail_filter never available on the runner path"
        if email and email != ECO_GOOGLE_ACCOUNT:
            return DENY, (
                f"google boundary: google_workspace is pinned to {ECO_GOOGLE_ACCOUNT}; "
                f"call attempted user_google_email='{email}'"
            )
        return ALLOW, "google boundary: own-account call"

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
            # Bounded dispatch (owner A1 2026-08-02). These are deny-only pre-checks; a
            # candidate that clears them falls through to the general spawn block below,
            # where SAFE_MODE / SPAWN_DENY / ALLOWED_AGENTS / OWNER_SPAWN_ONLY still apply
            # and the per-cycle slot is taken LAST (a denied attempt never burns budget).
            if runner_mode != "act":
                return DENY, "runner dispatch: allowed only on act cycles"
            if str(event.get("agent_type", "")):
                return DENY, "runner dispatch: nested spawn (depth > 1) is disabled"
            sub_r = str(ti.get("subagent_type", "") or ti.get("agent_type", "")).lower()
            if sub_r not in RUNNER_SPAWN_ALLOW:
                return DENY, (
                    f"runner dispatch: '{sub_r or '(unspecified)'}' is not on "
                    f"RUNNER_SPAWN_ALLOW ({', '.join(sorted(RUNNER_SPAWN_ALLOW))}); "
                    f"queue it in memory/dispatch-queue.md for an interactive session"
                )
        # Readonly cycle = genuinely zero writes, regardless of path.
        if runner_mode == "readonly" and tool in ("write", "edit", "multiedit"):
            return DENY, "readonly runner cycle: all writes blocked"
        # act cycle falls through to the path rules below (Red paths / SAFE_MODE /
        # append-only). Own-scope is not hard-enforced here (path rules only).

    # --- Telegram bridge path (semi-autonomous, untrusted email input) ---
    # The bridge runs Eco on untrusted email content and legitimately needs NO Bash and NO
    # sub-agent spawning. Deny both: the Red-path Write protection does NOT cover Bash, so
    # without this a prompt-injected email could run an allow-listed Bash command
    # (e.g. python3 -c "...open(whitelist,'a')...") to poison the send whitelist or any Red
    # file. Mirrors the runner posture. BRIDGE_CONTEXT is hard-enforced in decide() regardless
    # of GUARD_MODE, so this bites in shadow too (adversary finding 2026-08-01).
    if os.environ.get("BRIDGE_CONTEXT") == "1":
        if tool == "bash":
            return DENY, "telegram bridge: Bash is disabled on the bridge path"
        if tool in ("task", "agent"):
            return DENY, "telegram bridge: sub-agent spawning is disabled on the bridge path"

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
        # top-level/owner session, not spawned by another sub-agent and not by an automated
        # path. Until 2026-08-02 this tested `origin` alone, which was safe only while the
        # runner could spawn nobody; RUNNER_SPAWN_ALLOW ends that invariant, so the automated
        # contexts are now named explicitly. Without this, a runner-path Eco (origin empty)
        # could dispatch Gal or Shir.
        if sub in OWNER_SPAWN_ONLY and (
            origin
            or os.environ.get("RUNNER_CONTEXT") == "1"
            or os.environ.get("BRIDGE_CONTEXT") == "1"
        ):
            launched_by = origin or (
                "the scheduled runner" if os.environ.get("RUNNER_CONTEXT") == "1"
                else "the Telegram bridge"
            )
            return DENY, (
                f"agent '{sub}' may be launched only from an owner/top-level session, "
                f"not spawned by {launched_by} (SEC-0001 owner-spawn restriction)"
            )
        # Runner dispatch: take the per-cycle slot only after every deny check has passed.
        if os.environ.get("RUNNER_CONTEXT") == "1":
            granted, detail = _runner_spawn_take_slot()
            if not granted:
                return DENY, (
                    f"runner dispatch: {detail}; queue the task in memory/dispatch-queue.md"
                )
            return ALLOW, f"runner dispatch: '{sub}' ({detail})"
        return ALLOW, f"allow-listed sub-agent '{sub}'"

    # --- File writes (Write / Edit / MultiEdit) ---
    if tool in ("write", "edit", "multiedit"):
        fp = ti.get("file_path") or ti.get("path") or ""
        rel = _relpath(str(fp))

        # Runner dispatch counter (2026-08-02): code-managed budget. An agent must never be
        # able to reset its own per-cycle dispatch allowance. Owner interactive sessions still
        # pass (origin empty, no RUNNER_CONTEXT) so the counter can be cleared by hand.
        if rel == SPAWN_COUNT_REL and (origin or os.environ.get("RUNNER_CONTEXT") == "1"):
            return DENY, (
                "runner dispatch counter is code-managed (runner.py/guard only); "
                "agents may not write it"
            )

        # SAFE_MODE flag protection (5.4) -- evaluated before generic rules.
        if rel == SAFE_MODE_REL:
            if tool in ("edit", "multiedit"):
                return DENY, "SAFE_MODE may not be edited (clearing is owner-only, 5.4)"
            content = str(ti.get("content", ""))
            if content.strip() == "":
                return DENY, "clearing/emptying SAFE_MODE is owner-only A1 (5.4)"
            return ALLOW, "setting SAFE_MODE flag"

        # Red paths (5.1) -- owner-only A1, blocked regardless of SAFE_MODE.
        # Exemption (B1, SEC-0001 2026-07-01; tightened 2026-08-01): the owner's LIVE
        # interactive Claude Code session -- origin empty AND neither the scheduled runner
        # (RUNNER_CONTEXT) NOR the Telegram bridge (BRIDGE_CONTEXT) -- may write Red paths,
        # the out-of-band A1 channel for role-file edits. The bridge spawns top-level Eco
        # (origin empty, RUNNER_CONTEXT unset) on untrusted email input, so it must be
        # excluded here or the owner-only Red set (incl. the send whitelist) is not actually
        # owner-only (adversary finding 2026-08-01). Sub-agents (origin set) and every
        # runner/bridge-spawned agent are denied unconditionally.
        if _is_red(rel):
            if (origin == ""
                    and os.environ.get("RUNNER_CONTEXT") != "1"
                    and os.environ.get("BRIDGE_CONTEXT") != "1"):
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
    # BRIDGE_CONTEXT marks a Telegram-bridge-spawned Claude (untrusted email input). Like the
    # runner, it is hard-enforced regardless of GUARD_MODE -- a semi-autonomous path must not
    # rely on shadow leniency (adversary finding 2026-08-01).
    bridge = os.environ.get("BRIDGE_CONTEXT") == "1"
    try:
        decision, reason = evaluate(event)
    except Exception as exc:  # noqa: BLE001 -- fail-closed
        if mode == "enforce" or runner or bridge:
            return DENY, f"fail-closed: guard could not evaluate ({exc})"
        return ALLOW, f"[shadow] eval-error (would fail-closed): {exc}"
    handoff_block = decision == DENY and "handoff write" in reason
    google_block = decision == DENY and reason.startswith("google boundary")
    # Red-path denials are a hard owner-only-A1 boundary, not a phase-in rule: enforce them
    # regardless of GUARD_MODE (like the google/handoff boundaries). Without this a bridge or
    # sub-agent Red-path DENY would degrade to would-DENY -> ALLOW while the guard is still in
    # shadow, leaving the send whitelist writable off the owner session (adversary 2026-08-01).
    red_block = decision == DENY and reason.startswith("Red path")
    if runner or bridge or mode == "enforce" or handoff_block or google_block or red_block:
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
            # 2026-08-02: joins a guard decision to the runner cycle that produced it, so a
            # dispatch can be traced from agent-runs.jsonl into agent-guard.log.
            "cycle_id": os.environ.get("RUNNER_CYCLE_ID") or None,
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

    # Guard-issued explicit approval (a fully-whitelisted send on the runner): emit an allow
    # decision so the hook owns the grant instead of deferring to settings.json, which would
    # auto-deny send_gmail_message on the non-interactive path.
    if decision == EXPLICIT_ALLOW:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
            }
        }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
