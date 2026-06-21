# Shelly-repo sync checklist (run INSIDE projects/Shelly)

Created by Eco 2026-06-21. The eco-synthetic side of Shelly's separation is DONE and on master
(role file removed, bridge cleaned, owner-office retired, customers/shelly scaffolding + T-0028
cert record merged). This checklist covers the half that can only run in the Shelly repo
(C:\Users\Jecki\DEV\projects\Shelly) -- a Claude Code session opened THERE. Source of truth for
the cert state: company/customers/shelly/profile.md (now on master).

## Status carried over (from the merge)
- Grants were recorded in the owner's LOCAL gate-register/decisions-log; tools are NOT yet installed
  in the Shelly repo. Pins are ported; a re-install at pin is not an update (no re-gate).
- T-0028 certification = CERTIFIED-CONDITIONAL. Anat passed all readable docs; Rambo scan =
  least-privilege compliant. Remaining items are owner live-steps + two flagged tools (below).

## 1. Install her tools (owner terminal, in the Shelly repo, PROJECT scope)
Note: caveman, hebrew-rtl, and Hebcal are now GLOBAL -- the Shelly repo INHERITS them; do NOT
reinstall those per-repo. Remaining per-repo installs:
- 5 skills (pinned, skills-il CLI, choose project scope):
  - israeli-financial-reports v1.2.0, israeli-vat-reporting v1.4.0,
    israeli-employee-tax-refund v1.1.1 (jecki own-data only; DPA before third-party),
    israeli-linkedin-strategy v1.1.0 (internal draft only), israeli-fact-checker v1.0.0
- Kol Zchut MCP: `@skills-il/kolzchut-mcp@1.0.1`
- Sefaria MCP: BLOCKED -- do not install until resolved (see step 3).

## 2. Owner live-verification (closes the T-0028 Anat conditions)
- Put SHELLY_TELEGRAM_BOT_TOKEN in the Shelly repo .env (manual; never commit).
- Confirm Google Drive/Calendar READ-ONLY MCP works (OAuth done; reading confirmed).
- Wire the 2h proactive check-in trigger in her bridge/schedule.
- Confirm the live files contain her gate-register rows + the Granted-resources section.
- When all four are true, the Anat conditional is satisfied -> mark T-0028 CERTIFIED in her repo log.

## 3. Two flagged tools (route back to eco-synthetic services)
- Sefaria MCP: prior install string 404'd. Rambo must resolve the real repo + commit SHA, and Eyal
  must confirm CC-BY-NC (owner personal-use only + attribution) BEFORE any install or reliance.
- Google Drive/Calendar MCPs: Eyal legal review still PENDING -- clear before relying on them.
  (Route both back via owner-relay or the shared/ drop-folder: C:\Users\Jecki\DEV\shared\.)

## 4. whatsapp-mcp -- ON HOLD
Not ported. Fresh gated install only (secondary number + owner QR + Shir + the 9 conditions).
Do not attempt in the sync.

## 5. Close-out
- Log cert completion + installs in the Shelly repo's own decisions log.
- Mirror a one-line completion note back to eco-synthetic decisions-log (cross-reference).
- Standing services (Rambo security, Eyal legal, Anat HR, jecki spend) keep routing back to
  eco-synthetic per company/processes/shelly-move-initial-audit.md section 4.5.
