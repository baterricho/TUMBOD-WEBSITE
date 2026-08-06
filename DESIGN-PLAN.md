# DESIGN-PLAN.md
## Barangay Tumbod Official Website — Phase 3 Design Plan

**Spec reference:** BUILD-PROMPT.md §8, §10, §11, §12
**Depends on:** `RESEARCH.md` (2026-08-04)
**Status:** Awaiting GATE 2 approval. No application code exists.
**Self-critique:** appended at §9. Round 1 complete; three items were redesigned as a result.

---

## 0. EVIDENCE DECLARATION — READ THIS FIRST

Spec §8.2 requires every colour to trace to §3.1B Facebook photo extraction **or** to a documented physical referent in Malampaya Sound. **The Facebook extraction failed** (`RESEARCH.md` §5.1) and `FACEBOOK-EXTRACTION-WORKSHEET.md` is unfilled.

This plan therefore proceeds on the **second permitted basis**: documented physical referents, each stated beside its hex. This is the `DISCOVERY-QUESTIONS.md` Part D fallback, chosen explicitly rather than by drift.

**What this costs:** the palette is sourced from the *place* rather than from *the barangay's own imagery*. It satisfies §8.2's sourcing rule and the "if it looked good, it's out" test. It does not satisfy the stronger claim that the colours are already familiar to residents.

**Remediation, committed:** when the worksheet is filled, I re-run k-means extraction, compare against this palette, and publish the diff. Tokens are semantic (§9.1 of the design system), so a palette swap is a values change in one file — not a redesign. This is recorded as a launch-review item in `CONTENT-TODO.md`.

**Voice** is likewise written from general Philippine barangay register rather than from Tumbod's own posts, and **every Filipino string is a launch-blocking review item for the Barangay Secretary.**

---

## 1. THE CONCEPT — *THE WORKING CHART*

Research changed this from a metaphor into a description.

**Tuluran Island is Tumbod.** It is a barrier island, 6.4 × 3.2 km, lying across the mouth of Malampaya Sound, creating the Sound's two entrance channels: **Blockade Strait** (1.1 km, west) and **Endeavor Strait** (0.2 km, east).

Barangay Tumbod is **the gate of the Sound**. Every vessel entering one of the Philippines' richest fishing grounds passes on one side of this barangay or the other.

That means a nautical chart is not a stylistic choice applied to the place. It is **the correct projection of the place** — the only document type that renders a barrier island and its straits as what they are. A road-map header would be a category error; there are no roads to draw. A hero photograph would show one beach and hide the geography that defines the barangay's entire existence.

**The register we are borrowing:** a chart in use. Not a decorative antique map — a working instrument. Charts are precise, legible in bad light, printed in flat inks, annotated in the margin by the person navigating, and they encode danger without drama. That is exactly the tone an island barangay in a typhoon corridor should take with its own residents.

**One true detail we are stealing:** real hydrographic charts set **land features upright and water features in italic**. We adopt this. Place names, the barangay, the hall, the puroks — upright. The sea, the straits, depth, sea state, boat routes — italic. It is invisible as a rule and unmistakable as a texture, and no other barangay site will have it because no other barangay site is a chart.

**The structural test (§8.1):** delete the chart and the following break — section dividers (contour rules), table rule weights (chart line weights), the `LastUpdated` treatment (margin annotation), the Contact map pin, the OG image system, the sea-state scale, and the entire land/water italic rule. The identity is load-bearing. It is not a background texture.

---

## 2. COLOUR

### 2.1 The organising idea

Two colour families, doing two different jobs, both taken from the physical world of the Sound:

1. **The chart** — paper, shallows, deep water, mangrove. Cool, desaturated, quiet. This is the *substrate*: surfaces, ink, rules, contours.
2. **The bangka** — hardware-store paint on hulls and outriggers. Yellow, sky blue, hot red. Unhesitating, unfashionable, high-chroma. This is the *signal*: accent, sea-state scale, alerts.

