# Eco-Synthetic: Multi-LLM Model Router -- Design (FINAL, decisions applied 2026-06-10)

Implements constitution section 17. Owned by Operational Excellence (Assaf) with Quality & Governance (Dalia). Each provider is a tool adoption: Security clears risk, Legal clears terms; paid or borderline is A1.

Purpose (per section 17): diverse second opinions, ethics cross-checks, and redundancy for availability. Not to replace Claude as primary.

**Active plan: Phase A.** Build the router skeleton, stay Claude-only, no spend, no third-party data egress.

---

## 1. What the router is
A thin selection-and-logging layer between an agent and the model providers:
1. **Selects** the brain per task from policy (role files + model matrix); default Claude.
2. **Logs** which model answered each task (model, task_id, tokens, cost, latency, outcome) to the audit log -- required by section 17.
3. **Second opinion:** on high-stakes/ethics-sensitive decisions, optionally asks a *different* family for an independent view (the deciding agent weighs it; no auto-override).
4. **Failover:** on outage, routes to a healthy provider or local model.

It adds no authority: gates, red lines, and loop caps still bind whatever model produces.

---

## 2. Provider candidates and honest constraints (gate intake)

| Provider | Hosted / local | Cost | Data-out | Candidate role | Status |
|----------|----------------|------|----------|----------------|--------|
| Claude (Anthropic) | hosted | current primary | in use | Primary brain | adopted |
| Local open-weight (Llama / Qwen / Hermes weights) | local | no API cost; needs compute/host | none (our hardware) | Second opinion, ethics, offline redundancy | **deferred** |
| OpenAI / Codex | hosted | paid -> A1 | third party | Second opinion / code | **shelved** until budget |
| Gemini | hosted | paid -> A1 | third party | Second opinion / fallback | **shelved** |
| Grok | hosted | paid -> A1 | third party | Second opinion | **shelved** |
| Hermes **Agent** runtime | self-host | runtime, not a model | -- | not a brain -- see claw eval | out of scope |

**Hermes note (verified):** two distinct things share the name -- the open-weight *model* family (a candidate local brain here) and *Hermes Agent*, a separate agent framework (claw eval). Caution: Hermes models are neutrally-aligned with low refusal rates, so they give an independent view but are **not a safety oracle** -- one voice, never the sole ethics check.

**Credential caution (verified):** some external harnesses can reuse stored Claude credentials and run autonomous sessions at machine pace, burning quota and tripping detection. Any router/harness must use scoped, vaulted credentials (red line 5), never the owner's personal login.

---

## 3. Phased rollout
- **Phase A -- now (APPROVED):** Claude-only; build selection + logging skeleton. Zero cost, zero egress.
- **Phase B -- local second brain (DEFERRED):** add one local open-weight model for second opinion/ethics/redundancy when wanted; assess compute (paid host = A1); Security review + gate first.
- **Phase C -- hosted second provider (SHELVED):** only with budget; cost = A1; never customer data without explicit A1 + privacy sign-off.

---

## 4. To merge into `company/model-matrix.md` ("Planned multi-model")

| Task type | Primary | Second opinion | Redundancy / fallback |
|-----------|---------|----------------|-----------------------|
| Decisions & reasoning | Claude | local open-weight (Phase B) | hosted, A1 (Phase C) |
| Code | Claude | OpenAI/Codex, A1 (Phase C) | local model |
| Ethics / morality cross-check | Claude | a different family (local) -- one voice, not the verdict | -- |
| Availability fallback | Claude | any healthy provider (gated) | local model |

Router logs the answering model per task. Populate as each provider clears the gate.

---

## 5. Decisions (owner, 2026-06-10)
1. **Phase A only -- APPROVED.** Claude-only; build the skeleton.
2. **Hard rule -- SET.** No customer data to any third-party model without explicit A1 + a privacy sign-off from Eyal.
3. Local second brain -- **DEFERRED** until wanted (compute host = A1 if paid).
4. Hosted provider -- **SHELVED** until there is budget.
