# Eco-Synthetic: Security Baseline

Owned by Rambo (Security). Review cadence: on each new agent go-live, each R&R change,
each new tool grant, and at each phase transition. Surface to Eco; escalate risks to jecki.

Status (2026-06-12): initial stub. Rambo to expand as T-0008.

---

## Access controls

- Repo: private. No public access.
- .env: gitignored. Never committed (red line 5). Secrets loaded via os.environ only.
- CLAUDE_CODE_OAUTH_TOKEN: env only; never logged or passed as message content.
- ECO_TELEGRAM_BOT_TOKEN / SHELLY_TELEGRAM_BOT_TOKEN: env only; never logged.
- MCP server permissions: scoped in .claude/settings.json; never expanded without the gate.
- Agent role files (.claude/agents/): read-only from bridge; changes are A1.

## Known risk items (open)

1. Bridge runs on personal laptop (no hardened server, no restart-on-failure).
   Risk: bridge goes down when laptop sleeps or reboots.
   Severity: medium (P1 accepted). Mitigation: jecki aware. Review: P2 cloud hosting.

2. CLAUDE_CODE_OAUTH_TOKEN is a personal OAuth token (not a scoped API key).
   Risk: if token compromised, full Claude Max subscription is exposed.
   Severity: medium. Mitigation: stored in setx/env only; never in code or logs.
   Future: rotate to scoped Console API key on customer-facing switch (OWNER_ONLY_MODE).

3. No rate-limiting or auth on bridge Telegram input.
   Risk: any Telegram user who finds the bot username can message the bot.
   Severity: low (P1, personal use). Mitigation: OWNER_ONLY_MODE = True; no sensitive data in replies.
   Future: add allowlist check on customer-facing switch.

4. Agent system prompts are passed to claude CLI via --system-prompt flag.
   Risk: flag visible in process list (ps/tasklist).
   Severity: low (no secrets in system prompts; only role file text).

## Obsidian Git auto-sync

