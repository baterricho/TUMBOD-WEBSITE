# FIGMA-SITE-FLOW-MAP.md

Site flow and interaction map for **Barangay Tumbod**, derived from the workspace.

Figma file: `xpugMgI9paPqA1VlCgCkvd` — https://www.figma.com/design/xpugMgI9paPqA1VlCgCkvd

Sources analysed: `src/pages/**`, `src/views/*.astro`, `src/components/SiteHeader.astro`,
`src/components/SiteFooter.astro`, `src/components/mega/*.astro`, `src/components/Hero.astro`,
`src/components/LocationMap.astro`, `src/components/ServiceRequirementChecklist.astro`,
`src/styles/mega.css`, `src/lib/i18n/{fil,en}.ts`, `IA.md`. Cross-checked against `dist/`.

**Supersedes `FIGMA-PROTOTYPE-FLOW.md`**, which described the primary nav as five items with
Kontak folded into "Higit pa". It is six: five mega panels plus a separate disclosure.

---

## 1. Master Screen / Frame Index

The Filipino tree is canonical. `/en/*` is a complete mirror with identical structure —
22 pages — and is listed once at the end rather than duplicated per row.

### 1.1 Primary screens

| # | Frame name | Route | View component |
|---|---|---|---|
| 01 | `Home Frame (/)` | `/` | `HomeView.astro` |
| 02 | `Safety Frame (/ligtas)` | `/ligtas` | `LigtasView.astro` |
| 03 | `Hotline Frame (/ligtas/hotline)` | `/ligtas/hotline` | `HotlineView.astro` |
| 04 | `Services Index Frame (/serbisyo)` | `/serbisyo` | `ServicesIndexView.astro` |
| 05 | `Service Detail Frame (/serbisyo/[slug])` | `/serbisyo/:slug` | `ServiceDetailView.astro` |
| 06 | `News Index Frame (/balita)` | `/balita` | `NewsView.astro` |
| 07 | `Article Frame (/balita/[slug])` | `/balita/:slug` | `ArticleView.astro` |
| 08 | `Events Index Frame (/kaganapan)` | `/kaganapan` | `EventsView.astro` |
| 09 | `Event Detail Frame (/kaganapan/[slug])` | `/kaganapan/:slug` | `ArticleView.astro` |
| 10 | `Contact Frame (/kontak)` | `/kontak` | `ContactView.astro` |

### 1.2 Secondary screens — reached via `Higit pa` and the footer

| # | Frame name | Route | View component |
|---|---|---|---|
| 11 | `Officials Frame (/opisyal)` | `/opisyal` | `OfficialsView.astro` |
| 12 | `Transparency Frame (/transparency)` | `/transparency` | `TransparencyView.astro` |
| 13 | `Projects Frame (/proyekto)` | `/proyekto` | `ProjectsView.astro` |
| 14 | `Forms Frame (/porma)` | `/porma` | `FormsView.astro` |
| 15 | `FAQ Frame (/faq)` | `/faq` | `FaqView.astro` |
| 16 | `About Frame (/tungkol)` | `/tungkol` | `AboutView.astro` |
| 17 | `History Frame (/kasaysayan)` | `/kasaysayan` | `HistoryView.astro` |
| 18 | `Vision Frame (/bisyon)` | `/bisyon` | `VisionView.astro` |
| 19 | `Tourism Frame (/turismo)` | `/turismo` | `TourismView.astro` |
| 20 | `Business Frame (/negosyo)` | `/negosyo` | `BusinessView.astro` |
| 21 | `Gallery Frame (/larawan)` | `/larawan` | `GalleryView.astro` |
| 22 | `Search Frame (/hanapin)` | `/hanapin` | inline in `pages/hanapin.astro` |

### 1.3 Utility screens

| # | Frame name | Route | Notes |
|---|---|---|---|
| 23 | `Offline Frame (/offline)` | `/offline` | `OfflineView.astro` — service-worker fallback |
| 24 | `Design System Frame (/design-system)` | `/design-system` | token gallery, not public nav |
| 25 | `Admin Frame (/admin)` | `/admin` | not public nav |

### 1.4 Dynamic route instances (real slugs in `dist/`)

- **Services (6):** `barangay-clearance`, `sertipiko-ng-indigency`, `sertipiko-ng-paninirahan`,
  `business-clearance`, `barangay-id`, `blotter-katarungang-pambarangay`
- **News (6):** `assembly-2026-07`, `bakawan-2026`, `clean-up-2026-07`, `daan-tapos-2026`,
  `medical-mission-2026-08`, `scholarship-2026`
