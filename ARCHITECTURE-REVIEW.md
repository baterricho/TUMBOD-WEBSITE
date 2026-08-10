# Architectural review — Barangay Tumbod

**Date:** 2026-08-07
**Scope:** whole repository, before any refactor.
**Method:** measured, not estimated. Every number below came from the tree.

---

## 1. What is actually here

| Area | Files | Lines | Role |
|---|---:|---:|---|
| `src/pages` | 48 | 1,245 | routing only — thin shells over views |
| `src/views` | 21 | 2,605 | page bodies, locale-aware |
| `src/components` | 25 | 4,309 | shared UI + the five mega panels |
| `src/lib` | 22 | 4,835 | domain: content, cms, i18n, time, tokens |
| `src/scripts/admin` | 3 | 2,474 | the CMS client |
| `src/styles` | 9 | 5,028 | design system |
| `tests` | 7 | 1,054 | 522 passing |
| `scripts` | 9 | 889 | build gates |

**The routing layer is already thin.** 48 page files hold 1,245 lines — about
26 lines each, and most of that is a `<Base>` wrapper. Pages do not contain
business logic. That is the property the proposed restructure is usually
introduced to achieve, and it is already true.

**A feature directory convention already exists**: `src/features/chart/`
holds the map geometry and the barangay boundary.

---

## 2. The proposed structure, assessed honestly

The brief proposes `app/ core/ features/ shared/{ui,hooks,lib,services,utils,constants,icons,types,styles}`.
Parts of that are right for this project. Parts are not, and adopting them
wholesale would make the codebase worse. Taking each:

### 2.1 `shared/hooks/` — does not apply

**This site ships no UI framework.** No React, no Vue, no Svelte, no Solid.
It is Astro components rendering to static HTML, plus roughly 0.6 KB of inline
vanilla JavaScript on public pages. There are no hooks, there is no hook-shaped
problem, and an empty `hooks/` directory is a promise the codebase cannot keep.

**Not adopted.**

### 2.2 `features/{home,services,news,tourism,…}` — mostly churn

Moving 21 views and 48 pages into eleven feature folders would touch every
import in the repository. Against that cost:

- Astro's file-based routing means **`src/pages` already is the feature
  boundary**. `/serbisyo/*` is the services feature; it cannot be anywhere else.
- The views are already one-per-feature and already separated from routing.
- Six verification gates, a placeholder scanner that greps built output, and a
  route-discovery test all key off current paths.

The measurable gain is a nicer-looking tree. The measurable cost is a
whole-repository diff across a codebase with 522 tests and a launch gate.

**Partially adopted:** `src/features/` stays for genuinely self-contained
domain logic (the chart is the existing example). Views and pages stay put.

### 2.3 `shared/ui/{Button,Card,Input,Select,Dropdown,Modal,Dialog,Table,Tabs,Badge,Alert,Toast,Carousel,Hero,Timeline,Gallery,Map,StatisticCard}` — half of these have no caller

Measured reuse of the current components:

| Component | Used by |
|---|---:|
| `Section` | 24 |
| `Icon` | 13 |
| `Placeholder` | 9 |
| `PhoneNumber` | 4 |
| `SampleChip` | 3 |
| everything else | 1–2 |

`Section`, `Icon` and `Placeholder` are already the shared primitives, and they
are already shared. Of the proposed list, **Modal, Dialog, Tabs, Table, Toast,
Timeline and Dropdown have no consumer on the public site** — and the admin
already has its own `toast`, `confirmDialog` and `promptDialog` in
`scripts/admin/ui.ts`, which is correct, because the admin is the only route
allowed to ship a JS bundle.

Building unused primitives on a site with a **60 KB budget on `/ligtas`** is not
free. Every one of them would be inlined CSS on every page.

**Not adopted as a batch.** A primitive gets extracted when it has a second
caller — which is how `Section`, `Icon` and `Placeholder` came to exist.

### 2.4 Service layer — already exists, needs consolidating not creating

The brief asks for `news.service.ts`, `gallery.service.ts` and so on, with no
API calls in presentation components. The current state:

- `lib/cms/build.ts` — build-time PostgREST reads, memoised, fails soft
- `lib/cms/live.ts` — client-time reads for panel hydration
- `lib/content/articles.ts` — news + events, DB-first with static fallback
- `lib/content/live-collections.ts` — projects, hotlines, tourism, FAQ, business, gallery

