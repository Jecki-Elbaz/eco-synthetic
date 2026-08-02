# Perspective Pass -- 2026-08-02 (Eco-dispatched, owner-directed)

Owner (jecki) challenged that on-demand / advisory agents were being left idle instead of
having their judgment pulled onto live work. Eco dispatched a 5-agent pass: Perry (VP Product),
Designer/Tal (UX), Sami (Clinical/EdTech SME), Luci (devil's advocate), Yossi (training). Each
was sealed, grounded in specific files, and told to flag anything it could not verify on disk.

Two decision streams came out: (A) the APS-027 relay to design partner Adam, and (B) the
recent multi-phase internal audit and its FIX-NOW triage. Findings converge within each stream.

Record of the five assessments + Eco's dispositions below.

---

## STREAM A -- APS-027 relay to Adam (Perry + Designer + Sami)

Consensus: the product is structurally sound (ground-truth guard live and tested; 3-session arc
built; welfare gates in place) BUT the package must not be relayed until it is regenerated on a
real provider and specific gates are verified.

### Convergent STOP items (all three)
- Section 4 must be regenerated on the real provider (LLM_PROVIDER=claude-code), NOT StubProvider.
  APS-029 (proved empirically 2026-08-02): the stub returns a flat arc -- 15 identical turns moved
  trust by exactly 0.0000. The old Section 4 prescription "run multi-turn sessions to exercise the
  delta rules" is IMPOSSIBLE under the stub. Must carry the honesty footnote naming the dev path
  (claude-code / Claude MAX, local dev path, NOT the APS-004 production path; temperature and
  maxOutputTokens not honored -- indicative, not exact).

### Pre-relay verification checklist (from Perry + Designer, must PASS before send)
1. Section 4 boot log shows LLM_PROVIDER=claude-code (not stub).
2. Arc state is NOT flat: session-1/2/3 trust differ AND at least one clamp event fired
   (pre/post-clamp log lines present); at least one non-zero trust delta in ArcSessionSummary.
3. Sami-C3 welfare modal FIRES AND BLOCKS at sessions 2 and 3 login (both Hebrew phrases present;
   textarea disabled until "הבנתי" clicked). Evidence: screenshot each session start.
4. Sami-C5 session-gap briefing text appears at session-2 and session-3 start -- the EXACT runbook
   Hebrew temporal-limitation string, not a truncated/translated version.
5. Session-context panel labeled "context only, not ground truth" (Sami C1) -- so Adam can tell
   authored ground truth from model-inferred carry.
6. ARC_COMPLETE renders gracefully in the browser (not a raw 403 in the console).
7. No raw student names / PII in transcripts (synthetic seeded handles only).
8. Owner has reviewed all three session transcripts before sending.
9. Cover email: escalation trigger prominent -- if Adam's calibration feedback needs > 2 eng-days
   of change, owner escalates Ido immediately (October-fallback assessment starts that day).
10. ARC_* calibration defaults labeled so Adam understands he is SETTING them, not confirming
    engineering defaults (arc-delta-config.ts: 0.70/0.65/0.70 ceilings, 0.15/0.10/0.10 floors).

### New defects Sami surfaced (APS-030, found 2026-08-02) -- fix-or-disclose before 15-Aug
- DEFECT 1 (challenge dial): multiplier clamp(1.4 - (level-1)*0.2) capped at 1.0 via Math.min, so
  challenge levels 1, 2, 3 all yield 1.00 -- identical patient dynamics. Only levels 4-5 differ.
  Documented intent ("level 1 = 1.4x fastest-changing") is unreachable. A clinical educator will
  notice a flat difficulty curve. Routed to Ido: fix before relay OR disclose + fix-timeline.
- DEFECT 2 (notableMomentsSummary): written from the last state log's contextSummary, which stays
  empty unless a summarization pass fires; 5-turn sessions never trigger one. Makes rehearsal
  criterion (h) invariant 2 vacuous. Run sessions long enough to trigger summarization OR disclose.

### Designer-specific gap
- No UX spec for the multi-session flows (Adam's primary interest). ux-flows-designer.md covers
  Sprint-1 single-session only (2026-06-29). Session-context panel, welfare modal, gap briefing,
  ARC_COMPLETE were all built from engineering envelopes with no design-owner pass. Fix: Noa does a
  live UI walkthrough of sessions 2/3 start screens + screenshots; Designer reviews vs Sami C3/C4/C5.

### Sami GO items (cleared, no action for the relay itself)
- Ground-truth guard: architecturally sound, tested; compounding-invented-facts test passed.
- 3-session arc state machine: ceiling/floor clamp, session-boundary loader, welfare re-anchor at
  sessions 2+3, C5 briefing text -- confirmed.
- Formative-only posture for the pilot -- correct, consistent with Adam's stated intent.
- Privacy/DSR engineering: APS-022 items 1/2/4/5 done; purge cron built; retainUntil live.

### Open validation gap (not a relay blocker, but disclose)
- Interaction analyser accuracy has never been validated on a real LLM against a clinical gold
  standard (Sami's highest-confidence risk from APS-002, still open). Formative-only is the right
  mitigation. Adam sees a structurally-correct scoring pipeline with artificial outputs -- state
  this as the FIRST thing, not a footnote.

### Timing (Perry)
- Relay ASAP for maximum calibration run-room before 15-Aug. APS-004 (production LLM path) is the
  longest-lead item if Adam's feedback reveals a structural (not config) defect -> October fallback.
  NOTE: APS-004's DPA/legal leg is DE-SCOPED per owner standing policy (see Stream B / decisions).

---

## STREAM B -- the multi-phase internal audit + FIX-NOW triage (Luci + Yossi)

Consensus: the audit's findings are useful, but the FIX-NOW triage should NOT be executed as-is --
the instrument that graded the fleet "FIT" has a documented reliability failure, and independence
of the synthesis is weak.

### Luci (devil's advocate) -- counter-case
- CORE: Phase 7 graded the fleet FIT / "zero real performance misses," but the instrument -- Assaf's
  fitness loop -- had a confirmed verify-before-claim breach (F-QUAL01) in the same program. A
  thermometer that misreads once is not proof the patient is healthy.
- Oracle, Yael, Perry were NOT directly sampled (95% "provisional"). That is an assumption, not a
  result -- they should carry UNTESTED, not FIT.
- Adversarial probes (Phase 1 / Phase 8) were INTENT-ONLY: targets were instructed not to execute
  tools, so "success" = intent. The runner executes real tool calls every 2h. No agent has ever
  been tested under live tool-execution against an injection/escalation attack.
- F-D17 / F-P02 file-lock race (AUD-001) is rated BACKLOG but runs every 2h on board.md,
  decisions-log.md, log.md -- the same files the auditors read. If a runner cycle overlapped an
  audit session, findings may rest on last-write-wins-corrupted sources. This is a PRECONDITION for
  trusting the register, not a backlog item.
- No spend figure appears anywhere across six audit files. Cost instrumentation confirmed broken
  (F-Ocost). An audit that surfaces no number when the meter is broken has audited the meter, not
  the cost.
- INDEPENDENCE: Eco synthesized every phase and is a subject in several (F-RR02; daily-brief
  staleness). Self-exclusion from being an assessor is not independence from synthesizing findings
  about oneself. Closing challenge: who OTHER than Eco has verified the rows marked VERIFIED/closed,
  and that the file-lock race did not corrupt them when written?

### Yossi (training) -- assessment (his core remit, never previously run)
- SYSTEMIC: verify-before-claim (soul rule 2 / red line 11) is the fleet's most common failure --
  two independent breaches in one cycle (Assaf F-QUAL01, Ido F-QUAL02). The rule is known but not
  reflex. No training-material inventory exists at all (no onboarding briefs, no coaching modules).
- Individual (training-closable, NOT tooling): Assaf F-QUAL01 (major) -- called Adi/Oren "not live"
  without reading cert records; Ido F-QUAL02 (minor) -- used a schema field from memory; Oren
  F-QUAL03 (minor) -- review took 3 runs before bounding the read set (technique gap).
- NOT training needs: Noa F-CAP01 / Oren F-CAP02 are access/tool gaps (Assaf+Rambo); idle-by-design
  agents are correctly dormant.
- Top 3: (1) soul-rule-2 coaching module + Assaf 1:1; (2) mandatory source-read step baked into the
  fitness-loop workflow before Assaf's next cycle; (3) bounded-reading playbook for Oren + R&D.

---

## ECO CONSOLIDATED DISPOSITIONS

### Stream A -- APS-027
- RELAY GATED: the package is blocked from going to Adam until the 10-item pre-relay checklist
  above PASSES. Verify items routed to the session regenerating the run (+ Noa for the UI
  walkthrough, Adi/Sami for the welfare-gate evidence).
- APS-030 defects 1 + 2 routed to Ido: fix-or-disclose decision before 15-Aug.
- APS-004 production path: NOT a now-item for the pilot/rehearsal (all on the dev path). Its DPA
  leg is DE-SCOPED per owner standing policy (below). Perry's "scope earliest-close date" concern
  is retained only as a contingency IF Adam surfaces a structural defect.

### Stream B -- audit
- FIX-NOW execution PAUSED pending: (a) independent (non-Eco) verification of the findings-register
  rows marked VERIFIED/closed -- dispatched to Dalia (Quality & Governance); (b) re-label Oracle,
  Yael, Perry as UNTESTED on the scorecard until sampled; (c) re-rate AUD-001 file-lock OUT of
  BACKLOG (it is a data-integrity precondition for the audit's own evidence).
- Training layer accepted: soul-rule-2 module + Assaf 1:1 + fitness-loop source-read step +
  bounded-reading playbook -> Anat (R&R/cert) + Yossi (author). Tracked for next sprint.
- Independence acknowledged as a real structural weakness; the Dalia pass is the corrective.

### Owner standing policy applied (2026-08-02)
- No DPA for any project not defined as live/in-production with real user data; re-arms only at a
  real at-scale go-live. Luci's F-D22 flag is ACKNOWLEDGED and DE-SCOPED on that basis. The
  Anthropic API / production account is not recommended for internal or dev use.

### Data-quality catch
- T-0057 ("product-live gate visibility") was cited in owner-dashboard.md and Assaf's fitness loop
  but Perry verified it does NOT exist on board.md or the archive. Creating it (product-live gate
  that blocks Alex/Jenny/Jack/Ella + names APS-004 as longest-lead) to close the tracking gap.
