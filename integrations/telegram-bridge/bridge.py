"""Eco-Synthetic Telegram bridge — OAuth via Claude Max subscription.

Authentication model
--------------------
Calls Claude through the `claude` CLI, which reads CLAUDE_CODE_OAUTH_TOKEN
and bills your Claude Max subscription — NOT the paid API.

This script REFUSES TO START if ANTHROPIC_API_KEY is present in the
environment: that key would silently route every call through the paid API
instead of your subscription, with no warning from Claude itself.

Headless setup (one-time, on any machine that will run the bridge):

    claude setup-token          # opens OAuth in browser, prints a long-lived token
    setx CLAUDE_CODE_OAUTH_TOKEN "<token>"   # Windows (permanent, current user)
    # — or add to .env (never commit .env):
    #   CLAUDE_CODE_OAUTH_TOKEN=<token>

TODO — CUSTOMER-FACING AUTH SWITCH
------------------------------------
OWNER_ONLY_MODE = True means the bots serve jecki only via personal OAuth.

When bots are ever exposed to external customers, you MUST:
  1. Set OWNER_ONLY_MODE = False
  2. Remove CLAUDE_CODE_OAUTH_TOKEN; provision a scoped Console API key
  3. Set ANTHROPIC_API_KEY to that key (and remove the guard below)
  4. Switch call_claude_cli() to use the anthropic Python SDK
  5. Review Anthropic usage-policy terms — personal OAuth is for internal use only
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
from datetime import datetime, timezone
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
LOG_FILE = MEMORY_DIR / "log.jsonl"

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
    stream=sys.stdout,
)
log = logging.getLogger("bridge")

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
SHELLY_TOKEN: str = os.environ["SHELLY_TELEGRAM_BOT_TOKEN"]

# ── Models ────────────────────────────────────────────────────────────────────
ECO_DEFAULT_MODEL = "claude-sonnet-4-6"
ECO_ESCALATED_MODEL = "claude-opus-4-8"
SHELLY_DEFAULT_MODEL = "claude-haiku-4-5"
SHELLY_ESCALATED_MODEL = "claude-sonnet-4-6"

# ── Limits ────────────────────────────────────────────────────────────────────
MAX_HISTORY_MESSAGES = 20
MAX_HISTORY_CHARS = 40_000
CLAUDE_TIMEOUT = 120


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
    "shelly": [
        "memory/board.md — read and write your own task rows (owner-office scope)",
        "company/setup-guide.md — your pending task reference",
        ".claude/agents/Shelly.md — your own role file",
    ],
}

# Tools granted to each agent at the CLI level (--allowedTools).
# Must match the tools: line in the agent's .claude/agents/*.md frontmatter,
# scoped to what is safe to grant in a Telegram session.
_AGENT_TOOLS: dict[str, list[str]] = {
    "eco": ["Read", "Write", "Edit"],
    "shelly": ["Read", "Write", "Edit"],
}


# ── Owner chat registry (populated on first /start per bot) ──────────────────
# Used by the scheduled wake-up task to send proactive check-ins to jecki.

_owner_chat: dict[str, int | None] = {"eco": None, "shelly": None}


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

def _build_bridge_context(agent_name: str) -> str:
    access = _AGENT_ACCESS.get(agent_name.lower(), ["memory/board.md"])
    tools = _AGENT_TOOLS.get(agent_name.lower(), ["Read"])
    access_lines = "\n".join(f"  - {p}" for p in access)
    tools_str = ", ".join(tools)
    unavailable = [t for t in ["Write", "Edit", "Bash", "WebSearch", "WebFetch"] if t not in tools]
    unavailable_str = ", ".join(unavailable) if unavailable else "none"
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
"""


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
_SHELLY_DRAFT = re.compile(
    r"\b(draft|write|compose|email|letter|proposal|document|report|"
    r"announcement|memo|press|blog)\b",
    re.IGNORECASE,
)