The reason this works, and the reason it is specific to Tumbod: **on this island, those bright paint colours are already the local language of "look at this."** They are what you see across water at distance. So the warning scale on the website is painted in the same colours as the boats. The escalation from calm to dangerous runs through the actual palette of a Palawan *bangka*.

That is one idea doing two jobs, which is what a design system is supposed to be.

### 2.2 Primitives — every hex with its physical source

| Token | Hex | Physical referent | Role |
|---|---|---|---|
| `--palette-glare` | `#EFF1EC` | Bleached sand and noon glare on Malampaya; the sky–water boundary that goes almost white. Cool, faintly green — **deliberately not warm cream** | primary surface |
| `--palette-paper-raised` | `#F7F8F4` | Chart paper held to the light | raised surface |
| `--palette-shoal` | `#DCE6E0` | Pale green-grey of shallow water over seagrass; the shallow tint on hydrographic charts | sunken surface |
| `--palette-mangrove` | `#12211B` | Mangrove in shadow — green so dark it reads black | primary ink |
| `--palette-mangrove-wet` | `#3D5145` | The wet olive of mangrove roots exposed at low tide | muted ink |
| `--palette-sound-deep` | `#0B3B54` | Deep water of the Outer Sound; deepest contour band | inverse surface, dark mode base |
| `--palette-hull-blue` | `#2E7FB8` | Sky blue painted on *bangka* hulls | chart line work, decorative only |
| `--palette-hull-blue-ink` | `#1F6796` | The same blue, darkened to carry text | interactive |
| `--palette-bangka-yellow` | `#F5B301` | Hardware-store yellow on outrigger booms | accent, **fill only** |
| `--palette-bangka-orange` | `#E2711D` | Orange hull stripe | escalation step |
| `--palette-bangka-red` | `#D6382B` | Hot red hull stripe | escalation step |
| `--palette-signal-red` | `#B3160C` | Deeper, more saturated — **reserved for emergency alone** | emergency |
| `--palette-red-ink` | `#A82318` | Bangka red darkened to carry text on paper | error text |

### 2.3 Measured contrast

Computed against `--palette-glare` (`#EFF1EC`). **CI must verify these; they are not decorative claims.**

| Pair | Ratio | Verdict |
|---|---|---|
| mangrove ink on glare | **14.67:1** | ✅ far exceeds AA |
| mangrove-wet on glare | **7.40:1** | ✅ muted text safe |
| hull-blue-ink on glare | **5.30:1** | ✅ links safe |
| red-ink on glare | **6.32:1** | ✅ error text safe |
| signal-red on glare | **6.10:1** | ✅ |
| white on signal-red | **6.95:1** | ✅ emergency banner safe |
| mangrove ink on bangka-yellow | **9.01:1** | ✅ yellow fill + dark text |
| mangrove ink on bangka-orange | **5.26:1** | ✅ |
| white on bangka-red | **4.70:1** | ✅ (fill + white text) |
| white on sea-calm `#16697A` | **6.23:1** | ✅ |
| **bangka-yellow as text on glare** | **1.63:1** | ❌ **forbidden — yellow is fill-only, never text** |
| **bangka-red as text on glare** | **4.13:1** | ❌ **fails AA — use `--palette-red-ink` for red text** |

Those last two rows are why the palette has thirteen primitives instead of nine. The honest bangka colours are gorgeous and several of them **cannot legally carry text**. Rather than desaturate them into tastefulness — which would betray the whole sourcing argument — they are restricted to fills, and darkened siblings carry the text.

### 2.4 The sea-state scale — painted in boat colours

| State | Filipino | Fill | Text on fill | Icon | Escalation logic |
|---|---|---|---|---|---|
| calm | **MAHINAY** | `#16697A` sea-calm | white, 6.23:1 | flat water | clear water over seagrass |
| moderate | **KATAMTAMAN** | `#F5B301` bangka-yellow | ink, 9.01:1 | low chop | boat yellow |
| rough | **MALAKAS** | `#E2711D` bangka-orange | ink, 5.26:1 | high chop | boat orange |
| dangerous | **DELIKADO** | `#D6382B` bangka-red | white, 4.70:1 | breaking wave | boat red |

