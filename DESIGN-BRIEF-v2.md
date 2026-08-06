# DESIGN BRIEF — closing the gap from 6.5 to 10

**Use this as the prompt.** Paste it whole. It is written against the real
files, tokens and class names in this repository, because the previous briefs
were generic and most of the effort went into interpreting them rather than
building.

---

## The situation

The hero, the five mega panels and the `/admin` CMS are 8.5–9/10. Every other
page is 4.5/10. The gap is the entire problem: a visitor's experience gets
visually *worse* the deeper they go, and the News mega panel currently contains
better service cards than `/serbisyo` does.

**Do not redesign. Propagate.** The design system already exists, is documented,
and is contrast-measured. The job is applying it to the ~40 pages that never got
it, and removing one colour that should never have been there.

---

## Non-negotiable constraints

Breaking any of these is a failed job, not a trade-off. All are enforced by
`npx playwright test` — 398 tests, currently all passing.

1. **398/398 must still pass.** Run the suite before you claim to be done.
2. **WCAG AA on every text/background pair.** `tests/a11y.spec.ts` runs axe over
   40 routes with zero tolerance. Every colour you introduce must be measured,
   not eyeballed.
3. **The site works with JavaScript disabled.** `tests/no-js.spec.ts`. No
   component may depend on JS to be readable.
4. **`/ligtas` and `/ligtas/hotline` make ZERO third-party requests.**
   `critical-paths.spec.ts` test 10. Do not add a font CDN, an icon library, or
   an analytics beacon anywhere.
5. **Homepage LCP < 2.5s and CLS < 0.05 on Slow 4G / 4× CPU.**
   `tests/perf.spec.ts`. Current: ~2.0s / 0.000. Do not spend that headroom on
   decoration.
6. **Semantic colour is meaning, not taste.** Emergency red
   (`--alert-emergency`) appears on emergency affordances and nowhere else. The
   sea-state scale (`--sea-calm` → `--sea-dangerous`) keeps its escalation
   order. Never colour alone — always colour + word + icon (§2.4).
7. **No invented barangay facts.** `BUILD-PROMPT.md` §0.2. Sample content stays
   labelled with `SampleChip`.

---

## The work, in priority order

### 1. Colour consolidation — do this first, it touches everything

The site currently runs **four** accent hues. One of them means nothing.

- `--interactive: #1f6796` (blue) — links
- `--accent: #f5b301` (gold) — section markers, primary CTA fill
- `--nav-indicator: #1f7a45` (green) — nav underline, "you are here"
- `--alert-emergency: #b3160c` (red) — emergency

**Reduce to three, with one job each:**

| Colour | Token | Means |
|---|---|---|
| Reef green | `--palette-reef-ink` #1f7a45 | interactive, confirmed, "you are here" |
| Bangka gold | `--accent` #f5b301 | **fill only** — primary CTA, section markers |
| Signal red | `--alert-emergency` | emergency, and nothing else |

Concretely, in `src/lib/tokens/tokens.css`:

- Repoint `--interactive` and `--interactive-hover` to the reef green ink and a
  darker step. **Re-measure both against `--surface` and `--surface-raised`** —
  they carry body-copy links and must clear 4.5:1, not 3:1.
- Do the same in **both** dark-mode blocks (the `prefers-color-scheme` media
  query and `:root[data-theme="dark"]`). They are separate and drift easily.
- Leave `--interactive-visited` distinguishable from unvisited. Do not collapse
  them into one colour.

Then remove red from anywhere that is not an emergency path. Today the homepage
shows a red EMERGENCY button, a red quick-action tile and a red-bordered hotline
card in one viewport. Keep the header button and the `/ligtas` surfaces; make
the quick-action tile neutral.

### 2. Interior page width

`--measure: 68ch` exists in tokens and is not being applied. On `/serbisyo`,
`/turismo`, `/kontak` the container is ~1170px but text stops around 36ch,
leaving a dead right column on every page. It reads as a phone layout stretched
onto a desktop.

Either apply `--measure` properly, or give interior pages a real two-column grid
with a contextual sidebar (related services, office hours, sea state). Pick one
and apply it consistently across `src/views/*.astro`.

