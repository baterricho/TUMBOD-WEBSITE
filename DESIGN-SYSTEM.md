# DESIGN-SYSTEM.md
## Barangay Tumbod — Complete Design System

**Spec reference:** BUILD-PROMPT.md §9 (all 18 subsections)
**Depends on:** `DESIGN-PLAN.md`
**Status:** Specification only. Per the Phase 3 conflict resolution, the `/design-system` route is the **first artefact built in Phase 5**, before any page layout.

---

## 0. RULES THAT GOVERN EVERYTHING BELOW

1. **Three-tier tokens.** primitive (`--palette-*`, `--size-*`) → semantic (`--surface`, `--ink`) → component (`--btn-primary-bg`). **Components reference tier 2 or 3 only.** A raw hex or raw palette token inside a component is a lint error.
2. **No component sets its own outer margin.** Spacing is owned by layout primitives. Lint-enforced. This is the single rule that prevents the vertical-rhythm specificity collisions that break AI-built sites.
3. **Server Components by default.** `"use client"` requires a one-line justifying comment. Client components are leaves, never containers.
4. **Every component declares its byte cost** if it ships client JS.
5. **No component library.** No MUI, no Chakra, no shadcn shipped as-is.

---

## 1. COLOUR TOKENS

Full primitive table with physical sources and measured contrast: `DESIGN-PLAN.md` §2.2–2.3. Not duplicated here.

### 1.1 Semantic layer (light)

```css
:root {
  --surface:            #EFF1EC;   --surface-raised:    #F7F8F4;
  --surface-sunken:     #DCE6E0;   --surface-inverse:   #0B3B54;

  --ink:                #12211B;   --ink-muted:         #3D5145;
  --ink-inverse:        #EFF1EC;

  --line:               #C3CFC7;   --line-strong:       #8AA096;

  --accent:             #F5B301;   --accent-ink:        #12211B;

  --interactive:        #1F6796;   --interactive-hover: #17527A;
  --interactive-visited:#5B4A7A;
  --focus-ring:         #B3160C;

  --sea-calm:      #16697A;  --sea-calm-ink:      #FFFFFF;
  --sea-moderate:  #F5B301;  --sea-moderate-ink:  #12211B;
  --sea-rough:     #E2711D;  --sea-rough-ink:     #12211B;
  --sea-dangerous: #D6382B;  --sea-dangerous-ink: #FFFFFF;

  --status-open:    #16697A; --status-closed:  #6B7A72; --status-limited: #E2711D;

  --alert-info:      #1F6796; --alert-advisory:  #F5B301;
  --alert-warning:   #E2711D; --alert-emergency: #B3160C;

  --chart-contour-1: #DCE6E0;  --chart-contour-2: #B9CFD4;
  --chart-contour-3: #8FB4C1;  --chart-contour-4: #4E7E95;
  --chart-contour-5: #0B3B54;

  --error-ink: #A82318;
}
```

### 1.2 Dark

Applied via `@media (prefers-color-scheme: dark)` **and** `:root[data-theme="dark"]`, with the attribute winning in both directions.

```css
--surface: #0C1614;  --surface-raised: #14211D;  --surface-sunken: #081110;
--ink: #E4EAE4;      --ink-muted: #9FB0A6;       --ink-inverse: #0C1614;
--line: #2C3A34;     --line-strong: #4A5E54;
--interactive: #6FB3DC;  --interactive-hover: #96CBEA;
--focus-ring: #FF5A4D;
--alert-emergency: #E33F32;
--accent: #F5B301;                        /* survives unchanged */
/* contour bands invert: 1 = darkest, 5 = most luminous */
```

**Forbidden:** `filter: invert()`, reduced-opacity text as a dark-mode strategy, dimming the chart into a photograph.

