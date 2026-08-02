# APS-031-BUILD: AnthropicProvider -- Scope Envelope
ido 2026-08-02 | owner A1 2026-08-02 | demo gate: synthetic data only; APS-004 not required

---

## Context

Demo instance needs a real LLM provider. ClaudeCodeProvider shells to owner's local CLI
(Max sub, desktop binary) -- cannot run hosted. StubProvider returns fixed strings -- Adam
sees no real patient. Neither is viable for the self-explore demo.

AnthropicProvider wraps the Anthropic Messages API directly via @anthropic-ai/sdk.
LLM_PROVIDER=anthropic activates it. Fail-safe: unknown LLM_PROVIDER values already fall
back to stub (existing default case in buildProvider()).

Source of truth for interface: packages/engine/src/llm/provider.interface.ts (2 methods).
Implementation model: packages/engine/src/llm/providers/claude-code.provider.ts.
Wiring point: apps/api/src/llm/llm.module.ts buildProvider(), case "anthropic" placeholder
is already present as a comment -- uncomment + implement.

---

## 1. AnthropicProvider Scope

### 1a. File location

packages/engine/src/llm/providers/anthropic.provider.ts

Export it from @aps/engine (same barrel as StubProvider + ClaudeCodeProvider).
Import it in llm.module.ts alongside the existing imports.

### 1b. ModelHint -> model mapping

Two tiers, env-var-driven (no hardcoded model IDs -- ops changes model without a code
edit, same pattern as ClaudeCodeProvider options).

Env vars read in constructor (follow the S3/claude-code pattern -- SDK reads its own key
from ANTHROPIC_API_KEY directly; never surface the key via AppConfig, never log it):

  ANTHROPIC_PATIENT_MODEL  -- default recommendation: claude-sonnet-4-6
  ANTHROPIC_LIGHT_MODEL    -- default recommendation: claude-haiku-3-5 (or sonnet if haiku
                              proves unreliable; benchmark before deciding; see note below)

Note on haiku vs CLI: the ClaudeCodeProvider comment records that haiku was 45s vs sonnet
5.9s on the CLI path due to runaway generation. That is a CLI-specific artefact (no
max_tokens enforcement over the binary). On the direct Messages API, max_tokens IS
enforced, so haiku is genuinely cheaper and faster for light hints. Benchmark 5-10 real
GUARD_PASS / ANALYSER calls before setting ANTHROPIC_LIGHT_MODEL in demo env.

Mapping (mirrors ClaudeCodeProvider exactly):

  PATIENT_RESPONSE -> patientModel (highest quality)
  EVALUATOR        -> patientModel (high quality)
  DEBRIEF          -> patientModel (moderate; same tier for simplicity)
  GUARD_PASS       -> lightModel   (structured JSON, can be lighter)
  ANALYSER         -> lightModel   (structured JSON)
  SUMMARISER       -> lightModel   (text summary)
  default          -> lightModel   (fail-safe for any future hints)

### 1c. Messages API call

  client.messages.create({
    model:      modelForHint(req.modelHint),
    system:     <system messages joined, with OUTPUT_DISCIPLINE prepended>,
    messages:   <non-system messages as {role, content}>,
    max_tokens: req.maxOutputTokens,
    temperature: req.temperature,
  })

OUTPUT_DISCIPLINE constant: identical to ClaudeCodeProvider's -- instructs the model to
emit only the requested content, no preamble, bare JSON when JSON is asked. Copy verbatim;
both providers share the same output contract.

stripCodeFence() helper: copy from ClaudeCodeProvider. Model may still add fences despite
OUTPUT_DISCIPLINE; strip them. Provider returns clean text; engine's service layer does
JSON.parse() for GUARD_PASS / ANALYSER / EVALUATOR hints.

LLMResponse fields from Messages API:
  text:         response.content[0].text (after stripCodeFence)
  inputTokens:  response.usage.input_tokens
  outputTokens: response.usage.output_tokens
  modelId:      "anthropic:" + response.model
  cached:       response.usage.cache_read_input_tokens > 0 (if prompt-cache enabled; else false)

### 1d. Error and timeout handling

  Timeout: pass timeout option to SDK client constructor (per-tier):
    patient tier: 120_000 ms (default, matches ClaudeCodeProvider)
    light tier:   60_000 ms (shorter; light calls should be fast)
  Override via ANTHROPIC_TIMEOUT_MS env var if needed for demo tuning.

  Anthropic SDK throws typed errors on non-2xx. Catch Anthropic.APIError + rethrow as
  plain Error with model, status code, and first 200 chars of message for diagnostics.
  No silent swallowing.

  Rate limit (429) / overload (529): catch, rethrow with explicit label so the caller can
  distinguish from a model-content error. No retry in the provider (engine or caller retries
  if needed; keep provider thin).

