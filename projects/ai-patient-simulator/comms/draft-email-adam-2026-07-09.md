# DRAFT email to Adam (APS design partner) -- 2026-07-09 (rev 2)

Status: DRAFT -- OWNER SENDS. Do not send from any agent.
Project hard gate: no agent contacts Adam directly; all Adam communication is owner-relayed.
Customer-facing -- contains NO internal company information, task IDs, agent names, procedures,
sprint plans, engineer-day estimates, or internal role titles.

REV 2 (2026-07-09) -- owner asked whether this email is still relevant given Adam already
replied. It is, but the rev-1 framing was wrong. Rev 1 re-confirmed things Adam had already
told us. Rev 2 is retargeted:

  - REMOVED: re-asking Adam to be the clinical lead. He already answered this on 2026-07-07
    ("Adam is the initial clinical/product lead for pilot content; periodic review"). Asking
    again would read as though we had not read his email. It is now a narrow confirm: will he
    sign off the specific between-session change model.
  - REMOVED: announcing self-simulation and author-preview as news. He requested them; telling
    him we are building what he asked for is not worth an email on its own.
  - ADDED, and the real reason to send: a DIRECT CONFLICT between two things Adam told us.
      * Q9.1: he wants multiple sessions with the SAME simulated patient.
      * COHORT-SIZE: he plans "~3-5 simulation sessions per student."
    If those 3-5 sessions are with the same patient, the 2-session arc cap contradicts what he
    has already planned for. If they are 3-5 separate cases, there is no conflict at all. The
    intake record does not disambiguate this, and neither does the feasibility note. Nobody has
    asked him. This must be resolved before any multi-session build starts, because the answer
    decides whether the cap is a minor scoping note or a broken commitment.

Sources verified before drafting:
  - projects/ai-patient-simulator/intake/adam-pilot-readiness-answers-2026-07-08.md (Q9.1;
    Q-CLINICAL-OVERSIGHT; COHORT-SIZE)
  - projects/ai-patient-simulator/docs/adam-answers-feasibility-ido-2026-07-08.md (Sections 1, 4)
  - memory/board.md row APS-017

Deliberately NOT included: commercial/budget terms; internal build sequencing; the October
fallback date; security/DPA detail (separate legal track).

Delivery: OWNER SENDS. With the draft tool now permitted (board T-0037), this can be placed in
the owner's Gmail Drafts once OAuth consent completes. It is never sent by an agent.

---

From: (owner)
To: Adam
Subject: AI Patient Simulator -- one thing I need to check with you about session counts

Hi Adam,

Your answers unblocked us. Both things you asked for -- the continuing patient across sessions,
and the self-simulation and author-preview modes -- are in for the first pilot, and the work is
scheduled. Thank you for being that specific; it saved us a lot of guessing.

One thing in your reply needs checking, and it matters more than it might look.

You said you are planning three to five simulation sessions per student. You also said you want
multiple sessions with the same simulated patient. I want to be sure I have understood which of
these you meant:

  (a) each student works through three to five different patients, one encounter each; or
  (b) each student follows the same patient across three to five sessions; or
  (c) some mix -- for example two patients, two or three sessions each.

I ask because for the first pilot we intend to cap a continuing arc at two sessions with the
same patient. If you meant (a), the cap changes nothing about your plan and you can ignore it.
If you meant (b), then the cap cuts directly across what you have designed, and I would rather
know that now than in August.

The reason for the cap is not technical. A patient who carries state forward has to stay
coherent across a session boundary -- remembering what was actually said, not inventing history,
holding the therapeutic relationship where the student left it. Two sessions is the arc length
we can properly validate before students use it. Three-to-five session arcs are the immediate
next step, informed by what the first pilot shows. If your pilot design genuinely needs longer
arcs from day one, tell me, and we will talk about what moves -- either the arc length or the
timeline. I would rather have that conversation with you than quietly ship something shorter
than you were expecting.

The related thing I need is narrow. You said you would be the clinical and product lead for
pilot content, with periodic review. Taking that at face value: the way the patient changes
between sessions -- how trust shifts, how symptoms move -- is a clinical model, and it should
not go in front of students without a clinician putting their name to it. Can you confirm you
are that person for this specific piece? It is one review of how we have specified the
between-session change, and then a yes or a request for adjustment.

I need both answers by 14 July. Without them we will run the first pilot with single encounters
and move the continuing-patient work to the following release. That is a workable outcome, just
not the one either of us wants.

Fifteen minutes on a call would probably settle both faster than email. Happy to do that this
week if it suits you.

Best,
Jecki, on behalf of Eco - Synthetic CEO
