# Access Matrix Revision Draft -- 2026-07-14
# DRAFT -- Pending Eco A2. Do NOT apply to access-matrix.md until approved.
# Prepared by: Dalia (Q&G) | Tasked by: Eco (CEO) | Date: 2026-07-14
# Gate: A2 (Eco decides; jecki notified; Dalia + Rambo reviewed)
# Sources: memory/board.md (AUD-006, AUD-011, AUD-013);
#          company/governance/access-matrix.md v1.0;
#          company/security/reports/guard-diff-consolidated-preflip-2026-07-14.md

---

## STATUS

DRAFT. access-matrix.md is UNCHANGED.
When Eco grants A2: Dalia appends to decisions-log.md.
Matrix edit: owner A1 applies changes to company/governance/access-matrix.md (Red path).
No agent edits access-matrix.md directly.

---

## CHANGE SUMMARY (7 items)

A. Oracle broad-read row -- new matrix row (AUD-006a)
B. Yossi .claude/agents/ need -- NO CHANGE (AUD-006b)
C. Runner output paths + project security-report paths -- new rows (AUD-006c)
D. Designer (Tal) marketing/ write -- GATED note added (AUD-011)
E. Dalia PATH_SCOPE additions -- new rows (F-S805 guard-diff mirror)
F. Eyal PATH_SCOPE additions -- new row + existing row update (F-S806 guard-diff mirror)
G. 11 agents PATH_SCOPE -- new rows (F-S807 guard-diff mirror)
POL-001 hyphen clarifier -- NOT INCLUDED (see end of this file)

---

## CHANGE A -- Oracle broad-read row (AUD-006a)

Source: AUD-006 (Phase 2 F-D10); guard-diff F-S804 (oracle added to ALLOWED_AGENTS;
PATH_SCOPE already in guard.py lines 116-117 but was dead code without ALLOWED_AGENTS entry).

Current state: no Oracle row in access-matrix.md. Oracle is a certified-live chronicle agent.

Proposed: ADD the following row to the Path-level ACL table.

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| company/ and memory/ (Oracle chronicle read) | Broad-read, scoped-write | Oracle (broad read of company/ and memory/ for chronicle context; same read basis as Eco) | Oracle (chronicle output paths only -- verify exact paths against Oracle.md before applying; no write to company/governance/, company/security/reports/, or .claude/agents/) | Broad read is required for Oracle to produce chronicles across company state. Write is scoped to oracle output paths per role file. Eco authorizes each chronicle task. Rambo confirms write scope on next Oracle permission scan. |

Action before applying: read Oracle.md Data/memory access section; confirm chronicle output paths; update the Notes column if they differ from above.

---

## CHANGE B -- Yossi .claude/agents/ need (AUD-006b)

Finding: NO CHANGE NEEDED.

Yossi (Training & Enablement) works from the tool-library catalog (T-0031,
company/governance/tool-library-catalog.md). His training and enablement role does not
require reading .claude/agents/ to function. The five existing exceptions --
Anat (HR certification and R&R), Rambo (permission scans), Dalia (quality audits and
tone governance), Assaf (agent fitness loop and model-matrix sync), RedTeam (adversarial
probe design) -- cover all operational and governance use cases.

No new .claude/agents/ exception is warranted for Yossi. Additionally, Yossi's guard
entry is explicitly deferred pending conditions C1-C3 (AUD-005/HR-002); adding him
to .claude/agents/ exceptions before those conditions clear would be premature.

No matrix change for this item.

---

## CHANGE C -- Runner output paths + project security-report paths (AUD-006c)

Source: AUD-006 (Phase 2 governance hygiene).

Runner output paths -- current state:
- memory/board.md and memory/log.md: in matrix (company-shared).
- reports/daily-summaries/: in matrix (Owner + CEO only).
- memory/runner-state.json: no matrix row.
- memory/agent-runs.jsonl: no matrix row.

