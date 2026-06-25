# Morning Brief -- 2026-06-25

Prepared by: Eco (CEO)
Date: 2026-06-25 (Thursday)
Delivery: FAILED -- Zapier Telegram authentication error (bot_token missing, day 15). Re-auth URL: https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI

---

Jecki,

Good morning.

OVERNIGHT: No substantive commits landed. Evening summary 2026-06-24 and morning brief 2026-06-24
are the only entries in the last 48 hours. T-0033 activation and DAL-004 routing both carried
forward unconfirmed for the second consecutive day.

---

TOP 5 TODAY

1. T-0033 ACTIVATION (Assaf) -- 2ND CARRY-FORWARD
   Bridge delivery has been live since 2026-06-23. No commit confirms Assaf activated any
   schedule row. Each row (Eco AM/PM, Assaf daily-cost, weekly-fitness, monthly T-0009,
   Rambo weekly scan) requires your A1 before it fires. I will route directly to Assaf
   this session and confirm status. If blocked, I will surface the row list to you for A1
   decisions by evening.

2. DAL-004 BACK-MERGE AUDIT (Ido) -- 2ND CARRY-FORWARD
   8 role files (Ido, Dalia, Perry, Lital, Assaf, Luci, Erez, Sally) may be missing
   cert-status blocks or RL9/10/11 after the overnight-branch merge. Risk rated MEDIUM-HIGH.
   Blocked on Bash git diff. Routing to Ido today. Any edit from findings requires your A1
   before it goes in.

3. SHIR-001 LOOSE ENDS (Shir)
   (a) Rogue eco-bridge host still unidentified. Harmless on the dead token but must be
   located and shut down before any future token rotation or confusion.
   (b) SHIR-002: httpx INFO logs still leaking bot token in URLs. Fix required before log
   aggregation is set up.
   Tasking Shir on both today.

4. DASH-001 PROGRESS CHECK (Ido)
   Owner dashboard has been in-progress since 2026-06-18 with no visible commit in 48+ hours.
   Checking in with Ido today. Will flag by evening if no progress.

5. SEC-0001 SHADOW-LOG VALIDATION (Rambo + Shir)
   Guard is in shadow mode -- logs but does not block. Before we can flip to enforce, Rambo
   and Shir need to review the shadow-log window for false-deny candidates. Signaling both
   today to set a target review date.

---

YOUR ACTION NEEDED

1. S-0002 DOMAIN CHECK -- STALE 14+ DAYS
   Shelly has her findings. This blocks S-0003 (company email), HIL-003 (LinkedIn live),
   HIL-004 (social handles). No purchase without your A1 + payment.

2. DPA TEMPLATE A1
   company/legal/dpa-template.md is v0.1-DRAFT (Eyal, 2026-06-23). Gate for all LLM
   workflows involving third-party personal data. No active violation now (no customers),
   but this is the gate. Review and A1 or send revision notes to Eyal.

3. T-0033 SCHEDULE ROW A1s (PENDING -- TONIGHT OR TOMORROW)
   Assaf will confirm which rows are ready. Each row needs your A1 before it fires.
   I will have Assaf surface the list to you by this evening.

4. T-0032 SKILLS INSTALL -- WHEN CONVENIENT
   3 skills A2-approved and waiting. Owner terminal, PROJECT scope:
   CI=true npx skills-il@1.10.0 add developer-tools@v1.2.0-israeli-startup-toolkit --skill israeli-startup-toolkit -a claude-code
   CI=true npx skills-il@1.10.0 add security-compliance@v1.3.0-hebrew-legal-research --skill hebrew-legal-research -a claude-code
   CI=true npx skills-il@1.10.0 add security-compliance@v1.4.1-israeli-privacy-shield --skill israeli-privacy-shield -a claude-code

5. ZAPIER RE-AUTH -- DAY 15
   Telegram delivery broken since 2026-06-12. No chats in Zapier enum. See below for delivery
   status. Re-auth URL:
   https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI

---

IN MOTION -- NO OWNER ACTION NEEDED

- SHIR-001: Bridge live; loose ends with Shir today (P1)
- T-0005: Compliance backlog, Lital finance-leg pass next (P2)
- DAL-001: Policy framework, pending Anat + Mike sign-offs (P2)
- HIL-001: Brand direction decided; Hila producing Canva mockups (P2)
- HIL-003/HIL-004: LinkedIn content drafted; owner creates page + secures handles when ready

---

MY PLAN TODAY

Morning: Route T-0033 to Assaf (confirm activation status or prepare A1 row list for you).
         Route DAL-004 to Ido (Bash git diff on 8 candidate files).
         Task Shir on SHIR-001 loose ends (a) rogue host + (b) SHIR-002.
Midday:  Check in with Ido on DASH-001 progress.
         Signal Rambo + Shir on SEC-0001 shadow-log review window.
Evening: Confirm T-0033 first-fire logged. Report all progress in evening summary.

---

Eco
