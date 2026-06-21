# Morning Brief -- 2026-06-21

Prepared by: Eco (CEO)
Date: 2026-06-21 (Sunday)
Delivery: FAILED -- Zapier Telegram auth broken (day 6). See re-auth URL below.

---

Jecki,

Telegram delivery has been failing since 2026-06-19 (6 consecutive days). The Zapier Telegram
connector needs re-authentication. Re-auth URL:
https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI

This briefing is saved here and in memory/log.md. Open it directly if Telegram is still down.

---

OWNER A1 ITEMS (in priority order)

1. ONB-013 -- Tim (VP Sales), P1, URGENT
   Tim passed B3 3/3 certification. All reviews complete (Anat certify, Rambo clear, Eco B6/B7 GO).
   Blocker: Tim.md role file still reads "pending certification." One line change from you activates
   him and unblocks the entire Sales group (Alex, Hila full track).
   Action: update Tim.md cert-status and go-live line, or tell me to draft the exact edit.

2. S-0002 -- Domain check, P1, STALE 9+ DAYS
   Shelly completed her domain research (eco-synthetic.com vs .ai and non-hyphen variants).
   No domain purchase may happen without your A1 + payment.
   Action: review Shelly's findings and approve or defer. Unblocks S-0003 (company email),
   HIL-003 (LinkedIn page), HIL-004 (social handles).

3. T-0028 -- Shelly HR certification (CERT-PARTIAL), P2
   3 of 4 conditions confirmed: Telegram token/bridge live, 2h check-in wired, gate-register rows
   present. One condition remaining: verify google_workspace READ works in the Shelly repo.
   Cert closes once GR-009 C1 (write/send deny-list) is confirmed in place.
   Action: test google_workspace READ in a Shelly session; confirm result to close T-0028.

4. T-0032 -- Formation/compliance skills install, P3, WHEN CONVENIENT
   3 skills have A2 approval and are ready to install from your terminal (project scope, pinned):
     - Startup Toolkit:    npx skills-il@1.10.0 add developer-tools@v1.2.0-israeli-startup-toolkit --skill israeli-startup-toolkit -a claude-code
     - Legal research:     npx skills-il@1.10.0 add security-compliance@v1.3.0-hebrew-legal-research --skill hebrew-legal-research -a claude-code
     - Privacy shield:     npx skills-il@1.10.0 add security-compliance@v1.4.1-israeli-privacy-shield --skill israeli-privacy-shield -a claude-code
   Add CI=true prefix. Choose PROJECT scope.

---

IN MOTION -- NO OWNER ACTION NEEDED

- SHIR-001: Bridge async ack + timeout fix (Shir, first sprint, P1) -- in progress
- DASH-001: Owner dashboard automated build (Ido, P1) -- in progress
- SHIR-004: Reconcile two bridge.py versions (Shir, first sprint, P2) -- queued

---

WHAT I AM DOING TODAY

- Monitoring SHIR-001 and DASH-001 for stalls
- Ready to signal Dalia on DAL-001 (policy framework) and DAL-002 (doc standard) on your go
- Ready to start T-0003 (backlog queue items) on your signal
- T-0011 (wiki feature evaluation) blocked until wiki setup complete; no action yet

---

RECENT ACTIVITY (last 48h)

Heavy Shelly separation and governance work landed:
- T-0028 CERT-PARTIAL recorded; 3 cross-project flags (GR-004/GR-008/GR-009) processed by Rambo + Eyal
- Privacy-shield C1 resolved
- SHIR-004 task added to board (bridge.py version reconciliation)
- Tool-library catalog ownership assigned to Assaf + Yossi (T-0031)
- Shelly repo checklist updated
- Red-Team agent persona renamed Boaz -> Red (owner A1)

---

DELIVERY NOTE

Zapier Telegram returned: "Authentication required for Telegram."
Re-auth URL: https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI
No PushNotification tool available in this session.
This file committed to git as the delivery record.

---

Eco
CEO, Eco-Synthetic
2026-06-21
