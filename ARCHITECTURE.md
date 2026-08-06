# ARCHITECTURE.md — Phase 4

**Spec reference:** BUILD-PROMPT.md §25–§27
**Status:** Approved into Phase 5 by instruction 2026-08-04.

---

## 1. STACK

> **REVISED 2026-08-04 after measurement.** Originally specified Next.js. Next 16 + React 19 shipped **172 KB gzipped of JS to pages with zero client components** — the App Router hydration floor, unfixable by writing better components. Ported to Astro; the homepage went from 185.9 KB to **8.8 KB with 0 KB of JS**. See `PERF-PLAN.md` §1b–1c.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 7 (static)** | Ships zero JS by default; islands only where interactivity is genuinely needed. This site is ~99% static text |
| Language | **TypeScript strict** + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | `any` banned |
| Styling | **Tailwind v4, CSS-first `@theme`** | Tokens live in CSS and *are* the theme — no config mirror to drift |
| Content | **Payload CMS** + Postgres (Phase 5b) | Non-technical editor, no build step, RBAC, self-hostable |
| DB | **Postgres** (Neon/Supabase) | |
| Deploy | **Vercel** | |
| Tests | Vitest · Playwright · axe-core · Lighthouse CI | |

**Rendering:** static-first. Every public page statically generated; dynamic data (sea condition, boat status, advisories) via on-demand ISR with CMS-triggered invalidation. **Nothing on a public route is client-fetched on first paint.**

---

## 2. PROGRESSIVE ENHANCEMENT — MANDATORY

- Every page renders complete and readable with **JS disabled**.
- Navigation is plain links. Language toggle is an anchor to the mirrored URL.
- Checklists render as static lists; checkboxes are enhancement.
- Search degrades to a server-rendered results page.
- **CI job loads every route with JS disabled and asserts primary content is present.**

---

## 3. FOLDER STRUCTURE

```
src/
  app/
    (public)/            fil routes
    en/(public)/         en mirror
    design-system/       source of truth, noindex
    api/v1/
    layout.tsx  globals
  features/
    chart/               LivingChartHeader (signature element)
    emergency/           banner, sheet, hotlines
    services/  news/  transparency/  officials/
  components/ui/         design-system primitives ONLY
  lib/
    tokens/              THE single source of design tokens
    i18n/                fil + en dictionaries, resolver
    content/             static fallbacks incl. ligtas.json
    time/                Asia/Manila formatters
    cms/  db/  validation/  utils/
tests/  e2e/ a11y/ perf/ offline/
```

**Rules:** no business logic in route files · no DB access outside `lib/db` · Zod schemas defined once, shared client+server · **all dates via `lib/time` formatters, never bare `new Date()` in render** · a feature imports another feature only through its public `index.ts` (ESLint boundary rule).

---

## 4. DATA MODEL (Postgres)

Tables mirror `BUILD-PROMPT.md` §15.1, with:

- **`service_request_pii`** — PII split from `service_requests` by FK, encrypted at rest, retention-purged. Built now, dark, per decision B5.
- **`audit_log`** — append-only; app role has no UPDATE/DELETE grant. `actor_id, action, entity_type, entity_id, diff jsonb, ip, created_at`.
- Bilingual fields as **sibling columns** (`title_fil`, `title_en`) — independently indexable and validatable, not a JSON blob.
- `boat_schedule.status_reason` — `sea_conditions | pcg_sailing_ban | operator | other` (`RESEARCH.md` §8A).
- `hotline.verified_at` **required**; >90 days raises an admin task.
- Soft deletes (`deleted_at`); hard delete only via audited admin action.
- GIN index on the ordinance search vector; indexes on every slug, `published_at`, and FK.

---

## 5. API

`/api/v1/` — public GETs cacheable and unauthenticated; all mutations authenticated and rate-limited.

```
GET  /conditions            sea + boat + office status
GET  /advisories/active
GET  /announcements?category=&page=
GET  /services  /officials  /hotlines
POST /revalidate            CMS webhook, signed
⌁ POST /requests            RESERVED, dark
⌁ GET  /requests/track      RESERVED, dark — ref + surname
```

Zod-validated in and out · RFC 9457 problem details · explicit cache headers · small bodies (consumed over 2G).

---

## 6. OFFLINE

Four cache tiers per `PERF-PLAN.md` §7. **Tier 1 (`/ligtas`, hotlines, evacuation, checklist, BDRRMC, shell, fonts, CSS) is precached, never evicted, and estimated <400 KB.**

`/ligtas` renders from a **checked-in static JSON fallback** if the CMS is unreachable at build or request time. It has no single point of failure. Cached content always displays its timestamp; a cached advisory is never presented as current.

---

## 7. SECURITY

CSP with nonces (no `unsafe-inline` for scripts) · HSTS preload · `nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` denying camera/mic/geolocation · `X-Frame-Options: DENY` · COOP `same-origin`.

RBAC enforced **server-side on every mutation**: Secretary (announcements, events, sea/boat, requests) · Punong Barangay (+ warning/emergency advisories, officials, ordinances, disclosures) · Administrator (+ users, roles, audit export).

Argon2id · mandatory TOTP 2FA on admin · EXIF/GPS stripped on upload · allowlist rich-text sanitisation at storage *and* render.

---

## 8. BUILD ORDER (Phase 5)

1. **`/design-system` route** — first, per the Phase 3 conflict resolution. No page layout before it renders.
2. Tokens → layout primitives → core components
3. Root layout, header (emergency button), footer
4. `/ligtas` — highest priority page, static fallback, offline
5. `/` homepage
6. `/serbisyo/*`, `/opisyal`, `/tungkol/*`, `/kontak`
7. `/balita`, `/transparency` + CMS
8. Service worker, manifest, offline route
9. SEO, JSON-LD, sitemap
10. Tests, CI, budgets
