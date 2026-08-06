/**
 * Live content — the client-side upgrade.
 *
 * The site is static. Every page ships fully rendered from the checked-in
 * fallbacks in `lib/content`, so it is fast, works offline, and works with no
 * JavaScript. This module runs AFTER that and replaces what it can with what
 * the barangay has actually published, so an edit in /admin shows up on the
 * next page load rather than on the next deploy.
 *
 * WHY PLAIN `fetch` AND NOT `@supabase/supabase-js`. The client library is
 * ~40 KB gzipped. Putting it on every public page to run three GETs would be
 * the single largest thing this site downloads, on an island where that is
 * somebody's load. PostgREST is an ordinary REST API; these are ordinary
 * requests.
 *
 * THE FALLBACK IS NEVER REMOVED. If the database is unreachable, slow, blocked,
 * paused, or the visitor is offline, nothing here runs and the page keeps the
 * content it was built with. That is the same guarantee `source.ts` describes
 * and the reason /ligtas has no single point of failure.
 */

const URL_BASE = import.meta.env['PUBLIC_SUPABASE_URL'] ?? ''
const KEY = import.meta.env['PUBLIC_SUPABASE_ANON_KEY'] ?? ''

export const liveConfigured = Boolean(URL_BASE && KEY)

/** Exposed to inline scripts, which cannot read `import.meta.env`. */
export const liveConfig = { url: URL_BASE, key: KEY }

export interface LiveOptions {
  /** PostgREST select list. Defaults to everything. */
  select?: string
  /** e.g. `published_at.desc` */
  order?: string
  limit?: number
  /** Extra PostgREST filters, e.g. `['is_featured=eq.true']`. */
  filters?: readonly string[]
}

/**
 * Fetch rows from a table. Resolves to `null` — never throws and never
 * rejects — when anything at all goes wrong, because every caller's correct
 * response to a failure is "keep what is already on the page".
 */
export async function fetchRows<T = Record<string, unknown>>(
  table: string,
  opts: LiveOptions = {},
  signal?: AbortSignal,
): Promise<T[] | null> {
  if (!liveConfigured) return null

  const params = new URLSearchParams()
  params.set('select', opts.select ?? '*')
  if (opts.order) params.set('order', opts.order)
  if (opts.limit) params.set('limit', String(opts.limit))
  for (const f of opts.filters ?? []) {
    const [k, v] = f.split('=')
    if (k && v) params.append(k, v)
  }

  try {
    // `signal` is spread conditionally: the project runs
    // `exactOptionalPropertyTypes`, under which `signal: undefined` is not
    // assignable to `RequestInit['signal']`.
    const res = await fetch(`${URL_BASE}/rest/v1/${table}?${params}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      ...(signal ? { signal } : {}),
    })
    if (!res.ok) return null
    return (await res.json()) as T[]
  } catch {
    // Offline, blocked, timed out, CORS, paused project — all the same answer.
    return null
  }
}
