# Section 4 -- THE LIVE RUN (regenerated 2026-08-02)

Replaces the placeholder Section 4 in `adam-review-package-3session-draft-2026-07-15.md`.
Sections 1-3 of that draft are unchanged and still apply.

**Status:** internal draft for owner review. NOT yet sent to Adam.

---

## 4.0 How this run was produced (read before the numbers)

A real 3-session arc was run end-to-end against the live stack on 2026-08-02.

- **Student turns were scripted; patient state was not.** The 15 student messages were
  written in advance, in Hebrew, the way a student therapist would actually type them --
  session 1 deliberately clumsy, session 2 mixed, session 3 skilled. Every trust /
  openness / alliance number below is what the engine computed. Nothing was authored,
  hand-tuned, or back-filled.
- **Path:** real HTTP API (`invite-login` -> `POST /assignments/:id/attempts` ->
  `POST /simulations/:id/turn` x5 -> `finish`), three contiguous sessions, same student
  (`rehearsal-student-01`), live Postgres. Same code path a real student drives.
- **Provider:** `LLM_PROVIDER=claude-code` -- a real Claude model, reached through the
  local Claude Code CLI.

### Two honesty caveats that bound how far these numbers travel

1. **This is the dev provider, not the production one.** The CLI path ignores
   `temperature` and `maxOutputTokens`. The engine's own header says behaviour observed
   under it is *indicative, not exact*. A production (APS-004) provider will give the
   same mechanics with somewhat different analyser scores.
2. **A stub run cannot be used for this at all.** The default `StubProvider` returns a
   constant analyser result (`empathy: 0.5`) on every turn. The trust rule only moves on
   `empathy >= 0.70` or `<= 0.30`, so trust delta is 0 forever. Verified: 15 identical
   stub turns move trust by exactly 0.0000. Any earlier flat 3-session data was a
   structural artefact of the stub, not a finding about the model.

---

## 4.1 Per-turn trust curve (source: `PatientStateLog`)

Patient opens at trust 0.30, openness 0.20, alliance 0.20.

### Session 1 -- deliberately poor technique
Turns: blunt opener, closed factual question, premature advice ("just try the gym"),
minimisation ("you're overthinking it"), flat close.

| turn | trust | openness | alliance |
|------|-------|----------|----------|
| 1 | 0.260 | 0.200 | 0.200 |
| 2 | 0.220 | 0.200 | 0.200 |
| 3 | 0.180 | 0.200 | 0.200 |
| 4 | 0.140 | 0.200 | 0.200 |
| 5 | 0.100 | 0.200 | 0.200 |

Monotonic decline, -0.04/turn. Openness and alliance never move: raising either requires
`empathy >= 0.60`, which no session-1 turn reached.

### Session 2 -- mixed technique
Opens at 0.15 (session-1 carry, see 4.2), one genuinely empathic turn at turn 2, then
advice-giving again.

| turn | trust | openness | alliance |
|------|-------|----------|----------|
| 1 | 0.110 | 0.200 | 0.200 |
| 2 | 0.160 | 0.200 | 0.200 |
| 3 | 0.120 | 0.200 | 0.200 |
| 4 | 0.080 | 0.200 | 0.200 |
| 5 | 0.080 | 0.200 | 0.200 |

Turn 2 (+0.05) is the one warm turn; the pattern then reverses. Net: the session ends
below where it started.

### Session 3 -- skilled technique
Opens at 0.15 (session-2 carry).

| turn | trust | openness | alliance |
|------|-------|----------|----------|
| 1 | 0.150 | 0.200 | 0.200 |
| 2 | 0.200 | 0.240 | 0.250 |
| 3 | 0.250 | 0.280 | 0.300 |
| 4 | 0.250 | 0.280 | 0.300 |
| 5 | 0.250 | 0.280 | 0.300 |

Trust, openness and alliance all rise together for two turns, then plateau: turns 4-5
scored between the thresholds (below 0.70), so no further delta fired.

---

