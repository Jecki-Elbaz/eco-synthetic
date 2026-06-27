# Brand Guidelines v1 -- Eco-Synthetic
# Status: INTERNAL DRAFT (A3). Not approved for public use.
# Date: 2026-06-27
# Author: Hila (Marketing)
# Gate note: every element in this document requires owner A1 + Legal (Eyal) clearance +
#             Security (Rambo) review before any public use. Draft only until each element
#             is explicitly A1'd.
# Linked task: HIL-001 (brand guidelines deliverable)

---

## 1. Brand Concept -- Living Signal

Eco-Synthetic is a living system: it breathes, adapts, and grows the way an ecosystem does --
through relationships, not commands. But it executes like a precision instrument. Clean lines,
no noise, no wasted motion. The brand holds both truths at once: organic in its values, exact
in its craft.

When you encounter this brand, you should feel that something intelligent is at work -- and
that a person is behind it. Not tech-cold. Not nature-soft. The third thing: a system that
has both.

One-line concept statement: Nature's intelligence, engineering's discipline -- a living system
that runs clean.

---

## 2. Color System

### Primary Palette

| Name           | Hex     | Character                                       |
|----------------|---------|------------------------------------------------|
| Forest Ink     | #1B3A2D | Deep authority with organic roots               |
| Mint Precise   | #4ECBA1 | Clarity, forward motion, digital precision      |
| Sage Mist      | #7EAB55 | Growth, breath, living ecosystem warmth         |
| Warm Cream     | #F5F0E8 | Background warmth; keeps the brand from cold    |
| Carbon         | #1C1C1E | Structure, engineering, precision text          |

### Usage Rules

