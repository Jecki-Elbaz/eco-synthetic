# Shelly Move -- Initial Capability Audit (T-0010)

Author: Eco (CEO). Date: 2026-06-18. Status: AUDIT + PLAN ONLY (no migration executed).
Trigger: Shelly's first action after separating into her own standalone project
(C:\Users\Jecki\DEV\projects\Shelly) -- she asked Eco for an initial capability audit.
Authority: T-0010 (separation assessment). Actual separation + any install is owner A1.

Grounded in (read this session, verify-then-claim):
- .claude/agents/Shelly.md (role, tools line, Granted resources 2026-06-18)
- company/governance/gate-register.md (8-tool shortlist + whatsapp-mcp; meeting-prep row)
- company/governance/access-matrix.md (owner-office, sources/, Drive/Calendar read-only)
- company/governance/security-baseline.md (no-auto-update policy; Rambo gate; Yossi/Assaf own sources/)
- company/soul.md (Core Block inherited verbatim)
- CLAUDE.md (project red lines; Google Workspace connectors)
- company/decisions/decisions-log.md (2026-06-18 grants; meeting-prep standalone; T-0010/T-0028)
- memory/board.md (S-0001..S-0006a owner-office rows; T-0010; T-0028)

---

## 1. Summary

When Shelly leaves the eco-synthetic repo, almost nothing follows her by default. A separate
repo is a separate runtime: it does not inherit eco-synthetic's CLAUDE.md, its governance
files, its .env, its installed skills/MCP config, its memory, or -- most importantly -- its
PEOPLE. The grants in our gate-register are paper grants; the tools are NOT yet installed
anywhere (install pending per the 2026-06-18 decision), so there is nothing live to "copy."

The gaps split into two fundamentally different kinds, and the whole handover model depends
on keeping them apart:

- ONE-TIME MIGRATION (static assets): things that exist as files or config and can be ported
  once into the Shelly project -- governance text, tool pins, memory rows, connector config,
  the meeting-prep sub-agent prompt. After the port, Shelly self-hosts them.
- STANDING CROSS-PROJECT SERVICES (capabilities Shelly can NEVER self-host): the Security
  gate (Rambo), the Legal gate (Eyal), and HR certification (Anat). These are company
  functions. Shelly has no Rambo, no Eyal, no Anat in her project and cannot create them
  (agent creation is A1, and they are company agents). She must REQUEST these back from
  eco-synthetic, with Eco coordinating, for the life of the Shelly project.

The single most important finding: the no-auto-update policy REQUIRES Rambo's advance
approval for any tool update, and Shelly has no Rambo. So even routine tool maintenance in
her project is a standing cross-project dependency, not a one-time port.

---

## 2. Gap table

