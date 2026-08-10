/**
 * Bilingual string resolution.
 *
 * Filipino is canonical and written first; English is a translation
 * (BUILD-PROMPT.md §7.3). User-facing strings live here and never inline
 * in components (§32) — a missing key is a type error, not a runtime blank.
 *
 * Every Filipino string in this file is a LAUNCH-BLOCKING review item for the
 * Barangay Secretary. The voice was written from general Philippine barangay
 * register, not from Tumbod's own posts, because the Facebook extraction is
 * blocked (RESEARCH.md §5.1, DISCOVERY-QUESTIONS.md B1).
 */

import { dictionaryFil } from './fil'
import { dictionaryEn } from './en'

export const LOCALES = ['fil', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fil'

/** The shape both dictionaries must satisfy. Filipino defines it. */
export type Dictionary = typeof dictionaryFil

const dictionaries: Record<Locale, Dictionary> = {
  fil: dictionaryFil,
  en: dictionaryEn,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * The mirrored URL for the other language. The language toggle is a plain
 * anchor to this — never JS state — so it works without JavaScript and
 * preserves the current page (ARCHITECTURE.md §2).
 */
export function alternateHref(pathname: string, locale: Locale): string {
  if (locale === 'en') {
    return pathname === '/' ? '/en' : `/en${pathname}`
  }
  return pathname.replace(/^\/en(?=\/|$)/, '') || '/'
}

/** BCP-47 tag for the `lang` attribute. */
export function htmlLang(locale: Locale): string {
  return locale === 'fil' ? 'fil' : 'en'
}

/**
 * The prefix for a locale-relative link: `''` for Filipino, `/en` for English.
 *
 * ─────────────────────────────────────────────────────────────────
 * CONSOLIDATED HERE 2026-08-07 (ARCHITECTURE-REVIEW.md §3.2).
 *
 * This existed in `lib/content/menu.ts` and was used ten times. It was ALSO
 * hand-rolled — as a literal `locale === 'fil'` ternary — in sixteen other
 * files: two idioms for one concept, with the copy-pasted one winning on
 * count. That was the highest-count duplication in the repository.
 *
 * It lives here rather than in `menu.ts` because it is a routing rule, not
 * menu content: `alternateHref` and `htmlLang` are its neighbours, and the
 * three of them together are everything the site knows about how a locale
 * becomes a URL. `menu.ts` re-exports it so its existing callers keep working.
 * ─────────────────────────────────────────────────────────────────
 */
export function prefix(locale: Locale): string {
  return locale === 'fil' ? '' : '/en'
}

/**
 * A locale-relative href.
 *
 * `localeHref('en', '/serbisyo')` → `/en/serbisyo`. Prefer this over
 * `` `${prefix(locale)}/serbisyo` `` in new code: the template form silently
 * produces `//serbisyo` if the path is ever passed with a leading slash
 * already stripped, and `/en` + `/` produces `/en/` rather than `/en`.
 */
export function localeHref(locale: Locale, path = '/'): string {
  const p = prefix(locale)
  if (path === '/' || path === '') return p || '/'
  return `${p}${path.startsWith('/') ? path : `/${path}`}`
}
