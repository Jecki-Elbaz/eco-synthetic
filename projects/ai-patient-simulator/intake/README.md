# Intake archive -- READ-ONLY

Originals as received from the customer (Adam), 2026-06-28. Do NOT edit. Copy content to
`../docs/` before working on it.

- `adam-hld.pdf` -- "AI Patient Simulator -- High-Level Design" (71 pp). The detailed HLD:
  vision, hierarchy, access model, LMS integration, simulation runtime, rubric/eval engine,
  dashboards, support module, cost governance, data model, MVP scope, recommended stack/stages.
- `adam-architecture-deck.pdf` -- "AI Simulation Platform: Data, Storage, and Processing
  Tools" (image deck). RAG/persona-evolution architecture diagrams (MongoDB + vector store +
  embeddings + clustering + longitudinal analysis).
- `adam-hld-text-extract.txt` -- machine-extracted text of the HLD (for agent reading; the
  PDFs do not render to text reliably in this environment).
- `adam-appendix-credit-and-continuing-personas.md` -- customer appendix (2026-06-28): two new
  required modules (internal credit/token management; continuing per-student persona history).
- `adam-pilot-readiness-answers.md` -- customer answers (2026-06-28) to the 5 pilot questions:
  committed site Gome Gevim College, start 1 Sep 2026, secure-link v1, Hebrew-first, formative,
  Israel-based students.

NOTE (RESOLVED 2026-06-28): the two documents proposed different storage stacks -- the deck
showed MongoDB + vector/RAG; the HLD recommended PostgreSQL + Prisma + Redis. The appendix
confirms the deck's persona-branching/longitudinal-history design as a real requirement.
Recommendation (Perry, pending Ido sign-off): PostgreSQL + Prisma + JSONB for the formative
pilot (per-student history is a structured lookup, not a similarity search); defer the
vector/RAG layer to Phase 2 (cohort clustering / cross-student similarity).
