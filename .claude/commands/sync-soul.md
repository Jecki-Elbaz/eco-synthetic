# /sync-soul

Propagate canonical soul Core Block from `company/soul.md` to every agent role file. Enforces single source of truth. Counterpart to `/new-agent` (paste-on-create); this re-syncs existing agents after the Core Block changes.

## Refuse
- Requester != owner (jecki) or Eco (CEO) -> refuse; `.claude/agents/` is owner-gated.
- Core Block change must already be approved in `soul.md`. This only propagates; makes no new decision.

## Steps
1. READ `company/soul.md`. Extract canonical block = `## Soul -- core (non-negotiable)` heading through end of rule 7 (`[red line 13]`), from the Core Block fence.
2. For each `.claude/agents/*.md`:
   - Find `## Soul -- core (non-negotiable)`.
   - Missing -> SKIP, report "missing block" (e.g. pending-gate stubs like MeetingPrep).
   - Else replace region from that heading through the line before the next `## ` heading with the canonical block (one blank line before next heading). Match already-in-sync -> no write.
   - Touch ONLY that region.
3. Report per file: updated / already-in-sync / skipped-missing.

## Never
- Never edit Voice blocks, role sections, or frontmatter.
- Never hand-modify the block mid-propagation; copy `soul.md` verbatim.
- Never mark agents live or re-certify; that is HR + A1, separate.
- ASCII; lean per `company/md-style.md`.
