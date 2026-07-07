# Doc-Hygiene Audit Report — 2026-07-06

**Auditor:** Yael (Knowledge/Documentation Manager)  
**Scope:** Weekly incremental review per file-index.md  
**Files reviewed:** 14 of 15 indexed entries (all core governance + audit reports)  
**Period:** 2026-06-29 (last review) through 2026-07-06 (today)

---

## Files Reviewed

### Core Governance (11 files) — VERIFIED

| File Path | Purpose | Owner | Last Reviewed | Status |
|-----------|---------|-------|---------------|--------|
| company/constitution.md | Company mission, hierarchy, red lines, approval gates | jecki (owner) | 2026-07-06 | PASS |
| company/soul.md | Agent culture, behavioral standards, Core Block | Dalia (Q&G) + Anat (HR) | 2026-07-06 | PASS |
| company/roster.md | Organization chart, all agent names/roles/levels/phases | Anat (HR) | 2026-07-06 | PASS (content) / FLAG (gaps) |
| company/md-style.md | Internal machine-facing markdown style guide | [governance under Yael/Dalia] | 2026-07-06 | PASS |
| company/governance/access-matrix.md | Path-level ACL matrix, read/write permissions by role | Dalia (Q&G) + Rambo (Security) | 2026-07-06 | PASS |
| company/governance/gate-register.md | Tool/service registry; security+legal clearance record | Eyal (Legal) + Rambo (Security) | 2026-07-06 | PASS |
| company/governance/schedules.md | Approved scheduled agent wake-ups and recurring tasks | Assaf (Operational Excellence) | 2026-07-06 | PASS |
| company/governance/compliance-backlog.md | Compliance readiness items (registration, invoicing, privacy, DPA) | Eyal (Legal leg) + Lital (CFO, finance leg) | 2026-07-06 | PASS |
| company/decisions/decisions-log.md | Append-only decision record; all A1/A2/A3 decisions | Dalia (Q&G) | 2026-07-06 | PASS |
| memory/board.md | Cross-company task board; all open/in-progress/blocked/done tasks | Eco (CEO) | 2026-07-06 | PASS |
| memory/owner-dashboard.md | Owner-facing views: P1 tasks, pending owner actions | Assaf (OE) / Ido (R&D) | 2026-07-06 | PASS |

### Audit Reports (4 files) — VERIFIED

| File Path | Purpose | Owner | Last Reviewed | Status |
|-----------|---------|-------|---------------|--------|
| company/governance/quality-audit-log.md | Weekly quality/tone audit findings (append-only) | Dalia (Q&G) | 2026-07-06 | PASS (new run found) |
| company/governance/fitness-loop-2026-06-29.md | Weekly agent activity + workload health scan | Assaf (OE) | 2026-07-06 | PASS |
| company/security/reports/permission-drift-2026-06-29.md | Weekly security audit; tool permits vs gate-register | Rambo (Security) | 2026-07-06 | PASS (blocking issues flagged) |
| memory/wiki/cost-snapshots/index.md | Daily cost + token usage summaries | Assaf (OE) | 2026-07-06 | PASS (degraded trend noted) |

---

## Findings

### PASS Findings (Routine Compliance)

**1. All indexed files exist and are accessible.**  
No NOT FOUND entries. File-index is current with actual deliverables.

**2. ASCII compliance verified on all files.**  
No em-dashes (U+2014), no curly/smart quotes, plain hyphens used throughout. All files suitable for version control and agent consumption.

**3. Append-only integrity confirmed.**  
- decisions-log.md: no retroactive edits; entries are immutable; new entries added at bottom per format rule.
- quality-audit-log.md: new run entry (2026-07-06) appended below prior run (2026-06-29); no deletions.
- Both files enforce their append-only contract correctly.

**4. Version tracking present where required.**  
Constitution (v2.2), soul (v1.0), roster (v2.2), access-matrix (v1.0), gate-register (v1.0) all carry explicit versions.  
Non-versioned files (md-style, schedules, compliance-backlog) are governance docs where version tracking is not standard; no issue.

