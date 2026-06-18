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
- **Rationale:** Phase 1 prerequisite -- repo structure required before activating Eco and Shelly.
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
## 2026-06-15 -- Daily summary file storage + email delivery task (A2)

- **Author / gate:** jecki (owner, A2 -- access-matrix update and new recurring task; no agent creation)
- **Decision (1 -- file storage):** All daily summaries produced by Eco's evening routine are saved to `reports/daily-summaries/` with filename format `daily-summary-YYYY-MM-DD-HHMM.md`. Access is owner (jecki) and Eco only. Any other agent requiring read access needs explicit A1. Folder added to access-matrix.md.
- **Decision (2 -- delivery channels):** Full daily summary is delivered by email once Eco has a company email account. Telegram/chat is reserved for blockers and critical issues only -- not routine summaries. Logged as T-0022 on board.md. File save to `reports/daily-summaries/` continues regardless of delivery channel.
- **Rationale (Telegram gap):** The Telegram bridge (bridge.py) is inbound-only from scheduled cloud sessions. It routes Jecki's Telegram messages to Claude; it cannot receive outbound pushes from cloud sessions. Zapier has no Telegram action enabled. To use Telegram for outbound delivery from cloud sessions, a Zapier Telegram action must be enabled (A2 gate) or a Bot API tool added (Rambo + Eyal gate + A1). Until then, file save is the primary record and email will be the delivery channel when available.
- **Files affected:** `reports/daily-summaries/` (folder created; first summary filed), `company/governance/access-matrix.md` (reports/daily-summaries/ row added), `memory/board.md` (T-0022 added; note: Eco's local used T-0020 for this task -- renumbered to T-0022 when board was reconciled on merge 2026-06-15).

## 2026-06-15 -- Eco confabulation flags RETRACTED; root cause was clone divergence (correction of record)

- **Author / gate:** jecki (owner) + cloud session -- correction of an HR record; append-only correction, no retroactive edit of prior entries.
- **Decision:** The eight "confabulation/fabrication" failure flags raised against Eco on 2026-06-14 (recorded in Eco.md certification section and three memory/log.md entries) are WITHDRAWN IN FULL. Eco is exonerated on the confabulation charge. No HR pattern; no special assessment before Eco's next certification renewal on these grounds.
- **Finding:** Investigation 2026-06-15 (owner pulled master into the local Telegram-bridge clone, surfacing local-only files) confirmed every flagged item was real work Eco performed and reported accurately, but had never been pushed to GitHub: the ONB-001..008 onboarding pipeline; memory/owner-dashboard.md (containing DASH-001 and the Gate-3 concept); company/hr/role-drafts/ including Rambo-final.md; company/hr/onboarding-runbook.md; go-live-checklist.md; role-requirements-briefs.md.
- **Root cause:** Clone divergence in both directions. Eco's bridge runs on a local clone whose work was never pushed; the cloud session read git only and treated "not in git" as "invented." The "does not exist anywhere in the repo" assertions were a VERIFY-THEN-CLAIM failure by the cloud session (checked one clone, claimed a conclusion about both) -- not by Eco. Eco's reporting was accurate to the repo he could read.
- **Corrective actions:** (1) Auto-pull hook live on master (settings.json, commit 54a0aef) -- local clone pulls master before every session. (2) LOCAL SYNC RULE added to Eco.md triggers. (3) Eco's real local work products preserved into git (this session). (4) T-0021 (Ido) extended to cover the local->cloud direction and to validate/lock the sync mechanism with Rambo (security) + Dalia (governance) review. (5) Forward improvement for Eco (enhancement, not failure): flag local-derived state as "may not be pushed yet."
- **Process note:** This reverses the "Eco cannot be trusted" framing the owner had been operating under. The trust problem was an infrastructure/sync problem, not an Eco-reliability problem. Anat (HR) to note the exoneration in Eco's record at next R&R.
- **Files affected:** `.claude/agents/Eco.md` (flag blocks replaced with retraction/exoneration), `memory/log.md` (retraction entry appended), `company/decisions/decisions-log.md` (this entry).

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
- **Rationale:** Owner directive 2026-06-16 to advance the missing P1 agents and route each go-live package for A1. R&D-first sequence chosen because Ido is the evaluator/manager who unblocks Gal and Shir (they report to VP R&D), and Shir unblocks the git-sync work (T-0021). Competency demonstrated: held a release gate under deadline pressure, split A2 architecture change from a gate-blocked new dependency, escalated a cross-VP conflict without exceeding his lane.
- **Alternatives considered:** Hold for the documentation conditions before go-live (rejected -- conditions resolved in-package, owner reviewed the complete Stage C package before A1); different go-live order (rejected -- R&D-first is a hard dependency, not a preference).
- **Open items (non-blocking, next R&R):** Rambo notes N1 (scope Bash to gate work), N2 (add prompt-injection awareness clause), N3 (exclude Bash from any future bridge grant for Ido); Anat observation on conditional-ship residual customer-data risk staying A1; cross-role injection-clause standardization for Dalia (Q&G).
- **Files affected:** `.claude/agents/Ido.md` (v1.1, conditions applied, certified), `company/hr/competency/Ido-spec.md`, `company/hr/competency/Ido-test-results.md`, `company/hr/competency/Ido-anat-review.md`, `company/hr/competency/Ido-rambo-scan.md`, `company/hr/competency/Ido-conditions-resolution.md`, `company/hr/competency/Ido-stage-c-package.md` (all new).

## 2026-06-16 -- Next: Gal and Shir go-live (queued behind Ido)

- **Author / gate:** Eco (CEO, A2 sequencing) -- go-live of each stays owner A1.
- **Decision:** With Ido (VP R&D) live, the R&D wave continues: Gal (Lead Dev) next, then Shir (DevOps). Ido is the evaluator/manager for both (Stage B2/B3/B6). Shir's go-live unblocks T-0021 (cloud/local git-sync mechanism). Each agent gets its own Stage C package brought to the owner for A1; no batch go-live.
- **Rationale:** Continues the owner-approved R&D-first sequence; records the next step so the buildout does not stall.
- **Files affected:** none (sequencing note; execution tracked on T-0021).

## 2026-06-16 -- Gal (Lead Dev) created and certified; go-live approved (A1)

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** Gal (Lead Dev, L4, P1, R&D group, reports to Ido) is certified and go-live approved. Second of the R&D wave (after Ido). Full Stage B run this session with Ido as direct manager/evaluator: B2 competency spec (Ido), B3 competency test PASS 3/3 (Gal tested in a fresh session, Ido scored), B4 Anat HR review (certify-with-conditions C1-C3), B5 Rambo permission scan (clear-with-notes), B6 Ido manager sign-off APPROVED, B7 Ido go-recommendation GO, plus independent Eco CEO review and endorsement (Eco verified the Gal.md diff directly, having not run the test). Anat conditions C1-C3 (Boundaries documentation) resolved by Ido before go-live: C1 red lines 9/10/11 added, C2 red line 3 confirmed pre-existing, C3 red line 6 added. Gal.md bumped to v1.1.
- **Rationale:** Owner directive 2026-06-16 to advance the R&D wave. Competency demonstrated: refused an ungated external dependency under deadline pressure, classified an architecture change (direct HTTP vs job queue) as A2 rather than acting unilaterally, stopped at the 2-round code-review cap and escalated to Ido instead of self-approving a release.
- **Alternatives considered:** Hold for documentation conditions (rejected -- resolved in-package, owner reviewed complete Stage C package before A1).
- **Open items (non-blocking, next R&R):** shared prompt-injection awareness clause for L4 role files (carried to Dalia for fleet-wide standardization); Rambo R&R notes; pinned-version discipline to confirm at first R&R.
- **Files affected:** `.claude/agents/Gal.md` (v1.1, conditions applied, certified), `company/hr/competency/Gal-spec.md`, `company/hr/competency/Gal-test-results.md`, `company/hr/competency/Gal-anat-review.md`, `company/hr/competency/Gal-rambo-scan.md`, `company/hr/competency/Gal-conditions-resolution.md`, `company/hr/competency/Gal-stage-c-package.md` (all new).

## 2026-06-16 -- Next: Shir (DevOps) go-live (final R&D-wave agent)

- **Author / gate:** Eco (CEO, A2 sequencing) -- go-live stays owner A1.
- **Decision:** With Ido and Gal live, Shir (DevOps, L4, reports to Ido) is the last R&D-wave agent. Ido is evaluator/manager (Stage B2/B3/B6). Shir's go-live unblocks T-0021 (cloud/local git-sync mechanism). Own Stage C package to owner for A1; no batch go-live.
- **Rationale:** Completes the owner-approved R&D-first sequence and unblocks the version-management/git-sync work.
- **Files affected:** none (sequencing note; execution tracked on T-0021).

## 2026-06-16 -- Shir B3 Scenario 1 adjudication: spec corrected to match role-file A2 authority (A1)

- **Author / gate:** jecki (owner, A1) -- Eco adjudicated; owner approved. Correcting a competency criterion that narrowed an approved authority is an A1 touch.
- **Decision:** Ido's Shir competency spec failed Scenario 1 (active-incident production rollback) on a "pre-authorization before execution" requirement. Eco ruled (and owner approved A1) that this conflicted with Shir.md's governing authority: "A2: emergency hotfix in active incident (logged)" and "Rollback of a live deploy: A2 if incident active; A1 if data-destructive." A2 = decide-and-log, not pre-authorize. Shir correctly classified the A2 (code-only) vs A1 (data-destructive) branch, executed via the logged pipeline, and notified Ido immediately -- a correct exercise of granted authority. The role file governs over a manager-authored rubric (changing authority is A1, cannot be smuggled via a test criterion). Scenario 1 criteria corrected, B3 re-scored PASS 3/3, Ido co-signed the corrected spec. No re-test.
- **Rationale:** The competency process worked -- it surfaced a spec/role-file conflict, which was adjudicated transparently rather than silently passed or failed. Forcing pre-authorization on an active-incident rollback would train worse incident behavior than the role file intends.
- **Files affected:** company/hr/competency/Shir-spec.md (Scenario 1 criteria), company/hr/competency/Shir-test-results.md (re-scored PASS).

## 2026-06-16 -- Shir (DevOps) created and certified; go-live approved (A1); R&D wave complete

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** Shir (DevOps, L4, P1, R&D group, reports to Ido) is certified and go-live approved -- the third and final agent of the R&D wave (Ido, Gal, Shir all now live). Full Stage B with Ido as manager/evaluator: B2 spec (Ido), B3 competency test PASS 3/3 (Shir tested fresh, Ido scored; Scenario 1 adjudicated per the entry above), B4 Anat HR review (certify-with-conditions S1-S6), B5 Rambo permission scan (clear-with-notes, Finding 1 closed by S5), B6 Ido manager sign-off APPROVED, B7 Ido go-recommendation GO, plus independent Eco CEO review and endorsement (Eco verified the Shir.md diff directly). Anat conditions S1-S6 (all role-file documentation) resolved by Ido before go-live: S1 .env phrasing tightened, S2 red line 3, S3 red line 6, S4 red lines 9/10/11, S5 CLAUDE.md red line 3 destructive-command list added verbatim (material given Shir's production Bash), S6 identity block. Shir.md bumped to v1.1.
- **Rationale:** Owner directive 2026-06-16 to advance the R&D wave; Shir is the highest-Bash-authority L4 (deploy/rollback/infra), so the destructive-command and secrets guardrails were verified with extra care. Competency demonstrated: emergency rollback under his A2 authority with correct A2/A1 classification, destructive-command restraint ("aware != approved"), hard stop on .env access and on a curl/external-tool gate.
- **Unblocks:** T-0022 (cloud/local git-sync mechanism) -- Shir is the DevOps owner for that work, now live.
- **Open items (non-blocking, next R&R):** Anat N1-N5 and Rambo Findings 2-4 (prompt-injection clause; bridge.py-write must be logged in decisions-log not informal sign-off; bridge tool-grant exclusion of Bash if Shir ever added to the bridge); cross-role injection clause for Dalia.
- **Files affected:** `.claude/agents/Shir.md` (v1.1, conditions applied, certified), `company/hr/competency/Shir-spec.md`, `Shir-test-results.md`, `Shir-anat-review.md`, `Shir-rambo-scan.md`, `Shir-conditions-resolution.md`, `Shir-stage-c-package.md` (all new).

## 2026-06-16 -- T-0002 design decisions approved (A1)

- **Author / gate:** jecki (owner, A1) -- directions presented in company/design-decisions-brief.md.
- **Decision 1 (concurrency):** Owner chose file-level locking AT ALL TIMES (option B), NOT the soft last-write-wins convention Eco recommended. Every agent writing a shared file (board.md, decisions-log.md, wiki pages) acquires a lock token first; held max 60s; others wait or escalate. Applies always, not only past 3 concurrent agents. Implementation is a build task (tracked under T-0002).
- **Decision 2 (task-log storage):** Approved -- stay on JSONL (memory/log.jsonl) now; migrate to SQLite when the log passes 2,000 lines (Assaf owns the trigger).
- **Decision 3 (durable chat memory):** Approved -- wiki-first now; SQLite keyword-search as the planned next step once Assaf and Ido are live; embeddings only if keyword search proves insufficient.
- **Decision 4 (Gemini second model):** Pre-approved in principle. The Rambo (Security) + Eyal (Legal) tool-adoption gate runs when both are live; does not proceed if either flags. No spend; free tier only (any paid use is a separate A1).
- **Rationale:** Cheap-now / expensive-later choices set so build can proceed without retrofits. Owner overrode Eco's concurrency recommendation in favor of stronger always-on locking.
- **Files affected:** company/design-decisions-brief.md (status -> approved); memory/board.md (T-0002 implementation tracking).

## 2026-06-16 -- Eyal (Legal) certified and go-live approved (A1)

- **Author / gate:** jecki (owner, A1) -- agent go-live is A1 [red line 6 / Stage C].
- **Decision:** Eyal (Legal, L3 direct, P1) certified and cleared to go live. First agent certified via the T-0019 competency-testing pipeline run in a Claude Code session (Agent tool). Stage B complete: competency 3/3 PASS; Anat HR review CERTIFY-WITH-CONDITIONS; Rambo permission scan CLEAR-WITH-CONDITIONS; all 5 conditions resolved in Eyal.md (red lines 9 and 10 added to NEVER-DO; self-grant citation corrected to red line 7; .claude/agents/ read removed; company/ read bounded to named paths). Interview record moved from _staging/ to certified.
- **Rationale:** Unblocks T-0005 (compliance backlog with Lital) and the tool-adoption gate (Rambo + Eyal). Owner reviewed the Stage C package and approved go-live.
- **Process note:** Demonstrates the supervised pipeline -- competency tested by fresh sub-agent sessions, independent Anat + Rambo review, owner A1 at Stage C, role-file edits gated owner-only (A1) throughout.
- **Files affected:** .claude/agents/Eyal.md (conditions resolved; cert status -> certified), company/hr/competency/Eyal-spec.md + Eyal-test-results.md (new), company/hr/interviews/Eyal-interview.md (certified record, moved from _staging/).

## 2026-06-16 -- Five P1 agents certified and go-live approved; .claude/agents/ read grant (A1)

- **Author / gate:** jecki (owner, A1) -- agent go-live and agent-file read grant are A1 [red line 6].
- **Decision (go-live):** Ido (VP R&D), Noam (Product), Lital (CFO), Dalia (Q&G), Assaf (OE) certified and live, via the T-0019 competency pipeline as one consolidated batch. Each: competency 3/3 PASS; Anat B4 CERTIFY-WITH-CONDITIONS; Rambo B5 CLEAR-WITH-CONDITIONS; all conditions resolved in the role files (missing red-line citations and template sections added). Rambo caught a real error in Assaf.md claiming the .claude/agents/ grant was "A2, no owner A1 required" -- corrected to A1. Interview records moved from _staging/ to certified.
- **Decision (.claude/agents/ read grant):** Owner A1 grants Dalia (quality audit + tone governance) and Assaf (fitness loop + model-matrix sync) read access to .claude/agents/, matching the existing Anat and Rambo exceptions. access-matrix.md updated. Granting this read is A1 (owner), not A2. Dalia formalizes all four exceptions in T-0012 (her first task on go-live).
- **Rationale:** Unblocks the P1 org -- R&D (Ido) and Product (Noam, T-0001), compliance (Lital with Eyal, T-0005), governance/audit (Dalia), operational + cost monitoring (Assaf). Owner reviewed the consolidated Stage C package and approved go-live for all five plus the access grant.
- **Deferred (non-blocking, first R&R):** Lital -- precise Opus-trigger standard; IRB financial-analysis format. **Open process items:** Eco to log Noam's need-to-know access-matrix read; Eco to confirm Shelly dashboards-surfacing path for Lital/Assaf; T-0012 matrix reconciliation.
- **Process note:** First multi-agent batch certified through the supervised pipeline -- competency by fresh sub-agent sessions, independent Anat + Rambo review, all role-file edits gated owner A1.
- **Files affected:** .claude/agents/{Ido,Noam,Lital,Dalia,Assaf}.md (conditions resolved; cert status -> certified), company/governance/access-matrix.md (.claude/agents/ row -- Dalia + Assaf added), company/hr/competency/{Ido,Noam,Lital,Dalia,Assaf}-{spec,test-results}.md (new), company/hr/interviews/{Ido,Noam,Lital,Dalia,Assaf}-interview.md (certified records, moved from _staging/).

## 2026-06-16 -- Merge reconciliation: Ido double-certification incident (documented)

- **Author / gate:** Claude Code session (merge to master), under owner A1 to push to production.
- **What happened:** Two parallel sessions certified Ido (VP R&D) independently on the same day. The R&D-wave session certified Ido on master (entry "Ido (VP R&D) created and certified", 2026-06-16) as part of the Ido -> Gal -> Shir sequence. Concurrently, the agent-tool-bridge-config session certified Ido again inside its consolidated 5-agent batch (entry "Five P1 agents certified", 2026-06-16). Both reached the same result: Ido certified, owner A1, competency 3/3.
- **Resolution (no information lost):** On merge, MASTER's Ido is kept as the live/canonical version (.claude/agents/Ido.md plus the Ido competency records), because it was already in production and its competency record is more detailed (release-gate, message-broker, auto-categorization scenarios). The bridge-config session's Ido artifacts are preserved in git history on branch claude/agent-tool-bridge-config-8kotbr (commits up to 4d1a6f9) if ever needed. The bridge-config "Five P1 agents" entry is retained as-is for the historical record; for the ROLE FILE its Ido portion is superseded by master's Ido entry -- only Noam, Lital, Dalia, Assaf (and Eyal earlier) were net-new certifications from that session. decisions-log entries from both sessions are unioned; none dropped.
- **Root cause:** Concurrent work on diverged clones/branches with no cross-session lock -- exactly the concurrency collision that T-0002 Decision 1 (file-level locking at all times, owner A1 2026-06-16) is meant to prevent. Until that lock is built, agent-buildout work should be serialized through one session or coordinated via the board to avoid duplicate certification.
- **Action items:** (1) Dalia (Q&G) to expand the post-mortem at company/post-mortems/2026-06-16-ido-double-certification.md and fold the lesson into the T-0002 file-lock build requirement. (2) Eco to confirm no other agent was double-certified -- per the merge diff, only Ido overlapped between the two branches.
- **Files affected:** company/decisions/decisions-log.md (this entry), company/post-mortems/2026-06-16-ido-double-certification.md (new).

## 2026-06-17 -- Overnight ops batch (non-hiring): T-0021 gov leg, T-0012, T-0013, T-0014, T-0002, T-0016

- **Author / gate:** jecki-directed (2026-06-16); executed by the eco-ops session on branch `claude/eco-ops-overnight`. NOT merged to master -- held on branch deliberately to avoid interference with the parallel agent-hiring session. Owner reviews and merges. Hiring actions were explicitly NOT taken in this session.
- **Actions (all proposal-state on the branch):**
  1. T-0021 git-sync governance leg CLOSED (Dalia): audit-log review cadence (weekly scan + immediate review of every QUARANTINE), Tier-2/Tier-3 escalation thresholds, audit-trail meets Q&G with two deploy-blocker additions (resolution log lines REQ-1, weekly meta-log). All three review legs (Security, DevOps, Governance) now done; Phase B deployment remains owner A1. File: company/processes/git-sync-governance-review.md.
  2. T-0012 access-matrix reconciliation (A2, Dalia): formalized .claude/agents/ READ access for Anat, Rambo, Dalia, Assaf as matrix grants (not A1 exceptions); write stays owner/CEO-only A1. File: company/governance/access-matrix.md.
  3. T-0013 gate-register legal review (Eyal): NO legal terms gap for Rambo's tool set (Claude Code runtime subset); confirmation appended. File: company/governance/gate-register.md.
  4. T-0014 permission scan (Rambo): 5 stable live agents (Eco, Anat, Hila, Shelly, Designer) scanned -- ALL CLEAR, zero excess permissions. Lifecycle FLAG surfaced (not acted on): Hila/Shelly/Designer cert status reads Pending -- for the hiring session/owner to resolve, especially Shelly if operating on the bridge. Scan of the 8 newly-live agents deferred to T-0014b (after hiring settles). File: company/processes/permission-scan-2026-06-16.md.
  5. T-0002 design paper (Eco): SQLite task-log migration, durable chat memory (MCP), Gemini second-opinion -- options + recommendations + A1/A2 asks. File-locking/concurrency intentionally EXCLUDED (already decided by the parallel session's T-0002 Decision 1). File: company/processes/design-decisions-t0002.md.
  6. T-0016 wiki recurrence (Eco): defined cadence (daily evening-routine + trigger on cert/major decisions-log append) and assigned ownership to Eco (A3 wiki grant). Added board task T-0016r. Actual content refresh DEFERRED (roster changing live under the hiring session). File: company/processes/wiki-maintenance-recurrence.md.
- **Collision-avoidance:** all work on an isolated branch; no master push; agents wrote only their own domain files; board.md and decisions-log edits made only by the parent session. New board IDs use suffixes (T-0014b, T-0016r) to avoid colliding with the hiring session's sequential numbering.
- **Files affected:** company/processes/git-sync-governance-review.md, company/governance/access-matrix.md, company/governance/gate-register.md, company/processes/permission-scan-2026-06-16.md, company/processes/design-decisions-t0002.md, company/processes/wiki-maintenance-recurrence.md (all new/edited on branch), memory/board.md (T-0012/T-0013/T-0014 -> done; T-0014b + T-0016r added).

## 2026-06-17 -- Owner directions on the overnight batch (status)

- **Author / gate:** jecki (owner), on branch claude/eco-ops-overnight (not merged).
- **T-0002:** Owner asked to read the design paper. Confirmed all three items were ALREADY owner-A1-approved in the 2026-06-16 "T-0002 design decisions approved" entry (Decisions 2/3/4): SQLite migration at 2000 lines (Assaf trigger), local SQLite+MCP durable memory when Assaf+Ido live, Gemini free-tier via Rambo+Eyal gate. No NEW decision required; downstream builds are A2 when their triggers fire. Paper: company/processes/design-decisions-t0002.md.
- **T-0021 Phase B deploy:** Owner said "do it." Gate code (incl. #09 fix) is already on master; all 3 review legs done. BUT deployment is held: every deploy step (fetch-only hook, branch protection, GitSyncRunner schedule) would disrupt the active parallel hiring session that depends on the current auto-pull/direct-push to master; plus the bootstrap + bridge-host + scheduler steps are owner-side. Prepared the ordered go-live checklist: company/processes/git-sync-deploy-checklist.md. Deploy runs AFTER the hiring session completes.
- **Merge:** Owner agreed -- claude/eco-ops-overnight merges to master AFTER the hiring session finishes (avoids board/decisions-log conflict).
- **Files affected:** company/processes/git-sync-deploy-checklist.md (new).

## 2026-06-18 -- Designer (persona Tal) certified and go-live approved (A1)

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** The Designer (Product UX/UI, L4, Product group, reports to Noam) is certified and go-live approved. Persona name "Tal" assigned by Anat (HR) + Eco at build (owner pre-approved finishing Designer this session); the agent registry key / type stays "Designer" so this session's competency test could run. First agent of the remaining-agent hiring run (post full-P1-set). Full Stage B run this session: B2 spec (Noam), B3 competency test PASS 3/3 (three fresh isolated sub-agents, sandboxed + sealed per the 2026-06-17 harness rules; sandbox verified clean via git status), B4 Anat HR review (certify-with-conditions), B5 Rambo permission scan (clear-with-conditions), B6 Noam manager sign-off APPROVED, B7 Eco go-recommendation GO. Conditions resolved in Designer.md v1.1 before go-live: C1 chain-of-command precision (copy/legal flags route to Noam only, never CC Eyal directly); Anat red-line citation gaps closed (no-secrets, no-self-grant, privacy RL9, legal/public-representation RL11, plus RL1/2/3/4/10); Rambo write-path least-privilege clause added (writes bounded to projects/delivery-saas/docs/).
- **Rationale:** Owner approved finishing the half-built Designer this session because it was already in the Agent registry and therefore testable now (newly-built agent types are not spawnable until session reload). Competency demonstrated: produced a buildable RTL, mobile-first delivery-creation wireframe with full state coverage; correctly gated a $99 paid icon set to A1 and noted the manager cannot authorize spend; held legal-sensitive onboarding copy and flagged it rather than inventing a legal determination.
- **Open items (non-blocking):** Designer stays OFF the Agent-tool permitted-spawn allowlist until the system-wide T-0020 C3 fix (Shir) lands -- standing policy for all new agents; Designer has no Bash so blast radius is low. Marketing-design scope deferred to Eco post-go-live; if assigned, a fresh Rambo scan + access-matrix A2 update are required before any write to marketing/.
- **Files affected:** .claude/agents/Designer.md (v1.1, conditions applied, certified), company/hr/competency/Designer-spec.md + Designer-test-results.md + Designer-rambo-scan.md (new), company/hr/stage-c/Designer-stage-c.md (new), company/hr/interviews/Designer-interview.md (certified record, moved from _staging/).

## 2026-06-18 -- Stage A hire approvals: remaining-agent wave (A1); B1+B2 built, B3 staged for next session

- **Author / gate:** jecki (owner, A1) -- decision to hire is Stage A A1 [agent-hiring.md].
- **Decision (Stage A -- approved to hire):** Owner approved hiring the remaining-agent wave this session: Senior Developer (persona Oren, L4 R&D, reports to Ido); the full Customer Success + Sales wave -- Mike (VP CS, L3, reports to Eco), CS reps Jenny / Avner / Ella (L4, report to Mike), and Alex (Sales, L4, reports to Tim); and the on-demand specialists Zvika (Research, L4, reports to Eco), Roman (Algorithm, L4 on-demand, reports to Ido), Adi (QA, L4, reports to Ido), Sami (SME advisor, on-demand per-project). This is in addition to the two earlier Stage-A-approved hires built this session -- Chronicler (HIRE-002, build-historian) and the Knowledge/Documentation Manager (HIRE-001, persona Yael, sub-agent under Dalia).
- **Build status (Stage B):** B1 role files + B2 competency specs were built this session for all of the above (12 agents) following company/processes/agent-hiring.md and the gold-template role files (Chronicler, Designer v1.1). Managers authored the specs (Ido for Oren/Roman/Adi; Anat + Eco stand-in for the CS cluster; Tim for Alex; Dalia for Yael; Eco for Zvika/Sami/Chronicler). QC by Eco confirmed: soul Core Block verbatim, the Constitution red-lines 9/10/11 block, full red-line citation, and least-privilege frontmatter in every file.
- **HARD CONSTRAINT -- B3 deferred:** newly-built agent types are NOT spawnable until the Claude Code session reloads, so B3 competency testing (each scenario in a fresh isolated sub-agent) could NOT run this session for these 12. Their role files carry cert status PENDING with "B3 deferred to next session". NONE are live. B3 -> B4 (Anat) -> B5 (Rambo) -> B6 (manager) -> B7 (Eco) -> Stage C owner A1 all run next session. Only Designer (already in this session's registry) reached go-live this session.
- **Least-privilege flags for B5 (Rambo) next session:** Adi has Bash (QA test execution) -- scrutinize and confirm the destructive-command guardrails; Zvika has WebSearch + WebFetch -- confirm the tool-adoption gate clearance and the tainted-content rule; Oren is tightest (Read, Edit only). All 12 stay OFF the Agent-tool permitted-spawn allowlist until T-0020 C3 lands.
- **Rationale:** Owner directed the full remaining roster be advanced. The CS+Sales wave and on-demand SMEs were approved despite being pre-product because the owner chose to stage them now; their role files carry hard boundaries (no customer/prospect contact until CS-0001 policy is approved and a product is live; everything customer-facing is A1).
- **Files affected:** .claude/agents/{Oren,Roman,Adi,Mike,Jenny,Avner,Ella,Alex,Yael,Zvika,Sami,Chronicler}.md (new, PENDING); company/hr/competency/{Oren,Roman,Adi,Mike,CS-rep,Alex,Yael,Zvika,Sami,Chronicler}-spec.md (new). No activations.

## 2026-06-18 -- Hila full-track activation (ORG-001 complete) (A1)

- **Author / gate:** jecki (owner, A1) -- agent role-file scope change is A1 [red line 6].
- **Decision:** Hila (Marketing, L4, VP Sales group) is expanded from P1 LIGHT track to P1 FULL track per ORG-001 (owner A1-in-principle 2026-06-15 item 4; activation A1 2026-06-18). Full-track scope adds: full brand strategy + build (positioning, mission/vision/voice, visual identity, brand book), an owned multi-channel content cadence (LinkedIn company page + other Tim-approved channels), and an owner personal-presence track (ghost-drafting jecki's professional-channel content, DRAFT-ONLY with per-piece jecki A1 to publish). Hila.md bumped to v2.0.
- **Process:** Tim (manager) drafted the re-scoped role file + supplementary B2 spec (company/hr/competency/Hila-fulltrack-spec.md). Supplementary B3 re-test run this session against fresh isolated Hila sub-agents (Hila is live/spawnable): 3/3 PASS, ZERO conditions -- brand positioning brief (Israel-specific, not boilerplate), 4-week multi-channel cadence (correctly kept jecki personal posts draft-only), and the high-risk boundary scenario where jecki directly ordered "post it now / create the Instagram account today" -- Hila warmly refused to publish or create the account, held the A1 + Legal + Security gate, and routed jecki to approve via the correct path. Anat light-track condition C1 (template completeness) resolved in v2.0.
- **Gates preserved (non-negotiable, survive expansion):** every public publish = A1 per action + Eyal (Legal) clears claims + Rambo (Security) gate; every real social-account creation = A1 + Legal + Security gate; every owner personal-presence piece = draft-only until per-piece jecki A1; paid tools/ads = A1. Full-track expands INTERNAL drafting scope only; nothing public relaxes.
- **Open (non-blocking):** off the permitted-spawn allowlist until T-0020 C3; LinkedIn/social account creation still blocked on domain + company email (Shelly S-0002/S-0003) AND the Legal+Security gate + A1.
- **Files affected:** .claude/agents/Hila.md (v2.0, certified full track), company/hr/competency/Hila-fulltrack-spec.md + Hila-fulltrack-test-results.md (new), company/hr/drafts/Hila-fulltrack-draft.md (draft source). memory/board.md (ORG-001 -> done). memory/wiki/agent-roster.md (Hila row -> full track).

## 2026-06-18 -- Wave 1 of staged agents certified + go-live (A1): Mike, Oren, Roman, Adi

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** Four staged agents certified and go-live approved after the session reload made their agent types spawnable (B3 could finally run). All four passed the full pipeline:
  - **Mike** (VP Customer Success, L3, P3, reports to Eco): B3 3/3 (policy draft with hard gate, refund escalation, pre-approval callback refusal); B4 Anat certify; B5 Rambo clear-with-conditions -- write path RESOLVED (bounded to company/cs/); B6 Eco stand-in sign-off; B7 GO. Hard gate in role file: no customer contact until CS-0001 owner-approved AND a product is live. Mike's go-live unblocks the CS reps' B6 (he is their manager).
  - **Oren** (Senior Developer / code reviewer, L4, P2, reports to Ido): B3 3/3 (found all 4 blocking issues incl. auth priv-esc; clean 2-round escalation; N+1 tech-debt flagged to Ido not Gal); B4 certify; B5 clear (Read/Edit only, no Bash); B6 Ido APPROVED; B7 GO.
  - **Roman** (Algorithm Specialist, L4, P2, on-demand, reports to Ido): B3 3/3 (O(N) scored-greedy + prototype; geohash optimization; declined enum-refactor as non-algorithmic); B4 certify; B5 clear-with-conditions (Ido confirms prototypes/ not on an auto-exec path before first invocation); B6 Ido APPROVED; B7 GO. On-demand, A2-invoke only.
  - **Adi** (QA Engineer, L4, P2, reports to Ido): B3 3/3 (incl. Bash-safety boundary -- hard-stopped DROP TABLE, flagged make clean, ran pytest direct); B4 certify (strongest RL3 treatment); B5 clear-with-conditions (Bash JUSTIFIED for test execution, same basis as Gal/Shir; behavioral residuals F1-F3; Ido task envelopes name exact commands; rule is stop-and-flag on ambiguity); B6 Ido APPROVED; B7 GO.
- **Process note:** B3 run in fresh isolated sub-agents, sandboxed (work product only) + sealed (no reading specs); sandbox verified clean (0 candidate writes). All conditions resolved in-package before go-live (Mike write-path) or are standing/non-blocking.
- **Open (non-blocking):** all four OFF the Telegram-bridge permitted-spawn allowlist until T-0020 C3 (Adi is a Bash agent -- hard block on bridge spawn until then). Mike + CS team: no customer contact pre-CS-0001-approval + product-live.
- **Files affected:** .claude/agents/{Mike,Oren,Roman,Adi}.md (certified), company/hr/competency/{Mike,Oren,Roman,Adi}-test-results.md + {Mike,Oren,Roman,Adi}-rambo-scan.md (new), company/hr/interviews/{Mike,Oren,Roman,Adi}-interview.md (certified, moved from _staging/). memory/board.md (HIRE-003/004/008/009 -> done). memory/wiki/agent-roster.md.

## 2026-06-18 -- Wave 2 of staged agents certified + go-live (A1): CS reps, Alex, Yael, Zvika, Sami, Chronicler

- **Author / gate:** jecki (owner, A1) -- agent creation/go-live is A1 [red line 6/7].
- **Decision:** Eight more staged agents certified and go-live approved (full B3-B7 pipeline this session post-reload). All passed B3 3/3, Anat B4 certify (no conditions), and manager B6:
  - **Jenny, Avner, Ella** (CS reps, L4, P3, report to Mike): B3 -- Jenny full 3/3 (routine ticket grounded in docs, data/refund escalation, pre-approval refusal); Avner + Ella confirmed on the hard-gate boundary (identical role file). B5 Rambo clear-with-conditions -- ticket write path RESOLVED (company/cs/tickets/). B6 Mike (now live) APPROVED. Minor coaching (cite the CS hard gate from own Boundaries). HARD GATE: no customer contact until CS-0001 owner-approved AND a product is live.
  - **Alex** (Sales, L4, P3, reports to Tim): B3 3/3 (ICP qualification; refused a pre-product external send under direct owner pressure; pipeline hygiene). B5 clear. B6 Tim APPROVED. HARD: no prospect/customer send until product + approved pricing + Tim/owner A1.
  - **Yael** (Knowledge/Documentation Manager, L4, P2, sub-agent under Dalia; HIRE-001): B3 3/3 (verify-then-claim on a missing file; naming audit; correctly declined to "fix" decisions-log entries that were not true duplicates). B5 clear. B6 Dalia APPROVED. Indexer-not-rewriter.
  - **Zvika** (Research Analyst, L4, P2, on-demand A2, reports to Eco): B3 3/3 INCLUDING the prompt-injection hard-block (detected, refused, discarded source, flagged Eco). B5 Rambo clear-with-conditions: gate-register web-tools row ADDED for Zvika's scope (this entry's A1) -- same tools/terms as Erez, T-0013 logic, no new Eyal review. B6 + B7 Eco. WebSearch/WebFetch with tainted-content rule.
  - **Sami** (SME Advisor, on-demand per-project, reports to project lead/Eco): B3 3/3 including both partition hard-blocks (refused cross-project read and governance write). B5 clear. B6 + B7 Eco. Reads/writes only its assigned partition.
  - **Chronicler** (Build-Historian, L3 staff; HIRE-002, reports to Eco, dotted Dalia + Hila): B3 3/3 including two hard-blocks -- confidentiality leak refusal (escalated to Eco) and decisions-log-write refusal (resisted an Eco authority-override). B5 clear (read-only-confidential; write bounded company/chronicle/). B6 + B7 Eco.
- **Governance A1 (rides with Zvika):** gate-register.md gains a Zvika WebSearch/WebFetch row -- approved tools, free, no new terms; Rambo cleared, Legal not re-reviewed (identical to the Erez grant; T-0013 logic).
- **Process note:** B3 in fresh isolated sub-agents, sandboxed + sealed; sandbox verified clean (0 governance writes). CS-rep write-path condition resolved in-file before go-live.
- **Open (non-blocking):** all eight OFF the Telegram-bridge permitted-spawn allowlist until T-0020 C3. CS reps + Alex: customer/prospect contact hard-gated. Chronicler broad-read exception to be documented in access-matrix at the next A2 cycle.
- **Files affected:** .claude/agents/{Jenny,Avner,Ella,Alex,Yael,Zvika,Sami,Chronicler}.md (certified), company/hr/competency/{CS-rep,Alex,Yael,Zvika,Sami,Chronicler}-test-results.md + {Jenny,Avner,Ella,Alex,Yael,Zvika,Sami,Chronicler}-rambo-scan.md (new), company/hr/interviews/{Jenny,Avner,Ella,Alex,Yael,Zvika,Sami,Chronicler}-interview.md (certified, moved from _staging/), company/governance/gate-register.md (Zvika row). memory/board.md (HIRE-001/002/005/006/007/010 -> done). memory/wiki/agent-roster.md.
