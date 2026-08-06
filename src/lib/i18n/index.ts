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
