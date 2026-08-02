# APS-031-SEC: Hosted Real-Demo Security Gate
# Author: Rambo (Security, L3, P1)
# Date: 2026-08-02
# Task: APS-031-SEC (from Eco, owner A1 2026-08-02)
# Scope: delta from GR-016 (stub-only demo, CLEAR-WITH-CONDITIONS) to
#        a REAL Anthropic API provider serving an internet-reachable hosted app
#        accessed by one external user (Adam, design partner).
# Files verified: demo-deploy-plan-shir-2026-07-12.md, render.yaml,
#   llm.module.ts, engine/src/index.ts, engine/src/llm/providers/,
#   app.config.ts, pnpm-lock.yaml (grep), gate-register GR-016,
#   decisions-log 2026-08-02 (both entries), anthropic-dpa-review-eyal.md,
#   security-baseline.md, board APS-031 row.
# ASCII only. Internal only. Not for external sharing.

---

## VERDICT: PASS-WITH-CONDITIONS

Six blocking conditions (AC-1 through AC-6) must ALL be met before go-live.
Legal leg (Eyal, APS-031-LEGAL) is co-required; this gate does not close Eyal's leg.
Owner A1 still required for actual deploy and API account provisioning.

---

## 1. Baseline: what GR-016 cleared

GR-016 (2026-07-12, gate-register) cleared the APS hosted demo surface with 10 conditions
(DEMO-C1 through DEMO-C10) for a STUB-ONLY instance: no real LLM, no real student data,
one external user (Adam), free-tier hosting (Vercel+Render+Supabase), short-lived.

The DEMO-C10 addendum (2026-07-14) cleared Vercel, Render, and Supabase as platforms.

GR-016 explicitly stated: "StubProvider only (no real LLM)" was a hard non-negotiable.

---

## 2. What changed (delta requiring this re-gate)

Owner A1 (decisions-log 2026-08-02) overrides GR-016 demo guardrail #2 (stub-only):
the demo must now serve a REAL Anthropic patient response to Adam via a paid Anthropic
API account. This adds:

  (a) Real-LLM egress: patient/guard/analyser/evaluator prompts leave the box to
      the Anthropic API on every simulation turn.
  (b) New dependency: @anthropic-ai/sdk (not yet in codebase -- confirmed by grep
      across all package.json and pnpm-lock.yaml; zero matches).
  (c) New provider adoption: AnthropicProvider (code does not exist yet; commented
      out in llm.module.ts: "// case anthropic: ... // APS-004 gate required").
  (d) New secret: ANTHROPIC_API_KEY must be stored and injected at runtime.
  (e) External user + real LLM: Adam's typed input now reaches a real language model.

What does NOT change: hosting platforms (same Vercel+Render+Supabase already cleared),
auth model, synthetic-data constraint, kill/rollback runbook.

---

## 3. Verified state of the codebase

3.1 @anthropic-ai/sdk: ABSENT. Grep confirmed zero occurrences in any package.json
    or lockfile under projects/ai-patient-simulator/app. The SDK must be added as a
    new dependency by APS-031-BUILD before it can be used.

3.2 AnthropicProvider: ABSENT. packages/engine/src/index.ts exports only StubProvider
    and ClaudeCodeProvider. llm.module.ts line 48:
      // case "anthropic": return new AnthropicProvider(config); // APS-004 gate required
    No AnthropicProvider file exists in packages/engine/src/llm/providers/.

3.3 app.config.ts: NO ANTHROPIC_API_KEY field. The config class reads from process.env
    via a private getRequired()/getString() pattern. When APS-031-BUILD adds the SDK,
    it must add ANTHROPIC_API_KEY via getRequired() so the key is NEVER hardcoded
    and is never surfaced in logs or serialized into any API response.

3.4 render.yaml (as filed): LLM_PROVIDER: stub; NO ANTHROPIC_API_KEY entry; all three
    real secrets (DATABASE_URL, JWT_SECRET, DEMO_TEACHER_PASSWORD) correctly use
    sync: false. The file passes DEMO-C7 in its current state. When updated for
    the real-LLM upgrade, it must be re-scanned before commit (see AC-3).

