# Eco-Synthetic: Claw / Hermes Runtime Evaluation (FINAL, decision applied 2026-06-10)

Question: should Eco-Synthetic adopt an autonomous agent runtime -- OpenClaw, NanoClaw, or a Hermes runtime -- for any task? Owned by Rambo (Security) + Assaf (Operational Excellence), with Eyal (Legal) on terms; borderline/paid is A1. Nothing adopted without the Security + Legal gate.

**Decision (owner, 2026-06-10): SHELVED.** OpenClaw and Hermes Agent are not adopted. NanoClaw is held in reserve only as a future gated, sandboxed tool, subject to a Rambo security review, and only if a concrete low-risk job arises.

---

## 1. Verified facts (checked 2026-06-10; section 16)
- **OpenClaw** -- real, open-source (MIT), local-first autonomous agent runtime; viral since late 2025 (Clawdbot -> Moltbot -> OpenClaw); broad local execution (shell, filesystem, browser, Docker, messaging incl. Baileys/WhatsApp); documented large attack surface incl. self-propagating "worm" research. **Correction:** the claim that OpenAI acquired OpenClaw is **not confirmed** by public sources -- it appears independent (OpenClaw Foundation / Peter Steinberger). Do not rely on it.
- **NanoClaw** -- real, open-source (MIT, debuted Jan 31 2026); lean (~15 files, one process); each agent isolated in a Docker/OS container; built on Anthropic's Agent SDK; credentials routed through a vault so agents never hold raw keys. Isolation + secrets posture align with red lines 5 and 7.
- **Hermes** -- two things sharing a name: the open-weight *model* family (Hermes 3/4 -- a brain, handled in the model-router workstream) and *Hermes Agent*, a separate model-agnostic agent framework (early 2026 -- a runtime, handled here).

---

## 2. Scoring criteria (if ever revisited, for Rambo + Assaf)
OS isolation; least-privilege and secrets handling (red lines 5, 7); autonomy (self-executes vs invoked); gate-ability and auditability; overlap with Claude Code/Cowork; compute/operational cost (budget 0); license and terms (red lines 4, 10); data egress (red line 9); maintainability; fit to a specific narrow job.

---

## 3. Recommendation (basis for the shelve decision)
- **OpenClaw -- no.** Broad autonomous local execution conflicts with our least-privilege, gated, secrets-protected design; real attack surface; overlaps with Claude Code.
- **NanoClaw -- reserve only.** The single narrowly-justifiable candidate, and only as a gated, sandboxed *tool* for one specific low-risk job (e.g. isolated code review), after a Rambo security review. Never an autonomous decision-maker; never holding secrets outside its vaulted, least-privilege scope.
- **Hermes -- split.** Model weights -> model-router workstream (with the neutral-alignment caveat). Hermes Agent runtime -> shelved with OpenClaw.

---

## 4. If revisited later
Rambo runs the security review; Assaf assesses fit/overlap/cost; Eyal clears terms; borderline/cost -> A1; decision logged in the decisions log and build log. Trigger: a concrete, low-risk job that NanoClaw's container isolation would serve better than what we already run.