def choose_model(bot_name: str, text: str) -> str:
    if bot_name == "eco":
        if _ECO_HARD.search(text) or len(text) > 500:
            log.info("Eco: escalating to %s", ECO_ESCALATED_MODEL)
            return ECO_ESCALATED_MODEL
        return ECO_DEFAULT_MODEL
    if _SHELLY_DRAFT.search(text) or len(text) > 300:
        log.info("Shelly: escalating to %s", SHELLY_ESCALATED_MODEL)
        return SHELLY_ESCALATED_MODEL
    return SHELLY_DEFAULT_MODEL


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
        prompt = _build_prompt(history)
        last_exc: Exception = RuntimeError("no attempts made")
        max_attempts = len(_RETRY_DELAYS) + 1  # 5 total attempts
        for attempt in range(max_attempts):
            try:
                result = subprocess.run(
                    cmd,
                    input=prompt,
                    capture_output=True,
                    text=True,
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

            if result.returncode != 0:
                last_exc = RuntimeError(
                    f"exit{result.returncode}:{result.stderr[:200].strip()}"
                )
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
                data = json.loads(result.stdout)
                reply: str = data.get("result") or data.get("content") or result.stdout.strip()
                usage = data.get("usage", {})
                tokens_in: int | None = usage.get("input_tokens")
                tokens_out: int | None = usage.get("output_tokens")
            except (json.JSONDecodeError, AttributeError):
                reply = result.stdout.strip()
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
    default_model = ECO_DEFAULT_MODEL if bot_name == "eco" else SHELLY_DEFAULT_MODEL

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
    ) -> None:
        chat_id = update.effective_chat.id  # type: ignore[union-attr]
        loop = asyncio.get_running_loop()
        typing_task = asyncio.create_task(
            _typing_loop(chat_id, update.get_bot())
        )
        try:
            agent_tools = _AGENT_TOOLS.get(bot_name, ["Read"])
            reply, tokens_in, tokens_out = await loop.run_in_executor(
                None,
                lambda: call_claude_cli(system_prompt, history, model, agent_tools),
            )
        except Exception as exc:
            typing_task.cancel()
            err = str(exc)
            log.error("Claude CLI error (%s/%s): %s", bot_name, action, err)
            append_log(agent_display, chat_id, f"error:{action}", "none", None, None)
            if "timeout" in err.lower():
                user_msg = (
                    f"[{agent_display}] Timed out ({CLAUDE_TIMEOUT}s) after retry. "
                    "Please resend your message."
                )
            elif "notfound" in err.lower() or "not found" in err.lower():
                user_msg = (
                    f"[{agent_display}] Claude CLI not found. Bridge needs restart."
                )
            else:
                user_msg = (
                    f"[{agent_display}] Error (attempt 2/2): {err[:80]}. Please resend."
                )
            await update.message.reply_text(user_msg)  # type: ignore[union-attr]
            return
        finally:
            typing_task.cancel()
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
        await _call_and_reply(update, history, default_model, "start_session")

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
        await _call_and_reply(update, history, default_model, "tasks_cmd")

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
        await _call_and_reply(update, history, model, "message")

    return on_start, on_tasks, on_message


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
            model = ECO_DEFAULT_MODEL if bot_name == "eco" else SHELLY_DEFAULT_MODEL
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

    eco_prompt = load_agent_prompt("Eco")
    shelly_prompt = load_agent_prompt("Shelly")

    eco_start, eco_tasks, eco_msg = make_handlers("eco", eco_prompt)
    shelly_start, shelly_tasks, shelly_msg = make_handlers("shelly", shelly_prompt)

    eco_app: Application = ApplicationBuilder().token(ECO_TOKEN).build()
    shelly_app: Application = ApplicationBuilder().token(SHELLY_TOKEN).build()

    eco_app.add_handler(CommandHandler("start", eco_start))
    eco_app.add_handler(CommandHandler("tasks", eco_tasks))
    eco_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, eco_msg))

    shelly_app.add_handler(CommandHandler("start", shelly_start))
    shelly_app.add_handler(CommandHandler("tasks", shelly_tasks))
    shelly_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, shelly_msg))

    log.info(
        "Starting Eco (default=%s, escalated=%s) and Shelly (default=%s, escalated=%s)...",
        ECO_DEFAULT_MODEL, ECO_ESCALATED_MODEL,
        SHELLY_DEFAULT_MODEL, SHELLY_ESCALATED_MODEL,
    )

    async with eco_app:
        async with shelly_app:
            await eco_app.updater.start_polling(drop_pending_updates=True)
            await shelly_app.updater.start_polling(drop_pending_updates=True)
            await eco_app.start()
            await shelly_app.start()

            eco_wakeup = asyncio.create_task(
                _wakeup_task("eco", eco_app, eco_prompt), name="eco-wakeup"
            )
            shelly_wakeup = asyncio.create_task(
                _wakeup_task("shelly", shelly_app, shelly_prompt), name="shelly-wakeup"
            )
            log.info(
                "Both bots online. Wake-ups scheduled every %ds (~%.0fh). Press Ctrl+C to stop.",
                WAKEUP_INTERVAL, WAKEUP_INTERVAL / 3600,
            )
            try:
                await asyncio.Event().wait()
            except (KeyboardInterrupt, asyncio.CancelledError):
                pass
            finally:
                eco_wakeup.cancel()
                shelly_wakeup.cancel()
                log.info("Shutting down...")
                await eco_app.updater.stop()
                await shelly_app.updater.stop()
                await eco_app.stop()
                await shelly_app.stop()


if __name__ == "__main__":
    asyncio.run(main())
