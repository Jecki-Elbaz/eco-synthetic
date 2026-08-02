# DRAFT -- Adam cover email: 3-session test run for review
# Eco draft 2026-08-02. OWNER SENDS from eco.synthetic.org@gmail.com, owner cc'd.
# No agent sends. Plain-text body below the line.
# Attach: the review package (Sections 1-3 from adam-review-package-3session-draft-2026-07-15.md
#   + Section 4 live run from adam-review-package-section4-liverun-2026-08-02.md), in whatever
#   format the owner prefers (PDF/Doc). Owner reviews the transcripts before attaching.

To: Adam <leighton.adam@gmail.com>
From: eco.synthetic.org@gmail.com (owner sends; owner cc'd)
Subject: AI Patient Simulator -- 3-session test run for your review

---

Hi Adam,

As promised, here is the complete 3-session test run for your review, ahead of our
mid-August rehearsal. The review package is attached.

What we did: ran one patient through three back-to-back sessions with the same student,
deliberately varying the student's skill -- a weak first session, a mixed second, a
skilled third -- so you can see how the between-session change model behaves in each
direction. Every trust and rapport number in the package is what the model produced; only
the student's messages were scripted.

The one result we most want your eyes on is the floor. In the two weaker sessions the
student's handling pushed the patient's trust down toward collapse, and the model held it
at its minimum rather than letting the patient shut down completely -- our current floor
is 0.15 on a 0-1 scale. The package shows this bound firing in both of those sessions.
The question for you: is 0.15 the right "least cooperative the patient can plausibly be,
but still workable for training" level, or should it sit higher or lower?

One honest note on the ceiling. When we confirmed the 3-session arc, I mentioned we would
ask you to calibrate the cap on how cooperative the patient can become. This particular
run did not get near that cap -- even the skilled session left the patient guarded -- so
rather than show you the ceiling in action, we are asking for your clinical judgment on
the proposed values directly: trust 0.70, openness 0.65, alliance 0.70. Do those keep a
session-3 patient realistically challenging after two good sessions? The full set of
calibration questions -- those bounds, the expected session-3 starting ranges by student
level, and a realistic symptom trajectory across three sessions -- is in Section 1 of the
package.

Anything you adjust is a configuration change on our side, not a rebuild, so there is room
to tune before the pilot.

Timing: whenever suits you in the window you mentioned works for early August. If anything
you flag would need more than a minor model change we would want to know sooner rather than
later, but we are not expecting that.

Technical note you can disregard: this was produced in our development environment, and if
you look at the raw transcripts you may spot one patient reply that came back in English
instead of Hebrew. That is a dev-tooling artifact, not how the model behaves -- it will not
occur in the piloted build.

Thank you for making the time for this.

Best,
[owner signature]
