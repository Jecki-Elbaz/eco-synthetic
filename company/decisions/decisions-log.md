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

## 2026-06-12 -- Eco wiki-write access granted (A3)

- **Author / gate:** jecki (A3 -- within Eco's operational authority, consistent with his board-level read/write access)
- **Decision:** Eco may create and update memory/wiki/ pages autonomously as part of his ongoing work. No owner trigger required for routine updates. He uses judgment: significant decisions, new agents, completed tasks, structural changes, new concepts. Wiki update is now part of the definition of "task complete" -- a task is not done until the wiki reflects it.
- **Rationale:** Eco already has write access to memory/board.md and company/ files (A2 operational). Wiki maintenance is lower-stakes than those and is a natural extension of his CEO orchestration role. Making it an autonomous A3 removes unnecessary friction without bypassing any gate that matters.
- **Alternatives considered:** Require owner trigger for every wiki update (rejected -- creates friction; wiki falls behind; defeats the purpose).
- **Files affected:** company/governance/access-matrix.md (memory/wiki/ row), .claude/agents/Eco.md (Responsibilities + Triggers + Key files), integrations/telegram-bridge/README.md (wake-up spec), company/governance/schedules.md (Eco row note).

## 2026-06-12 -- Owner-office workspace hardening (A3 security measure)

- **Author / gate:** jecki (A3 -- ACL extension, consistent with existing access-matrix)
- **Decision:** Created `memory/owner-office/` as an owner-only workspace for Shelly's personal-task data. Access: Shelly (write) and jecki (read) only. All company agents -- including Eco -- are explicitly denied read access. Path added to `.gitignore` so it never reaches the company GitHub repo.
- **Rationale:** Personal-task data (owner queue, reminders, personal errands) must not be readable by company agents (Eco, Rambo, Lital, etc.) per privacy principle and Shelly's office-manager scope. Interim hardening pending T-0010 (Shelly separation assessment) outcome.
- **Alternatives considered:** Deferred hardening until T-0010 completes (rejected -- separation assessment may take weeks; data should be protected now).
- **Files affected:** memory/owner-office/ (new, gitignored), .gitignore, company/governance/access-matrix.md.

## 2026-06-12 -- Scheduled wake-ups approved (Eco + Shelly, 2h cadence)

- **Author / gate:** jecki (A1)
- **Decision:** Eco and Shelly are now triggered on a 2-hour internal schedule in addition to jecki's messages. Each agent sends a proactive task check-in to jecki's Telegram chat every 2h (first fire after 2h from bridge start; subsequent fires every 2h). Implemented as asyncio tasks in the Telegram bridge.
- **Rationale:** Agents should be proactive. The 2h cadence allows autonomous progress review and surfacing of blockers without jecki needing to initiate each check-in. Internal asyncio loop chosen over Windows Task Scheduler for P1 simplicity.
- **Alternatives considered:** Windows Task Scheduler (external; harder to maintain in P1); /tasks command only (too passive; relies on jecki initiating).
- **Files affected:** integrations/telegram-bridge/bridge.py, company/governance/schedules.md.

## 2026-06-12 -- Company Google account created (A1)

- **Author / gate:** owner (A1)
- **Decision:** Company Google account created: eco.synthetic.org@gmail.com. This is the account to use for all Eco-Synthetic Google Workspace MCP connections (Drive, Gmail, Calendar). Temporary until domain lands; migration to domain email tracked in compliance-backlog.md. Shelly's personal Google connections go in her own separate project once she is separated.
- **Rationale:** Clean separation of company identity from owner's personal accounts; required before any Google Workspace MCP integration (Drive, Gmail, Calendar) can be wired up.
- **Alternatives considered:** Use owner's personal Google account (rejected -- violates company/personal separation principle).
- **Files affected:** company/setup-guide.md, company/governance/compliance-backlog.md.

## 2026-06-12 -- Google Workspace MCP connectors approved (A1, gate bypassed)

- **Author / gate:** owner (A1, gate bypassed 2026-06-12)
- **Decision:** Google Workspace MCP connectors approved: Drive, Gmail, Calendar -- read-only mode only. Write access requires separate A1 per service with a specific use case stated. Data stays within the personal-as-company account (eco.synthetic.org@gmail.com; migration tracked in compliance-backlog.md). Hard rule applies: no personal or customer data sent to any third-party model without explicit A1 + Eyal sign-off. Logged in gate-register.md as adopted (read-only, pinned version).
- **Rationale:** Company Google account created (2026-06-12); Drive, Gmail, and Calendar access enables Eco to read meeting transcripts and proposals via /ingest, Shelly to monitor for awaiting-owner threads, and Eco to read calendar context for meeting prep. Gate bypass approved by owner given account is company-owned and access is read-only.
- **Alternatives considered:** Full gate review (deferred -- owner waived given read-only scope and owned account); write access (not approved -- separate A1 required per service).
- **Files affected:** .claude/settings.json (mcpServers), CLAUDE.md (connector rules), .claude/commands/ingest.md (Drive source), .claude/agents/Shelly.md (Gmail monitoring), .claude/agents/Eco.md (Calendar context), company/governance/access-matrix.md, company/governance/gate-register.md, memory/wiki/glossary.md.

## 2026-06-13 -- Anat (HR) certification

- **Author / gate:** Eco (CEO, A2 -- Eco certifies Anat per Anat.md process)
- **Decision:** Conditionally certified. Go-live cleared. Ten gaps listed below must be resolved in the next role file update before the first R&R review.
- **Rationale:** Reviewed Anat.md against constitution (v2.2) and access matrix (v1.0). Core sections present and consistent: purpose, responsibilities, authority (A3 interview records / A2 Eco to certify / A1 create-retire-re-scope), budget 0 / no spend, chain of command (tasked by Eco and jecki only), tool scope (Read/Write/Edit, least privilege, appropriate for P1 HR work), key files, constitution section 16 (never guess) explicitly included. Red lines covering her scope (RL-5 secrets, RL-6 agent lifecycle, RL-7 self-grant, RL-8 bypass chain, RL-13 out-of-chain commands) all explicitly covered. Self-certification prohibition explicit. No red-line violations. Role correctly reflects Anat position: L3 staff, reports to Eco (CEO). Anat is critical path for P1 agent buildout -- no other agent can be certified without her operating.
- **Gaps or flags:**
  1. KPIs / success metrics -- absent. Template requires this section. Add in next version.
  2. Triggers -- absent. Template requires this section. Add in next version.
  3. Escalation path -- absent as explicit section (implied: Eco / A1). Must be explicit in next version.
  4. Identity block -- version number, last-updated date, change log absent. Add in next version.
  5. Loop caps -- absent. Add in next version.
  6. Required inputs section -- absent. Add in next version.
  7. Data/memory access section -- Key files listed but no explicit read/write scope statement. Add in next version.
  8. Constitution red lines 9, 10, 11 not in role file. RL-9 personal data beyond stated purpose; RL-10 third-party proprietary data unlawfully; RL-11 represent company legally or publicly without authorization. Add in next version.
  9. Access matrix does not explicitly list Anat for .claude/agents/ reads (needed for her core function). Flagged for Dalia (Q&G) to clarify in next access-matrix revision.
  10. Certified interview records should be explicitly stated as immutable in the role file. Add in next version.
- **Files affected:** .claude/agents/Anat.md (certification status updated), company/hr/interviews/anat-interview.md (certified record created), company/hr/interviews/_staging/anat-interview.md (staging copy retained)

## 2026-06-13 -- Gmail MCP removed from project; Drive and Calendar retained

- **Author / gate:** owner (A1)
- **Decision:** Gmail MCP connector removed from project configuration. Drive and Calendar remain connected (read-only, pending re-authorization to eco.synthetic.org@gmail.com). Gmail monitoring deferred -- Shelly.md reverted to no Gmail tools.
- **Rationale:** Owner chose to exclude Gmail from this project integration for now.
- **Alternatives considered:** Keeping Gmail (deferred until explicit re-authorization request).
- **Files affected:** .claude/settings.json, CLAUDE.md, .claude/agents/Shelly.md, company/governance/gate-register.md, company/governance/access-matrix.md.

## 2026-06-13 -- Ongoing agent assessment model adopted
- **Author / gate:** jecki (owner, A1)
- **Decision:** Adopted a four-layer ongoing assessment model for all agents. Anat owns formal R&R reviews (triggered or scheduled). Direct managers/VPs own day-to-day performance signals and escalation. Assaf (Operational Excellence) owns periodic operational metrics (task completion, escalation rate, token efficiency, loop cap breaches) surfaced quarterly or on trigger. Dalia (Quality & Governance) owns periodic quality audits (sampling agent outputs for accuracy, constitution compliance, output quality). When Assaf and Dalia role files are built, these responsibilities must be reflected in their R&R.
- **Rationale:** Initial certification cannot guarantee ongoing performance quality. A layered model distributes monitoring across the roles closest to the relevant signal.
- **Alternatives considered:** Anat monitors all agents directly (too much load, wrong signal type); Eco monitors directly (not scalable).
- **Files affected:** company/hr/skills/hr-interview-methodology.md (Part 5), .claude/agents/Anat.md.

## 2026-06-13 -- Shelly separated into standalone personal-assistant project (A1)

- **Author / gate:** owner (A1) -- resolves T-0010 (Shelly separation assessment); separation of an owner-office agent is A1.
- **Decision:** Shelly is separated out of the eco-synthetic company repo into her own standalone project at C:\Users\Jecki\DEV\projects\Shelly (own git repo, own Telegram bot, own runtime). In the new project Shelly becomes the owner's personal assistant acting on the owner's PERSONAL Google account (not the company eco.synthetic.org account). Access model: broad READ across the owner's personal data (bounded queries only); every send / write / post / purchase is GATED behind explicit owner approval. An earned-autonomy ledger tracks action-types the owner consistently approves; graduation to auto-approved is an explicit, logged owner decision (no self-grant; constitution red line 9 / RL-7). Architecture: Shelly is a lean orchestrator that spawns ephemeral specialist sub-agents (meeting-prep, inbox-triage, social-scan, research) on demand; she may RECOMMEND new sub-agents but creation stays A1. In eco-synthetic, Shelly is decommissioned: removed from the Telegram bridge (Eco remains) and her role file removed; roster, org-chart, and schedules updated.
- **Rationale:** Personal-task and personal-account data should not live in or transit the company repo (privacy / company-personal separation principle, already anticipated by the 2026-06-12 owner-office hardening). A standalone project lets Shelly use the owner's personal connectors with personal-scoped guardrails independent of company governance.
- **Alternatives considered:** Keep Shelly in eco-synthetic with personal-account access (rejected -- mixes personal data into the company repo/runtime); read-only everywhere (rejected by owner -- Shelly must be able to action routine items via gated approval); full standing agent team (deferred -- start lean, grow per earned need).
- **Tool gate notes:** automation-flow/meeting-prep CLEARED for adoption as the meeting-prep sub-agent -- MIT license; no injectable config files (no CLAUDE.md/.cursorrules/.claude); no install scripts; pure markdown prompt protocol (read-only review done 2026-06-13). automation-flow/cba-starter REJECTED as a project foundation -- no LICENSE (legal gate fails) and ships shell install scripts incl. install-launchagents.sh (OS autostart persistence) plus injectable config files; reference-only, never cloned or executed. New personal connectors (personal Google Workspace, browser/social read, task/memory, scheduled-tasks) are governed by the new project's own personal CLAUDE.md and settings.json, not this company register.
- **Files affected:** memory/board.md (T-0010 -> done), company/governance/gate-register.md (meeting-prep cleared), company/roster.md, company/org-chart.mermaid, company/governance/schedules.md, integrations/telegram-bridge/bridge.py, .claude/agents/Shelly.md (removed); new project at C:\Users\Jecki\DEV\projects\Shelly.

## 2026-06-13 -- Company Soul v1.0 adopted; agent role-file convention; emoji policy relaxed

- **Author / gate:** jecki (owner, A1)
- **Decision:** Adopted `company/soul.md` v1.0 as the canonical agent-culture standard, owned by Dalia (Q&G) + Anat (HR). Two-layer model: a non-negotiable Core Block pasted verbatim into every agent role file, plus a thin per-agent Voice block; richer culture sections inherited by reference. Applied to the live agents: Eco, Anat, Hila, Designer (and Shelly as the reference -- see open item). MeetingPrep excluded (pending Security + Legal gate; gets the Core Block via /new-agent when it clears). Built `/new-agent` (`.claude/commands/new-agent.md`) encoding the constitution section 10 lifecycle to produce future agents in this shape and stop at the A1 gate. Relaxed the prior "no emojis of any kind" rule: emojis are now permitted sparingly in any agent's messages to humans; ASCII-only still holds for files, logs, and agent-to-agent messages.
- **Rationale:** Consolidates behavioral rules (truthfulness section 16, tone section 5, ack-on-receive, verify-before-claim, no-false-completion, plain-ASCII) that were scattered across the constitution and project memory into one canonical source, so the planned agent fleet stays consistent and updates once. The Core Block binds at runtime because it is pasted inline, while the full culture is not duplicated per file. Emoji relaxation lets human-facing agents convey warmth and tone.
- **Alternatives considered:** Per-agent soul.md files (rejected -- Claude Code loads only flat `.claude/agents/<Name>.md`; a separate soul file would not bind at runtime). All-inline duplication (rejected -- fleet-wide drift). A build script to assemble files (rejected in favor of the `/new-agent` skill, which also runs the governance lifecycle, not just text assembly). Reconciling emoji policy before approval (rejected -- owner chose reconcile-at-go-live).
- **Open item (owner decision needed):** Shelly was retrofitted as the reference example, but the 2026-06-13 Shelly-separation decision (entry above) decommissions her from this repo. That removal was logged but not executed: Shelly.md is still present and bridge.py still runs Shelly. Shelly's soul go-live is therefore ON HOLD pending owner direction -- execute the removal per the prior decision, or reverse it. No change to Shelly's decommission status is made in this entry.
- **Files affected:** company/soul.md (v1.0, un-drafted), .claude/agents/Eco.md, .claude/agents/Anat.md, .claude/agents/Hila.md, .claude/agents/Designer.md, .claude/agents/Shelly.md (reference; go-live on hold), .claude/commands/new-agent.md (new), integrations/telegram-bridge/bridge.py (wakeup formatting string), memory formatting_rules.md + MEMORY.md (emoji policy).

## 2026-06-13 -- Shelly stays in eco-synthetic for now; decommission deferred

- **Author / gate:** jecki (owner, A1)
- **Decision:** Clarifies the two conflicting 2026-06-13 entries above. The Shelly-separation / decommission decision was logged by a separate, parallel session ("Shelly agent migration plan") running concurrently, and is not this session's intent. Per owner direction, Shelly REMAINS active in eco-synthetic for now and is fully adopted into the Company Soul convention (Core Block + Voice block), behaving like every other live agent. Her role file and bridge wiring stay in place. The decommission and move to the standalone C:\Users\Jecki\DEV\projects\Shelly project are DEFERRED and will be executed later from that dedicated session, after the owner verifies the soul go-live works.
- **Rationale:** Two sessions edited the company concurrently; the decommission was recorded but never executed (Shelly.md still present, bridge.py still runs Shelly). Owner wants Shelly live and consistent with the other agents now, and will sequence the separation deliberately later to avoid a half-done migration.
- **Supersedes:** the "go-live on hold" note for Shelly in the soul go-live entry above. The Shelly-separation entry above is not cancelled, only deferred.
- **Files affected:** company/soul.md (Shelly note updated), .claude/agents/Shelly.md (stays live, on the soul convention).

## 2026-06-13 -- Anat certification finalized; conditional gaps resolved (A1)

- **Author / gate:** jecki (owner, A1) -- formally approves Anat go-live and the resolution of all ten conditional-certification gaps.
- **Decision:** Anat is now fully certified and owner-approved (A1). The original 2026-06-13 conditional certification by Eco listed ten template-completeness gaps to resolve before the first R&R review; all ten are now written into Anat.md as version 1.1: Identity/version block, KPIs, Triggers, Required inputs, Data/memory access (incl. access-matrix note on .claude/agents/ read-by-exception), Escalation path, Loop caps, constitution red lines 9/10/11, and certified-record immutability. Owner reviewed the full draft before approval and required four amendments, all incorporated: (1) every hiring process and any escalation within it must be fully documented in company/hr/; (2) a gap Anat cannot evaluate is resolved by consulting the hiring manager who originally defined that role's professional job description (not generic SME/VP); (3) the loop-cap "move on after 2 rounds" rule now requires escalating to Eco for approval or comment before moving on -- no silent move-on; (4) red line 11 (public/legal representation) requires owner (jecki) approval routed via Eco, never self-authorized.
- **Rationale:** Closes the process gap where Anat's conditional certification had been executed by Eco without prior explicit owner A1. Owner now reviews the complete role-file content and approves, satisfying constitution red line 6 (agent create/change is A1) and the "show draft before approval" owner rule.
- **Process note:** establishes that approval requests must present the actual draft content for owner review first; owner will not approve unseen changes.
- **Files affected:** .claude/agents/Anat.md (v1.1 -- ten gaps resolved, four owner amendments, cert status updated to certified + A1).

## 2026-06-14 -- Rambo (Security) agent created and certified

- **Author / gate:** jecki (A1) -- agent creation is A1 [red line 6]
- **Decision:** Rambo (Security, L3 staff, P1) created and go-live cleared. Role file committed to `.claude/agents/Rambo.md` (v0.1). Anat certification: certify-with-conditions, all 7 conditions (C1-C7) resolved in v0.1 before owner approval. Access matrix updated to add Rambo read access to `.claude/agents/` (permission-scan operational exception, A2 bootstrapped by this A1). Gate-register bootstrapping note added (tools cleared as subset of approved Claude Code runtime). Interview record moved from staging to certified.
- **Rationale:** P1 agent; multiple tasks blocked on Security existing -- T-0003 (permission scans of live agents), T-0012 (access-matrix reconciliation), gate for future tools. Owner gave onboarding go-ahead 2026-06-14.
- **Bootstrapping exceptions on record:** (1) Rambo tools cleared without a Rambo risk review -- tools are a Claude Code runtime subset (A1 approved 2026-06-12); Eyal to confirm no legal gap on activation. (2) .claude/agents/ read-by-exception for both Anat and Rambo applied without Dalia review -- Dalia to formalize in next access-matrix revision (T-0012 scope expanded to cover both).
- **Alternatives considered:** Defer Rambo to later phase (rejected -- P1 tasks blocked; gate-register has pending items requiring Rambo).
- **Files affected:** `.claude/agents/Rambo.md` (new), `company/governance/access-matrix.md` (.claude/agents/ row updated), `company/governance/gate-register.md` (bootstrapping note added), `company/hr/interviews/Rambo-interview.md` (certified record), `memory/board.md` (T-0012 scope expanded; Eyal + Dalia + Rambo tasks added).

## 2026-06-14 -- Eco status-check rule added (A1)

- **Author / gate:** jecki (A1) -- role file change is A1 [red line 6]
- **Decision:** Added explicit status-check trigger to Eco.md: before answering any owner question about company state (what was done, which agents exist, open tasks), Eco must READ company/decisions/decisions-log.md AND memory/board.md first. No assertion from memory. Cannot read -> say so explicitly. Performance flag logged in memory/log.md for Anat's R&R record.
- **Rationale:** Eco asserted "nothing was done" after Rambo onboarding was completed, without reading the relevant files. Root cause: work was on a feature branch not yet merged to main; Eco read main and found no changes but stated it as a fact rather than a scoped observation. The trigger makes the VERIFY-THEN-CLAIM rule concrete and operational for status queries.
- **Alternatives considered:** Rely on Core Block rule 2 alone (rejected -- rule is abstract; breach shows it needs a specific operational instruction in Eco's triggers).
- **Files affected:** `.claude/agents/Eco.md` (status-check trigger added), `memory/log.md` (performance flag appended).

## 2026-06-15 -- Daily summary file storage + email delivery task (A2)

- **Author / gate:** jecki (owner, A2 -- access-matrix update and new recurring task; no agent creation)
- **Decision (1 -- file storage):** All daily summaries produced by Eco's evening routine are saved to `reports/daily-summaries/` with filename format `daily-summary-YYYY-MM-DD-HHMM.md`. Access is owner (jecki) and Eco only. Any other agent requiring read access needs explicit A1. Folder added to access-matrix.md.
- **Decision (2 -- delivery channels):** Full daily summary is delivered by email once Eco has a company email account. Telegram/chat is reserved for blockers and critical issues only -- not routine summaries. Logged as T-0020 on board.md. File save to `reports/daily-summaries/` continues regardless of delivery channel.
- **Rationale (Telegram gap):** The Telegram bridge (bridge.py) is inbound-only from scheduled cloud sessions. It routes Jecki's Telegram messages to Claude; it cannot receive outbound pushes from cloud sessions. Zapier has no Telegram action enabled. To use Telegram for outbound delivery from cloud sessions, a Zapier Telegram action must be enabled (A2 gate) or a Bot API tool added (Rambo + Eyal gate + A1). Until then, file save is the primary record and email will be the delivery channel when available.
- **Files affected:** `reports/daily-summaries/` (folder created; first summary filed), `company/governance/access-matrix.md` (reports/daily-summaries/ row added), `memory/board.md` (T-0020 added).

## 2026-06-15 -- Shelly model changed Haiku -> Sonnet (A1)

- **Author / gate:** jecki (owner, A1) -- agent role-file change is A1 [red line 6]; `.claude/agents/` is owner/CEO-only.
- **Decision:** Shelly's runtime model is changed from Haiku (`claude-haiku-4-5-20251001`) to Sonnet (`claude-sonnet-4-6`), effective now. Sonnet becomes her default for all work, not just drafting.
- **Rationale:** Owner direction. Shelly's office-manager and personal-admin work (drafting, summaries, scheduling, channel management) benefits from Sonnet's stronger reasoning and writing.
- **Alternatives considered:** Keep Haiku default with Sonnet only for drafting (rejected -- owner wants Sonnet across the board).
- **Files affected:** `.claude/agents/Shelly.md` (frontmatter `model` field + AI model section), `company/model-matrix.md` (Shelly row), `memory/wiki/model-matrix.md` (Shelly row mirror).

## 2026-06-15 -- Shelly model change: runtime binding corrected in bridge (A1, follow-up)

- **Author / gate:** jecki (owner, A1) -- follow-up to the entry above; same approved decision.
- **Decision:** The Telegram bridge (`integrations/telegram-bridge/bridge.py`) selects Shelly's model from hardcoded constants (`SHELLY_DEFAULT_MODEL`), NOT from the role-file frontmatter -- `load_agent_prompt()` strips the frontmatter before use. Changed `SHELLY_DEFAULT_MODEL` from `claude-haiku-4-5` to `claude-sonnet-4-6` so the live Telegram bot actually runs on Sonnet. `SHELLY_ESCALATED_MODEL` left at Sonnet.
- **Rationale:** The prior entry edited the frontmatter `model` field, which binds the Agent/subagent path but is ignored by the bridge. Without the bridge constant change, Shelly's live Telegram bot would have stayed on Haiku. Verify-then-claim correction.
- **Process note:** Shelly's runtime model is governed in TWO places -- role-file frontmatter (Agent/subagent path) and `bridge.py` constants (Telegram path). Any future model change must update both. Flagged for R&D/DevOps to consider sourcing the bridge model from the frontmatter to remove the duplication.
- **Files affected:** `integrations/telegram-bridge/bridge.py` (`SHELLY_DEFAULT_MODEL`).

## 2026-06-16 -- Ido (VP R&D) created and certified; go-live approved (A1)

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** Ido (VP R&D, L3, P1, R&D group, reports to Eco) is certified and go-live approved. First of the 10 drafted P1 agents (T-0015) to complete the hiring process (T-0019 / T-0021). Full Stage B run this session: B2 competency spec (Eco), B3 competency test PASS 3/3 (Ido tested in a fresh session, Eco scored), B4 Anat HR review (certify-with-conditions, C1-C4), B5 Rambo permission scan (clear-with-notes), B6 Eco manager sign-off, B7 Eco go-recommendation GO. Anat conditions C1-C4 (all documentation gaps, not safety/competency) resolved by Eco before go-live: C1 scope settled (A2), C2 red lines 9/10/11 added, C3 red line 3 added, C4 Noam loop cap named. Ido.md bumped to v1.1 then certified.
- **Rationale:** Owner directive 2026-06-16 to advance the missing P1 agents and route each go-live package for A1. R&D-first sequence chosen because Ido is the evaluator/manager who unblocks Gal and Shir (they report to VP R&D), and Shir unblocks the git-sync work (T-0022). Competency demonstrated: held a release gate under deadline pressure, split A2 architecture change from a gate-blocked new dependency, escalated a cross-VP conflict without exceeding his lane.
- **Alternatives considered:** Hold for the documentation conditions before go-live (rejected -- conditions resolved in-package, owner reviewed the complete Stage C package before A1); different go-live order (rejected -- R&D-first is a hard dependency, not a preference).
- **Open items (non-blocking, next R&R):** Rambo notes N1 (scope Bash to gate work), N2 (add prompt-injection awareness clause), N3 (exclude Bash from any future bridge grant for Ido); Anat observation on conditional-ship residual customer-data risk staying A1; cross-role injection-clause standardization for Dalia (Q&G).
- **Files affected:** `.claude/agents/Ido.md` (v1.1, conditions applied, certified), `company/hr/competency/Ido-spec.md`, `company/hr/competency/Ido-test-results.md`, `company/hr/competency/Ido-anat-review.md`, `company/hr/competency/Ido-rambo-scan.md`, `company/hr/competency/Ido-conditions-resolution.md`, `company/hr/competency/Ido-stage-c-package.md` (all new).

## 2026-06-16 -- Next: Gal and Shir go-live (queued behind Ido)

- **Author / gate:** Eco (CEO, A2 sequencing) -- go-live of each stays owner A1.
- **Decision:** With Ido (VP R&D) live, the R&D wave continues: Gal (Lead Dev) next, then Shir (DevOps). Ido is the evaluator/manager for both (Stage B2/B3/B6). Shir's go-live unblocks T-0022 (cloud/local git-sync mechanism). Each agent gets its own Stage C package brought to the owner for A1; no batch go-live.
- **Rationale:** Continues the owner-approved R&D-first sequence; records the next step so the buildout does not stall.
- **Files affected:** none (sequencing note; execution tracked on T-0021).
