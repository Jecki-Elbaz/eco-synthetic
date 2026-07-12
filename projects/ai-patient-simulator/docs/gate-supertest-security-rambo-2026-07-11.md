# Gate Review -- Security Leg: supertest (npm)
# Reviewer: Rambo (Security, L3)
# Date: 2026-07-11
# Triggered by: APS Sprint 4 Item 5 -- Case C (not in devDeps; not in pnpm store)
# Requestor: Eco (CEO)
# Status: SECURITY LEG COMPLETE -- CLEAR-WITH-CONDITIONS
# Eyal leg: CLEAR (gate-supertest-legal-eyal-2026-07-11.md)
# Adoption authority: owner A1 (not granted by this doc)

---

## Verdict

CLEAR-WITH-CONDITIONS (C1-C5)

---

## 1. Package Identity

- Package: supertest (npm, https://www.npmjs.com/package/supertest)
- Repo: https://github.com/ladjs/supertest
- Maintainer: ladjs / Forward Email organization (active steward)
- Latest stable: 7.2.2 (released 2026-01-06; 45 total releases)
- License: MIT (source-verified by Eyal; gate-supertest-legal-eyal-2026-07-11.md)
- Activity: 14.4k stars, 516 commits, actively maintained

Recommended pin: supertest@7.2.2

---

## 2. Supply Chain

Direct dependencies (3; all MIT-lineage):
- methods@^1.1.2 -- HTTP method list utility; no network calls; no hooks
- superagent@^10.3.0 -- HTTP assertion library; supertest's core HTTP driver
- cookie-signature@^1.2.2 -- cookie signing; local crypto only

Repo scan: no .claude/, no CLAUDE.md, no AGENTS.md, no .cursorrules, no postinstall
scripts in the npm manifest. No native addons. No telemetry. No external service calls.
No autostart or OS-level hooks.

If @types/supertest is also installed (TypeScript types from DefinitelyTyped, MIT): pin
that version at install time as well (condition C3).

---

## 3. CVE and Advisory Scan

supertest direct: ZERO known vulnerabilities.
Source: Snyk security.snyk.io/package/npm/supertest (read 2026-07-11).
Result: "No known security issues. No vulnerabilities found in the latest version."
Severity breakdown: Critical 0, High 0, Medium 0, Low 0.

superagent (transitive, required by supertest):
- CVE-2017-16129 / GHSA-8225-6cvr-8pqp: zip bomb in HTTP response decompression.
  Severity: Moderate. Patched at superagent@3.7.0 (2017).
  supertest@7.2.2 requires superagent@^10.3.0 -- well past the patched version.
  Status: RESOLVED in the dependency tree pinned by supertest@7.2.2.

No other advisories found for supertest or its dependency tree relevant to our use case.
Overall CVE posture: CLEAN at supertest@7.2.2.

---

## 4. Risk Profile: Our Specific Use Case

Ido's characterization: "MIT / zero network egress / standard NestJS companion."

MIT: VERIFIED. (Eyal leg confirms; no conditions attach.)

Zero network egress: VERIFIED WITH PRECISION.
supertest makes HTTP calls but only to the locally-bound NestJS TestingModule server
(ephemeral port on 127.0.0.1). No outbound internet connections occur in standard
NestJS integration-test use. Zero egress to any external host -- only loopback traffic.

Standard NestJS companion: VERIFIED.
NestJS official testing documentation uses supertest as the reference tool for
HTTP-layer integration and e2e tests (@nestjs/testing + supertest pattern).
@nestjs/testing@10.4.19 is already in apps/api devDependencies. supertest is the
documented pairing for it.

Additional risk factors:

Scope: devDependency only. Not in the production build. Never ships to colleges, students,
or any third party. Cannot be imported in apps/api/src/ production code paths without
deliberate developer action (condition C2 enforces this).

Runtime: jest test runner only. No daemon, no background process, no OS-level hook, no
startup persistence.

Secrets: APS test environment uses synthetic data only (M-20 compliance). No real student
PII, no real credentials in test context. supertest cannot reach secrets it is not given.

Blast radius: LOCAL ONLY. Failures stay in the jest runner. No external state is changed
by test runs. Worst outcome of a bad supertest call is a test failure.

Injection surface: supertest constructs HTTP requests against a local server. In our use
(CA-INT-002/003), request payloads come from test fixtures, not external input. No
prompt-injection vector in this usage pattern.

Risk level: LOW. Bounded to test runner; no production code path; no external egress; no
student data exposure; historical CVE in transitive dep is patched.

---

## 5. Conditions

C1: Pin supertest@7.2.2 (exact version, no caret or tilde) in apps/api/package.json
    devDependencies. No floating version.

C2: devDependencies only. Never import supertest in any file under apps/api/src/.
    Test files only (*.spec.ts, *.integration.spec.ts). Scope limited to apps/api.

C3: If @types/supertest is also installed, pin that version at install time and record
    it in the gate-register row update (same session as the install).

C4: No version bump without advance Rambo review. Applies to supertest and any
    transitive dep version change visible in pnpm-lock.yaml. (security-baseline
    pin-everything rule.)

C5: Rambo weekly drift scan extended to cover supertest in apps/api devDependencies
    (confirm pinned version not drifted; no unexpected transitive additions).

---

## 6. Standing Note

Security leg complete. Eyal leg: CLEAR (no conditions; gate-supertest-legal-eyal-2026-07-11.md).
Both legs done. Gate requires owner A1 before install.
DO NOT install until owner A1 is issued in-session.
CA-INT-002/003 remain skipped until install is authorized and complete.

---

*Rambo | Security | 2026-07-11*