## 4.2 Per-session summary rows (source: `ArcSessionSummary`)

| session | trustDeltaApplied | finalTrustLevel | finalOpennessLevel | finalAllianceLevel |
|---------|-------------------|-----------------|--------------------|--------------------|
| 1 | -0.150 | **0.150** | 0.200 | 0.200 |
| 2 |  0.000 | **0.150** | 0.200 | 0.200 |
| 3 | +0.100 | **0.250** | 0.280 | 0.300 |

### The floor clamp fired -- twice. This is the headline result.

- Session 1 ended in-session at trust **0.100**; the summary stores **0.150**. The raw
  value was clamped UP to the `minTrust` floor (0.15).
- Session 2 ended in-session at **0.080**; again stored as **0.150**.

This is Example B from Section 3 happening for real: a below-average student cannot drive
the patient into total shutdown, because the floor holds the patient at a clinically
plausible minimum.

### The ceiling never fired.

Trust never approached the 0.70 ceiling -- the best session peaked at 0.250. So this run
**exercises the floor, not the ceiling**. Adam's ceiling questions (asks #1 and #2) are
still open and cannot be answered from this data; a stronger student trajectory over more
turns would be needed to test them.

### Trust continuity across the session boundary holds.

Session 3 turn 1 opens at exactly **0.150** -- the session-2 `finalTrustLevel`. The arc
loader carried the clamped value forward correctly, and session 3 loaded from session 2
(not from session 1).

---

## 4.3 What this run says to Adam

1. **The floor is the binding constraint for weak students, and it works.** Two
   consecutive poor sessions both clamped to 0.15 rather than collapsing. Adam should
   calibrate whether 0.15 is the right "least cooperative plausible" bound -- this run
   shows it being hit repeatedly, so the value matters in practice.
2. **The ceiling is untested by this run.** Ceilings 0.70 / 0.65 / 0.70 remain
   engineering guesses. Adam's ask #1 stands unchanged.
3. **Recovery is slow.** Two bad sessions cost the student more than one good session
   recovers (0.30 -> 0.15 -> 0.15 -> 0.25). Adam should say whether that asymmetry is
   clinically right or too punishing for a training tool.

---

## 4.4 Defects found while producing this run (disclose to Adam only if he asks about difficulty tuning)

These are engineering findings, raised internally; they are not calibration questions for
Adam, but item 1 touches the difficulty dial he may ask about.

1. **The challenge-level dial only works in one direction.**
   `levelMultiplier = clamp(1.4 - (challengeLevel - 1) * 0.2)` where `clamp` caps at 1.0.
   Levels 1, 2 and 3 therefore all yield 1.0 -- identical behaviour. Only levels 4 (0.8)
   and 5 (0.6) differ, both slowing the patient. The documented intent ("level 1 = 1.4x,
   fastest-changing patient") is unreachable. This run was at challengeLevel 2 and moved
   at exactly the unmultiplied rate (+0.05 / -0.04), which is how the defect surfaced.
2. **`notableMomentsSummary` was empty for all three sessions.** It is written from the
   last state log's `contextSummary`, which stays empty when no summarisation pass runs;
   5-turn sessions did not trigger one. This has a rehearsal consequence: criterion (h)
   invariant 2 asks the tester to search the guard prompt for "a distinctive phrase from
   `notableMomentsSummary`" to prove it does not leak. With an empty field that check is
   vacuous and would pass without testing anything. The 15-Aug tester needs sessions long
   enough to trigger summarisation, or the invariant needs restating.

---

## 4.5 Reproduction

```
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter @aps/api build
pnpm --filter @aps/db seed
LLM_PROVIDER=claude-code CLAUDE_CODE_BIN=<...>/@anthropic-ai/claude-code/bin/claude.exe \
  pnpm --filter @aps/api dev:boot
```

`CLAUDE_CODE_BIN` must point at the real `claude.exe`; spawning the npm `claude.cmd`
shim fails with ENOENT. Run wall-clock: ~9 minutes for 15 turns (~25-60s per turn).
