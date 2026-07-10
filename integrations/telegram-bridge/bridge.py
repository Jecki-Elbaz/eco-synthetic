"""Eco-Synthetic Telegram bridge -- OAuth via Claude Max subscription.

Authentication model
--------------------
Calls Claude through the `claude` CLI, which reads CLAUDE_CODE_OAUTH_TOKEN
and bills your Claude Max subscription -- NOT the paid API.

This script REFUSES TO START if ANTHROPIC_API_KEY is present in the
environment: that key would silently route every call through the paid API
instead of your subscription, with no warning from Claude itself.

Headless setup (one-time, on any machine that will run the bridge):

    claude setup-token          # opens OAuth in browser, prints a long-lived token
    setx CLAUDE_CODE_OAUTH_TOKEN "<token>"   # Windows (permanent, current user)
    # -- or add to .env (never commit .env):
    #   CLAUDE_CODE_OAUTH_TOKEN=<token>

Async ack + two-message pattern (SHIR-001, 2026-06-18)
-------------------------------------------------------
Every inbound message now gets an immediate ack ("On it, Jecki...") sent
before the Claude subprocess starts. When Claude replies, that reply is
sent as a separate second message. This eliminates the user-visible gap
between sending a message and seeing any feedback, regardless of how long
Claude takes.

See DEPLOY.md in this folder for architecture notes, timeout rationale,
and the streaming / partial-delivery evaluation.

TODO -- CUSTOMER-FACING AUTH SWITCH
------------------------------------
OWNER_ONLY_MODE = True means the bots serve jecki only via personal OAuth.

When bots are ever exposed to external customers, you MUST:
  1. Set OWNER_ONLY_MODE = False
  2. Remove CLAUDE_CODE_OAUTH_TOKEN; provision a scoped Console API key
  3. Set ANTHROPIC_API_KEY to that key (and remove the guard below)
  4. Switch call_claude_cli() to use the anthropic Python SDK
  5. Review Anthropic usage-policy terms -- personal OAuth is for internal use only
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# ── Config flag ───────────────────────────────────────────────────────────────
OWNER_ONLY_MODE = True

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[2]
AGENTS_DIR = ROOT / ".claude" / "agents"
MEMORY_DIR = ROOT / "memory"
CHATS_DIR = MEMORY_DIR / "chats"
BOARD_FILE = MEMORY_DIR / "board.md"
SAFE_MODE_FILE = MEMORY_DIR / "SAFE_MODE"  # kill switch (runner + guard read this)
LOG_FILE = MEMORY_DIR / "log.jsonl"

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
    stream=sys.stdout,
)
log = logging.getLogger("bridge")
# SHIR-002: suppress httpx INFO logs -- they include the bot token in request URLs.
logging.getLogger("httpx").setLevel(logging.WARNING)

# ── Load .env before guard ────────────────────────────────────────────────────
load_dotenv(ROOT / ".env")

# ── Guard: refuse if ANTHROPIC_API_KEY is present ────────────────────────────
if "ANTHROPIC_API_KEY" in os.environ:
    print(
        "\nERROR: ANTHROPIC_API_KEY is set in your environment (or .env).\n"
        "\n"
        "This bridge authenticates via Claude Max subscription using\n"
        "CLAUDE_CODE_OAUTH_TOKEN. Running with ANTHROPIC_API_KEY would\n"
        "silently bill API rates on every message instead of your subscription.\n"
        "\n"
        "Fix: remove ANTHROPIC_API_KEY from your environment and .env.\n"
        "See OWNER_ONLY_MODE in this file for the customer-facing migration path.\n",
        file=sys.stderr,
    )
    sys.exit(1)

# ── Telegram tokens ───────────────────────────────────────────────────────────
ECO_TOKEN: str = os.environ["ECO_TELEGRAM_BOT_TOKEN"]

# ── Models ────────────────────────────────────────────────────────────────────
ECO_DEFAULT_MODEL = "claude-sonnet-4-6"
ECO_ESCALATED_MODEL = "claude-opus-4-8"

# ── Limits ────────────────────────────────────────────────────────────────────
MAX_HISTORY_MESSAGES = 20
MAX_HISTORY_CHARS = 40_000
# SHIR-001 (2026-06-18): raised from 120s to 300s.
# Rationale: Opus on complex tasks (long context, multi-tool) regularly takes
# 90-180s. The old 120s caused spurious timeout errors. 300s gives a safe
# ceiling without risking runaway processes. The async-ack pattern means
# jecki sees "On it..." immediately, so the longer timeout is invisible UX-wise.
# This bridge uses long-polling (not webhook) so there is no Telegram server
# timeout imposed on the response window.
CLAUDE_TIMEOUT = 300

# Ack message sent immediately on every inbound user message, before Claude
# is invoked. Keeps jecki from staring at a blank chat while Claude works.
ACK_MESSAGE = "On it, Jecki..."


# ── Claude CLI path ───────────────────────────────────────────────────────────

def _find_claude() -> str:
    for name in ("claude", "claude.cmd", "claude.ps1"):
        path = shutil.which(name)
        if path:
            return path
    appdata = os.environ.get("APPDATA", "")
    if appdata:
        candidate = Path(appdata) / "npm" / "claude.cmd"
        if candidate.exists():
            return str(candidate)
    print("ERROR: 'claude' CLI not found. Install Claude Code first.", file=sys.stderr)
    sys.exit(1)


CLAUDE_CMD = _find_claude()


# ── Per-agent read access (per company/governance/access-matrix.md) ───────────
#
# These rules are enforced through the bridge context injected into each
# agent's system prompt. The --allowedTools Read flag grants filesystem Read
# at the CLI level; the context block tells the agent what it is authorised
# to read per its role.

_AGENT_ACCESS: dict[str, list[str]] = {
    "eco": [
        "memory/board.md — full board (CEO oversees all tasks)",
        "memory/log.md and memory/log.jsonl — activity and event logs",
        "memory/wiki/ — company wiki (read/write, A3 autonomous updates)",
        "company/ — any file (constitution, roster, decisions, governance)",
        "company/hr/interviews/ — certified HR interview records",
        "company/hr/interviews/_staging/ — working area for in-progress interviews",
        ".claude/agents/*.md — role files (read-only; changes are A1)",
        "projects/ — any project folder (read)",
        "integrations/ — bridge and future integrations",
    ],
}

# Google Workspace tools for Eco's OWN account (eco.synthetic.org@gmail.com),
# owner A1 2026-07-10: FULL access EXCEPT SEND. The .mcp.json server is pinned to
# the isolated eco-creds credential store; guard.py additionally pins every call's
# user_google_email to the eco account. send_gmail_message is NEVER granted here
# (per-action owner approval, interactive CLI only). manage_gmail_filter and Drive
# sharing/permission tools are also held back from the autonomous surface
# (mail-forwarding rules and file sharing are send-equivalents).
_ECO_GOOGLE_TOOLS: list[str] = [
    "mcp__google_workspace__search_gmail_messages",
    "mcp__google_workspace__get_gmail_message_content",
    "mcp__google_workspace__get_gmail_messages_content_batch",
    "mcp__google_workspace__get_gmail_thread_content",
    "mcp__google_workspace__get_gmail_threads_content_batch",
    "mcp__google_workspace__get_gmail_attachment_content",
    "mcp__google_workspace__draft_gmail_message",
    "mcp__google_workspace__list_gmail_labels",
    "mcp__google_workspace__manage_gmail_label",
    "mcp__google_workspace__modify_gmail_message_labels",
    "mcp__google_workspace__batch_modify_gmail_message_labels",
    "mcp__google_workspace__list_calendars",
    "mcp__google_workspace__get_events",
    "mcp__google_workspace__query_freebusy",
    "mcp__google_workspace__manage_event",
    "mcp__google_workspace__create_calendar",
    "mcp__google_workspace__search_drive_files",
    "mcp__google_workspace__get_drive_file_content",
    "mcp__google_workspace__list_drive_items",
    "mcp__google_workspace__get_drive_file_download_url",
    "mcp__google_workspace__create_drive_file",
    "mcp__google_workspace__create_drive_folder",
    "mcp__google_workspace__update_drive_file",
    "mcp__google_workspace__copy_drive_file",
]

# Tools granted to each agent at the CLI level (--allowedTools).
# Must match the tools: line in the agent's .claude/agents/*.md frontmatter,
# scoped to what is safe to grant in a Telegram session.
_AGENT_TOOLS: dict[str, list[str]] = {
    "eco": ["Read", "Write", "Edit"] + _ECO_GOOGLE_TOOLS,
}


# ── Owner chat registry (populated on first /start per bot) ──────────────────
# Used by the scheduled wake-up task to send proactive check-ins to jecki.

_owner_chat: dict[str, int | None] = {"eco": None}


def _register_owner_chat(bot_name: str, chat_id: int) -> None:
    if _owner_chat.get(bot_name) is None:
        _owner_chat[bot_name] = chat_id
        log.info("Owner chat registered for %s: %d", bot_name, chat_id)


# ── Frontmatter stripper ──────────────────────────────────────────────────────

def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    closing = text.find("\n---", 3)
    if closing == -1:
        return text
    return text[closing + 4:].lstrip("\n")


# ── Bridge context (per-agent, injected into system prompt) ───────────────────

# Always-on emergency-halt directive, injected for any agent that has the Write tool.
# Pairs with the deterministic /halt command and the safe-mode skill
# (.claude/skills/safe-mode/SKILL.md). Hebrew trigger words are intentionally literal.
_SAFE_MODE_DIRECTIVE = """

