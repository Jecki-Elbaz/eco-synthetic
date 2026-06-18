# Bridge DEPLOY.md -- SHIR-001 async ack + timeout fix

Date: 2026-06-18
Author: Shir (DevOps, L4)
Task: SHIR-001
Gate: A1 required before any production deploy (see section 5)

---

## 1. What changed

### 1.1 Immediate ack message (two-message pattern)

Every inbound user message now triggers two Telegram messages:

  Message 1 (sent immediately, before Claude is called):
    "On it, Jecki..."

  Message 2 (sent after Claude returns):
    Claude's actual response

The ack is skipped for bot-initiated flows (/start greeting, scheduled
wake-up check-ins) because those are not triggered by user input.

Implementation: `_call_and_reply()` now accepts a `send_ack: bool = True`
parameter. The ack send is wrapped in a try/except so a Telegram API hiccup
cannot block the Claude call.

### 1.2 Timeout raised from 120s to 300s

`CLAUDE_TIMEOUT` changed from 120 to 300 seconds.

Rationale: Opus (claude-opus-4-8) on complex tasks with multi-tool use and
long context regularly runs 90-180s. The old 120s ceiling caused spurious
timeout errors mid-run. 300s gives a safe ceiling.

The user experience impact of the longer timeout is now zero: jecki sees
"On it, Jecki..." within ~1s of sending, so the wait is not a blank screen.

The retry logic (up to 5 attempts with exponential backoff) is unchanged.
Each attempt still has its own 300s window, so worst-case wall-clock is
~25 minutes (5 x 300s + backoff). That is a degenerate case and the
existing error message ("Timed out... Please resend.") surfaces it clearly.

### 1.3 New module constant

  ACK_MESSAGE = "On it, Jecki..."

Changing this string in future requires no logic change -- edit the constant.

---

## 2. Architecture evaluation

### 2.1 Webhook timeout -- not applicable

This bridge uses long-polling (`updater.start_polling()`), NOT webhooks.
In long-polling mode, python-telegram-bot polls Telegram's servers and
the bridge process owns the full request lifecycle. There is NO 60-second
Telegram webhook server timeout to worry about. The timeout that matters
is `CLAUDE_TIMEOUT` (the subprocess timeout), which is now 300s.

Conclusion: no webhook architecture change needed.

### 2.2 Streaming / partial delivery -- feasibility assessment

The current bridge calls the `claude` CLI with `--print --output-format json`,
which waits for the complete response before returning. Partial delivery
would require one of two approaches:

Option A -- CLI streaming mode
  Use `--output-format stream-json`. The CLI emits newline-delimited JSON
  events as Claude generates tokens. The bridge would need to read
  stdout incrementally from the subprocess (using asyncio subprocess
  instead of the blocking subprocess.run), parse each event, and call
  bot.send_message() or editMessageText() progressively.

  Pros: No new dependencies. Stays on OAuth/CLI path.
  Cons: Significant refactor of call_claude_cli(). Telegram's editMessageText
        has a rate limit of ~1 edit per second per message. Token-level streaming
        would hit this constantly. Practical approach would be line-by-line or
        paragraph-by-paragraph, requiring a chunking heuristic.

Option B -- Anthropic Python SDK with streaming
  Replace the subprocess entirely with `anthropic.AsyncAnthropic` and
  `client.messages.stream()`. Send partial text chunks to Telegram via
  editMessageText as they arrive.

  Pros: Clean async design. Well-documented streaming API.
  Cons: Requires switching auth from CLAUDE_CODE_OAUTH_TOKEN to
        ANTHROPIC_API_KEY (billed per token on API rates, not subscription).
        This is the customer-facing auth migration documented in bridge.py
        (OWNER_ONLY_MODE = False path). That migration is a separate A1
        decision -- see the TODO block in bridge.py module docstring.

Recommendation: hold streaming for a future sprint. The two-message ack
pattern solves the UX problem (blank screen during processing) without any
architecture risk. Streaming is desirable but requires either a meaningful
refactor (Option A) or an auth model change (Option B), both of which need
Ido review and an A2 approval minimum before work begins.

---

## 3. Integration test spec (cannot run live without tokens)

Since bridge tokens live in .env and production deploy requires A1, here
is what the integration test would verify:

### Test T-001: ack appears before reply

  Setup:
    - Bridge running locally with test bot tokens
    - Recorded Telegram message timestamps available via getUpdates

  Steps:
    1. Send a text message to the Eco bot.
    2. Record timestamp T1 of the sent message.
    3. Wait for two bot messages in the chat.

  Expected:
    - First bot message = "On it, Jecki..."
    - Timestamp of first bot message T2 is within 2s of T1.
    - Second bot message = Claude's response (non-empty, not an error).
    - Timestamp of second bot message T3 > T2.

  Failure criteria:
    - Only one bot message received.
    - First message is Claude's response (ack was skipped).
    - T2 - T1 > 5s (ack was not immediate).