**Never colour alone** (§8.2, persona P7 "Ka Ben"): every state renders **colour + Filipino word + icon**, and wave height in metres where known. A person who cannot read the word still gets the icon and the escalation; a person who cannot distinguish the colours still gets the word.

### 2.5 Semantic layer

Components consume **only** these. A raw `--palette-*` token inside a component is a lint error (§32).

```
--surface: glare              --surface-raised: paper-raised
--surface-sunken: shoal       --surface-inverse: sound-deep
--ink: mangrove               --ink-muted: mangrove-wet        --ink-inverse: glare
--line: #C3CFC7               --line-strong: #8AA096
--accent: bangka-yellow       --accent-ink: mangrove
--interactive: hull-blue-ink  --interactive-hover: #17527A     --interactive-visited: #5B4A7A
--focus-ring: #B3160C         (signal-red — always visible against both surface families)
--sea-calm / -moderate / -rough / -dangerous     per §2.4
--status-open: #16697A        --status-closed: #6B7A72         --status-limited: #E2711D
--alert-info / -advisory / -warning / -emergency
--chart-contour-1 … -5        (glare → sound-deep, five bands)
```

**Emergency red is reserved.** `--palette-signal-red` appears in exactly two places: the `EmergencyBanner` and the focus ring. Nowhere else, ever, as decoration. Using the same red for focus is deliberate — on a site whose most important function is emergency information, the keyboard focus indicator being *that* red is a small, consistent argument that the site takes attention seriously.

### 2.6 Dark mode — not an inversion

Night use is real: brownouts, pre-dawn departures, typhoon nights, an evacuation centre at 2 a.m.

```
--surface: #0C1614            (mangrove, lifted off pure black)
--surface-raised: #14211D     --surface-sunken: #081110
--ink: #E4EAE4                --ink-muted: #9FB0A6
--line: #2C3A34               --line-strong: #4A5E54
--interactive: #6FB3DC        (hull blue lightened for dark surfaces)
--accent: #F5B301             (unchanged — it survives)
--alert-emergency: #E33F32    (signal-red lightened; must stay unmistakable at low screen brightness)
```

Chart contours **invert to luminous line work on dark** — a lit chart table, not a dimmed image. Contour bands run pale-to-deep in reverse. Emergency red is *lightened rather than dimmed*, because a screen at minimum brightness in a dark room must still make it unmistakable.

**Forbidden and checked in review:** CSS `filter: invert()`, reduced-opacity text, and any treatment that makes the chart look like a photograph at night.

---

## 3. TYPOGRAPHY

Three roles. Self-hosted, WOFF2, subset to Latin + Filipino diacritics + the punctuation and figures actually used. **Target total ≤ 100 KB** (§8.3) — measured, not estimated, in Phase 5.

| Role | Face | Weights | Why this face belongs here |
|---|---|---|---|
| **Display** | **Archivo Narrow** (SIL OFL, Omnibus-Type) | 600 | A grotesque drawn for signage and small-space labelling — the same job chart lettering does. Condensed without being a fashion statement, and it holds its shape at poster size on the emergency banner. |
| **Body** | **Source Sans 3** (SIL OFL, Adobe) | 400, 600 | Complete Filipino diacritic coverage, high x-height, drawn for UI legibility. It survives a cracked 4-year-old LCD at 16px, which is the actual test (persona P1). |
| **Figures** | **IBM Plex Mono** (SIL OFL, IBM) | 400 | Slashed zero, unambiguous `1/l/I`, true tabular figures. Fees, ordinance numbers, boat departures, reference numbers, coordinates and depth soundings all need to align in a column and be read aloud over a phone. |

**Deliberately rejected:** Inter (SaaS default), Public Sans (US-government default — on-the-nose and sterile), any editorial serif (§8.3 explicitly steers away), Bebas/Anton (no lowercase, no diacritics).

**Subsetting plan:** IBM Plex Mono is subset to **digits, currency, punctuation and uppercase only** — it never sets prose, so the payload is tiny. Archivo Narrow is one weight. Source Sans 3 carries both text weights and the full diacritic set. Only Source Sans 3 400 is preloaded.

