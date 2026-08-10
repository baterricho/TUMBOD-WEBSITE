/**
 * BUILD-TIME content fetch — the thing that makes /admin actually publish.
 *
 * ─────────────────────────────────────────────────────────────────
 * THE BUG THIS FIXES, 2026-08-07.
 *
 * The barangay could sign in, write an announcement, tick "published", save it
 * — and the website would not change. Not a permissions problem: RLS was
 * correct and the anon role could read every published row. Not a data
 * problem: the tables held six announcements, four events, five projects,
 * eleven officials, all published.
 *
 * The public pages simply never asked. Every list on this site rendered from
 * the checked-in files in `lib/content`, and the ONLY thing that read the
 * database was the News mega panel, client-side, on open. So the CMS wrote to
 * a database that the website did not read. That is the whole bug.
 *
 * `source.ts` predicted this exact shape and reserved the seam for it:
 * "When a CMS is wired up it becomes a second implementation and NOTHING in
 * the pages or components changes." This module is that implementation.
 * ─────────────────────────────────────────────────────────────────
 *
 * WHY BUILD TIME AND NOT THE CLIENT.
 *
 * `live.ts` already fetches on the client, and it stays — it is what refreshes
 * a list between deploys. But client-side fetching alone could never fix this,
 * for three reasons that all matter more here than the freshness does:
 *
 *   1. A DETAIL PAGE HAS TO EXIST. `/balita/<slug>` is a file on disk. No
 *      amount of client JavaScript conjures a page for a row that was not
 *      known when the site was built — the reader gets a 404 before any script
 *      runs. Publishing an announcement nobody can open is not publishing.
 *   2. NO-JAVASCRIPT. Every route must render its primary content with JS
 *      disabled (ARCHITECTURE.md §2, enforced by no-js.spec.ts). Content that
 *      only exists after a fetch fails that gate by construction.
 *   3. OFFLINE. The service worker precaches HTML. Content baked into the HTML
 *      survives a signal outage; content fetched at read time does not.
 *
 * So the database is read when the site is BUILT, and the answer is baked into
 * static files. The cost is honest and worth stating plainly: **publishing
 * requires a rebuild.** Save in /admin, then redeploy, and the change is live.
 * That is the standard static-CMS trade, and it buys a site that opens during
 * a typhoon on no signal.
 *
 * FAILURE IS NEVER FATAL. Every function here resolves to `null` when anything
 * goes wrong — no network, wrong key, paused project, CI with no `.env`,
 * a laptop on aeroplane wifi. `null` means "use the checked-in fallback", so a
 * build without a database produces exactly the site that existed before this
 * module was written. A CMS outage must never be able to take /ligtas down.
 */

const URL_BASE = import.meta.env['PUBLIC_SUPABASE_URL'] ?? ''
const KEY = import.meta.env['PUBLIC_SUPABASE_ANON_KEY'] ?? ''

export const cmsConfigured = Boolean(URL_BASE && KEY)

/**
 * One request per table per build, not per page.
 *
 * `getStaticPaths` plus 75 routes calls into this module a lot, and Astro does
 * not memoise across pages. Without the cache, building the site fired the
 * same query dozens of times — slow, and enough traffic against a free-tier
 * project to look like something worth rate-limiting.
 *
 * The cache holds the PROMISE, not the result, so concurrent callers during
 * parallel page rendering share one in-flight request rather than racing.
 */
const inflight = new Map<string, Promise<unknown[] | null>>()

/**
 * A hard ceiling on how long a build will wait for the database.
 *
 * Without this, a hung connection hangs `astro build` indefinitely — the
 * failure mode where CI sits at 100% for its whole timeout and nobody knows
 * why. Ten seconds is generous for a handful of small reads; past that the
 * right answer is to build from the fallbacks and ship something.
 */
const TIMEOUT_MS = 10_000

/**
 * Say so, ONCE, when there is no CMS configured.
 *
 * Without this a deploy that forgot its environment variables builds perfectly
 * happily and ships the sample content — a silently wrong website with a green
 * build. The barangay would publish, redeploy, see nothing change, and have no
 * way to tell that from the bug this whole module exists to fix.
 *
 * Not an error: building without a database is a legitimate, supported mode
 * (CI has no `.env`, and offline development should work). It just must never
 * be silent.
 */
let announcedUnconfigured = false

async function query<T>(table: string, params: string): Promise<T[] | null> {
  if (!cmsConfigured) {
    if (!announcedUnconfigured) {
      announcedUnconfigured = true
      console.warn(
        '[cms] PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY are not set.\n' +
          '[cms] Building from the checked-in fallbacks — nothing published in /admin will appear.',
      )
    }
    return null
  }

  const key = `${table}?${params}`
  const hit = inflight.get(key)
  if (hit) return hit as Promise<T[] | null>

  const run = (async (): Promise<unknown[] | null> => {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(`${URL_BASE}/rest/v1/${key}`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
        signal: ac.signal,
      })
      if (!res.ok) {
        // Loud, because a build that silently ships stale content when the
        // barangay just published something is worse than a noisy one.
        console.warn(`[cms] ${table} → HTTP ${res.status}; using checked-in fallback`)
        return null
      }
      return (await res.json()) as unknown[]
    } catch (err) {
      const why = err instanceof Error ? err.message : String(err)
      console.warn(`[cms] ${table} unreachable (${why}); using checked-in fallback`)
      return null
    } finally {
      clearTimeout(timer)
    }
  })()

  inflight.set(key, run)
  return run as Promise<T[] | null>
}

/**
 * Rows from a published-content table.
 *
 * `is_published` and `deleted_at` are NOT filtered here, deliberately. The RLS
 * policy on every one of these tables is already
 * `is_published AND deleted_at IS NULL`, so the anon key cannot see a draft
 * even if this code asked for one. Re-stating the filter in the query would
 * create a second place for the rule to live and a second place to get it
 * wrong; the database is the one that has to be right.
 */
export function published<T>(table: string, order?: string, limit?: number): Promise<T[] | null> {
  const params = new URLSearchParams({ select: '*' })
  if (order) params.set('order', order)
  if (limit) params.set('limit', String(limit))
  return query<T>(table, params.toString())
}

/**
 * Raw rows, for the tables `published()` cannot describe.
 *
 * `published()` assumes the standard content shape — an `is_published` /
 * `deleted_at` RLS policy doing the filtering, and a sort column. Exactly one
 * table breaks that assumption: `site_settings` is a single row with a
 * `USING (true)` policy and nothing to order or hide. Rather than teach
 * `published()` about an exception it would then carry forever, this exposes
 * the underlying query for the caller to describe precisely.
 *
 * Same failure contract as everything else here: resolves to `null` on any
 * error, never throws, never fails a build.
 */
export function rows<T>(table: string, params: string): Promise<T[] | null> {
  return query<T>(table, params)
}

/**
 * True when the table answered with at least one row.
 *
 * An EMPTY table is not the same as an unreachable one, but both mean the same
 * thing to a page: show the fallback. A barangay that has published nothing
 * should see the sample content that explains what the page will look like,
 * not a bare empty state.
 */
export function useRows<T>(rows: T[] | null | undefined): rows is T[] {
  return Array.isArray(rows) && rows.length > 0
}