## EMERGENCY HALT -- SAFE_MODE kill switch (highest priority)

If the owner (jecki) tells you to halt, stop, freeze, pause, or kill the runner / the
agents / autonomous activity -- in English or Hebrew (e.g. "SAFE_MODE", "halt", "kill
switch", "stop the runner", "freeze everything", "עצור",
"הקפא", "כיבוי חירום")
-- treat it as an emergency and act immediately, before anything else:

1. Use the Write tool (NOT Edit) on path `memory/SAFE_MODE` with NON-EMPTY ASCII content,
   e.g. one line: "HALT set by Eco on owner request via Telegram. Reason: <reason>." This
   is the only form the guard allows -- Edit and empty writes are denied by design.
2. Confirm to the owner ONLY after the Write tool returns success (never say done
   otherwise). Then state: the runner will skip its next cycle and autonomous writes are
   frozen; to resume, the owner deletes memory/SAFE_MODE or runs /resume. Resume is
   owner-only -- you must NOT clear the flag yourself.
3. The fastest path is the deterministic /halt command (pure code, no model). Mention it
   if your Write ever fails.

Only the owner may trigger this (red line 8). Full procedure: the safe-mode skill.
"""


def _build_bridge_context(agent_name: str) -> str:
    access = _AGENT_ACCESS.get(agent_name.lower(), ["memory/board.md"])
    tools = _AGENT_TOOLS.get(agent_name.lower(), ["Read"])
    access_lines = "\n".join(f"  - {p}" for p in access)
    tools_str = ", ".join(tools)
    unavailable = [t for t in ["Write", "Edit", "Bash", "WebSearch", "WebFetch"] if t not in tools]
    unavailable_str = ", ".join(unavailable) if unavailable else "none"
    halt_block = _SAFE_MODE_DIRECTIVE if "Write" in tools else ""
    return f"""