### 1.3 Enforcement
- CI computes every foreground/background pair used in the built CSS and fails below 4.5:1 (body) / 3:1 (large, UI boundaries), **in both themes**.
- Lint rule `no-raw-color`: hex literals and `--palette-*` references are errors outside `lib/tokens/`.
- `--accent` and `--sea-moderate` are **fill-only**; a lint rule forbids them as `color`.

---

## 2. TYPOGRAPHY SCALE

Faces and rationale: `DESIGN-PLAN.md` §3.

```css
--font-display: "Archivo Narrow", system-ui, sans-serif;
--font-body:    "Source Sans 3", system-ui, sans-serif;
--font-mono:    "IBM Plex Mono", ui-monospace, monospace;

--text-2xs:  0.6875rem;  /* 11px — chart labels, legal. FORBIDDEN in body copy */
--text-xs:   0.75rem;    /* 12px — captions, timestamps */
--text-sm:   0.875rem;   /* 14px — secondary UI */
--text-base: 1rem;       /* 16px — MINIMUM for body, no exceptions */
--text-lg:   1.125rem;   /* 18px — lead */
--text-xl:   clamp(1.25rem, 1.0rem + 1.1vw, 1.5rem);
--text-2xl:  clamp(1.5rem, 1.2rem + 1.6vw, 2rem);
--text-3xl:  clamp(1.875rem, 1.4rem + 2.2vw, 2.75rem);
--text-4xl:  clamp(2.25rem, 1.6rem + 3.0vw, 3.75rem);   /* display only */

--leading-tight: 1.18;   /* display */
--leading-body:  1.6;
--tracking-display: -0.01em;
--tracking-caps:     0.06em;
--measure: 68ch;
```

**Named combinations** (components use these, never raw pairs): `--type-page-title`, `--type-section`, `--type-body`, `--type-body-strong`, `--type-caption`, `--type-figure`, `--type-chart-label`, `--type-alert`.

**The chart rule** (`DESIGN-PLAN.md` §1): utility classes `.is-land` (upright) and `.is-water` (italic). Applied only to place names, sea state, straits, depth, and boat routes.

---

## 3. SPACING SCALE

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--space-9: 96px;  --space-10: 128px;
```

**Vertical rhythm is owned by layout primitives only:**

| Primitive | Purpose |
|---|---|
| `<Stack gap>` | vertical flow, `gap` from the scale |
| `<Cluster gap align>` | horizontal wrap group |
| `<Section tone divider>` | page section; owns its top/bottom padding and its contour rule |
| `<Grid cols gap>` | the 4/8/12 responsive grid |
| `<Prose>` | measure-capped rich text, the **only** place descendant selectors set spacing |

**Homepage module separation is `--space-5` (24px) + a contour rule**, not `--space-7`. Per `DESIGN-PLAN.md` §9 item 13 — rules carry separation more cheaply than empty space and read as structure.

**Lint:** `margin-top` / `margin-bottom` / `margin-block` are errors in `src/features/**` and `src/components/ui/**`. Permitted only in layout primitives and `<Prose>`.

---

## 4. BORDER RADIUS

```css
--radius-none: 0;      /* chart elements, contour rules, table cells, dividers */
--radius-sm:   2px;    /* inputs, small controls */
--radius-md:   4px;    /* buttons, cards, tiles */
--radius-lg:   8px;    /* modal, sheet */
--radius-full: 9999px; /* pills, avatars only */
```

**Deliberately bimodal** (corrected in design self-critique §9.4): `0` for chart/data surfaces, `4px` for every touch control. Zero-everywhere is itself a flagged anti-pattern; the contrast between the two families is the intent.

---

## 5. ELEVATION

Charts do not float. Elevation is line weight and surface value.

```css
--elev-0: none;                                        /* flat, --line hairline */
--elev-1: 0 0 0 1px var(--line);                       /* raised surface + rule */
--elev-2: 0 0 0 1px var(--line-strong);                /* emphasised */
--elev-3: 0 8px 24px -8px rgb(18 33 27 / 0.28);        /* modal/sheet ONLY */
```

**One shadow token in the entire system.** No neumorphism, no glow, no coloured shadows.

---

## 6. MOTION

```css
--motion-fast: 120ms;  --motion-base: 200ms;  --motion-slow: 320ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-exit:     cubic-bezier(0.4, 0, 1, 1);
```

Animate `transform` and `opacity` only. The single orchestrated moment is the chart draw-in (`DESIGN-PLAN.md` §6).

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important; animation-iteration-count: 1 !important;
    transition-duration: 1ms !important; scroll-behavior: auto !important;
  }
}
```

