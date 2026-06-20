# Eco-Synthetic: Next Session Agenda and Handoff

Planning is at v2.2 and saved. Start the new session with the six tasks below. Some are already applied; the rest are seeded and ready to execute.

## How to carry this into the new session
Download all `eco-synthetic-*.md` files and the `agents/` role files, then add them to this Project's knowledge (Project settings, add files). Open a new chat in the same project and point it at this file. The new session continues the build log.

## Files in the package
- eco-synthetic-README.md (index and status)
- eco-synthetic-constitution.md (v2.2)
- eco-synthetic-roster-v2.md
- eco-synthetic-org-chart.mermaid
- eco-synthetic-role-file-template.md
- eco-synthetic-repo-structure.md
- eco-synthetic-model-matrix.md
- eco-synthetic-setup-guide.md
- eco-synthetic-build-log.md
- eco-synthetic-next-session.md (this file)
- agents/Eco.md, agents/Hila.md (agents/Shelly.md was in the original package; Shelly separated 2026-06-20, now an external customer -- see company/customers/shelly/profile.md)

---

## Opening tasks

1. **Hila on a light track in Phase 1 -- APPLIED.** Her role file now runs avatars, the LinkedIn company page, and build-in-public posts in P1, with publishing A1-gated. New session: produce the first content calendar, an avatar style, and the LinkedIn page setup, for A1 approval.

2. **Multi-LLM infrastructure -- SEEDED** (constitution section 17, model matrix). New session: design the model router (primary Claude plus a second-opinion model and a redundancy fallback), choose which providers to evaluate, and run each through the Security and Legal gate. Honest constraints: hosted providers (OpenAI/Codex, Gemini, Grok) cost money (A1 under budget 0) and send data to a third party (privacy and terms); a local model is free of API cost but needs compute. Hermes fits here as an open-weight brain, not as an agent.

3. **Designer agent -- SEEDED** in the roster (product group, name TBD). New session: write the Designer role file for product UX and UI, and have Eco decide whether the same Designer also covers marketing design or Marketing gets a dedicated designer.

4. **Where model permissions are visible -- DONE.** See `company/model-matrix.md` and each role file's "AI model allowed" field. Owned by Assaf (OE) with Dalia (Governance).

5. **Should we use OpenClaw, NanoClaw, or Hermes -- my recommendation below.**

6. **"Never guess, always truthful" -- APPLIED** as constitution section 16.

---

## Task 5: claw / Hermes evaluation (my honest take)

What they are:
- **OpenClaw** (formerly Clawdbot / Moltbot): an open-source, local-first, self-hosted autonomous agent runtime that runs continuously, connects to messaging apps, and executes real tasks using an existing LLM as its brain. Viral since late 2025; reported acquired by OpenAI in early 2026. Security researchers have flagged real concerns because it runs commands with broad local access.
- **NanoClaw**: a lightweight, MIT-licensed variant that runs in isolated containers for stronger OS-level security and privacy, oriented toward quick code review and minimal dependencies.
- **Hermes**: most likely the open-weight Hermes model family (a brain), not an agent runtime. I am not fully certain there is no agent by this name, so treat that as unconfirmed.

My recommendation: not now, and not as a core decision-making org agent. Reasons: these "claw" runtimes overlap with what we already build in Claude Code; OpenClaw's broad autonomous local access conflicts with our least-privilege, gated, secrets-protected design; and budget 0 plus the extra operational and compute load argue against it. If we want any of them, the only narrowly-justifiable candidate is NanoClaw, used as a gated, sandboxed tool for a specific low-risk job (for example isolated code review or a local automation sandbox), adopted through the Security plus Legal gate after a security review by Rambo, never as an autonomous decision-maker. Hermes belongs in task 2 as a possible model brain, not as an agent. The new session should let Rambo (Security) and Assaf (OE) run this evaluation properly before any adoption.