**Scale** — `clamp()`-based tokens, per §8.3. `--text-base` is **16px and never smaller**; `--text-2xs` (11px) is restricted to chart labels and legal metadata and is forbidden in body copy by lint.

**The chart rule:** land upright, water italic (§1). Applied to `SeaConditionIndicator`, `BoatStatusRow`, strait names, depth labels, and nothing else. Filipino runs longer than English — every layout is tested with the Filipino string, which is canonical.

---

## 4. LAYOUT

### 4.1 Principle

**360px is the design, desktop is the adaptation.** DOM order is identical at every width; desktop is achieved with grid placement, never reordered markup, so screen-reader reading order matches the visual order everywhere (§12.4).

**Density is respectful** (§10.4). Residents are looking for answers, not breathing room, and they are paying for the bytes. Where the default instinct says "add whitespace," this design adds another answer. This is the single most-violated rule in AI-generated layouts and it is checked explicitly in the self-critique.

### 4.2 The annotation margin — desktop only

A real chart carries its legend, scale bar, and hand annotations in the margin. At ≥1024px, an 3-column margin carries exactly that: `LastUpdated` stamps, data provenance ("Basa noong 5:00 AM · PAGASA"), the chart legend, and section markers. It is never used for decoration, related-content upsell, or advertising. At <1024px the annotations collapse inline beneath their content — they do not disappear, because provenance is not optional.

### 4.3 Grid

4 columns ≤480px · 8 columns 481–1023px · 12 columns ≥1024px. Max content 1200px. Prose measure capped at 68ch regardless of container. **No horizontal page scroll from 320px up** — tables scroll inside their own container with a visible affordance.

### 4.4 First-viewport budget at 360×640

Spec §12.2 requires modules 1–3 to fit without scrolling. Measured allocation:

| Element | Height |
|---|---|
| Sticky header incl. emergency button | 56px |
| Living Chart strip | 132px |
| Sea condition block | 96px |
| Next boat row | 72px |
| Office status | 56px |
| **Total** | **412px** |

Leaves **228px** of quick-action tiles visible below — which doubles as the scroll affordance. The "today" answer is complete before any scrolling, with room to spare. If the `EmergencyBanner` is active it pushes the office status below the fold; that is correct behaviour, because during an emergency the emergency *is* the answer.

---

## 5. THE SIGNATURE ELEMENT — THE LIVING CHART HEADER

Confirmed from spec §11, now with real geography behind it.

**What it is:** a compact bathymetric strip rendering **Tuluran/Tumbod's actual coastline** from OpenStreetMap (ODbL, attributed in the legend), with depth bands from GEBCO, both straits named and drawn to relative scale, and the barangay marked with a real chart pin. Overlaid in margin-annotation style: sea condition, wind, next boat.

**Why this specific drawing:** the island's silhouette with a 1.1 km channel on one side and a 0.2 km channel on the other is a shape that exists nowhere else. It is unmistakable, unfakeable, and it *is* the barangay. It is also functional — it shows, at a glance, why the answer to "can I travel" is a real question.

**Behaviour:** collapses on scroll to a single tappable line (sea state + next boat). Renders fully server-side from real geometry and last-known cached values. Live data hydrates progressively. **Useful with JavaScript disabled.**

**Accessibility:** `role="img"` with a Filipino label, and — critically — every value shown in the chart is *also* present as text in an adjacent definition list. A screen-reader user receives the sea condition as words, not as a description of a picture.

**Budget:** ≤12 KB gzipped inline SVG, Douglas–Peucker simplified at a recorded tolerance. No map library, no tiles, no JS to render.

**Honesty constraint (§3.2):** GEBCO's ~450 m grid is coarse for a 6.4 km island. If the depth bands prove too blunt to be truthful, **the legend states the depth motif is stylised** and no numeric soundings are printed. We draw real coastline always; we print depth numbers only if we have real ones.

**Purok wayfinding** stays demoted to About → Geography and Contact, not primary navigation — map-as-nav would cost Marilou (P1) taps she is paying for.

