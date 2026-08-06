# IA.md — Information Architecture

**Spec reference:** BUILD-PROMPT.md §6
**Change from spec:** service request routes are **deferred but reserved** (decision B5 — requirements only, architected for later).

---

## 1. PRINCIPLE

Organised by **resident need**, not org chart. Nobody thinks "I need the Office of the Sangguniang Barangay." They think *"kailangan ko ng clearance."*

---

## 2. SITEMAP

```
/                             Ngayon sa Tumbod — today-first dashboard
│
├── /ligtas                   Ligtas — 1 tap from anywhere, precache tier 1
│   ├── /ligtas/bagyo         Typhoon prep & checklist
│   ├── /ligtas/dagat         Sea conditions & boat-travel safety
│   ├── /ligtas/likasan       Evacuation sites
│   ├── /ligtas/hotline       Full hotline directory
│   └── /ligtas/bdrrmc        BDRRMC roster & responsibilities
│
├── /serbisyo                 Mga Serbisyo
│   └── /serbisyo/[slug]      barangay-clearance · sertipiko-ng-indigency ·
│                             sertipiko-ng-paninirahan · business-clearance ·
│                             barangay-id · blotter-katarungang-pambarangay
│   ⌁ /serbisyo/humiling      RESERVED — dark behind `Service.acceptsOnline`
│   ⌁ /serbisyo/subaybayan    RESERVED — dark
│
├── /balita                   Balita at Anunsyo
│   ├── /balita/[slug]
│   ├── /balita/kategorya/[c]
│   └── /balita/facebook      Mirror, clearly labelled
│
├── /transparency             Full Disclosure Board
│   ├── /transparency/badyet · /sk · /proyekto · /procurement
│   └── /transparency/ordinansa   searchable by number
│
├── /opisyal                  Mga Opisyal
│   ├── /opisyal/[slug]
│   └── /opisyal/lupon
│
├── /tungkol                  Tungkol sa Barangay
│   ├── /tungkol/kasaysayan   History
│   ├── /tungkol/heograpiya   Island geography, puroks, the two straits
│   ├── /tungkol/malampaya    MSPLS & marine conservation
│   └── /tungkol/populasyon   Demographics
│
├── /kontak · /kalendaryo · /form
├── /admin/*  /api/*
└── /privacy · /accessibility · /offline · /sitemap.xml · /robots.txt · /manifest.webmanifest
```

`⌁` = route reserved, model built, UI dark.

**English mirror** at `/en/*`, identical structure, **complete** translation. No partial-language pages. Filipino canonical: `hreflang` `fil`, `x-default` → Filipino.

---

## 3. NAVIGATION MODEL

**Header (sticky, 56px):** seal 32px + wordmark · **Emergency (always, all breakpoints)** · language toggle · menu trigger.

**Primary nav — 5 items:** Ngayon · Serbisyo · Balita · Ligtas · Higit pa.
Everything else lives under "Higit pa" or the footer.

**Not present:** mega-menu, carousel, hamburger-only desktop nav, FAB.

**Footer = full sitemap.** It is real navigation for low-literacy and screen-reader users.

**Search:** client-side over a prebuilt static index, ≤25 KB gzipped, lazy-loaded on focus. Must find ordinances by number and services by colloquial name — `clearance`, `cedula`, `indigency`, `barangay ID`, `blotter`. Degrades to a server-rendered results page without JS.

---

## 4. URL RULES

Filipino slugs on the Filipino tree · lowercase, hyphenated · **no dates in paths** (dates change, meaning doesn't) · no IDs in public URLs · permanent — a changed URL ships a 301.

---

## 5. DEPTH BUDGET

| Task | Taps from home | Route |
|---|---|---|
| Sea condition / next boat | **0** | above the fold |
| Emergency numbers | **1** | header button |
| Clearance requirements | **2** | quick action → `/serbisyo/barangay-clearance` |
| Evacuation site | **2** | Emergency → `/ligtas/likasan` |
| An ordinance PDF | **3** | Higit pa → Transparency → Ordinansa |

Anything a resident needs while standing at the pier is ≤2 taps.

---

## 6. CONTENT-TYPE → ROUTE MAP

`Advisory` → EmergencyBanner sitewide + `/ligtas` · `SeaCondition`/`BoatSchedule` → `/` + `/ligtas/dagat` · `Announcement` → `/` + `/balita` · `HealthOutreach` → `/` + `/kalendaryo` · `Service` → `/serbisyo/*` · `Official` → `/opisyal/*` · `Ordinance`/`Disclosure` → `/transparency/*` · `Project` → `/` + `/transparency/proyekto` · `EvacuationSite`/`Hotline` → `/ligtas/*`

**Provisional:** module order on `/` depends on the Facebook content taxonomy (blocked, B1). Re-ordered after 30 days of real posting.
