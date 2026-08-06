/**
 * Placeholder audit — BUILD-PROMPT.md §0.2.
 *
 * Scans the built HTML for `data-placeholder="true"` and fails the build if
 * any LAUNCH-BLOCKING placeholder is reachable from a rendered route.
 *
 * This is the mechanism that stops the site going public with an invented or
 * absent hotline number. It is a CI blocker, not a warning.
 *
 * Escape hatch for barangay preview builds:
 *   PUBLIC_ALLOW_PLACEHOLDERS=true  (reports, exits 0)
 *
 * NAMING — a deliberate, documented deviation from BUILD-PROMPT.md §34, which
 * specifies `NEXT_PUBLIC_ALLOW_PLACEHOLDERS`. That name was written when the
 * spec assumed Next.js. The project moved to Astro on measured evidence, where
 * the convention is `PUBLIC_*` — and the project's other flag is already
 * `PUBLIC_DEMO_MODE`. Keeping a `NEXT_` prefix would mean the two gates that
 * guard this site's honesty are named after two different frameworks, one of
 * which is not installed. The spec's intent (a build-failing gate with one
 * explicit override) is unchanged.
 *
 * The old name is still honoured so any existing CI config keeps working.
 *
 * Usage: npm run check:placeholders
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const ALLOW =
  process.env['PUBLIC_ALLOW_PLACEHOLDERS'] === 'true' ||
  // Deprecated alias, kept so a pre-port CI config does not silently start failing.
  process.env['NEXT_PUBLIC_ALLOW_PLACEHOLDERS'] === 'true'

function htmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full))
    else if (entry.endsWith('.html')) out.push(full)
  }
  return out
}

let blocking = 0
let advisory = 0
const byRoute = new Map()

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8')
  const route = '/' + relative(DIST, file).replace(/\\/g, '/').replace(/(index)?\.html$/, '')

  // Each placeholder element carries both attributes; capture the pair plus
  // the visible text so the report names what is actually missing.
  const matches = [
    ...html.matchAll(
      /data-placeholder="true"[^>]*data-launch-blocking="(true|false)"[^>]*>([^<]*)/g,
    ),
  ]

  if (matches.length === 0) continue

  const items = matches.map((m) => ({
    blocking: m[1] === 'true',
    text: m[2].trim().replace(/\s+/g, ' ').slice(0, 110),
  }))

  byRoute.set(route, items)
  for (const item of items) {
    if (item.blocking) blocking++
    else advisory++
  }
}

if (byRoute.size === 0) {
  console.log('No placeholders remain. Site is content-complete.')
  process.exit(0)
}

console.log('Placeholder audit\n')
for (const [route, items] of [...byRoute].sort()) {
  console.log(`  ${route}`)
  for (const item of items) {
    console.log(`    ${item.blocking ? 'BLOCKING' : 'advisory'}  ${item.text}`)
  }
  console.log('')
}

console.log(`${blocking} launch-blocking, ${advisory} advisory.\n`)

if (blocking > 0 && !ALLOW) {
  console.error(
    'FAIL: launch-blocking placeholders are reachable from rendered routes.\n' +
      'These must be filled before this site goes public. See CONTENT-TODO.md.\n' +
      'For a barangay preview build, set PUBLIC_ALLOW_PLACEHOLDERS=true.',
  )
  process.exit(1)
}

if (blocking > 0) {
  console.warn('WARNING: preview build — launch-blocking placeholders were allowed through.')
}
process.exit(0)