### 1e. estimateCost()

Returns cost in USD (float). Formula:

  (inputTokens / 1_000_000) * INPUT_PRICE_USD[hint_tier]
  + (outputTokens / 1_000_000) * OUTPUT_PRICE_USD[hint_tier]

Define two price-pair constants at the top of the file:

  PATIENT_INPUT_USD_PER_MTOK  -- from Anthropic pricing page at implementation time
  PATIENT_OUTPUT_USD_PER_MTOK
  LIGHT_INPUT_USD_PER_MTOK
  LIGHT_OUTPUT_USD_PER_MTOK

These are named constants (not magic numbers) so a price change is a one-line edit.
Gal looks up current Anthropic API pricing page at implementation time and fills in the
exact values. Rambo confirms the pricing source is the official page during APS-031-SEC.

If the model ID in use does not match either tier (unexpected), return 0 and log a warning
(same pattern as the unknown LLM_PROVIDER fallback -- never silently lie about cost).

### 1f. ANTHROPIC_API_KEY secret handling

The Anthropic SDK reads ANTHROPIC_API_KEY from process.env automatically. Gal does NOT
add this key to AppConfig, does NOT log it, does NOT reference it in code.
In .env (gitignored): ANTHROPIC_API_KEY=<key>
Red line 5 (no secrets to git) and red line 1 (.env blocked) apply throughout.
Owner provisions the key (A1). Gal confirms the SDK picks it up in the smoke test.

---

## 2. Dependency

  @anthropic-ai/sdk  exact version TBD

Cannot self-grant. Exact version determined during APS-031-SEC (Rambo gate). Protocol:
  1. Gal identifies the current latest stable version from npmjs.com at gate time.
  2. Rambo reviews security posture + license + terms during APS-031-SEC.
  3. Rambo names the approved exact version in the gate report.
  4. Gal installs at that exact pinned version (no caret, no tilde).
  5. Version recorded in gate-register.md by Rambo (same entry as APS-031-SEC).
  6. No pin bump without advance Rambo approval (global no-auto-update rule).

This is the critical-path gate for the whole task. Build cannot start until APS-031-SEC
clears. Eco dispatches Rambo for APS-031-SEC in the same session this envelope lands.

---

## 3. Assignee + Eng-Days + Done Criteria + Sprint Slot

### Assignee

Gal (Lead Dev). Same rationale as T-0004: new provider is a code-layer task.
Reviewer: Oren (independent review, standing rule before any close).
QA gate: Adi (standing rule).