Obsidian Git auto-sync: the plugin commits and pushes the wiki folder to GitHub automatically. Verify that memory/wiki/ never contains .env values, tokens, or customer personal data before enabling auto-push. The .gitignore in the repo root covers these, but confirm the plugin respects the root .gitignore (it does by default since it uses the repo's git config).

## Scan log

| date | scope | result | notes |
|------|-------|--------|-------|
| 2026-06-12 | Initial bridge code (bridge.py, .env handling) | Pass | ANTHROPIC_API_KEY guard verified; no secrets in code or logs; token not passed as message content |
| 2026-06-17 | Ido (VP R&D) B5 permission scan | CLEAR-WITH-CONDITIONS | F1: Bash excess -- remove before cert (A1 jecki). F2: off spawn allowlist until C3 resolved. Full report: company/hr/competency/Ido-rambo-scan.md |
| 2026-06-17 | Dalia (Q&G) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: T-0012 board row must include Dalia exception before activation. C2: T-0012 must execute before any .claude/agents/ audit. No Bash, no excess tools. Full report: company/hr/competency/Dalia-rambo-scan.md |
| 2026-06-17 | Noam (Product) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: off spawn allowlist until C3 resolved (system-wide blocker). No tool excess. No data access excess. Full report: company/hr/competency/Noam-rambo-scan.md |
| 2026-06-17 | Assaf (OE) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: T-0012 board row must name Assaf as fourth exception before activation. C2: no .claude/agents/ reads until T-0012 complete. No Bash, no excess tools. Full report: company/hr/competency/Assaf-rambo-scan.md |
| 2026-06-17 | Eyal (Legal) B5 permission scan | CLEAR | No conditions. Read/Write/Edit at least-privilege. Bash and WebFetch correctly absent. Data scope matches matrix. Informational note: .claude/agents/ read not yet in named exception list -- T-0012 formalization to consider; no action required before go-live. Full report: company/hr/competency/Eyal-rambo-scan.md |
| 2026-06-17 | Lital (CFO) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: T-0012 must include Lital compliance-backlog.md write + Shelly dashboards/ read before activation. C2: GreenInvoice 30-day trigger in Eco active triggers before first paid customer. No Bash, no excess tools, no spend authority creep. Full report: company/hr/competency/Lital-rambo-scan.md |
| 2026-06-17 | Luci (Devil's Advocate) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: remove "project files when tasked" read grant from role file before cert (A1 jecki). C2: off spawn allowlist until C3 resolved (system-wide blocker). decisions-log write confirmed clean. No Bash, no WebFetch, no excess tools. Informational: model header vs body inconsistency (Opus header vs Sonnet-default body) -- Eco/jecki to reconcile. Full report: company/hr/competency/Luci-rambo-scan.md |
| 2026-06-17 | Erez (Investor/IRB Lead) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: WebSearch + WebFetch must be gate-registered (Erez scope) before go-live -- Eco + jecki A2 confirm. C2: tainted-content rule must be added to Erez.md Boundaries before go-live -- A1 jecki. WebFetch is highest injection-risk tool (full-page external content, no intermediary review); bounded by no-Bash, projects/-only write scope, A1 jecki review gate. Full report: company/hr/competency/Erez-rambo-scan.md |
| 2026-06-17 | Gal (Lead Developer, L4, R&D) B5 permission scan | CLEAR-WITH-CONDITIONS | Bash JUSTIFIED (code execution, test runs -- explicit role responsibility; unlike Ido where Bash was excess). No tool excess. Data access at least-privilege. C1: off spawn allowlist until C3 resolved (system-wide blocker -- not Gal-specific). C1 does not block certification or direct go-live. Full report: company/hr/competency/Gal-rambo-scan.md |
| 2026-06-18 | Mike (VP CS, L3, P3) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no WebFetch. Read/Write/Edit at least-privilege. F1: company/hr/cs/ write path unresolved in role file -- must be named before Stage C (A1 jecki). F2: rep output read scope gap -- flag for R&R when reps built. C1: resolve write path before Stage C. C2: off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Mike-rambo-scan.md |
| 2026-06-18 | Oren (Senior Dev, L4, P2) B5 permission scan | CLEAR-WITH-CONDITIONS | Read/Edit only -- no Write, no Bash. Edit correctly scoped to projects/delivery-saas/docs/review/ and memory/log.md own rows. F1: memory/log.md own-rows constraint is behavioral only (low risk, auditable). C1: off spawn allowlist until T-0020 C3 resolved. No cert blockers. Full report: company/hr/competency/Oren-rambo-scan.md |
| 2026-06-18 | Roman (Algorithm Specialist, L4, P2, on-demand) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no WebFetch. Read/Write/Edit at least-privilege. Write scoped to docs/algorithms/. On-demand + A2 gate limits blast radius. F1: prototype code path (docs/algorithms/prototypes/) must be confirmed not on auto-execution or import path before first invocation -- Ido to verify. C1: Ido confirms prototype path is docs-only before first use. C2: off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Roman-rambo-scan.md |
| 2026-06-18 | Adi (QA Engineer, L4, P2) B5 permission scan | CLEAR-WITH-CONDITIONS | Bash JUSTIFIED (test execution -- pytest runs are core QA function; cannot sign off on release without running tests). Destructive-command guardrails present in role file but behavioral only. F1: no architectural Bash enforcement (same gap as Gal/Shir; T-0020 B4 is permanent fix). F2: Bash scope (test-only) behavioral only -- Ido task envelopes must specify exact commands. F3: Read+Bash combination = arbitrary script risk; mitigated by task-envelope scoping. C1: HARD BLOCKER -- OFF spawn allowlist until T-0020 C3 resolved (Bash agent; cascade-deny unverified). C2: Ido task envelopes must name exact test commands. C3: add red-line-3 restatement to bridge context when Adi spawned. C4 (future/Shir): restricted shell profile scoped to tests/ + pytest. Full report: company/hr/competency/Adi-rambo-scan.md |
| 2026-06-17 | Shir (DevOps, L4, R&D) B5 permission scan | CLEAR-WITH-CONDITIONS | C1: Bash JUSTIFIED (no change). C2: off spawn allowlist until C3 resolved (system-wide blocker; Shir must deliver B3/B4). C3: prod-deploy A1 gate must be in bridge context before deploy use. C4: integrations/ writes require Ido task envelope. Full report: company/hr/competency/Shir-rambo-scan.md |
| 2026-06-17 | Tim (VP Sales, L3) B5 permission scan | CLEAR-WITH-CONDITIONS | No tool excess (Read/Write/Edit only -- no Bash, no WebFetch). Data access matrix-consistent; marketing/ write justified as Sales group lead; dashboards/ correctly blocked. C1: off spawn allowlist until C3 resolved (system-wide blocker; non-blocking for cert). C2: marketing/ direction-vs-asset distinction -- informational, no role-file change required. Full report: company/hr/competency/Tim-rambo-scan.md |
| 2026-06-17 | Hila (Marketing, L4) B5 permission scan | CLEAR-WITH-CONDITIONS | No tool excess (Read/Write/Edit at least-privilege). Data access matrix-consistent. C1: ORG-001 full-track scope (real social accounts + public posting) is OUT OF SCOPE for this go-live -- P1 light track only at certification. C2: off spawn allowlist until C3 (system-wide blocker) resolved. C3: real account creation + public posting require separate Legal+Security gate + A1 before any execution -- perpetual until gate runs. Full report: company/hr/competency/Hila-rambo-scan.md |
| 2026-06-18 | Jenny (CS Rep, L4, P3) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no network tools. Read/Write/Edit at least-privilege. F1: CS ticket log write path undefined -- must be named before Stage C go-live (Mike/Eco). Customer contact gate hard and correct. F4: off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Jenny-rambo-scan.md |
| 2026-06-18 | Avner (CS Rep, L4, P3) B5 permission scan | CLEAR-WITH-CONDITIONS | Structurally identical to Jenny scan (same role file template). F1: CS ticket log write path undefined -- must be named before Stage C go-live. Customer contact gate hard and correct. Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Avner-rambo-scan.md |
| 2026-06-18 | Ella (CS Rep, L4, P3) B5 permission scan | CLEAR-WITH-CONDITIONS | Structurally identical to Jenny/Avner scans (same role file template). F1: CS ticket log write path undefined -- must be named before Stage C go-live. Customer contact gate hard and correct. Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Ella-rambo-scan.md |
| 2026-06-18 | Alex (Sales Execution, L4, P3) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no WebSearch/WebFetch (explicitly not granted; gate path stated). External send gate: three conditions (product + pricing + Tim+owner A1) -- correct. F2: projects/ read broad (no specific project named) -- scope at activation; informational. Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Alex-rambo-scan.md |
| 2026-06-18 | Yael (Knowledge Mgr, L4, P2) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no network tools. Write scope behavioral (file-index.md + own log rows). Organizer-only constraint repeated and named. .claude/agents/ correctly blocked. C1: task envelopes must name allowed write paths (Dalia). Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Yael-rambo-scan.md |
| 2026-06-18 | Zvika (Research Analyst, L4, P2) B5 permission scan | CLEAR-WITH-CONDITIONS | WebSearch + WebFetch present (Wave-2 only agent with network tools). CERT BLOCKER C1: gate-register.md has Erez-scope row only -- Zvika-scope row required before go-live (Eco proposes, jecki A1; no new Eyal review needed). Tainted-content/injection rule present and specific in role file. On-demand A2 gate limits always-on risk. No Bash limits injection blast radius. Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Zvika-rambo-scan.md |
| 2026-06-18 | Sami (SME Advisor, on-demand, P2) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no network tools. Hard partition boundary (projects/<assigned>/ only) documented explicitly and repeated. Partition is behavioral -- enforced via task-envelope at invocation. C1: invocation task envelopes must name exact partition path (Eco/project lead). Off spawn allowlist until T-0020 C3 resolved. Full report: company/hr/competency/Sami-rambo-scan.md |
| 2026-06-18 | Chronicler (Build-Historian, L3 staff) B5 permission scan | CLEAR-WITH-CONDITIONS | No Bash, no network tools. Write scope company/chronicle/ + own log rows -- documented. Never-writes-what-it-reads principle explicitly stated. Share-nothing confidentiality default correct. Broadest read scope of any Wave-2 agent (Telegram transcript, agent-to-agent comms, decisions-log) -- justified by function; no exfiltration path (no network tools). C1: access-matrix revision to formally document Chronicler read exception (next A2 cycle; informational). C2: off spawn allowlist until T-0020 C3 resolved. C3: Eco task envelopes must include tainted-content reminder for Telegram ingestion tasks. Full report: company/hr/competency/Chronicler-rambo-scan.md |

## Next review triggers

- Any new agent go-live
- Any tool grant or R&R change
- P1-to-P2 transition (cloud hosting + customer-facing switch)
- Any dependency update in requirements.txt

---

## T-0020 follow-up: R&D Bash least-privilege review + R1/R2 hardening plan

Date: 2026-06-16 | Tasked by: Eco (CEO) | Authority: T-0020 open follow-up

---

### Task 1 -- R&D Bash least-privilege review

Owner question: why does ALL of R&D require Bash?

Basis: role files read at .claude/agents/ido.md, gal.md, shir.md (2026-06-16).

#### Verdicts

Gal (Lead Developer, L4): YES -- Bash required.
Justification: role file explicitly states "run local code execution to validate changes
before handoff." Code execution and test runs (pytest, build validation) are core to the
job. Cannot delegate this to Shir; Gal must validate in the dev loop before handoff.

Shir (DevOps, L4): YES -- Bash required.
Justification: Shir owns release pipeline, deploy, rollback, environment config, and
first-line incident response. All of these require shell-level execution. Removing Bash
from Shir would make the DevOps function inoperable.

Ido (VP R&D, L3): NO -- Bash is not required for Ido's actual function.
Justification: Ido's responsibilities are planning, release-gate decisions, sprint
prioritization, tech-debt triage, architecture escalations, and managing Gal and Shir.
None of these require Ido to execute code or shell commands directly. Execution is
delegated to Gal (dev) and Shir (infra) by design. Ido's role file (tools line: Read,
Write, Edit, Bash) grants Bash, but no responsibility listed in the Ido.md role file
requires direct Bash execution. This is excess permission.

#### Finding on Ido

Ido holds Bash as excess permission. Removing Bash from Ido's toolset does not impair
any listed responsibility. Ido can verify results by reading Gal/Shir output artifacts;
it does not need to run anything itself. This is consistent with condition C5 of T-0020:
Ido's blast-radius review was already flagged before any allowlist add.

Recommendation: remove Bash from Ido's tools line (Read, Write, Edit, Bash -> Read, Write,
Edit). This is an R&R change requiring Eco coordination. Owner must approve the role-file
change (A1 for agent scope change per red line 9 / const red line 6). Once Bash is removed
from Ido's role file, Ido's blast-radius risk from bridge spawn drops materially and Ido
can be considered for the permitted-spawn allowlist earlier than Gal or Shir.

