/**
 * The active dataset — the single switch between honest-empty and demo.
 *
 * Default is the honest dataset: real facts where we have them, visible
 * [[NEEDS DATA]] placeholders where we do not (BUILD-PROMPT.md §0.2).
 *
 * Demo is opt-in via PUBLIC_DEMO_MODE=true and is guarded three ways:
 *   - `scripts/check-demo.mjs` fails the build if demo output escapes,
 *   - every page renders an undismissable "not real data" banner,
 *   - demo phone numbers are plain text, never `tel:` links.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHICH MODULE DOES A PAGE IMPORT? (ARCHITECTURE-REVIEW.md §3.1)
 *
 * There are now three content modules and the precedence was not written down
 * anywhere, which cost weeks: `/proyekto` rendered an empty list for as long as
 * it did because it imported `PROJECTS` from here — an array that is `[]`
 * outside demo mode — while the barangay's five published projects sat in the
 * database. It compiled. It passed every test. It was simply always blank.
 *
 * The order, and it is not negotiable:
 *
 *   1. `content/articles.ts`         news + events. Database first, samples
 *                                    second. Has slugs and detail pages.
 *   2. `content/live-collections.ts` projects, hotlines, tourism, businesses,
 *                                    FAQs, gallery. Database first,
 *                                    checked-in content second.
 *   3. THIS FILE                     only for what neither of those covers:
 *                                    services, evacuation sites, the checklist,
 *                                    stats, history, vision, officials, forms.
 *
 * A page that wants published content calls a `getX()` from 1 or 2. It does
 * NOT read the arrays below, because those are the FALLBACK INPUTS that 1 and
 * 2 consume — reading them directly is reading the answer the CMS was supposed
 * to override.
 *
 * The superseded exports are marked `@deprecated` individually so an editor
 * strikes them through at the call site. They are not deleted: they are still
 * the fallback that `live-collections.ts` imports when the database is
 * unreachable, which is the whole reason /ligtas survives a CMS outage.
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  HOTLINES as REAL_HOTLINES,
  EVACUATION_SITES as REAL_EVACUATION_SITES,
  OFFICIALS as REAL_OFFICIALS,
  SERVICES as REAL_SERVICES,
  TYPHOON_CHECKLIST,
  fallbackBoatTrip,
  fallbackOfficeHours,
  fallbackSeaCondition,
} from './fallback'
import { SERVICE_DETAILS as REAL_SERVICE_DETAILS, type ServiceDetail } from './services'
import * as demo from './demo'
import * as demoPages from './demo-pages'
import type {
  Advisory,
  Announcement,
  BoatTrip,
  ChecklistItem,
  EvacuationSite,
  Hotline,
  OfficeHours,
  SeaCondition,
  ServiceSummary,
} from './types'

/** Off unless explicitly switched on. */
export const IS_DEMO = import.meta.env['PUBLIC_DEMO_MODE'] === 'true'

/** @deprecated Fallback input only — call `getHotlines()` from
 *  `content/live-collections.ts`. Reading this skips the CMS. */
export const HOTLINES: readonly Hotline[] = IS_DEMO ? demo.DEMO_HOTLINES : REAL_HOTLINES

export const EVACUATION_SITES: readonly EvacuationSite[] = IS_DEMO
  ? demo.DEMO_EVACUATION_SITES
  : REAL_EVACUATION_SITES

export const SERVICES: readonly ServiceSummary[] = IS_DEMO ? demo.DEMO_SERVICES : REAL_SERVICES

export const SERVICE_DETAILS: readonly ServiceDetail[] = IS_DEMO
  ? REAL_SERVICE_DETAILS.map(demo.demoService)
  : REAL_SERVICE_DETAILS

/** @deprecated Superseded by `getNews()` in `content/articles.ts`. This is `[]`
 *  outside demo mode and always will be — nothing writes to it. */
export const ANNOUNCEMENTS: readonly Announcement[] = IS_DEMO ? demo.DEMO_ANNOUNCEMENTS : []

export const ACTIVE_ADVISORY: Advisory | null = IS_DEMO ? demo.DEMO_ADVISORY : null

export const CHECKLIST: readonly ChecklistItem[] = TYPHOON_CHECKLIST

/** @deprecated Fallback input only — call `getProjects()` from
 *  `content/live-collections.ts`. THIS is the export that made /proyekto render
 *  an empty list while five projects sat published in the database. */
export const PROJECTS = IS_DEMO ? demo.DEMO_PROJECTS : []

/** @deprecated Superseded by `getUpcomingEvents()` in `content/articles.ts`. */
export const CALENDAR = IS_DEMO ? demo.DEMO_CALENDAR : []
export const HEALTH_OUTREACH = IS_DEMO ? demo.DEMO_HEALTH_OUTREACH : null
/**
 * No longer null. The real 2023–2026 roster is in `fallback.ts`, confirmed
 * 2026-08-05 (FINDINGS-2026-08-05.md). Still no photographs — that needs
 * recorded consent, which is a separate question from having the names.
 */
export const OFFICIALS = IS_DEMO ? demo.DEMO_OFFICIALS : REAL_OFFICIALS

/* ── Redesign sections (DECISION-redesign.md) ───────────────────
   These have no real counterpart yet — no history has been recorded, no
   tourism copy written, no FAQ collected. Outside demo mode they are empty,
   and each view renders a designed empty state naming who can supply it.
   ─────────────────────────────────────────────────────────────── */

/** PSA census figures — real in BOTH modes. Never demo. */
export const STATS = demoPages.REAL_STATS

export const HISTORY = IS_DEMO ? demoPages.DEMO_HISTORY : []
export const VISION = IS_DEMO ? demoPages.DEMO_VISION : null

/** @deprecated Fallback input only — call `getAttractions()`. */
export const ATTRACTIONS = IS_DEMO ? demoPages.DEMO_ATTRACTIONS : []
/** @deprecated Fallback input only — call `getBusinesses()`. */
export const BUSINESSES = IS_DEMO ? demoPages.DEMO_BUSINESSES : []
/** @deprecated Fallback input only — call `getFaqs()`. */
export const FAQ = IS_DEMO ? demoPages.DEMO_FAQ : []

/** Not superseded: `forms` is a CMS collection but no public page reads it
 *  live yet. Wire it the same way when /porma needs to be editable. */
export const FORMS = IS_DEMO ? demoPages.DEMO_FORMS : []

export function seaCondition(now: Date): SeaCondition {
  return IS_DEMO ? demo.DEMO_SEA_CONDITION(now) : fallbackSeaCondition(now)
}

export function nextBoat(now: Date): BoatTrip {
  return IS_DEMO ? demo.DEMO_BOAT_TRIP(now) : fallbackBoatTrip(now)
}

export function officeHours(todayLabel: string): OfficeHours {
  return IS_DEMO ? demo.DEMO_OFFICE_HOURS(todayLabel) : fallbackOfficeHours(todayLabel)
}

export function getService(slug: string): ServiceDetail | undefined {
  return SERVICE_DETAILS.find((s) => s.slug === slug)
}
