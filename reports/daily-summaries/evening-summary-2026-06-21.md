# Evening Summary -- 2026-06-21

Prepared by: Eco (CEO)
Date: 2026-06-21 (Sunday)
Delivery: FAILED -- Zapier Telegram auth broken (day 7). Gmail auth also broken.
Re-auth URLs:
  Telegram: https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI
  Gmail:    https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/GoogleMailV2CLIAPI

---

Jecki,

Evening summary from Eco. Telegram and Gmail are both auth-broken in Zapier, so this
summary is delivered via git commit only. Re-authenticate via the URLs above to restore
automated delivery.

---

ACCOMPLISHED TODAY

1. Shelly T-0028 CERT-PARTIAL mirrored from her repo.
   3 of 4 conditions confirmed: Telegram token + bridge live, 2h check-in wired,
   gate-register rows present.
   One remaining: you verify google_workspace READ works in the Shelly repo
   (needed to close GR-009 C1 condition).

2. Three cross-project security flags processed (Rambo + Eyal):
   - GR-004 LinkedIn skill: tag corrected to v1.0.2-israeli-linkedin-strategy.
     Shelly must reinstall at v1.0.2. CLEAR after fix.
   - GR-008 Sefaria: SHELVED. Sivan22 repo unresolvable/unmaintained; official
     Sefaria/sefaria-mcp needs fresh gate (5 conditions, stays BLOCKED).
     Recommendation: drop Sefaria for now.
   - GR-009 google_workspace MCP (Shelly): PARTIAL-CLEAR. 6 conditions set.
     C1 (write/send/delete deny-list) is CRITICAL -- must be in place before
     Shelly uses any of the service.
   Full review: company/governance/gate-review-shelly-flags-rambo.md

3. T-0032 Privacy-shield C1 resolved: slug confirmed as israeli-privacy-shield.
   Full formation batch (3 skills) ready for you to install from your terminal.
   Commands:
     CI=true npx skills-il@1.10.0 add developer-tools@v1.2.0-israeli-startup-toolkit --skill israeli-startup-toolkit -a claude-code
     CI=true npx skills-il@1.10.0 add security-compliance@v1.3.0-hebrew-legal-research --skill hebrew-legal-research -a claude-code
     CI=true npx skills-il@1.10.0 add security-compliance@v1.4.1-israeli-privacy-shield --skill israeli-privacy-shield -a claude-code
   Choose PROJECT scope.

4. SHIR-004 added to board: Shir to reconcile two diverged bridge.py versions
   (master vs PR #5 / wip/bridge-status-done) after go-live.

5. T-0031 assigned: Assaf + Yossi to own and maintain tool-library catalog going forward.

6. Red-Team agent persona renamed Boaz -> Red (your earlier A1 applied).

---

ACTIVE INITIATIVES STATUS

- SHIR-001 (bridge async ack + timeout fix): IN-PROGRESS -- Shir, P1, first sprint
- DASH-001 (owner dashboard automated): IN-PROGRESS -- Ido, P1, no blockers reported
- ONB-013 (Tim VP Sales): BLOCKED -- needs your A1 (one-line role file update)
- T-0028 (Shelly HR cert): CERT-PARTIAL -- needs your google_workspace READ verify
- SHIR-004 (bridge.py reconcile): QUEUED -- Shir, first sprint

---

BLOCKERS NEEDING YOUR ACTION (in priority order)

1. ZAPIER AUTH -- BOTH TELEGRAM AND GMAIL (URGENT)
   This is the 7th consecutive day of Telegram failure. Gmail is also broken.
   All automated delivery is down until you re-authenticate.
   Telegram: https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI
   Gmail:    https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/GoogleMailV2CLIAPI

2. ONB-013 Tim VP Sales (P1, URGENT)
   Tim passed all cert steps: B3 3/3 PASS, Anat certify, Rambo clear, Eco B6/B7 GO.
   Blocker: Tim.md still reads "pending certification." One line change activates him
   and unblocks the entire Sales group (Alex, Hila full track).
   Tell me to draft the exact edit if you want.

3. S-0002 Domain check (P1, 9+ days stale)
   Shelly has findings ready (eco-synthetic.com vs .ai + non-hyphen variants).
   No purchase without your A1 + payment.
   Blocking: S-0003 company email, HIL-003 LinkedIn page, HIL-004 social handles.

4. T-0028 close
   Verify google_workspace READ works in a Shelly session.
   Cert closes once GR-009 C1 (write/send deny-list) is confirmed in place.

---

QUEUED FOR TOMORROW

- Monitor SHIR-001 (bridge async ack) and DASH-001 (dashboard) for stalls
- Await your decisions on Tim A1, domain review (S-0002), T-0028 close
- T-0032 skills install when convenient (your terminal, PROJECT scope)
- Ready to start T-0003 (backlog queue items) on your signal
- Ready to signal Dalia on DAL-001 (policy framework) and DAL-002 (doc standard) on your go

---

Eco
CEO, Eco-Synthetic
2026-06-21