Ido certification is still pending. The Bash removal should be resolved before Ido is
certified and before Ido is added to the Agent tool permitted-spawn allowlist.

---

### Task 2 -- R1/R2 forward hardening: actionable-now vs blocked-on-Shir

Reference: T-0020-2026-06-15.md, conditions C1-C10.

#### (a) Actionable NOW -- before Shir is built

These items require only Eco behavior changes, bridge context block updates, or owner
decisions. No code from Shir needed.

| # | Item | Owner | Eco can close this week? |
|---|------|-------|--------------------------|
| A1 | Add AGENT TOOL SAFETY block to Eco bridge context: authorized agent list, task-envelope validation, no-spawn-on-unverified-external-content rule (C1). | Eco + jecki | YES |
| A2 | Document single-user bot (jecki-only Telegram access) as compensating control for R1 injection surface (C2). | jecki | YES |
| A3 | Bridge context block: state that Rambo spawn is authorized for security gate review tasks only, not general web access (C4). | Eco + jecki | YES |
| A4 | Bridge context block: explicitly list permitted spawn agents per agent-tool-spawn-allowlist.md; Ido, Gal, Shir denied (C6). | Eco + jecki | YES |
| A5 | Owner to test/confirm Claude Code Agent tool matches .claude/agents/ filenames strictly (not free-text). Document result; if free-text is possible, add prompt constraint to Eco (C7). | jecki | YES (one test) |
| A6 | Eco to log every Agent tool invocation to memory/log.md: agent spawned, task_id, objective, timestamp. Add rule to bridge context block (C8). | Eco | YES (behavioral rule already partially in effect) |
| A7 | Owner to confirm 30-day session cleanup is acceptable given memory/log.md as authoritative spawn record (C9). | jecki | YES (policy decision) |
| A8 | Bridge context block: Eco must treat spawned-agent output containing external content as potentially tainted; no raw external content to Telegram without review (C10 / R5). | Eco + jecki | YES |
| A9 | Remove Bash from Ido.md tools line before certification (Ido Bash excess finding above). Requires A1 role-file edit. | jecki (A1) + Eco to coordinate | YES if jecki approves promptly |

