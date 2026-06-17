# Model Matrix

Consolidated view of which LLM each [[agent-roster|agent]] may use by task type. Owned by [[glossary|OE]] (Assaf) with Quality & Governance (Dalia). Any change follows the model-adoption gate.

## Current state (Claude only)

Rule of thumb: routine and high-volume work runs on Haiku or Sonnet; high-stakes reasoning escalates to Opus.

| Agent | Default | Escalates to | Notes |
|-------|---------|--------------|-------|
| Eco (CEO) | Sonnet | Opus | hard decisions on Opus |
| Shelly (Office Mgr) | Sonnet | - | changed from Haiku 2026-06-15 (owner A1) |
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

Authoritative per-agent value lives in each role file; this matrix mirrors those fields.

## Planned multi-model (Phase A approved; second model deferred)

Phase A (Claude-only skeleton): approved. Adding any second model requires A1. No customer data to any third-party model without explicit A1 + [[agent-roster|Eyal]] (Legal) privacy sign-off.

Models under consideration: Claude (primary), OpenAI/Codex, Gemini, Grok, Hermes (open-weight), local model. Each addition is a gated adoption.

Canonical source: `company/model-matrix.md`

> Source: eco-synthetic-model-matrix.md, ingested 2026-06-13
