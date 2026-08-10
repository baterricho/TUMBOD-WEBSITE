/**
 * SEA SAFETY ADVISORY — "should I go out to sea?"
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT THIS ANSWERS, AND WHAT IT DELIBERATELY DOES NOT
 *
 * It answers one question: based on the barangay's current verified advisory,
 * should a person take a small boat out. It does NOT report whether a
 * particular bangka is running — that is a timetable question and it belongs to
 * the boat strip, not here. Collapsing the two was the old design's mistake:
 * "boat status: uncertain" reads as a scheduling note when what it has to
 * convey is a safety decision.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THREE INDEPENDENT PATHS TO `unknown`, AND WHY EACH EXISTS
 *
 * The governing rule is that missing information must never read as permission
 * to sail. Absence of a warning is not a warning of absence. So this resolver
 * degrades to `unknown` — never to `safe` — on any of:
 *
 *   1. NO ROW / UNRECOGNISED STATE. The database was unreachable, empty, or
 *      holds a value this code does not know. Falling back to a checked-in
 *      "calm" would be inventing a sea condition, which is the one thing a
 *      safety component must never do.
 *
 *   2. STALE OBSERVATION. Sea state changes within hours; an advisory does not
 *      stay true because nobody updated it. Past FRESH_HOURS the reading is
 *      reported as unavailable rather than as fact. The live row at the time of
 *      writing was three days old and said "moderate" — displaying that as a
 *      current condition is exactly the failure this guards.
 *
 *   3. SAMPLE DATA. `is_sample` marks demonstration content. Everywhere else on
 *      this site sample data is shown with a visible chip, because seeing the
 *      shape of a page is useful. Here it is suppressed outright: a resident
 *      who acts on a sample "conditions favourable" and takes a boat out has
 *      been harmed by a design decision. There is no chip that makes that
 *      acceptable.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE COPY IS DERIVED, NOT AUTHORED
 *
 * The obvious data model gives the admin free-text title / message /
 * recommendation fields. This does not, and the omission is the safety
 * feature: an editor in a hurry can leave the recommendation blank, write it in
 * one language, or soften "do not go out" into "be careful". The dangerous-state
 * wording is the part that must be exactly right, bilingual, and identical
 * every time — so the admin chooses a STATE and the vetted copy follows from
 * it. Free text is still available for local context (`boat_note_*`), where
 * being blank is survivable.
 *
 * It also means no schema change: this reads the columns `site_settings`
 * already has.
 * ═══════════════════════════════════════════════════════════════════
 */

import type { Locale } from '@/lib/i18n'

/** The four states the UI renders. Distinct from the 4-step sea-state ladder. */
export type AdvisoryStatus = 'safe' | 'caution' | 'danger' | 'unknown'

/**
 * How old an observation may be before it stops counting as current.
 *
 * Twelve hours, which is roughly "this morning's reading is good until
 * tonight". Shorter would flip a correctly-maintained advisory to `unknown`
 * overnight and train people to ignore the component; much longer and a
 * reading taken before a storm arrived would still be on the page.
 */
export const FRESH_HOURS = 12

export interface SeaAdvisory {
  readonly status: AdvisoryStatus
  /** Why the status is `unknown`, for the admin-facing note. Null otherwise. */
  readonly unknownReason: 'no-data' | 'stale' | 'sample' | null
  /** ISO timestamp of the observation, when there is a usable one. */
  readonly observedAt: string | null
  readonly source: string | null
  readonly waveHeightM: number | null
  readonly windKph: number | null
  /** Free-text local context from the barangay. Never load-bearing. */
  readonly noteFil: string | null
  readonly noteEn: string | null
}

export const UNKNOWN_ADVISORY: SeaAdvisory = {
  status: 'unknown',
  unknownReason: 'no-data',
  observedAt: null,
  source: null,
  waveHeightM: null,
  windKph: null,
  noteFil: null,
  noteEn: null,
}

/**
 * The ladder → advisory mapping.
 *
 * `rough` maps to DANGER, not to caution, and that is a deliberate
 * safety-conservative choice rather than an oversight. The ladder's own scale
 * puts "rough" at roughly 2 m; the vessel this advisory is written for is an
 * outrigger fishing boat. Two-metre seas in a bangka are not "exercise extra
 * caution", they are "do not go out". Someone reading this on a phone at the
 * shoreline needs the honest answer for their boat, not the average boat.
 */
const LADDER: Record<string, AdvisoryStatus> = {
  calm: 'safe',
  moderate: 'caution',
  rough: 'danger',
  dangerous: 'danger',
}

export interface SettingsRow {
  readonly sea_state?: string | null
  readonly wave_height_m?: number | string | null
  readonly wind_kph?: number | string | null
  readonly sea_observed_at?: string | null
  readonly sea_source?: string | null
  readonly boat_note_fil?: string | null
  readonly boat_note_en?: string | null
  readonly is_sample?: boolean | null
}

const num = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Resolve a row into an advisory. Pure, and total: every input produces a
 * valid advisory, and every failure produces `unknown`.
 *
 * `now` is injectable so the staleness rule is testable without waiting.
 */
export function resolveAdvisory(
  row: SettingsRow | null | undefined,
  now: Date = new Date(),
): SeaAdvisory {
  if (!row) return UNKNOWN_ADVISORY

  const base = {
    observedAt: row.sea_observed_at ?? null,
    source: row.sea_source ?? null,
    waveHeightM: num(row.wave_height_m),
    windKph: num(row.wind_kph),
    noteFil: row.boat_note_fil ?? null,
    noteEn: row.boat_note_en ?? null,
  }

  // (3) Sample content is never presented as a live sea condition.
  if (row.is_sample) return { ...base, status: 'unknown', unknownReason: 'sample' }

  // (1) Unrecognised or absent state.
  const status = LADDER[(row.sea_state ?? '').trim().toLowerCase()]
  if (!status) return { ...base, status: 'unknown', unknownReason: 'no-data' }

  // (2) Staleness. An observation with no timestamp cannot be shown to be
  // current, so it is treated the same as an expired one.
  const observed = row.sea_observed_at ? Date.parse(row.sea_observed_at) : NaN
  if (!Number.isFinite(observed)) {
    return { ...base, status: 'unknown', unknownReason: 'stale' }
  }
  const ageHours = (now.getTime() - observed) / 3_600_000
  if (ageHours > FRESH_HOURS || ageHours < -1) {
    // A future-dated reading is as untrustworthy as an expired one; the one
    // hour of slack absorbs clock skew between the build machine and Postgres.
    return { ...base, status: 'unknown', unknownReason: 'stale' }
  }

  return { ...base, status, unknownReason: null }
}

/** Does this state mean "the page should shout"? */
export const isUrgent = (s: AdvisoryStatus): boolean => s === 'danger'

/** Local free-text note for the active locale, if the barangay wrote one. */
export function advisoryNote(a: SeaAdvisory, locale: Locale): string | null {
  const v = locale === 'fil' ? a.noteFil : a.noteEn
  return v && v.trim() ? v.trim() : null
}
