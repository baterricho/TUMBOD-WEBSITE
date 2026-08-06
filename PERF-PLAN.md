# PERF-PLAN.md — Per-route byte allocation

**Spec reference:** BUILD-PROMPT.md §22
**Rule:** budgets are CI-enforced. A PR that exceeds one **fails**. Every new feature states its byte cost in the PR description.

**Why this is a moral requirement, not an engineering preference:** persona P1 pays for these bytes out of a ₱50 prepaid load. Facebook is zero-rated for her; the open web is not.

---

## 1. ROUTE BUDGETS (transferred, brotli, cold cache)

| Route | HTML | CSS | JS | Fonts | Images | **Total** |
|---|---|---|---|---|---|---|
| `/` | 30 | 14 | 40 | 60 | 6 (SVG) | **≤150 KB** |
| `/ligtas` | 20 | 14 | 8 | cached | 0 | **≤60 KB** |
| `/serbisyo/[slug]` | 18 | 14 | 6 | cached | 0 | **≤70 KB** |
| `/balita/[slug]` | 20 | 14 | 4 | cached | 60 | **≤120 KB** |
| `/opisyal` | 22 | 14 | 4 | cached | 40 | **≤110 KB** |
| `/transparency/*` | 24 | 14 | 6 | cached | 0 | **≤80 KB** |
| Any route | — | — | — | — | — | **≤200 KB hard ceiling** |

---

## 1b. ⚠ MEASURED RESULT — 2026-08-04 — BUDGET FAILED

First real measurement, `node scripts/measure-route.mjs`, gzip level 9, first-load assets only (prefetch hints for other routes excluded):

| Route | HTML | CSS | JS | Total | Budget | Verdict |
|---|---|---|---|---|---|---|
| `/` | 9.9 KB | 4.0 KB | **172.0 KB** | **185.9 KB** | 150 KB | ❌ **FAIL** |
| `/ligtas` | 7.6 KB | 4.0 KB | **172.0 KB** | **183.6 KB** | 60 KB | ❌ **FAIL (3×)** |
| `/design-system` | 14.2 KB | 4.0 KB | 168.5 KB | 186.7 KB | n/a | — |

**Fonts and images are not yet in the build.** The 60 KB font allocation on `/` is still unspent, so the real figure will be worse.

### Diagnosis

The JS is **not** application code. The site currently has **zero client components** — every component is a Server Component and every interactive affordance is a plain link. 573 KB raw / 172 KB gzipped is the Next.js 16 + React 19 App Router baseline: the React client runtime, the router, and hydration plumbing for a page that needs none of it.

**This cannot be fixed by writing better components.** There are none to remove.

### Ruling

§2 below pre-committed to this outcome: *"If the Next.js baseline alone exceeds ~30 KB in Phase 5, the framework choice gets re-examined against this budget rather than the budget being relaxed."* The baseline is 5.7× that.

Relaxing the budget would mean persona P1 pays roughly **4× the data** to read a page that is, on this site, entirely static text. That is the one trade the brief's hard constraints do not permit (BUILD-PROMPT.md §2, §22).

**Escalated to the client 2026-08-04. Decision: port to Astro.**

---

## 1c. ✅ RE-MEASURED AFTER PORT TO ASTRO — 2026-08-04 — ALL BUDGETS PASS

Same script, same method, same gzip level.

| Route | HTML | CSS | JS | Total | Budget | Was (Next) |
|---|---|---|---|---|---|---|
| `/` | 4.7 KB | 4.1 KB | **0.0 KB** | **8.8 KB** | 150 KB | 185.9 KB |
| `/ligtas` | 3.3 KB | 4.1 KB | **0.0 KB** | **7.4 KB** | 60 KB | 183.6 KB |
| `/ligtas/hotline` | 2.4 KB | 4.1 KB | **0.0 KB** | **6.5 KB** | 60 KB | — |
| `/design-system` | 6.9 KB | 4.1 KB | **0.0 KB** | **11.0 KB** | n/a | 186.7 KB |

**21× smaller on the homepage. Zero JavaScript shipped on any route.**

Every design decision survived the port unchanged — tokens, the chart, the sea-state escalation, the land/water italic rule, the i18n layer, the placeholder system, the content model. Only component syntax and routing changed, because none of the design depended on React.

Headroom now: the homepage has **141 KB** of its budget unspent, against a 60 KB font allocation and a 40 KB image allocation still to come. `/ligtas` has 52 KB spare and needs no images at all.

**Standing rule reaffirmed:** budgets are not relaxed to accommodate implementation choices. The implementation is chosen to fit the budget.

---

## 1d. ✅ MEASURED CORE WEB VITALS — 2026-08-04

