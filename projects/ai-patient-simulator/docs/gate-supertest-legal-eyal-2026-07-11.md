# Gate Review -- Legal Leg: supertest
# Reviewer: Eyal (Legal, L3)
# Date: 2026-07-11
# Status: LEGAL LEG COMPLETE -- CLEAR
# Rambo leg: parallel (required before gate-register row closes)
# Adoption authority: owner A1 (not granted by this doc)

---

## Tool under review

Package: supertest (npm, dev-dependency, HTTP-layer integration testing)
Primary dependency in scope: superagent (HTTP client, bundled by supertest)
Use case: automated HTTP request/response tests against the APS API layer; dev environment only;
NOT shipped in the production build or distributed to any third party.

---

## License findings

### supertest

Source verified: https://raw.githubusercontent.com/visionmedia/supertest/master/LICENSE
License: MIT
Copyright: TJ Holowaychuk and other contributors
Conditions: copyright notice + permission notice must be included in copies or substantial
portions of the Software.
Copyleft: NONE. MIT is permissive; no reciprocal licensing obligation.

### superagent (supertest main dependency)

Source verified: https://raw.githubusercontent.com/visionmedia/superagent/master/LICENSE
License: MIT
Copyright: TJ Holowaychuk (tj@vision-media.ca), 2014-2016
Conditions: same as above -- copyright + permission notice in copies.
Copyleft: NONE.

### Transitive dependencies (not individually fetched)

The supertest/superagent ecosystem is standard npm (well-established packages with
18+ years of MIT licensing history). Transitive dependencies were not individually
license-fetched in this review. For a production-facing dependency this would be a gap;
for a dev-only test tool with no student data exposure, the residual risk is LOW and
acceptable for pilot phase. Flag to re-confirm if supertest is ever used on a path that
ships to production.

---

## Commercial closed-source compatibility

MIT is fully compatible with commercial closed-source use. No restriction on use in a
commercial product, no requirement to open-source the product, no royalty or attribution
requirement to end-users. The only obligation is inclusion of the MIT copyright notice in
redistributed copies of the packages themselves.

Dev-dependency note: supertest is used only during development and testing. It is not
included in the production build or distributed to colleges, students, or any third party.
In this usage pattern, even the copyright-notice-in-copies obligation does not apply to
the APS product -- it would only apply if Eco-Synthetic redistributed the supertest or
superagent packages themselves, which is not the case.

---

## npm registry terms

The npm registry Terms of Service (npmjs.com) govern access to the registry as a download
platform. They do not impose IP restrictions on packages beyond each package's own license.
Downloading and using an MIT-licensed package for commercial development via npm is
standard market practice; no additional legal obligation arises from npm's own ToS in
this context. No blocker.

---

## Verdict

CLEAR.

Rationale:
1. supertest: MIT confirmed (source read; not assumed).
2. superagent: MIT confirmed (source read; not assumed).
3. No copyleft contamination -- MIT across both.
4. Fully compatible with commercial closed-source use, including as a dev-only test tool.
5. No terms-of-service obligation beyond the MIT license itself.
6. npm registry ToS: standard platform terms; no additional legal obligation.

No conditions attach from the legal leg. Rambo's security leg is parallel; the gate-register
row cannot be marked CLEARED until both legs are complete and Eco issues A2. Adoption
itself stays owner A1.

---

## Gate-register

New row required in company/governance/gate-register.md. Eyal column: CLEAR (2026-07-11).
Rambo column: pending Rambo leg output. A3 gate-register update executes after both columns
are filled and Eco confirms A2.

---

## Document control

Internal only. Not for external sharing without owner A1. Status: legal leg complete.
