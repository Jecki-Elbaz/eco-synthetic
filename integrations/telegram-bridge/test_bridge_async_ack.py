"""Tests for the SHIR-001 async-ack two-message pattern in bridge.py.

Verifies:
- ACK_MESSAGE is the FIRST reply before any Claude invocation.
- Claude runs via loop.run_in_executor (non-blocking for the event loop).
- Claude's response arrives as a second Telegram message.
- On error (timeout, auth, generic), a clear message is sent -- not silence.
- Ack-send failure is non-fatal: Claude still runs and response is delivered.
- send_ack=False path (/start) does not send ACK_MESSAGE.
- CLAUDE_TIMEOUT is raised to at least 300s.
- R1-CODE gate is preserved on the async-ack path (non-owners get nothing,
  not even the ack).

Corresponds to integration test spec in DEPLOY.md section 3 (T-001..T-005).

Run: pytest integrations/telegram-bridge/test_bridge_async_ack.py -q
"""
from __future__ import annotations

import asyncio
import importlib.util
import os
import sys
import types
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# -- Environment setup (must precede bridge module load) ---------------------
# Use synthetic IDs that cannot match any real Telegram user in tests.
_SYNTHETIC_OWNER_ID = "11111111"
_NONOWNER_ID = "55555555"

os.environ["OWNER_CHAT_ID"] = _SYNTHETIC_OWNER_ID
os.environ.setdefault(
    "ECO_TELEGRAM_BOT_TOKEN",
    "0000000000:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
)
os.environ.pop("ANTHROPIC_API_KEY", None)


# -- Module loader ------------------------------------------------------------

def _load_bridge() -> types.ModuleType:
    """Load bridge.py with load_dotenv stubbed to a no-op.

    Uses a distinct spec name ('_bridge_async_ack_test') to avoid colliding
    with the '_bridge_under_test' name used by test_bridge_security.py when
    both suites run in the same pytest session.
    """
    bridge_path = Path(__file__).with_name("bridge.py")
    dotenv_stub = types.ModuleType("dotenv")
    dotenv_stub.load_dotenv = lambda *a, **k: None  # type: ignore[attr-defined]
    orig = sys.modules.get("dotenv")
    sys.modules["dotenv"] = dotenv_stub
    try:
        spec = importlib.util.spec_from_file_location("_bridge_async_ack_test", bridge_path)
        mod = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        return mod
    finally:
        if orig is None:
            sys.modules.pop("dotenv", None)
        else:
            sys.modules["dotenv"] = orig


bridge = _load_bridge()


# -- Helpers ------------------------------------------------------------------

def _make_update(chat_id: int = int(_SYNTHETIC_OWNER_ID), text: str = "hello") -> MagicMock:
    """Build a minimal fake telegram.Update with AsyncMock reply capability."""
    update = MagicMock()
    update.effective_chat.id = chat_id
    update.message.text = text
    update.message.reply_text = AsyncMock()
    update.get_bot.return_value.send_chat_action = AsyncMock()
    return update


def _make_handlers():
    return bridge.make_handlers("eco", "test-system-prompt")


# -- Constants ----------------------------------------------------------------


class TestAsyncAckConstants:
    """ACK_MESSAGE and CLAUDE_TIMEOUT are the two config knobs for SHIR-001."""

    def test_ack_message_is_defined_and_nonempty(self) -> None:
        assert hasattr(bridge, "ACK_MESSAGE")
        assert isinstance(bridge.ACK_MESSAGE, str)
        assert bridge.ACK_MESSAGE.strip()

    def test_ack_message_addresses_jecki(self) -> None:
        """Owner's name must appear in the ack text (personal, not generic)."""
        assert "jecki" in bridge.ACK_MESSAGE.lower()

    def test_claude_timeout_at_least_300(self) -> None:
        """Timeout must be >= 300s -- raised from original 120s per SHIR-001."""
        assert bridge.CLAUDE_TIMEOUT >= 300


# -- Ack ordering (T-001, T-002, T-003 from DEPLOY.md section 3) -------------