| # | Gap | Travels automatically? | Kind | Handover solution | Owner |
|---|-----|------------------------|------|-------------------|-------|
| A | Security + Legal GATE (no Rambo, no Eyal in her project) | NO | STANDING service | Gate requests route back to eco-synthetic; Eco coordinates Rambo (risk) + Eyal (terms) as a shared service. Already-granted tools carry over with their existing pins (no re-gate, just re-pin). Any NEW tool, or any UPDATE to a carried tool, runs the eco-synthetic gate first. | Eco (coordinate); Rambo; Eyal |
| B | Tool GRANTS + INSTALLS (8 shortlist tools + whatsapp-mcp) | NO -- grants exist only in our register; tools NOT installed anywhere | ONE-TIME migration of grants + FIRST install | Reconstitute the grant rows in the Shelly project's own gate-register; then perform the FIRST install in the Shelly project using the exact pinned strings (skills as static SKILL.md; MCP servers pinned by version/SHA in that project's settings.json). No re-gate needed (already cleared); a pinned re-install is not an "update." | Owner (A1 install) + Eco coordinates; install is owner/host action |
| C | GOVERNANCE inheritance (soul Core Block, ASCII rule, project red lines, no-auto-update policy) | NO -- a separate repo does not read eco-synthetic's CLAUDE.md or soul.md | ONE-TIME migration (embed copies) | Embed the Core Block verbatim in Shelly.md (already present), and create the Shelly project's OWN CLAUDE.md carrying: the red lines that apply to her, the ASCII/formatting rule, the Google Workspace read-only rules, and the no-auto-update policy. She inherits by COPY, not by reference. | Eco drafts; owner A1 |
| D | Her own gate-register in the new project | NO | ONE-TIME migration (create new file) | Create company/governance/gate-register.md (or equivalent) in the Shelly project with rows for the carried-over grants only: the 8 shortlist tools + whatsapp-mcp + Drive/Calendar read-only + meeting-prep. Each row keeps its pin and conditions. Marked "granted in eco-synthetic, ported <date>; new tools/updates route back to eco-synthetic gate." | Eco drafts; owner A1 |
| E | Telegram bot config + token (.env) + meeting-prep sub-agent | NO -- .env is gitignored and per-project; sub-agent config is per-project | ONE-TIME migration (config + secret) | Set SHELLY_TELEGRAM_BOT_TOKEN in the Shelly project's own .env (owner sets manually; never committed). Stand up her bridge config there. Port the meeting-prep sub-agent by copying meeting-prep.md content (clone-and-run is forbidden) -- already cleared + adopted for the standalone project per gate-register. | Owner (token) + Shir/host (bridge) + Eco (meeting-prep copy) |
| F | MEMORY port (owner-office scope + her board rows) | NO -- owner-office is owner-only and gitignored; board lives in eco-synthetic | ONE-TIME migration (move data) | Move memory/owner-office/ content into the Shelly project's own memory. Recreate S-0001..S-0006a as her project's own board rows. After the move, eco-synthetic no longer holds owner-office (it was already CEO-denied; clean separation). | Shelly (owns owner-office) + Eco coordinates |
| G | CERTIFICATION (T-0028 pending: Anat/HR not in her project) | NO -- HR is a company function | STANDING service | Route back: Anat runs Shelly's certification (B4) and Rambo runs the permission scan (B5) as the FIRST audit, per owner directive T-0028. If Shelly has already separated, certify IN the destination repo (decisions-log 2026-06-18 explicitly allows this). Eco coordinates the cross-project audit. | Eco coordinates; Anat (cert); Rambo (scan) |
| H | Drive / Calendar read-only connectors | NO -- MCP connector config is per-project settings.json | ONE-TIME migration (re-config) + carries existing terms | Re-add the read-only Google Drive + Calendar MCP config in the Shelly project's settings.json, pinned at setup, READ-ONLY scope only (write tools blocked). Same company account (eco.synthetic.org@gmail.com). No re-gate (already A1-adopted); confirm read-only scope on re-config. | Owner/host (config) + Eco confirms scope |

Additional gaps found (not in the original list but real):

| # | Gap | Travels? | Kind | Solution | Owner |
|---|-----|----------|------|----------|-------|
| I | Orchestration / chain-of-command context | NO | STANDING boundary | Shelly is tasked by jecki only. In her own project she has no Eco-as-orchestrator by default. Eco remains reachable ONLY when jecki delegates a specific joint task + time frame (unchanged from her role file). Document the cross-project cooperation rule in her project's CLAUDE.md so the boundary survives the move. | Eco + owner |
| J | Decisions / audit trail continuity | NO -- append-only log lives in eco-synthetic | ONE-TIME + STANDING | Shelly project gets its own append-only decisions log. The separation event itself (T-0010 execution) is logged in BOTH: eco-synthetic decisions-log (company record) and the new project's log (its founding entry). | Eco (eco-synthetic side) + Shelly (her side) |
| K | Scheduled triggers (2h check-in timer) | NO -- schedule config is per-project/bridge | ONE-TIME migration (re-config) | Re-establish her 2h proactive check-in trigger in the Shelly project's bridge/schedule config (was A1-approved 2026-06-12; carry the approval forward, re-implement the config). | Shir/host + Eco |
| L | Domain / email / WhatsApp in-flight tasks (S-0002, S-0003, S-0005) | Data moves with F, but the SPEND gate does not | STANDING gate | These tasks all hit A1 spend or the Legal/Security gate (domain purchase, WhatsApp ToS/ban risk). They move as task ROWS (gap F) but their approval path stays cross-project: any spend is jecki A1; any tool/terms decision routes back to Eyal/Rambo via Eco. whatsapp-mcp specifically is install-pending with owner QR + Shir and carries 9 hard conditions -- it cannot be "ported live." | Owner (A1 spend) + Eco/Eyal/Rambo (gate) |

---

## 3. One-time migration checklist (static assets to port)

Do once, into C:\Users\Jecki\DEV\projects\Shelly. None of this is executed by this audit.

1. CLAUDE.md (new): red lines applicable to Shelly, ASCII/formatting rule, Google Workspace
   read-only rules, no-auto-update policy, cross-project cooperation rule (gap C, I).