**Backgrounds**
- Primary background: Warm Cream (#F5F0E8). Use on all major content surfaces -- LinkedIn
  cards, slide backgrounds, document backgrounds, hero sections.
- Dark background (use sparingly): Forest Ink (#1B3A2D). For headers, dark-mode cards,
  section dividers that need visual weight.
- White (#FFFFFF) is permitted as an inner surface on Warm Cream backgrounds for contrast
  lift. It is not a brand color; use it as a surface only.

**Headings and display type**
- On light backgrounds: Forest Ink (#1B3A2D). Primary heading color.
- On dark (Forest Ink) backgrounds: Warm Cream (#F5F0E8). Heading color inverts.
- Sage Mist (#7EAB55) may be used as a heading accent for pull quotes or key phrases only --
  not as a default heading color.

**Body text**
- Primary: Carbon (#1C1C1E). All running body text on light backgrounds.
- On dark backgrounds: Warm Cream (#F5F0E8).
- Never use Sage Mist or Mint Precise as body text color -- insufficient contrast at small
  sizes.

**CTAs and interactive elements**
- Primary CTA fill: Mint Precise (#4ECBA1) with Carbon (#1C1C1E) label text.
- CTA hover state: darken Mint Precise by 10% (approx #3CB48D) -- describe to designer.
- Secondary CTA: Forest Ink (#1B3A2D) fill with Warm Cream (#F5F0E8) label.
- Links in body text: Forest Ink underline. On dark backgrounds: Mint Precise underline.

**Accents and decoration**
- Sage Mist (#7EAB55): data visualizations, tags, category indicators, icon fills.
- Mint Precise (#4ECBA1): active states, progress indicators, signal/ping elements.
- Never mix Sage Mist and Mint Precise in the same small element -- they read as competing
  greens at small scale. Separate them with at least one neutral zone.

### Do / Don't Examples (written)

DO: Forest Ink heading on Warm Cream card, Mint Precise CTA button with Carbon label --
    this is the canonical combo. Warm, authoritative, precise action.

DO: Full Forest Ink dark card, Warm Cream heading, Sage Mist tag label, Mint Precise icon --
    this is the night/dark-mode variant. Use it for premium or featured blocks.

DON'T: Carbon (#1C1C1E) as the primary background. The brand is not black-first. Carbon is
        for text and structure, not large background fills.

DON'T: Use Sage Mist as a CTA button fill. It reads as passive and blends with plant imagery
        at small size. Mint Precise owns action.

DON'T: Put white text on Mint Precise (#4ECBA1). The contrast ratio is insufficient for
        accessibility. Use Carbon on Mint Precise.

DON'T: Mix Amber, Rust, or warm-orange accents with this palette. They were explored and
        removed (Option A/C merge) as too dissonant against the green family.

DON'T: Use gradients between palette colors. The brand is flat and intentional -- no blending,
        no glow, no drop shadow beyond a 1px border or 4% opacity lift for surface separation.

---

## 3. Typography System

Both typefaces are available on Google Fonts (free, open license). No paid fonts are used.

### Heading: Cormorant Garamond

Character: editorial serif with organic curves. Reads as crafted, not manufactured. Signals
"owned by people" -- warmth and intelligence at display sizes.

Use for: H1, H2, H3, section titles, pull quotes, display callouts, hero statements.
Do not use for: body text, captions, UI labels, form fields, anything under 16px.

Weights in use:
- 600 (SemiBold): H1, H2, hero display
- 500 (Medium): H3, pull quotes, section headers
- 400 (Regular): decorative subheads only (use sparingly)

Tracking: -0.5px to 0 at display sizes. Never positive letter-spacing on Cormorant -- it
dilutes the editorial weight.

### Body: Source Sans 3

Character: open, readable, warm enough for human-touch quality. Zero noise at small sizes.
Precise without being cold.

Use for: all body text, captions, UI labels, form fields, navigation, meta text, anything
under 18px.
Do not use for: H1 or H2 (Cormorant owns those).

Weights in use:
- 400 (Regular): all body and long-form text
- 600 (SemiBold): labels, tags, UI buttons, emphasized terms in body
- 300 (Light): captions and fine print only -- never for running copy

Line height: 1.6 for body paragraphs. 1.2 for labels and captions.

### Type Scale

| Level    | Font                | Size (px) | Size (rem) | Weight | Line Height |
|----------|---------------------|-----------|------------|--------|-------------|
| H1       | Cormorant Garamond  | 56px      | 3.5rem     | 600    | 1.1         |
| H2       | Cormorant Garamond  | 40px      | 2.5rem     | 600    | 1.15        |
| H3       | Cormorant Garamond  | 28px      | 1.75rem    | 500    | 1.25        |
| H4       | Source Sans 3       | 20px      | 1.25rem    | 600    | 1.35        |
| Body     | Source Sans 3       | 16px      | 1rem       | 400    | 1.6         |
| Small    | Source Sans 3       | 14px      | 0.875rem   | 400    | 1.5         |
| Caption  | Source Sans 3       | 12px      | 0.75rem    | 300    | 1.4         |

Notes for designer:
- Base size is 16px. Scale up from there on desktop; mobile H1 reduces to 36px (2.25rem).
- Cormorant Garamond renders with more optical weight than its nominal size suggests -- trust
  the visual, not just the pixel number.
- Source Sans 3 at 16px/1.6 line height is the primary reading experience. Do not compress it.

---

## 4. Logo Direction Brief

No designer is engaged yet. This brief is detailed enough for a designer or a Canva build to
execute the concept correctly.

### What the logo communicates

The logo should feel like a living signal -- a moment of precision within an organic system.
It should read as both intelligent and human. Not a tech company imposing itself on the world;
a growing thing that also knows exactly what it is doing.

### Mark concept: the signal node

The mark is a single small circle or node -- representing a point in a network, or a cell in
a living system -- with one or two clean lines extending from it. Think: a leaf vein, or a
circuit schematic, but reduced to its minimum. Not literal. The lines are precise; the node
is soft-edged (slightly filled, not harsh).

The mark is asymmetrical by one small degree. It does not center-balance like a tech logo.
It is slightly weighted to one side, the way a living thing grows toward light.

### What it must NOT look like

- No leaf silhouette (too literal, too eco-brand-generic).
- No circuit board aesthetic (too tech, loses the warmth).
- No recycling symbol or sustainability cliche.
- No sharp angles, spikes, or aggressive geometry.
- No gradients, glows, or drop shadows in the mark itself.
- Not a monogram of E or S in isolation -- the mark and wordmark work as a unit.

### Wordmark

"Eco-Synthetic" set in Cormorant Garamond 600, with tight (not compressed) letter spacing.
The hyphen is present and intentional -- it connects the two halves of the company name the
way the brand concept connects nature and engineering.

Optional: "Eco" in Forest Ink (#1B3A2D), "Synthetic" in Carbon (#1C1C1E), hyphen in Mint
Precise (#4ECBA1). This color split is one option; flat Forest Ink on Warm Cream is the
simpler default.

### Lock-up variations to design

1. Horizontal: mark left, wordmark right. Primary use.
2. Stacked: mark above, wordmark centered below. For square formats.
3. Mark only: for avatars, favicons, app icons.
4. Wordmark only: for contexts where the mark does not render cleanly (very small print).

### Minimum clear space

Clear space around the full logo lock-up: equal to the height of the "E" in the wordmark
on all four sides.

### Minimum size

Horizontal lock-up: not smaller than 120px wide on screen, 32mm wide in print.
Mark only: not smaller than 24px / 8mm.

---

## 5. Agent Avatar System

### Purpose

Each agent has a Persona-style avatar: a minimal flat-color illustrated character. The avatar
signals group membership through color and signals individual personality through pose, detail,
and expression. Avatars are used in internal channels, agent interfaces, and eventually
external-facing agent introductions. All avatars are internal draft until owner A1 per avatar.

### Template Spec

Canvas: 400px x 400px square.
Background fill: group color (see Color-Coding below), flat -- no gradient.
Illustration style: flat, minimal. 3-5 solid color shapes maximum. No texture, no shadow,
  no outline strokes heavier than 1.5px. Think: paper-cut illustration, not cartoon.
Character: head and shoulders (bust portrait). Face visible, no masks or obscuring elements.
Face tones: one of three warm neutral tones (light, medium, warm-dark) -- designer's choice
  per agent, applied consistently to that agent across all uses.
Expression: calm and focused. Slight suggestion of warmth (not a corporate photo smile --
  more like quiet confidence).
No text in the avatar canvas itself. Name and title are labels applied outside the canvas.

### Color-Coding by Group

| Group              | Background Color  | Hex     | Notes                              |
|--------------------|-------------------|---------|------------------------------------|
| CEO / Staff / Ops  | Forest Ink        | #1B3A2D | Anchor of the org; deep authority  |
| Sales              | Mint Precise      | #4ECBA1 | Action, forward motion, growth     |
| R&D                | Carbon            | #1C1C1E | Precision, build, engineering      |
| CS (Cust. Success) | Sage Mist         | #7EAB55 | Warmth, relationship, delivery     |
| Product            | Forest Ink 70%    | #4A6B5A | Slightly lighter -- owns the future|
| Security           | Carbon 85%        | #363638 | Firm, vigilant, slightly lighter   |
| Legal / Finance    | Warm Cream (inv.) | #2B2620 | Warm Cream inverted -- trust, care |

Note on Forest Ink 70% and Carbon 85%: these are approximations for the designer. Instruct
the designer to mix toward those values rather than use them as exact hex codes -- they are
directional, not literal values.

### What Each Avatar Should Convey

- Role signal: group color tells you which part of the org this agent belongs to at a glance.
- Warmth: the face and posture should not read as robotic. This is the "owned by people"
  signal applied to AI agents. The agents are the synthetic ecosystem -- they should feel like
  members of a team, not icons on a dashboard.
- Professionalism: clean, deliberate illustration. No cute or cartoonish elements. No
  excessive personality flourishes that undermine the precision side of the brand.
- Individuality: within the template, small details differentiate agents -- posture tilt,
  a subtle accessory, glasses, collar style. Enough to tell them apart; not so much that
  the system looks inconsistent.

### Example -- Eco (CEO / Staff group)

Avatar for Eco (the company's AI CEO / orchestrator):

Background: Forest Ink (#1B3A2D) -- the deepest anchor color, authority of the org.
Character: bust portrait, medium face tone. Posture: centered, upright, grounded. No tilt --
  Eco is the still point everything moves around.
Detail: a minimal collar suggesting a neat open-collar shirt (not a suit -- approachable).
  One small geometric shape near the shoulder (a tiny signal node, referencing the brand mark)
  as a subtle identifier. Keep it minimal -- one shape, not a badge.
Expression: calm attention. Not smiling broadly; not stern. Present and focused.
No text in canvas.

### Avatar Rollout Order

1. Eco (template lock -- all avatars wait for this one to be A1'd before any others proceed).
2. Hila, Jack, Mike (external-facing Sales group -- Mint Precise background).
3. Remaining agents in order of external exposure.

Gate reminder: owner A1 per avatar before any avatar is used in any channel, internal or
external. Template A1 unlocks the system; each avatar still needs individual A1.

---

## 6. Brand Voice

### Three Defining Adjectives

- Precise: every word earns its place. No filler, no corporate hedging, no buzzword decoration.
  We say the exact thing, then stop.
- Living: the brand has warmth and motion. It is not static or committee-written. It has a
  point of view and it breathes. Read it aloud -- it should sound like a person, not a press
  release.
- Grounded: we trust what we build. No hype, no overclaiming. We say what we do, we show
  what we have, we leave the superlatives to someone else.

### Three Anti-Adjectives (what we are not)

- Flashy: no excitement-for-its-own-sake. No "revolutionary", "game-changing", "next-level",
  "disrupting the space". If we are those things, the work will show it.
- Cold: this is not a B2B tech company that communicates in bullet points and feature lists.
  There is a person behind this system. The writing should always let that show.
- Vague: we do not use abstraction to hide a weak claim. "We help businesses grow" is not our
  language. "We take the coordination work off your plate so you can focus on the delivery"
  is closer. Specific, grounded, human.

### Two Example Sentences in Brand Voice

1. "We built Eco-Synthetic so that small delivery businesses could run with the same
   operational intelligence as a company three times their size -- without adding headcount
   or losing the personal touch that makes them good at what they do."

2. "Every agent in our system has a role, a clear boundary, and a manager. The same
   discipline we bring to software, we bring to how we work."

---

## 7. Application Examples (written descriptions)

### LinkedIn Post Card

Layout: Warm Cream (#F5F0E8) background. Forest Ink (#1B3A2D) heading in Cormorant Garamond
H2 size (40px equivalent). Body text in Source Sans 3 Regular, Carbon (#1C1C1E). A single
horizontal rule in Mint Precise (#4ECBA1) -- 2px height -- separating the heading from the
body. No decorative images. If an image is included, it is a real photograph or a brand-
consistent flat illustration (no stock photo cliches). The company mark appears bottom-right,
mark-only version, Forest Ink, at 24px minimum.

Tone of the copy: precise, living, grounded. First sentence is a specific claim or
observation. No opening with "We are excited to announce..."

### Product UI Card (e.g., Delivery Management SaaS interface)

Background: White (#FFFFFF) surface on a Warm Cream (#F5F0E8) page.
Card heading: Source Sans 3 SemiBold (H4 level -- 20px), Carbon (#1C1C1E).
Status tag: Sage Mist (#7EAB55) background, Warm Cream text, Source Sans 3 SemiBold 12px.
Active/CTA button: Mint Precise (#4ECBA1) fill, Carbon label, Source Sans 3 SemiBold 14px.
Dividers: 1px Carbon at 8% opacity -- barely there, structural only.
Data values (numbers, metrics): Cormorant Garamond 600 at H3 size (28px). This is where the
editorial serif earns its keep -- numbers in Cormorant read as meaningful, not just output.
Icons: flat, single-color, from an open icon set (Lucide or equivalent). Fill: Forest Ink or
Sage Mist depending on context. Never multi-color icons.

### Agent Response Header (internal channel / agent interface)

Format: plain text or minimal markdown. No decorative borders.
Structure: [Agent name] + [Role] on one line in bold (Source Sans 3 SemiBold equivalent).
  Followed by a single thin horizontal rule (---). Then content.
Color: if a visual header is rendered, Forest Ink text on Warm Cream strip, or group color
  background with Warm Cream text (matching avatar group color).
Tone: concise, precise, no warmup phrases. Agents do not say "Great question!" or
  "Certainly!" -- they answer.
Example:

  Hila | Marketing
  ---
  [response content begins here]

---

## Notes for Designer (Canva execution)

- All fonts are available in Canva under Google Fonts (Cormorant Garamond, Source Sans 3).
- Hex codes are entered in Canva's "Custom color" picker exactly as listed in Section 2.
- The type scale in Section 3 maps directly to Canva's font size field in pixels.
- For the logo mark: start with basic shapes (circle + two lines), use Forest Ink fill,
  then refine. The asymmetry is achieved by making one extending line 15-20% longer than
  the other.
- For avatars: use the "frame" tool in Canva for the 400x400 canvas. Fill with group color.
  Build the bust portrait using basic shape layers: oval for head, rectangle/trapezoid for
  shoulders, smaller shapes for facial features. Keep the total layer count under 12 per
  avatar.
- Do not use any Canva Pro elements (marked with crown icon). Free tier only per constraint.

---

## Version and Status

v1 -- 2026-06-27. Internal draft. Author: Hila (Marketing).
Based on owner A1 direction: Living Signal merge (A+C), 2026-06-23.
All elements require owner A1 before any public use.
Next review: after owner A1 on logo concept and first avatar (Eco template).
