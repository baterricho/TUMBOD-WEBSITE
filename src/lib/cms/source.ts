/**
 * The content-source boundary.
 *
 * Every piece of content the site renders passes through this interface. Today
 * the only implementation is `staticSource`, which reads the checked-in
 * fallbacks. When a CMS is wired up it becomes a second implementation and
 * NOTHING in the pages or components changes.
 *
 * This boundary is also what guarantees the disaster-page promise: if a CMS is
 * unreachable at build time, the source falls back to static content rather
 * than failing, so /ligtas has no single point of failure
 * (ARCHITECTURE.md §6).
 *
 * See DECISION-cms.md for why the CMS recommendation reversed.
 */

import type {
  Advisory,
  Announcement,
  BoatTrip,
  EvacuationSite,
  Hotline,
  OfficeHours,
  SeaCondition,
} from '@/lib/content/types'
import type { ServiceDetail } from '@/lib/content/services'
import {
  EVACUATION_SITES,
  HOTLINES,
  fallbackBoatTrip,
  fallbackOfficeHours,
  fallbackSeaCondition,
} from '@/lib/content/fallback'
import { SERVICE_DETAILS } from '@/lib/content/services'

export interface ContentSource {
  readonly name: string
  getHotlines(): Promise<readonly Hotline[]>
  getEvacuationSites(): Promise<readonly EvacuationSite[]>
  getServices(): Promise<readonly ServiceDetail[]>
  getAnnouncements(limit?: number): Promise<readonly Announcement[]>
  /** Null when no advisory is active — the common case, and not an error. */
  getActiveAdvisory(): Promise<Advisory | null>
  getSeaCondition(now: Date): Promise<SeaCondition>
  getNextBoat(now: Date): Promise<BoatTrip>
  getOfficeHours(todayLabel: string): Promise<OfficeHours>
}

/**
 * The checked-in fallback source. This is what /ligtas renders from, always,
 * regardless of whether a CMS exists or is reachable.
 */
export const staticSource: ContentSource = {
  name: 'static',
  getHotlines: async () => HOTLINES,
  getEvacuationSites: async () => EVACUATION_SITES,
  getServices: async () => SERVICE_DETAILS,
  getAnnouncements: async () => [],
  getActiveAdvisory: async () => null,
  getSeaCondition: async (now) => fallbackSeaCondition(now),
  getNextBoat: async (now) => fallbackBoatTrip(now),
  getOfficeHours: async (todayLabel) => fallbackOfficeHours(todayLabel),
}

/**
 * Wraps a primary source so any failure degrades to static content instead of
 * breaking the build. Disaster content must never depend on a network call
 * succeeding.
 */
export function withStaticFallback(primary: ContentSource): ContentSource {
  const guard = <T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> =>
    fn().catch(() => fallback())

  return {
    name: `${primary.name}+static`,
    getHotlines: () => guard(() => primary.getHotlines(), () => staticSource.getHotlines()),
    getEvacuationSites: () =>
      guard(() => primary.getEvacuationSites(), () => staticSource.getEvacuationSites()),
    getServices: () => guard(() => primary.getServices(), () => staticSource.getServices()),
    getAnnouncements: (limit) =>
      guard(() => primary.getAnnouncements(limit), () => staticSource.getAnnouncements(limit)),
    getActiveAdvisory: () =>
      guard(() => primary.getActiveAdvisory(), () => staticSource.getActiveAdvisory()),
    getSeaCondition: (now) =>
      guard(() => primary.getSeaCondition(now), () => staticSource.getSeaCondition(now)),
    getNextBoat: (now) => guard(() => primary.getNextBoat(now), () => staticSource.getNextBoat(now)),
    getOfficeHours: (label) =>
      guard(() => primary.getOfficeHours(label), () => staticSource.getOfficeHours(label)),
  }
}

/** The source the site currently builds from. */
export const content: ContentSource = staticSource
