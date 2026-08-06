/**
 * The placeholder system — BUILD-PROMPT.md §0.2.
 *
 * We do not have real data for officials, hotlines, fees, boat schedules or
 * evacuation sites. We must not invent any of it. Fabricating a hotline number
 * on a disaster page, for an island in a typhoon corridor where a typhoon made
 * landfall in this municipality in November 2025, is the single worst failure
 * this project can produce.
 *
 * So every unknown is a typed placeholder that:
 *   - is visible in the UI (magenta dashed outline in development)
 *   - carries `data-placeholder="true"` for the CI audit
 *   - names who can supply the real value
 *   - FAILS the production build while it remains reachable
 */

const PLACEHOLDER_BRAND = Symbol('placeholder')

export interface Placeholder {
  readonly [PLACEHOLDER_BRAND]: true
  /** What is missing, in plain language. */
  readonly describes: string
  /** Who can supply it — Secretary, BDRRMC, boat operators, municipality. */
  readonly source: string
  /** Blocks launch entirely? See CONTENT-TODO.md "Do not launch without these". */
  readonly launchBlocking: boolean
}

/** A value that is either real or explicitly, auditably absent. */
export type Maybe<T> = T | Placeholder

export function needsData(
  describes: string,
  source: string,
  launchBlocking = false,
): Placeholder {
  return { [PLACEHOLDER_BRAND]: true, describes, source, launchBlocking }
}

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === 'object' &&
    value !== null &&
    PLACEHOLDER_BRAND in value
  )
}

/** The rendered marker text, in the format mandated by §0.2. */
export function placeholderText(p: Placeholder): string {
  return `[[NEEDS DATA: ${p.describes} — source: ${p.source}]]`
}

/**
 * Whether placeholders may ship. Production builds set this false, and
 * `scripts/check-placeholders.mjs` fails CI if any reachable placeholder
 * remains. The escape hatch exists only so the barangay can preview the site
 * before its content is complete.
 */
export const ALLOW_PLACEHOLDERS =
  process.env.NODE_ENV !== 'production' ||
  process.env['NEXT_PUBLIC_ALLOW_PLACEHOLDERS'] === 'true'