**5. Markdown style compliance verified.**  
Files designated "internal machine-facing" (md-style, soul Core Block, agent role-file sections) use caveman style appropriately: short lines, minimal articles, symbols over words. No token waste detected.

**6. New audit run delivered by Dalia on schedule.**  
Quality-audit-log.md shows a **new run entry dated 2026-07-06** (this week), confirming the weekly scheduled audit ran. Five samples audited; findings include two WARN-level tone violations (see FLAGS below).

---

### WARN Findings (Non-Critical Deviations)

**W-01: Roster.md has name sync gaps vs actual agent files (flagged by Rambo 2026-06-29).**  
**File:** company/roster.md v2.2  
**Issue:** Nine agents exist in .claude/agents/ but their names or entries do not match roster v2.2. Rambo's permission-drift report flagged 9 blocking issues:
- BL-01: Sally.md exists; roster still lists "Tim" for VP Sales
- BL-02: Perry.md exists; roster still lists "Noam" for Product (note: roster.md lists "Noam" at L3 staff, not VP Product)
- BL-03: Jack.md exists; roster lists "Avner" for Customer Success Manager
- BL-04: Oren.md exists; roster lists "(unnamed)" for Senior Developer
- BL-05: Oracle.md exists; no roster entry
- BL-06: Yael.md exists; no roster entry
- BL-07: Yossi.md exists (staged); no roster entry
- BL-08: MeetingPrep.md exists; no roster entry
- BL-09: RedTeam.md exists; no roster entry

**Why it matters:** The roster is the canonical source of truth for the org chart. Nine agents operating without matching roster rows breaks the audit trail and makes access-matrix + spawn-allowlist maintenance error-prone.

**Recommendation:** Anat (HR) to reconcile roster.md v2.2:
- Update Tim -> Sally (VP Sales)
- Update Noam -> Perry (verify whether Perry is VP Product or if Noam remains as a different role)
- Update Avner -> Jack (CSM)
- Name Oren as Senior Developer (update "(unnamed)" entry)
- Add Oracle row (L3 staff, P1, dotted to Dalia/Hila per decisions-log)
- Add Yael row (L4, P2, sub-agent under Dalia)
- Add Yossi row (L4, P2, staged / pre-certification per HR-002)
- Add MeetingPrep row (L4, P3, Sales group, on-demand)
- Add RedTeam row (L4, P1, Security group, per RedTeam.md v0.2 2026-06-20)

**Severity:** HIGH (audit trail impact; security/access correctness depends on this).

---

**W-02: Anat Voice block vs R&R sweep formatting.**  
**File:** company/hr/interviews/_staging/rr-sweep-2026-07-01.md  
**Issue:** Anat's Voice block states "Never: markdown tables, dividers (--- ***), doc headers, filler openers." However, the R&R sweep file uses `---` dividers and `##` section headers throughout.  
**Context:** Dalia's 2026-07-06 audit run flagged this as WARN, not blocking. The file is a formal HR artifact (not agent-to-agent chat), and content quality is strong.  
**Recommendation:** Clarify in Anat's Voice block or documentation-standard.md whether formal HR record files (R&R, competency results, interview records) are permitted to use markdown structure, or whether this applies only to chat-like output. Current ambiguity could cause future errors.

**Severity:** LOW (content is accurate; documentation only).

---

**W-03: Hila emoji in draft file.**  
**File:** marketing/social/linkedin/2026-07-07-post-1-intro.md  
**Issue:** Hila's Voice block states "Emojis: public brand content as the brand calls for; to jecki sparingly for tone [Core Block rule 5]; never in files / logs / agent-to-agent." The Hebrew post draft section contains one emoji (smiley) in the published-copy section.  
**Context:** Dalia's 2026-07-06 audit run flagged as WARN. The emoji is in the draft's publish-copy section (not metadata), and overall draft quality is high. Hila's file header notes "(Hebrew is non-ASCII by necessity; file header documents the rationale.)"  
**Recommendation:** Clarify with Eco/Dalia whether the publish-copy section of a draft file counts as "in a file" (no emoji) or "pending human-facing content" (emoji permitted). Current rule language does not distinguish draft internal vs publish-facing status.