**13 views and components already call `await getX()` rather than fetching.**
The separation the brief asks for is in place. What is genuinely wrong is
described in §3.1 — three overlapping content modules with unclear precedence.

**Adopted as consolidation, not creation.**

### 2.5 Admin separation — real, and partially done

`src/pages/admin/index.astro` is already the only route shipping a third-party
bundle, already `noindex`, already excluded from the sitemap and service
worker. The genuine problem is §3.3: `scripts/admin/main.ts` is **1,538 lines**.

**Adopted.**

### 2.6 Media library — already built

Central upload, drag-and-drop, client-side optimisation, thumbnails, folders,
tags, search, soft delete with restore, and a picker consumed by every `image`
field. `scripts/admin/media.ts`, 631 lines. Nothing to build; see §3.5 for the
one real gap.

**Already satisfied.**

### 2.7 CMS-driven content — mostly done as of yesterday

News, events, projects, tourism, businesses, FAQs, hotlines and the gallery all
read the database at build time with checked-in fallbacks. Remaining hardcoded:
**navigation, footer, social links, hero slides, and the officials roster** —
the last deliberately (see §3.6).

**Adopted for the remainder.**

---

## 3. Findings, ranked by what they cost

### 3.1 Three content modules with unclear precedence — **highest**

`lib/content/active.ts` is imported by **16 files** and still exports
`ANNOUNCEMENTS`, `PROJECTS`, `ATTRACTIONS`, `BUSINESSES`, `FAQ` and `CALENDAR`
— all of which are `[]` outside demo mode and all of which have been superseded
by `articles.ts` and `live-collections.ts`.

Nothing tells a reader which to use. A new page wired to `active.PROJECTS`
would compile, pass every test, and render an empty list forever — which is
exactly the class of bug that made `/proyekto` blank for weeks.

**Fix:** one documented precedence, and make the superseded exports impossible
to reach by accident.

### 3.2 Locale prefixing duplicated 17 times — **measurable DRY violation**

`const p = fil ? '' : '/en'` appears in **16 files**, while `prefix()` already
exists in `lib/content/menu.ts` and is used 10 times. Two idioms for one
concept, and the hand-rolled one is winning.

This is the highest-count duplication in the repository and it is trivially
fixable.

### 3.3 `scripts/admin/main.ts` is 1,538 lines — **maintainability**

Login, shell, routing, dashboard, analytics, collection lists, record forms,
hero slider and activity feed in one file. Every admin change touches it.

### 3.4 Month names duplicated in 3 files

`['ENE','PEB','MAR',…]` in `EventsView.astro`, `mega/MegaNews.astro` and
`LiveContent.astro`. A locale bug would need three correct edits.

### 3.5 Media is uploaded centrally but referenced as bare URLs

`announcements.image_url` stores a URL string with no join to `media`, so
dimensions are unavailable and CLS is held by CSS `aspect-ratio` alone. Works,
but the library cannot answer "what is using this file?" before a delete.

### 3.6 Officials cannot be edited — **known, deliberate**

`fallback.ts` groups the roster by body (`sangguniang_barangay`,
`sangguniang_kabataan`); the `officials` table has a flat free-text `committee`
column. No reliable mapping exists. Documented in `live-collections.ts`.

### 3.7 ~76 KB of CSS inlined into every page

`hero.css` and `mega.css` ship on routes with no hero. Pre-existing, and the
largest remaining performance lever. Item 4 of `DESIGN-BRIEF-v3.md`.

---

## 4. What I changed in this pass

Ordered by value ÷ risk. Everything else in §3 is documented and left alone
deliberately — a review that ends in a whole-repository diff is not a review.

1. **§3.2 — one locale routing helper**, replacing 17 hand-rolled prefixes.
2. **§3.4 — one month-name source**, replacing 3 copies.
3. **§3.1 — documented precedence** in `active.ts`, with the superseded
   exports marked and explained at their definition.
4. **§3.3 — admin split** into feature modules behind the existing entry point.

## 5. What I deliberately did not change

- **The view/page split.** It works and it is already thin.
- **Component extraction beyond existing primitives.** No second caller, no
  primitive.
- **`cms/build.ts` vs `cms/live.ts`.** They look duplicative and are not: one
  runs on the build machine and may fail the build loudly, the other runs in a
  resident's browser on 2G and must fail silently. Merging them would force one
  policy on both.
- **The officials roster.** §3.6 — needs a schema change, not a refactor.
- **The CSS split.** Real, but it is a performance project with its own
  measurements, not a folder move.