3.5 ClaudeCodeProvider: dev-only; shells to owner's local claude CLI; CANNOT serve a
    hosted Render deployment (no desktop binary, no Max subscription on Render). Not
    the APS-031 production path for the hosted instance.

---

## 4. Risk assessment (delta from GR-016)

### R1 -- Real-LLM egress (MEDIUM)

Patient response prompts (clinical-adjacent roleplay text), guard-pass prompts,
analyser prompts, and evaluator prompts now leave the Render box to the Anthropic API.
The data transmitted is synthetic (seed data only; no real student names, no real
clinical records). Adam's typed input also reaches the LLM.

Residual risk: even synthetic clinical-adjacent prompts constitute potentially sensitive
content in transit. Anthropic's API is a trusted endpoint (already vetted by Eyal,
anthropic-dpa-review-eyal.md, CLEAR-WITH-CONFIG). No risk change on the transit side.

Prompt injection risk: MEDIUM-HIGH delta from LOW (stub). With a real LLM, Adam could
attempt adversarial inputs designed to extract information or produce inappropriate
patient responses. MITIGATION: the existing GuardRunner (packages/engine/src/pipeline/
guard-runner.ts) runs a guard-pass check on every simulation turn -- it validates
patient output before returning it to the caller. The existing InputGate
(packages/engine/src/pipeline/input-gate.ts) enforces turn budgets and hard limits.
Both are already in the codebase and will operate regardless of which LLM provider
is active. Adam is a trusted design partner, not an adversarial actor.

Residual after mitigation: LOW-MEDIUM. GuardRunner + InputGate significantly reduce
the blast radius; single trusted external user further limits it.

### R2 -- New dependency @anthropic-ai/sdk (MEDIUM until pinned)

Not yet in the codebase. Risk: floating or unpinned install could pull a malicious
future version (consistent with security-baseline.md standing standard: no auto-update).
Risk: postinstall scripts in the SDK could execute arbitrary code at install time.
Risk: injection vectors in SDK source (unlikely for official Anthropic SDK but must
be confirmed per repo-scan standing rule).

The @anthropic-ai/sdk is published and maintained by Anthropic Inc. It is the official
client SDK for the Anthropic API. Based on my knowledge of the SDK through August 2025
it has no postinstall scripts, no telemetry beyond the API calls themselves, and no
.cursorrules or CLAUDE.md injection vectors.

CANNOT CONFIRM live repo state without reading the current npm registry source, which
I cannot do in this session (no WebFetch to npm registry in scope here). APS-031-BUILD
(Ido/Gal) must install a pinned exact version; Rambo must perform the standing repo
scan (no .claude/, CLAUDE.md, .cursorrules, postinstall hooks) before Ido commits it
to the codebase. This is Condition AC-2.

### R3 -- AnthropicProvider implementation (MEDIUM until code review)