---

## Bridge context — read before every response

You are responding through the Eco-Synthetic Telegram bridge. This session has hard
limits that override any assumption from your role file.

**Available tools:** {tools_str}.
**Paths you are authorised to access in this session:**
{access_lines}

**Not available in this session:** {unavailable_str}, Agent tool, inter-agent messaging.
You cannot contact other agents. You cannot make external network calls.

**Non-negotiable rule (constitution §16 + CLAUDE.md red line 10):**
Never state, imply, or confirm that you have done something you have not done.
Never pretend to contact an agent, write a file, complete a task, or say "done"
unless you used a tool and it succeeded.

If a request needs a capability you lack here, surface it plainly:
- CORRECT: "I can't reach Eco from this session — no Agent tool. You can relay this yourself."
- CORRECT: "I can read memory/board.md but can't update it — no Write tool here."
- WRONG: "I've told Eco." — if no tool was used
- WRONG: "Done." / "Noted." — if no file was written

Accuracy over comfort, always. If uncertain: try, report the result honestly.
{halt_block}"""


def load_agent_prompt(agent_name: str) -> str:
    path = AGENTS_DIR / f"{agent_name}.md"
    base = _strip_frontmatter(path.read_text(encoding="utf-8"))
    return base + _build_bridge_context(agent_name)


# ── Board task loader ─────────────────────────────────────────────────────────

def load_agent_tasks(agent_display: str) -> list[dict]:
    """Return open tasks for agent_display (e.g. 'Eco') from memory/board.md."""
    if not BOARD_FILE.exists():
        return []
    tasks: list[dict] = []
    header_seen = False
    for line in BOARD_FILE.read_text(encoding="utf-8").splitlines():
        if "|" not in line:
            header_seen = False
            continue
        parts = [p.strip() for p in line.split("|")]
        parts = [p for p in parts if p]
        if not parts:
            continue
        if parts[0].lower() == "task_id":
            header_seen = True
            continue
        if re.match(r"^-+$", parts[0]):   # separator row
            continue
        if not header_seen:
            continue
        if len(parts) < 3:
            continue
        task_id, task_agent, status = parts[0], parts[1], parts[2]
        if task_agent.lower() == agent_display.lower() and status.lower() == "open":
            tasks.append({
                "task_id": task_id,
                "objective": parts[3] if len(parts) > 3 else "",
                "priority": parts[4] if len(parts) > 4 else "",
                "deadline": parts[5] if len(parts) > 5 else "",
                "notes":    parts[6] if len(parts) > 6 else "",
            })
    return tasks


def _format_tasks(tasks: list[dict]) -> str:
    if not tasks:
        return "(no open tasks found in memory/board.md)"
    lines = []
    for t in tasks:
        line = f"- {t['task_id']}: {t['objective']}"
        if t["priority"]:
            line += f" [{t['priority']}]"
        if t["deadline"]:
            line += f" — due: {t['deadline']}"
        if t["notes"]:
            line += f" | {t['notes']}"
        lines.append(line)
    return "\n".join(lines)


# ── History persistence ───────────────────────────────────────────────────────

def _chat_file(bot_name: str, chat_id: int) -> Path:
    d = CHATS_DIR / bot_name
    d.mkdir(parents=True, exist_ok=True)
    return d / f"{chat_id}.json"


def load_history(bot_name: str, chat_id: int) -> list[dict]:
    f = _chat_file(bot_name, chat_id)
    if not f.exists():
        return []
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def save_history(bot_name: str, chat_id: int, history: list[dict]) -> None:
    _chat_file(bot_name, chat_id).write_text(
        json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def trim_history(history: list[dict]) -> list[dict]:
    while len(history) > MAX_HISTORY_MESSAGES:
        history = history[2:]
    total = sum(len(m.get("content", "")) for m in history)
    while total > MAX_HISTORY_CHARS and len(history) >= 2:
        dropped, history = history[:2], history[2:]
        total -= sum(len(m.get("content", "")) for m in dropped)
    return history


# ── Event log ─────────────────────────────────────────────────────────────────

def append_log(
    agent: str,
    chat_id: int,
    action: str,
    model: str,
    tokens_in: int | None,
    tokens_out: int | None,
) -> None:
    entry: dict[str, Any] = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": agent,
        "chat_id": chat_id,
        "action": action,
        "model": model,
    }
    if tokens_in is not None:
        entry["tokens_in"] = tokens_in
    if tokens_out is not None:
        entry["tokens_out"] = tokens_out
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry) + "\n")


# ── Escalation ────────────────────────────────────────────────────────────────

_ECO_HARD = re.compile(
    r"\b(decide|decision|approve|approval|strategy|legal|contract|budget|"
    r"hire|fire|terminate|restructure|acquire|partnership|milestone|A1|gate)\b",
    re.IGNORECASE,
)
def choose_model(bot_name: str, text: str) -> str:
    if _ECO_HARD.search(text) or len(text) > 500:
        log.info("Eco: escalating to %s", ECO_ESCALATED_MODEL)
        return ECO_ESCALATED_MODEL
    return ECO_DEFAULT_MODEL


# ── Claude CLI call ───────────────────────────────────────────────────────────

def _build_prompt(history: list[dict]) -> str:
    if len(history) == 1:
        return history[0]["content"]
    prior, current = history[:-1], history[-1]["content"]
    lines = ["<conversation_history>"]
    for msg in prior:
        tag = "user" if msg["role"] == "user" else "assistant"
        lines.append(f"<{tag}>{msg['content']}</{tag}>")
    lines.append("</conversation_history>")
    lines.append(f"\nCurrent message: {current}")
    return "\n".join(lines)


_RETRY_DELAYS = (1, 2, 4, 8)  # exponential backoff delays in seconds (4 retries, 5 attempts)

# ── Bridge health tracking ─────────────────────────────────────────────────────

_bridge_start_ts: datetime = datetime.now(timezone.utc)
_consecutive_failures: dict[str, int] = {}
_last_success_ts: dict[str, datetime | None] = {}


def _fmt_duration(td: timedelta) -> str:
    total = int(td.total_seconds())
    if total < 60:
        return f"{total}s"
    if total < 3600:
        return f"{total // 60}m {total % 60}s"
    h, m = total // 3600, (total % 3600) // 60
    return f"{h}h {m}m"


def call_claude_cli(
    system: str, history: list[dict], model: str, allowed_tools: list[str] | None = None
) -> tuple[str, int | None, int | None]:
    import time as _time
    import tempfile
    import os as _os
    tools_str = ",".join(allowed_tools) if allowed_tools else "Read"
    # Write system prompt to a temp file to avoid Windows command-line length limits.
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as tf:
        tf.write(system)
        system_prompt_file = tf.name
    try:
        cmd = [
            CLAUDE_CMD,
            "--print",
            "--system-prompt-file", system_prompt_file,
            "--model", model,
            "--output-format", "json",
            "--allowedTools", tools_str,
        ]
        prompt_bytes = _build_prompt(history).encode("utf-8")
        last_exc: Exception = RuntimeError("no attempts made")
        max_attempts = len(_RETRY_DELAYS) + 1  # 5 total attempts
        for attempt in range(max_attempts):
            try:
                # Pass input as bytes to avoid Windows cp1252 encoding issues on stdin.
                result = subprocess.run(
                    cmd,
                    input=prompt_bytes,
                    capture_output=True,
                    cwd=str(ROOT),
                    timeout=CLAUDE_TIMEOUT,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                last_exc = RuntimeError(f"timeout:{CLAUDE_TIMEOUT}s")
                if attempt < len(_RETRY_DELAYS):
                    delay = _RETRY_DELAYS[attempt]
                    log.warning(
                        "claude CLI timed out (attempt %d/%d), retrying in %ds...",
                        attempt + 1, max_attempts, delay,
                    )
                    _time.sleep(delay)
                    continue
                raise last_exc
            except FileNotFoundError:
                raise RuntimeError("notfound:claude not installed or not in PATH")

            stdout = result.stdout.decode("utf-8", errors="replace")
            stderr = result.stderr.decode("utf-8", errors="replace")

            if result.returncode != 0:
                stderr_detail = stderr[:200].strip()
                last_exc = RuntimeError(
                    f"exit{result.returncode}:{stderr_detail}"
                )
                # Auth failure: exit 1 with no stderr output is unrecoverable —
                # the CLI fails silently when CLAUDE_CODE_OAUTH_TOKEN is expired.
                # CLI not found (127) is also unrecoverable. Skip all retries.
                if (result.returncode == 1 and not stderr_detail) or result.returncode == 127:
                    log.error(
                        "claude CLI unrecoverable exit %d — skipping retries",
                        result.returncode,
                    )
                    raise last_exc
                if attempt < len(_RETRY_DELAYS):
                    delay = _RETRY_DELAYS[attempt]
                    log.warning(
                        "claude CLI exited %d (attempt %d/%d), retrying in %ds...",
                        result.returncode, attempt + 1, max_attempts, delay,
                    )
                    _time.sleep(delay)
                    continue
                raise last_exc

            try:
                data = json.loads(stdout)
                reply: str = data.get("result") or data.get("content") or stdout.strip()
                usage = data.get("usage", {})
                tokens_in: int | None = usage.get("input_tokens")
                tokens_out: int | None = usage.get("output_tokens")
            except (json.JSONDecodeError, AttributeError):
                reply = stdout.strip()
                tokens_in = tokens_out = None

            return reply, tokens_in, tokens_out

        raise last_exc
    finally:
        _os.unlink(system_prompt_file)


# ── Telegram handler factory ──────────────────────────────────────────────────

_TG_MAX_CHARS = 4096


async def _send_long(send_fn, text: str) -> None:
    """Send text, splitting into chunks if it exceeds Telegram's 4096-char limit."""
    if len(text) <= _TG_MAX_CHARS:
        await send_fn(text)
        return
    lines = text.splitlines(keepends=True)
    chunk = ""
    for line in lines:
        if len(chunk) + len(line) > _TG_MAX_CHARS:
            if chunk:
                await send_fn(chunk.rstrip())
            chunk = line
        else:
            chunk += line
    if chunk:
        await send_fn(chunk.rstrip())


