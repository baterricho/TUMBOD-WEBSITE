# WIREFRAMES.md

**Spec reference:** BUILD-PROMPT.md §12.3, §13
**Corrected in self-critique** (`DESIGN-PLAN.md` §9 item 12): all unknown data renders in the mandated `[[NEEDS DATA: … ]]` form. **No plausible-looking fake numbers appear anywhere in this document.**

> ⚠️ **Sea state, wave heights and dates below are ILLUSTRATIVE ONLY** — they demonstrate component states, not real readings. Real values come from the CMS/weather source at runtime.

---

## 1. HOME — 360px (primary design target)

First viewport ends at the dashed line: **412px used of 640px** (`DESIGN-PLAN.md` §4.4).

```
┌──────────────────────────────────────────┐
│ ⊙ BARANGAY TUMBOD   [FIL|EN] ┌────────┐ ≡│  56px sticky
│                              │☎ EMERGENCY│  always, red, 48px
├──────────────────────────────────────────┤
│ ░░░ LIVING CHART ░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ░│  132px
│ ░ ‹Blockade Strait›   ▲    ‹Endeavor›   ░│  ← real coastline, OSM
│ ░  ~~~~~~ ▁▂▃ TUMBOD ▃▂▁ ~~~~~~~~~~~~~  ░│    straits italic (water)
│ ░  ~~~~~ (Tuluran I.) ~~~~~~~~~~~~~~~~  ░│    TUMBOD upright (land)
├──────────────────────────────────────────┤
│ ‹DAGAT NGAYON›                           │
│ ▓▓▓▓ MALAKAS ▓▓▓▓  🌊   ‹alon ~2.0 m›    │  96px · orange fill + ink
│ Hangin: Habagat 25 kph                   │  colour + WORD + icon
│ Basa noong 5:00 AM · PAGASA              │  provenance, always
├──────────────────────────────────────────┤
│ ‹SUSUNOD NA BIYAHE›                      │
│ Tumbod → [[NEEDS DATA: destination]]     │  72px
│ ● HINDI TIYAK — malakas ang alon         │  statusReason distinguishes
│   [[NEEDS DATA: oras ng alis]]           │  sea state vs PCG ban
├──────────────────────────────────────────┤
│ ● SARADO ANG OPISINA · Linggo            │  56px
│   Bubukas bukas, [[NEEDS DATA: oras]]    │
├ ─ ─ ─ ─ ─ ─ 412px ─ fold ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ ┌────────────┐ ┌────────────┐            │  2×2, 44px+ targets
│ │ 📄 Kumuha  │ │ ☎ Emergency│            │  visible above fold =
│ │  ng        │ │  na numero │            │  scroll affordance
│ │  Clearance │ │            │            │
│ └────────────┘ └────────────┘            │
│ ┌────────────┐ ┌────────────┐            │
│ │ 🚤 Biyahe  │ │ 🔍 Hanapin │            │
│ └────────────┘ └────────────┘            │
├━━━━━━━━━━━ contour rule ━━━━━━━━━━━━━━━━━┤  --space-5 (24px), not 48
│ ANUNSYO              Huling update: 2 oras│
│ ┌──────────────────────────────────────┐ │
│ │ [ANUNSYO] [[NEEDS DATA: pamagat]]    │ │  AnnouncementCard ×3
│ │ [[NEEDS DATA: petsa]] · Barangay Hall│ │
│ ├──────────────────────────────────────┤ │
│ │ [KALUSUGAN] [[NEEDS DATA: pamagat]]  │ │
│ ├──────────────────────────────────────┤ │
│ │ [AYUDA] [[NEEDS DATA: pamagat]]      │ │
│ └──────────────────────────────────────┘ │
│ Lahat ng anunsyo →                        │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ SUSUNOD NA MEDICAL MISSION               │
│ [[NEEDS DATA: petsa at oras]]            │
│ [[NEEDS DATA: lugar]] · [[provider]]     │
│ Dalhin: [[NEEDS DATA: mga dalhin]]       │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MGA NUMERONG PANG-EMERGENCY              │  ⚠ MUST render offline
│ ☎ Barangay Hotline  [[NEEDS DATA]]   →   │  48px rows, tel: links
│ ☎ BDRRMC            [[NEEDS DATA]]   →   │  NO number is invented —
│ ☎ Coast Guard NP    [[NEEDS DATA]]   →   │  spec §0.2, non-negotiable
│ ☎ RHU Taytay        [[NEEDS DATA]]   →   │
│ Buong direktoryo →                        │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MADALAS HINGING DOKUMENTO                │
│ Barangay Clearance  [[fee]] · [[araw]] → │  fees in mono
│ Sertipiko ng Indigency  [[fee]]      →   │
│ Barangay ID         [[fee]] · [[araw]] → │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ KALENDARYO                               │
│ [[NEEDS DATA: 3 paparating na event]]    │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MGA PROYEKTO                             │
│ ┌──────────────────────────────────────┐ │
│ │ [[NEEDS DATA: pangalan ng proyekto]] │ │
│ │ ●───●───○  Ginagawa                  │ │  Timeline: shape+colour+label
│ │ [[budget]] · [[fund source]]         │ │
│ └──────────────────────────────────────┘ │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MGA FORM                                 │
│ ⬇ [[NEEDS DATA: form]]  PDF · [[KB]] →   │  size before the tap
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MULA SA FACEBOOK PAGE                    │
│ [[NEEDS DATA: mirror — blocked, see B1]] │
│ Buksan ang Facebook page ↗                │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ TUNGKOL SA TUMBOD                        │  the ONLY "about us" on
│ Isang barangay-isla sa bukana ng         │  the page — and it's last
│ Malampaya Sound. Ang buong pulo ng       │
│ Tuluran ay ang barangay namin. Walang    │
│ kalsada papunta rito — bangka ang lahat  │
│ ng biyahe. 1,744 kami (PSA 2020).        │  ← VERIFIED figure
│ Basahin ang kasaysayan →                  │
├──────────────────────────────────────────┤
│ FOOTER — full sitemap · seal · address    │
│ hours · privacy · accessibility · contact │
│ Chart: © OpenStreetMap contributors (ODbL)│  ← attribution in legend
└──────────────────────────────────────────┘
```