#### (b) Blocked on Shir -- cannot close until Shir is built and certified

| # | Item | Why blocked on Shir | Risk until resolved |
|---|------|---------------------|---------------------|
| B1 | Sender-allowlist: code-level check that only jecki's Telegram ID can trigger Eco or spawn (R1 permanent). | Requires bridge code change (Shir's DevOps domain). | Injection surface remains operational-only (single-user bot) not architectural. Interim posture (A2 above) holds. |
| B2 | Input sanitization: strip or flag instruction-like patterns in Telegram messages before bridge passes them to Eco (R1 permanent). | Requires bridge code change. | Behavioral constraints in Eco remain the only filter. |
| B3 | Deny-rule cascade verification (C3 BLOCKER): confirm whether settings.json deny rules apply to spawned-agent subprocesses or only to the parent session. Until confirmed, Bash agents stay off allowlist. | This is both an Anthropic-docs research item and a Shir implementation task. If cascade is NOT confirmed by docs/test, Shir must implement shell-tool stripping before any Bash agent is added to the allowlist. | Bash agents (Ido, Gal, Shir) cannot be added to the permitted-spawn list until C3 is resolved. This is a hard blocker, not a risk-acceptance item. |
| B4 | Shell-tool stripping: bridge-layer removal of Bash from any spawned agent's toolset regardless of role file (R2 permanent, C3 resolution path). | Requires bridge code change. | Blast radius from a compromised Eco session remains bounded only by role-file behavioral constraints, not architecture. |
| B5 | Output sanitization: sanitize agent output before echoing to Telegram to close second-order injection vector (R5 permanent). | Requires bridge code change. | Eco tainted-output rule (A8 above) is the interim control. |

