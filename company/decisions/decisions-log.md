# Eco-Synthetic: Decisions Log

**Append-only.** Add new entries at the bottom. Never edit or delete existing entries.
Owned by Quality & Governance (Dalia). Pairs with `company/build-log.md`.

Format per entry:
```
## YYYY-MM-DD — [decision title]
- **Author / gate:** [who decided; A1/A2/A3]
- **Decision:** [what was decided]
- **Rationale:** [why]
- **Alternatives considered:** [what was rejected and why]
- **Files affected:** [if any]
```

---

## 2026-06-10 — Hila phase set to P1 light track

- **Author / gate:** jecki (A1)
- **Decision:** Hila (Marketing) is active in P1 on a light track covering avatars, LinkedIn page setup, and build-in-public posts. Publishing stays A1. Full marketing track deferred to P3.
- **Rationale:** Owner wants brand and social presence started in P1, but not at full scale. Publishing gate preserved.
- **Alternatives considered:** P3-only (deferred), full P1 (too early, no product yet).
- **Files affected:** roster.md, `.claude/agents/Hila.md`.

## 2026-06-10 — Logo, palette, avatars deferred to Hila

- **Author / gate:** jecki (A1)
- **Decision:** Creative direction (logo concept, color palette, typography, avatar style) is deferred to Hila. Owner declined to choose creative sight-unseen. Hila presents concrete options for A1 approval once certified.
- **Rationale:** Owner's preference — evaluate concrete proposals, not hypothetical options.
- **Alternatives considered:** Owner choosing from presented options now (declined).
- **Files affected:** marketing/content-calendar.md.

## 2026-06-10 — LinkedIn page admin = owner's personal profile

- **Author / gate:** jecki (A1)
- **Decision:** The Eco-Synthetic LinkedIn company page is administered under jecki's own personal profile.
- **Rationale:** Simplest setup; no separate admin account needed for P1.
- **Alternatives considered:** Company account as admin (deferred until company email exists).
- **Files affected:** marketing/content-calendar.md.

## 2026-06-10 — Multi-model router: Phase A only (Claude-only skeleton)

- **Author / gate:** jecki (A1)
- **Decision:** Build Phase A of the model router only: selection + logging skeleton, Claude-only. No second model added yet. Adding any second model is deferred (local open-weight) or requires A1 (hosted/paid). Hard rule: no customer data to any third-party model without explicit A1 + Eyal (Legal) privacy sign-off.
- **Rationale:** Budget 0; no current need for a second model; data-privacy first.
- **Alternatives considered:** Adding Gemini for research/second-opinion (deferred, A1 when budget allows).
- **Files affected:** company/model-matrix.md.

## 2026-06-10 — Claw / Hermes runtime shelved

- **Author / gate:** jecki + Eco recommendation (A2)
- **Decision:** OpenClaw and Hermes Agent are shelved. NanoClaw is held in reserve only as a future gated, sandboxed tool, subject to Rambo (Security) review, only if a concrete low-risk job arises.
- **Rationale:** Broad autonomy, attack surface, overlap with Claude Code, budget 0.
- **Alternatives considered:** NanoClaw for isolated code review (possible future gated use only).
- **Files affected:** None (decision logged; no implementation).

## 2026-06-10 — OpenClaw acquisition claim retracted

- **Author / gate:** jecki (A1; §16 truthfulness correction)
- **Decision:** The prior claim that OpenClaw was acquired by OpenAI is retracted as unverified. Public sources list it as independent (OpenClaw Foundation / Peter Steinberger, MIT). Do not rely on the acquisition claim.
- **Rationale:** §16 — never guess; correct known errors.
- **Files affected:** Previous build log note corrected.

## 2026-06-12 — Repo scaffolded

- **Author / gate:** jecki + Claude Code (A1 — structural setup)
- **Decision:** Repo scaffolded per `company/repo-structure.md`. All folders, infrastructure files, agent role files, and company docs placed. See `company/build-log.md` Phase 1 entry for full change list.
- **Rationale:** Phase 1 prerequisite — repo structure required before activating Eco and Shelly.
- **Files affected:** All new files listed in build-log.md 2026-06-12 entry.


## 2026-06-12 -- Eco (CEO) HR certification

- **Author / gate:** Anat (HR, A3 certification)
- **Decision:** Conditionally certified. Go-live cleared. Gaps listed below must be resolved in the next role file update before the first R&R review.
- **Rationale:** Reviewed Eco.md against role-file-template.md, roster (v2.2), constitution (v2.2), and access-matrix (v1.0). Core sections present and consistent: purpose, responsibilities, authority (A2 operational / A1 reserved for jecki), budget 0 / no spend, chain of command (tasked by jecki only), task and result envelopes, tone (matches constitution section 5), model spec (claude-sonnet-4-6), key files, certification status. Nine of thirteen constitution red lines reflected. No conflicts with roster, constitution, or access matrix. No red-line violations. Role correctly reflects Eco position: L2, reports to jecki only, A2 authority, A1 to owner.
- **Gaps or flags:**
  1. KPIs / success metrics -- absent. Template requires this section. Add in next version.
  2. Triggers -- absent. Template requires this section. Add in next version.
  3. Escalation path -- absent as explicit section (implied: jecki / A1). Must be explicit in next version.
  4. Identity block -- version number, last-updated date, change log absent. Add in next version.
  5. Constitution red lines 9, 10, 11 absent from Eco.md: RL9 personal data beyond stated purpose; RL10 third-party proprietary data unlawfully; RL11 represent company legally or publicly without authorization. RL11 is directly relevant for a CEO role. None are blocking at P1, but all three must be added in next version.
  6. No gap is a red-line violation or conflicts with roster or constitution. Go-live cleared on condition all five items resolved before first scheduled R&R review.
- **Files affected:** .claude/agents/Eco.md

## 2026-06-12 -- Scheduled wake-ups approved (Eco + Shelly, 2h cadence)

- **Author / gate:** jecki (A1)
- **Decision:** Eco and Shelly are now triggered on a 2-hour internal schedule in addition to jecki's messages. Each agent sends a proactive task check-in to jecki's Telegram chat every 2h (first fire after 2h from bridge start; subsequent fires every 2h). Implemented as asyncio tasks in the Telegram bridge.
- **Rationale:** Agents should be proactive. The 2h cadence allows autonomous progress review and surfacing of blockers without jecki needing to initiate each check-in. Internal asyncio loop chosen over Windows Task Scheduler for P1 simplicity.
- **Alternatives considered:** Windows Task Scheduler (external; harder to maintain in P1); /tasks command only (too passive; relies on jecki initiating).
- **Files affected:** integrations/telegram-bridge/bridge.py, company/governance/schedules.md.
