# DESIGN BRIEF v3 — from 8.5 to 9.5+

**Status:** open. Supersedes nothing; v2 shipped and produced the Deep Coastal
Oceanic theme. This brief targets what that theme did *not* fix.

**Honest framing before anything else.** Roughly half the remaining gap is
**content, not design**, and no prompt closes it. A brief cannot photograph a
barangay hall or decide a processing fee. Items 1 and 2 below are the largest
single contributors to the score and both are blocked on people, not code.
Everything from item 3 down is genuinely a design and engineering problem.

Do not let an agent tell you it moved the score from 8.5 to 9.5 by doing items
3–7 alone. It did not.

---

## The constraints that outrank this brief

Any change that breaks one of these is wrong, no matter how good it looks.

1. **`/ligtas` and `/ligtas/hotline` make zero third-party requests.** Enforced
   by `critical-paths.spec.ts` test 10. No embeds, no CDN fonts, no analytics,
   no weather widget. Ever.
2. **Every route renders its primary content with JavaScript disabled.**
   Enforced by the `no-javascript` project.
3. **CLS stays at 0.000.** Every image reserves its box.
4. **Red is reserved for emergency.** Four accent hues, one meaning each.
5. **No invented barangay facts.** Placeholders are typed, visible and
   launch-blocking.
6. **Filipino is the canonical language.** English mirrors it; it does not lead.
7. **Contrast is measured, not asserted.** See item 7 — the automated gate has
   known blind spots and they are documented.

---

## 1. Photography — the single largest gap

**Problem.** There are zero photographs of Barangay Tumbod on the site. The
gallery renders honest empty cells that name what belongs in them, and it
refuses stock and AI imagery on principle. That refusal is correct and must not
be revisited. But a civic site with no pictures of the place reads as dead, and
this is the largest contributor to the gap between 8.5 and 9.5.

**Work.** Not a design task. Someone photographs: the barangay hall, the
landing and the boats, the health station, the school, the evacuation site, the
shoreline, the mangroves, a fiesta or gathering. Written consent for anyone
identifiable. Upload via `/admin` → Media Library.

**Acceptance.** `/larawan` shows real photographs. The hero carousel's
placeholder slides are replaced. The `exploreCards` kickers stop reading
"Larawan — wala pa".

**Trap.** An agent asked to "improve the gallery" will reach for stock imagery
or generate images. Both are forbidden. A stock tropical beach on Tumbod's
official gallery is a photograph of somewhere that is not Tumbod; a generated
one depicts a place that does not exist, on a government record.

---

## 2. Fill the 245 launch-blocking placeholders

**Problem.** Fees, processing times, boat schedules, wind and wave readings,
three hotline numbers. The most-visited pages — `/serbisyo`, `/ligtas` — are
substantially amber chips. `check-placeholders.mjs` fails the production build
while any launch-blocking marker is reachable, which is correct and is what is
holding launch.

**Work.** Barangay Secretary and BDRRMC fill them via `/admin`. Not a code task.

**Acceptance.** `node scripts/check-placeholders.mjs` exits 0.

**Trap.** Do not "fix" this by softening the gate, by inventing plausible
values, or by setting `PUBLIC_ALLOW_PLACEHOLDERS=true` in production. The gate
is the feature.

---

## 3. Provenance without chip fatigue

**Problem.** `/balita` renders eleven "Halimbawang datos" chips. Each is
individually correct. Collectively they are wallpaper — and a reader trained to
ignore the chip will ignore it on the day a real advisory goes up beside sample
content. This is a real safety regression hiding as a cosmetic one.

**Work.** Replace per-item chips with a **provenance model that scales**:

- **One banner per region**, not one chip per card, stating plainly that the
  section contains demonstration content.
- **Mixed regions must say so** — "3 of 6 items below are examples" is honest;
  a single chip over a mixed list is not.
- **A real item beside samples must be visually distinguishable** without
  relying on the absence of a chip. Absence of a marker is not a signal.
- Detail pages keep their per-article notice. One page, one claim, exact.

**Acceptance.** No page renders more than two sample markers. A page mixing
real and sample content is unambiguous about which is which. The existing
`isSample` flags in `articles.ts` and `live-collections.ts` already carry the
per-row truth — this is a presentation change, not a data one.

**Trap.** Do not solve it by removing the markers. Do not solve it by making
them quieter — a warning that has to be hunted for is worse than an honest
banner.

---

## 4. Stop shipping 76KB of CSS to every page

**Problem.** All stylesheets are inlined into every document, including
`hero.css` and `mega.css` on routes with no hero. On a 2G connection this is
render-blocking bytes that a resident pays for on every page. It is the largest
remaining performance lever and it is pre-existing.