`npm run test:perf` — Playwright + CDP, **Slow 4G (1.6 Mbps, 150 ms RTT) and 4× CPU throttling**, 412×823 viewport. That is persona P1's phone, not a developer laptop.

| Route | LCP | Budget | CLS | Budget |
|---|---|---|---|---|
| `/` | **2,224 ms** | 2,500 | **0.000** | 0.05 |
| `/ligtas` | **1,576 ms** | 2,500 | **0.000** | 0.05 |
| `/ligtas/hotline` | **1,440 ms** | 2,500 | **0.000** | 0.05 |
| `/serbisyo/barangay-clearance` | **1,504 ms** | 2,500 | **0.000** | 0.05 |

**CLS is zero on every route.** The metric-matched font fallbacks in `styles/fonts.css` are doing their job — the page does not move under someone's thumb while the webfont arrives.

**Honest note on the homepage:** 2,224 ms passes the 2,500 ms budget but misses the 2,000 ms *target* in §6. The LCP element is the inline chart SVG, so there is no network round trip to remove; the remaining cost is CPU parse under 4× throttling. Not a defect, but the one route with the least headroom — worth re-checking if anything is added above the fold.

**Lighthouse CI** is configured in `lighthouserc.json` and runs in GitHub Actions. It cannot run on this Windows machine: `chrome-launcher` throws `EPERM` removing its own temp directory on teardown, regardless of `TMPDIR`. These CDP measurements are what verify the budget locally.

---

## 2. HOMEPAGE JS ALLOCATION — the tightest budget (≤40 KB)

| Item | Budget | Notes |
|---|---|---|
| Next.js runtime + hydration floor | ~28 KB | the unavoidable baseline |
| `LivingChartHeader` collapse | 2 KB | scroll listener + toggle |
| `OfflineIndicator` | 1 KB | `navigator.onLine` + SW message |
| Service worker registration | 1 KB | |
| `LanguageToggle` | 0 | it is an anchor |
| Theme toggle | 1 KB | |
| Everything else on `/` | **0** | Server Components |
| **Headroom** | ~7 KB | |

**If the Next.js baseline alone exceeds ~30 KB in Phase 5, the framework choice gets re-examined against this budget rather than the budget being relaxed.** Flagged now so it is a decision, not a discovery.

---

## 3. FONTS — ≤100 KB total

| Face | Weights | Subset | Est. |
|---|---|---|---|
| Source Sans 3 | 400, 600 | Latin + Filipino diacritics + punctuation | ~44 KB |
| Archivo Narrow | 600 | Latin + diacritics, display glyphs only | ~18 KB |
| IBM Plex Mono | 400 | **digits, currency, punctuation, uppercase only** | ~8 KB |
| **Total** | | | **~70 KB** |

WOFF2 only · `font-display: swap` · **preload Source Sans 3 400 only** · `size-adjust` fallback metrics to eliminate CLS. Estimates are **measured in Phase 5**, not trusted.

---

## 4. THE CHART — ≤12 KB gzipped

OSM coastline (ODbL, attributed in legend) + GEBCO depth bands. Douglas–Peucker simplified at a **recorded** tolerance. No map library, no tiles, no runtime JS to render. Inline (not a request) so it costs nothing extra round-trip and renders without JS.

---

## 5. HARD RULES

- **Zero third-party requests on public routes.** No CDN fonts, no external analytics, no tile maps, no Facebook SDK, no YouTube, no reCAPTCHA. Facebook content is mirrored **server-side**, never iframed.
- Images: AVIF + WebP fallback, `srcset`/`sizes`, explicit dimensions, lazy below fold, exactly **one** `fetchpriority="high"` per route.
- CSS: single file, purged, **no CSS-in-JS runtime**.
- No polyfills below the support matrix (Chrome/Android WebView ≥100, Safari iOS ≥15, Firefox ≥100).
- Bundle analysis on every PR, diffed against `main`, posted as a comment.

---

## 6. TIMING BUDGETS — Moto G Power class, Slow 4G

| Metric | Budget |
|---|---|
| LCP | ≤2.5s (**target 2.0**) |
| INP | ≤200ms |
| CLS | **≤0.05** |
| TTFB | ≤600ms |
| TBT | ≤200ms |
| Lighthouse Perf / A11y / BP / SEO | ≥95 / **100** / ≥95 / ≥95 |

**LCP element on `/` is the chart SVG** — inline, server-rendered, no network round trip. That is the main reason the 2.0s target is achievable.

---

## 7. OFFLINE CACHE BUDGET (≤25 MB total)