The provider does not exist yet. Risk: the implementation could log the API key,
hardcode it, expose it in error messages, serialize it into HTTP responses, or
include it in any tracked file. The ClaudeCodeProvider (claude-code.provider.ts)
is the reference implementation and correctly avoids all of these -- it takes no
API key (uses the CLI's auth). The AnthropicProvider will need an API key passed
in, and the only safe path is reading it from AppConfig (which reads from process.env).

Rambo must review the implementation before it is deployed. Specifically: verify
(a) ANTHROPIC_API_KEY read from AppConfig.getRequired() only, never hardcoded;
(b) the key is not present in any log.warn(), console.log(), or error message;
(c) the key is not serialized into any response DTO or JSON output;
(d) httpClient/SDK client is not shared across requests in a way that leaks the key.
This is Condition AC-5.

### R4 -- Secret handling (LOW if sync:false)

render.yaml currently has no ANTHROPIC_API_KEY entry. When Ido/Gal updates it,
the entry MUST use sync: false (key set in Render dashboard only; never inline).
This matches the existing pattern for DATABASE_URL, JWT_SECRET, and
DEMO_TEACHER_PASSWORD, which all correctly use sync: false.
The updated render.yaml must be re-scanned by Rambo before commit (DEMO-C7 successor).
This is Condition AC-1 + AC-3.

### R5 -- Anthropic AUP AI disclosure requirement (MEDIUM -- compliance risk)

Eyal flagged this in anthropic-dpa-review-eyal.md section 2.5(b): the Anthropic AUP
requires disclosure that AI assisted in producing outputs "at a minimum at the beginning
of each session." APS is a healthcare/education high-risk category use case per the AUP.
The demo must include a visible indication to Adam that the patient is AI-generated.
This is a terms compliance requirement, not just a best-practice.

The existing demo plan (Section 15) already says: "Note: patient replies show [STUB]
text -- this is intentional; real AI responses are a later phase." With real LLM, the
[STUB] label disappears. The disclosure obligation now applies.

Mitigation: Shir must confirm the demo UI includes a visible "AI patient simulation"
indicator or equivalent at the start of each session. This is Condition AC-6.

---

## 5. GR-016 conditions -- status under the real-LLM upgrade

| Condition | Status | Notes |
|-----------|--------|-------|
| DEMO-C1 (network topology) | INHERITED -- BINDING | No change. DB still Supabase-only; no admin panel via Adam's URL; HTTPS automatic on Render+Vercel. Shir confirms at deploy. |
| DEMO-C2 (auth hardening) | INHERITED -- BINDING | No change. Login rate-limit, bcrypt, JWT 1d expiry, no token in logs. Already in codebase. Shir confirms at deploy. |
| DEMO-C3 (kill switch) | INHERITED -- BINDING | No change. JWT rotation = instant session kill; account delete via Supabase SQL editor. Runbook must exist before go-live. |
| DEMO-C4 (synthetic data HARD) | INHERITED -- HARDER | Still binding and HARDER under real LLM. A real LLM amplifies any real-data leak: if a real student name or clinical record enters the DB by accident, the LLM will echo it. Shir spot-check + Rambo counter-sign required before go-live. |
| DEMO-C5 (DB isolation) | INHERITED -- BINDING | Separate Supabase project from any future pilot. No change. |
| DEMO-C6 (StubProvider only) | SUPERSEDED | Overridden by owner A1 2026-08-02. Replaced by AC-1 (API key secret isolation) and AC-3 (render.yaml re-scan). New requirement: LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY sync:false in render.yaml. |
| DEMO-C7 (no secrets in tracked files) | RE-APPLIES | render.yaml must be re-scanned after update (see AC-3). |
| DEMO-C8 (Adam role) | NOTE -- CONTRADICTION IN PRIOR DOCS | GR-016 DEMO-C8 says "student-role only"; deploy plan Section 5 says "TEACHER account for the full dashboard experience." Deploy plan governs the actual implementation. Neither changes with LLM upgrade. Shir confirms Adam has no admin or debug access. |
| DEMO-C9 (teardown runbook) | INHERITED -- BINDING | Now also includes: delete Anthropic API key from Render secret store at teardown. Owner action. |
| DEMO-C10 (hosting platform gate) | ALREADY CLEARED (2026-07-14) | Same platforms; no change. |

---

## 6. Blocking conditions for go-live (ALL required before the real-LLM demo goes live)

AC-1 (SECRET ISOLATION -- HARD):
  ANTHROPIC_API_KEY must appear in render.yaml ONLY as sync: false.
  Never as a plaintext value in render.yaml or any committed file.
  Owner sets the key in the Render dashboard only.
  Owner: execute. Shir: confirm no committed plaintext value before triggering deploy.

AC-2 (@anthropic-ai/sdk PIN -- HARD):
  APS-031-BUILD (Ido/Gal) must pin @anthropic-ai/sdk to an EXACT version in package.json
  (e.g., "@anthropic-ai/sdk": "0.X.Y" -- exact, no ^ or ~).
  No floating install, no latest, no bare npx invocation.
  Rambo must be notified of the exact version number before it is committed so the
  standing repo-scan can run (no .claude/, CLAUDE.md, .cursorrules, postinstall scripts).
  Ido to notify Rambo on pinned version selection. Gate-register GR-023 will record pin.
  No-auto-update: any SDK version bump requires advance Rambo approval.

AC-3 (RENDER.YAML RE-SCAN -- HARD):
  Before committing the updated render.yaml (with LLM_PROVIDER=anthropic +
  ANTHROPIC_API_KEY sync:false entry), Ido or Shir sends the updated file to Rambo
  for a DEMO-C7-successor secret scan. Rambo confirms:
    (a) No ANTHROPIC_API_KEY value is inline (sync: false is present).
    (b) No DATABASE_URL, JWT_SECRET, DEMO_TEACHER_PASSWORD value is inline.
    (c) LLM_PROVIDER=anthropic (no "stub" confusion).
    (d) No other plaintext secret visible.
  Rambo counter-signs. File may be committed only after Rambo counter-sign.

AC-4 (SYNTHETIC DATA GATE -- HARD, inherited from DEMO-C4):
  Before go-live, Shir confirms the demo DB contains ONLY seed/synthetic data.
  Spot-check query required (SELECT email FROM "User" showing all @synthetic.test).
  Shir sends spot-check output to Eco; Rambo counter-signs.
  This condition is HARDER under real LLM than under stub (real LLM will echo real data).

AC-5 (ANTHROPIC PROVIDER CODE REVIEW -- HARD):
  When APS-031-BUILD delivers the AnthropicProvider implementation, Rambo reviews
  before it is deployed:
    (a) ANTHROPIC_API_KEY read via AppConfig.getRequired() (or equivalent env-only path);
        never hardcoded in any source file.
    (b) The key does not appear in any console.log(), logger.warn(), or error message.
    (c) The key is not serialized into any LLMResponse, HTTP response, or log file.
    (d) Anthropic SDK client instantiation does not capture the key in any exported
        object or shared state visible outside the provider class.
  Ido to notify Rambo when the AnthropicProvider PR is ready for review.
  Build is not merged to the demo branch until AC-5 is cleared.

AC-6 (AUP AI DISCLOSURE TO ADAM -- HARD):
  Per Anthropic AUP section 2.5(b) (Eyal, anthropic-dpa-review-eyal.md): disclosure
  that AI is generating patient responses is required at the beginning of each session.
  The demo UI must show a visible label (e.g., "AI patient simulation -- powered by
  Claude" or equivalent) at session start. The former [STUB] label is gone with real LLM.
  Shir confirms this indicator is visible before handing the demo link to Adam.
  Owner: review and approve the disclosure language before send.

---

## 7. Non-blocking conditions (pre-go-live advisory)

AC-7 (ANTHROPIC ACCOUNT TIER -- Eyal leg):
  Eyal's APS-031-LEGAL must confirm whether the demo use of a paid Anthropic API account
  with synthetic data requires the commercial DPA or falls under the 2026-08-02 DPA
  re-key (internal/dev activity, no real customer data). Eyal's verdict gates the legal
  leg. Rambo defers to Eyal; this is not a Rambo blocking item.
  Reference: anthropic-dpa-review-eyal.md (CLEAR-WITH-CONFIG, three owner config steps);
  decisions-log 2026-08-02 DPA entry (re-key: DPA not required for internal/dev/synthetic).

AC-8 (GUARD AND INPUT GATE ACTIVE ON DEMO INSTANCE):
  Shir confirms in the validation step (deploy plan Step 14 analog) that GuardRunner
  and InputGate are active on the demo instance -- not disabled by any env var.
  A quick smoke test: run one simulation turn with an adversarial student input and
  confirm the guard-pass check fires (visible in Render logs).

AC-9 (LLM CALL RATE -- ADVISORY):
  Each simulation turn on the real-LLM demo triggers up to 4 API calls
  (patient response, guard pass, analyser, evaluator). At Adam's solo demo pace
  this is negligible cost. The InputGate hard turn limit (DEFAULT_TURN_BUDGET in
  input-gate.ts) is the existing circuit breaker and remains binding.
  Owner: inform Lital of the expected API cost before go-live (Lital cost-sizing
  is a separate APS-031 leg per the board row).

---

## 8. Mitigation summary table (standing standard, security-baseline.md)

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| Real-LLM egress (R1) | Shir + Ido | AC-8: confirm GuardRunner+InputGate active | Ido (R&D) | GuardRunner + InputGate are the permanent architectural controls |
| @anthropic-ai/sdk (R2) | Ido/Gal | AC-2: pin exact version; notify Rambo for repo-scan | Ido (R&D) | AC-2 pin + no-auto-update standing rule |
| AnthropicProvider secret handling (R3) | Ido/Gal | AC-5: Rambo code review before merge | Ido (R&D) | AppConfig.getRequired() pattern (same as DATABASE_URL etc.) |
| ANTHROPIC_API_KEY in render.yaml (R4) | Owner + Shir | AC-1: sync:false; AC-3: Rambo re-scan | Owner | Render dashboard only; never committed as plaintext |
| AUP AI disclosure (R5) | Shir | AC-6: visible AI indicator in demo UI | Shir/Ido | Session-start disclosure label |

---

## 9. Gate-register entry text (for gate-register.md GR-023)

GR-023 -- APS-031 Hosted Demo: Real Anthropic API Provider (2026-08-02)

Purpose: upgrade GR-016 (stub-only demo) to a real Anthropic API provider for Adam's
self-serve hosted demo. Delta gate covering: real-LLM egress, @anthropic-ai/sdk
new dependency, AnthropicProvider implementation, ANTHROPIC_API_KEY secret handling.
Triggered by: owner A1 2026-08-02 (decisions-log 2026-08-02 "Adam demo pivots to
LIVE hosted real-patient app"). Overrides GR-016 demo guardrail #2 (stub-only).

Rambo verdict: PASS-WITH-CONDITIONS (6 blocking: AC-1 through AC-6).
Eyal verdict: PENDING (APS-031-LEGAL leg; required before go-live).
Owner A1: required for API account provisioning + actual go-live deploy.

Blocking conditions: AC-1 (ANTHROPIC_API_KEY sync:false only), AC-2 (@anthropic-ai/sdk
pinned exact version + Rambo repo-scan), AC-3 (render.yaml re-scan before commit),
AC-4 (synthetic data spot-check + Rambo counter-sign), AC-5 (AnthropicProvider code
review -- API key never logged/serialized), AC-6 (AUP AI disclosure in demo UI).

GR-016 conditions DEMO-C1 through DEMO-C5, DEMO-C7 through DEMO-C10 remain binding.
DEMO-C6 (stub-only) is SUPERSEDED by this gate and owner A1 2026-08-02.

Full findings: company/governance/gate-aps031-hosted-real-demo-rambo-2026-08-02.md
Opened by: Rambo | Date: 2026-08-02 | Triggered by: APS-031-SEC task (Eco, owner A1)

---

## 10. What is NOT in scope for this gate (Eyal's leg)

Legal terms review (APS-031-LEGAL) is Eyal's leg. Rambo does not duplicate it.
Specifically out of scope for this gate:
  - Anthropic commercial terms / DPA applicability for the demo
  - Whether the 2026-08-02 DPA re-key (internal/dev, synthetic data) satisfies
    Eyal's prior CLEAR-WITH-CONFIG conditions (anthropic-dpa-review-eyal.md steps 1-3)
  - Vercel/Render ToS commercial-use question (flagged but not blocking per DEMO-C10)

Eyal's verdict is a co-required gate. Do not go live on Rambo's PASS alone.

---

Document control: internal only. No legal commitment. Append-only after delivery.
