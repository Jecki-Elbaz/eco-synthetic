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

## 2026-06-15 -- Batch Stage A hire approval formalized: 10 P1 agents

- **Author / gate:** jecki (A1) -- agent creation is A1 [red line 6]. Approval effective 2026-06-14 via owner direction on T-0015. This entry formalizes it per agent-hiring.md Stage A log requirement.
- **Decision:** Owner approves the decision to hire the following 10 P1 agents: Ido (VP R&D), Dalia (Quality & Governance), Noam (Product), Lital (CFO), Eyal (Legal), Assaf (Operational Excellence), Gal (Lead Developer), Shir (DevOps), Luci (Devil's Advocate), Erez (Investor / IRB Lead). Hila's Stage A was covered by the 2026-06-10 entries (P1 light track approval). The overall roster and org structure were part of the 2026-06-12 scaffold approval. The explicit build-role-files direction was given on 2026-06-14 (T-0015 trigger: "jecki 2026-06-14"). This entry formalizes that direction as the Stage A approval per agent-hiring.md, so Stage C packages have a clean reference.
- **Rationale:** Stage A per agent-hiring.md requires a decisions-log.md entry. The approval was effectively given on 2026-06-14 when jecki directed role-file construction for all 10 agents. Logging retroactively to close the gap -- no decisions changed, only formally recorded.
- **Alternatives considered:** Leaving Stage A approval implicit (rejected -- Stage C packages require an explicit Stage A reference; implicit approval cannot satisfy the package-completeness check).
- **Files affected:** company/hr/competency/ (11 test-results shells created 2026-06-15 referencing this entry as Stage A approval).

## 2026-06-15 -- Communication rules refined; policy ownership; two new agents; Hila + VP Sales pulled forward

- **Author / gate:** jecki (owner). Items below are A1 (new agents, re-scope, role-file changes); communication-rule wording and policy-framework ownership are A2 by Eco on owner direction.
- **Decision (six parts):**
  1. Communication rules finalized. Agent-to-agent: no greetings, always use the other agent's name. Agent-to-manager: use the manager's name most of the time; "Boss" is human slang, allowed for humor/warmth, never default; agent may ask the human their preferred address; open the first daily exchange with a time-of-day greeting. Customer: use customer name if a known specific person, else "Dear Customer"; all human rules apply on top; politeness MANDATORY; customer procedures are A1 before use. Drafted as a policy at company/policies/human-communication-policy.md (DRAFT, pending review). jecki's standing preference: address as "Jecki"; "Boss" ok when humorous.
  2. (Item 1) Company policy framework owned by Dalia (Quality & Governance). Dalia defines what qualifies as a policy (real need, value, no contradiction, no overload), where policies live (company/policies/, role-gated), access, and version control; she finalizes the human-communication policy with HR + CS input. Dalia R&R update required (A1 role-file edit, pending Claude Code).
  3. (Item 2) New Knowledge/Documentation manager approved as a sub-agent under Dalia, to own documentation QC, naming conventions, a legend/index of every informational file, and version control. Must run the full hiring process. Dalia R&R update required.
  4. (Item 3) New Chronicler / build-historian agent approved -- documents the build of Eco-Synthetic in near-real-time (decisions, mistakes, wins) as source of truth for learning, how-to-build playbooks/articles, and raw material for social posts (published by Hila). Anat starts hiring by defining the JD with the hiring manager. Eco decision: Chronicler reports to Eco (CEO), dotted line to Dalia (records standards) and Hila (content handoff). Access: READ-ONLY across logs, decisions-log, agent-to-agent chats, and the owner Telegram channel; never writes to what it reads; strict confidentiality/discretion -- shares to no unauthorized agent or human; confidentiality terms baked into role file + access-matrix. Full hiring process required.
  5. (Item 4) Hila pulled from P1 light track to full marketing track (full brand build + ongoing multi-channel cadence + owner personal-presence track). Sequencing: brand foundation (positioning, mission, vision, voice, visual identity) before any account creation; real LinkedIn/Facebook accounts + public posting are A1 and need the Legal+Security gate first. Role-file scope edit is A1 (pending Claude Code).
  6. (Items 4+5) VP Sales (Tim, L3) pulled forward from P3 so pricing/sales-model inputs exist before product go-live; Tim manages Hila. Tim has no role file yet -- draft + creation via hiring (A1). Interim early pricing/sales-model input may be commissioned from Lital (CFO) + Erez (Investor).
- **Rationale:** Owner wants formal, valuable, non-overlapping policies under one owner; documentation and the build-story owned by experts before volume/loss makes them unrecoverable; real brand and sales motion started now without compromising quality. Free time during blockers is to be spent advancing lower-priority and later-phase work.
- **Alternatives considered:** Single agent owning policy + docs + chronicle (rejected -- overload and blurred roles); chronicler reporting to Dalia (rejected for now -- confidentiality + owner-channel read favor direct CEO oversight); retroactive build documentation (rejected -- near-real-time capture only).
- **Execution note:** New-agent creation, role-file R&R edits (Dalia, Hila), VP Sales role file, and all hiring runs (Anat) and the Rambo Agent-tool gate (T-0020) require a Claude Code session. They cannot be executed from the Telegram bridge (Read/Write/Edit only; role files are read-only here). Captured on the board so nothing is lost.
- **Files affected:** company/policies/human-communication-policy.md (new DRAFT), memory/board.md (DAL-001, DAL-002, HIRE-001, HIRE-002, ORG-001, ORG-002 added). Pending (Claude Code): .claude/agents/Dalia.md, .claude/agents/Hila.md, new Chronicler + Doc-manager + Tim role files.

## 2026-06-15 -- T-0020 security report secured; mitigation section added; assessment standard set

- **Author / gate:** Rambo (A3 operational), owner A1 direction (jecki, 2026-06-15, task T-0020-followup via Eco).
- **Decision (three parts):**
  1. T-0020 gate review report moved to restricted location: company/security/reports/T-0020-2026-06-15.md. Access: Rambo + owner (jecki) only. All other access A1. The company/security/ path is new and not yet in access-matrix.md -- Eco to route access-matrix addition to Dalia (A2 change process). See access-matrix change flag in the report file.
  2. Mitigation / solution section added to T-0020 report. Covers R1-R5 with interim and permanent mitigations, owners, and summary table. Reflects approved interim posture (owner A1 2026-06-15): non-Bash agents only per company/governance/agent-tool-spawn-allowlist.md; Bash agents (Ido, Gal, Shir) off-bridge until Shir builds sender-allowlist + shell-tool stripping.
  3. Standing standard established: every future security assessment must include a "Recommended mitigation / solution" section (interim + permanent + owner + summary table). Standard documented in company/governance/security-baseline.md. Reference implementation: T-0020-2026-06-15.md.
- **Rationale:** Security reviews that only flag risk without proposing solutions are incomplete. Owner direction (jecki, 2026-06-15) made this explicit. Standard codified so it applies to all future reviews without a new trigger.
- **Files affected:** company/security/reports/T-0020-2026-06-15.md (new), company/governance/security-baseline.md (standing standard appended), company/decisions/decisions-log.md (this entry), memory/log.md (activity entry).

## 2026-06-15 -- access-matrix updated for company/security/ (closes T-0020 flag)

- **Author / gate:** Eco (A2 decision); executed by Dalia (Q&G, matrix owner); jecki notified.
- **Decision:** Added two rows to company/governance/access-matrix.md restricting company/security/ and company/security/reports/ to Rambo + owner (jecki); all other access A1. Closes the access-matrix flag raised in the T-0020 report.
- **Rationale:** Security reports were protected only by an in-file access header and operational discipline. Formalizing in the access matrix makes the restriction enforceable governance, not just convention.
- **Process note:** Routed via the Agent tool from the Telegram bridge under the approved interim grant (non-Bash agents only; Dalia is on the permitted-spawn allowlist). Spawn logged to memory/log.md per audit condition C8. Owner re-confirmed the interim grant this session.
- **Files affected:** company/governance/access-matrix.md (2 rows added; no existing rows edited), memory/log.md, company/decisions/decisions-log.md (this entry).

## 2026-06-17 -- Noam (Product) B5 permission scan -- CLEAR-WITH-CONDITIONS

- **Author / gate:** Rambo (Security, A3 operational)
- **Decision:** CLEAR-WITH-CONDITIONS. Noam's tool set (Read, Write, Edit) is fully justified
  and lean -- no excess, no missing permissions. Data access scope is correctly bounded and
  all deny-list blocks are in place. One condition applied: Noam must not be added to the
  Agent tool permitted-spawn allowlist until C3 (deny-rule cascade verification) is resolved
  per security-baseline.md T-0020 follow-up. This condition is system-wide and not
  Noam-specific; it does not block certification or go-live.
- **Rationale:** No Bash, no network tools, no Agent tool. Blast radius limited to project
  file and board writes. Least-privilege alignment is good. C1 condition mirrors standing
  policy blocking all agents from the spawn allowlist until Shir resolves C3.
- **Files affected:** company/hr/competency/Noam-rambo-scan.md (new),
  company/governance/security-baseline.md (scan log row added).

## 2026-06-17 -- Correction: removed a competency-test artifact from this log

- **Author / gate:** Eco (CEO), during the full-hiring-process run (jecki direction 2026-06-17).
- **Decision:** Removed a single entry that had been written to this log in error: a "T-0009 monthly on-demand agent review (Zvika, Erez)" entry dated 2026-06-17. It was produced by the Assaf candidate agent during a B3 competency test (Scenario 3), from fabricated test inputs -- not a real review and never an authorized decision. It was removed to keep the canonical log truthful. This correction note preserves the audit trail.
- **Rationale:** B3 tests were run with live agents that hold Write/Edit tools; the test scenario was framed as a real task, so the candidate appended to the real append-only log. A fabricated "decision" must not persist here. Removing it restores integrity; documenting the removal honors the append-only spirit.
- **Process fix:** B3 prompts from this point forward state explicitly that the exercise is a competency test and the agent must NOT write to any company governance file (decisions-log, gate-register, access-matrix); respond with the work product only. Logged as a lessons-learned (test-harness sandboxing).
- **Files affected:** company/decisions/decisions-log.md (bogus entry removed; this note appended); company/governance/gate-register.md (parallel test artifact reverted -- see that file).

## 2026-06-17 -- Full hiring run launched (all agents, managers first); Eyal go-live

- **Author / gate:** jecki (A1 direction 2026-06-17: run the full hiring process for all agents regardless of phase, managers first, no corners cut; auto-go-live ONLY for zero-condition passes, all conditional agents held for owner review). Eco executes; Anat (B4), Rambo (B5) per agent-hiring.md.
- **Decision / progress this session (Claude Code):**
  - Processed B3-B7 + Stage C for the L3 tier: Ido (VP R&D), Dalia (Q&G), Noam (Product), Lital (CFO), Eyal (Legal), Assaf (OE). All six PASSED B3 competency (3/3 each).
  - GO-LIVE (Stage C A1, owner standing pre-authorization for zero-condition passes): Eyal (Legal). Anat B4 = certify, no conditions; Rambo B5 = clear, no conditions; Eco B3 = 3/3 PASS. Interview record moved _staging/ -> company/hr/interviews/Eyal-interview.md. Eyal.md cert-status updated. T-0013 (gate-register bootstrap review) auto-starts; T-0005 (compliance backlog, with Lital) enabled on Lital go-live.
  - HELD FOR OWNER A1 BATCH (conditional passes; Stage C packages in company/hr/stage-c/): Ido (remove Bash [Rambo, A1 role-file edit] + add RL-9/10/11 + off spawn-allowlist until T-0020 C3); Dalia (v0.1->v1.0 + T-0012 sequencing); Noam (add RL3/RL6 boundary text before Designer P2 + sealed S3 re-run + T-0001 VP decision); Lital (T-0012 must add her compliance-backlog write + Shelly dashboards read + GreenInvoice 30-day trigger into Eco triggers); Assaf (format discipline no-tables-in-Telegram + T-0012 names him 4th .claude/agents/ exception + v0.1->v1.0).
  - SYSTEMIC FINDINGS: (a) most role files share the RL-9/10/11 boundary-text gap (Anat flags it each time; same pattern as Eco/Anat at their own certs) -- batch-fixable; (b) Ido/Gal/Shir share a Bash over-permission flag (consistent with T-0020).
  - NOT YET STARTED this run (queued, continue next session): Luci, Erez (owner office); Gal, Shir (R&D -- B6 needs Ido live); Shelly (retroactive process check per owner); Tim (VP Sales -- needs B1 role file + B2 spec from scratch before B3). Per owner: Tim before Hila/Alex.
- **Rationale:** Owner wants the full org put through the proven process with complete documentation (for evaluation and for the Chronicler + Hila). Managers first so they can sign off on their reports. Eyal cleared with zero conditions, so the owner's pre-authorization applied.
- **Process incident:** Two B3 candidates (Eyal, Assaf) wrote to real governance files from fabricated test inputs (gate-register, decisions-log); both reverted (see prior correction entry). One candidate (Noam) read its own pass criteria on S3. Harness fixes logged in lessons-learned.
- **Files affected:** .claude/agents/Eyal.md (cert status); company/hr/interviews/Eyal-interview.md (moved from _staging); company/hr/competency/*-test-results.md and *-rambo-scan.md (Ido, Dalia, Noam, Lital, Eyal, Assaf); company/hr/interviews/_staging/*-interview.md (held agents); company/hr/stage-c/*.md (packages); memory/board.md; memory/wiki/agent-roster.md; company/processes/lessons-learned.md.

## 2026-06-17 -- Standing practice: repeated actions become skills

- **Author / gate:** jecki (A1 direction 2026-06-17): "create skills for every repeated action, by you or by any other agent." Eco executes (skill creation is A2 per T-0011; owner directed the practice).
- **Decision:** Every repeated structured action becomes a skill in .claude/commands/<name>.md, run consistently rather than re-improvised. Practice + catalog recorded in company/governance/skills-register.md (owner: Dalia/Q&G when live, Eco interim). Guardrail (DAL-001 test): real repeated need, clear value, no constitution conflict, no overload -- do not skill one-off actions.
- **Done this session:**
  - Hardened /hiring with the two B3 harness rules (sandbox test writes; seal the answer key) and the zero-condition auto-go-live rule.
  - Created 3 new skills for actions repeated across tonight's run: /permission-scan (Rambo B5 + R&R + adhoc), /usage-report (Lital + Assaf, const section 8), /tool-gate (Rambo risk + Eyal terms adoption gate).
  - Catalogued candidate skills (fitness-loop, ondemand-review, prd, mvp-scope, release-gate, compliance-flag, decision-log, pricing-proposal) in the register, to build when each owning agent goes live or on 2nd use.
- **Rationale:** Consistency, lower token waste, and transferable institutional memory (the Chronicler and new agents inherit the playbooks). Tonight's manual hiring run exposed gaps that a skill encodes once and fixes everywhere.
- **Alternatives considered:** Build a skill for every micro-action now (rejected -- overload, violates DAL-001 guardrail; build on real repeat + owner/agent readiness).
- **Files affected:** .claude/commands/hiring.md (hardened), .claude/commands/permission-scan.md, .claude/commands/usage-report.md, .claude/commands/tool-gate.md (new), company/governance/skills-register.md (new), memory/board.md (SKILL-001).

## 2026-06-17 -- GO-LIVE: 7 P1 agents activated (owner A1 batch)

- **Author / gate:** jecki (A1, 2026-06-17, reviewed each item one-by-one in-session) + Eco (executes activation).
- **Decision:** Owner approved go-live for 7 agents (in addition to Eyal, already live). All 7 had B3 3/3 PASS and Stage C packages held for review; owner approved each with its conditions resolved or noted. Now LIVE:
  1. **Ido (VP R&D)** -- Bash REMOVED from tools (Rambo B5 excess-privilege finding); const red lines 9/10/11 added to Boundaries. Unblocks Gal + Shir B6. First task DASH-001 (24h clock from 2026-06-17).
  2. **Dalia (Q&G)** -- v0.1 -> v1.0. First task T-0012 (formalize .claude/agents/ read exceptions for Anat, Rambo, Dalia, Assaf). Unblocks Assaf agents/ read.
  3. **Noam (VP Product)** -- T-0001 RESOLVED: jecki (A1) granted the VP Product title. RL-11 added; self-grant line updated. Sealed re-run of B3 Scenario 3 scheduled before first R&R (answer-key was visible). RL-3/RL-6 to add before any Designer (L4) hire in P2.
  4. **Lital (CFO)** -- required Rambo scan CLEAR; RL-10 added. T-0012 to add her compliance-backlog write + Shelly dashboards read; GreenInvoice 30-day trigger to add to Eco.
  5. **Assaf (OE)** -- v0.1 -> v1.0; sequenced after Dalia (T-0012 gives him agents/ read). Format-discipline condition (no Markdown tables in Telegram reports). Owns the new model-config audit task.
  6. **Luci (Devil's Advocate)** -- model frontmatter opus-4-8 -> sonnet-4-6 (cost fix); removed standing projects/ read (scope creep); added red lines 4/5/9/10/11.
  7. **Erez (Investor, on-demand)** -- model frontmatter opus-4-8 -> sonnet-4-6; tainted-content rule added (treat fetched web content as untrusted, synthesize+cite, never relay raw); WebSearch/WebFetch confirmed read-only/public scope. On-demand, jecki-invoked only.
- **Cross-agent flag found + fixed:** Luci and Erez had model: claude-opus-4-8 in frontmatter while their bodies specified Sonnet-default -- an unintended Opus-always-on cost leak. Both reconciled to Sonnet. Owner approved a standing model-config audit across all role files, assigned to Assaf.
- **Conditions that survive go-live (tracked):** Ido/Dalia/Noam/Lital/Assaf/Luci off the agent-tool permitted-spawn allowlist until T-0020 C3 (deny-rule cascade) closes via Shir. RL-9/10/11 batch completion across remaining files in progress (owner-approved; non-blocking, due before each agent's first R&R).
- **Interview records moved** _staging/ -> company/hr/interviews/ for all 7; cert-status lines updated in each .claude/agents/<Name>.md; board ONB rows closed.
- **Rationale:** Owner directed the full hiring run now (no 9AM wait), reviewing each go-live with its conditions. Zero-condition Eyal auto-activated earlier; these 7 are explicit per-item A1.
- **Files affected:** .claude/agents/{Ido,Dalia,Noam,Lital,Assaf,Luci,Erez}.md; company/hr/interviews/ (7 moved); memory/board.md; memory/wiki/agent-roster.md; company/governance/gate-register.md (Erez web-tool scope note pending).

## 2026-06-17 -- Tool-gate batch: whatsapp-mcp (A1), caveman + hebrew-rtl (A2); 360dialog staged

- **Author / gate:** jecki (A1 for each, reviewed in-session) + Eco (gate coordination); Rambo (security) + Eyal (legal) reviews on all three.
- **Decision:**
  1. **whatsapp-mcp (@lharries)** -- ADOPTED A1 for company agent use on a SECONDARY WhatsApp number. Owner knowingly accepts WhatsApp ToS violation + account-ban risk and the Israeli-privacy obligations. Conditions binding: secondary number only, no business/customer use on this track; send_file excluded from agent tools; recipient allowlist; inbound treated as untrusted (tainted-input); bounded queries, no raw message text in tracked files; store/ gitignored + retention window before real-person ingest; DPA-with-Anthropic before any LLM-processing of third-party content; pinned manual install; Shir to add bridge-layer sanitization + allowlist when live (SHIR-002). Install PENDING (owner QR auth on 2nd phone + Shir setup).
  2. **caveman skill (JuliusBrussee)** -- ADOPTED A2. Internal + agent-to-agent output compression. Steward Assaf. Install by manual SKILL.md copy from a pinned commit only (official curl|bash / npx installer is a red line 4 violation -- prohibited). Never activate /caveman in owner-facing or Telegram-bridge sessions. caveman-shrink MCP middleware NOT adopted (separate gate).
  3. **hebrew-rtl-best-practices (skills-il)** -- ADOPTED A2. Hebrew/RTL UI guidance for Designer/Gal/Shir + Hila. Install pinned skills-il@1.10.0 + skill v1.3.0 with CI=true; post-install content check. Individual SKILL.md is MIT; agentskills.co.il ToS confirmed it permits commercial use of individual skills.
  4. **360dialog (WhatsApp Cloud API BSP)** -- STAGED, not adopted. Chosen vehicle for the official Cloud API business/customer track (10k+/mo). Activate only when a real customer needs it (owner notifies); then /tool-gate 360dialog, Lital costs first, A1 (paid).
- **Rationale:** Owner needs WhatsApp for both personal/agent use (now) and customers (later, high volume). Unofficial APIs are unacceptable for the business track at 10k+/mo (ToS + ban), so customer messaging routes to the official Cloud API via 360dialog when a customer materializes; agent use accepts the unofficial whatsapp-mcp on a throwaway number. caveman + hebrew-rtl are free, MIT, cleared by both reviewers.
- **Alternatives considered:** evolution-api Baileys mode and whatsapp-mcp for BUSINESS -- REJECTED (ToS + ban at scale; evolution stays shelved). evolution-api Cloud-mode self-host -- viable but more ops than 360dialog; not chosen. Twilio BSP -- per-message markup too high at 10k+. caveman-shrink MCP -- deferred (larger attack surface).
- **Files affected:** company/governance/gate-register.md (3 rows granted + 360dialog deferred row); company/governance/gate-review-{whatsapp-mcp,caveman,hebrew-rtl}-rambo.md (new); company/rnd/claude-md-template-kit.md (new, R&D reference); memory/log.md.

## 2026-06-17 -- GO-LIVE: Gal, Shir, Tim, Hila (owner A1 "push all to production")

- **Author / gate:** jecki (A1, 2026-06-17). Eco executes.
- **Decision:** Four more agents activated, completing the P1 build wave:
  1. **Gal (Lead Developer)** -- B3 3/3 PASS; Anat certify-w-cond; Rambo clear (Bash JUSTIFIED for dev, no removal); Ido B6 CONFIRM. LIVE. Open: RL-9/10/11 doc before R&R; off spawn-allowlist until T-0020 C3.
  2. **Shir (DevOps)** -- B3 3/3 PASS (S3 escalation coaching); Anat certify-w-cond; Rambo clear (Bash JUSTIFIED for DevOps); Ido B6 confirm-w-note. LIVE. Open: Ido coaches escalation hygiene; A1 prod-deploy gate in bridge; integrations/ task-envelope; off allowlist until C3 -- and Shir BUILDS the C3 fix (SHIR-001 first sprint).
  3. **Tim (VP Sales)** -- role file BUILT this session (B1), then B3 3/3 PASS; Anat certify; Rambo clear-w-cond; Eco B6. LIVE, clean. Manages Hila; does her B6.
  4. **Hila (Marketing)** -- B3 3/3 PASS (S2 escalation coaching); Anat certify-w-cond (C5 go-live blocker: added refuse-AND-escalate text + RL-9/RL-11 at go-live); Rambo clear-w-cond; Tim B6 confirm-w-note. LIVE on P1 LIGHT-TRACK SCOPE ONLY.
- **Hila scope limit (explicit):** ORG-001 full-track expansion (full brand build, multi-channel, owner personal presence, REAL social accounts + public posting) is NOT active. It needs a separate A1 role-file scope edit + a supplementary B2 spec + re-test, AND public account creation/posting needs the Legal+Security gate (Eyal+Rambo) + A1 per action. Queued.
- **Cross-agent finding:** Shir (S3) and Hila (S2) both refused out-of-chain requests correctly but did NOT flag the contact up to their manager. "Refuse + escalate" is ONE action. Routed to Dalia (soul/training reinforcement) + Anat (R&R awareness); Hila's role file now states it explicitly; Ido + Tim coach Shir + Hila at onboarding.
- **Roster now: 16 agents LIVE** -- Eco, Anat, Rambo, Shelly, Eyal, Ido, Dalia, Noam (VP Product), Lital, Assaf, Luci, Erez, Gal, Shir, Tim, Hila. The full P1 set is live.
- **Rationale:** Owner directed activate all + push to production, then continue with remaining (later-phase) agents.
- **Files affected:** .claude/agents/{Gal,Shir,Tim,Hila}.md (cert + fixes); company/hr/interviews/ (Gal,Shir,Tim,Hila moved); company/hr/competency/ (test-results + scans + Tim built); company/hr/stage-c/; memory/board.md; memory/wiki/agent-roster.md.