---

## 2. HOME — 1280px

**Identical DOM order.** Desktop achieved by grid placement only, so screen-reader order matches at every width.

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⊙ BARANGAY TUMBOD    Ngayon Serbisyo Balita Ligtas Higit pa            │
│                                        [FIL|EN]  ┌──────────────┐      │
│                                                  │ ☎ EMERGENCY  │      │
├────────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░ LIVING CHART — full bleed ░░░░░░░░░░░░░░░ │  ANNOTATION  │
│ ░ ‹Blockade Strait›        ▲TUMBOD       ‹Endeavor›   ░ │   MARGIN     │
│ ░  ~~~~~~~~~~ (Tuluran Island) ~~~~~~~~~~~~~~~~~~~~~ ░ │              │
│ ┌─────────────┬──────────────┬─────────────┐           │ ─ ─ ─ ─ ─    │
│ │ ‹DAGAT›     │ ‹BIYAHE›     │ OPISINA     │           │ Basa 5:00 AM │
│ │ ▓ MALAKAS ▓ │ ● HINDI TIYAK│ ● SARADO    │           │ PAGASA       │
│ │ ‹~2.0 m›    │ [[oras]]     │ Linggo      │           │ ─ ─ ─ ─ ─    │
│ └─────────────┴──────────────┴─────────────┘           │ LEGEND       │
│                                                         │ ▁▂▃ lalim    │
├──────────────────────────────────────────┬──────────────┴──────────────┤
│  MAIN COLUMN (8 cols)                    │  STICKY RAIL (4 cols)       │
│                                          │                             │
│  ANUNSYO                                 │  ┌───────────────────────┐  │
│  ┌────────────────────────────────────┐  │  │ ☎ MGA NUMERO          │  │
│  │ [ANUNSYO] [[NEEDS DATA]]           │  │  │ Barangay  [[DATA]] →  │  │
│  ├────────────────────────────────────┤  │  │ BDRRMC    [[DATA]] →  │  │
│  │ [KALUSUGAN] [[NEEDS DATA]]         │  │  │ Coast Gd  [[DATA]] →  │  │
│  └────────────────────────────────────┘  │  └───────────────────────┘  │
│                                          │  ┌───────────────────────┐  │
│  MEDICAL MISSION · KALENDARYO            │  │ MABILIS NA AKSYON     │  │
│  MGA PROYEKTO · MGA FORM                 │  │ Clearance · Biyahe    │  │
│  FACEBOOK · TUNGKOL SA TUMBOD            │  │ Emergency · Hanapin   │  │
│                                          │  └───────────────────────┘  │
├──────────────────────────────────────────┴─────────────────────────────┤
│ FOOTER — full sitemap, 4 columns · OSM attribution                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. `/ligtas` — 360px · HIGHEST PRIORITY

**Must render with zero network, zero JS, zero third parties.** No images required to be useful.