### Eng-days estimate

  APS-031-SEC (Rambo, gate): 0.5 days (SDK review is bounded; provider is first-party Anthropic)
  Gal build:
    Day 1 -- AnthropicProvider skeleton + modelForHint + Messages API call + stripCodeFence
    Day 1.5 -- estimateCost() + error/timeout handling + constructor options
    Day 2 -- unit tests (mock SDK client, cover 6 ModelHint branches + error/timeout paths)
    +0.5 -- live smoke test against real API key (one GUARD_PASS call; Gal runs locally)
  Total Gal: 2.5 eng-days

  Oren review: 0.5 eng-days (can run partially parallel with Gal's test writing)
  Adi QA gate: 0.5 eng-days (coverage check + smoke test sign-off)

  Critical path (sequential): 0.5 (Rambo) + 2.5 (Gal) + 0.5 (Oren) + 0.5 (Adi) = ~4 days
  If Rambo gate clears 2026-08-03 and Gal starts same day -> done ~2026-08-07.
  Buffer to 2026-08-15 rehearsal: 8 days. Adequate.

### Done criteria (release gate)

  1. anthropic.provider.ts compiles clean (tsc --noEmit, zero errors -- same gate as CI).
  2. Exported from @aps/engine barrel alongside StubProvider + ClaudeCodeProvider.
  3. Imported in llm.module.ts; case "anthropic" uncommented and wired.
  4. Unit tests: mock @anthropic-ai/sdk, cover all 6 ModelHint branches for complete()
     (correct modelId in response, correct tier used), cover estimateCost() for both tiers,
     cover APIError catch + re-throw, cover timeout catch + re-throw. Min coverage: 80%.
  5. Live smoke test: LLM_PROVIDER=anthropic + real ANTHROPIC_API_KEY in local .env ->
     one GUARD_PASS complete() call returns a parseable GuardResult JSON (not stub text).
     Gal records result in delivery note (text of verdict, token counts, cost from
     estimateCost()) -- no raw key or sensitive content in the delivery note.
  6. Oren independent review sign-off: reads the implementation, confirms error paths and
     secret handling are correct, writes 1-line sign-off in the delivery note.
  7. Adi QA gate: unit test run output (all pass) + smoke test result attached to gate note.
  8. Ido release-gate sign-off before merge to master.

  NOT done criteria (deferred):
  - Streaming (stream?: boolean on LLMRequest is NOT required for the demo).
  - Multi-turn prompt caching beyond the cached field on LLMResponse.
  - The S5-GAL-REQ066 per-hint provider-token wiring (already works: all three tokens call
    buildProvider(); the provider's modelForHint() handles the tier split per call).

### Sprint slot

APS Sprint 10, immediate, P1.
Blocked on APS-031-SEC (Rambo gate) -- that is the only hard gate.
Eco dispatches Rambo for APS-031-SEC from the same interactive session this envelope lands.
Eco dispatches Gal for the build once Rambo confirms the SDK version.

Gal and Oren are owner-spawn-only (SEC-0001). Dispatch queue entries:
  - APS-031-SEC -> Rambo (runner-eligible, Eco can dispatch same session)
  - APS-031-BUILD -> Gal (owner-spawn-only; add to dispatch-queue.md)
  - APS-031-REVIEW -> Oren (owner-spawn-only; add to dispatch-queue.md after Gal delivers)
  - APS-031-QA -> Adi (owner-spawn-only; add to dispatch-queue.md after Oren signs off)

---

## 4. Test Plan

### Unit tests (Gal, day 2)

Location: packages/engine/src/llm/providers/__tests__/anthropic.provider.test.ts

  T1. All 6 ModelHint values: confirm patientModel used for PATIENT_RESPONSE/EVALUATOR/DEBRIEF;
      lightModel used for GUARD_PASS/ANALYSER/SUMMARISER.
  T2. LLMResponse fields: text = stripped content, inputTokens/outputTokens from usage,
      modelId = "anthropic:" + response.model, cached = true when cache_read_input_tokens > 0.
  T3. stripCodeFence: mock SDK returning ```json\n{...}\n``` -> provider returns bare JSON.
  T4. APIError (status 429): provider throws Error with "429" in message, does not swallow.
  T5. APIError (status 529): provider throws Error with "529" in message.
  T6. Timeout: mock SDK to delay past timeout -> provider throws Error with "timed out".
  T7. estimateCost() patient tier: formula check (verify non-zero for non-zero tokens).
  T8. estimateCost() light tier: formula check (lower cost than patient for same token count).

All tests use jest.mock('@anthropic-ai/sdk') -- no real API calls in unit suite.

### Live smoke test (Gal, day 2.5)

  Environment: local .env with ANTHROPIC_API_KEY + LLM_PROVIDER=anthropic
  Run: start API locally; send one /simulation POST or equivalent that triggers a GUARD_PASS call.
  Pass criteria:
    - Response text is valid JSON parseable as GuardResult ({ verdict, violations, suggestion })
    - modelId in UsageLog reads "anthropic:claude-..." (not "stub:...")
    - estimateCost() returns a non-zero float (real tokens billed)
  Failure criteria: stub text, JSON parse error, missing modelId prefix.
  Gal writes result summary to delivery note -- no API key, no raw email, no patient PII.

---

## 5. Open Decisions and Flags for Eco/Owner

  OD-1. SDK version: Rambo determines during APS-031-SEC. Not self-grantable.
  OD-2. Default model IDs (ANTHROPIC_PATIENT_MODEL / ANTHROPIC_LIGHT_MODEL): provisional
        recommendations above (sonnet-4-6 / haiku-3-5). Confirm with Rambo during gate
        (model availability on the API account) and with Eco (cost posture for demo).
        Owner provisions the API account + key (A1) -- this must happen before Gal's smoke
        test.
  OD-3. API key provisioning: owner action (A1, not delegatable). Eco routes the ask.
        Key goes in demo .env only; never committed.
  OD-4. Pricing constants in estimateCost(): Gal fills from official Anthropic pricing page
        at implementation time. If pricing structure has changed since this envelope,
        Gal notes the delta in the delivery note.
  OD-5. Demo deployment env vars: Eco / Shir set LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY
        on the Render instance (or equivalent hosted env). Owner A1 for any production
        deploy. Not in scope for this build task -- build-only scope here.

---

## 6. What This Envelope Does NOT Cover

  - Deploy to Render / hosted env: separate owner A1.
  - API account setup / billing setup: owner action, not R&D.
  - APS-004 production gate: not required for synthetic-data demo (owner override A1 2026-08-02).
  - Streaming support: deferred; not needed for demo.
  - Rate-limiting / retry policy beyond provider-level error re-throw: engine-layer concern.
  - Any cross-group decision: route via Eco.