- **Events (4):** `barangay-assembly-sample-2026-08-20`, `clean-up-sa-baybayin-sample-2026-09-02`,
  `libreng-bakuna-sample-2026-09-10`, `medical-mission-sample-2026-08-15`

Build one representative frame per dynamic route (05, 07, 09), not one per slug.

### 1.5 Not screens

- `/en/*` — 22-page mirror, identical structure. Model as a **variant/mode**, not 22 frames.
- `src/pages/search-index.json.ts` — JSON endpoint consumed by the search box.
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` — non-visual.

---

## 2. Interaction & Navigation Flow

### 2.0 GLOBAL CHROME — present on every frame 01–23

Wire these once per frame. Header is sticky (`Fix position when scrolling`).

- **Source Frame:** ALL (01–23)
  - **Trigger Element:** Skip link "Dumiretso sa nilalaman" (visible on keyboard focus only)
  - **Action Type:** On Click
  - **Destination Frame:** same frame, scroll to `#main`
  - **Transition:** Instant
  - **State / Condition:** Keyboard focus only — WCAG 2.4.1

- **Source Frame:** ALL
  - **Trigger Element:** Brand lockup — seal `BT` + "Barangay Tumbod / Taytay, Palawan"
  - **Action Type:** On Click → Navigate To
  - **Destination Frame:** `Home Frame (/)`
  - **Transition:** Instant
  - **State / Condition:** Default

- **Source Frame:** ALL
  - **Trigger Element:** Site clock (`#siteclock`)
  - **Action Type:** None — display only
  - **Destination Frame:** —
  - **Transition:** —
  - **State / Condition:** **JS available only.** With JS off it is `hidden` and no clock renders.
    Build two frame variants of the header, `Clock=On` / `Clock=Off`.

- **Source Frame:** ALL
  - **Trigger Element:** Language toggle "English"
  - **Action Type:** On Click → Navigate To
  - **Destination Frame:** the `/en` mirror of the current frame
  - **Transition:** Instant
  - **State / Condition:** Locale = Filipino. Reads "Filipino" when locale = English.

- **Source Frame:** ALL
  - **Trigger Element:** **EMERGENCY** button (red, always present, same position at every breakpoint)
  - **Action Type:** On Click → Navigate To
  - **Destination Frame:** `Hotline Frame (/ligtas/hotline)`
  - **Transition:** Instant
  - **State / Condition:** Default. **Not an overlay** — it is a plain link so it works with JS
    disabled and offline (`SiteHeader.astro` lines 6–14). Do not convert it to a sheet.

- **Source Frame:** ALL — five mega panel triggers
  - **Trigger Element:** Nav `Ngayon` / `Serbisyo` / `Balita` / `Ligtas` / `Kontak`
  - **Action Type:** On Click → Open Overlay
  - **Destination Frame:** `Overlay — Mega Ngayon` / `Mega Serbisyo` / `Mega Balita` /
    `Mega Ligtas` / `Mega Kontak`
  - **Transition:** Move In, Top, 120ms, Ease Out
  - **State / Condition:** Native `<details>`, so it works with **no JS**. `aria-current` marks
    the item when the current page belongs to that section.

- **Source Frame:** ALL
  - **Trigger Element:** Nav `Higit pa`
  - **Action Type:** On Click → Open Overlay
  - **Destination Frame:** `Overlay — Higit pa`
  - **Transition:** Move In, Top, 120ms, Ease Out
  - **State / Condition:** Native `<details>` disclosure, no JS

- **Source Frame:** ALL — footer, which is real navigation, not decoration (`IA.md` §3)
  - **Trigger Element / Destination:**
    `Mga Serbisyo` → 04 · `Mga Form` → 14 · `Kalendaryo` → 08 ·
    `Ligtas` → 02 · `Mga numerong pang-emergency` → 03 · `Saan lilikas` → 02 ·
    `BDRRMC` → 02 · `Tungkol sa Tumbod` → 16 · `Mga Opisyal` → 11 ·
    `Transparency` → 12 · `Kontak` → 10 · `Pahayag sa privacy` → unbuilt ·
    `Accessibility` → unbuilt
  - **Action Type:** On Click → Navigate To
  - **Transition:** Instant
  - **State / Condition:** Default

### 2.1 `Home Frame (/)`

- **Trigger:** Hero basemap disclosure `<summary class="hero__glassbtn">` →
  **Open Overlay** `Overlay — Basemap Picker`, Fade 100ms
