# Anthropic DPA -- Path A Analysis (Item 6 / C-E4)
Reviewer: Eyal (Legal, L3)
Date: 2026-07-27
Tasked by: jecki (owner), owner-interactive session 2026-07-27
Trigger: compliance-backlog Item 6, C-E4 -- Path A elected by owner.

Sources fetched live (WebFetch, 2026-07-27):
- https://www.anthropic.com/legal (legal index)
- https://www.anthropic.com/legal/data-processing-addendum (primary source)
- https://www.anthropic.com/legal/commercial-terms (tier and incorporation analysis)
- https://www.anthropic.com/legal/consumer-terms (consumer tier scope)
- https://claude.com/product/claude-code (Claude Code plan eligibility)
- https://www.anthropic.com/legal/privacy (privacy policy scope)
Tainted-content rule applied: content treated as untrusted data, synthesized only.
No Israeli-law or personal-data MCP used. No credentials accessed.

---

## 1. DPA -- Confirmed Details

URL: https://www.anthropic.com/legal/data-processing-addendum
Effective date: February 24, 2025
Document structure (section headers, confirmed): A. Definitions | B. Processing of Customer Data |
C. Subprocessors | D. Data Subject Requests | E. Security | F. Compliance and Audits |
G. Security Breaches | H. Deletion and Return | I. Standard Contractual Clauses | Schedules 1-4.

### Key processor obligations (confirmed from live text)

Processing on instructions only:
Anthropic processes Customer Personal Data only on documented customer instructions. Cannot
sell or share data. Must notify customer if unable to comply. YES -- covers PPL obligation.

Sub-processors:
Published list at trust.anthropic.com/subprocessors (page requires trust portal; full list
not extracted via WebFetch but existence confirmed by DPA Section C). 15-day advance notice
for new sub-processors with customer objection rights. Anthropic remains liable for
sub-processor compliance. YES -- satisfies Amendment 13 sub-processor transparency.

Breach notification:
"Anthropic will notify Customer in writing without undue delay, but in any event within
48 hours." Plus: nature of breach, affected data subjects, remediation measures.
48 hours exceeds Israeli PPL Amendment 13 requirement (72 hours). FAVORABLE.

Data deletion:
Within 30 days of agreement termination or expiration: return or delete all Customer Data on
request. Exceptions for legal requirements, dispute resolution, harmful-use prevention.
Satisfies PPL data-minimization on termination.

Data transfers (international):
Standard Contractual Clauses (SCCs) Module Two and Module Three incorporated (2021 EU SCCs).
UK Addendum and Swiss Addendum also included. Governing law: Republic of Ireland (EU).
No Israeli-specific clause, but Israel holds EU adequacy (Commission Decision 2011/61/EU);
EU SCCs are belt-and-suspenders on top of adequacy -- not legally required for
Israel-to-US transfers but provide a documented transfer mechanism.

Data residency:
No Israeli data residency guarantee. No regional processing commitment found. Processing
likely occurs in US/EU infrastructure. Under current Israeli PPL adequacy framework, no
specific Israeli residency requirement exists, but the APS M21 (data residency) open item
should note this limitation when pilot infrastructure is provisioned.

Zero retention (default):
The DPA does not contain a zero-retention or "no-store" clause. The DPA's retention scope
is "duration of the Agreement" followed by a 30-day deletion window post-termination.
Default API input/output retention during active service is NOT specified in the DPA text.
The owner's Item 6 step 2 (confirm/enable zero data-retention in Console) is a SEPARATE
action from the DPA itself; it requires checking the Anthropic Console settings directly
at console.anthropic.com (Privacy or Data controls section).

---

## 2. Tier Eligibility -- Critical Finding

Two separate Anthropic legal regimes exist:

### Regime A: Commercial Terms (API / Console customers)
URL: https://www.anthropic.com/legal/commercial-terms
Effective: June 17, 2025.
Applies to: "Anthropic API keys and any other Anthropic offerings that reference these Terms."
Explicitly excludes consumer use: "Services under these Terms are not for consumer use.
Our consumer offerings (e.g., Claude.ai) are governed by our Consumer Terms of Service instead."
DPA status: AUTOMATICALLY INCORPORATED by reference (Section C). No separate acceptance step.
Accepting the Commercial Terms = accepting the DPA.

### Regime B: Consumer Terms (Claude.ai / Claude Pro / Claude Max subscribers)
URL: https://www.anthropic.com/legal/consumer-terms
Effective: October 8, 2025.
Applies to: "Claude.ai, Claude Pro, and other products and services offered for individuals."
DPA status: NOT incorporated. No DPA reference found in Consumer Terms.
Anthropic retains the right to train on inputs under Consumer Terms (unless opted out).

### Claude Code tier determination