**Work.** Split the bundle by what a route actually uses. `hero.css` belongs to
the homepage. `mega.css` is genuinely global (the panels are in every header) —
audit whether all 1200 lines are, or whether the panel bodies can be deferred.

**Acceptance.** `/ligtas/hotline` and `/serbisyo` ship measurably less CSS.
`node scripts/measure-route.mjs` shows the drop. LCP does not regress.

**Trap.** Do not move CSS to an external `<link>` — that adds a round trip on a
high-latency connection, which is worse than the bytes. Split the inline, do
not un-inline it.

---

## 5. Motion that means something

**Problem.** The site is nearly motionless outside the hero. That was a
deliberate reaction against decorative animation, and it overcorrected: nothing
acknowledges a tap, lists appear instantly with no sense of arrival, and the
mega panels open with a fade that does not explain where they came from.

**Work.** Motion that carries information only:

- **Origin.** A mega panel should read as descending from the nav item that
  opened it, not fading in from nowhere.
- **Acknowledgement.** A tapped card should respond within 100ms.
- **Continuity.** Navigating from a news card to its article should feel like
  the same object opening. Astro view transitions are the obvious tool.

**Acceptance.** Every animation under 300ms. `prefers-reduced-motion: reduce`
removes all of it — verified by the existing test. No animation on `/ligtas`.

**Trap.** Nothing may animate on the emergency path. A resident in a typhoon
does not need a transition; they need a phone number now.

---

## 6. Empty states that are the design, not a gap in it

**Problem.** Several pages are mostly empty and will stay that way for months.
`/larawan` does this well — honest cells naming what belongs in them.
`/proyekto`, `/negosyo` and `/faq` do it poorly, with a bare sentence.

**Work.** Every empty state names **what will appear, who supplies it, and what
to do meanwhile**. An empty page is a legitimate design surface with a
legitimate job.

**Acceptance.** No page renders a bare "wala pang laman". Every empty state
offers a next step.

---

## 7. Close the contrast blind spots

**Problem, discovered 2026-08-07.** `.mega-cta` shipped white on teal-400 at
**1.86:1** while the axe suite reported zero violations across 40 routes, two
locales and two colour schemes. Two causes, both still live:

- **Hidden subtrees.** axe does not scan closed `<details>`, so the five mega
  panels were entirely unaudited. `a11y.spec.ts` now opens them.
- **Pseudo-element backgrounds.** `body::before` (ambient gradient) and
  `.siteheader::before` (header blur) mean axe cannot resolve a computed
  background and files **34 nodes as `incomplete`** rather than as violations.
  Incomplete is not a failure. It passed.

`tests/contrast.spec.ts` now computes WCAG luminance directly and does not
shrug. Keep both gates.

**Work.** Extend the deterministic gate to the cases it still declines:
translucent fills composited over known parents, and text over the ambient
gradient. Add a lint rule forbidding a literal colour paired with a token fill
— that pairing is what broke, because a token can flip from dark to light under
a re-theme and a hard-coded ink inherits the flip silently.

**Acceptance.** A contrast regression anywhere, including inside a closed
panel, fails a test. Verified by reintroducing the bug and watching it fail.

---

## 8. Density and rhythm on the interior pages

**Problem.** The homepage and the mega panels are strong. Interior pages —
`/tungkol`, `/kasaysayan`, `/bisyon`, `/transparency` — are single columns of
text at one rhythm, with generous padding that reads as emptiness rather than
calm.

**Work.** Give long-form pages structure: a sticky in-page table of contents on
desktop, pull-quotes or key figures breaking the column, section markers that
aid scanning. Match the care already spent on `/serbisyo`.

**Acceptance.** No interior page is more than three screens of undifferentiated
body text.

---

## How to verify any of this

```
npx astro check                 # 0 errors
npm run build                   # builds, reads the CMS
npx playwright test             # currently 512 passing
node scripts/measure-route.mjs  # byte budgets
node scripts/check-demo.mjs     # no demo data in production output
node scripts/check-placeholders.mjs
```

A change that improves the look and breaks one of these is a regression.

---

## Scoring, honestly

| Item | Blocked on | Worth |
|---|---|---|
| 1. Photography | people | ~0.5 |
| 2. Placeholders | people | ~0.4 |
| 3. Provenance | design | ~0.2 |
| 4. CSS payload | engineering | ~0.1 |
| 5. Motion | design | ~0.2 |
| 6. Empty states | design | ~0.1 |
| 7. Contrast gates | engineering | correctness, not score |
| 8. Density | design | ~0.1 |

Items 3–8 together are worth roughly **+0.7**, landing around **9.2**. Items 1
and 2 are the rest. That is the honest arithmetic, and an agent that claims
otherwise has not understood the problem.