- **Trigger:** Basemap buttons `Satellite` / `Street` (`aria-pressed`) →
  **On Click**, no navigation. **Smart Animate** between hero variants
  `Basemap=Satellite` / `Basemap=Street`. State: mutually exclusive, satellite default.
- **Trigger:** Hero zoom / locate icon buttons → **On Click**, no navigation, Smart Animate
- **Trigger:** Hero carousel `hero-prev` / `hero-next` chevrons → **On Click**,
  Smart Animate between hero slide variants. **State: JS available only** (`hidden` without JS).
- **Trigger:** Hero video button `hero-video-btn` → **On Click**, Smart Animate to
  `Hero/Video=Playing`. **State: JS available only.**
- **Trigger:** Sea-state band ("DAGAT NGAYON — MALAKAS") → **no action**. This is the answer,
  not a link. Sea condition is a **0-tap** requirement (`IA.md` §5).
- **Trigger:** Next-boat strip ("SUSUNOD NA BIYAHE") → **no action**
- **Trigger:** Office-status row ("BUKAS ANG OPISINA") → **no action**
- **Trigger:** Quick tile `Kumuha ng Clearance` → Navigate To
  `Service Detail Frame (/serbisyo/barangay-clearance)`, Instant
- **Trigger:** Quick tile `Emergency na numero` → Navigate To `Hotline Frame`, Instant
- **Trigger:** Quick tile `Biyahe ng bangka` → Navigate To `Safety Frame`, Instant
- **Trigger:** Quick tile `Mga Serbisyo` → Navigate To `Services Index Frame`, Instant
- **Trigger:** `Buong direktoryo →` → Navigate To `Hotline Frame`, Instant
- **Trigger:** `Lahat ng anunsyo →` → Navigate To `News Index Frame`, Instant
- **Trigger:** Any Anunsyo card (Ayuda / Kalusugan / Ordinansa) → Navigate To `Article Frame`, Instant
- **Trigger:** Document rows `Barangay Clearance` / `Sertipiko ng Indigency` /
  `Sertipiko ng Paninirahan` → Navigate To `Service Detail Frame`, Instant.
  **State: fees may render as the audited placeholder**, never a plausible-looking number —
  build a `Fee=Known` / `Fee=Placeholder` variant.
- **Trigger:** Any Kalendaryo row → Navigate To `Event Detail Frame`, Instant
- **Trigger:** Any Proyekto row → Navigate To `Projects Frame`, Instant
- **Trigger:** `Basahin ang kasaysayan →` → Navigate To `History Frame`, Instant
- **Trigger:** Search affordance → Navigate To `Search Frame`, Instant
- **Also linked from this view:** `/larawan` (21), `/opisyal` (11), `/transparency` (12),
  `/turismo` (19)

### 2.2 `Safety Frame (/ligtas)`

- **Trigger:** `Mga numerong pang-emergency` / hotline block → Navigate To `Hotline Frame`, Instant
- **State:** advisory banner present/absent — build `Advisory=None|Active` variants.
  Sea-state colour is driven by `color/sea-calm|moderate|rough|dangerous`.

### 2.3 `Hotline Frame (/ligtas/hotline)`

- **Trigger:** every phone-number row → `tel:` — **no prototype connection.**
  Name the layers `tel:` so this stays visible in the layer tree.
- Terminal frame. Exit is via global chrome only.

### 2.4 `Services Index Frame (/serbisyo)`

- **Trigger:** each of the 6 service rows → Navigate To `Service Detail Frame`, Instant
- **State:** `Fee=Known|Placeholder` per row

### 2.5 `Service Detail Frame (/serbisyo/[slug])`

- **Trigger:** breadcrumb `← Mga Serbisyo` → Navigate To `Services Index Frame`, Instant
- **Trigger:** requirement checkboxes (`ServiceRequirementChecklist.astro`) → **On Click**,
  no navigation, Smart Animate between `Checked=No|Yes`. **State: JS available only.**
- **Trigger:** `I-download ang porma` → Navigate To `Forms Frame`, Instant

### 2.6 `News Index Frame (/balita)`

- **Trigger:** any article card → Navigate To `Article Frame`, Instant
- **Trigger:** link to events → Navigate To `Events Index Frame`, Instant

### 2.7 `Article Frame (/balita/[slug])`

- **Trigger:** `← Balita` → Navigate To `News Index Frame`, Instant
- **Trigger:** related-event link → Navigate To `Events Index Frame`, Instant

### 2.8 `Events Index Frame (/kaganapan)`