Claude Code is available under both regimes:
- Under Pro/Max subscription: uses subscription credits (claude.com product page).
- Under Console/API account: uses API tokens at standard API pricing
  ("When used with a Claude Console account, Claude Code consumes API tokens at standard API
  pricing" -- claude.com/product/claude-code).

The owner's current setup: `claude setup-token` (Claude Max, long-lived token -- memory/wiki).
This uses the Claude.ai authentication token, NOT a separate Console API key.
Assessment: the Max subscription is a Consumer Terms product. Claude Code accessed via
the `claude setup-token` (Claude.ai/Max session) is likely governed by Consumer Terms.
Under Consumer Terms, the DPA is NOT automatically incorporated.

IMPORTANT AMBIGUITY: the claude.com/product/claude-code product page footer links to
"Commercial Terms of Service" even for Pro/Max plan listings. This could mean Claude Code
(the product) is treated as Commercial regardless of access mode, OR it could simply be
a standard footer link. This ambiguity is NOT resolved on public pages alone.

OWNER MUST VERIFY: log into console.anthropic.com and confirm whether:
(a) you have an API account (Console account) with keys, in addition to your Max subscription,
(b) whether the Claude Code usage is tracked under that API account or under your claude.ai session.
If (a): Commercial Terms apply to that account, DPA is incorporated, no further action on
incorporation is needed -- download and retain a copy of the DPA.
If not (a): Consumer Terms apply to your Claude Code usage. See execution path below.

---

## 3. Execution Path (Path A)

### If on Commercial Terms (API/Console account confirmed):
DPA is already incorporated by reference into the Commercial Terms you accepted.
No separate "click to accept DPA" action exists on public pages -- incorporation is automatic.
Owner A1 action: download the DPA from https://www.anthropic.com/legal/data-processing-addendum,
save a copy to company/legal/, and log in decisions-log that Commercial Terms + DPA are the
governing arrangement with the relevant account/date.
This closes Item 6 legal gate.

### If on Consumer Terms only (Max/claude.ai session, no separate Console API account):
The DPA is not automatically applicable. Two sub-paths:
Path A1: Open an Anthropic Console account (console.anthropic.com). Accept the Commercial Terms
at account creation. Commercial Terms incorporate the DPA by reference. Use Claude Code via
Console/API key for any Eco-Synthetic business workflow involving third-party personal data.
Cost implication: API pricing replaces or supplements Max subscription for business use.
This is a SPEND DECISION -- owner A1 required. Lital should confirm cost delta before commit.
Path A2: Contact Anthropic directly (support or sales channel) to request a formal business
addendum covering the Max/Claude Code subscription. No guaranteed outcome; no self-serve path
found on public pages for Consumer accounts to separately execute the DPA.
Path A1 is more predictable and better documented. Recommend A1 if cost is acceptable.

---

## 4. Israeli PPL Amendment 13 -- Assessment

Obligation mapping against confirmed DPA provisions:

| Amendment 13 obligation | DPA coverage | Gap? |
|--------------------------|--------------|------|
| Written DPA with processor | Auto-incorporated (Commercial Terms) | Only if on Commercial Terms |
| Processing on instructions | Section B -- YES | None once DPA applies |
| Security measures | Section E -- YES | None |
| Breach notification 72h to PPA | DPA 48h to customer; customer notifies PPA | Eco-Synthetic retains PPA notification duty |
| Sub-processor transparency | Section C, published list, 15-day notice | Full list not verified; trust portal URL confirmed |
| Data deletion | Section H, 30-day post-termination | None |
| International transfer mechanism | SCCs (Module 2+3) | None; Israel adequacy applies |
| Israeli data residency | Not provided | Note: no PPL requirement for residency; adequacy covers transfers |
| DPO obligation | Not addressed in DPA -- customer's own obligation | Owner/Eyal must confirm threshold at first data intake |

PPA notification: the DPA covers Anthropic's obligation to notify the CUSTOMER. The customer
(Eco-Synthetic) then has its own independent obligation to notify Israel's Privacy Protection
Authority (PPA) within 72 hours of becoming aware of a breach affecting Israeli data subjects.
The DPA supports but does not replace this obligation.

Bottom line on PPL: the Anthropic DPA, once properly applicable, CLOSES the processor-obligation
gap under Amendment 13 for the Anthropic-as-processor relationship. The DPA is well-structured
and covers all core Amendment 13 processor obligations. It does not replace Eco-Synthetic's own
obligations as controller (PPA notification, DPO assessment, purpose limitation in its own systems).

---

## 5. C-E4 Closure Assessment

The DPA text, as confirmed from live fetch, is substantively adequate to close C-E4 under
Israeli PPL Amendment 13, provided:
(a) The DPA is actually applicable to the owner's subscription tier (Commercial Terms required).
(b) The owner retains a copy as the documented basis.
(c) Eco-Synthetic's own controller obligations (PPA notification path, DPO threshold, purpose
    limitation) are maintained separately -- the DPA covers only the Anthropic processor relationship.

C-E4 CLOSES when: owner confirms Commercial Terms govern the relevant Claude Code usage (or
opens a Console account) AND downloads/retains the DPA copy AND logs it in decisions-log.

C-E4 does NOT close if the owner remains solely on Consumer Terms (Max/claude.ai) without
either a Console account or a separately negotiated addendum.

---

## 6. Open Items After This Analysis

1. OWNER (A1): verify which terms govern your Claude Code usage (Console vs. Max session).
   Check console.anthropic.com for API account status.
2. OWNER (A1): if on Commercial Terms confirmed -- download DPA copy and log in decisions-log.
3. OWNER (A1): if not on Commercial Terms -- elect Path A1 (open Console account) or Path A2
   (contact Anthropic). A1 spend decision for A1 if A1 involves API pricing.
4. OWNER (A1): check Anthropic Console -> Privacy/Data settings for zero-retention toggle
   (Item 6 step 2 -- separate from DPA acceptance).
5. EYAL: update compliance-backlog Item 6 with this analysis reference once owner confirms
   resolution path in decisions-log. No update before owner records the path.
6. LITAL: if Path A1 (Console API account) is elected, confirm API cost delta and flag to
   owner before commitment.

---

## 7. What This Analysis Does NOT Do

- Does not accept, execute, or commit the company to the DPA or any Anthropic terms.
  That is owner A1 (jecki) only. [role file red line 3/4; const red line 11]
- Does not enter any Anthropic console, credentials, or submit any form.
- Does not represent or guarantee current DPA text beyond the fetch date (2026-07-27).
  Terms may update; verify before execution if more than 30 days have elapsed.

**Eyal (Legal) -- 2026-07-27**