def make_handlers(bot_name: str, system_prompt: str):
    """Return (on_start, on_tasks, on_message) handlers for the given bot."""

    agent_display = bot_name.capitalize()
    default_model = ECO_DEFAULT_MODEL

    async def _typing_loop(chat_id: int, bot) -> None:
        """Send 'typing' action every 4s so the user sees activity while Claude works."""
        try:
            while True:
                await bot.send_chat_action(chat_id=chat_id, action="typing")
                await asyncio.sleep(4)
        except asyncio.CancelledError:
            pass

    async def _call_and_reply(
        update: Update,
        history: list[dict],
        model: str,
        action: str,
        send_ack: bool = True,
    ) -> None:
        """Invoke Claude and deliver its response as a Telegram message.

        Pattern (SHIR-001):
          1. If send_ack is True, immediately send ACK_MESSAGE so jecki sees
             feedback before any Claude latency begins.
          2. Start the typing indicator loop (keeps the "typing..." bubble alive
             every 4s for the full duration of the Claude call).
          3. Run the blocking claude CLI call in a thread-pool executor so the
             asyncio event loop stays responsive.
          4. Send Claude's response as a second Telegram message (or send an
             error message if the CLI call fails).

        send_ack=False is used for scheduled wake-ups and /start, where sending
        "On it, Jecki..." would be jarring -- those flows are bot-initiated, not
        triggered by a user message.
        """
        chat_id = update.effective_chat.id  # type: ignore[union-attr]

        # Step 1: immediate ack -- send before any blocking work begins.
        if send_ack:
            try:
                await update.message.reply_text(ACK_MESSAGE)  # type: ignore[union-attr]
            except Exception as ack_exc:
                # Non-fatal: log and continue. The Claude call is more important.
                log.warning("Failed to send ack message (%s/%s): %s", bot_name, action, ack_exc)

        # Step 2: typing indicator loop.
        loop = asyncio.get_running_loop()
        typing_task = asyncio.create_task(
            _typing_loop(chat_id, update.get_bot())
        )

        # Step 3: blocking Claude call, offloaded to thread pool.
        try:
            agent_tools = _AGENT_TOOLS.get(bot_name, ["Read"])
            reply, tokens_in, tokens_out = await loop.run_in_executor(
                None,
                lambda: call_claude_cli(system_prompt, history, model, agent_tools),
            )
        except Exception as exc:
            typing_task.cancel()
            err = str(exc)
            fail_count = _consecutive_failures.get(bot_name, 0) + 1
            _consecutive_failures[bot_name] = fail_count
            log.error("Claude CLI error (%s/%s) [failure #%d]: %s", bot_name, action, fail_count, err)
            append_log(agent_display, chat_id, f"error:{action}", "none", None, None)
            # exit1: with empty detail = claude CLI failed silently, almost
            # always an expired CLAUDE_CODE_OAUTH_TOKEN.
            _is_silent_exit1 = re.match(r"exit1:?\s*$", err) is not None
            _has_auth_hint = re.search(
                r"\b(auth|token|login|credential|unauthori[sz]ed|forbidden|expired)\b",
                err, re.IGNORECASE,
            ) is not None
            _fail_suffix = f"\n(Failure #{fail_count} in a row — /status for bridge health)" if fail_count >= 3 else ""
            if "timeout" in err.lower():
                user_msg = (
                    f"⚠️ [{agent_display}] Timed out after {CLAUDE_TIMEOUT}s "
                    f"({len(_RETRY_DELAYS) + 1} attempts exhausted).\n"
                    f"Your message may be too long, or the model is under heavy load.\n"
                    f"Please resend — shorter messages process faster."
                    + _fail_suffix
                )
            elif "notfound" in err.lower() or "not found" in err.lower():
                user_msg = (
                    f"❌ [{agent_display}] Claude CLI not found on PATH.\n"
                    f"The bridge process needs a restart with the correct venv active.\n"
                    f"On the bridge machine: activate the venv, then run: python bridge.py"
                    + _fail_suffix
                )
            elif _is_silent_exit1 or _has_auth_hint:
                user_msg = (
                    f"\U0001f512 [{agent_display}] Auth error — Claude CLI rejected the "
                    f"request silently (exit 1, no detail).\n\n"
                    f"Your OAuth token has almost certainly expired. Fix:\n"
                    f"1. On the bridge machine run: claude setup-token\n"
                    f"2. Copy the new token into .env as CLAUDE_CODE_OAUTH_TOKEN\n"
                    f"3. Restart bridge.py"
                    + _fail_suffix
                )
            else:
                user_msg = (
                    f"❌ [{agent_display}] Unexpected error after all retries:\n"
                    f"{err[:200]}\n\n"
                    f"Check the bridge console log for the full trace. Please resend."
                    + _fail_suffix
                )
            await update.message.reply_text(user_msg)  # type: ignore[union-attr]
            return
        finally:
            typing_task.cancel()

        # Step 4: deliver Claude's response as a second message.
        _consecutive_failures[bot_name] = 0
        _last_success_ts[bot_name] = datetime.now(timezone.utc)
        history.append({"role": "assistant", "content": reply})
        save_history(bot_name, chat_id, history)
        append_log(agent_display, chat_id, action, model, tokens_in, tokens_out)
        await _send_long(update.message.reply_text, reply)  # type: ignore[union-attr]

    async def on_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_chat is None or update.message is None:
            return
        chat_id = update.effective_chat.id
        _register_owner_chat(bot_name, chat_id)
        save_history(bot_name, chat_id, [])
        append_log(agent_display, chat_id, "start", "none", None, None)

        tasks = load_agent_tasks(agent_display)
        task_block = _format_tasks(tasks)
        trigger = (
            f"jecki just opened a new session with you.\n\n"
            f"Please greet jecki briefly and warmly as yourself.\n\n"
            f"Then proactively present your current open tasks. "
            f"The board (memory/board.md) currently shows these open tasks assigned to you:\n\n"
            f"{task_block}\n\n"
            f"For each task give a one-line description of what it involves and what completing "
            f"it would require. If a task needs a tool or permission you don't have in this "
            f"session, say so. Then ask jecki which task to begin."
        )
        history: list[dict] = [{"role": "user", "content": trigger}]
        # No ack for /start: the bot initiates this exchange, not the user.
        await _call_and_reply(update, history, default_model, "start_session", send_ack=False)

    async def on_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_chat is None or update.message is None:
            return
        chat_id = update.effective_chat.id

        tasks = load_agent_tasks(agent_display)
        task_block = _format_tasks(tasks)
        trigger = (
            f"jecki ran /tasks.\n\n"
            f"Please present your current open tasks from memory/board.md. "
            f"The board currently shows:\n\n"
            f"{task_block}\n\n"
            f"For each task: briefly explain what it involves, what completing it requires, "
            f"and whether you can work on it in this session (Read-only tools). "
            f"Surface any missing tool or permission rather than skipping it. "
            f"Then ask jecki which task to begin."
        )
        history = load_history(bot_name, chat_id)
        history.append({"role": "user", "content": trigger})
        history = trim_history(history)
        # /tasks is a user-initiated command: send ack.
        await _call_and_reply(update, history, default_model, "tasks_cmd", send_ack=True)

    async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if (
            update.effective_chat is None
            or update.message is None
            or not update.message.text
        ):
            return
        chat_id = update.effective_chat.id
        user_text = update.message.text
        history = load_history(bot_name, chat_id)
        history.append({"role": "user", "content": user_text})
        history = trim_history(history)
        model = choose_model(bot_name, user_text)
        # Regular user message: always send ack first.
        await _call_and_reply(update, history, model, "message", send_ack=True)

    async def on_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if update.effective_chat is None or update.message is None:
            return
        now = datetime.now(timezone.utc)
        uptime = _fmt_duration(now - _bridge_start_ts)
        failures = _consecutive_failures.get(bot_name, 0)
        last_ok = _last_success_ts.get(bot_name)
        if last_ok:
            since_ok = f"{_fmt_duration(now - last_ok)} ago"
        else:
            since_ok = "none this session"
        fail_line = f"Consecutive failures: {failures}"
        if failures >= 3:
            fail_line += " ⚠️  — auth likely expired"
        # Surface the kill-switch state so the owner can see at a glance whether
        # autonomy is halted. Read-only check; mirrors runner.py/guard.py logic.
        try:
            halted = (
                SAFE_MODE_FILE.exists()
                and SAFE_MODE_FILE.read_text(encoding="utf-8").strip() != ""
            )
        except Exception:  # noqa: BLE001 -- never let status reporting crash
            halted = None
        if halted is True:
            autonomy_line = "Autonomy: 🛑 HALTED (SAFE_MODE set — /resume to re-arm)"
        elif halted is False:
            autonomy_line = "Autonomy: ✅ armed (SAFE_MODE clear — /halt to freeze)"
        else:
            autonomy_line = "Autonomy: ⚠️ unknown (could not read SAFE_MODE flag)"
        lines = [
            f"[{agent_display}] Bridge status",
            f"Uptime: {uptime}",
            f"Last success: {since_ok}",
            fail_line,
            autonomy_line,
            f"Model (default): {ECO_DEFAULT_MODEL}",
            f"Model (escalated): {ECO_ESCALATED_MODEL}",
        ]
        if failures >= 3:
            lines.append("\nFix: claude setup-token → update .env → restart bridge.py")
        await update.message.reply_text("\n".join(lines))

    return on_start, on_tasks, on_message, on_status


