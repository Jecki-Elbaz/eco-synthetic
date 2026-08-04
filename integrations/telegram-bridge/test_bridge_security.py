"""Security tests for bridge.py -- R1-CODE (sender auth) and R2-CODE (tool stripping).

These tests verify the two security fixes from T-0020 (2026-08-05):
  R1-CODE: every handler checks sender chat_id against a static OWNER_CHAT constant
           (loaded from OWNER_CHAT_ID env var at startup). Non-owner senders are
           silently ignored. Replaces the spoofable first-registrant model.
  R2-CODE: call_claude_cli strips Bash and WebFetch from --allowedTools before
           passing the flag to the claude CLI subprocess.

Run: pytest integrations/telegram-bridge/test_bridge_security.py -q
"""
from __future__ import annotations

import importlib.util
import os
import sys
import types
from pathlib import Path

import pytest

# ── Environment setup (must precede bridge module load) ───────────────────────
# Use a synthetic owner ID that cannot match any real Telegram user in tests.
_SYNTHETIC_OWNER_ID = "11111111"
_NONOWNER_ID_A = "22222222"
_NONOWNER_ID_B = "33333333"

os.environ["OWNER_CHAT_ID"] = _SYNTHETIC_OWNER_ID
# ECO_TELEGRAM_BOT_TOKEN must be present (bridge reads it at module level).
# Use a syntactically valid but inert placeholder; no network call happens.
os.environ.setdefault(
    "ECO_TELEGRAM_BOT_TOKEN",
    "0000000000:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
)
# Ensure the ANTHROPIC_API_KEY guard does not fire.
os.environ.pop("ANTHROPIC_API_KEY", None)


# ── Module loader ─────────────────────────────────────────────────────────────

def _load_bridge_module():
    """Load bridge.py with load_dotenv patched to a no-op.

    The no-op prevents the real .env from overriding env vars set above and
    avoids pulling any secrets into the test process's scope.
    CLAUDE_CMD resolution (shutil.which) is left unpatched; the bridge's venv
    is expected to have the claude CLI on PATH (same machine that runs bridge.py).
    """
    bridge_path = Path(__file__).with_name("bridge.py")

    # Stub dotenv so load_dotenv() is a no-op during exec_module.
    dotenv_stub = types.ModuleType("dotenv")
    dotenv_stub.load_dotenv = lambda *a, **k: None  # type: ignore[attr-defined]
    orig_dotenv = sys.modules.get("dotenv")
    sys.modules["dotenv"] = dotenv_stub

    try:
        spec = importlib.util.spec_from_file_location("_bridge_under_test", bridge_path)
        mod = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        return mod
    finally:
        # Restore previous dotenv state so other tests are not affected.
        if orig_dotenv is None:
            sys.modules.pop("dotenv", None)
        else:
            sys.modules["dotenv"] = orig_dotenv


bridge = _load_bridge_module()


# ── R1-CODE: sender authentication ────────────────────────────────────────────

class TestOwnerChatConstant:
    """OWNER_CHAT is a static constant loaded from env at startup (not runtime-mutable)."""

    def test_owner_chat_matches_env_var(self) -> None:
        """OWNER_CHAT must equal the OWNER_CHAT_ID value set in env before load."""
        assert bridge.OWNER_CHAT == _SYNTHETIC_OWNER_ID

    def test_owner_chat_is_nonempty(self) -> None:
        """A valid deployment never has an empty OWNER_CHAT (startup guard exits on empty)."""
        assert bridge.OWNER_CHAT.strip() != ""

    def test_owner_chat_is_string(self) -> None:
        """Stored as str so str(chat_id) comparisons are unambiguous."""
        assert isinstance(bridge.OWNER_CHAT, str)