### 3. Port the card system to interior pages

`.mega-card`, `.mega-tile`, `.mega-row` and `.mega-feature` in
`src/styles/mega.css` are well-built and currently used only inside the
navigation panels.

Extract them into a shared layer (a new `src/styles/cards.css`, imported from
`globals.css` before `mega.css`) and use them in:

- `ServicesIndexView` — the bare link list is the worst offender
- `NewsView`, `ProjectsView`, `TourismView`, `BusinessView`, `FormsView`,
  `GalleryView`, `OfficialsView`, `FaqView`

One component vocabulary across menus and pages. Do not fork a second card.

### 4. Replace the quick-action tiles

`HomeView`'s four saturated blocks (navy / red / gold / black) sit directly under
a cinematic hero and are the worst adjacency on the site. Rebuild them in the
card language from step 3, with the icon + title + one-line description pattern
the panels already use.

### 5. Quiet the placeholder treatment

`src/components/Placeholder.astro` currently renders magenta dashed blocks that
are the loudest element on `/serbisyo` and `/kontak`. The audit value must
survive — keep `data-placeholder="true"` and the text, because
`scripts/check-placeholders.mjs` greps for them — but reduce it to a small
inline amber chip consistent with `SampleChip`.

### 6. Detail pass

- **Band alternation**: `--surface` #eff1ec vs `--surface-sunken` #dce6e0 is so
  subtle it reads as a rendering artifact. Either raise the contrast or drop
  alternation in favour of whitespace and rules.
- **Interior page headers**: the `<h1>` floats alone in a ~220px empty band.
  Give it a subtitle, a breadcrumb, or contextual meta.
- **Radius**: `--radius-md: 4px` is a leftover. Anything above form-control
  scale should use the 10–24px family the rest of the site uses.
- **`/kontak` chart band**: a 260px pale block containing a small island
  outline. Make it earn the height or shrink it.

---

## Acceptance criteria

Checkable, not subjective:

- [ ] `npx astro check` — 0 errors
- [ ] `npx playwright test` — 398/398 pass
- [ ] `npm run build && npm run check:no-demo` — production gate passes
- [ ] No `#1f6796` or other blue remains as an interactive colour, in either theme
- [ ] Red appears only on emergency affordances
- [ ] No interior page has text narrower than 60ch at ≥1200px viewport
- [ ] `/serbisyo`, `/balita`, `/turismo`, `/proyekto` use the same card component
      as the mega panels
- [ ] Homepage LCP still < 2.5s, CLS < 0.05
- [ ] Every new colour pair has its measured ratio written in a comment beside it

---

## Traps — these have already cost time once

1. **`backdrop-filter` creates a containing block for `position: fixed`
   descendants.** This collapsed the full-page menus to an 88px strip. If you
   add glass anywhere with fixed children, put the filter on a `::before`.
2. **`.mainnav` sets `white-space: nowrap`, and it inherits.** Any new panel
   content needs `white-space: normal` or paragraphs run across columns.
3. **Collapsed `<details>` content is in the DOM.** Several tests scope to
   `main` because unscoped `.first()` matchers were resolving to hidden copies
   in the header. Any new site-wide component repeating page content will hit
   this — scope the test, don't delete it.
4. **The two dark-mode token blocks are separate.** A token added to one and not
   the other fails only in dark mode, which the axe suite does test.
5. **Do not put a webfont on the public site** to chase "Inter". The font budget
   is 100KB and 72.2KB is used. The admin uses Inter via a system stack with no
   download; do the same if you want it.

---

## Honest note on "10/10"

**Roughly half the remaining gap is content, not CSS.** `/serbisyo`, `/kontak`
and `/turismo` are dominated by `[[NEEDS DATA]]` markers and empty states
because the barangay has not supplied fees, office hours, requirement lists or
tourism copy. No amount of design makes a page of placeholders look finished.

The CSS work above gets the site to a genuine 8.5–9. The last point needs the
Barangay Secretary to fill in `CONTENT-TODO.md`, or the `/admin` CMS to be used
to enter it. Design cannot close that gap and should not pretend to.
