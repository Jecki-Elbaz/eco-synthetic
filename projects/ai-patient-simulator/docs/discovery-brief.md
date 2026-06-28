# AI Patient Simulator -- Discovery Brief

Owner A1: jecki, 2026-06-28. Orchestrator: Eco (CEO). Status: Discovery + viability (pre-build).

## 1. What we received
Two documents from Adam (external customer): a 71-page High-Level Design and an image deck of
a RAG/persona architecture. See `../intake/`. Adam has a clear vision but unsettled
requirements -- this is a scoping engagement, not a fixed-spec build.

## 2. Product in one paragraph
A multilingual, LMS-integrated AI clinical-skills simulation platform for psychotherapy /
LI-CBT / ACT training. Students conduct simulated therapy sessions with bounded AI "patients"
(ground-truth-constrained, dynamic emotional state, hidden-disclosure logic), then receive
competency-rubric feedback tied to transcript evidence and a post-session debrief tutor.
Wrapped in a College -> Programme -> Course -> Simulation -> Attempt hierarchy with
role/scope access, Canvas + Moodle LTI, grade sync, dashboards, a deterministic technical
support module, academic-safety protections, cost governance, and longitudinal analytics.

## 3. Engagement decision (owner A1 2026-06-28)
- **Model:** Design partner / strategic. Adam = first reference customer + co-shaper; terms
  (reduced fee / equity / IP split) TBD by owner + Legal.
- **Mobilize now:** Discovery + investment-grade viability (Erez / IRB) in parallel.

## 4. Why discovery-first
Even Adam's own "MVP must" list is ~35 items spanning auth, LTI 1.3, an AI simulation engine
with state tracking, rubric/eval engines, dashboards, and a support module. We scope and
de-risk before we commit to a build number. Discovery converts the vision into a costed,
phased plan we can stand behind.

## 5. Workstreams (this phase)
| WS | Owner | Output |
|----|-------|--------|
| Requirements baseline + open questions | Perry (VP Product) | `requirements-baseline.md`, `clarifying-questions-for-adam.md` |
| Clinical / EdTech domain + safety read | Sami (SME) | `sme-domain-assessment.md` |
| Investment-grade viability + partner structure + go/no-go | Erez (Investor) | `viability-assessment-erez.md` |
| Tool/Legal/privacy pre-read (follow-on) | Rambo + Eyal + Lital | gate-register + privacy note (after scope is set) |

## 6. Key open questions (seed -- Perry expands)
- Target institutions / first pilot cohort? Geography and data-residency requirements?
- Launch languages (Hebrew/Arabic/English -- ordering)? Hebrew/Arabic RTL is our strength.
- Who hosts Canvas (self-hosted per HLD)? Moodle in v1 or v2?
- Budget envelope and target timeline for a pilot?
- Definition of "done" for v1 / the first demonstrable pilot.
- Storage architecture: MongoDB+RAG (deck) vs PostgreSQL+Prisma (HLD) -- we decide, not Adam.
- Regulatory posture: clinical-adjacent training data + student PII (GDPR / Israeli privacy).

## 7. Guardrails
- No agent contacts Adam; owner relays. No customer-facing output without owner A1.
- No external tool/API/LMS adopted without Rambo + Eyal gate.
- Plain ASCII in files and agent-to-agent messages; lean machine-facing md.
- All outputs are INTERNAL discovery artifacts until the owner approves sharing.