- **Trigger:** any event card → Navigate To `Event Detail Frame`, Instant
- **Trigger:** link to news → Navigate To `News Index Frame`, Instant

### 2.9 `Event Detail Frame (/kaganapan/[slug])`

- **Trigger:** `← Kaganapan` → Navigate To `Events Index Frame`, Instant
- **Trigger:** `Balita` → Navigate To `News Index Frame`, Instant

### 2.10 `Contact Frame (/kontak)`

- **Trigger:** `Mga numerong pang-emergency` → Navigate To `Hotline Frame`, Instant
- **Trigger:** office phone numbers → `tel:` — no connection
- **Trigger:** `Load map` button (`#map-load`, `LocationMap.astro`) → **On Click**,
  Smart Animate to `Map=Loaded`. **State: JS available only**; the map is click-to-load
  so it costs nothing on a metered connection.
- **Trigger:** Directions / Satellite / View on OSM / Facebook → **external**, no connection

### 2.11 `Search Frame (/hanapin)`

- **Trigger:** search input `#q` → **On Change**, Smart Animate to `Results=Shown`.
  `onsubmit="return false"` — the form never submits and never navigates.
  **State: JS available.** Without JS the results list stays `hidden` and the
  full "Lahat ng pahina" directory below is the fallback — build `Results=Hidden` as default.
- **Trigger:** any result row, and any row in "Lahat ng pahina" → Navigate To that frame, Instant

### 2.12 `FAQ Frame (/faq)`

- **Trigger:** each question `<details>` → **On Click**, Smart Animate,
  `Answer=Collapsed|Expanded`. No JS required.
- **Trigger:** `Kontak` link → Navigate To `Contact Frame`, Instant

### 2.13 `Forms Frame (/porma)`

- **Trigger:** `Mga Serbisyo` → Navigate To `Services Index Frame`, Instant
- **Trigger:** form download links → external / file, no connection

### 2.14 `Projects Frame (/proyekto)`

- **Trigger:** `Transparency` → Navigate To `Transparency Frame`, Instant

### 2.15 `Tourism Frame (/turismo)`

- **Trigger:** sea/safety link → Navigate To `Safety Frame`, Instant

### 2.16 `Offline Frame (/offline)`

- **Trigger:** `Ligtas` → Navigate To `Safety Frame`, Instant
- **Trigger:** `Mga numerong pang-emergency` → Navigate To `Hotline Frame`, Instant
- **State:** shown by the service worker when the network is unavailable. `/ligtas/*` is
  precache tier 1, so those two destinations are guaranteed to resolve offline.

### 2.17 Terminal frames — global chrome only

`Officials (11)`, `Transparency (12)`, `About (16)`, `History (17)`, `Vision (18)`,
`Business (20)`, `Gallery (21)`. No unique outbound triggers.

---

## 3. Modals, Drawers & Overlays

There are **no modals and no JS drawers.** Every overlay is a native `<details>/<summary>`
disclosure and works with JavaScript disabled — a deliberate constraint (`ARCHITECTURE.md` §2).

**Shared geometry for the six header overlays** (`src/styles/mega.css` lines 111–118:
`position: fixed; inset: var(--header-h) 0 0; overflow-y: auto`):
width = frame width; top edge flush with the bottom of the nav row; bottom edge at the
bottom of the frame. It covers the whole viewport below the header. Overflow: vertical
scrolling. Fill `color/surface-raised`. Position: **Manual**. Close on click outside: **ON**.

