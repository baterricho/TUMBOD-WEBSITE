# A11Y-PLAN.md — WCAG 2.2 Level AA

**Spec reference:** BUILD-PROMPT.md §21
**Target:** zero axe violations, Lighthouse a11y 100. Merge blocker, not a warning.

---

## 1. BASELINE

Semantic HTML first; ARIA only where HTML cannot express it. One `<h1>` per page, no skipped levels. Real landmarks: one `<header>`, `<nav aria-label>` per region, `<main id="main">`, `<aside>`, one `<footer>`. **Skip link is the first focusable element.**

---

## 2. FOCUS ORDER — FIRST FIVE STOPS (every page)

1. Skip to content
2. **Emergency button** — deliberate; the most important control is reachable in two keystrokes
3. Seal / home
4. Language toggle
5. Menu trigger

`scroll-padding-top: 72px` so the sticky header never obscures a focus target.

---

## 3. WCAG 2.2 ADDITIONS — EXPLICIT HANDLING

| Criterion | How it's met |
|---|---|
| **2.4.11 Focus Not Obscured (Min)** | `scroll-padding-top`; sheets trap focus and never overlap the focused element |
| **2.4.13 Focus Appearance** | 2px `--focus-ring` (`#B3160C` / `#FF5A4D` dark), ≥3:1 against both component and background |
| **2.5.7 Dragging Movements** | Nothing requires dragging. The purok map is tap/click **and** keyboard-selectable |
| **2.5.8 Target Size (Min)** | 24px is the floor; **this project mandates 44px**, 48px on emergency and primary |
| **3.2.6 Consistent Help** | Emergency affordance in the same header position on every page, every breakpoint |
| **3.3.7 Redundant Entry** | Multi-step forms carry values forward; never ask twice |
| **3.3.8 Accessible Authentication** | Admin login permits paste, supports password managers, no cognitive-function test |

---

## 4. PER-COMPONENT BEHAVIOUR

| Component | Keyboard | Screen reader |
|---|---|---|
| `EmergencyBanner` | not focusable itself; `tel:` link is | `role="alert"`, announced on load |
| Emergency sheet | Esc closes, focus trapped, returns to trigger | `role="dialog"` + `aria-modal`, labelled |
| `LivingChartHeader` | collapse toggle is a `<button>` | `role="img"` + Filipino label; **every value also present as a `<dl>`** |
| `SeaConditionIndicator` | — | colour + word + icon; word is the accessible name |
| `ServiceRequirementChecklist` | native checkboxes | `aria-describedby` for notes; progress announced as text |
| `Timeline` | — | `<ol>`; state in the accessible name, not colour |
| `Alert` | dismiss is a `<button>` (info only) | `role="status"` / `role="alert"` by level |
| `Pagination` | native `<a>` | `aria-current="page"` |
| `SearchField` | `↑↓` results, Esc clears | `role="combobox"`, `aria-expanded`, live result count |
| `LanguageToggle` | native `<a>` | `hreflang` + `lang` on the link |
| `OfficeStatusBadge` | — | status word, not colour |

---

## 5. LANGUAGE

`lang="fil"` on the Filipino tree, `lang="en"` on `/en/*`. Any inline foreign-language span carries its own `lang`. Filipino content **must be announced in Filipino** — this is why partial-language pages are forbidden.

---

## 6. COLOUR & MEANING

**Colour never carries meaning alone.** Sea state = colour + word + icon (+ metres). Alerts = colour + icon + leading word. Timeline = shape + colour + label. Office status = word + dot.

Contrast verified programmatically in CI in **both** themes. See `DESIGN-SYSTEM.md` §1.3.

---

## 7. MOTION

`prefers-reduced-motion: reduce` → all durations 1ms, chart renders final state. No parallax, no scroll-linked effects, no autoplay, nothing flashing (nothing flashes at all).

---

## 8. TESTING GATES

| Gate | Tool | Threshold |
|---|---|---|
| Automated, every route | axe-core in CI | **0 violations — merge blocker** |
| Lighthouse a11y | CI | **100** |
| Contrast pairs, both themes | custom CI script | AA |
| Keyboard walkthrough | manual, documented per release | every page |
| **TalkBack / Chrome Android** | manual | home, `/ligtas`, one service page — **this is what a resident actually uses** |
| NVDA / Firefox | manual | same three |
| VoiceOver / Safari iOS | manual | same three |
| 200% zoom | manual | no loss of content or function |
| Greyscale print | manual | `/ligtas` remains fully usable |

---

## 9. KNOWN RISKS

1. **The chart is the hardest a11y surface.** Mitigation: it is decorative-with-parallel-text by design — the `<dl>` is authoritative, the SVG is illustration. If the parallel text ever drifts from the SVG, that is a P0 bug.
2. **Filipino screen-reader voice support varies.** Test on real TalkBack rather than assuming.
3. **Low literacy is not a WCAG criterion** but is a real constraint here (P7). Grade-6 reading level and icon+word pairing are held as project requirements even though no automated check enforces them.