---

## 6. MOTION

**One orchestrated moment, CSS only, no libraries.**

On first homepage load in a session, the chart's contour lines draw in by `stroke-dashoffset`, staggered by depth band, ~700 ms total, and the Tumbod pin lands last. Once. Not on scroll, not on repeat visits (`sessionStorage` flag).

It earns its place because it *narrates the geography* — the contours resolve outward and the island emerges as the thing between two channels. It teaches the shape in under a second, then never plays again.

Everything else is functional: 120ms hover/focus/press, 200ms disclosure, 320ms sheet. `transform` and `opacity` only.

`prefers-reduced-motion: reduce` → all durations to 1ms, chart renders in final state immediately. There is no parallax or scroll-linked effect to disable, because none exists. **The emergency banner never animates in** — it must simply be there.

---

## 7. PHOTOGRAPHY

**Launch position: zero photographs.** No usable licensed imagery is confirmed (`DISCOVERY-QUESTIONS.md` N6), and **zero stock photography** is permitted — a generic tropical beach on this site would be a lie about a working island.

Instead: chart-based and typographic compositions. Consistent with the concept, dramatically cheaper, and honest.

When real photos arrive: `alt` in Filipino describing what is shown, explicit dimensions, AVIF with WebP fallback, lazy below fold, **one** `fetchpriority="high"` per route, EXIF/GPS stripped on upload, and consent tracked per person.

**OG images** are generated at build from the chart motif and page title — never photographs. Small, honest, and they make every shared link visibly a Tumbod link.

---

## 8. COPY DIRECTION

Filipino first and canonical; English is a translation. Roughly Grade 6 reading level. Every Filipino string is a **launch-blocking Secretary review item** (§0).

- Buttons state outcomes: `Ipadala ang request`, `I-download ang ordinansa (PDF, 240 KB)`, `Tumawag sa hotline`. Never `Submit`, `Learn more`.
- Requirements are checkboxes a person can run down at their door before leaving.
- Empty states direct: *"Wala pang anunsyo ngayong buwan. Ang mga bagong abiso ay ipa-po-post dito at sa Facebook page ng barangay."*
- Provenance always: *"Basa noong 5:00 AM · PAGASA"*.
- **Zero civic boilerplate.** No "Welcome to the official website of…". The homepage opens with the sea state, because that is what the barangay would actually say to someone at the door.

---

## 9. SELF-CRITIQUE — ROUND 1 (spec §34.1)

Answered honestly. **Three items forced changes**, marked ⚠️.

**1. Could this design be for any other barangay?**
No. The chart is Tuluran's actual coastline between Blockade and Endeavor Straits — a silhouette unique on earth. The land-upright/water-italic rule comes from hydrography. The alert scale is painted in *bangka* colours. Swap in another barangay and the header becomes wrong, not merely re-skinned.

**2. Does the signature element encode something true, or is it texture?**
True, and load-bearing. Delete it and you lose section dividers, table rules, the `LastUpdated` treatment, the map pin, OG images, the sea-state scale, and the italic rule. Tested in §1.

**3. Does the palette match a forbidden default?**
Checked each: cream `#F4F1EA` + serif + terracotta — no, `#EFF1EC` is *cool and green-shifted*, deliberately not warm cream, and there is no serif and no terracotta. Near-black + acid green — no. Navy + gold "government blue" — no; `#0B3B54` appears as deep *water*, never as a brand banner, and there is no gold. Blue→purple gradient — none exist. Corporate teal — `#16697A` appears only as one step of a four-step warning scale, never as brand identity. **Pass.**

**4. Broadsheet with hairline rules and zero radius? Giant number + three stat cards + gradient? Bootstrap card grid?**
⚠️ **Partial fail on first pass, corrected.** My initial layout used `--radius-none` almost everywhere for "chart precision," which is itself the flagged broadsheet anti-pattern (§9.4). **Change made:** radius is now deliberately bimodal — `0` for chart elements, rules, and table cells; `4px` for every touch control. The contrast between the two is the point and it reads as intentional rather than austere. No stat-card wall (demographics are prose, §13.6). No gradients anywhere.