| # | Overlay Frame Name | Trigger Element & Source Frame | Contents / outbound links | Close / Dismiss |
|---|---|---|---|---|
| O1 | `Overlay — Mega Ngayon` | Nav `Ngayon`, all frames | sea state → 02 · office hours → 10 | click outside · Esc · re-tap `Ngayon` |
| O2 | `Overlay — Mega Serbisyo` | Nav `Serbisyo`, all frames | 4 listed documents → 05 · "lahat ng serbisyo" → 04 · "Tingnan ang lagay ng dagat" → 02 · "Oras ng opisina" → 10 · "I-download ang porma" → 14 · "Madalas itanong" → 15 · "Sino ang lalapitan" → 11 · "Para sa negosyo" → 20 | click outside · Esc · re-tap `Serbisyo` |
| O3 | `Overlay — Mega Balita` | Nav `Balita`, all frames | featured story → 07 · stories → 06 · events → 08 | click outside · Esc · re-tap `Balita` |
| O4 | `Overlay — Mega Ligtas` | Nav `Ligtas`, all frames | hotlines → 03 · guides & sea conditions → 02 · individual numbers are `tel:`, unwired | click outside · Esc · re-tap `Ligtas` |
| O5 | `Overlay — Mega Kontak` | Nav `Kontak`, all frames | contact → 10 · map / directions / satellite / Facebook are external, unwired | click outside · Esc · re-tap `Kontak` |
| O6 | `Overlay — Higit pa` | Nav `Higit pa`, all frames | **Ang Barangay:** Tungkol → 16, Kasaysayan → 17, Bisyon at Misyon → 18, Mga Opisyal → 11 · **Pamamahala:** Transparency → 12, Mga Proyekto → 13, Mga Form → 14, Madalas Itanong → 15 · **Komunidad:** Turismo → 19, Mga Negosyo → 20, Mga Larawan → 21, Hanapin → 22 | click outside · Esc · re-tap `Higit pa` |
| O7 | `Overlay — Basemap Picker` | Hero `<summary class="hero__glassbtn">`, frame 01 only | Satellite / Street toggle — changes hero variant, no navigation | click outside · re-tap summary |

**Every link inside O1–O6 must Close Overlay *and* Navigate To** — a resident who taps a
panel item lands on a page, not a page with a panel still over it.

In-frame disclosures that are **not** overlays: FAQ accordions (frame 15, 2 `<details>`),
and the requirement checklist (frame 05). Model these as component variants, not overlays.

---

## 4. Figma Prototype Wiring Instructions (Summary Prompt)

> **Access note.** This prompt is written to be **file-agnostic** — it works in whatever
> Figma file is open when you start the conversation, so the agent never needs access to a
> file it wasn't invited to. Open a file in Figma first, then start the agent from inside it.
>
> If you are working in the file `xpugMgI9paPqA1VlCgCkvd`, the foundations in STEP 0 already
> exist — tell the agent to skip STEP 0. In any new/empty file, leave STEP 0 in.

=== BEGIN PROMPT ===

Work in the Figma file that is currently open. Do not try to open any other file.

STEP 0 — FOUNDATIONS (skip if the file already has a `Tumbod Tokens` collection):

Create two pages: `🎨 Design System` and `📱 Prototype`.

Create a variable collection `Tumbod Tokens`, one mode named `Default`.
COLOR variables (hex, scoped as noted):
  color/surface #f8fafc · color/surface-raised #ffffff · color/surface-sunken #f1f5f9 ·
  color/surface-inverse #0f172a  — scope FRAME_FILL, SHAPE_FILL
  color/ink-strong #020617 · color/ink #334155 · color/ink-muted #475569 ·
  color/ink-inverse #f8fafc  — scope TEXT_FILL
  color/line #e2e8f0 · color/line-strong #64748b · color/focus-ring #7c3aed — scope STROKE_COLOR
  color/interactive #0369a1 · color/interactive-hover #075985 · color/emergency #b91c1c ·
  color/ok #16a34a — scope FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR
  color/accent #f59e0b · color/ocean #155e75 · color/demo-banner #7c3aed ·
  color/sea-calm #16a34a · color/sea-moderate #f59e0b · color/sea-rough #f97316 ·
  color/sea-dangerous #dc2626 — scope FRAME_FILL, SHAPE_FILL
  color/accent-ink #020617 · color/accent-strong #b45309 · color/emergency-ink #ffffff — scope TEXT_FILL
FLOAT variables:
  space/1 4 · space/2 8 · space/3 12 · space/4 16 · space/5 24 · space/6 32 ·
  space/7 48 · space/8 64 — scope GAP, WIDTH_HEIGHT
  radius/sm 2 · radius/md 4 · radius/lg 8 · radius/full 9999 — scope CORNER_RADIUS

Create these text styles (family / style / size / line-height % / letter-spacing %):
  type/page-title   Plus Jakarta Sans Bold      30 / 118 / -1
  type/sea-state    Plus Jakarta Sans ExtraBold 34 / 105 / -2
  type/section      Plus Jakarta Sans Bold      20 / 120 / -1
  type/eyebrow      Inter Semi Bold             12 / 130 / 6
  type/lead         Inter Regular               18 / 160 / 0
  type/body         Inter Regular               16 / 160 / 0
  type/body-strong  Inter Semi Bold             16 / 160 / 0
  type/ui           Inter Semi Bold             14 / 140 / 0
  type/caption      Inter Regular               12 / 150 / 0
  type/figure       IBM Plex Mono SemiBold      16 / 140 / 0
  type/water        IBM Plex Mono Italic        14 / 140 / 0
  type/chart-label  IBM Plex Mono Regular       11 / 140 / 6
