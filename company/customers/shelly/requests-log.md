# Interface request log -- Shelly <-> Eco-Synthetic

Append-only log of cross-boundary service requests and their outcomes (Eco-Synthetic side).
Shelly keeps a mirror in her own project at `projects/Shelly/memory/eco-requests-log.md`.
ASCII only; no raw owner-personal data -- bounded asks and summaries only.

One row per request (Shelly -> Eco-Synthetic). Responses/closure are folded into `outcome`.

## Channel mechanics (how a request flows)
Since GR-014 (2026-06-29) Shelly writes her requests DIRECTLY into
`C:\Users\Jecki\DEV\shared\handoff\shelly-outbox\` (scoped write grant; her guard.py scans each
file for secrets and denies on a hit). Eco (Rambo/Eyal/Anat/Lital) reads the outbox, responds in
`shared/handoff/`, and Shelly reads the reply there (she has read on all of handoff/). Both logs
updated. No owner relay needed; direct bot-to-bot is still deferred (earned-autonomy ledger).
Source artifacts for each row live in `shared/handoff/`.

(Before GR-014, REQ-001..REQ-004 flowed via owner relay: Shelly wrote to her own `memory/` and
jecki copied the file into `shared/handoff/`. That manual hop is what GR-014 removed.)

## Requests

| date | request-id | service | summary (bounded) | gate | outcome | logged-by |
|------|-----------|---------|-------------------|------|---------|-----------|
| 2026-06-21 | REQ-001 | Security + Legal review (3 standing flags) | T-0028 flags: Sefaria MCP (GR-008), google_workspace MCP (GR-009), israeli-linkedin-strategy tag (GR-004) | A1 (security/tool) | CLOSED 2026-06-21. Rambo + Eyal responded. GR-004: tag v1.1.0 does not exist upstream -> corrected to v1.0.2 @ da2a48eb = CLEAR (internal-draft-only). GR-008: Sivan22 SHA unresolvable -> SHELVED; Sefaria/sefaria-mcp = fresh gate (5 conditions). GR-009: PARTIAL-CLEAR, conditions C1-C6 (write deny-list, scope-limit, DPA, single-user ack, uv.lock). Shelly confirmed all applied. Refs: shelly-eco-flags-2026-06-21.md, eco-shelly-flag-responses-2026-06-21.md, shelly-eco-completion-2026-06-21.md, governance/gate-review-shelly-flags-rambo.md | reconciled 2026-06-29 |
| 2026-06-21/22 | REQ-002 | HR certification + permission scan (T-0028) | Standalone go-live certification of Shelly's project | A1 | CLOSED 2026-06-22. CERTIFIED (owner A1). Anat (HR) all docs passed; Rambo least-privilege compliant (GR-009 C1-C6 deny-list in place; GR-008 shelved; GR-004 tag corrected); Eyal MIT + read-only personal-use cleared. All 4 live conditions confirmed (Telegram bridge 200, 2h check-in, gate-register rows, google_workspace read). Ref: customers/shelly/profile.md (T-0028 section) | reconciled 2026-06-29 |
| 2026-06-24 | REQ-003 | Security scan + Legal/ToS review (whatsapp-mcp) | Gate lharries/whatsapp-mcp for owner WhatsApp via Shelly: read incoming + surface urgent + reply (every send owner A1); local SQLite only | A1 (new tool; owner granted 2026-06-24) | PENDING / ON HOLD. Request reached shared/handoff; Rambo scan + Eyal ToS review not yet returned. Owner placed WhatsApp adoption ON HOLD. Shelly board S-0005 in-progress, blocked on relay to Rambo+Eyal. Ref: gate-request-whatsapp-mcp-2026-06-24.md | reconciled 2026-06-29 |
| 2026-06-29 | REQ-004 | Security re-scan + Legal + scope confirm (Gmail send) | Add a single send tool (gmail.send) to google_workspace (GR-009); every send = owner A1 per action; minimal scope; re-pin connector after change | A1 (scope bump = update; owner granted in-session 2026-06-29) | PENDING Eco review (filed 2026-06-29). Awaiting: Rambo confirm minimal added scope + re-scan + re-pin; Eyal confirm; conditions list. Send non-functional until gate clears. Ref: gate-request-gmail-send-2026-06-29.md. ECO RESPONSE 2026-06-29: acknowledged + routed; joined with Eco's own send-enable request (eco-synthetic board T-0037) as ONE connector update (scope bump on GR-009, not a fresh full gate); gate executes next tool-enabled session (cannot run from Telegram bridge -- no Agent tool to reach Rambo/Eyal). Reply filed: shared/handoff/eco-shelly-response-2026-06-29.md | reconciled 2026-06-29 |

## Context notes (not requests)
- 2026-06-18 -- T-0010 -- Eco-initiated capability audit (not a Shelly request). Defined the
  "standing cross-project services" (Rambo/Eyal/Anat/spend) Shelly cannot self-host and must
  request back. Recorded in profile.md "Standing cross-project services".
- Carried grants (skills-il, hebcal, kolzchut, google_workspace, meeting-prep) were paper-granted
  in eco-synthetic 2026-06-18; first install = owner A1 inside Shelly's repo. Tracked in profile.md
  "Carried grants", not as interface requests.

## Reconciliation history (append-only)
- 2026-06-29 -- Back-filled REQ-001..REQ-004 from shared/handoff/ artifacts and profile.md. Before
  this date the log held only a placeholder row ("no requests yet") while 4 request cycles had
  already flowed. Owner-directed reconciliation. Shelly-side mirror created the same day at
  projects/Shelly/memory/eco-requests-log.md.