**The `EmergencyBanner` never animates.**

---

## 7. FORM STYLES

- Touch height **≥44px**, 48px on primary and emergency actions. Font 16px (prevents iOS zoom). Border 1px at ≥3:1. `--radius-sm`.
- **Label always visible above the field.** Placeholder-as-label is forbidden.
- Required marked with the word `(kailangan)`, not an asterisk alone.
- Help text below label, before input. Errors below input: icon + `--error-ink` + `aria-describedby`.
- On submit: error summary at top, focus moved to it, each item a link to its field.
- Success is a **page-level state with a reference number**, never a toast.
- Autosave to `localStorage`, debounced 500ms. Validate on blur, never on keystroke.

---

## 8. NAVIGATION PATTERNS

- **Header:** sticky, 56px, compact state on scroll. seal 32px + wordmark · **Emergency button (always, every breakpoint)** · language toggle · menu.
- **Emergency button** is a header element, not a FAB — it never covers content. Second tab stop after the skip link.
- **Primary nav, 5 max:** Ngayon · Serbisyo · Balita · Ligtas · Higit pa.
- **Language toggle is a link** to the mirrored URL, not JS state. Preserves the current page.
- **Breadcrumbs** below depth 1, with `BreadcrumbList` JSON-LD.
- **Footer is the full sitemap** — it is how low-literacy and screen-reader users navigate. Not four links.
- `scroll-padding-top: 72px` so the sticky header never obscures a focus target (WCAG 2.2 §2.4.11).

---

## 9. CARD PATTERNS — EXACTLY FOUR

No generic `<Card>{children}</Card>`. Named, typed, purpose-built. A fifth requires written justification.

| Component | Contents |
|---|---|
| `AnnouncementCard` | category chip · title · date · 2-line excerpt · optional thumbnail |
| `ServiceCard` | icon · name · fee (mono) · processing time · "Tingnan ang requirements" |
| `PersonCard` | photo or initials · name w/ honorific · position · committee · term |
| `DocumentCard` | type icon · number (mono) · title · plain summary · format + size · download |

---

## 10. `Timeline`

Vertical at **every** breakpoint — horizontal timelines are unreadable. Used for project status, request tracking, ordinance history, disaster log.

States: `done` (filled node, `--sea-calm`) · `current` (ringed, `--accent`) · `upcoming` (hollow, `--line-strong`) · `blocked` (`--sea-rough` + icon). Each node: date (mono), label, optional responsible party. State conveyed by **shape + colour + label**, never colour alone.

---

## 11. `Alert`

Four levels — colour **and** icon **and** leading word:

| Level | Word | Token | Role |
|---|---|---|---|
| info | **Paalala** | `--alert-info` | `role="status"` |
| advisory | **Abiso** | `--alert-advisory` | `role="status"` |
| warning | **Babala** | `--alert-warning` | `role="alert"` |
| emergency | **Emergency** | `--alert-emergency` | `role="alert"` |

Carries issued timestamp and expiry. Dismissible **only** at `info`; dismissal remembered per alert ID.

---

## 12. `EmergencyBanner`

Distinct from `Alert`. Site-wide, **above the header**, on every page when an active emergency exists. **Not dismissible.**

Contains: level · one-sentence Filipino instruction · issued time (relative + absolute, Asia/Manila) · `tel:` link.