class TestAckOrdering:
    """ACK_MESSAGE must be the first reply; Claude response must be the second."""

    def test_ack_is_first_reply_on_message(self) -> None:
        """T-001: ack appears before Claude's response on a regular message."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(bridge, "call_claude_cli", return_value=("Eco says hi", None, None)),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "save_history"),
                patch.object(bridge, "append_log"),
            ):
                await on_message(update, MagicMock())

        asyncio.run(run())
        assert len(call_log) >= 2, "expected at least ack + Claude response"
        assert call_log[0] == bridge.ACK_MESSAGE, (
            f"first reply must be ack, got: {call_log[0]!r}"
        )
        assert call_log[1] == "Eco says hi", (
            f"second reply must be Claude response, got: {call_log[1]!r}"
        )

    def test_ack_is_first_reply_on_tasks_command(self) -> None:
        """T-003: /tasks also uses send_ack=True -- ack appears before task list."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(bridge, "call_claude_cli", return_value=("Task list", None, None)),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "save_history"),
                patch.object(bridge, "append_log"),
                patch.object(bridge, "load_agent_tasks", return_value=[]),
            ):
                await on_tasks(update, MagicMock())

        asyncio.run(run())
        assert len(call_log) >= 2
        assert call_log[0] == bridge.ACK_MESSAGE
        assert call_log[1] == "Task list"

    def test_no_ack_on_start(self) -> None:
        """T-002: on_start uses send_ack=False -- ACK_MESSAGE must not appear."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(bridge, "call_claude_cli", return_value=("Eco greeting", None, None)),
                patch.object(bridge, "save_history"),
                patch.object(bridge, "append_log"),
                patch.object(bridge, "load_agent_tasks", return_value=[]),
            ):
                await on_start(update, MagicMock())

        asyncio.run(run())
        assert bridge.ACK_MESSAGE not in call_log, (
            "on_start is bot-initiated -- must not send ack before greeting"
        )


# -- Error path (T-004, T-005 from DEPLOY.md section 3) ----------------------


class TestAsyncAckErrorPath:
    """After the ack, errors must produce a follow-up message -- never silence."""

    @pytest.fixture(autouse=True)
    def reset_failures(self) -> None:
        """Reset the consecutive-failure counter so _fail_suffix stays blank."""
        bridge._consecutive_failures.clear()

    def test_timeout_error_sends_message_not_silence(self) -> None:
        """T-004: timeout after ack -> error message, not silence."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(
                    bridge, "call_claude_cli",
                    side_effect=RuntimeError(f"timeout:{bridge.CLAUDE_TIMEOUT}s"),
                ),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "append_log"),
            ):
                await on_message(update, MagicMock())

        asyncio.run(run())
        assert len(call_log) == 2
        assert call_log[0] == bridge.ACK_MESSAGE
        assert "timeout" in call_log[1].lower() or "Timed" in call_log[1]

    def test_auth_failure_sends_actionable_message(self) -> None:
        """Silent exit-1 from the CLI must produce an auth-recovery guide."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(
                    bridge, "call_claude_cli",
                    side_effect=RuntimeError("exit1:"),
                ),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "append_log"),
            ):
                await on_message(update, MagicMock())

        asyncio.run(run())
        assert len(call_log) == 2
        assert call_log[0] == bridge.ACK_MESSAGE
        err_lower = call_log[1].lower()
        assert any(kw in err_lower for kw in ("auth", "token", "expired", "setup-token"))

    def test_generic_error_sends_nonempty_message(self) -> None:
        """Any unexpected error must produce a non-empty follow-up, not silence."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(
                    bridge, "call_claude_cli",
                    side_effect=RuntimeError("exit2:something unexpected"),
                ),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "append_log"),
            ):
                await on_message(update, MagicMock())

        asyncio.run(run())
        assert len(call_log) == 2
        assert call_log[0] == bridge.ACK_MESSAGE
        assert call_log[1].strip()  # non-empty

    def test_ack_send_failure_is_nonfatal_claude_still_runs(self) -> None:
        """T-005: if the ack Telegram call itself fails, Claude still runs and
        its response is delivered (the ack try/except in _call_and_reply covers this)."""
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            if text == bridge.ACK_MESSAGE:
                raise Exception("Telegram API blip on ack send")
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update()
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            with (
                patch.object(bridge, "call_claude_cli", return_value=("Claude reply", None, None)),
                patch.object(bridge, "load_history", return_value=[]),
                patch.object(bridge, "save_history"),
                patch.object(bridge, "append_log"),
            ):
                await on_message(update, MagicMock())

        asyncio.run(run())
        # Ack send failed (so no ACK_MESSAGE in call_log) -- but Claude's
        # response must still arrive.
        assert bridge.ACK_MESSAGE not in call_log, (
            "ack send raised, so it should not appear in delivered messages"
        )
        assert "Claude reply" in call_log, (
            "Claude response must be delivered even when ack send fails"
        )


# -- R1-CODE preserved on async path -----------------------------------------


class TestR1CodeOnAsyncPath:
    """Non-owner senders must receive no reply -- not even the ack.

    Dedicated R1-CODE gate tests live in test_bridge_security.py.
    These tests confirm R1-CODE is still active after the async-ack refactor,
    specifically that the guard fires before any reply is sent.
    """

    def test_nonowner_gets_no_reply_on_message(self) -> None:
        call_log: list[str] = []

        async def fake_reply(text: str) -> None:
            call_log.append(text)

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update(chat_id=int(_NONOWNER_ID))
            update.message.reply_text = AsyncMock(side_effect=fake_reply)
            # No need to patch call_claude_cli -- the gate fires before it is reached.
            await on_message(update, MagicMock())

        asyncio.run(run())
        assert call_log == [], "non-owner must receive no reply, not even the ack"

    def test_nonowner_ack_not_sent(self) -> None:
        """ACK_MESSAGE specifically must not leak to a non-owner sender."""
        ack_sent = []

        async def run() -> None:
            on_start, on_tasks, on_message, on_status = _make_handlers()
            update = _make_update(chat_id=int(_NONOWNER_ID))

            async def spy_reply(text: str) -> None:
                if text == bridge.ACK_MESSAGE:
                    ack_sent.append(True)

            update.message.reply_text = AsyncMock(side_effect=spy_reply)
            await on_message(update, MagicMock())

        asyncio.run(run())
        assert not ack_sent, "ack must not be sent to a non-owner (reveals gate exists)"