2. Shelly.md role file: port as-is; Core Block already inline; confirm it still points at the
   new project's paths (board, owner-office) not eco-synthetic paths (gap C, F).
3. gate-register.md (new, in Shelly project): rows for the 8 shortlist tools + whatsapp-mcp +
   Drive/Calendar + meeting-prep, each with pin + conditions + "ported, route back for new/updates" (gap D).
4. Tool installs (FIRST install, owner/host A1):
   - 5 skills-il skills: static SKILL.md via pinned strings (accounting@v1.2.0, tax-and-finance@v1.4.0,
     tax-and-finance@v1.1.1, marketing-growth@v1.1.0, government-services@v1.0.0).
   - 3 MCP servers pinned: kolzchut-mcp@1.0.1, hebcal/mcp@0.10.3, sefaria SHA b8ceef78...616b986.
   - whatsapp-mcp: install-pending (owner QR + Shir + 9 conditions) -- do NOT auto-port; gated step (gap B, L).
5. settings.json (new project): MCP scoping for the above + Drive/Calendar READ-ONLY (write tools blocked) (gap B, H).
6. .env (new project, owner-set, never committed): SHELLY_TELEGRAM_BOT_TOKEN (gap E).
7. meeting-prep sub-agent: copy meeting-prep.md content (no clone-and-run); already cleared for standalone (gap E).
8. memory port: owner-office/ content + board rows S-0001..S-0006a recreated in the new project (gap F).
9. Scheduled 2h check-in trigger re-configured in the new bridge/schedule (gap K).
10. Founding decisions-log entry in the new project; mirror the T-0010 execution entry in eco-synthetic (gap J).

Verification after port: confirm read-only scope on Drive/Calendar; confirm no .env value
landed in any tracked file; confirm every MCP install string is pinned (no bare npx/uvx/HEAD).

---

## 4. Standing cross-project services arrangement

These cannot be ported. They are capabilities Shelly's project structurally lacks and cannot
self-host. The arrangement: Shelly raises the need -> Eco coordinates -> the company function
delivers across the boundary -> result logged in both projects.

| Service | Company owner | Why Shelly cannot self-host | Trigger to invoke | Route |
|---------|---------------|------------------------------|-------------------|-------|
| Security gate (risk review) | Rambo | No Rambo in her project; agent creation is A1; she cannot self-clear a tool [red line 7/9] | Any NEW tool; any UPDATE to a carried tool (no-auto-update policy); whatsapp-mcp install | Shelly -> Eco -> Rambo -> back |
| Legal gate (terms review) | Eyal | No Eyal in her project; she cannot accept terms or sign [red line 4, CLAUDE.md] | Any new tool/service/terms; domain purchase terms; WhatsApp ToS | Shelly -> Eco -> Eyal -> back |
| HR certification | Anat | No Anat; certification is a company HR function (T-0028) | First audit / fitness review; any later R&R change | Eco -> Anat (B4) + Rambo (B5); certify in destination repo |
| Spend approval (A1) | jecki | Budget 0; all expenses A1; Shelly cannot self-approve | Domain purchase, WhatsApp paid track, any paid tool | Shelly -> jecki A1 (Eco aware) |

Operating rule for the no-auto-update policy across the boundary: a carried tool may be
RE-INSTALLED at its existing pin without a new gate (that is not an update). Moving to a NEWER
version/commit is an update and REQUIRES Rambo advance approval routed back through Eco, then
re-scan + re-pin. Shelly must never bump a pin on her own.

---

## 4.5 Communication channel + how the audit runs cross-repo

CONSTRAINT (verified, not assumed): Claude Code agents are REPO-SCOPED. An agent defined in
eco-synthetic's .claude/agents/ cannot natively spawn, message, or read an agent in a separate
project. There is NO built-in cross-repo agent bus. So "Eco coordinates Rambo/Eyal for Shelly"
needs an explicit transport. Approved options:

1. Owner relay (works today, zero build): jecki is the channel. Shelly's bot surfaces a request
   to jecki; jecki brings it to an eco-synthetic session (Eco); Eco runs Rambo/Eyal; jecki
   carries the verdict back. This is already how the two separate bots operate, and it keeps the
   owner in the A1 loop. Cost: manual; owner is the bottleneck.
