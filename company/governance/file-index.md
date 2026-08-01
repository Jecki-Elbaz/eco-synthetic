# Eco-Synthetic: File Index -- SUPERSEDED, DO NOT USE

> **SUPERSEDED 2026-08-02. THIS IS NOT THE CANONICAL FILE INDEX.**
>
> The canonical file index is **`memory/wiki/file-index.md`**, as named by
> `company/governance/documentation-standard.md` section 10.
>
> Two competing indexes existed side by side; this is the losing one. It is kept for
> history only. Do NOT read it as current state, do NOT add rows to it, and do NOT cite
> it. Every new or changed file goes into `memory/wiki/file-index.md`.
>
> Content below this banner is frozen as of 2026-06-29 and is known to be stale.

**Owner:** Yael (Knowledge/Documentation Manager, under Dalia/Q&G)
**Purpose:** (historical) living index of every informational file -- location, purpose, owner, last-reviewed date
**Authority:** frozen; no further writes
**Last updated:** 2026-06-29 (frozen 2026-08-02)

---

## Core Governance Files

| File Path | Purpose | Owner | Last Reviewed |
|-----------|---------|-------|----------------|
| company/constitution.md | Company mission, hierarchy, red lines, approval gates, standards, compliance framework | jecki (owner) | 2026-07-27 |
| company/soul.md | Agent culture, behavioral standards, Core Block (inline in all agent role files), Voice block convention | Dalia (Q&G) + Anat (HR) | 2026-07-27 |
| company/roster.md | Organization chart, all agent names/roles/levels/phases, reporting structure | Anat (HR) | 2026-07-20 |
| company/md-style.md | Internal machine-facing markdown style guide (caveman, lean, ASCII, token-efficiency) | [no single owner specified; governance under Yael/Dalia] | 2026-07-20 |
| company/governance/access-matrix.md | Path-level ACL matrix, read/write permissions by role, scan policy | Dalia (Q&G defines structure); Rambo (Security enforces) | 2026-07-20 |
| company/governance/gate-register.md | Tool and service registry; security risk + legal terms clearance; adoption record; deferred/shelved/approved status | Eyal (Legal maintains); Rambo (Security clears) | 2026-07-20 |
| company/governance/schedules.md | Approved scheduled agent wake-ups and recurring tasks; cadence, status, approver | Assaf (Operational Excellence) | 2026-07-20 |
| company/governance/compliance-backlog.md | Compliance readiness items (registration, invoicing, privacy, ISO, email migration, Anthropic DPA); legal + finance legs | Eyal (Legal leg) + Lital (CFO, finance leg) | 2026-07-20 |
| company/decisions/decisions-log.md | Append-only decision record; all A1/A2/A3 decisions with rationale, alternatives, files affected | Dalia (Q&G) | 2026-07-06 |

---

## Company Memory & Task Files

| File Path | Purpose | Owner | Last Reviewed |
|-----------|---------|-------|----------------|
| memory/board.md | Cross-company task board; all open/in-progress/blocked/done tasks by team/project; accountability | Eco (CEO) | 2026-07-27 |
| memory/owner-dashboard.md | Owner-facing views: P1 tasks, pending owner actions, trigger health, agent roster status | Assaf (OE) / Ido (R&D, DASH-001 refresh) | 2026-07-27 |

---

## Governance & Audit Reports (Weekly/Recurring)

| File Path | Purpose | Owner | Last Reviewed |
|-----------|---------|-------|----------------|
| company/governance/quality-audit-log.md | Append-only weekly quality/tone audit findings; soul.md + voice-block compliance checks | Dalia (Q&G) | 2026-07-27 |
| company/governance/fitness-loop-2026-07-27.md | Weekly Monday agent activity + workload health scan; identifies idle/overloaded agents + runner cadence (dated run, supersedes 2026-06-29 version) | Assaf (OE) | 2026-07-27 |
| company/security/reports/permission-drift-2026-07-27.md | Weekly Monday security audit; tool permits vs gate-register, roster vs agent files, spawn-allowlist sync (dated run, supersedes 2026-06-29 version) | Rambo (Security) | 2026-07-27 |
| memory/wiki/cost-snapshots/index.md | Daily cost + token usage summaries; runner health dashboard; escalations | Assaf (OE) | 2026-07-27 |

---

## Index Metadata

**Files seeded on initial run (2026-06-29 02:23):** 11 core governance + memory files  
**Files added on incremental run (2026-06-29 04:18):** 4 governance/audit reports (new, discovered after seeding)  
**Total index entries:** 15  

**Verification status:** 
- 11 core files: PASS (verified 2026-06-29 02:23, re-verified 2026-07-06 12:30)
- 4 audit reports: PASS (verified 2026-06-29 04:18, re-verified 2026-07-06 12:30; new quality-audit-log run found 2026-07-06)

**Missing files:** none  

**Last incremental review (2026-07-06):** Yael verified all 14 indexed files (10 core + 4 audit). Key findings: 11 PASS (routine), 3 WARN (roster name gaps + voice-block clarifications), 2 FLAG (cost-snapshot degradation + roster audit blockers). Report: company/governance/doc-hygiene-2026-07-06.md. Escalation flagged for Eco (roster + cost observability).

**Incremental review (2026-07-27):** Yael verified 8 oldest entries (2 core + 6 audit/memory). Key findings: 8 PASS (all files exist, purposes accurate, ASCII-clean, naming compliant). Two dated files (fitness-loop + permission-drift) replaced 2026-06-29 versions; quality-audit-log carries run-header documenting last audit 2026-07-20 (due today). Report: company/governance/doc-hygiene-2026-07-27.md.  

**Next review focus:** 
- Monthly deep-read of core governance files (full-page read + version + owner + completeness)
- Weekly check of memory/task files (last-modified + stale-entry cleanup)
- Ongoing discovery of new audit/report files as they are generated by scheduled runners
- Expand to secondary files (build-log.md, agent role files, project-partition indexes) per prior recommendations

**Naming conventions verified:** all files follow kebab-case + hyphens pattern; no near-duplicates detected.
