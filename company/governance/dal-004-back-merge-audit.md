# DAL-004: Role-File Override Back-Merge Audit

**Date:** 2026-06-22  
**Co-leads:** Dalia (Q&G) + Assaf (OE)  
**Scope:** Identify 8 affected role files in .claude/agents/ from merge commit 845934f where "ours" was taken, superseding parallel session edits. Characterize possible losses. Recommend back-merge procedure.  
**Status:** Findings + recommendation (no role-file edits executed -- owner A1 required).

---

## 1. The Merge Incident

**What happened:**
- Two parallel sessions edited role files concurrently (circa 2026-06-17/18).
- At merge commit 845934f, git conflict resolution took "ours" (current branch) on 8 agent role files.
- This superseded edits made in a parallel/feature branch ("theirs").
- No information about WHICH edits were lost is currently visible in this project session.

**Why this matters:**
- The parallel session may have added documentation, fixed bugs, applied owner directives, or resolved conditions.
- Taking "ours" unconditionally could have dropped material updates (e.g., red-line citations, cert-status updates, scope corrections).
- Role-file integrity is critical for agent governance (constitution red lines, permission clarity, escalation paths).

---

## 2. Identified Affected Role Files

Cannot determine the exact 8 files WITHOUT git history inspection (requires Bash/git diff against the superseded branch). However, based on the decisions log (2026-06-18 entries around roster reorg, renamings, and concurrent hiring runs), the 8 files are LIKELY among:

**Strong candidates (activities on 2026-06-17/18):**
1. `Ido.md` (VP R&D) – certified, go-live, Bash removal (A1), model-config audit
2. `Dalia.md` (Q&G) – certified, go-live, T-0012 first task assigned
3. `Noam.md` / `Perry.md` (VP Product) – renamed from Noam to Perry (2026-06-18), scope changes
4. `Lital.md` (CFO) – certified, go-live, Rambo scan, conditions resolved
5. `Assaf.md` (OE) – certified, go-live, format-discipline condition, T-0012 agents/ read grant
6. `Luci.md` (Devil's Advocate) – model fix (opus→sonnet), scope reduction, red lines added
7. `Erez.md` (Investor, on-demand) – model fix, WebFetch gate-registered, tainted-content rule
8. `Sally.md` / `Tim.md` (VP Sales) – renamed from Tim to Sally (2026-06-18), scope expansion to full track

**Moderate candidates:**
- `Gal.md`, `Shir.md` (R&D wave, some concurrent edits)
- `Hila.md` (P1 light-to-full-track expansion 2026-06-18)
- `MeetingPrep.md` (certified 2026-06-18)

---

## 3. What May Have Been Lost

**Likely categories of lost edits:**

| Category | Risk Level | Examples |
|----------|-----------|----------|
| Red-line citations (RL9/10/11) | MEDIUM | Batched addition across many files 2026-06-17; "ours" may have lacked them on some files. |
| Certification-status updates | HIGH | Role-file cert status is governance truth; "ours" may have stale "PENDING" while "theirs" had "CERTIFIED + LIVE". |
| Condition resolutions | HIGH | A1-gated conditions (role-file edits) applied by owner; taking "ours" could have dropped resolved conditions. |
| Scope changes (re-scopes, renames) | HIGH | Tim→Sally rename + Hila full-track expansion were A1 scope edits applied 2026-06-18. |
| Model-config fixes | MEDIUM | Luci/Erez opus→sonnet corrections applied; "ours" may have kept incorrect model if taken before the fix. |
| Persona/Hebrew-name metadata | LOW | Added to all 30 agents 2026-06-18; cosmetic but completeness matters for roster. |
| Documentation gaps (Identity block, KPIs, Triggers) | MEDIUM | Template completeness gaps filled in conditional go-lives; "ours" may have held older gaps. |

**Highest-risk scenario:**
- A parallel session (e.g., a hiring or batch-fix session) applied substantive updates (RL-9/10/11, cert status, conditions resolved).
- "Ours" was taken without reviewing the diffs.
- Result: live agents are running on stale/incomplete role files.

---

## 4. Audit Scope Limitations

**What this audit CANNOT do (without Bash/git):**

1. **Compare versions:** Cannot diff the current role file against the superseded git commit without running `git show <branch>:<file>` or `git diff <branch> -- <file>`.

2. **Identify which 8 files precisely:** The board task states "8 agent role files" but does not name them. Without a git log query or merge conflict record, we cannot confirm the exact 8.

3. **Verify loss magnitude:** Cannot state confidently what text was dropped, how many lines, whether it matters, without side-by-side comparison.

4. **Detect subtle gaps:** A lost red-line citation, a changed escalation path, or a model-config tweak would be visible only in a diff.

**What this audit CAN do:**

1. Scope the work: "Here are the likely files and categories of risk."
2. Define the procedure: "Here's how to safely recover any losses."
3. Flag governance impact: "Role-file integrity is critical to agent go-live; verification is necessary."

---

## 5. Recommended Back-Merge Procedure

**Step 1: Identify the 8 files precisely (Bash session, R&D or Shir)**

```bash
# Assume the merge commit is 845934f and the superseded branch was 'side-branch'
git log --oneline 845934f..side-branch -- '.claude/agents/*.md' | wc -l
# or
git diff --name-only 845934f side-branch -- '.claude/agents/' | head -20
```

Output: names of all affected role files on the superseded branch.

**Step 2: Generate diffs (Bash session)**

For each of the 8 files:

```bash
git show side-branch:.claude/agents/<Name>.md > /tmp/<Name>-theirs.md
git show HEAD:.claude/agents/<Name>.md > /tmp/<Name>-ours.md
diff -u /tmp/<Name>-theirs.md /tmp/<Name>-ours.md > /tmp/<Name>.patch
```

Review each `.patch` file to identify losses.

**Step 3: Categorize the losses**

- **Critical (role-file content that affects governance):**
  - Certification status (PENDING vs CERTIFIED)
  - Red-line citations (RL9/10/11 or others)
  - Authority statements (A1/A2/A3 changes)
  - Escalation paths
  - Required section gaps
  
- **High (role-file content that affects operations):**
  - Model-config changes (Opus→Sonnet fixes)
  - Scope changes (writes, reads, tools)
  - Condition resolutions (documented in the file)
  
- **Medium (metadata / completeness):**
  - Persona names, Hebrew names
  - Identity block version / changelog
  - Documentation gaps (triggers, KPIs)
  
- **Low (formatting, minor text):**
  - Typo fixes, whitespace, tone tweaks

**Step 4: Determine back-merge strategy**

- **Critical losses:** Must be recovered. For each critical loss, determine:
  - Was it already applied elsewhere (e.g., in a later decision-log entry or a live agent running elsewhere)?
  - If yes: document the source and close the task (no duplication).
  - If no: prepare a role-file edit (A1 gate, Eco proposes, owner approves).

- **High losses:** Review case-by-case. If the loss is a model-config or scope change already documented in decisions-log.md as an A1 decision, it's recoverable as a formal A1 edit. If it's undocumented, flag it as a process miss.

- **Medium/Low losses:** Cosmetic. Recover if easy; flag for next R&R if effort is high.

**Step 5: Execute back-merge (A1 gate)**

For each confirmed loss, file an A1 role-file edit:
1. Owner reviews the diff / loss description.
2. Owner approves the recovery (e.g., "Yes, Eco, add RL9 to Assaf.md").
3. Eco applies the change in a Claude Code session.
4. Log the edit as a decisions-log.md entry (append-only): "Back-merged <file> from 845934f override; recovered <category>; recovered from <source>."

---

## 6. Governance Checkpoints

**Before** accepting the back-merge:

1. ✓ Confirm the 8 files via git history.
2. ✓ Diff each file against the superseded branch.
3. ✓ Categorize losses (critical/high/medium/low).
4. ✓ Verify no loss was already applied (check live agent behavior + decision-log for any post-merge updates that recovered it).
5. ✓ Prepare an A1 request for each critical/high loss.

**During** the back-merge (owner A1 session):

1. Owner reviews diff summaries for the 8 files.
2. Owner approves each recovery (no blanket "merge all").
3. Eco applies the approved edits.
4. Each edit is logged in decisions-log.md.

**After** the back-merge:

1. A spot-check: Assaf (OE) or Dalia (Q&G) verifies 1-2 files to confirm the recovery was applied correctly.
2. No further diffs needed if every recovery is logged.

---

## 7. Timeline & Ownership

| Phase | Owner | Effort | Blocker |
|-------|-------|--------|---------|
| **Identify 8 files + diffs** | R&D (Ido/Shir) or Eco (if Bash-capable session) | 15 min | Bash tool |
| **Categorize losses** | Dalia (Q&G) + Assaf (OE) | 30 min | Diffs from phase 1 |
| **Propose A1 edits** | Eco | 30 min | Loss categorization from phase 2 |
| **Owner A1 review + approval** | jecki (owner) | 20 min | Eco proposals |
| **Execute back-merge** | Eco (Claude Code) | 20 min | Owner A1 |
| **Verification spot-check** | Dalia/Assaf | 10 min | Execution complete |

**Total: ~2.5 hours (mostly waiting on Bash tool availability for diffs).**

---

## 8. Open Questions for Eco / Owner

1. **Which branch was superseded?** Board says "parallel session's edits (in git history)" but does not name the branch. Was it `side-branch`, `wip/...`, or a named feature branch? (Needed to target the git diffs.)

2. **Was the merge intentional or accidental?** Did the owner or Eco review the conflict before taking "ours"? Or was it an automated merge by mistake?

3. **Any live agents currently broken?** Have any of the 8 agents exhibited role-file inconsistencies (missing red lines, stale cert status, wrong model) since 2026-06-18? If yes, which ones?

4. **Recovery priority:** Should we back-merge everything critical, or wait for the next R&R and tag candidates for future review?

---

## 9. Next Steps (DAL-004 Continuation)

1. **Dalia + Assaf:** Flag this report to Eco + owner for direction on Bash-tool access.
2. **R&D (Ido/Shir) or Eco (if Bash-capable):** Run diffs against the superseded branch. Export results to a shared file.
3. **Dalia + Assaf:** Review diffs, categorize losses, flag critical items to Eco.
4. **Eco:** Prepare A1 requests for owner review.
5. **Owner (jecki):** Review proposals, approve or reject each recovery.
6. **Eco:** Execute approved back-merges. Log in decisions-log.md.
7. **Assaf/Dalia:** Spot-check 1-2 files to confirm recovery.

**Estimated completion:** Next Eco/R&D Claude Code session (post-reload). Not urgent (board priority P2).

---

## Attachments / References

- Board task: `memory/board.md` (DAL-004)
- Merge point: commit `845934f`
- Likely affected files: `.claude/agents/` (8 files TBD)
- Superseded branch: TBD (to be identified by git log)
- Governance timeline: `company/decisions/decisions-log.md` (2026-06-17/18 entries)
- Related decisions: T-0002 (file-level locking to prevent future collisions), T-0019 (hiring process), Roster reorg + renamings (2026-06-18)

