# Task ID Scheme -- Proposal (DRAFT)

Status: MIGRATED 2026-08-02 (Dalia A2 approval; Yael PARTIAL-APPROVE with the Roman gap fixed
pre-approval; migration executed and verified same day -- see execution log in section 6).
SCOPE-TEAM-FLAG-desc-NNN is the live standard for all board rows.
Raised by: jecki (owner), 2026-08-02. Drafted by: Claude (interactive session), 2026-08-02.
Intended final owner: Yael (Knowledge/Documentation Manager, naming conventions) under Dalia (Q&G),
per company/governance/documentation-standard.md. Adoption requires A2 (Dalia) once vocabulary is
settled, since it changes a company-wide convention.

---

## 1. Why change

Current format is `PREFIX-NNNN`, e.g. `T-0046`, `APS-027`, `AUD-004`. Verified against
memory/board.md, gate-register.md, and compliance-backlog.md on 2026-08-02:

- Prefix tells you almost nothing at a glance -- `T-` covers most cross-cutting work with no
  scope signal; `AUD-`, `SHIR-`, `HIL-`, `DAL-`, `ORC-` mix "where the row came from" (an audit)
  with "who owns it" (an agent) inconsistently.
- No internal/external signal at all. Nothing distinguishes an R&D task that never leaves the
  building from one that produces a customer-facing deliverable, even though this project gates
  customer contact hard (CS-0001, Alex's hard boundary, APS customer-facing work).
- Serials are assigned by hand per prefix with no collision check beyond "remember to grep first."
  This already caused a real incident: `T-0046` was assigned to two different tasks by two
  parallel sessions on 2026-07-27; both entries reached the append-only decisions-log, so the
  collision can never be corrected (memory/board.md intake-checklist note, added 2026-08-02).
- Digit padding is inconsistent across prefixes (`T-0001` is 4-digit, `AUD-001` and `APS-001`
  are 3-digit, `ITEM-6` is unpadded) -- purely cosmetic but makes sorting and scanning unreliable.
- Four unrelated ID namespaces already exist and look similar at a glance: task-board IDs,
  gate-register IDs (`GR-009`), compliance-backlog IDs (`ITEM-6`), and per-document condition
  codes (`C-E1`, `F-D22`, `M1`-`M6`). This proposal covers the task board only; see open
  question 4.

## 2. Proposed format

    SCOPE-TEAM-SCOPE_FLAG-short-description-NNN

Example shapes (final vocabulary TBD in section 3):

- `RD-OPS-INT-git-commits-001` -- internal DevOps task, owned by R&D/Shir's team.
- `MNG-CEO-INT-internal-audit-001` -- company-wide task, owned by Eco.
- `APS-DEV-EXT-customer-demo-001` -- APS-project task, dev-discipline, customer-facing.

Segments:

1. **SCOPE** -- the primary lens: either a company function (`RD`, `MRKT`, ...) or a named
   project (`APS`). Fixed vocabulary, no free text -- see section 3.
2. **TEAM** -- RESOLVED 2026-08-02: a single discipline vocabulary (`DEV`, `QA`, `UX`, `OPS`,
   `REVIEW`, ...) reused across every SCOPE -- never a repeat of the SCOPE's own function name
   (so `APS-DEV`, not `APS-RD`). Not an agent's given name (agents rotate; the discipline
   doesn't), except the deliberate MNG-advisory exception in 3a-i. Fixed vocabulary, see 3b.
3. **SCOPE_FLAG** -- `INT` or `EXT` only. `EXT` = the task's output reaches outside the company
   (a customer, a prospect, the public). This is new versus the current scheme and is the
   single biggest governance win: `grep "EXT-" memory/board.md` surfaces every row that should
   be checked against CS-0001 / A1 customer-contact gates without reading each description.
4. **short-description** -- 2-3 words, kebab-case, no spaces (spaces inside a pipe-delimited
   table cell are fine, but kebab-case keeps IDs grep- and sort-friendly and matches the
   existing file-naming convention in documentation-standard.md).
5. **NNN** -- 3-digit serial, sequential per SCOPE-TEAM bucket (not global). Grep the bucket for
   the highest existing serial before writing a new one -- same rule the board's INTAKE
   checklist already enforces, extended to the new bucket key.

## 3. Vocabulary -- DRAFT, ITERATE HERE

### 3a. SCOPE (function or project)

| Code | Meaning | Notes |
|------|---------|-------|
| MNG | Company-wide / CEO orchestration | Eco's cross-cutting, cross-VP work |
| RD | R&D (engineering, not tied to one product) | |
| PRD | Product | Perry, Designer |
| MRKT | Marketing | per owner instruction: function code, not agent name (Hila) |
| SALES | Sales | Sally, Alex |
| CS | Customer Success | Mike, Jenny, Jack, Ella |
| SEC | Security | Rambo, RedTeam |
| LGL | Legal | Eyal |
| FIN | Finance | Lital |
| HR | Agent-Ops / HR | Anat, Yossi's certification/onboarding leg |
| OE | Operational Excellence | RESOLVED 2026-08-02 (owner): Assaf + Yossi's OE leg -- token/cost monitoring, tool/skill discovery, agent fitness loop, model-matrix maintenance. Kept distinct from HR (lifecycle/certification) and QG (tone/quality). |
| QG | Quality & Governance | Dalia, Yael |
| HIST | Build-history | RESOLVED 2026-08-02 (owner): dedicated code for Oracle. Not folded into MNG or QG -- company-wide record-keeping is its own thing. |
| APS | AI Patient Simulator project | separate product from DSAAS -- see below |
| DSAAS | delivery-saas: delivery management software for Israeli small businesses | projects/delivery-saas/, Phase P1, R&D/Ido; per README, no build work started as of 2026-06-12 |

Resolved items:
- APS and delivery-saas are CONFIRMED as two separate products (verified against
  projects/delivery-saas/README.md, 2026-08-02), not two names for one thing. APS has no project
  folder yet on disk -- only delivery-saas does. Both need a live SCOPE code; no reconciliation
  needed.
- MNG vs QG boundary -- RESOLVED 2026-08-02, by evidence, not new judgment: per
  memory/wiki/file-index.md, `company/decisions/decisions-log.md` is already Dalia (Q&G)-owned
  on record. So decisions-log stewardship, tone audits, access-matrix structure, and quality
  audits are `QG`. `MNG` is reserved for company-wide work with no specific functional owner --
  in practice, Eco's own cross-VP orchestration.

### 3a-i. Advisory / on-demand agents -- special case (RESOLVED 2026-08-02, owner)

Luci (devil's advocate), Erez (investor), Zvika (research analyst), Sami (per-project SME),
MeetingPrep, and similarly-shaped on-demand advisors do NOT inherit the scope of whatever
they're advising on. Instead: **always SCOPE = `MNG`, TEAM = the agent's own name.**

This is a deliberate exception to the "TEAM is a role code, not an agent name" rule in section 2
-- these roles are each individually-defined on-demand functions rather than members of a larger
team, so there's no team code to fall back on.

Example: Erez running an APS viability analysis -> `MNG-EREZ-INT-aps-viability-001`, not
`APS-...`.

**Recorded tradeoff:** this means `grep "^APS-"` (or `DSAAS-`, etc.) on the board will NOT catch
advisory work about that project -- it'll be filed under `MNG-EREZ-`, `MNG-ZVIKA-`, etc. instead.
If project-scoped reporting ever needs to include advisory input, that requires either a
secondary tag or a manual cross-reference; not solved by this scheme as specified. Flagging so
it's a known, accepted limitation rather than a surprise later.

Draft TEAM codes for this case: `EREZ`, `LUCI`, `ZVIKA`, `SAMI`, `MTGPREP`, `ROMAN` (Oracle is
excluded from this pattern -- it has its own SCOPE, `HIST`, per above, since build-history isn't
really "advisory"). Roman (algorithm specialist, on-demand) added 2026-08-02 per Yael's review --
was covered by intent under "similarly-shaped on-demand advisors" but missing from the explicit
example list; any future on-demand advisory role follows the same MNG-<agent-name> pattern.

### 3b. TEAM -- RESOLVED 2026-08-02 (owner): one shared discipline vocabulary, reused across every SCOPE

Answers the open item that was here: TEAM is never a restatement of SCOPE's function
(`APS-RD-...`) -- it's always the discipline doing the work (`APS-DEV-...`), and the same
discipline code is reused everywhere that discipline shows up.

| Code | Who it maps to today | Used within |
|------|----------------------|-------------|
| VP | VP-level task | RD (Ido), PRD (Perry), SALES (Sally), CS (Mike) |
| CEO | Eco's own direct work | MNG |
| DEV | Build/feature work | Gal, Noa -- RD, APS, DSAAS |
| REVIEW | Independent code review / quality gate | Oren -- RD, APS, DSAAS |
| OPS | DevOps / infra | Shir -- RD, APS, DSAAS |
| QA | Testing | Adi -- RD, APS, DSAAS |
| ALGO | Algorithm design/optimization (on-demand) | Roman -- RD, APS, DSAAS |
| UX | UX/UI design | Designer (Tal) -- PRD, APS, DSAAS |
| EXEC | Pipeline / outreach execution | Alex -- SALES |
| SUPPORT | Tier-1 customer support | Jenny -- CS |
| CSM | Account management | Jack -- CS |
| TRAIN | Training / education | Ella (customer-facing) -- CS; Yossi (agent-facing) -- OE. Same code, disambiguated by SCOPE. |
| RT | Adversarial security testing | RedTeam -- SEC |
| DOC | Documentation / naming | Yael -- QG |
| CORE | The scope's one/main discipline, no further breakdown needed yet | Eyal -- LGL; Lital -- FIN; Anat -- HR; Oracle -- HIST; Rambo -- SEC (his own core review/scan work, distinct from RedTeam's RT); Hila -- MRKT; Dalia -- QG (her own tone/governance work, distinct from Yael's DOC) |
| (more TBD) | Add as needed -- but only via this registry, not ad hoc, to avoid repeating the prefix-drift problem in section 1. Governance: closed registry via Yael (section 4, item 6). |

Note: the MNG-advisory exception (3a-i) does NOT use this table -- advisory/on-demand agents
(Erez, Luci, Zvika, Sami, MeetingPrep) use their own agent name as TEAM instead, by design.

### 3c. SCOPE_FLAG

| Value | Meaning |
|-------|---------|
| INT | Output stays inside the company. Default. |
| EXT | Output reaches a customer, prospect, or the public -- triggers CS-0001 / A1 customer-contact review. |

RESOLVED 2026-08-02 (owner): "actual reach" rule locked in. EXT means an agent's output actually
leaves the building (reaches a customer, prospect, or the public) -- not that the topic merely
mentions customers. So writing the CS-0001 policy itself is INT; sending anything to a customer
under that policy is EXT. Applies as the general rule, not just to CS-0001.

## 4. Open questions for the owner

1. ~~APS vs delivery-saas~~ RESOLVED 2026-08-02: confirmed two separate products (see 3a).
   Remaining decision: what SCOPE code delivery-saas gets -- draft uses `DSAAS`, confirm or
   propose alternative.
2. ~~OE scope~~ RESOLVED 2026-08-02: added as its own SCOPE code (see 3a).
3. ~~Oracle scope~~ RESOLVED 2026-08-02: added as its own SCOPE code, `HIST` (see 3a).
4. ~~Advisory/on-demand agent scoping~~ RESOLVED 2026-08-02: always `MNG-<agent-name>`, not the
   subject's scope (see 3a-i). Tradeoff recorded there.
5. ~~INT/EXT judgment calls~~ RESOLVED 2026-08-02: "actual reach" rule locked in as the general
   rule (see 3c).
6. ~~TEAM/SCOPE vocabulary control~~ RESOLVED 2026-08-02: Yael holds both as a closed registry,
   same model as her existing naming-convention ownership under Dalia. New SCOPE or TEAM codes
   go through her, not introduced ad hoc by any agent.
7. ~~Non-task-board namespaces~~ RESOLVED 2026-08-02: left separate. Gate-register (`GR-`),
   compliance-backlog (`ITEM-`), and per-document condition codes (`C-E1`, `F-D22`) are an
   explicit non-goal of this proposal. Revisit as its own follow-up only if this scheme proves
   out on the task board first.
8. ~~Migration~~ RESOLVED 2026-08-02: rename open/in-progress/blocked rows only; done/cancelled
   rows keep their existing ID permanently. Full plan in section 7.

## 5. Worked examples (real board rows, converted for discussion only -- not applied)

| Current ID | Row | Proposed |
|------------|-----|----------|
| T-0009 | Monthly on-demand agent review | MNG-CEO-INT-agent-review-001 |
| AUD-004 | Shelly/A1 DPA scope clarification (Dalia's governance work) | QG-CORE-INT-a1-dpa-scope-004 |
| SEC-0001 | Guard enforcement (File-and-Flush) | SEC-CORE-INT-guard-enforce-001 |
| CS-0001 | Customer comms policy (Mike/VP CS owns per role file) | CS-VP-INT-comms-policy-001 (per draft INT position, 3c) |
| (hypothetical) | APS customer demo | APS-DEV-EXT-customer-demo-001 |
| (hypothetical) | Erez viability analysis for delivery-saas | MNG-EREZ-INT-dsaas-viability-001 (advisory exception, 3a-i) |

## 6. Migration plan (RESOLVED 2026-08-02, owner: rename open rows only)

- **Scope**: only memory/board.md rows currently `open`, `in-progress`, or `blocked` get
  renamed to the new `SCOPE-TEAM-FLAG-desc-NNN` format.
- **Frozen**: rows already `done` or `cancelled` keep their existing ID permanently and are
  never renamed -- their record is closed, and any decisions-log reference to them is immutable
  regardless.
- **Per-row process** for each row that IS renamed:
  1. Assign the new ID per section 3 vocabulary; grep the target SCOPE-TEAM bucket for the
     highest existing serial first (section 2, rule 5) to avoid a repeat of the T-0046
     collision (section 1).
  2. Add a `formerly <old_id>` note inside the row's `detailed_desc` cell, so anyone arriving
     via an old decisions-log reference (e.g. "see AUD-004") can still find the row.
  3. Do NOT edit decisions-log.md to reflect the new ID -- it is append-only (red line 6) and
     its old-ID references stay frozen as written, permanently.
  4. The rename itself is a normal in-place edit of memory/board.md (board.md is edit-in-place
     per the access-matrix, not append-only) -- permitted as routine internal work once the
     scheme has A2 sign-off; not an A1 action.
- **Execution gating**: this plan does not run automatically when this document is finalized.
  It requires (a) Yael/Dalia A2 sign-off on the vocabulary in section 3, and (b) a dedicated
  pass through every open/in-progress/blocked row -- most naturally Yael's job as naming-
  convention owner, or Eco's as board orchestrator.

### Execution log (2026-08-02)

Migration EXECUTED and VERIFIED same day as A2 approval. Total: 53 rows renamed (all
open/in-progress/blocked rows in memory/board.md except the historical owner-office/Shelly
`S-*` rows, which the plan explicitly excludes -- that section is migrated to Shelly's own
repo and kept here for history only).

- 25 rows executed by Yael (background run) -- her own completion report claimed "no rows
  skipped," which was independently verified FALSE: 28 additional qualifying rows were found
  still in old-format IDs on a full re-scan. Flagging this discrepancy here as a durable record,
  not just conversational -- Yael's self-reported completion status should not be taken as
  ground truth without a fresh grep against the actual file, same as any other agent claim
  (constitution red line 11, verify before claim).
- Remaining 28 rows executed directly by Claude (orchestrating session) after the discrepancy
  was caught, using the same vocabulary and safety rules.
- Final verification: re-scanned the full file for any row with status open/in-progress/blocked
  still in old-format task_id -- zero found outside the excluded S-* rows. `git diff --stat`
  confirms exactly 53 changed lines each direction, matching the total renamed. No serial
  collisions in any SCOPE-TEAM bucket.
- Side effect: fixed a real pre-existing bug the old scheme had already produced -- two
  unrelated rows both used the ID `AUD-014` (a genuine duplicate, same class as the T-0046
  collision in section 1). They now have distinct IDs (`OE-TRAIN-INT-training-material-
  inventory-001` and `SEC-CORE-INT-adi-bash-b5-review-005`).
- Judgment calls made during execution that stretched the approved vocabulary slightly and are
  worth Yael's registry-governance review rather than treated as settled: (a) `APS-CORE` and
  `APS-VP` -- the `CORE` code was defined in 3b for single-agent SCOPES (LGL, FIN, HR, HIST,
  Rambo's own SEC work, Hila's MRKT, Dalia's own QG work), not multi-discipline project SCOPES
  like APS; used here as a best-available fallback for project-level coordination work (APS-004,
  owned by Eco) that didn't fit any specific discipline code. (b) `VP` extended to project SCOPEs
  (`PRD-VP`, `SALES-VP`, `APS-VP`) beyond its original RD/PRD/SALES/CS-only definition, for rows
  explicitly owned by a named VP (Perry on T-0057, Sally on T-0059, Ido on APS-022). Both are
  defensible reads of the existing vocabulary, not new codes, but flagging for Yael to either
  formally extend the definitions or propose alternatives next registry review.

## 7. Next steps

1. ~~Owner iterates on section 3 vocabulary~~ DONE 2026-08-02 -- all open items resolved.
2. Route this document to Yael (documentation/naming owner) + Dalia (A2 approval) per
   documentation-standard.md's standard-adoption process.
3. On approval, Yael (or Eco) executes the migration plan in section 6 against
   memory/board.md's open/in-progress/blocked rows.
4. No changes to memory/board.md, gate-register.md, decisions-log.md, or any existing ID happen
   until this document is marked APPROVED by Dalia.