**5. Reproducing an LGU template?**
No seal on a gradient (seal is 32px in the header). No headshot marquee. No ribbon-cutting carousel. No "Message from the Punong Barangay" above the fold — it is offered on About as the prepared compromise for persona P2.

**6. Reproducing a SaaS template?**
No centred hero, no three feature cards with outline icons, no gradient CTA band, no testimonials, no pastel illustration. The quick-action tiles are a 2×2 of four — checked against "three feature cards" and they differ in count, purpose (navigation, not marketing), and treatment (no icon-in-circle, no card shadow).

**7. Does the first screen answer "what do I need to know today?" at 360×640 without scrolling?**
Yes — 412px of 640px, measured in §4.4, leaving the quick actions partly visible as scroll affordance.

**8. Does every homepage module serve a named persona?**
Chart/sea/boat → P1, P7. Office status → P1. Quick actions → P1. Announcements → P1, P6. Health outreach → P1. Emergency contacts → P1, P6, P7. Documents → P1. Calendar → P1, P4. Projects → P5, P2. Forms → P1. Facebook mirror → P1, P6. Intro → P5. **No orphans.**

**9. Can Marilou get a clearance requirement in two taps, under 150 KB, in Filipino?**
Tap 1: "Kumuha ng Clearance" quick action. Tap 2: lands on the checklist, which is the first thing on the page. `/serbisyo/[slug]` budget is 70 KB. Yes.

**10. Can Aling Fe post from her phone in five minutes?**
Designed for it (§16), and B6 confirms she is a real, named, willing person — so this is now a **timed test against her**, not a simulation.

**11. Is anything on `/ligtas` dependent on network, third party, or JS?**
No. Precache tier 1, static JSON fallback, server-rendered, no images required, print stylesheet that survives black-and-white photocopy.

**12. Is any number, name, or phone number invented?**
⚠️ **Yes — caught and fixed.** My first homepage wireframe carried `0999-XXX-XXXX` and `₱XX`, which are placeholder-shaped but were sitting in a document that could be read as a design decision. **Change made:** all wireframes now render placeholders in the mandated `[[NEEDS DATA: … ]]` form, and the sea state/wave heights shown are labelled `ILLUSTRATIVE ONLY` in the wireframe caption. No fabricated hotline, fee, schedule, or official name appears anywhere in this plan.

**13. Have I chosen density where a default aesthetic would choose whitespace?**
⚠️ **Fixed.** First pass used `--space-7` (48px) between homepage modules — comfortable, and it pushed emergency contacts below a second scroll. **Change made:** module spacing is `--space-5` (24px) with contour rules carrying the separation instead of empty space. Rules are cheaper than whitespace in vertical budget and more legible as structure. Roughly one extra module now fits per screen.

**14. Does it work in black-and-white photocopy and at 200% zoom?**
Photocopy: `/ligtas` print stylesheet uses rules, weight, and the escalation *word*, never colour alone — the sea-state scale survives greyscale because §2.4 mandates word + icon. 200% zoom: all layouts are `clamp()`/grid-based with no fixed heights on text containers; to be verified in Phase 5 testing.

**Verdict:** three defects found and corrected — radius monotony, invented-looking placeholders in wireframes, and default-whitespace vertical rhythm. A self-review that found nothing would have been an incomplete one (§34.1).

---

## 10. OPEN RISKS CARRIED INTO PHASE 4

1. **Palette provenance is second-tier** until the Facebook worksheet is filled (§0). Mitigated by semantic tokens.
2. **Precedent scan incomplete** (`RESEARCH.md` §5.3) — §35's anti-pattern list is asserted rather than derived from observed Philippine LGU practice. Recommend completing before Phase 5.
3. **GEBCO resolution** may force the depth motif to be declared stylised (§5).
4. **Boat-status maintainability** is unresolved pending blocking question B4 — if no human can keep it current, that row becomes a published schedule plus "confirm by calling," and the chart header's composition changes.

---

**END — DESIGN-PLAN.md**