Proposed: ADD the following rows to the Path-level ACL table.

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| memory/runner-state.json | Operational | Assaf (OE), Eco, jecki | Runner (integrations/runner/runner.py, write after each job; owner: Shir) | Per-trigger last-run health state. Written by the runner after each job (FIX-01 atomic save). Assaf reads for health reporting; Eco reads for evening summary. Single source of truth for per-trigger health (schedules.md "Last run" column is not authoritative). |
| memory/agent-runs.jsonl | Operational | Assaf (OE), Eco, Lital (CFO, financial aggregation), jecki | Runner (append per job via --output-format json; owner: Shir) | Per-run cost and token log. Assaf owns operational token/run reporting; Lital owns financial-$ aggregation and owner-dashboard finance view (AUD-010 canonical split). Append-only in practice (each job appends one record). |

Project security-report paths:
company/security/reports/ row already exists in the matrix:
"Rambo (write), jecki (A1); Gated security findings. Never shared without Eco + owner approval."
No change needed. The existing row covers all security report output.
Dalia reads company/security/reports/ for quality audits on a need-to-know basis; this is
covered by the standing "All other agents: read-only, need-to-know context" note on company/.
No additional matrix row required.

---

## CHANGE D -- Designer (Tal) marketing/ write, GATED on AUD-011 (AUD-011)

Source: AUD-011 (board, owner A1 2026-07-12: Tal owns visual design, Hila keeps
strategy/voice/content); guard-diff F-S807 (marketing/ intentionally excluded from
Designer PATH_SCOPE until AUD-011 gate clears).

Current state: marketing/ row "Who may write: Hila (assets), Tim (direction)".
Designer has no marketing/ write. AUD-011 requires: (1) fresh Rambo permission scan of
the expanded scope; (2) Dalia access-matrix A2 update. This revision is step (2) -- it
places the conditional grant in the matrix so the gate is documented and the guard edit
can follow after step (1).

Proposed: UPDATE the Notes column of the following existing rows.

marketing/ row -- ADD to Notes:
"Designer (Tal): visual design write to marketing/ is GATED on AUD-011. Activate ONLY after:
(1) Rambo completes a fresh permission scan of the expanded scope (AUD-011 scan, separate from
the guard-diff consolidated pre-flip scan); (2) this A2 revision is approved (Eco). Until both
gates clear, Tal hands marketing assets to Hila; no direct marketing/ writes. After activation:
Hila retains strategy/voice/content ownership; Tal owns visual design files (brand assets,
avatars, campaign visuals). guard.py PATH_SCOPE addition for Designer marketing/ follows as a
SEPARATE guard edit (owner A1 + Shir apply) after AUD-011 clears."

marketing/brand/ row -- ADD to Notes:
"Designer (Tal): write access GATED on AUD-011 (same gate as marketing/ parent row above)."

marketing/avatars/ row -- ADD to Notes:
"Designer (Tal): write access GATED on AUD-011 (same gate as marketing/ parent row above)."

---

## CHANGE E -- Dalia PATH_SCOPE additions (F-S805 guard-diff mirror)

Source: guard-diff F-S805 / AUD-009(2) / AUD-013(1). These paths are in Dalia's stated
governance scope (role file: policy framework ownership, lessons-learned facilitation,
quality audit log). They were missing from guard PATH_SCOPE -- false-blocks in shadow mode.

Proposed: ADD the following rows to the Path-level ACL table.

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| company/policies/ | Restricted | All agents (need-to-know policy read), Eco, Anat (HR), jecki | Dalia (policy framework ownership, DAL-001); A2 (Eco) required for any company-wide policy activation; A1 (owner) for binding policies | Policy index (policy-framework.md) and all approved policy files. Dalia owns framework structure; individual policy activation gates per constitution. Superseded policies archived here; never deleted. |
| company/post-mortems/ | Restricted | Eco, Anat (HR), Rambo, Dalia, jecki; relevant VPs for specific incidents on Eco approval | Dalia (lessons-learned post-incident reports, per /lessons-learned command) | Post-incident and post-failure reports filed by Dalia after facilitation. Dalia leads; Eco backing required to compel agent responses. Read gated to relevant parties per incident scope. |
| company/governance/quality-audit-log.md | Restricted | Eco, Rambo, Anat (HR), jecki | Dalia (each audit cycle; append entries only) | Running quality audit record. Dalia appends after each audit pass. Append-only in practice; no retroactive edits (same rule as decisions-log). |