# ── Scheduled wake-up ─────────────────────────────────────────────────────────
# Cadence approved A1 (jecki, 2026-06-12). See company/governance/schedules.md.

WAKEUP_INTERVAL = 7200  # 2 hours in seconds


async def _wakeup_task(
    bot_name: str,
    app: Application,
    system_prompt: str,
) -> None:
    """Send a proactive 2h check-in from the agent to jecki via Telegram."""
    await asyncio.sleep(WAKEUP_INTERVAL)
    while True:
        chat_id = _owner_chat.get(bot_name)
        if chat_id is not None:
            agent_display = bot_name.capitalize()
            tasks = load_agent_tasks(agent_display)
            task_block = _format_tasks(tasks)
            model = ECO_DEFAULT_MODEL
            trigger = (
                "[Scheduled 2h check-in]\n\n"
                f"Your open tasks from memory/board.md:\n\n{task_block}\n\n"
                "Write a brief check-in (max 5 lines): which tasks are still open, "
                "what you can progress now with Read-only access, and what needs "
                "jecki to unblock. Plain ASCII; a light emoji is fine if it fits the tone."
            )
            loop = asyncio.get_running_loop()
            try:
                agent_tools = _AGENT_TOOLS.get(bot_name, ["Read"])
                reply, tokens_in, tokens_out = await loop.run_in_executor(
                    None,
                    lambda: call_claude_cli(
                        system_prompt,
                        [{"role": "user", "content": trigger}],
                        model,
                        agent_tools,
                    ),
                )
                append_log(
                    agent_display, chat_id, "scheduled_wakeup",
                    model, tokens_in, tokens_out,
                )
                await _send_long(lambda t: app.bot.send_message(chat_id=chat_id, text=t), reply)
                log.info("Wake-up sent for %s to chat %d", bot_name, chat_id)
            except Exception as exc:
                log.error("Wake-up error (%s): %s", bot_name, exc)
        await asyncio.sleep(WAKEUP_INTERVAL)


