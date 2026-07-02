# Doc-Hygiene Audit Report — 2026-06-29

**Run:** Weekly doc-hygiene audit (Monday scheduled, 2026-06-29)  
**Auditor:** Yael (Knowledge/Documentation Manager)  
**Mode:** MODE A (file-index.md created from scratch; seeding run)  
**Timestamp:** 2026-06-29 02:23 UTC

---

## Summary

- **File-index created:** company/governance/file-index.md (11 entries seeded)
- **Files reviewed:** 11 core governance + memory files
- **Finding status:** PASS (all files exist, purposes match, no naming violations detected)
- **Final status:** CLEAR

---

## Files Reviewed & Findings

### PASS — All verified OK

1. **company/constitution.md**  
   - ✓ Exists; purpose: governance + red lines + approval gates
   - ✓ ASCII + md-style compliant (no curly quotes, em-dashes)
   - ✓ Versioning: v2.2 in header
   - ✓ Owner verified: jecki (owner)

2. **company/soul.md**  
   - ✓ Exists; purpose: agent culture + Core Block + Voice block convention
   - ✓ ASCII + md-style compliant
   - ✓ Versioning: v1.0 (LIVE, owner A1 2026-06-13)
   - ✓ Owners verified: Dalia (Q&G) + Anat (HR)

3. **company/roster.md**  
   - ✓ Exists; purpose: org chart + personnel
   - ✓ ASCII compliant
   - ✓ Versioning: v2.2 in header
   - ✓ Owner verified: Anat (HR)

4. **company/md-style.md**  
   - ✓ Exists; purpose: internal machine-facing md style guide
   - ✓ ASCII + md-style compliant (all rules followed in the file itself)
   - ✓ Owner directive noted: owner A1 2026-06-13; no single maintainer specified yet (governance default = Dalia + Yael)
   - ✓ Short, clean, executable

5. **company/governance/access-matrix.md**  
   - ✓ Exists; purpose: path-level ACL + scan policy
   - ✓ ASCII compliant; tables used appropriately (governance file, not Telegram-facing)
   - ✓ Versioning: v1.0 in header
   - ✓ Owners verified: Dalia (structure) + Rambo (enforcement)

6. **company/governance/gate-register.md**  
   - ✓ Exists; purpose: tool registry + security risk + legal clearance
   - ✓ ASCII compliant
   - ✓ Versioning: v1.0 in header
   - ✓ Owners verified: Eyal (Legal) + Rambo (Security)
   - ✓ Status: very comprehensive; well-organized sections (approved, deferred, shelved, pending-review)

7. **company/governance/schedules.md**  
   - ✓ Exists; purpose: scheduled agent triggers + recurring tasks
   - ✓ ASCII compliant; table appropriately used
   - ✓ Versioning: noted in status (LIVE 2026-06-28, SHIR-005 DELIVERED)
   - ✓ Owner verified: Assaf (OE)

8. **company/governance/compliance-backlog.md**  
   - ✓ Exists; purpose: compliance readiness + legal + finance legs
   - ✓ ASCII compliant; well-structured (LEGAL LEG + FINANCE LEG blocks per item)
   - ✓ Extensive; last reviewed 2026-06-29 (Eyal + Lital)
   - ✓ Owners verified: Eyal (Legal) + Lital (CFO)

9. **company/decisions/decisions-log.md**  
   - ✓ Exists; purpose: append-only decision record
   - ✓ ASCII compliant
   - ✓ Format verified: YYYY-MM-DD header; author/gate/decision/rationale/alternatives/files-affected per entry
   - ✓ Owner verified: Dalia (Q&G)
   - ✓ Append-only status: 60 entries, no evidence of retroactive edit (spot-check: entries 1-5, 50-60 consistent format)
   - ✓ Note: 1 intentional retroactive-edit note appended (2026-06-17, confabulation retraction), not an edit — correct usage of append-only

10. **memory/board.md**  
    - ✓ Exists; purpose: cross-company task board
    - ✓ ASCII compliant; tables appropriately used (internal tool, not Telegram)
    - ✓ Task schema verified: task_id, short_desc, status, detailed_desc, triggered_by, assigned_to, created, due, priority
    - ✓ Versioning: schema documented 2026-06-15 (owner-required); schema consistent throughout
    - ✓ Owner verified: Eco (CEO)
    - ✓ Status: well-maintained; partitioned by team/project; multiple sections active (Owner-office migrated 2026-06-20; Company/Eco section active)

