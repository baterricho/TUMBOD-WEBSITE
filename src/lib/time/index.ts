/**
 * Date and time formatting — always Asia/Manila, always explicit.
 *
 * Never call `new Date()` directly in render (ARCHITECTURE.md §3). Persona P6
 * checks this site from Dubai at 3am during a typhoon; a timestamp without a
 * timezone is worse than no timestamp (BUILD-PROMPT.md §7.2).
 */

export const TIMEZONE = 'Asia/Manila'

/** How stale a live reading may be before the UI warns about it (§12.5). */
export const STALE_WARN_MS = 6 * 60 * 60 * 1000 // 6 hours
export const STALE_FAIL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type Staleness = 'fresh' | 'warn' | 'stale'

export function stalenessOf(observedAt: Date, now: Date): Staleness {
  const age = now.getTime() - observedAt.getTime()
  if (age >= STALE_FAIL_MS) return 'stale'
  if (age >= STALE_WARN_MS) return 'warn'
  return 'fresh'
}

const absoluteFil = new Intl.DateTimeFormat('fil-PH', {
  timeZone: TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const absoluteEn = new Intl.DateTimeFormat('en-PH', {
  timeZone: TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeOnlyFil = new Intl.DateTimeFormat('fil-PH', {
  timeZone: TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
})

const dateOnlyFil = new Intl.DateTimeFormat('fil-PH', {
  timeZone: TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/*
 * Day-level formatters, added 2026-08-07 for articles and events.
 *
 * `formatAbsolute` prints the time and the "(PHT)" suffix, which is right for a
 * sea-state reading — the hour is the whole point and the timezone must not be
 * guessed. On an event card it is noise: the card already prints "8:00 AM –
 * 12:00 NN" from `timeLabel`, so the full form rendered "Agosto 15, 2026 nang
 * 8:00 AM (PHT) · 8:00 AM – 12:00 NN" and wrapped over four lines on a phone.
 *
 * Weekday included on purpose. "Sabado, Agosto 15" answers "can I go?" in a way
 * that "Agosto 15" does not.
 */
const dayFil = new Intl.DateTimeFormat('fil-PH', {
  timeZone: TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dayEn = new Intl.DateTimeFormat('en-PH', {
  timeZone: TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** A calendar day, no clock time. For dated content rather than readings. */
export function formatDay(date: Date, locale: 'fil' | 'en'): string {
  return locale === 'fil' ? dayFil.format(date) : dayEn.format(date)
}

/**
 * Three-letter month abbreviations for the stacked date tiles.
 *
 * ─────────────────────────────────────────────────────────────────
 * CONSOLIDATED HERE 2026-08-07 (ARCHITECTURE-REVIEW.md §3.4). These two arrays
 * were written out in `EventsView.astro`, `mega/MegaNews.astro` and inside the
 * client script of `LiveContent.astro` — three copies, so a Filipino
 * abbreviation fix needed three correct edits and would silently half-land.
 *
 * NOT DERIVED FROM `Intl`. `Intl.DateTimeFormat('fil-PH', { month: 'short' })`
 * does not reliably produce the forms Filipino readers expect — HUN/HUL for
 * Hunyo/Hulyo, SET for Setyembre — and its output varies by ICU version, which
 * means the same build could render differently on two machines. A date tile
 * that says one thing locally and another in CI is worse than a hard-coded
 * table that is simply correct.
 * ─────────────────────────────────────────────────────────────────
 */
const MONTHS_FIL = [
  'ENE', 'PEB', 'MAR', 'ABR', 'MAY', 'HUN',
  'HUL', 'AGO', 'SET', 'OKT', 'NOB', 'DIS',
] as const

const MONTHS_EN = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const

/** The month table for a locale — for handing to a client script. */
export function monthNames(locale: 'fil' | 'en'): readonly string[] {
  return locale === 'fil' ? MONTHS_FIL : MONTHS_EN
}

/** e.g. `AGO` for 15 August, in Filipino. */
export function monthAbbrev(date: Date, locale: 'fil' | 'en'): string {
  return monthNames(locale)[date.getMonth()] ?? ''
}

/** Absolute, with timezone stated. Used alongside — never instead of — relative. */
export function formatAbsolute(date: Date, locale: 'fil' | 'en'): string {
  const base = locale === 'fil' ? absoluteFil.format(date) : absoluteEn.format(date)
  return `${base} (PHT)`
}

export function formatTime(date: Date): string {
  return timeOnlyFil.format(date)
}

export function formatDate(date: Date): string {
  return dateOnlyFil.format(date)
}

/**
 * Relative time in Filipino. Deliberately coarse — "2 oras ang nakalipas" is
 * more useful to a reader than "1 oras at 47 minuto".
 */
export function formatRelativeFil(date: Date, now: Date): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'ngayon lang'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minuto ang nakalipas`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} oras ang nakalipas`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'kahapon'
  if (days < 7) return `${days} araw ang nakalipas`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} linggo ang nakalipas`
  const months = Math.floor(days / 30)
  return `${months} buwan ang nakalipas`
}

export function formatRelativeEn(date: Date, now: Date): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

/** Machine-readable value for `<time datetime>`. */
export function isoAttr(date: Date): string {
  return date.toISOString()
}