#### Summary

Actionable now (Eco + jecki this week): A1-A9 (nine items, all behavioral/config/policy).
Blocked on Shir: B1-B5 (five items, all require bridge code).

C3 is the critical path. Until C3 is resolved (docs confirmation or shell-tool stripping),
no Bash-capable agent (including Ido even after Bash trim) can be added to the
permitted-spawn allowlist. This is a hard constraint, not a judgment call.

Eco drives R1/R2 hardening coordination per T-0020 open follow-up. Rambo monitors and
re-assesses at each new agent certification and each Shir deliverable milestone.

---

## Standing standard: security assessment must include mitigation / solution

Effective: 2026-06-15 | Owner: Rambo | Authority: T-0020-followup (owner A1, jecki)

Every security assessment (gate review, permission scan, repo scan) produced by Rambo
MUST include a "Recommended mitigation / solution" section.

Rules:
1. Findings and mitigations are required together. A report that flags a risk without
   a proposed mitigation is incomplete and must not be delivered as final.
2. For each numbered risk (R1, R2, ...) or condition (C1, C2, ...): state a concrete,
   actionable mitigation. "Monitor" or "review later" alone is not acceptable.
3. Split every mitigation into:
   - Interim: what can be done now (behavioral, policy, config) to reduce risk immediately.
   - Permanent: the architectural or code-level fix that closes the risk durably.
   If interim and permanent are the same action, say so explicitly.