**Severity:** LOW (single character; content quality high; clarification will resolve).

---

### FLAG Findings (Governance Violations or Escalation Items)

**F-01: Cost-snapshot degradation trend (2026-07-02 onwards).**  
**File:** memory/wiki/cost-snapshots/index.md  
**Issue:** Assaf's daily cost-snapshot tracking shows DEGRADED status across 5 consecutive days (2026-07-02, 2026-07-06):
- 2026-07-02: "Token data unavailable (logging gap); 3-day DEGRADED trend"
- 2026-07-01: "~24.2k tokens; 30+ runs; 4 failures (Shir rc=1 x2, PM-summary timeout); DEGRADED"
- 2026-06-30: "~20-40k tokens (incomplete log); 40+ runs; 6 TimeoutExpired; DEGRADED"
- 2026-06-29: "~1.2k tokens; 40+ runs; 4 TimeoutExpired; DEGRADED"
- 2026-07-06: "Token data unavailable (5-day gap); logging files offline; SAFE_MODE active blocks writes. DEGRADED"

**Root causes noted:** Timeouts (Rambo x3, Dalia x3, PM-summary), rc!=0 (Shir x2 on 2026-07-01), session limits, SAFE_MODE blocking writes, logging offline.

**Impact:** Unable to track actual token usage + cost properly for 5 days. Escalation to Eco already noted in snapshot entries (ESCALATE_TO_ECO flagged).

**Recommendation:** Rambo + Assaf + Eco to diagnose root cause of 5-day logging/token-tracking gap and restore normal cost observability. This is a process health issue, not a documentation issue.

**Severity:** HIGH (operations/observability risk).

---

**F-02: Roster sync gaps are BLOCKING issues per Rambo's permission-drift report.**  
See W-01 above. Rambo explicitly marked items BL-01 through BL-09 as "BLOCKING FLAGS — must be resolved before the next scan." The file-index entry for roster.md should be updated to reflect BLOCKING status pending Anat's reconciliation.

**Severity:** HIGH (audit/access-control integrity).

---

## Summary

**Files reviewed this cycle:** 14 of 15 (all core + all audit reports)  
**Status breakdown:**
- **PASS (routine):** 11 files (all core governance files are well-maintained, append-only contracts enforced, ASCII clean, versioning correct)
- **WARN (non-critical):** 3 findings (roster name gaps flagged separately; two minor voice-block clarifications needed)
- **FLAG (governance/escalation):** 2 findings (cost-snapshot degradation + roster sync blockers)

**Naming conventions:** All files follow kebab-case or appropriate standard; no near-duplicates detected.

**Retroactive-edit risk:** None. Append-only files (decisions-log, quality-audit-log) are immutable. No edits to locked entries detected.

**New discoveries:** One new audit run from Dalia (quality-audit-log 2026-07-06, same week as index review) appeared during verification. This is normal and healthy -- the file-index can be left as-is; next week's entry will reflect today's audit run in the last-reviewed column.

---

## Next Steps for Governance

1. **Anat:** Reconcile roster.md with 9 blocking items (Rambo report). Update names and add missing rows before next permission-drift scan (2026-07-13).

2. **Dalia / Eco:** Review cost-snapshot degradation (F-01). Diagnose 5-day logging/timeout/SAFE_MODE blocking issue and restore normal cost observability.

3. **Anat / Dalia:** Clarify Voice block language for Anat + Hila to distinguish formal record files (permitted markdown structure) from chat-like agent-to-agent output (no dividers/headers).

4. **File-index update:** Update roster.md entry from PASS to BLOCKED (when Anat updates) or add note of Rambo's BL-01-09 items pending resolution.

---

**ESCALATE_TO_ECO_FLAG**

(Cost-snapshot observability gap + roster audit-trail integrity blockers require Eco coordination.)