---

## CHANGE F -- Eyal PATH_SCOPE additions (F-S806 guard-diff mirror)

Source: guard-diff F-S806 / AUD-009(3) / AUD-013(1). Eyal appends legal decisions to
decisions-log regularly (confirmed by board entries T-0039, T-0041, AUD-004). company/legal/
is the correct write home for DPA drafts, legal memos, and ToS analyses.

Proposed: ADD the following row to the Path-level ACL table.

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| company/legal/ | Restricted | Eco, Dalia (governance cross-reference), Lital (CFO, financial cross-references), jecki | Eyal (DPA drafts, legal memos, ToS analyses, PPL compliance documents) | Home for all Eyal-produced legal documents. Eyal is sole write authority. PREREQUISITE: directory does not exist on disk -- Shir or jecki creates company/legal/.gitkeep before Eyal's first write. Guard change can be deployed before the directory exists (no harm to guard). |

Proposed: UPDATE existing decisions-log.md row.
Current "Who may write (append)": "all agents logging decisions."
Update Notes to add explicitly: "Eyal (Legal) is a confirmed decisions-log appender (gate verdicts, legal confirmations). This is covered by 'all agents' but is made explicit here to confirm alignment with guard PATH_SCOPE (F-S806). Append-only rule (CLAUDE.md red line 6) applies to Eyal identically."

---

## CHANGE G -- 11 agents PATH_SCOPE (F-S807 guard-diff mirror)

Source: guard-diff F-S807 / AUD-009(4) / AUD-013(1). 11 certified-live agents with
Write/Edit tools had no PATH_SCOPE in guard.py (all their governed writes were false-blocked
in shadow mode). Paths derived from each agent's role file Data/memory access section (Rambo
verified). This revision makes those scopes explicit in the access matrix, mirroring guard.

Note on Yossi: explicitly EXCLUDED per guard-diff rationale. Conditions C1-C3 outstanding.
Note on Designer marketing/: EXCLUDED here -- covered under Change D (AUD-011 gate).
Note on MeetingPrep: read-only agent (no Write/Edit tools); ALLOWED_AGENTS membership
in guard is for spawn permission only; no path-level write entry needed in this matrix.

Proposed: ADD the following rows to the Path-level ACL table.

CS group paths (new rows):

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| company/cs/ | Restricted | Mike (VP CS), Jenny, Jack, Ella, Eco, Lital (financial fields), jecki | Mike (VP CS domain -- policy files, SOPs, cs-0001 and future CS policies) | CS group working area. Mike writes policy and SOP files; CS reps write to sub-paths below. |
| company/cs/tickets/ | Restricted | Mike, Jack, Eco, jecki | Jenny (tier-1 CS; ticket summaries only) | Customer support ticket records. Jenny writes; Mike and Jack review. PPL retention: 2 years from close, then delete/anonymize (AUD-004 / Eyal CS retention 2026-07-11). |
| company/cs/accounts/ | Restricted | Mike, Jenny, Eco, jecki | Jack (CSM + Account Manager) | Account management records. Jack writes; Mike reviews. |
| company/cs/training/ | Restricted | Mike, Jenny, Jack, Eco, jecki | Ella (Customer Trainer) | Customer training materials. Ella writes; Mike reviews. |