2. Shared drop-folder (recommended, near-zero build): both repos live under C:\Users\Jecki\DEV\
   and the workspace already defines C:\Users\Jecki\DEV\shared\ for cross-project exchange. Use it
   as an async mailbox: Shelly writes a request to shared/handoff/shelly-to-eco/<id>.md; an
   eco-synthetic session picks it up, Rambo/Eyal/Eco process it, write the verdict to
   shared/handoff/eco-to-shelly/<id>.md; Shelly reads it. Both sides can read/write because it is
   the same machine/user. Durable, auditable, no server. (Secrets NEVER go in shared/ -- red line 5.)
3. Inter-bridge channel (later, Shir build, P2): extend the two Telegram bridges to share an owner
   group or a small relay/queue for real-time hand-offs.

HOW THE AUDIT / CERT ACTUALLY RUNS ON A REPO ECO-SYNTHETIC CANNOT REACH:
eco-synthetic does NOT reach into Shelly's repo. Two patterns, chosen by review type:
- BEHAVIORAL (B3 competency test, B5 permission scan): must run where Shelly actually executes.
  The company auditor agents (Anat, Rambo) operate INSIDE Shelly's destination repo as visiting
  auditors -- a Claude Code session is opened in her repo with their role files available there
  (via shared/ or copied for the engagement). You cannot behaviorally test an agent without
  spawning it in its own runtime. This is what "certify in the destination repo" means.
- STATIC (Legal terms review, gate paperwork, license checks): run on a SNAPSHOT. Shelly exports
  the artifacts (role file, gate-register rows, settings.json, install strings) to shared/; the
  eco-synthetic session reviews the snapshot and returns the verdict. No need to enter her repo.

Net: channel = owner relay + shared/ drop-folder now, inter-bridge later; audit/cert = run the
company agents inside Shelly's repo for behavioral parts, review snapshots via shared/ for static
parts. Eco coordinates; the owner (or a session opened in her repo) is the execution vehicle.

## 5. Open risks

1. NO-RAMBO MAINTENANCE TRAP. If a carried tool needs a security patch, Shelly cannot apply
   it without routing back. If eco-synthetic is unavailable, she is stuck on the pinned
   version. Mitigation: accept pinned-and-frozen as the safe default; updates wait for the
   cross-project gate. Pinned-stale is safer than auto-updated-unreviewed.

2. WHATSAPP-MCP IS NOT PORTABLE AS-IS. It is install-pending with owner QR + Shir + 9 hard
   conditions (secondary number, no business/customer use, defined SQLite retention, DPA before
   LLM-processing third-party content, owner ToS/ban-risk acceptance). It must be installed
   fresh in the Shelly project through the full gated path -- it cannot be "moved." Mitigation:
   treat as a gated standing item, not a migration item.

3. SECRET HANDLING DURING MOVE. The Telegram token must be set directly in the new project's
   .env by the owner; it must never transit a tracked file, a commit, or a log during the move
   [red line 5]. Mitigation: owner sets the token manually; no agent touches it.

4. DRIVE/CALENDAR SCOPE DRIFT. Re-configuring connectors risks accidentally enabling write
   tools. Mitigation: read-only scope is mandatory; confirm write tools blocked in the new
   settings.json before first use.

5. ORPHANED COMPANY-FACING ITEMS. Domain/email/WhatsApp tasks touch company assets (company
   account, company brand). After separation these still need eco-synthetic involvement
   (Hila for handles, Lital for cost, Eyal for terms). Mitigation: keep these on a
   cross-project track; do not assume Shelly owns them end-to-end post-move.

6. CERTIFICATION-BEFORE-OR-AFTER AMBIGUITY. T-0028 says certify at first audit; decisions-log
   says if already separated, certify in destination repo. Risk: Shelly running uncertified in
   her own project for a window. Mitigation: Eco schedules the cross-project audit (Anat B4 +
   Rambo B5) as Shelly's first post-move milestone; she keeps running meanwhile per owner
   directive, but certification is the first thing booked.

7. DUAL-LOG DIVERGENCE. Two append-only logs (eco-synthetic + Shelly project) can drift on the
   shared separation record. Mitigation: the T-0010 execution entry is written in both with a
   cross-reference; future Shelly decisions live only in her log.

---

## 6. Recommendation

Execute as: (1) port the static assets in section 3 in one supervised pass (owner A1 for the
new CLAUDE.md, role file, gate-register, and installs); (2) stand up the four cross-project
services in section 4 as a standing arrangement Eco coordinates; (3) book Shelly's
certification (T-0028) as the first post-move milestone. Do not bulk-move; do not auto-update;
do not let any secret transit a tracked file. The separation is A1 -- this audit is the plan,
not the execution.
