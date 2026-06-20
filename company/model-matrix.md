# Eco-Synthetic: Model Permissions Matrix (v1.0)

Consolidated cross-company view of which LLM each agent may use, by task type. The authoritative per-agent value lives in each role file under "AI model allowed"; this matrix mirrors those fields. Owned by Operational Excellence (Assaf) with Quality & Governance (Dalia). Any change follows the model-adoption gate.

---

## Current state (Claude only)

Rule of thumb: routine and high-volume work runs on Haiku or Sonnet; high-stakes reasoning escalates to Opus.

| Agent | Default | Escalates to | Notes |
|-------|---------|--------------|-------|
| Eco (CEO) | Sonnet | Opus | hard decisions on Opus |
| Hila (Marketing) | Sonnet | - | Haiku for routine |
| Designer (Product UX/UI) | Sonnet | - | Haiku for routine |
| Ido (VP R&D) | Sonnet | Opus | - |
| Gal (Lead Dev) | Sonnet | Opus | hard problems on Opus |
| Roman (Algorithm) | Opus | - | Sonnet for non-hard work |
| Adi (QA) | Sonnet | - | Haiku for routine runs |
| Luci (Devil's Advocate) | Opus | - | Sonnet for minor reviews |
| Zvika (Research) | Sonnet | Opus | deep synthesis on Opus |
| Eyal (Legal) | Sonnet | Opus | borderline on Opus |
| Lital (CFO) | Sonnet | Haiku | routine tallies on Haiku |
| Most L4 specialists | Sonnet | - | Haiku for routine |

For any agent not listed, read its role file's "AI model allowed" field.

---

## Planned multi-model (Phase A approved — Claude-only skeleton; second model deferred)

When the model router is built, this table gains columns by task type:

| Task type | Primary brain | Second opinion | Redundancy / fallback |
|-----------|---------------|----------------|-----------------------|
| Decisions and reasoning | Claude | (deferred — alternate, e.g. Gemini or OpenAI; A1) | (deferred) |
| Code | Claude | (deferred — e.g. OpenAI/Codex; A1) | (deferred — local model) |
| Ethics / morality cross-check | Claude | (deferred — different family; A1) | - |
| Availability fallback | Claude | (deferred — any healthy provider) | (deferred — local model) |

**Hard rule:** no customer data goes to any third-party model without explicit A1 + a privacy sign-off from Eyal (Legal).

Models under consideration: Claude (primary), OpenAI/Codex, Gemini, Grok, Hermes (open-weight), and a local model. Each addition is a gated adoption. Hosted providers cost money (A1 under budget 0) and send data to a third party (privacy and terms). A local model avoids API cost but needs compute. The router logs which model answered each task.

Phase A (Claude-only skeleton) is approved. Adding any second model is deferred until the owner wants it; hosted = A1.