```
┌──────────────────────────────────────────┐
│ ⊙ BARANGAY TUMBOD          ┌────────────┐│
│                            │☎ EMERGENCY ││
├──────────────────────────────────────────┤
│ ⓘ Naka-offline. Huling nakuha:           │  calm band, not an error
│   [[cache timestamp]]                    │
├══════════════════════════════════════════┤
│ KALAGAYAN NGAYON                         │  answer first
│ ▓▓▓▓▓ WALANG BABALA ▓▓▓▓▓                │
│ Normal ang lagay ng panahon.             │
│ Huling abiso: [[NEEDS DATA: petsa/oras]] │
│ ⚠ Baka may bago nang abiso —             │  staleness NEVER silent
│   tumawag sa hotline.                    │
├──────────────────────────────────────────┤
│ ☎ TUMAWAG AGAD                           │  above the fold, always
│ Barangay Hotline   [[NEEDS DATA]]    →   │
│ BDRRMC             [[NEEDS DATA]]    →   │
│ Coast Guard N.Pal. [[NEEDS DATA]]    →   │
│ RHU Taytay         [[NEEDS DATA]]    →   │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ SAAN LILIKAS                             │
│ ┌──────────────────────────────────────┐ │
│ │ [[NEEDS DATA: pangalan ng evacuation │ │
│ │  site, purok, kapasidad, paano       │ │
│ │  marating]]                          │ │
│ └──────────────────────────────────────┘ │
│ ⚠ Hindi pa kumpleto ang listahan.        │  honest incompleteness
│   Tanungin ang BDRRMC.                   │  beats a fake table
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ BAGO DUMATING ANG BAGYO                  │
│ ☐ Tubig na maiinom — 3 araw              │  persisted checklist
│ ☐ Pagkaing hindi nasisira                │  works without JS
│ ☐ Flashlight at baterya                  │  (static list; boxes are
│ ☐ Mga papeles sa plastik                 │   progressive enhancement)
│ ☐ Load sa telepono                       │
│ ☐ Alam ang lilikasan                     │
│  🖨 I-print ang listahan                  │  survives B&W photocopy
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ ‹PAGLALAYAG AT ALON›                     │
│ Ipinagbabawal ng Coast Guard ang         │  ← VERIFIED rule, real
│ paglalayag ng mga bangkang 3 GT pababa   │    and operationally
│ kapag malakas ang alon sa Taytay at      │    decisive for this island
│ El Nido. Karamihan ng bangka natin ay    │
│ saklaw nito.                             │
│ Buong patakaran →                         │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ BDRRMC                                   │
│ [[NEEDS DATA: roster at tungkulin]]      │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ KAPAG WALANG SIGNAL                      │
│ • Makinig sa radyo                       │
│ • Pumunta sa barangay hall               │
│ • [[NEEDS DATA: lokal na paraan]]        │
└──────────────────────────────────────────┘
```

---

## 4. `/serbisyo/barangay-clearance` — 360px

The checklist is **first**. Everything else is below it.

```
┌──────────────────────────────────────────┐
│ ⊙ BARANGAY TUMBOD          ┌────────────┐│
│                            │☎ EMERGENCY ││
├──────────────────────────────────────────┤
│ Ngayon › Serbisyo › Barangay Clearance   │  breadcrumb
├──────────────────────────────────────────┤
│ BARANGAY CLEARANCE                       │  h1, display face
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ BAYAD          [[NEEDS DATA: fee]]   │ │  mono figures,
│ │ TAGAL          [[NEEDS DATA: araw]]  │ │  answer before context
│ │ ORAS NG OPISINA [[NEEDS DATA]]       │ │
│ │ LAPITAN SI     [[NEEDS DATA: opis.]] │ │  a NAME, not "the office"
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ DALHIN MO ITO           0 sa 4 handa na  │  progress as TEXT
│ ☐ [[NEEDS DATA: requirement 1]]          │  persisted across days
│ ☐ [[NEEDS DATA: requirement 2]]          │
│ ☐ [[NEEDS DATA: requirement 3]]          │
│ ☐ [[NEEDS DATA: requirement 4]]          │
│                                          │
│ ┌────────────────┐ ┌───────────────────┐ │
│ │ 📋 Kopyahin    │ │ 🖨 I-print        │ │  copy → paste to
│ │   ang listahan │ │                   │ │  Messenger, because
│ └────────────────┘ └───────────────────┘ │  that's how it spreads
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ PAANO ANG PROSESO                        │
│ ●  1. Pumunta sa barangay hall           │  Timeline, vertical
│ │  2. Ipakita ang mga dala               │
│ │  3. Magbayad                           │
│ ○  4. Kunin ang clearance                │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ BATAYAN                                  │
│ [[NEEDS DATA: ordinance number]]         │
│ [[plain-language summary — required]]    │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ MADALAS ITANONG                          │
│ [[NEEDS DATA: from FB comment mining —   │
│  blocked, see B1]]                       │
└──────────────────────────────────────────┘
```

*(No "Ipadala ang request" CTA — decision B5 defers online requests. The route and model exist; the UI is dark.)*

---

## 5. NOTES CARRIED TO PHASE 4

1. Chart SVG is the **LCP element** on `/` — inline, server-rendered, no round trip.
2. Every wireframe above renders usefully with **JS disabled** and **network disabled** except the Facebook mirror, which degrades to a link.
3. `/ligtas` needs **no images at all** to be complete — that is why its budget is 60 KB.
4. Placeholder density here is a **feature**: it is the visible shape of `CONTENT-TODO.md`, and the production build fails while any of it remains.