Sales group explicit scope notes (updates to Notes column on existing marketing/ row):
- Sally (VP Sales): read/write marketing/ (confirmed per role file and guard-diff F-S807).
  Write also: memory/board.md, memory/log.md, company/decisions/decisions-log.md.
- Alex (Sales Execution): write scoped to memory/board.md, memory/log.md,
  company/decisions/decisions-log.md only. No marketing/ write (role file and guard-diff).
  Add a note to the marketing/ row: "Alex: no write access to marketing/."

On-demand / SME agent paths (new rows):

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| company/research/ | Restricted | Eco, relevant VPs (on Eco designation), jecki | Zvika (research analyst; write when explicitly designated by Eco per task) | Research output path. Eco designates exact path per task. Directory does not exist yet -- Zvika creates on first designated task. |

Projects path notes (updates / explicit per-agent notes on existing projects/<name>/ row):
- Sami: scoped to assigned project ONLY per task envelope; hard-partition enforced by role file.
  Guard PATH_SCOPE entry "projects/" cannot enforce per-project partition at the guard level;
  behavioral enforcement is the task envelope + role file.
- Roman: scoped to projects/delivery-saas/docs/algorithms/ per role file.
- Zvika: projects/ broadly when Eco designates; confirmed by T-0043 (wrote to
  projects/ai-patient-simulator/docs/).
- Designer (Tal): scoped to projects/delivery-saas/docs/ per role file.
  marketing/ write GATED on AUD-011 (Change D above).
- MeetingPrep: no write tools; guard PATH_SCOPE belt-and-suspenders only;
  no matrix write entry needed.

---

## POL-001 HYPHEN CLARIFIER -- NOT INCLUDED IN THIS REVISION

Source: AUD-006 original batch ("POL-001 hyphen clarifier + policy-framework A2 activation").

Decision: NOT included.

Rationale:
1. The access matrix governs path-level read/write access. It is not the vehicle for
   policy content clarifications.
2. DAL-001 is DONE (POL-001 A1 granted 2026-07-09, jecki via Telegram). POL-001 is active
   at company/policies/human-communication-policy.md v0.5. Both the policy-framework A2
   and the POL-001 A1 that AUD-006 listed as pending are now complete.
3. The hyphen/em-dash rule is established in soul.md Core Block rule 5 ("ASCII in files,
   logs, agent-to-agent. No em dash, no curly/smart quote (plain hyphen or rewrite)").
   This rule is active fleet-wide and does not require an access matrix entry.
4. If the hyphen clarifier was not folded into POL-001 v0.5 before A1, the correct fix
   is a policy amendment to company/policies/human-communication-policy.md. That is
   a separate DAL task, not an access matrix change.

No matrix change for this item.

---

## APPROVAL AND PREREQUISITES

A2 authority: Eco approves this revision. jecki notified per change process.
No owner A1 required for this revision AS A WHOLE, with the following exceptions:

- company/legal/ directory: does not exist. Shir or jecki creates company/legal/.gitkeep
  BEFORE Eyal writes there. The guard change (F-S806) can be deployed before the dir exists.
- Designer marketing/ activation (Change D): requires AUD-011 Rambo scan FIRST; then Eco
  confirms activation in a follow-on decision. The gate note in this revision is the A2 step;
  actual Tal marketing/ write does not unlock until the Rambo scan clears.
- Oracle write paths (Change A): confirm against Oracle.md before applying to the live matrix.
  If Oracle.md write scope differs from the note in Change A, update before Eco A2 sign-off.

Rambo review: Rambo's consolidated guard-diff (2026-07-14) is the operative security review
for Changes E/F/G. Change A (Oracle) needs Oracle.md read for write-scope confirmation.
Change D (Designer) needs a separate fresh Rambo AUD-011 scan before activation.

Log entry: Dalia appends to company/decisions/decisions-log.md when Eco grants A2.
Entry format: date, "A2 GRANTED (Eco)", changes applied by letter (A/C/D/E/F/G), jecki notified.

---

END OF DRAFT
