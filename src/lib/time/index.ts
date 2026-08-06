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