Note the exact style names: Plus Jakarta Sans uses "SemiBold"/"ExtraBold" with no space;
Inter uses "Semi Bold". IBM Plex Mono uses "SemiBold".

On `🎨 Design System`, create these components, binding every fill and corner radius to the
variables above — never a raw hex:
  Demo Banner — 390 wide, fill color/demo-banner, two centred lines of ink-inverse text
  Top Bar — 390×56, fill surface-raised, 1px bottom stroke color/line, space-between:
    left = 28px seal circle "BT" + "Barangay Tumbod"; right = "English" + red EMERGENCY button
  Tab Nav — 390×44, fill color/surface, 1px bottom stroke, six items in a horizontal row:
    Ngayon · Serbisyo · Balita · Ligtas · Kontak · Higit pa.
    Variant property `Active` with those six values. The active item is ink-strong with a
    3px color/accent bar under it; the rest are color/interactive.
  Button — variant property `Tone` = Primary | Secondary | Emergency, min height 44,
    padding 12/16, radius/md
  Quick Action Tile — 171×88, variant `Tone` = Primary (surface-inverse) | Emergency | Sea (ocean)
  Section Header — 20×3 accent bar + uppercase type/eyebrow in accent-strong
  Card — surface-raised, 1px color/line, radius/md, padding 16
  List Row — space-between, label + figure, min height 44, 1px bottom hairline
  Site Footer — 390 wide, fill surface-sunken, three link groups + fine print

STEP 1 — FRAMES, then STEP 2 — WIRING:

Build every frame named below on `📱 Prototype` if it does not already exist.
Frames are 390×844, vertical scrolling, header pinned (`Fix position when scrolling`).
Stack on every frame, top to bottom: Demo Banner → Top Bar → Tab Nav → page content →
Site Footer. Set the Tab Nav `Active` variant to the section that frame belongs to.
Lay the screen frames out in one row 120px apart; put the overlay frames in a row below.
Defaults unless a line says otherwise: trigger **On Click**, action **Navigate To**,
animation **Instant**, **Preserve scroll position OFF**.
Overlays: **Open Overlay**, **Manual** position flush under the nav row, full width,
extending to the frame bottom, **Close when clicking outside ON**,
animation **Move In / Top / 120ms / Ease Out**.
Set ONE flow starting point on `Home Frame (/)`. Name the flow "Resident — pier to document".
UI language is Filipino; do not translate labels.

GLOBAL — repeat on every frame 01–23:
[All Frames] -> Brand lockup "Barangay Tumbod" -> Home Frame (/)
[All Frames] -> EMERGENCY button -> Hotline Frame (/ligtas/hotline)   // plain navigation, NOT an overlay
[All Frames] -> Nav "Ngayon"   -> OPEN OVERLAY Overlay — Mega Ngayon
[All Frames] -> Nav "Serbisyo" -> OPEN OVERLAY Overlay — Mega Serbisyo
[All Frames] -> Nav "Balita"   -> OPEN OVERLAY Overlay — Mega Balita
[All Frames] -> Nav "Ligtas"   -> OPEN OVERLAY Overlay — Mega Ligtas
[All Frames] -> Nav "Kontak"   -> OPEN OVERLAY Overlay — Mega Kontak
[All Frames] -> Nav "Higit pa" -> OPEN OVERLAY Overlay — Higit pa
[All Frames] -> Footer "Mga Serbisyo" -> Services Index Frame (/serbisyo)
[All Frames] -> Footer "Mga Form" -> Forms Frame (/porma)
[All Frames] -> Footer "Kalendaryo" -> Events Index Frame (/kaganapan)
[All Frames] -> Footer "Ligtas" -> Safety Frame (/ligtas)
[All Frames] -> Footer "Mga numerong pang-emergency" -> Hotline Frame (/ligtas/hotline)
[All Frames] -> Footer "Saan lilikas" -> Safety Frame (/ligtas)
[All Frames] -> Footer "BDRRMC" -> Safety Frame (/ligtas)
[All Frames] -> Footer "Tungkol sa Tumbod" -> About Frame (/tungkol)
[All Frames] -> Footer "Mga Opisyal" -> Officials Frame (/opisyal)
[All Frames] -> Footer "Transparency" -> Transparency Frame (/transparency)
[All Frames] -> Footer "Kontak" -> Contact Frame (/kontak)

