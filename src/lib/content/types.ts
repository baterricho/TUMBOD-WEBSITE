/**
 * Content types. These mirror the CMS collections in BUILD-PROMPT.md §15.1
 * and the Postgres tables in ARCHITECTURE.md §4, so the static fallbacks and
 * the CMS payloads are the same shape.
 */

import type { Maybe } from './placeholder'

export type SeaState = 'calm' | 'moderate' | 'rough' | 'dangerous'
export type AlertLevel = 'info' | 'advisory' | 'warning' | 'emergency'
export type OfficeState = 'open' | 'closed' | 'limited'

/**
 * Why a boat is not running. Added after research: cancellation is often a
 * Coast Guard prohibition on vessels ≤3 GT covering the whole municipality,
 * not an operator's judgement call. Those mean very different things to a
 * resident — one is binding (RESEARCH.md §8A).
 */
export type BoatStatusReason =
  | 'sea_conditions'
  | 'pcg_sailing_ban'
  | 'operator'
  | 'other'

export type BoatStatus = 'running' | 'uncertain' | 'cancelled'

export interface SeaCondition {
  readonly state: SeaState
  readonly waveHeightM: Maybe<number>
  readonly windKph: Maybe<number>
  readonly windDirection: Maybe<string>
  /** When the reading was taken — not when we fetched it. */
  readonly observedAt: Date
  readonly source: string
  readonly manualOverride: boolean
}

export interface BoatTrip {
  readonly id: string
  readonly route: Maybe<string>
  readonly operator: Maybe<string>
  readonly departureTime: Maybe<string>
  readonly fare: Maybe<string>
  readonly status: BoatStatus
  readonly statusReason: BoatStatusReason | null
  readonly updatedAt: Date
}

export interface OfficeHours {
  readonly state: OfficeState
  readonly todayLabel: string
  readonly hoursToday: Maybe<string>
  readonly nextOpen: Maybe<string>
}

export interface Advisory {
  readonly id: string
  readonly level: AlertLevel
  readonly titleFil: string
  readonly titleEn: string
  readonly instructionFil: string
  readonly instructionEn: string
  readonly issuedAt: Date
  /** Required. This is what stops a typhoon warning sitting live for months. */
  readonly expiresAt: Date
  readonly hotlineOverride: string | null
}

/**
 * A named office-holder.
 *
 * There is deliberately no `photo` field. A photograph cannot render without
 * recorded consent, and consent for a Facebook post is not consent for a
 * permanent, indexed website (DISCOVERY-QUESTIONS.md B2). When consent is
 * collected, add `photo` and `photoConsent` together — never `photo` alone.
 */
export interface Official {
  readonly name: string
  readonly position: string
  /** Committee assignment. Absent when not known — never guessed. */
  readonly committee?: string
  readonly term: string
}

export interface Hotline {
  readonly id: string
  readonly labelFil: string
  readonly labelEn: string
  readonly number: Maybe<string>
  readonly category: 'barangay' | 'disaster' | 'health' | 'maritime' | 'police'
  /** Required. A number unverified for 90+ days raises an admin task. */
  readonly verifiedAt: Date | null
  /**
   * Who confirmed it rings the right phone. `public/admin/config.yml` has
   * always required this of CMS-entered hotlines; the type did not, which meant
   * code-entered numbers could skip the one question that matters.
   */
  readonly verifiedBy?: string
  readonly active: boolean
}

export interface EvacuationSite {
  readonly id: string
  readonly name: Maybe<string>
  readonly purok: Maybe<string>
  readonly capacity: Maybe<number>
  readonly accessNoteFil: Maybe<string>
  readonly contactPerson: Maybe<string>
}

export interface ChecklistItem {
  readonly id: string
  readonly labelFil: string
  readonly labelEn: string
}

export interface Announcement {
  readonly id: string
  readonly slug: string
  readonly category: AnnouncementCategory
  readonly titleFil: Maybe<string>
  readonly titleEn: Maybe<string>
  readonly excerptFil: Maybe<string>
  readonly publishedAt: Date
}

export type AnnouncementCategory =
  | 'anunsyo'
  | 'kalusugan'
  | 'ayuda'
  | 'babala'
  | 'ordinansa'
  | 'kaganapan'

export interface ServiceSummary {
  readonly slug: string
  readonly nameFil: string
  readonly nameEn: string
  readonly fee: Maybe<string>
  readonly processingTime: Maybe<string>
}
