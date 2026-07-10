# Product Ruling -- Authoring Step Order: Rubric vs Ground Truth
# Task: APS-014 minor m6 | Author: Perry (VP Product) | Date: 2026-07-10
# Status: RULING (route via Eco to Ido for engineering scope)
# Scope: case-authoring 4-step flow (AuthoringShell.tsx canNavigateTo logic)

---

## The question

Finding m6 (Ido, review-inc8-ido.md): Step 4 (Rubric) is currently unlocked as soon
as Step 1 (Builder) is complete, skipping Step 2 (Ground Truth). Is this the intended
product order, or must Ground Truth precede Rubric?

---

## Ruling: Ground Truth must precede Rubric

The intended authoring order is:

  Step 1: Builder  ->  Step 2: Ground Truth  ->  Step 3: Triggers  ->  Step 4: Rubric

This is the only pedagogically coherent sequence. Here is why.

The rubric evaluates whether the student correctly navigated THIS patient's specific
clinical picture. That clinical picture is defined by the ground truth: known facts,
hidden facts, risk and safeguarding boundaries, what the patient may/must not invent.
Without ground truth in place, the AI-generated rubric produces generic criteria
("student showed empathy," "student asked open questions") that are not anchored to the
case. A rubric criterion like "student identified the patient's concealed risk factor"
is meaningless unless the ground truth has first named what that risk factor is.

APS-REQ-039 specifies that rubric generation draws on "simulation goals, clinical model,
student level, challenge level, and competency library." Those are builder outputs, not
ground truth outputs -- which is why the current code unlocks rubric after the builder.
That is technically valid for the API call, but it is NOT sufficient for a
clinically-coherent rubric. The AI cannot produce case-specific criteria (what to look
for in THIS patient encounter) from builder metadata alone. Ground truth is the
case-specific anchor.

---

## Enforcement: SOFT -- guided, not hard-blocked

Navigation from Step 2 to Step 4 (skipping ground truth) should show a clear warning
and require an explicit "continue anyway" acknowledgement from the author. It is NOT a
hard block for navigation.

Rationale for soft (not hard):
- Experienced authors may legitimately draft rubric structure in parallel with ground
  truth, then refine both together. A hard block removes a real authoring mode.
- Builder fields alone (clinical model, student level) can generate a useful rubric
  skeleton. The author may prefer to see the skeleton before filling ground truth.
- The engineering cost of a soft warning is minimal; the pedagogical message is clear.

HOWEVER: there is one HARD gate -- the Publish action.

A simulation CANNOT be published unless all three of the following are saved:
  (a) Ground truth (non-empty, passed the mandatory off-ramp check -- APS-REQ-030)
  (b) Rubric (reviewed and confirmed by the author -- APS-REQ-040)
  (c) The rubric must have been REGENERATED or explicitly reviewed AFTER ground truth
      was last saved -- i.e., if ground truth changes post-rubric-generation, the
      system flags the rubric as "possibly stale; review before publishing"

This publish gate is the real enforcement layer. Step navigation stays flexible;
publishing is the hard gate that guarantees no live simulation has a rubric authored
without ground truth.

---

## UI change implied (for Ido scoping)

1. Navigation: if author navigates to Step 4 (Rubric) with Step 2 (Ground Truth) empty
   or unsaved, show an inline warning banner:
   "You have not completed Ground Truth. Your rubric criteria may not match this
   patient's case. We recommend completing Ground Truth first."
   Include a "Continue anyway" action that lets the author proceed.

2. Rubric-generated state: tag rubric drafts generated before ground truth was saved as
   "provisional -- ground truth not complete." Remove the tag when ground truth is
   saved and the rubric has been opened/reviewed after that save.

3. Publish gate: block publish if ground truth is empty OR if rubric is tagged
   provisional (ground truth changed after last rubric open). Author sees:
   "You cannot publish until Ground Truth is saved and your rubric has been reviewed
   against it."

---

## Trade-offs noted

FOR soft enforcement: authoring flexibility; better UX for non-linear authors; lower
friction for iteration. AGAINST: an author who ignores the warning and publishes
(which the hard gate prevents) could waste time on a rubric that needs re-doing after
ground truth. That risk is mitigated by the publish gate.

---

## Routing

This ruling routes via Eco to Ido for engineering scope. No timeline or feasibility
commitment is made here; that is Ido's domain. Engineering items implied:
- canNavigateTo logic: remove the Step 4 skip-to-rubric unlock; add the warning modal.
- Rubric draft state: add a "provisional" flag keyed to ground truth last-saved timestamp.
- Publish gate: check ground truth non-empty + rubric not provisional.

Perry does not modify any spec files directly. This ruling is the product input.
