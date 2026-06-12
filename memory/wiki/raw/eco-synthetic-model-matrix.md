# Eco-Synthetic: Model Permissions Matrix

This is where you see which LLM each agent may use, by task type. The authoritative per-agent value lives in each role file under "AI model allowed"; this matrix is the consolidated cross-company view. Owned by Operational Excellence (Assaf) with Quality & Governance (Dalia). Any change follows the model-adoption gate.

---

## Current state (Claude only)

Rule of thumb: routine and high-volume work runs on Haiku or Sonnet; high-stakes reasoning escalates to Opus.

| Agent | Default | Escalates to | Notes |
|-------|---------|--------------|-------|
| Eco (CEO) | Sonnet | Opus | hard decisions on Opus |
| Shelly (Office Mgr) | Haiku | Sonnet | drafting on Sonnet |
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

For any agent not listed, read its role file's "AI model allowed" field; this matrix mirrors those fields.

---

## Planned multi-model (task 2, pending)

When the model router is built, this table gains columns by task type:

| Task type | Primary brain | Second opinion | Redundancy / fallback |
|-----------|---------------|----------------|-----------------------|
| Decisions and reasoning | Claude | (an alternate, e.g. Gemini or OpenAI) | (a third) |
| Code | Claude | (e.g. OpenAI/Codex) | (local) |
| Ethics / morality cross-check | Claude | (a different family) | - |
| Availability fallback | Claude | any healthy provider | local model |

Models under consideration: Claude (primary), OpenAI and Codex, Gemini, Grok, Hermes (open-weight), and a local model. Each addition is a gated adoption: hosted providers cost money (A1 under budget 0) and send data to a third party (privacy and terms, especially customer data); a local model avoids API cost but needs compute. The router logs which model answered each task. Phase A (Claude-only skeleton) is approved; see `eco-synthetic-model-router-design.md`.
