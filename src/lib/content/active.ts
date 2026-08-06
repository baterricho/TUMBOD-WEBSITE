/**
 * The active dataset — the single switch between honest-empty and demo.
 *
 * Pages import from HERE, never from `fallback.ts` or `demo.ts` directly, so
 * there is exactly one place where the choice is made and exactly one thing to
 * audit.
 *
 * Default is the honest dataset: real facts where we have them, visible
 * [[NEEDS DATA]] placeholders where we do not (BUILD-PROMPT.md §0.2).
 *
 * Demo is opt-in via PUBLIC_DEMO_MODE=true and is guarded three ways:
 *   - `scripts/check-demo.mjs` fails the build if demo output escapes,
 *   - every page renders an undismissable "not real data" banner,
 *   - demo phone numbers are plain text, never `tel:` links.
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

export const HOTLINES: readonly Hotline[] = IS_DEMO ? demo.DEMO_HOTLINES : REAL_HOTLINES

export const EVACUATION_SITES: readonly EvacuationSite[] = IS_DEMO
  ? demo.DEMO_EVACUATION_SITES
  : REAL_EVACUATION_SITES

export const SERVICES: readonly ServiceSummary[] = IS_DEMO ? demo.DEMO_SERVICES : REAL_SERVICES

export const SERVICE_DETAILS: readonly ServiceDetail[] = IS_DEMO
  ? REAL_SERVICE_DETAILS.map(demo.demoService)
  : REAL_SERVICE_DETAILS

export const ANNOUNCEMENTS: readonly Announcement[] = IS_DEMO ? demo.DEMO_ANNOUNCEMENTS : []

export const ACTIVE_ADVISORY: Advisory | null = IS_DEMO ? demo.DEMO_ADVISORY : null

export const CHECKLIST: readonly ChecklistItem[] = TYPHOON_CHECKLIST

export const PROJECTS = IS_DEMO ? demo.DEMO_PROJECTS : []
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
export const ATTRACTIONS = IS_DEMO ? demoPages.DEMO_ATTRACTIONS : []
export const BUSINESSES = IS_DEMO ? demoPages.DEMO_BUSINESSES : []
export const FAQ = IS_DEMO ? demoPages.DEMO_FAQ : []
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