PER FRAME:
[Home Frame (/)] -> Tile "Kumuha ng Clearance" -> Service Detail Frame (/serbisyo/[slug])
[Home Frame (/)] -> Tile "Emergency na numero" -> Hotline Frame (/ligtas/hotline)
[Home Frame (/)] -> Tile "Biyahe ng bangka" -> Safety Frame (/ligtas)
[Home Frame (/)] -> Tile "Mga Serbisyo" -> Services Index Frame (/serbisyo)
[Home Frame (/)] -> "Buong direktoryo →" -> Hotline Frame (/ligtas/hotline)
[Home Frame (/)] -> "Lahat ng anunsyo →" -> News Index Frame (/balita)
[Home Frame (/)] -> Any Anunsyo card -> Article Frame (/balita/[slug])
[Home Frame (/)] -> Row "Barangay Clearance" -> Service Detail Frame (/serbisyo/[slug])
[Home Frame (/)] -> Row "Sertipiko ng Indigency" -> Service Detail Frame (/serbisyo/[slug])
[Home Frame (/)] -> Row "Sertipiko ng Paninirahan" -> Service Detail Frame (/serbisyo/[slug])
[Home Frame (/)] -> Any Kalendaryo row -> Event Detail Frame (/kaganapan/[slug])
[Home Frame (/)] -> Any Proyekto row -> Projects Frame (/proyekto)
[Home Frame (/)] -> "Basahin ang kasaysayan →" -> History Frame (/kasaysayan)
[Home Frame (/)] -> Search affordance -> Search Frame (/hanapin)
[Home Frame (/)] -> Hero basemap summary -> OPEN OVERLAY Overlay — Basemap Picker (Fade 100ms)
[Home Frame (/)] -> Sea-state band -> NO CONNECTION (0-tap answer, not a link)
[Home Frame (/)] -> Next-boat strip -> NO CONNECTION
[Safety Frame (/ligtas)] -> "Mga numerong pang-emergency" -> Hotline Frame (/ligtas/hotline)
[Hotline Frame (/ligtas/hotline)] -> Any phone row -> NO CONNECTION (tel:)
[Services Index Frame (/serbisyo)] -> Any of the 6 service rows -> Service Detail Frame (/serbisyo/[slug])
[Service Detail Frame (/serbisyo/[slug])] -> "← Mga Serbisyo" -> Services Index Frame (/serbisyo)
[Service Detail Frame (/serbisyo/[slug])] -> "I-download ang porma" -> Forms Frame (/porma)
[Service Detail Frame (/serbisyo/[slug])] -> Requirement checkbox -> SMART ANIMATE variant Checked=Yes (no navigation)
[News Index Frame (/balita)] -> Any article card -> Article Frame (/balita/[slug])
[News Index Frame (/balita)] -> Events link -> Events Index Frame (/kaganapan)
[Article Frame (/balita/[slug])] -> "← Balita" -> News Index Frame (/balita)
[Article Frame (/balita/[slug])] -> Related event -> Events Index Frame (/kaganapan)
[Events Index Frame (/kaganapan)] -> Any event card -> Event Detail Frame (/kaganapan/[slug])
[Events Index Frame (/kaganapan)] -> News link -> News Index Frame (/balita)
[Event Detail Frame (/kaganapan/[slug])] -> "← Kaganapan" -> Events Index Frame (/kaganapan)
[Event Detail Frame (/kaganapan/[slug])] -> "Balita" -> News Index Frame (/balita)
[Contact Frame (/kontak)] -> "Mga numerong pang-emergency" -> Hotline Frame (/ligtas/hotline)
[Contact Frame (/kontak)] -> "Load map" button -> SMART ANIMATE variant Map=Loaded (no navigation)
[Contact Frame (/kontak)] -> Phone rows, map, directions, Facebook -> NO CONNECTION
[Search Frame (/hanapin)] -> Search input -> ON CHANGE, SMART ANIMATE variant Results=Shown (never navigates)
[Search Frame (/hanapin)] -> Any result row -> its named frame
[Search Frame (/hanapin)] -> Any "Lahat ng pahina" row -> its named frame
[FAQ Frame (/faq)] -> Each question -> SMART ANIMATE variant Answer=Expanded (no navigation)
[FAQ Frame (/faq)] -> "Kontak" -> Contact Frame (/kontak)
[Forms Frame (/porma)] -> "Mga Serbisyo" -> Services Index Frame (/serbisyo)
[Projects Frame (/proyekto)] -> "Transparency" -> Transparency Frame (/transparency)
[Tourism Frame (/turismo)] -> Sea/safety link -> Safety Frame (/ligtas)
[Offline Frame (/offline)] -> "Ligtas" -> Safety Frame (/ligtas)
[Offline Frame (/offline)] -> "Mga numerong pang-emergency" -> Hotline Frame (/ligtas/hotline)