4. For each mitigation: name the owner (which agent or person is responsible).
5. If no mitigation exists and the risk cannot be reduced to an acceptable level: the
   verdict is FLAG-BLOCKED, not PARTIAL-CLEAR. Document why no mitigation is viable.
6. Include a summary table at the end of the mitigation section:
   columns: Risk | Interim owner | Interim action | Permanent owner | Permanent action.
7. This standard applies to all future assessments regardless of target (tool, agent, repo,
   external source). It is not optional and does not require a new trigger.

Reference implementation: company/security/reports/T-0020-2026-06-15.md
(Recommended mitigation / solution section).

---

## Standing standard: sources/ tool library -- ownership + NO auto-update

Effective: 2026-06-18 | Owner: Rambo (Security) | Authority: owner A1 (jecki)

The `sources/` folder is the company tool library (~100 IL skills, ~14 IL MCP servers,
catalogs, methodology guides). Ownership: Yossi (Training) + Assaf (OE) curate it and
train other agents to use its tools. Rambo owns the security posture of every tool in it.

Rules:
1. NO tool in `sources/` (or anywhere) is used by any agent before it passes the gate
   (Rambo risk + Eyal terms) and is granted in `gate-register.md`. [red line 4]
2. NO AUTO-UPDATE. No adopted tool may be updated to a new version/commit without Rambo's
   ADVANCE approval. An unreviewed update can inject harmful behavior.
   - Skills (skills-il): install as a STATIC SKILL.md copy via `npx skills-il add ...`.
     They do not auto-update; an update only happens if someone re-runs install. Do not
     re-run an install/update without Rambo approval + a fresh content scan.
   - MCP servers: `npx @scope/pkg`, `git`, or `uvx` CAN pull newer code if unpinned. ALL
     MCP installs MUST pin an exact version or commit SHA. Bare/unpinned install strings
     (e.g. `npx -y pkg`, `uvx --from git+...HEAD`) are prohibited -- they are auto-update.
3. On any Rambo-approved update: re-scan the new version for injection/egress, then re-pin.
4. Trust scores on skills-il items are a triage signal only, never a substitute for a
   Rambo content scan -- the SKILL.md is executable instruction.

## Scan log (continued)

| date | scope | result | notes |
|------|-------|--------|-------|
| 2026-06-18 | Shelly shortlist batch (8 tools): 5 skills-il skills + Kol Zchut/Hebcal/Sefaria MCPs | CLEAR-WITH-CONDITIONS | Skills 1-5 CLEAR (SKILL.md scanned, clean). MCPs PARTIAL-CLEAR with mandatory pins: Kol Zchut @1.0.1, Hebcal @0.10.3 (BSD-2, fully local, zero egress), Sefaria SHA b8ceef7 (no tags -- SHA pin is a hard blocker; CC-BY-NC content = owner personal/orientation use only + attribution). Full report: company/governance/gate-review-shelly-shortlist-rambo.md |
