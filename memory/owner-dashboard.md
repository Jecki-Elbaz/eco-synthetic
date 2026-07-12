# Owner Dashboard

**Last refreshed: 2026-07-12 02:00**

---

## P1 Tasks Open

- DASH-001 | dashboard refresh | in-progress | Ido | recurring
- T-0001 | go-live structure/R&R | in-progress | Eco | immediate
- T-0037 | email-send gate | in-progress | Eco | 3 owner actions remaining
- T-0040 | Shelly comms wiring | in-progress | Shir+Eco | recurring
- T-0020 | agent-tool sec gate | in-progress | Rambo | R&D C3 open
- SEC-0001 | guard enforce flip | in-progress | Shir/Rambo | B2 + 7-day window pending
- AUD-001 | file-lock shared files | open | Shir | backlog
- AUD-002 | prod-readiness SOPs | open | Shir/Assaf | target 2026-08-15
- AUD-004 | CS comms policy | in-progress | Mike | Eyal s8 input done; Mike folds then A1 pkg
- AUD-007 | runner hardening | open | Shir/Ido | next sprint (spec ready 2026-07-11)
- AUD-008 | Phase 5 sec delta | open | Rambo/Eco | **GR-014 EXPIRES 07-14 (2 days)**
- SHIR-001 | bridge async-ack | in-progress | Shir | async enhancement pending
- APS-004 | APS gate residuals | in-progress | Eco | prod go-live gated

---

## Pending Owner Actions

- **[URGENT 07-14]** GR-014 Rambo-Adam inbox screen expires -- fresh A1 to extend or it lapses. Waiting: Rambo
- **AUD-008** Add "noa" to OWNER_SPAWN_ONLY in guard.py BEFORE SEC-0001 enforce flip. Waiting: Rambo
- **T-0037** 3 steps: re-pin GR-009 SHA + add gmail.compose to settings.json + OAuth re-consent as eco.synthetic.org. Both gate legs done.
- **HR-002** Update Noa.md PROVISIONAL->FULL in .claude/agents/ (owner-only write; Anat done).
- **T-0039** WhatsApp install: 1 decisions-log entry (SHA + ban-risk acceptance). Both gate legs done.
- **APS** Send comms/email-adam-2026-07-11-3session-confirm.md to Adam (3-session arc confirm).
- **GR-015** Supertest A1 -- Rambo + Eyal both CLEAR, waiting owner A1.

---

## Run-Queue

Runner lane:
- RQ-001 | surface pending actions view | done

Desktop lane (queued -- need tool session):
- RQ-002 | T-0038 verify-before-forward in Eco role file
- RQ-003 | commit Noa.md + session reload
- RQ-004 | T-0037 email gate Eco account
- RQ-005 | T-0039 whatsapp gate review

---

## Trigger Health

Daily (all OK): Eco 2h/AM/PM, Assaf cost, Ido dash, Oracle chronicle, Shir git-hygiene, Rambo inbox screen -- all fired 2026-07-11.

Weekly -- **OVERDUE x6** (last run: 2026-06-29, 13 days, threshold 10.5d):
- Assaf fitness loop, Rambo perm-drift scan, Lital compliance check, Eyal compliance check, Dalia quality audit, Yael doc-hygiene
- Note: AUD-007 explains -- runner save_state() froze at 06-29 during machine sleep 07-06; drift reports DO exist for 07-06/07 but state was not saved. SHIR-FIX-01 resolves next sprint.

Monthly: Assaf on-demand agent review last 2026-07-01 -- OK (11 days).

---

## Agent Roster

- Eco: 3 P1 tasks (T-0001, T-0037, T-0040)
- Shir: 5 P1 tasks (SHIR-001, AUD-001, AUD-002, AUD-007, SEC-0001) -- overdue weekly triggers
- Rambo: 3 P1 tasks (T-0020, SEC-0001, AUD-008)
- Mike: 1 P1 task (AUD-004)
- Ido: 2 P1 tasks (DASH-001, AUD-007 oversight)
- Gal / Noa / Adi: APS Sprints 1-6 done (Sprint 6 closed green 2026-07-11); prod-hardening next
- Assaf / Lital / Eyal / Dalia / Yael: 0 P1; weekly triggers overdue (AUD-007 save_state bug)
