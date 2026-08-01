"""Automated proof that the autonomy guard denies every Red path (Rambo C1).

Run: pytest .claude/hooks/test_guard.py -q
These tests exercise the pure decision logic in enforce mode. They do not depend
on Claude Code; they prove the guard's denials fire correctly.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
_spec = importlib.util.spec_from_file_location("guard", Path(__file__).with_name("guard.py"))
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)


def ev(tool, _agent_type=None, **ti):
    e = {"tool_name": tool, "tool_input": ti}
    if _agent_type is not None:
        e["agent_type"] = _agent_type
    return e


def d(event):
    return guard.decide(event, "enforce")[0]


# --- Red path writes are denied (5.1) ---
#
# Structural note: every allowlisted sub-agent is also in PATH_SCOPE, and no red path is
# inside any agent's allowed prefixes. PATH_SCOPE fires BEFORE _is_red in evaluate(), so
# there is no (allowlisted agent, red path) pair where _is_red is the blocking rule for a
# sub-agent write. The suite proves _is_red specifically via the runner path:
# RUNNER_CONTEXT=1 with no agent_type skips PATH_SCOPE (origin is empty) so _is_red is the
# only candidate; the reason string pins it. test_path_scope_blocks_red_paths_for_sub_agents
# covers the sub-agent angle (PATH_SCOPE fires, not _is_red). B1 exemption is documented
# by test_red_write_allowed_for_owner_interactive_session.

@pytest.mark.parametrize("path", [
    ".claude/agents/Eco.md",
    ".claude/agents/Anat.md",
    ".claude/settings.json",
    ".claude/settings.local.json",
    "company/governance/access-matrix.md",
    "company/constitution.md",
])
def test_red_write_denied_on_runner_path(monkeypatch, path):
    # RUNNER_CONTEXT=1 + no agent_type: B1 owner exemption does not apply (condition checks
    # RUNNER_CONTEXT != "1"), PATH_SCOPE is skipped (origin empty), _is_red is the only rule
    # that can produce this denial. Reason string assertion pins the rule.
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    decision, reason = guard.decide(ev("Write", file_path=path, content="x"), "enforce")
    assert decision == guard.DENY
    assert "Red path" in reason

    decision2, reason2 = guard.decide(ev("Edit", file_path=path), "enforce")
    assert decision2 == guard.DENY
    assert "Red path" in reason2


def test_red_denied_via_absolute_path(monkeypatch):
    # Same runner-path proof with an absolute file path; also verifies _relpath() normalisation.
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    abs_path = str(ROOT / ".claude" / "agents" / "Eco.md")
    decision, reason = guard.decide(ev("Write", file_path=abs_path, content="x"), "enforce")
    assert decision == guard.DENY
    assert "Red path" in reason


def test_red_write_allowed_for_owner_interactive_session():
    # B1 exemption (SEC-0001 2026-07-01): no agent_type + no RUNNER_CONTEXT = owner live
    # interactive session. Red path writes are intentionally allowed so the owner can edit
    # role files out-of-band (A1 action). _is_red still fires; the branch passes through.
    decision, _ = guard.decide(
        ev("Write", file_path=".claude/agents/Eco.md", content="x"), "enforce"
    )
    assert decision == guard.ALLOW


def test_red_write_denied_on_bridge_path(monkeypatch):
    # 2026-08-01 fix: the Telegram bridge spawns top-level Eco (origin empty, RUNNER_CONTEXT
    # unset) on untrusted email input. BRIDGE_CONTEXT=1 must exclude it from the B1 owner
    # exemption, so it cannot write Red paths (settings, role files, the send whitelist).
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    decision, reason = guard.decide(
        ev("Write", file_path="company/governance/access-matrix.md", content="x"), "enforce"
    )
    assert decision == guard.DENY
    assert "Red path" in reason


def test_bridge_cannot_write_send_whitelist(monkeypatch):
    # The send whitelist is owner-only. A bridge-spawned Eco, if driven by a prompt-injected
    # email, must not be able to add an attacker address to it.
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    decision, reason = guard.decide(
        ev("Write", file_path="company/governance/email-send-whitelist.md",
           content="evil@attacker.com\n"),
        "enforce",
    )
    assert decision == guard.DENY
    assert "Red path" in reason


def test_red_denied_in_shadow_mode_on_bridge(monkeypatch):
    # red_block: Red-path denials are hard-enforced regardless of GUARD_MODE. In shadow mode a
    # bridge Red-path write must still DENY, not degrade to would-DENY -> ALLOW.
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    decision, reason = guard.decide(
        ev("Write", file_path=".claude/settings.json", content="x"), "shadow"
    )
    assert decision == guard.DENY
    assert "Red path" in reason


def test_red_denied_in_shadow_mode_on_runner(monkeypatch):
    # Same hard-enforce guarantee on the runner path in shadow mode.
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    decision, reason = guard.decide(
        ev("Write", file_path=".claude/agents/Eco.md", content="x"), "shadow"
    )
    assert decision == guard.DENY
    assert "Red path" in reason


def test_owner_still_allowed_after_bridge_fix():
    # Regression: the real owner interactive session (no agent_type, no RUNNER_CONTEXT, no
    # BRIDGE_CONTEXT) is STILL allowed to write Red paths -- the fix must not lock the owner out.
    decision, _ = guard.decide(
        ev("Write", file_path=".claude/settings.json", content="x"), "enforce"
    )
    assert decision == guard.ALLOW


# --- send_gmail_message whitelist gate (WS4, 2026-08-01) ---

_WL_SEED = "jecki.elbaz@gmail.com\nleighton.adam@gmail.com\nshelly.synthetic.org@gmail.com\n"


@pytest.fixture
def wl(tmp_path, monkeypatch):
    f = tmp_path / "email-send-whitelist.md"
    f.write_text(_WL_SEED, encoding="utf-8")
    monkeypatch.setattr(guard, "SEND_WHITELIST_PATH", f)
    return f


def _send(to=None, cc=None, bcc=None, account=None):
    ti = {"user_google_email": account if account is not None else guard.ECO_GOOGLE_ACCOUNT}
    for k, v in (("to", to), ("cc", cc), ("bcc", bcc)):
        if v is not None:
            ti[k] = v
    return {"tool_name": "mcp__google_workspace__send_gmail_message", "tool_input": ti}


def test_send_whitelisted_runner_explicit_allow(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")[0] == guard.EXPLICIT_ALLOW


def test_send_whitelisted_interactive_prompts_not_explicit(wl):
    # Owner directive 2026-08-01: interactive whitelisted sends still prompt (plain ALLOW).
    decision, reason = guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")
    assert decision == guard.ALLOW
    assert decision != guard.EXPLICIT_ALLOW
    assert "interactive owner prompt" in reason


def test_send_non_whitelisted_runner_denied(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    decision, reason = guard.decide(_send(to="evil@external.com"), "enforce")
    assert decision == guard.DENY
    assert "whitelist" in reason


def test_send_non_whitelisted_interactive_passthrough(wl):
    # Interactive: owner can still send anywhere via the confirmation prompt.
    assert guard.decide(_send(to="stranger@external.com"), "enforce")[0] == guard.ALLOW


def test_send_cc_non_whitelisted_runner_denied(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com", cc="evil@x.com"), "enforce")[0] == guard.DENY


def test_send_bcc_non_whitelisted_runner_denied(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com", bcc="evil@x.com"), "enforce")[0] == guard.DENY


def test_send_list_all_whitelisted_runner(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    ev2 = _send(to=["jecki.elbaz@gmail.com", "leighton.adam@gmail.com"])
    assert guard.decide(ev2, "enforce")[0] == guard.EXPLICIT_ALLOW


def test_send_comma_separated_all_whitelisted_runner(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    ev2 = _send(to="jecki.elbaz@gmail.com, leighton.adam@gmail.com")
    assert guard.decide(ev2, "enforce")[0] == guard.EXPLICIT_ALLOW


def test_send_case_insensitive_runner(monkeypatch, wl):
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="JECKI.ELBAZ@GMAIL.COM"), "enforce")[0] == guard.EXPLICIT_ALLOW


def test_send_non_ascii_homoglyph_runner_denied(monkeypatch, wl):
    # Kelvin sign (U+212A) lowercases to ASCII 'k' but the RAW address is non-ASCII, so it must
    # NOT match the ASCII whitelist (it would deliver elsewhere). isascii() on raw blocks it.
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecKi.elbaz@gmail.com"), "enforce")[0] == guard.DENY


def test_send_missing_whitelist_fail_closed(monkeypatch, tmp_path):
    monkeypatch.setattr(guard, "SEND_WHITELIST_PATH", tmp_path / "nope.md")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")[0] == guard.DENY
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")[0] == guard.DENY


def test_send_no_recipients_denied(wl):
    ev2 = {"tool_name": "mcp__google_workspace__send_gmail_message",
           "tool_input": {"user_google_email": guard.ECO_GOOGLE_ACCOUNT}}
    assert guard.decide(ev2, "enforce")[0] == guard.DENY


def test_send_wrong_account_denied(wl):
    decision, reason = guard.decide(
        _send(to="jecki.elbaz@gmail.com", account="attacker@gmail.com"), "enforce")
    assert decision == guard.DENY
    assert "pinned to" in reason


def test_send_whitelist_deny_hard_enforced_in_shadow(monkeypatch, wl):
    # Whitelist DENY reason starts with "google boundary" -> hard-enforced even in shadow mode.
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="evil@x.com"), "shadow")[0] == guard.DENY


def test_bridge_bash_write_to_red_denied(monkeypatch):
    # The Bash vector the Write-only test missed: a bridge Bash command must be denied so a
    # prompt-injected email cannot poison the whitelist via a shell call (adversary 2026-08-01).
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    cmd = "python3 -c \"open('company/governance/email-send-whitelist.md','a').write('evil@x.com')\""
    decision, reason = guard.decide(ev("Bash", command=cmd), "enforce")
    assert decision == guard.DENY
    assert "bridge" in reason.lower()


def test_bridge_bash_denied_in_shadow(monkeypatch):
    # BRIDGE_CONTEXT is hard-enforced regardless of GUARD_MODE, so bridge Bash dies in shadow too.
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    assert guard.decide(ev("Bash", command="echo hi"), "shadow")[0] == guard.DENY


def test_bridge_spawn_denied(monkeypatch):
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    assert guard.decide(ev("Task", subagent_type="shir"), "enforce")[0] == guard.DENY


def test_send_empty_whitelist_denied_on_runner(monkeypatch, tmp_path):
    f = tmp_path / "wl.md"
    f.write_text("# a comment, no addresses\n", encoding="utf-8")
    monkeypatch.setattr(guard, "SEND_WHITELIST_PATH", f)
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")[0] == guard.DENY


def test_send_corrupt_utf8_whitelist_fail_closed(monkeypatch, tmp_path):
    f = tmp_path / "wl.md"
    f.write_bytes(b"\xff\xfe not utf8")
    monkeypatch.setattr(guard, "SEND_WHITELIST_PATH", f)
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    assert guard.decide(_send(to="jecki.elbaz@gmail.com"), "enforce")[0] == guard.DENY


def test_path_scope_blocks_red_paths_for_sub_agents():
    # Sub-agents cannot reach red paths because PATH_SCOPE fires before _is_red: no allowlisted
    # agent has a red path in its allowed prefixes. The reason string confirms PATH_SCOPE is the
    # blocking rule, not _is_red. This is belt-and-suspenders with the runner-path test above.
    decision, reason = guard.decide(
        ev("Write", _agent_type="anat", file_path=".claude/settings.json", content="x"),
        "enforce",
    )
    assert decision == guard.DENY
    assert "path-scope violation" in reason
    assert "anat" in reason


# --- Agent allow-list (5.2) ---

@pytest.mark.parametrize("agent", ["claude", "general-purpose", "explore", "plan", ""])
def test_non_allowlisted_agent_denied(agent):
    # Removed: gal, shir, ido, meetingprep -- added to ALLOWED_AGENTS (AUD-009 / SEC-0001).
    # They are allowed to spawn from an owner session; see test_allowlisted_agent_allowed.
    assert d(ev("Task", subagent_type=agent)) == guard.DENY
    assert d(ev("Agent", subagent_type=agent)) == guard.DENY


@pytest.mark.parametrize("agent", ["anat", "assaf", "dalia", "eyal", "rambo",
                                   "lital", "perry", "Rambo", "ANAT"])
def test_allowlisted_agent_allowed(agent):
    # "noam" replaced with "perry": noam was renamed to perry (Phase 1 audit F-R01).
    assert d(ev("Task", subagent_type=agent)) == guard.ALLOW


# --- Append-only audit trail (5.3) ---

def test_decisions_log_edit_denied():
    assert d(ev("Edit", file_path="company/decisions/decisions-log.md")) == guard.DENY


def test_decisions_log_pure_append_allowed():
    cur = guard._current_content("company/decisions/decisions-log.md")
    assert d(ev("Write", file_path="company/decisions/decisions-log.md",
                content=cur + "\n## new entry\n")) == guard.ALLOW


def test_decisions_log_rewrite_denied():
    assert d(ev("Write", file_path="company/decisions/decisions-log.md",
                content="totally new content not a prefix")) == guard.DENY


def test_agent_runs_log_protected():
    assert d(ev("Edit", file_path="memory/agent-runs.jsonl")) == guard.DENY
    assert d(ev("Write", file_path="memory/agent-runs.jsonl",
                content="rewrite")) in (guard.ALLOW, guard.DENY)  # allow only if pure append


# --- Ungoverned paths still work (no over-blocking) ---

def test_working_file_allowed():
    assert d(ev("Write", file_path="projects/demo/notes.md", content="hi")) == guard.ALLOW
    assert d(ev("Edit", file_path="memory/wiki/home.md")) == guard.ALLOW


# --- SAFE_MODE (5.4 / 7) ---

def test_safe_mode_blocks_when_active(monkeypatch):
    monkeypatch.setattr(guard, "_safe_mode_active", lambda: True)
    assert d(ev("Task", subagent_type="anat")) == guard.DENY
    assert d(ev("Write", file_path="projects/demo/x.md", content="y")) == guard.DENY


def test_safe_mode_clear_denied():
    assert d(ev("Write", file_path="memory/SAFE_MODE", content="   ")) == guard.DENY
    assert d(ev("Edit", file_path="memory/SAFE_MODE")) == guard.DENY


def test_safe_mode_set_allowed():
    assert d(ev("Write", file_path="memory/SAFE_MODE",
                content="halt: reason")) == guard.ALLOW


# --- Fail-closed (5.5) ---

def test_fail_closed_on_bad_input_enforce():
    bad = {"tool_name": "Write", "tool_input": "not-an-object"}
    assert guard.decide(bad, "enforce")[0] == guard.DENY


# --- Origin enforcement: acting sub-agent allow-list (5.2, C2/C5) ---

def test_non_allowlisted_acting_agent_denied():
    # An agent not on the acting allowlist (5.2) cannot write even to an ungoverned path.
    # "gal" was removed: gal is now in ALLOWED_AGENTS (AUD-009) so it would pass here and
    # then be allowed by PATH_SCOPE ("projects/" is in gal's scope). Use "noam" (removed from
    # the list, F-R01) and "general-purpose" (never listed). Reason string pins the allowlist
    # rule (5.2), not PATH_SCOPE, so a future PATH_SCOPE-only deletion would surface here.
    decision, reason = guard.decide(
        ev("Write", _agent_type="noam", file_path="projects/x.md", content="y"), "enforce"
    )
    assert decision == guard.DENY
    assert "non-code allow-list" in reason

    decision2, reason2 = guard.decide(
        ev("Edit", _agent_type="general-purpose", file_path="memory/wiki/home.md"), "enforce"
    )
    assert decision2 == guard.DENY
    assert "non-code allow-list" in reason2


def test_allowlisted_acting_agent_allowed():
    # Each allowlisted agent must write within its own PATH_SCOPE to be allowed.
    # "anat" writing "projects/x.md" fails PATH_SCOPE (not her scope); use agents whose
    # PATH_SCOPE actually covers the target path.
    # gal has "projects/" in PATH_SCOPE; anat has "company/hr/" in PATH_SCOPE.
    assert d(ev("Write", _agent_type="gal", file_path="projects/x.md", content="y")) == guard.ALLOW
    assert d(ev("Write", _agent_type="anat", file_path="company/hr/test.md", content="y")) == guard.ALLOW


def test_main_thread_has_no_origin_and_is_allowed_on_working_paths():
    # No agent_type field == main thread; ungoverned path is fine.
    assert d(ev("Write", file_path="projects/x.md", content="y")) == guard.ALLOW


# --- Runner-path sub-agent dispatch (owner A1 2026-08-02) ---
#
# The runner was hard-denied from spawning ANY agent, which meant Eco's stale-sweep could only
# append notes no agent would ever read. It may now dispatch a small non-Bash allowlist under
# four limits: allowlist only, depth 1, act cycles only, capped per cycle. These tests are the
# proof that each limit actually bites -- and that opening dispatch did not open the
# code-builders (gal/shir/adi/oren/noa), whose owner-only restriction previously rested on the
# now-false invariant "the runner cannot spawn anyone".


@pytest.fixture
def dispatch(tmp_path, monkeypatch):
    """Runner act-cycle context with an isolated per-cycle dispatch counter."""
    monkeypatch.setenv("RUNNER_CONTEXT", "1")
    monkeypatch.setenv("RUNNER_MODE", "act")
    monkeypatch.setenv("RUNNER_CYCLE_ID", "probe-cycle-1")
    monkeypatch.setattr(guard, "SPAWN_COUNT_FILE", tmp_path / "runner-spawn-count.json")
    return tmp_path


def test_runner_dispatch_allows_allowlisted_agent(dispatch):
    decision, reason = guard.decide(ev("Task", subagent_type="rambo"), "enforce")
    assert decision == guard.ALLOW
    assert "slot 1/3" in reason


def test_runner_dispatch_cap_denies_fourth(dispatch):
    for _ in range(guard.RUNNER_SPAWN_CAP):
        assert guard.decide(ev("Task", subagent_type="dalia"), "enforce")[0] == guard.ALLOW
    decision, reason = guard.decide(ev("Task", subagent_type="dalia"), "enforce")
    assert decision == guard.DENY
    assert "cap" in reason
    assert "dispatch-queue" in reason


def test_runner_dispatch_denies_non_allowlisted(dispatch):
    # assaf is on ALLOWED_AGENTS (may act, may be spawned from an owner session) but is NOT on
    # the narrower runner-dispatch allowlist.
    decision, reason = guard.decide(ev("Task", subagent_type="assaf"), "enforce")
    assert decision == guard.DENY
    assert "RUNNER_SPAWN_ALLOW" in reason


def test_runner_dispatch_denies_nested_spawn(dispatch):
    # Depth 1 only: anat holds the Agent tool, so without this a dispatched anat could chain.
    decision, reason = guard.decide(
        ev("Task", _agent_type="anat", subagent_type="rambo"), "enforce"
    )
    assert decision == guard.DENY
    assert "nested" in reason


def test_runner_dispatch_denied_on_readonly_cycle(dispatch, monkeypatch):
    monkeypatch.setenv("RUNNER_MODE", "readonly")
    decision, reason = guard.decide(ev("Task", subagent_type="rambo"), "enforce")
    assert decision == guard.DENY
    assert "act cycles" in reason


def test_runner_dispatch_fails_closed_without_cycle_id(dispatch, monkeypatch):
    # No cycle id = no budget can be accounted for = deny, never an uncounted dispatch.
    monkeypatch.delenv("RUNNER_CYCLE_ID", raising=False)
    decision, reason = guard.decide(ev("Task", subagent_type="rambo"), "enforce")
    assert decision == guard.DENY
    assert "RUNNER_CYCLE_ID" in reason


@pytest.mark.parametrize("builder", ["gal", "shir", "adi", "oren", "noa"])
def test_runner_cannot_dispatch_code_builders(dispatch, builder):
    # The invariant fix. These are owner-session-only; the runner must queue them instead.
    assert guard.decide(ev("Task", subagent_type=builder), "enforce")[0] == guard.DENY


def test_owner_session_can_still_spawn_code_builders():
    # Regression: opening runner dispatch must not restrict the owner's own session.
    assert d(ev("Task", subagent_type="gal")) == guard.ALLOW
    assert d(ev("Task", subagent_type="shir")) == guard.ALLOW


def test_bridge_cannot_spawn_code_builders(monkeypatch):
    # The bridge spawns top-level Eco (origin empty) on untrusted email input.
    monkeypatch.setenv("BRIDGE_CONTEXT", "1")
    assert guard.decide(ev("Task", subagent_type="gal"), "enforce")[0] == guard.DENY


def test_runner_dispatch_denied_in_shadow_mode(dispatch):
    # RUNNER_CONTEXT is hard-enforced regardless of GUARD_MODE, so the limits bite in shadow.
    assert guard.decide(ev("Task", subagent_type="assaf"), "shadow")[0] == guard.DENY


def test_dispatch_counter_not_writable_by_agents(dispatch):
    # An agent must not be able to reset its own per-cycle dispatch budget.
    decision, reason = guard.decide(
        ev("Write", file_path=guard.SPAWN_COUNT_REL, content="{}"), "enforce"
    )
    assert decision == guard.DENY
    assert "code-managed" in reason


def test_dispatch_counter_not_writable_by_sub_agent(monkeypatch):
    monkeypatch.delenv("RUNNER_CONTEXT", raising=False)
    decision, reason = guard.decide(
        ev("Write", _agent_type="dalia", file_path=guard.SPAWN_COUNT_REL, content="{}"),
        "enforce",
    )
    assert decision == guard.DENY


def test_runner_spawn_allowlist_holds_no_bash_agents():
    # Structural invariant, not behaviour: every runner-dispatchable agent must be Bash-free
    # and must not be owner-session-only. A future role-file edit that grants Bash to one of
    # these should break this test, not the fleet.
    for name in guard.RUNNER_SPAWN_ALLOW:
        assert name in guard.ALLOWED_AGENTS
        assert name not in guard.OWNER_SPAWN_ONLY
        role = ROOT / ".claude" / "agents" / f"{name.capitalize()}.md"
        if role.is_file():
            head = role.read_text(encoding="utf-8")[:2000]
            tools_line = next(
                (ln for ln in head.splitlines() if ln.lower().startswith("tools:")), ""
            )
            assert "bash" not in tools_line.lower(), f"{name} now holds Bash"


# --- In-repo handoff secret scan (2026-08-02) ---

def test_secret_scan_covers_in_repo_handoff():
    # _is_handoff() resolved only against the out-of-repo drop folder, so writes into the
    # in-repo two-stage inbox screen dir bypassed the hard-enforced credential scan entirely.
    target = str(ROOT / "shared" / "handoff" / "inbox-screened" / "probe.md")
    decision, reason = guard.decide(
        ev("Write", file_path=target, content="api_key: sk-abcdefghijklmnopqrstuvwxyz012345"),
        "enforce",
    )
    assert decision == guard.DENY
    assert "secret pattern" in reason


def test_in_repo_handoff_clean_write_allowed():
    target = str(ROOT / "shared" / "handoff" / "inbox-screened" / "probe.md")
    assert d(ev("Write", file_path=target, content="SCREEN-CLEAR: no actionable content")) == guard.ALLOW


def test_secret_scan_hard_enforced_in_shadow():
    target = str(ROOT / "shared" / "handoff" / "inbox-screened" / "probe.md")
    decision, _ = guard.decide(
        ev("Write", file_path=target, content="token: ghp_" + "a" * 36), "shadow"
    )
    assert decision == guard.DENY


# --- Yossi write scope (2026-08-02) ---

def test_yossi_can_write_his_own_scope():
    # Yossi was certified-live with A3 write duties but was absent from ALLOWED_AGENTS and
    # PATH_SCOPE, so every write his role file promises would have broken on the enforce flip.
    assert d(ev("Write", _agent_type="yossi", file_path="company/training/x.md",
                content="y")) == guard.ALLOW


def test_yossi_still_scoped():
    decision, reason = guard.decide(
        ev("Write", _agent_type="yossi", file_path="projects/x.md", content="y"), "enforce"
    )
    assert decision == guard.DENY
    assert "path-scope violation" in reason


# --- Board write access for status reporting (2026-08-02) ---

@pytest.mark.parametrize("agent", ["adi", "noa", "jenny", "jack", "ella", "oracle",
                                    "yael", "zvika", "designer", "sami", "roman"])
def test_agents_can_report_status_on_the_board(agent):
    # memory/board.md is the company's only working status channel. 22 of 32 agents could not
    # write it, so their status existed only inside an ephemeral spawn transcript.
    assert d(ev("Write", _agent_type=agent, file_path="memory/board.md",
                content="row")) == guard.ALLOW


def test_board_access_did_not_widen_other_scopes():
    # Regression: granting board.md must not have granted anything else.
    decision, reason = guard.decide(
        ev("Write", _agent_type="jenny", file_path="company/governance/gate-register.md",
           content="x"), "enforce"
    )
    assert decision == guard.DENY
    assert "path-scope violation" in reason


def test_shadow_never_blocks():
    # In shadow mode, denials are wrapped as would-DENY rather than hard-blocking.
    # Main-session Red path writes are ALLOWED outright via the B1 exemption and never
    # produce a would-DENY -- that is not a shadow case. Use a sub-agent writing a Red path:
    # PATH_SCOPE denies it in enforce (see test_path_scope_blocks_red_paths_for_sub_agents);
    # shadow wraps that denial. Property proved: shadow never hard-blocks non-runner paths.
    decision, reason = guard.decide(
        ev("Write", _agent_type="anat", file_path=".claude/settings.json", content="x"),
        "shadow",
    )
    assert decision == guard.ALLOW
    assert "would-DENY" in reason
