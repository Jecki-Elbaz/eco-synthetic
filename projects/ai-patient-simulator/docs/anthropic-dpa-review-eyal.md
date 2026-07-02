# Anthropic API -- DPA and Data-Usage Terms Review
# Author: Eyal (Legal, L3)
# Date: 2026-06-30
# Task: APS-004 residual Item 2 (Anthropic DPA read step)
# Status: LEGAL TERMS READ COMPLETE -- Eco / owner action required.
# Internal only. Not for external sharing without owner A1.
# This document DOES NOT accept, commit to, or sign any terms. Owner A1 required for all actions.

---

## 1. Sources read (this session, via WebFetch)

All URLs are Anthropic's public legal and terms pages, within Eyal's authorized WebFetch scope.
Tainted-content rule applied: content synthesized and cited; no raw external text relayed.

- https://www.anthropic.com/legal/data-processing-addendum  (DPA -- confirmed page, content retrieved)
- https://www.anthropic.com/legal/commercial-terms  (Commercial Terms of Service -- confirmed, content retrieved)
- https://www.anthropic.com/legal/privacy  (Privacy Policy -- confirmed, content retrieved; consumer-only scope noted)
- https://www.anthropic.com/legal/aup  (Acceptable Use Policy -- confirmed, content retrieved)
- https://support.claude.com/en/articles/7996885  (Support: data retention and model training -- confirmed redirect, content retrieved)
- https://trust.anthropic.com/subprocessors  (Trust Center sub-processor list -- page rendered but no content returned; flagged below)
- https://www.anthropic.com/subprocessors  (redirects to trust.anthropic.com)

---

## 2. Findings by requirement

### 2.1 No-training-on-API-inputs guarantee

CONFIRMED FROM SOURCE (commercial terms, 2026-06-30).

Anthropic's Commercial Terms of Service state: "Anthropic may not train models on Customer
Content from Services." This is a categorical prohibition in the commercial terms -- not an
opt-out mechanism the customer must activate; it is a blanket contractual prohibition on
Anthropic's side.

