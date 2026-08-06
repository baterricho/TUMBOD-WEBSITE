# Barangay Tumbod — Opisyal na Website

Taytay, Palawan, Philippines · [barangaytumbod.gov.ph](https://barangaytumbod.gov.ph) *(domain not yet secured)*

A website for the person standing on the pier with one bar of signal who needs to know whether the boat is running.

**Status:** working site, incomplete content. It builds, every route passes its performance budget, and it works offline. It **cannot go public yet** — see [CONTENT-TODO.md](CONTENT-TODO.md).

---

# PART A — PARA SA BARANGAY
### (For barangay staff — English follows each section)

## Paano mag-post ng anunsyo — 5 hakbang

> ⏳ **Hindi pa ito magagamit.** Ang CMS (ang lugar kung saan ka mag-po-post) ay hindi pa nakakabit. Ito ang susunod na gagawin. Kapag handa na ito, ganito ang magiging hakbang:

1. Buksan ang `/admin` at mag-log in.
2. Pindutin ang **+ Bagong Anunsyo**.
3. Piliin ang uri sa pamamagitan ng larawan — anunsyo, kalusugan, ayuda, babala.
4. I-type ang pamagat at ang mensahe. **Awtomatiko itong nase-save tuwing 2 segundo** — kahit mawala ang signal, hindi mawawala ang sinulat mo.
5. Pindutin ang **I-publish ngayon** o **I-schedule**.

Makikita ito sa website sa loob ng 10 segundo. May **30 segundo** kang makakabawi kung may mali.

*How to post an announcement — 5 steps. Not yet available; the CMS is the next thing to be built.*

## Ang pang-araw-araw na gawain: lagay ng dagat at biyahe ng bangka

Ito ang pinakamahalagang bagay na ia-update araw-araw. Dalawang pindot lang ito kapag handa na ang admin.

Sa ngayon, ang website ay nagpapakita ng `[[NEEDS DATA]]` sa halip na hulaan ang lagay ng dagat. **Mas mabuting walang laman kaysa maling sagot.**

## Bakit may mga kulay-rosas na `[[NEEDS DATA]]` sa website?

Dahil hindi pa namin alam ang totoong sagot, at **hindi kami hahaka-haka**.

Ang isang maling numero ng hotline sa panahon ng bagyo ay mas delikado kaysa sa walang numero. Kaya bawat kulang na impormasyon ay malinaw na nakikita, at **hindi maaaring i-publish ang website habang may natitira pang mahalagang kulang.**

Ang listahan ng kailangan ay nasa [CONTENT-TODO.md](CONTENT-TODO.md).

## Sino ang tatawagan kapag may sira

`[[NEEDS DATA: pangalan at numero ng technical custodian — source: kayo po]]`

---

# PART B — FOR DEVELOPERS

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output to dist/
npm run preview
```

## Checks

```bash
npm run typecheck            # astro check — strict TS, no `any`
npm test                     # 149 Playwright tests: critical paths, axe, offline, no-JS
npm run measure              # per-route byte budgets; exits 1 if over
npm run check:placeholders   # fails while launch-blocking data is missing
npm run check:demo           # fails if demo data leaked into a normal build
npm run check:no-demo        # production deploy gate — refuses a demo artefact
```

All of these are **CI blockers**, not warnings.

## Demo mode — showing the barangay a populated site

The real site is deliberately full of `[[NEEDS DATA]]` markers, which makes it hard to judge the design. Demo mode fills it with sample content.

```bash
npm run dev:demo     # dev server with sample content
npm run build:demo   # static build with sample content
npm run preview
```

**It cannot reach production, by construction:**

1. Off unless `PUBLIC_DEMO_MODE=true`. One switch, in `src/lib/content/active.ts` — pages never import `demo.ts` directly.
2. Every page carries an undismissable purple banner: *"DEMO — HINDI TOTOO ANG MGA IMPORMASYON DITO."*
3. **Phone numbers render as plain text, never `tel:` links**, and are labelled "hindi gumagana". The one genuinely dangerous outcome of a demo build is someone tapping a fake number in an emergency, and a link invites exactly that.
4. Numbers use the non-assigned `0999-000-00XX` pattern; people are named Philippine "John Doe" style with a `(halimbawa)` suffix.
5. `npm run check:demo` fails the build if demo markers appear without the flag. `npm run check:no-demo` fails outright on a demo artefact — put it in the deploy step.

When real content arrives, delete `src/lib/content/demo.ts`. Nothing else references it.

## Current measurements (2026-08-04)

| Route | HTML | Font | JS | Total | Budget |
|---|---|---|---|---|---|
| `/` | 9.4 KB | 15.3 KB | **0 KB** | **24.7 KB** | 150 KB |
| `/ligtas` | 8.1 KB | 15.3 KB | **0 KB** | **23.5 KB** | 60 KB |
| `/ligtas/hotline` | 7.2 KB | 15.3 KB | **0 KB** | **22.6 KB** | 60 KB |
| `/design-system` | 11.7 KB | 15.3 KB | **0 KB** | 27.0 KB | — |

CSS is inlined (0 extra requests). The font column is the **preloaded** face only; the other four load on demand and are precached by the service worker. Images (40 KB budgeted) are not yet in the build.

`astro check`: **0 errors, 0 warnings, 0 hints** across 48 files.

## Why Astro and not Next.js

The project started on Next.js, as the brief suggested. Measured, Next 16 + React 19 shipped **172 KB gzipped of JavaScript to pages with zero client components** — the App Router hydration floor, not application code. The homepage came to 185.9 KB against a 150 KB budget, and `/ligtas` was 3× over.

That budget is not an engineering preference. Persona P1 pays for those bytes out of a ₱50 prepaid load, on a site that is almost entirely static text.

Ported to Astro: **185.9 KB → 9.0 KB, and 0 KB of JS.** Nothing in the design was lost, because nothing in the design depended on React. Full record in [PERF-PLAN.md](PERF-PLAN.md) §1b–1c.

**Standing rule: budgets are not relaxed to fit an implementation. The implementation is chosen to fit the budget.**

## Architecture

```
src/
  pages/         routes (file-based)
  layouts/       Base.astro — skip link, header, main, footer, SW registration
  components/    design-system primitives, all server-rendered
  features/
    chart/       the signature element's geometry
  lib/
    tokens/      THE single source of design tokens
    i18n/        fil (canonical) + en
    time/        Asia/Manila formatters — never bare new Date() in render
    content/     types, static fallbacks, placeholder system
  styles/
public/          sw.js, manifest, icons, robots.txt
scripts/         measure-route.mjs, check-placeholders.mjs
```

**Rules:** components consume semantic tokens only, never raw hex · no component sets its own outer margin (`Section` owns rhythm) · all dates via `lib/time` · Filipino strings live in `lib/i18n`, never inline.

## Changing a colour correctly

Edit `src/lib/tokens/tokens.css` only. Three tiers: primitive (`--palette-*`, each with its physical source in a comment) → semantic (`--surface`, `--ink`, `--sea-*`) → component. Never put a hex in a component.

Two colours are **fill-only** and must never carry text: `--accent` (1.63:1 on surface) and `--sea-moderate`. Darkened siblings exist for text.

## Offline

Four cache tiers in `public/sw.js`. Tier 1 — `/ligtas/*`, hotlines, `/offline`, home — is precached and never evicted. `/ligtas` renders from static fallbacks in `src/lib/content/fallback.ts` with no CMS dependency, so it has no single point of failure.

Bump `CACHE_VERSION` in `sw.js` when the tier lists change.

## Adding a page

1. Create `src/pages/<name>.astro`.
2. Wrap in `<Base locale pathname title description>`.
3. Use `<Section>` for rhythm; never set margins on content.
4. Add it to `SiteFooter.astro` — the footer is the real sitemap and is how screen-reader and low-literacy users navigate.
5. Run `npm run measure`.

## Adding content that isn't known yet

Never invent it. Use the placeholder system:

```ts
import { needsData } from '@/lib/content/placeholder'

const FEE = needsData('bayad sa clearance', 'Barangay Treasurer', true)
//                     what is missing      who can supply it   launch-blocking
```

Render with `<Placeholder value={FEE} />`. It becomes visible, auditable, and blocks the production build.

## Known gaps

| Gap | Impact |
|---|---|
| **English mirror covers 3 of 11 routes** | `/en`, `/en/ligtas`, `/en/ligtas/hotline` are live and verified. The pattern is established — extract the page body to `src/views/`, add a thin wrapper in `src/pages/en/`. Both dictionaries are already complete, so remaining routes are wrappers, not translation work. |
| **Chart geometry is a declared schematic** | Real OSM coastline not yet extracted. Labelled in the UI; launch-blocking. Instructions in `src/features/chart/geometry.ts`. |
| **No CMS** | All content is static fallbacks behind the `ContentSource` adapter in `src/lib/cms/source.ts`, so adding one changes no page or component. **Recommendation reverses the spec — see [DECISION-cms.md](DECISION-cms.md), awaiting approval.** |
| **No test suite** | CI workflow exists with build, typecheck, budget, placeholder, third-party and audit gates. Playwright/axe/Lighthouse jobs are not written yet. |
| **Palette provenance is second-tier** | Sourced from documented physical referents rather than the barangay's own photographs, because the Facebook extraction is blocked. Semantic tokens make re-derivation a one-file change. |

## Fonts

Self-hosted, served from our own origin, **zero third-party requests**. Sourced from Fontsource (SIL OFL) via npm and copied into `public/fonts`.

| Face | Weight | Size | Use |
|---|---|---|---|
| Archivo Narrow | 600 | 12.1 KB | display |
| Source Sans 3 | 400 | 15.7 KB | body — **the only preload** |
| Source Sans 3 | 600 | 15.7 KB | body strong |
| Source Sans 3 | 400 italic | 15.8 KB | water labels (the chart rule) |
| IBM Plex Mono | 400 | 14.7 KB | figures |
| | | **72.2 KB** | budget 100 KB |

The `latin` subset carries the Filipino diacritics we need (á é í ó ú ñ Ñ) — checked, not assumed. Metric-matched fallbacks in `src/styles/fonts.css` hold layout still while faces load, so the page does not jump under someone's thumb on a slow connection.

To refresh: `npm i -D @fontsource/<face>` then copy the required `latin-<weight>-<style>.woff2` files into `public/fonts`.

## Roadmap

**v1 (to launch):** fill launch-blocking content · self-host fonts · real chart geometry · English mirror · CMS + admin · tests and CI · axe and Lighthouse gates.

**v1.1:** Facebook mirror · site search · MSPLS zoning page (genuinely useful and nobody publishes it readably).

**v2:** resident portal — the data model already reserves `residentId` and isolates PII · online document requests, currently dark behind `Service.acceptsOnline` (decision B5).

## Documents

[BUILD-PROMPT.md](BUILD-PROMPT.md) · [RESEARCH.md](RESEARCH.md) · [DISCOVERY-QUESTIONS.md](DISCOVERY-QUESTIONS.md) · [FACEBOOK-EXTRACTION-WORKSHEET.md](FACEBOOK-EXTRACTION-WORKSHEET.md) · [DESIGN-PLAN.md](DESIGN-PLAN.md) · [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) · [WIREFRAMES.md](WIREFRAMES.md) · [IA.md](IA.md) · [UX-STRATEGY.md](UX-STRATEGY.md) · [A11Y-PLAN.md](A11Y-PLAN.md) · [PERF-PLAN.md](PERF-PLAN.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [CONTENT-TODO.md](CONTENT-TODO.md)
