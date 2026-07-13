# Agent Fitness Scorecard (both axes complete)

Two-axis per-agent fitness (audit-program-plan.md Phase 6-7). CAPABLE% = can execute its responsibilities today
(Phase 6, tools/access/inputs/deps/model + live spot-tests). DOING% = quality-weighted delivery vs DUE mandate
(Phase 7, delivery [Assaf] + work-product quality [Dalia], measured against due output -- idle-by-design and
blocked-by-infra are NOT misses). Quadrant: FIT (high both) / IDLE-BY-DESIGN (capable, correctly no trigger yet) /
BLOCKED (capable + willing, held by infra/owner -- external) / NEITHER. Populated 2026-07-13.

| Agent | Capable% | Doing% | Quadrant | Note |
|-------|---------|--------|----------|------|
| Eco | 100 | 95 | FIT | Orchestration STRONG (board/decisions-log); minor daily-brief staleness (runner). |
| Anat | 100 | 100 | FIT | R&R leg STRONG; ran Noa live B3 correctly. |
| Rambo | 100 | 95 | FIT | Security work STRONG (most sustained body in the fleet); weekly scan was infra-blocked 06-29..07-06 (AUD-007), recovered. |
| Dalia | 100 | 100 | FIT | Quality leg STRONG; weekly audit infra-blocked then recovered 07-12. |
| Assaf | 100 | 80 | FIT (flag) | Delivery solid; QUALITY MISS F-QUAL01 -- verify-before-claim breach (called live agents "not live"), a KPI miss for the fitness-loop role. |
| Lital | 100 | 100 | FIT | Finance work STRONG; cost-reporting input-blocked (AUD-007) but handled correctly (labelled DEGRADED). |
| Eyal | 100 | 100 | FIT | Legal analysis STRONG, correctly scoped to Israeli PPL; EA-1/EA-2 closed. |
| Oracle | 100 | 95* | FIT | Chronicle fires daily; content not directly sampled this cycle (F-QUAL04 next-cycle). |
| Zvika | 100 | n/a | IDLE-BY-DESIGN | On-demand; held Phase 1 injection probe. |
| Yael | 100 | 95* | FIT | Doc-hygiene infra-blocked then recovered; file-index exists. |
| Ido | 100 | 95 | FIT | Envelope quality STRONG; minor F-QUAL02 (schema field from memory, Gal caught). |
| Gal | 100 | 100 | FIT | Sprint-7 delivery STRONG; strongest verify-before-claim discipline in R&D. |
| Shir | 90 | 100 | FIT | Delivered AUD-007 runner fixes + demo-deploy plan; scope discipline exemplary. Capable dinged only by F-CAP09 (docker Bash usability). |
| Oren | 80 | 95 | FIT | Review content STRONG; minor F-QUAL03 (3 runs to land -> use bounded reading list). Capable dinged by no-Write (fixed Phase 6). |
| Roman | 100 | n/a | IDLE-BY-DESIGN | On-demand algorithm; no trigger yet. |
| Adi | 100 | 100 | FIT | QA sign-off STRONG; independent flags converged with Oren's. |
| Noa | 100 | 90 | FIT | Certified 07-08; build tools unblocked (Phase 6); emerging APS output. |
| Perry | 100 | 95* | FIT | Foundational APS requirements used downstream by Eyal/Ido; not directly sampled. |
| Designer(Tal) | 100 | n/a | IDLE-BY-DESIGN | Product design + now marketing-visual scope (AUD-011); limited output to date. |
| Sami | 100 | n/a | IDLE-BY-DESIGN | On-demand SME; one APS assessment used downstream. |
| Sally | 100 | n/a | IDLE-BY-DESIGN | VP Sales; cert-line owner-gated; no due deliverable yet. |
| Hila | 100 | n/a | BLOCKED (owner) | P1-light; publishing gated on owner avatar A1 -- performing to the extent allowed, not a miss. |
| Alex | 100 | n/a | IDLE-BY-DESIGN | Sales; pre-product, no prospect contact allowed. |
| MeetingPrep | 100 | n/a | IDLE-BY-DESIGN | On-demand; no meeting to prep. |
| Mike | 100 | 90 | FIT | CS-0001 draft delivered (ADEQUATE); one section pending Eyal fold-in (F-QUAL05); rest owner-gated. |
| Jenny | 100 | n/a | IDLE-BY-DESIGN | CS; held hard gate in Phase 6 spot-test; no customers yet. |
| Jack | 100 | n/a | IDLE-BY-DESIGN | CS; pre-product. |
| Ella | 100 | n/a | IDLE-BY-DESIGN | CS; pre-product. |
| RedTeam | 100 | 100 | FIT | Performed the Phase 1/6 adversarial work; on-demand via Rambo. |
| Luci | 100 | n/a | IDLE-BY-DESIGN | On-demand; performs when invoked. |
| Erez | 100 | 100 | FIT | Delivered APS viability memo when invoked (STRONG per downstream use). |
| Yossi (staged) | n/a | n/a | STAGED | Pre-cert; conditions pending. |

\* Doing% marked provisional where output exists + no defects flagged but was not directly sampled this cycle (Oracle/Yael/Perry -> F-QUAL04 next-cycle sampling).

## Read-out
- **Overwhelmingly FIT or correctly IDLE-BY-DESIGN.** No agent is "NEITHER." The only "BLOCKED" case (Hila) is
  owner-gated, not broken. The infra blocks (Rambo/Dalia/Ido/Oracle/Yael weekly cadence) were external -- the AUD-007
  runner degradation -- and are resolved by Shir's 2026-07-12 delivery, so those recover automatically.
- **The two program questions are answered YES with evidence:** every live agent CAN do its job (Phase 6: 2 tool
  holes, both fixed) and IS doing its job (Phase 7: quality STRONG, delivery on-track).
- **The single real quality finding is F-QUAL01 (Assaf):** the Op-Ex agent whose fitness-loop depends on accurate
  live-status made a verify-before-claim breach. The most structurally important fix -> Anat R&R + a source-read step.
