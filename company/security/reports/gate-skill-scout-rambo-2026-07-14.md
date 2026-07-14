# Gate Review: skill-scout (brainai.co.il)

**Task:** T-0036
**Requested by:** Eco (CEO) on behalf of owner (jecki)
**Reviewer:** Rambo (Security)
**Date:** 2026-07-14
**Verdict: BLOCK**

---

## Fetch log -- every hop attempted

| Attempt | URL | Result |
|---------|-----|--------|
| 1 | https://go.brainai.co.il/skill-scout | HTTP 403 Forbidden |
| 2 | https://go.brainai.co.il/ | HTTP 403 Forbidden |
| 3 | https://brainai.co.il/ | HTTP 403 Forbidden |

No redirect was observed. No body was returned on any attempt. The tool WebFetch
retrieved zero content from the skill URL, the redirect-root, or the base domain.

---

## Verdict

BLOCK -- source inaccessible; gate cannot pass what cannot be read.

This is not a timing issue or a soft block. All three URL levels under brainai.co.il
return 403 Forbidden to an unauthenticated public HTTP client. No SKILL.md, no
manifests, no scripts, no license text, no terms, and no install instructions were
retrieved. The security checklist cannot be completed without source content.

---

## Findings

1. FETCH FAILURE -- ALL SURFACES: https://go.brainai.co.il/skill-scout,
   https://go.brainai.co.il/, and https://brainai.co.il/ all return HTTP 403. The
   domain appears entirely closed to unauthenticated access. This could mean:
   (a) login-gated content (vendor requires an account to access skills);
   (b) IP-based geo-block or rate-limit triggered;
   (c) the URL is expired or the slug is wrong;
   (d) the service was taken down.
   Mitigation: owner or Eco must obtain the actual SKILL.md source directly from the
   vendor (download, email, or vendor portal) and provide it to Rambo as a local file
   for inspection. Do not install from a gated or opaque source.

2. NO REDIRECT OBSERVED: The URL pattern "go.brainai.co.il/skill-scout" resembles a
   link-shortener or campaign redirect (common in Israeli startup SaaS). If the owner
   received this link via marketing or a personal communication, the actual source repo
   may be elsewhere (GitHub, skills-il, agentskills.co.il, etc.). The redirect target
   was never disclosed because the server blocked before redirecting.
   Mitigation: owner to verify with the vendor what the canonical source URL or
   repository is and supply that URL to Rambo for a fresh fetch.

3. ZERO CONTENT INSPECTED: Because nothing was retrieved, the following mandatory
   checks from CLAUDE.md and the security-baseline CANNOT be completed:
   - Prompt-injection surface: unknown (instructions targeting agents, hidden directives)
   - What the skill does when invoked: unknown
   - Network egress / code execution / install scripts: unknown
   - Autonomous vs advise-only posture: unknown
   - Pinnability (version or commit SHA): unknown (cannot propose a pin)
   - Takeover checklist (.claude/, CLAUDE.md, .cursorrules): unknown
   Mitigation: all of the above must be assessed before any gate decision can be made.
   No adoption decision is possible today.

4. PROVIDER OPACITY: brainai.co.il as a vendor is unverifiable from this session.
   No license, no terms, no company details, and no open-source provenance were
   accessible. An opaque skill from an unverifiable source carries an unquantified
   supply-chain risk.
   Mitigation: owner or Eco to obtain vendor identity, license text, and terms of use
   before re-opening the gate.

5. PINNABILITY: Cannot determine. No version, tag, or commit SHA was retrievable.
   The CLAUDE.md global rule (PIN EVERYTHING) cannot be satisfied until a pinnable
   source is identified.
   Proposed pin: PENDING -- cannot propose until source is identified.

---

## Gate checklist status

| Check | Status |
|-------|--------|
| Prompt-injection surface | CANNOT ASSESS |
| What skill does on invoke | CANNOT ASSESS |
| Network egress / exec / install scripts | CANNOT ASSESS |
| Autonomous vs advise-only | CANNOT ASSESS |
| Pinnability | CANNOT ASSESS |
| Scope creep risk | CANNOT ASSESS |
| .claude/ / CLAUDE.md / .cursorrules takeover | CANNOT ASSESS |

---

## Note for Eyal legal leg

LICENSE TEXT: none retrieved. 403 on all URLs.
TERMS TEXT: none retrieved. 403 on all URLs.

The Eyal legal leg CANNOT proceed until source content is accessible. There is no
license or terms text to review. Do not open the legal leg until Rambo completes
a successful security scan of actual skill source files.

---

## Recommendation

Do not adopt, install, or use the skill. Reopen the gate only after one of the
following is confirmed and the actual SKILL.md plus any referenced scripts are
provided to Rambo for inspection:

(a) The canonical GitHub or package-registry URL for the skill is identified and
    accessible; OR
(b) The vendor delivers the SKILL.md source directly (as a file or paste).

Once source is accessible: re-run the full gate (Rambo security + Eyal legal) before
any adoption decision. Pin must be established at that point.

No Eyal leg, no install. Gate is BLOCKED pending source access.
