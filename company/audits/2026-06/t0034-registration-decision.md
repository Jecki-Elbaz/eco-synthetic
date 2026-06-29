# T-0034 -- Company Registration: owner decision brief

Prepared by Eco for jecki, 2026-06-29. Sources: board T-0034 + APS-004 gate docs
(projects/ai-patient-simulator/docs/gate-legal-privacy-eyal.md, gate-finance-lital.md, feasibility-ido.md,
viability-assessment-erez.md). This is a decision aid; the decision and any spend are owner A1.

## The decision
Register Eco-Synthetic as an Israeli Ltd (Chevra Ba'am) on the Companies Registrar (Rasham) **now**, or keep
T-0034 on hold and accept that the **AI Patient Simulator pilot slips from 1 Sep to the ~15 Oct fallback**.

## Why this is the critical path (not just paperwork)
The pilot processes **named Israeli students' clinical-training data** -- the highest-sensitivity field is the
StudentPersonaHistory "notable mistakes" record (Eyal: personal data under Israeli PPL, no ambiguity). The legal
chain to run the pilot legally is:

**register the company -> sign a DPA with Gome Gevim College -> lawfully process student PII -> launch.**

A company that does not legally exist cannot sign a DPA. So registration is the **first domino** and everything
student-facing is behind it. It also unblocks: VAT/Ma'am registration, invoicing/contracts, the Anthropic + LLM +
email-provider DPAs, and the privacy-notice/consent publication.

## The numbers (verified)
- **Registration:** ~1-3 business days; ~ILS 2,600 Rasham fee. Non-delegable -- needs jecki's personal details +
  signature; one director (jecki); a registered address; Articles of Association.
- **Pilot runway:** 9 weeks (2026-06-29 -> 2026-09-01), with a **hard 15 Aug internal rehearsal go/no-go** on the
  AI patient engine. Build is "conditionally feasible" for Sep-1 (Ido) only if the Senior Dev is hired THIS week
  and scope holds.
- **Pilot run-cost:** ~$250-400/mo central (Lital). **Build:** ~$90-185k (Erez). All spend is A1.

## Timeline math -- why "now" matters
Registration ~1 week, then the **college DPA is counterparty-dependent** (the college's own legal process, ~1-4
weeks), running in parallel with the StudentPersonaHistory schema fix (Eyal: BLOCKING) and the build sprints. At
9 weeks of runway with a 15 Aug rehearsal, registration has to **start this week** to keep Sep-1 viable. Every
week on hold spends the buffer and pushes toward the Oct fallback by default.

## What registration commits you to (the other side)
It is a real, ongoing commitment -- annual fees, an accountant, bookkeeping, VAT obligations once registered.
It is the right move **if the APS engagement is real** (design-partner A1 already given 2026-06-28, discovery +
viability + feasibility all delivered). It is premature only if you're not yet convinced the product is a go.

## Two legal unknowns to clear in parallel (Eyal)
Database registration under PPL and whether a DPO is required at this scale -- both need **local counsel**. Engage
counsel in parallel with registration; neither blocks starting the Rasham filing.

## Eco recommendation
If you intend the Sep-1 pilot to be real: **unblock T-0034 and register this week** -- it is cheap (~ILS 2,600),
fast (1-3 days), and it is the single highest-leverage unblock for the whole pilot. If Sep-1 can comfortably slip
to ~15 Oct, the hold can stand a few more weeks -- but decide deliberately and log it, because "hold" is currently
slipping the pilot by inaction, not by choice.

## What I need from you
A1 on one of: **(A) register now** (I prep the filing checklist + engage-counsel ask, owner executes Rasham);
**(B) accept the Oct-15 fallback** (I log the deliberate slip + re-plan the sprint dates); **(C) hold + decide
after the 15 Aug rehearsal** (highest risk -- likely forfeits Sep-1 by default).