### Test T-002: /start sends no ack

  Steps:
    1. Send /start to the Eco bot.
    2. Wait for bot message(s).

  Expected:
    - First (and only initial) bot message is the greeting + task list.
    - No "On it, Jecki..." message appears.

### Test T-003: /tasks sends ack

  Steps:
    1. Send /tasks to the Eco bot.
    2. Wait for bot messages.

  Expected:
    - First bot message = "On it, Jecki..."
    - Second bot message = task list.

### Test T-004: timeout error path (mocked)

  Setup:
    - Monkey-patch call_claude_cli() to raise RuntimeError("timeout:300s").

  Expected:
    - "On it, Jecki..." is sent first.
    - Error message "[Eco] Timed out (300s) after retry..." is sent second.
    - No crash; bridge continues to accept messages.

### Test T-005: ack send failure is non-fatal

  Setup:
    - Monkey-patch update.message.reply_text to raise Exception on first call.

  Expected:
    - Warning logged: "Failed to send ack message..."
    - Claude call still proceeds.
    - Claude's response is delivered as the final message.

---

## 4. No new dependencies

No new Python packages required. All changes are within existing
python-telegram-bot and asyncio primitives. requirements.txt is unchanged.

---

## 5. Steps requiring sign-off before production

The following items need explicit approval before this goes live:

STEP 1 -- Ido review of the diff (A2 minimum)
  Gate: A2 (architecture/code change in live integration).
  What: Review bridge.py changes -- new send_ack param, CLAUDE_TIMEOUT
        increase, ACK_MESSAGE constant.
  Who: Ido (VP R&D).

STEP 2 -- Eco adds A1 prod-deploy gate to bridge context (per certification note)
  Gate: A1.
  What: Per SHIR-001 certification condition, Eco must add the A1 prod-deploy
        gate to the bridge context before any bridge deploy. Confirm this is
        in place or that Eco has acknowledged it.
  Who: Eco (CEO) + Ido routing.

STEP 3 -- Rambo security clearance (per CLAUDE.md red line 4 + cert note)
  Gate: A2 (Security gate).
  What: Rambo reviews the diff for injection risk, data-exposure risk, and
        confirms no new tools or permissions are adopted.
        No new external packages are introduced (no Security + Legal gate
        needed for that), but the code change in integrations/ still requires
        a Rambo scan per the certification note.
  Who: Rambo (Security), routed through Ido.

STEP 4 -- Owner A1 approval to deploy
  Gate: A1.
  What: jecki (owner) explicitly approves the production deploy in this session
        or a documented approval message. This must be on record before
        `python bridge.py` is (re)started on the bridge host.
  Who: jecki.

STEP 5 -- Restart bridge process on bridge host
  Command: Stop existing bridge.py process (Ctrl+C or process kill), then
           restart: `python bridge.py` from inside the venv.
  Note: No pip install needed. No .env change needed.
  Note: If bridge-git-sync.py is in use, it will pick up the bridge.py change
        automatically on the next Direction C pull -- no separate action needed.

STEP 6 -- Smoke test after restart
  Verify T-001 and T-002 from the integration test spec above manually:
    - Send a message to Eco bot -> confirm "On it, Jecki..." appears first.
    - Send /start -> confirm no ack, greeting appears directly.
  Log to memory/log.md: "SHIR-001 deployed and smoke-tested YYYY-MM-DD".

---

## 6. Rollback

If the deploy causes issues:
  - Stop bridge.py.
  - Restore bridge.py from git: `git checkout HEAD~1 -- integrations/telegram-bridge/bridge.py`
  - Restart bridge.py.
  - Gate: A2 (emergency hotfix rollback, incident active) per Shir role file.
  - Log rollback event to memory/log.md.

---

## 7. Open questions for Ido

Q1: Should the ACK_MESSAGE be agent-specific?
    ("On it, Jecki..." works for both Eco and Shelly. If Shelly should have
    a different ack tone, I can add a per-bot ack string in make_handlers().)

Q2: Streaming sprint -- schedule?
    Option A (CLI stream-json) is the lower-risk path if we want streaming
    without changing auth. Worth a dedicated SHIR sprint. Needs A2 approval
    to start. Flag when to add it to the board.

Q3: Timeout ceiling -- is 300s right for all cases?
    5 minutes is generous for Sonnet. It is defensible for Opus. If we want
    different ceilings per model (e.g. 180s for Sonnet, 360s for Opus),
    that is a small follow-up change. Low priority given ack pattern absorbs
    the UX impact.