INSIDE OVERLAYS — every one of these must CLOSE OVERLAY then NAVIGATE TO:
[Overlay — Mega Ngayon] -> "Tingnan ang lagay ng dagat" -> Safety Frame (/ligtas)
[Overlay — Mega Ngayon] -> "Oras ng opisina" -> Contact Frame (/kontak)
[Overlay — Mega Serbisyo] -> Any of the 4 listed documents -> Service Detail Frame (/serbisyo/[slug])
[Overlay — Mega Serbisyo] -> "Lahat ng serbisyo" -> Services Index Frame (/serbisyo)
[Overlay — Mega Serbisyo] -> "Tingnan ang lagay ng dagat" -> Safety Frame (/ligtas)
[Overlay — Mega Serbisyo] -> "Oras ng opisina" -> Contact Frame (/kontak)
[Overlay — Mega Serbisyo] -> "I-download ang porma" -> Forms Frame (/porma)
[Overlay — Mega Serbisyo] -> "Madalas itanong" -> FAQ Frame (/faq)
[Overlay — Mega Serbisyo] -> "Sino ang lalapitan" -> Officials Frame (/opisyal)
[Overlay — Mega Serbisyo] -> "Para sa negosyo" -> Business Frame (/negosyo)
[Overlay — Mega Balita] -> Featured story / any story -> Article Frame (/balita/[slug])
[Overlay — Mega Balita] -> "Lahat ng balita" -> News Index Frame (/balita)
[Overlay — Mega Balita] -> Any event -> Events Index Frame (/kaganapan)
[Overlay — Mega Ligtas] -> "Mga numerong pang-emergency" -> Hotline Frame (/ligtas/hotline)
[Overlay — Mega Ligtas] -> Guides / sea conditions -> Safety Frame (/ligtas)
[Overlay — Mega Ligtas] -> Individual phone numbers -> NO CONNECTION (tel:)
[Overlay — Mega Kontak] -> "Kontak" / hall details -> Contact Frame (/kontak)
[Overlay — Mega Kontak] -> Map, directions, satellite, Facebook -> NO CONNECTION (external)
[Overlay — Higit pa] -> "Tungkol" -> About Frame (/tungkol)
[Overlay — Higit pa] -> "Kasaysayan" -> History Frame (/kasaysayan)
[Overlay — Higit pa] -> "Bisyon at Misyon" -> Vision Frame (/bisyon)
[Overlay — Higit pa] -> "Mga Opisyal" -> Officials Frame (/opisyal)
[Overlay — Higit pa] -> "Transparency" -> Transparency Frame (/transparency)
[Overlay — Higit pa] -> "Mga Proyekto" -> Projects Frame (/proyekto)
[Overlay — Higit pa] -> "Mga Form" -> Forms Frame (/porma)
[Overlay — Higit pa] -> "Madalas Itanong" -> FAQ Frame (/faq)
[Overlay — Higit pa] -> "Turismo" -> Tourism Frame (/turismo)
[Overlay — Higit pa] -> "Mga Negosyo" -> Business Frame (/negosyo)
[Overlay — Higit pa] -> "Mga Larawan" -> Gallery Frame (/larawan)
[Overlay — Higit pa] -> "Hanapin" -> Search Frame (/hanapin)

OVERLAY DISMISSAL — apply to Overlay — Mega Ngayon / Serbisyo / Balita / Ligtas / Kontak / Higit pa:
- Click outside -> Close Overlay
- Key "Esc" -> Close Overlay
- Re-tap the same nav item -> Close Overlay

ACCEPTANCE CHECK (depth budget, IA.md §5 — requirements, not aspirations):
- Sea condition / next boat: 0 taps, above the fold on Home Frame
- Emergency numbers: 1 tap from any frame, via the header EMERGENCY button
- Clearance requirements: 2 taps — Home -> "Kumuha ng Clearance" -> Service Detail
- Evacuation / safety: 2 taps — Home -> Ligtas tile or panel -> Safety Frame
Verify no frame is a dead end (every frame reaches Home via the brand lockup), every
overlay closes three ways, and no tel: or external row is wired to a navigation.

Report the connections you created and any trigger element named above that you could
not find on its frame.

=== END PROMPT ===