- **Server-rendered** — appears without JS.
- **Service-worker cached** — survives loss of signal.
- When served from cache: explicit staleness line — *"Baka may bago nang abiso — tumawag sa hotline."* **Never presented as current.**
- Never animates in.
- `--palette-signal-red` with white text (6.95:1).

---

## 13. `ServiceRequirementChecklist` — the most important component

Renders a document's requirements as an interactive checklist.

- **`localStorage` persistence** per service — a resident gathers documents over several days across sessions.
- Shows fee (mono), processing time, office hours, responsible officer by name.
- **Print stylesheet** → clean one-page list.
- **"Kopyahin ang listahan"** → plain text for pasting into Messenger, because that is how it will actually be shared.
- Progress is text (`3 sa 5 handa na`), not a bar alone.
- Works fully without JS: renders as a static list; checkboxes are progressive enhancement.
- **Client JS budget: ≤3 KB.**

---

## 14. `OfficialProfile`

Photo, or a **dignified typographic initials placeholder** — never a grey silhouette. Name + honorific, position, committees, term start/end, contact per privacy default (office line only).

Variants: `compact` (roster grid), `full` (profile page). Emits `Person` JSON-LD.
**Renders nothing if `photoConsent !== true`** — falls back to initials. Enforced in the component, not only the CMS.

---

## 15. `Ordinance`

Number (mono) · type · title · **plain-language one-line summary (required — cannot publish without it)** · date enacted · status (`in force` / `amended` / `repealed`) · links to amending documents · PDF with size.

---

## 16. `DocumentDownload`

Type icon · human title · filename · format · **size in KB declared before the tap** · last updated · download action. On metered data this is not a nicety. Served with `Content-Disposition` and a sane filename.

---

## 17. ADDITIONAL COMPONENTS

| Component | Notes | Client JS |
|---|---|---|
| `SeaConditionIndicator` | colour + Filipino word + icon + wave height. Provenance line always. `.is-water` italic | 0 |
| `BoatStatusRow` | route · departure (mono) · status · **`statusReason`** distinguishing PCG sailing ban from sea conditions (`RESEARCH.md` §8A) | 0 |
| `OfficeStatusBadge` | open/closed/limited computed from hours + holidays, Asia/Manila | 0 |
| `LivingChartHeader` | the signature element; ≤12 KB SVG; collapses on scroll | ≤2 KB |
| `LanguageToggle` | anchor to mirrored URL | 0 |
| `OfflineIndicator` | calm band, shows cache timestamp | ≤1 KB |
| `LastUpdated` | relative + absolute + timezone; staleness warning past threshold | 0 |
| `PurokBadge` · `CategoryChip` | — | 0 |
| `Pagination` | real `<a>` elements, works without JS | 0 |
| `SearchField` | index lazy-loaded on focus, ≤25 KB gz; degrades to server-rendered results | ≤4 KB |
| `EmptyState` · `ErrorState` | give direction and a human to contact, never apology | 0 |
| `CountdownToEvent` | text, not animation | ≤1 KB |
| `Skeleton` | **used sparingly** — a fast page needs none | 0 |

---

## 18. COMPONENT CONTRACT

Every component ships with:

1. TypeScript prop interface, **no `any`**, required vs optional documented
2. Light **and** dark rendering
3. Defined **empty**, **error**, and **loading** states — or an explicit note that it is server-rendered and has none
4. Keyboard operability and an accessible name
5. A `/design-system` entry showing every state
6. Declared client-JS byte cost (0 where server-only)
7. TSDoc stating purpose and any non-obvious constraint
8. Filipino strings resolved from `lib/i18n/` — **never inline**

---

## 19. `/design-system` ROUTE

First artefact built in Phase 5. Renders every token and component in **light + dark** at **320 / 360 / 768 / 1280px**. Excluded from `sitemap.xml`, `noindex`. It is the source of truth: if a pattern is not there, it does not exist.

---

**END — DESIGN-SYSTEM.md**