class TestIsOwnerChat:
    """_is_owner_chat() must accept only the owner and reject everyone else."""

    def test_exact_owner_id_accepted(self) -> None:
        assert bridge._is_owner_chat(int(_SYNTHETIC_OWNER_ID)) is True

    def test_nonowner_id_rejected(self) -> None:
        assert bridge._is_owner_chat(int(_NONOWNER_ID_A)) is False

    def test_second_nonowner_id_rejected(self) -> None:
        assert bridge._is_owner_chat(int(_NONOWNER_ID_B)) is False

    def test_zero_is_rejected(self) -> None:
        assert bridge._is_owner_chat(0) is False

    def test_negative_id_rejected(self) -> None:
        assert bridge._is_owner_chat(-1) is False

    def test_owner_id_plus_one_rejected(self) -> None:
        """Off-by-one: an ID adjacent to the owner must not pass."""
        assert bridge._is_owner_chat(int(_SYNTHETIC_OWNER_ID) + 1) is False

    def test_owner_id_minus_one_rejected(self) -> None:
        assert bridge._is_owner_chat(int(_SYNTHETIC_OWNER_ID) - 1) is False

    def test_large_arbitrary_id_rejected(self) -> None:
        assert bridge._is_owner_chat(9_999_999_999) is False


# ── R2-CODE: denied tools constant ────────────────────────────────────────────

class TestBridgeDeniedTools:
    """_BRIDGE_DENIED_TOOLS must include Bash and WebFetch, and nothing legitimate."""

    def test_bash_is_denied(self) -> None:
        assert "Bash" in bridge._BRIDGE_DENIED_TOOLS

    def test_webfetch_is_denied(self) -> None:
        assert "WebFetch" in bridge._BRIDGE_DENIED_TOOLS

    def test_read_is_not_denied(self) -> None:
        assert "Read" not in bridge._BRIDGE_DENIED_TOOLS

    def test_write_is_not_denied(self) -> None:
        assert "Write" not in bridge._BRIDGE_DENIED_TOOLS

    def test_edit_is_not_denied(self) -> None:
        assert "Edit" not in bridge._BRIDGE_DENIED_TOOLS

    def test_denied_set_is_frozenset(self) -> None:
        """Immutable by type -- cannot be accidentally mutated at runtime."""
        assert isinstance(bridge._BRIDGE_DENIED_TOOLS, frozenset)


# ── R2-CODE: tool stripping logic ─────────────────────────────────────────────

class TestToolStrippingLogic:
    """Verify the list-comprehension stripping used inside call_claude_cli.

    We test the logic directly rather than invoking the full subprocess function,
    which would require a live claude CLI and a valid OAuth token. The stripping
    expression is:
        [t for t in allowed_tools if t not in _BRIDGE_DENIED_TOOLS]
    """

    def _strip(self, tools: list[str]) -> list[str]:
        return [t for t in tools if t not in bridge._BRIDGE_DENIED_TOOLS]

    def test_bash_stripped_from_mixed_list(self) -> None:
        result = self._strip(["Read", "Write", "Bash", "Edit"])
        assert "Bash" not in result
        assert set(result) == {"Read", "Write", "Edit"}

    def test_webfetch_stripped_from_mixed_list(self) -> None:
        result = self._strip(["Read", "WebFetch"])
        assert "WebFetch" not in result
        assert result == ["Read"]

    def test_both_denied_stripped_together(self) -> None:
        result = self._strip(["Bash", "WebFetch", "Read"])
        assert result == ["Read"]

    def test_clean_list_is_unchanged(self) -> None:
        """A list containing no denied tools must pass through unmodified."""
        clean = ["Read", "Write", "Edit"]
        assert self._strip(clean) == clean

    def test_all_denied_yields_empty_list(self) -> None:
        """If every tool is denied the result is empty (bridge falls back to 'Read')."""
        assert self._strip(["Bash", "WebFetch"]) == []

    def test_duplicate_denied_tools_all_stripped(self) -> None:
        result = self._strip(["Bash", "Read", "Bash", "WebFetch"])
        assert "Bash" not in result
        assert "WebFetch" not in result
        assert result == ["Read"]


# ── Eco agent tools config does not pre-include denied tools ──────────────────

class TestEcoAgentToolsConfig:
    """_AGENT_TOOLS['eco'] must not include Bash or WebFetch (belt-and-suspenders)."""

    def test_eco_tools_excludes_bash(self) -> None:
        eco_tools = bridge._AGENT_TOOLS.get("eco", [])
        assert "Bash" not in eco_tools

    def test_eco_tools_excludes_webfetch(self) -> None:
        eco_tools = bridge._AGENT_TOOLS.get("eco", [])
        assert "WebFetch" not in eco_tools

    def test_eco_tools_includes_read(self) -> None:
        eco_tools = bridge._AGENT_TOOLS.get("eco", [])
        assert "Read" in eco_tools
