# AUD-011 -- Designer (Tal) marketing/ Scope Permission Scan
# Rambo (Security) | 2026-07-25
# Tasked by: Eco (CEO)
# Context: owner A1 2026-07-12 assigns Tal visual-design ownership; activation gate step 1

## VERDICT: CLEAR-WITH-CONDITIONS (5 conditions)

---

## Sources read

- .claude/agents/Designer.md (full)
- company/governance/access-matrix.md (full)
- company/security/reports/guard-diff-consolidated-preflip-2026-07-14.md (full)
- marketing/ glob (8 files enumerated)

---

## Findings

### F1 -- EXCESS SCOPE: full marketing/ write is over-privileged

Tal's mandate = visual design (logo, palette, typography, identity, marketing design assets).
marketing/ currently contains: content-calendar.md, marketing-p1-kit.md (Hila/Tim
strategy/content domain), social/linkedin/ (3 text-post files = Hila copy domain), brand/
(2 files), avatars/ (not present as a directory with files yet).
Granting full marketing/ write gives Tal write access over Hila's content and Tim's direction
files. That is scope creep beyond the design-craft mandate.
MITIGATION: Scope guard PATH_SCOPE and access-matrix entry to marketing/brand/ and
marketing/avatars/ ONLY. If Tal needs a dedicated campaign-asset landing path, Eco designates
marketing/design-assets/ (new subdir) as the third permitted path; Eco states it explicitly in
the A2 log entry. Full marketing/ is NOT approved.

### F2 -- NO NEW DESIGN TOOL GRANTED UNDER AUD-011

Designer.md tools line = "Read, Write, Edit" -- unchanged. Role file mentions Figma/Canva as
future possibilities ("once the gate clears") but no tool addition is being made under AUD-011.
This scan covers marketing/ write-path expansion only.
SIDE FLAG: Figma MCP appears connected in the current session MCP context. Gate status in
gate-register.md was not read (out of scope for this scan). Eco must verify Figma passed the
Security+Legal gate before any Tal session invokes Figma tools. If not gated: Tal must not use
it (CLAUDE.md red line 4).
MITIGATION: Any future design tool (Figma MCP, Canva, others) requires a separate Security+Legal
gate review before Tal may invoke it. Tal role file already requires this; enforcement falls on
Eco/Perry at task time.

### F3 -- PUBLISHING A1 GATE: unaffected

Writing files to marketing/ = internal production work, not publication. Hila/Tim/owner control
external release; A1 per publish action. No new risk introduced here.
MITIGATION: None needed. Existing A1 publish gate covers it. Confirm to Tal in task envelope.

### F4 -- BRAND-GUIDELINES OVERWRITE RISK

marketing/brand/brand-guidelines-v1.md is the canonical brand doc. Granting Tal write to
marketing/brand/ means she can write to this file directly. Hila retains editorial authority
over brand copy, voice, and positioning within that doc.
MITIGATION: Eco/Perry instruct Tal (in every marketing-design task envelope) that edits to
marketing/brand/brand-guidelines-v1.md require Hila editorial review before the file is marked
final. This is a workflow rule; not a guard-level control but must be documented in the board
task row so it travels with every task.

### F5 -- GUARD PATH_SCOPE: separate edit required

The pre-staged diff (guard-diff-consolidated-preflip-2026-07-14.md) correctly excluded marketing/
from Designer's PATH_SCOPE entry, with a documented note that AUD-011 must clear first. That
note is correct. This scan is the clearing step.
The guard update for Designer must be a SEPARATE edit after the Dalia A2 access-matrix update.
It must NOT be bundled into the consolidated pre-flip diff (which is still PROPOSAL ONLY and
covers different scope). Designer PATH_SCOPE stays at
["projects/delivery-saas/docs/", "memory/log.md"] until the separate edit is applied.
MITIGATION: Shir (or owner) applies a standalone Designer PATH_SCOPE edit: append
"marketing/brand/" and "marketing/avatars/" (plus "marketing/design-assets/" if Eco designates).
This is a guard.py change requiring owner A1 before Shir applies. Do not apply until C1 and
this scan (C2) are both in place.

---

## Conditions (all required before Tal may write to marketing/)

C1 -- Scope restriction (Dalia A2): access-matrix update adds Designer write to marketing/brand/
and marketing/avatars/ ONLY. If marketing/design-assets/ is needed, Eco names it explicitly in
the A2 log entry. Full marketing/ write is not approved.

C2 -- Guard update (owner A1 + Shir apply): separate Designer PATH_SCOPE edit adds exactly the
paths from C1. Standalone change; NOT part of guard-diff-consolidated-preflip-2026-07-14.md.
Owner A1 required before Shir applies.

C3 -- Figma gate confirmation (Eco): before any Tal session invokes Figma MCP, Eco reads
gate-register.md and confirms Figma passed the Security+Legal gate. If not gated: Tal must not
use it; Eco triggers the gate first (CLAUDE.md red line 4).

C4 -- Brand-guidelines workflow (Eco/Perry): direct Tal in the task envelope that edits to
marketing/brand/brand-guidelines-v1.md require Hila editorial review before the file is marked
final. Document in the board task row for every marketing-design task.

C5 -- Future design tools: no tool or MCP is grandfathered by AUD-011 clearing. Each new tool
needs a separate Security+Legal gate. Eco/Perry enforce at task time.

---

## Recommendation

Dalia runs the A2 access-matrix update scoped to marketing/brand/ + marketing/avatars/ (not full
marketing/). Owner A1 on a separate guard edit; Shir applies. C3-C5 documented in board/task.
Security side is CLEAR once C1-C2 are in place.

---

END
Sources: .claude/agents/Designer.md; company/governance/access-matrix.md;
company/security/reports/guard-diff-consolidated-preflip-2026-07-14.md;
marketing/ glob (8 files).