# ── Deterministic kill switch (pure code, no model) ───────────────────────────
# /halt writes memory/SAFE_MODE; /resume removes it. These bypass the LLM entirely
# so the kill switch works even if claude is down or the token is expired. Gated to
# the registered owner chat (same trust model as the private bot token).

def _is_owner_chat(bot_name: str, chat_id: int) -> bool:
    _register_owner_chat(bot_name, chat_id)  # first chat to interact becomes owner
    return _owner_chat.get(bot_name) == chat_id


async def on_halt(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_chat is None or update.message is None:
        return
    chat_id = update.effective_chat.id
    if not _is_owner_chat("eco", chat_id):
        await update.message.reply_text("Not authorized.")
        return
    try:
        ts = datetime.now(timezone.utc).isoformat()
        SAFE_MODE_FILE.parent.mkdir(parents=True, exist_ok=True)
        SAFE_MODE_FILE.write_text(f"HALT set via /halt by owner on {ts}.\n", encoding="utf-8")
        ok = SAFE_MODE_FILE.exists() and SAFE_MODE_FILE.read_text(encoding="utf-8").strip() != ""
        append_log("Eco", chat_id, "halt_command", "none", None, None)
        if ok:
            await update.message.reply_text(
                "\U0001f6d1 SAFE_MODE set. The runner will skip its next cycle and all "
                "autonomous writes are frozen.\nTo resume, run /resume (owner-only)."
            )
        else:
            await update.message.reply_text(
                "Tried to set SAFE_MODE but could not confirm the file. "
                "Create memory/SAFE_MODE manually with any text."
            )
    except Exception as exc:  # noqa: BLE001 -- always give the owner a fallback
        log.error("/halt failed: %s", exc)
        await update.message.reply_text(
            f"Failed to set SAFE_MODE: {exc}.\n"
            "Fallback: create memory/SAFE_MODE manually with any text."
        )


async def on_resume(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if update.effective_chat is None or update.message is None:
        return
    chat_id = update.effective_chat.id
    if not _is_owner_chat("eco", chat_id):
        await update.message.reply_text("Not authorized.")
        return
    try:
        existed = SAFE_MODE_FILE.exists()
        if existed:
            SAFE_MODE_FILE.unlink()
        append_log("Eco", chat_id, "resume_command", "none", None, None)
        if SAFE_MODE_FILE.exists():
            await update.message.reply_text(
                "Could not remove SAFE_MODE. Delete memory/SAFE_MODE manually."
            )
        elif existed:
            await update.message.reply_text(
                "✅ SAFE_MODE cleared. The runner re-arms on its next cycle."
            )
        else:
            await update.message.reply_text(
                "SAFE_MODE was not set -- nothing to clear. The runner is already armed."
            )
    except Exception as exc:  # noqa: BLE001
        log.error("/resume failed: %s", exc)
        await update.message.reply_text(
            f"Failed to clear SAFE_MODE: {exc}.\nFallback: delete memory/SAFE_MODE manually."
        )


# ── Main ──────────────────────────────────────────────────────────────────────

async def main() -> None:
    CHATS_DIR.mkdir(parents=True, exist_ok=True)

    check = subprocess.run(
        [CLAUDE_CMD, "--version"], capture_output=True, text=True, check=False
    )
    if check.returncode != 0:
        log.error("'claude' CLI not found or not authenticated. Run: claude setup-token")
        sys.exit(1)
    log.info("claude CLI detected: %s", check.stdout.strip())

    # Auth probe: verify the OAuth token is valid before accepting any messages.
    # `--version` only checks the binary exists; it doesn't test auth.
    # Input is piped via stdin (not positional arg) to match call_claude_cli behaviour
    # on Windows where positional args through claude.cmd can be dropped.
    log.info("Probing Claude auth (this may take ~10s)...")
    auth_probe = subprocess.run(
        [CLAUDE_CMD, "--print", "--model", ECO_DEFAULT_MODEL,
         "--output-format", "json", "--allowedTools", "Read"],
        input=b"Reply with the single word: OK",
        capture_output=True, timeout=30, check=False,
    )
    if auth_probe.returncode != 0:
        log.error(
            "Claude auth probe FAILED (exit %d, stderr=%r). "
            "Token is likely expired. Run: claude setup-token, "
            "update CLAUDE_CODE_OAUTH_TOKEN in .env, then restart.",
            auth_probe.returncode, auth_probe.stderr[:200],
        )
        sys.exit(1)
    log.info("Claude auth probe OK.")

    eco_prompt = load_agent_prompt("Eco")

    eco_start, eco_tasks, eco_msg, eco_status = make_handlers("eco", eco_prompt)

    eco_app: Application = ApplicationBuilder().token(ECO_TOKEN).build()

    eco_app.add_handler(CommandHandler("start", eco_start))
    eco_app.add_handler(CommandHandler("tasks", eco_tasks))
    eco_app.add_handler(CommandHandler("status", eco_status))
    eco_app.add_handler(CommandHandler("halt", on_halt))
    eco_app.add_handler(CommandHandler("resume", on_resume))
    eco_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, eco_msg))

    log.info(
        "Starting Eco (default=%s, escalated=%s)...",
        ECO_DEFAULT_MODEL, ECO_ESCALATED_MODEL,
    )

    async with eco_app:
        await eco_app.updater.start_polling(drop_pending_updates=True)
        await eco_app.start()

        # In-bridge 2h wake-up RETIRED 2026-06-28 (owner A1): proactivity is now handled by
        # the scheduled runner (shared/scripts/agent-runner.py), which has an actionability
        # cost gate. This avoids double-firing Eco. See decisions-log 2026-06-28.
        log.info("Eco online. (In-bridge 2h wake-up retired; runner handles proactivity.) "
                 "Press Ctrl+C to stop.")
        try:
            await asyncio.Event().wait()
        except (KeyboardInterrupt, asyncio.CancelledError):
            pass
            log.info("Shutting down...")
            await eco_app.updater.stop()
            await eco_app.stop()


if __name__ == "__main__":
    asyncio.run(main())
