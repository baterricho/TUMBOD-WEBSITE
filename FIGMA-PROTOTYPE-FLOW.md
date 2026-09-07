# FIGMA-PROTOTYPE-FLOW.md

Paste everything between the `=== BEGIN PROMPT ===` and `=== END PROMPT ===` markers
into the Figma agent, with the file **Barangay Tumbod — Mobile Prototype** open.

File key: `xpugMgI9paPqA1VlCgCkvd`
URL: https://www.figma.com/design/xpugMgI9paPqA1VlCgCkvd

Derived from: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`,
`src/components/mega/*.astro`, `src/views/*.astro`, `src/styles/mega.css`, `IA.md`.

---

=== BEGIN PROMPT ===

You are wiring the prototype flow for **Barangay Tumbod — Mobile Prototype**
(file key `xpugMgI9paPqA1VlCgCkvd`). Work on the page `📱 Prototype`.

This is the official website of Barangay Tumbod, Taytay, Palawan — an island
barangay. Residents open it standing at a pier, often on a bad connection. The
navigation model below is not a guess; it is what the code actually does.

---

## 0. PRECONDITION — build the frames if they are missing

The page `🎨 Design System` already contains a variable collection
`Tumbod Tokens`, twelve `type/*` text styles, and these components:
`Demo Banner`, `Top Bar`, `Tab Nav` (5 variants), `Button` (3 variants),
`Quick Action Tile` (3 variants), `Section Header`, `Card`, `List Row`.

If any frame named below does not yet exist on `📱 Prototype`, create it first:
- Size **390 × 844**, vertical auto-layout, fill = variable `color/surface`.
- Overflow behaviour: **Vertical scrolling**.
- Stack at the top of every frame, in this order: `Demo Banner` → `Top Bar` →
  `Tab Nav`. Set the `Tab Nav` variant's `Active` property to the value listed
  for that frame.
- Set `Demo Banner`, `Top Bar` and `Tab Nav` to **Fix position when scrolling**
  on every frame. The header is sticky sitewide.
- Content below the chrome, then a `Site Footer` instance last. (If
  `Site Footer` does not exist, create it: full sitemap, links —
  Mga Serbisyo · Mga Form · Kalendaryo · Ligtas · Mga numerong pang-emergency ·
  Saan lilikas · BDRRMC · Tungkol sa Tumbod · Mga Opisyal · Transparency ·
  Kontak. The footer is real navigation, not decoration.)
- Lay the 8 screen frames out in one row, 120px apart. Put the 5 overlay frames
  in a second row below them.
- Use only `Tumbod Tokens` variables and `type/*` text styles. No raw hex.

Language of the UI is **Filipino**. Do not translate the labels to English.

---

## 1. SCREEN FRAMES (8)

| Frame name | Route | `Tab Nav` Active |
|---|---|---|
| `01 · Home — Ngayon sa Tumbod` | `/` | Ngayon |
| `02 · Ligtas` | `/ligtas` | Ligtas |
| `03 · Hotline` | `/ligtas/hotline` | Ligtas |
| `04 · Serbisyo — Index` | `/serbisyo` | Serbisyo |
| `05 · Serbisyo — Barangay Clearance` | `/serbisyo/barangay-clearance` | Serbisyo |
| `06 · Balita` | `/balita` | Balita |
| `07 · Kaganapan` | `/kaganapan` | Balita |
| `08 · Kontak` | `/kontak` | Higit pa |

## 2. OVERLAY FRAMES (5) — the mega panels

The five primary nav items are **not links**. Every one of them opens a mega
panel. Each panel is a section shortcut, not a second copy of a landing page.

| Overlay frame name | Opened by | Carries |
|---|---|---|
| `OV · Mega — Ngayon` | nav "Ngayon" | sea state, next boat, office hours |
| `OV · Mega — Serbisyo` | nav "Serbisyo" | 4 documents + "all services" + before-you-travel |
| `OV · Mega — Balita` | nav "Balita" | featured story, stories, events |
| `OV · Mega — Ligtas` | nav "Ligtas" | hotlines, guides, sea conditions |
| `OV · Mega — Higit pa` | nav "Higit pa" | contact, hall, map, and the long tail |

**Overlay geometry** (from `src/styles/mega.css` — the panel is
`position: fixed; inset: var(--header-h) 0 0; overflow-y: auto`):
- Width **390**, top edge flush with the **bottom edge of `Tab Nav`**,
  bottom edge at the bottom of the 844 frame. It covers the whole viewport
  below the header — nothing of the page shows through underneath it.
- Overflow behaviour: **Vertical scrolling**.
- Fill = `color/surface-raised`.

---

## 3. WIRING

All navigation uses trigger **On click**, action **Navigate to**, animation
**Instant**, **Preserve scroll position: OFF** (each page loads at the top).
All overlays use action **Open overlay**, **Manual** position as specified in
§2, **Close when clicking outside: ON**, animation **Move in / Top, 120ms,
Ease out**.

### 3.1 Shared chrome — apply to ALL 8 screen frames

| Hotspot | Action |
|---|---|
| Seal + wordmark "Barangay Tumbod" (`Top Bar`) | Navigate to `01 · Home` |
| **EMERGENCY** button (`Top Bar`) | Navigate to `03 · Hotline` |
| "English" (`Top Bar`) | Leave unwired — it swaps to the `/en/*` mirror, which is out of scope for this prototype |
| Nav "Ngayon" (`Tab Nav`) | Open overlay `OV · Mega — Ngayon` |
| Nav "Serbisyo" | Open overlay `OV · Mega — Serbisyo` |
| Nav "Balita" | Open overlay `OV · Mega — Balita` |
| Nav "Ligtas" | Open overlay `OV · Mega — Ligtas` |
| Nav "Higit pa" | Open overlay `OV · Mega — Higit pa` |

**The EMERGENCY button is a plain navigation, not a sheet or overlay.** That is
deliberate: it must work with JavaScript disabled and with no network, and
`/ligtas/hotline` is precached. Do not turn it into an overlay.

### 3.2 Shared footer — apply to ALL 8 screen frames

| Footer link | Action |
|---|---|
| Mga Serbisyo | Navigate to `04 · Serbisyo — Index` |
| Ligtas | Navigate to `02 · Ligtas` |
| Mga numerong pang-emergency | Navigate to `03 · Hotline` |
| Kontak | Navigate to `08 · Kontak` |
| Mga Form · Kalendaryo · Saan lilikas · BDRRMC · Tungkol sa Tumbod · Mga Opisyal · Transparency | Leave unwired — no frame in this prototype |

### 3.3 `01 · Home — Ngayon sa Tumbod`

| Hotspot | Action |
|---|---|
| Tile "Kumuha ng Clearance" | Navigate to `05 · Serbisyo — Barangay Clearance` |
| Tile "Emergency na numero" | Navigate to `03 · Hotline` |
| Tile "Biyahe ng bangka" | Navigate to `02 · Ligtas` |
| Tile "Mga Serbisyo" | Navigate to `04 · Serbisyo — Index` |
| "Buong direktoryo →" (under the emergency numbers block) | Navigate to `03 · Hotline` |
| "Lahat ng anunsyo →" (under Anunsyo) | Navigate to `06 · Balita` |
| Row "Barangay Clearance" (Madalas hinging dokumento) | Navigate to `05` |
| Rows "Sertipiko ng Indigency" / "Sertipiko ng Paninirahan" | Navigate to `04` |
| Any Kalendaryo row | Navigate to `07 · Kaganapan` |
| The sea-state band and next-boat strip | Leave unwired — they are the answer, not a link. Sea condition must be **0 taps** from home. |
| "Basahin ang kasaysayan →" | Leave unwired |

### 3.4 `02 · Ligtas`

| Hotspot | Action |
|---|---|
| Hotline block / "Mga numerong pang-emergency" | Navigate to `03 · Hotline` |

### 3.5 `03 · Hotline`

| Hotspot | Action |
|---|---|
| Every phone number row | Leave unwired — these are `tel:` links, not navigation. Label the layer `tel:` so this stays obvious. |

### 3.6 `04 · Serbisyo — Index`

| Hotspot | Action |
|---|---|
| "Barangay Clearance" row | Navigate to `05 · Serbisyo — Barangay Clearance` |
| Sertipiko ng Indigency · Sertipiko ng Paninirahan · Business Clearance · Barangay ID · Blotter / Katarungang Pambarangay | Leave unwired — only the clearance detail page is built |

### 3.7 `05 · Serbisyo — Barangay Clearance`

| Hotspot | Action |
|---|---|
| Breadcrumb / back link "← Mga Serbisyo" | Navigate to `04 · Serbisyo — Index` |

### 3.8 `06 · Balita` and `07 · Kaganapan`

| Hotspot | Action |
|---|---|
| On `06`, the link to Kaganapan | Navigate to `07 · Kaganapan` |
| On `07`, the link to Balita | Navigate to `06 · Balita` |

### 3.9 `08 · Kontak`

| Hotspot | Action |
|---|---|
| "Mga numerong pang-emergency" | Navigate to `03 · Hotline` |
| Office phone numbers | Leave unwired (`tel:`) |
| Map, directions, Facebook | Leave unwired (external) |

### 3.10 Inside the overlays

Every link inside an overlay must **Close overlay** and then **Navigate to** the
target frame — a resident who taps a panel item ends up on a page, not on a
page with a panel still over it.

`OV · Mega — Ngayon`
- "Tingnan ang lagay ng dagat" / sea → `02 · Ligtas`
- "Oras ng opisina" → `08 · Kontak`

`OV · Mega — Serbisyo`
- "Barangay Clearance" → `05`
- the other three listed documents → `04`
- "Lahat ng serbisyo" → `04`
- "Tingnan ang lagay ng dagat" → `02`
- "Oras ng opisina" → `08`
- "I-download ang porma" · "Madalas itanong" · "Sino ang lalapitan" · "Para sa negosyo" → leave unwired

`OV · Mega — Balita`
- featured story and any story → `06 · Balita`
- any event → `07 · Kaganapan`

`OV · Mega — Ligtas`
- "Mga numerong pang-emergency" / any hotline group → `03 · Hotline`
- "Lagay ng dagat" / guides → `02 · Ligtas`
- individual phone numbers → leave unwired (`tel:`)

`OV · Mega — Higit pa`
- "Kontak" → `08 · Kontak`
- Transparency · Mga Opisyal · Tungkol · Turismo · Larawan · Proyekto ·
  Negosyo · Porma · FAQ · Kasaysayan · Bisyon · Hanapin → leave unwired

Additionally, on each overlay:
- Tapping the **already-active** nav item in the header behind it closes the
  overlay (**Close overlay**).
- A **Key/gamepad → Esc** trigger closes the overlay.

---

## 4. FLOW STARTING POINT

Set **one** flow starting point on `01 · Home — Ngayon sa Tumbod`.
Name the flow: **Resident — pier to document**.

---

## 5. ACCEPTANCE CHECK

After wiring, verify each of these in Present mode. These are the depth budget
from `IA.md` §5 and they are requirements, not aspirations:

| Task | Must be reachable in |
|---|---|
| Sea condition / next boat | **0 taps** — visible on `01` without scrolling past the fold |
| Emergency numbers | **1 tap** — EMERGENCY in the header, from any of the 8 frames |
| Clearance requirements | **2 taps** — Home → "Kumuha ng Clearance" tile → `05` |
| Evacuation / safety page | **2 taps** — Home → Ligtas panel or tile → `02` |

Also verify: no frame is a dead end (every frame can reach Home via the
wordmark), every overlay closes both by clicking outside and by Esc, and no
`tel:` row is wired to a navigation.

Report back with a list of the connections you created, and any hotspot named
above that you could not find on its frame.

=== END PROMPT ===