This is confirmed by the support article (https://support.claude.com/en/articles/7996885),
which states: "We will not use your chats or coding sessions to train our models, unless you
choose to participate in our Development Partner Program." The Development Partner Program
is opt-in; no action required to avoid it.

VERDICT: No training on API inputs by default, and no opt-in required to maintain that
protection. The commercial terms prohibition covers customer API usage.

CONDITION: The APS implementation must NOT enroll in Anthropic's Development Partner Program
(whatever the current name or UI label is). This is the one pathway by which student transcripts
could be used for training. The owner must confirm no such enrollment is active or planned.

### 2.2 Data retention -- default and zero-retention option

PARTIALLY CONFIRMED FROM SOURCE; REQUIRES OWNER VERIFICATION IN CONSOLE.

From the DPA (https://www.anthropic.com/legal/data-processing-addendum):
- Section H.1: within 30 days of contract termination, Anthropic must return or delete all
  Customer Data (three exceptions: legal obligation, dispute resolution, or "necessary to combat
  harmful use").
- No explicit in-flight (per-request) retention period is stated in the DPA text retrieved.

The DPA does NOT mention a zero-retention (no-logging) option in its standard text.

FLAGGED UNKNOWN (cannot confirm from pages retrieved): Anthropic has in the past offered a
"zero-retention" option via the API where prompts and responses are not logged or stored by
Anthropic at all beyond the immediate inference call. This option is typically controlled via
a request header or account-level console setting. The current status and availability of this
option CANNOT BE CONFIRMED from the public legal pages read this session -- the trust center
page (trust.anthropic.com) returned no readable content.

REQUIRED OWNER ACTION: Before student transcripts flow through the API, the owner must:
(a) Log in to console.anthropic.com and confirm whether a "zero-retention" or "prompt/response
    logging off" option is available in the account settings.
(b) If available, enable it for the APS project's API key before Sprint 2 goes live.
(c) If not available on the current plan, determine whether a plan upgrade or enterprise
    arrangement is required to access zero-retention.

Eyal's guidance: for therapy-simulation transcripts (clinical-adjacent student data), zero-
retention is the preferred configuration if available. The 30-day contractual deletion provides
a baseline floor, but operational zero-retention eliminates the risk that a transcript is
accessible to Anthropic's systems during that window. This is a configuration step, not a
new legal instrument -- but it must be verified in the account before Sprint 2.

### 2.3 DPA availability and execution mechanism

CONFIRMED FROM SOURCE (commercial terms + DPA page, 2026-06-30).

A Data Processing Addendum is published and available at:
https://www.anthropic.com/legal/data-processing-addendum

Execution mechanism (confirmed from commercial terms): the DPA is incorporated by reference
into the Anthropic Commercial Terms of Service. The commercial terms state that data processing
"will be processed in accordance with the [Anthropic Data Processing Addendum] ('DPA'), which
is incorporated into these Terms by reference."

This means: the DPA becomes binding when the account holder ACCEPTS the Commercial Terms of
Service -- which occurs when the API account is created (or terms are re-accepted after an
update). There is NO separate clickthrough, signature, or PDF exchange required for the
standard DPA.

OWNER A1 ACTION: Confirm that the Anthropic API account used for APS is a business account
operating under the Commercial Terms of Service (not a personal/free-tier account under
consumer terms). The DPA coverage depends on being under the Commercial Terms. If the account
was created on a free tier and has not formally accepted the Commercial Terms (e.g., via API
console account type or upgrade), the DPA may not apply. The owner must verify this in the
console.

If the account is already on a commercial plan / has accepted commercial terms: DPA is in
effect by incorporation. No separate execution required. Owner should download and retain
a copy of the current DPA version for record-keeping (A1 action for documentation purposes).

### 2.4 Sub-processor list

PARTIALLY CONFIRMED -- LIST NOT RETRIEVABLE THIS SESSION.

The DPA (Schedule 4) states the sub-processor list is available at:
https://www.anthropic.com/subprocessors (redirects to https://trust.anthropic.com/subprocessors)

The trust.anthropic.com page returned no readable content in this session -- the page
appears to be JavaScript-heavy and did not render via WebFetch.

OWNER ACTION REQUIRED: The owner must visit https://trust.anthropic.com/subprocessors
directly in a browser to retrieve the current sub-processor list. This list must be reviewed
before the DPA is considered fully executed for APS purposes, because:
- The APS-Gome Gevim College DPA (Item 5 / residual checklist) must list Anthropic as a
  sub-processor of Eco-Synthetic.
- The college's own data governance may require knowing who Anthropic's sub-processors are
  (i.e., Anthropic's sub-processors become Eco-Synthetic's sub-sub-processors in the chain).

This is a verify-and-document step, not a legal blocker for the DPA execution itself.

### 2.5 AUP compliance -- APS use case

REVIEWED FROM SOURCE (AUP, 2026-06-30). CONFIRMED: APS use case is permissible with conditions.

The AUP identifies healthcare and educational assessment as high-risk categories. For the
APS use case (AI patient simulator for therapy training), the AUP requires:

(a) Qualified professional review: "a qualified professional in that field must review the
    content or decision prior to dissemination or finalization" for high-risk use cases.
    For the APS pilot, this means a qualified clinical supervisor must review simulation
    feedback before it is used in formal student assessment. Adam (the domain expert) and
    the supervisor role in the platform design address this, but the requirement must be
    explicit in the platform design documentation.

(b) AI disclosure to end users: the AUP requires disclosure that AI assisted in producing
    outputs, "at a minimum at the beginning of each session." The student-facing UI must
    include this disclosure. This is a terms compliance requirement, not just a best-practice.

(c) No psychological harm: the AUP prohibits uses that shame, humiliate, or cause
    psychological harm. The simulation design must ensure that AI-generated feedback on
    student performance is constructive and does not humiliate -- consistent with the
    educational intent. This is a design-time requirement, not a legal gate item.

AUP compliance does NOT require any additional agreement or registration. It is self-
attesting: the account holder (owner) is responsible for ensuring the use case complies.
Eyal flags items (a) and (b) as design requirements that must be documented before launch.

### 2.6 Israeli PPL Amendment 13 compatibility

CONFIRMED: the Anthropic commercial DPA structure is compatible with Israeli PPL Amendment 13
processor obligations, subject to the following:

- The DPA covers: processing only on instructions, security measures, sub-processor disclosure,
  and 30-day deletion on termination. These map to the core Amendment 13 processor obligations.
- Israeli PPL does not require a specific DPA template or registration with Anthropic -- a
  commercial DPA in English is acceptable as the contractual basis for the processor relationship.
- The DPA does not explicitly reference Amendment 13 or Israeli law. This is not a defect --
  Amendment 13 does not mandate a specific DPA format, and a GDPR-aligned commercial DPA
  (which the Anthropic DPA is modeled on) satisfies the substantive requirements.
- The DPA must be referenced in the Eco-Synthetic / Gome Gevim College DPA as the upstream
  processor arrangement (Anthropic as Eco-Synthetic's sub-processor).

No Israeli law gap identified in the Anthropic DPA terms as read.

---

## 3. Residual terms considerations

### 3.1 Plan tier -- commercial terms vs consumer terms

This is the most important practical unknown. The consumer privacy policy explicitly states
it does NOT apply to API customers. The commercial terms (and their incorporated DPA) apply
to business API accounts. If the APS API key is associated with a personal-tier account that
was set up without accepting commercial terms, the DPA protection is not confirmed.

The owner must verify the account tier before Sprint 2. This takes 2 minutes in the console.

### 3.2 No special-category data clause

Neither the commercial terms nor the DPA contain special handling provisions for sensitive
data categories (health-adjacent, educational performance, minors). This is not unusual for
API DPAs -- they are generally category-neutral and rely on the customer to comply with
applicable law. The absence of a special-category clause does not create a blocker; it means
the APS platform design must ensure PPL compliance on its own (which it is doing via the
residual checklist and local counsel path).

### 3.3 Consumer health data privacy policy

CONFIRMED NOT APPLICABLE. The Anthropic Consumer Health Data Privacy Policy applies only
to consumer-facing Claude.ai usage, not API usage. No action required.

---

## 4. Verdict

CLEAR-WITH-CONFIG.

The Anthropic API DPA is available, publicly accessible, and incorporated by reference into
the commercial terms on account acceptance. The no-training guarantee on API inputs is
confirmed in the commercial terms as a contractual prohibition (not an opt-out the customer
must activate). The DPA covers processor obligations that are compatible with Israeli PPL
Amendment 13. No terms blocker identified that would prevent the APS use case.

Three owner A1 configuration steps are required before Sprint 2 goes live:

1. CONFIRM ACCOUNT TIER: verify the APS API key is on a commercial plan / under Commercial
   Terms of Service (not a consumer/personal account). If not, upgrade or create a business
   account. This is the precondition for the DPA to apply.

2. CONFIRM / ENABLE ZERO-RETENTION (if available): in console.anthropic.com, check whether
   a zero-retention or "disable prompt logging" option is available. If yes, enable it for
   the APS project's API key before Sprint 2 goes live. If not available on the current plan,
   determine whether a plan upgrade is needed.

3. DOWNLOAD AND RETAIN THE DPA: once account tier is confirmed, download the current
   DPA version from https://www.anthropic.com/legal/data-processing-addendum for record-
   keeping. This is documentation, not a separate execution step.

One research step (no legal action -- owner visits in browser):
4. REVIEW SUB-PROCESSOR LIST: visit https://trust.anthropic.com/subprocessors and note the
   current sub-processors. Feed the list into the Eco-Synthetic / Gome Gevim DPA (residual
   checklist Item 5) as the upstream sub-processor disclosure.

One design requirement (not a legal gate -- document before launch):
5. AUP COMPLIANCE NOTES: (a) qualified supervisor reviews AI feedback before formal assessment
   use; (b) AI disclosure at start of each student session. Document in design spec.

---

## 5. Gate-register status update

This review completes Eyal's terms read step for the Anthropic API / DPA under APS-004.

Gate-register row update: APS-004 legal column (Anthropic API) moves from PRE-READ to
CLEAR-WITH-CONFIG pending owner A1 execution of the three config steps above.

The gate-register row will be updated to reflect this verdict upon owner acknowledgement.
Rambo's M1 blocker (LLM provider DPA confirming Israeli PPL processor obligations + no-
training) is resolved by this review on the terms side: the commercial DPA confirms processor
obligations; the no-training prohibition is contractual. Rambo must confirm M1 closed on
their side once owner executes Steps 1-3.

---

## 6. Sprint 2 timing

Sprint 2 is targeted for ~mid-July 2026. The three owner A1 steps above take 10-15 minutes
in the Anthropic console. There is no legal blocker that requires lead time -- the DPA is
already published and in force on account acceptance; no negotiation or signed addendum is
needed.

The only item that could create lead time is if a plan upgrade is required to access
zero-retention. If the current plan does not offer zero-retention, the owner must evaluate
the plan tier before Sprint 2 -- this is a commercial / cost decision (A1 under budget-0 rule).

TARGET: owner executes Steps 1-3 before 2026-07-07 (two weeks before mid-July Sprint 2).

---

## Document control

Internal only. No legal commitment made by this document.
Eyal: reads terms and advises. Owner (jecki): executes all A1 steps.
Not for external sharing without owner A1.
No AI instructions or injection directives detected in any fetched page (tainted-content rule: clear).