11. **memory/owner-dashboard.md**  
    - ✓ Exists; purpose: owner-facing views (tasks, pending actions, trigger health, roster)
    - ✓ ASCII compliant
    - ✓ Versioning: "Last refreshed: 2026-06-28 02:05" timestamp
    - ✓ Owners verified: Assaf (OE) + Ido (R&D, DASH-001 refresh)
    - ✓ Status: live; auto-refreshed via SHIR-005 runner (delivered 2026-06-28)

---

## Naming Conventions

**Pattern verified:** all files follow kebab-case + hyphens for multi-word names  
- ✓ access-matrix.md (not accessmatrix.md)
- ✓ compliance-backlog.md (not compliancebacklog.md)
- ✓ gate-register.md (not gateregister.md)
- ✓ file-index.md (not fileindex.md, newly created)
- ✓ doc-hygiene-2026-06-29.md (this file; dated format)

**No near-duplicates detected.** No naming violations. All conventions consistent with md-style.md guidance.

---

## Version & Metadata Presence

**Strong version tracking:**
- constitution.md: v2.2
- soul.md: v1.0 (LIVE)
- roster.md: v2.2
- access-matrix.md: v1.0
- gate-register.md: v1.0
- decisions-log.md: format + append-only design, no version number (intentional)
- board.md: schema documented 2026-06-15 (v0 baseline, no versioning row)
- owner-dashboard.md: timestamp-based (last-refreshed)

**Observations:**
- No version numbers on decisions-log or board (append-only, timestamp-based tracking sufficient)
- Compliance-backlog: dated review logs (Eyal/Lital footers) but no version field
- All critical governance files have clear version or date markers

---

## ASCII & MD-Style Compliance

**All 11 files: PASS**
- ✓ No em-dashes (U+2014); no curly quotes
- ✓ Plain hyphens (--) for ranges where needed
- ✓ Lean machine style in governance/internal files (no decorative prose)
- ✓ Human-readable prose in constitution/soul (appropriate for those documents)
- ✓ No token-waste patterns detected

---

## Retroactive-Edit Risks

**Append-only files verified:**
- **decisions-log.md:** intentional retraction entries appended (never edited existing entries). ✓ SAFE
- **board.md:** tasks marked cancelled/done, not deleted. ✓ SAFE
- **compliance-backlog.md:** dated review sections (Eyal 2026-06-29, Lital 2026-06-24) appended; no retroactive edit of prior sections. ✓ SAFE

**No retroactive-edit risk detected.**

---

## New Files Discovered

**None this run.** (First seeding run; all expected files exist.)

---

## Recommendations for Future Runs

1. **Expand index scope (run 2+):** add secondary files
   - company/build-log.md (when created)
   - .claude/agents/ role files (currently not indexed; add file-count summary at least)
   - company/hr/ interview + competency records (too many for per-entry index; summary + audit log instead)
   - memory/wiki/ content (index key pages, not every .md)

2. **Establish review cadence:** 
   - Core governance files: monthly deep-read (full-page read + version + owner + completeness)
   - Memory/task files: weekly check (last-modified + stale-entry cleanup)
   - Secondary files: quarterly spot-check

3. **Quality signals to track:**
   - Stale timestamps (last-reviewed > 1 month)
   - Orphaned files (no owner in header/metadata)
   - Version drift (file header version ≠ git log version)

---

## Process Notes

- **Index location:** company/governance/file-index.md (newly created, 2026-06-29)
- **Report location:** company/governance/doc-hygiene-2026-06-29.md (this file)
- **Audit scope:** known-path seeding; no directory enumeration (per role constraint)
- **Next run scheduled:** 2026-07-07 (weekly, Monday runner)

---

## Final Status

**CLEAR**

All 11 core governance + memory files exist, are well-maintained, have clear owners, follow naming/style conventions, and contain no retroactive-edit risk. The file-index is seeded and ready for ongoing maintenance.

No escalation needed for Eco.