| Tier | Content | Strategy | Eviction |
|---|---|---|---|
| **1 Critical** | `/ligtas/*`, hotlines, evacuation sites, checklist, BDRRMC, `/offline`, shell, fonts, CSS, icon sprite | precache on install, stale-while-revalidate, refresh every visit | **never** |
| 2 Important | `/`, `/serbisyo/*`, `/opisyal`, `/kontak` | stale-while-revalidate | LRU, keep ≥20 |
| 3 Nice | `/balita/*`, `/transparency/*`, images | network-first, cache fallback | LRU, 50 entries / 20 MB |
| 4 Never | admin, API mutations | network only | — |

Tier 1 is estimated at **<400 KB** — the entire disaster system fits in less than three homepage loads.

---

## 8. ENFORCEMENT

CI blockers: Lighthouse CI per route · bundle size vs. §1 with a diff comment · font payload check · **third-party request count must be 0** · offline test (`/ligtas` + hotlines render with network disabled) · no-JS render test on every route.

---

## 9. RISKS

1. **Next.js hydration floor vs. the 40 KB homepage budget** — see §2.
2. **GEBCO resolution** may be too coarse for a 6.4 km island; if so the depth motif is declared stylised (an honesty issue, not a byte issue).
3. **Images are the only elastic budget.** If real photography arrives, `/balita/[slug]` and `/opisyal` are where it lands, and both have hard ceilings.

---

## 10. MEASURED, 2026-08-05 — THE PERF HARNESS WAS BROKEN; THE PAGES ARE FINE

**Result: all four budgeted routes pass. The earlier "homepage misses LCP"
conclusion recorded here was WRONG, and is corrected below rather than deleted.**

### What was actually broken

Three defects in the measurement, none in the site:

1. **`perf.spec.ts` ran in two projects at once** (`android-phone` and
   `desktop`), launching duplicate CPU-throttled browsers to measure the same
   thing. `measure()` builds its own browser at a fixed 412×823 viewport, so
   neither project's device profile was ever applied.
2. **Throttled browsers ran in parallel with the other 42 routes.** A quarter of
   a *contended* core is not a quarter of a core. This also crashed unrelated
   tests — an a11y run would die with "Protocol error … session closed" about
   one full run in two, which looked like an accessibility failure.
3. **Single-sample measurement.** The same unchanged homepage measured 2456,
   2532, 2692, 2804, 3104, 3220 and 3632 ms across consecutive runs.

### The correction

I diagnosed a real defect from that noise and wrote it up here: that the
homepage's 15.2 KB inline chart SVG cost ~670 ms of main-thread work and pushed
LCP over budget. Four remedies were proposed, including coarsening the coastline
and rasterising the chart.

**That was wrong.** The numbers were inflated by my own leftover preview servers
and probe scripts competing for CPU. Measured on a quiet machine, the same
build, unchanged:

| Route | LCP (median of 3) | Budget | |
|---|---|---|---|
| `/` | **872–1044 ms** | 2500 ms | ✅ |
| `/ligtas` | 764 ms | 2500 ms | ✅ |
| `/ligtas/hotline` | 1096 ms | 2500 ms | ✅ |
| `/serbisyo/barangay-clearance` | 780 ms | 2500 ms | ✅ |

CLS 0.000–0.025 throughout, against a 0.05 budget.

**No change was made to the chart, the geometry, or any budget.** Had the
harness been fixed after the diagnosis instead of before, the site would have
been degraded to satisfy a broken instrument.

### The fixes that stayed

- `perf` is now its own project, `dependencies` on the other three so it runs
  **last and alone**; `fullyParallel: false` so routes are measured one at a
  time. Not `mode: 'serial'` — that aborts remaining routes on first failure,
  hiding exactly the numbers needed to diagnose one.
- Every route is the **median of three runs**; worst-case for CLS, because a
  shift that happens sometimes is one a resident sometimes sees.
- A `beforeAll` warms the server so the first route does not absorb cold start.

### What was genuinely learned

- **The LCP element is a placeholder** — `SPAN.placeholder`, 17,550 px²,
  `[[NEEDS DATA: ruta ng bangka…]]`. Real content will shrink it.
- `first-paint`, `first-contentful-paint` and LCP fire at the same instant, so
  nothing is render-blocked after HTML; fonts complete ~1.7 s before paint under
  throttling and `font-display: swap` is working.
- The homepage carries 15.2 KB of inline chart SVG against `/ligtas`'s 2.8 KB.
  That difference is real and worth remembering if the budget ever tightens — it
  is simply not costing enough to matter today.

⚠️ **Never trust a perf number taken while anything else runs on the machine.**
Close stray `astro preview` servers first; `npm test` starts its own.
