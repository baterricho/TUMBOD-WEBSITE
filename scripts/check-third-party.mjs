/**
 * Third-party RESOURCE audit — no public route may LOAD anything from another
 * origin (ARCHITECTURE.md §22.3).
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY THIS REPLACED A ONE-LINE GREP IN ci.yml.
 *
 * The old check was, in effect:
 *
 *   grep -rEl 'https?://(fonts.googleapis|fonts.gstatic|cdn.|www.google|...)'
 *
 * run against the raw HTML — which cannot tell the difference between a
 * RESOURCE the browser fetches and a LINK a human might click. The Contact page
 * and the Contact mega panel both offer "View in Google Maps" and "Directions",
 * ordinary <a href> navigation to www.google.com. Those cost nothing and
 * contact nobody unless a resident chooses to go there.
 *
 * So the check failed on all 73 routes while the property it exists to protect
 * was never actually violated. Nobody had noticed, because the step had never
 * run: CI had only ever been triggered four times and every run was stopped
 * before this point by an account billing lock.
 *
 * A gate that cannot tell "we embedded Google Fonts" from "we linked to a map"
 * is not a gate, it is noise that teaches people to skip the step. This one
 * looks only at positions where the BROWSER initiates a request.
 * ─────────────────────────────────────────────────────────────────
 *
 * WHAT COUNTS AS A REQUEST: `src` on any element, `srcset`, `href` on a <link>
 * whose `rel` actually causes a fetch, `url(...)` in inline CSS, and `@import`.
 * An <a href> is navigation and is deliberately ignored.
 *
 * Two third-party origins are allowed site-wide, both documented decisions:
 *   - *.supabase.co — the CMS overlay in lib/cms/live.ts, which degrades to the
 *     checked-in fallback whenever it fails.
 *   - the map tile hosts — reached only from the map on /kontak.
 * Neither may appear on /ligtas or /ligtas/hotline, which is the guarantee that
 * actually matters and which EMERGENCY_ROUTES re-checks with an empty allowlist.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'dist'

/**
 * The site's own production origin. Canonical and hreflang links point here and
 * they are SAME origin, not third-party — the first draft of this script
 * flagged all 72 routes for the crime of linking to themselves.
 */
const SELF = /^https?:\/\/(www\.)?barangaytumbod\.gov\.ph/

/**
 * `<link rel>` values that actually cause a fetch. `canonical`, `alternate` and
 * `author` are metadata for crawlers — the browser never requests them, so
 * counting them as third-party requests is simply wrong.
 */
const FETCHING_REL = [
  'stylesheet',
  'preload',
  'modulepreload',
  'prefetch',
  'preconnect',
  'dns-prefetch',
  'icon',
  'apple-touch-icon',
  'mask-icon',
  'manifest',
]

/** Origins allowed to be requested on ordinary public routes. */
const ALLOWED = [
  /^https?:\/\/[^/]*\.supabase\.co/,
  /^https?:\/\/server\.arcgisonline\.com/,
  /^https?:\/\/tile\.openstreetmap\.org/,
  /^https?:\/\/tile\.opentopomap\.org/,
]

/**
 * The emergency routes allow NOTHING. This is the promise the whole offline
 * architecture rests on: /ligtas must render during a typhoon on a dead
 * network, so it may not depend on any host but our own.
 */
const EMERGENCY_ROUTES = ['ligtas/index.html', 'ligtas/hotline/index.html']

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.html')) out.push(full)
  }
  return out
}

const isAbsolute = (u) => /^https?:\/\//i.test(u)

/** Every absolute URL the BROWSER would fetch for this document. */
function requestedUrls(html) {
  const urls = []
  const push = (u) => {
    if (u && isAbsolute(u)) urls.push(u.replace(/&amp;/g, '&'))
  }

  for (const m of html.matchAll(/\ssrc=["']([^"']+)["']/gi)) push(m[1])

  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const candidate of m[1].split(',')) push(candidate.trim().split(/\s+/)[0])
  }

  for (const m of html.matchAll(/<link\s([^>]*)>/gi)) {
    const attrs = m[1]
    const rel = /\srel=["']([^"']+)["']/i.exec(' ' + attrs)
    if (!rel) continue
    // Compare as whole tokens rather than by substring: "canonical" must not
    // match because it happens to contain no fetching rel, and "icon" must not
    // be found inside some future "iconx".
    const tokens = rel[1].toLowerCase().trim().split(/\s+/)
    if (!tokens.some((t) => FETCHING_REL.includes(t))) continue
    const href = /\shref=["']([^"']+)["']/i.exec(' ' + attrs)
    if (href) push(href[1])
  }

  for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) push(m[1])
  for (const m of html.matchAll(/@import\s+["']([^"']+)["']/gi)) push(m[1])

  return urls
}

const files = walk(DIST)
let failures = 0

for (const file of files) {
  const route = relative(DIST, file).split('\\').join('/')
  const html = readFileSync(file, 'utf8')
  const urls = [...new Set(requestedUrls(html))]

  const isEmergency = EMERGENCY_ROUTES.includes(route)
  const external = urls.filter((u) => !SELF.test(u))
  const offenders = external.filter((u) => (isEmergency ? true : !ALLOWED.some((a) => a.test(u))))

  if (offenders.length > 0) {
    failures++
    console.error(`FAIL ${route}${isEmergency ? '   (EMERGENCY ROUTE — allowlist does not apply)' : ''}`)
    for (const u of offenders.slice(0, 5)) console.error(`       requests ${u}`)
  }
}

if (failures > 0) {
  console.error(`\n${failures} route(s) request a disallowed third-party origin.`)
  process.exit(1)
}

console.log(`PASS: ${files.length} routes request no disallowed third-party origin.`)
