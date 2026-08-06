/**
 * Demo-mode guard.
 *
 * Demo data exists so the barangay can see a populated site. It must never
 * reach the public one. This script is the mechanical guarantee, because the
 * failure it prevents is specific and serious: a resident finding a fabricated
 * hotline number and trying to use it during a typhoon.
 *
 * Fails if the built output contains demo markers WITHOUT the demo flag set —
 * which would mean demo data leaked into a real build.
 *
 * Also fails on `--forbid-demo` even when the flag IS set, so the production
 * deploy step can refuse a demo artefact outright.
 *
 * Usage:
 *   node scripts/check-demo.mjs                # leak check
 *   node scripts/check-demo.mjs --forbid-demo  # production deploy gate
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const IS_DEMO_BUILD = process.env['PUBLIC_DEMO_MODE'] === 'true'
const FORBID = process.argv.includes('--forbid-demo')

/**
 * Strings that only ever appear in DEMO output.
 *
 * `0999-000-00` used to be on this list and is not any more. `sample.ts`
 * populates the navigation panels in EVERY build and uses the same unassigned
 * prefix on purpose — it is the pattern that cannot ring a real handset — so
 * the digits alone are no longer evidence of a leak. The hazard is covered by
 * the dialability check below, which tests the thing that actually hurts
 * someone rather than the string that usually accompanies it.
 */
const MARKERS = [
  'HINDI TOTOO ANG MGA IMPORMASYON',
  'THE INFORMATION ON THIS SITE IS NOT REAL',
  '(halimbawa)',
]

/**
 * An unassigned-prefix number inside a `tel:` href.
 *
 * This is the failure the whole file exists to prevent: a resident tapping a
 * number that cannot reach anyone, in the one minute it matters. It is fatal
 * in every build — demo or not, flagged or not — and no argument suppresses
 * it. `PhoneNumber.astro` strips separators for the href, so the pattern
 * matches the stripped form.
 */
const DIALABLE_FAKE = /href=["']tel:[^"']*0999000\d{4}/i

function htmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full))
    else if (entry.endsWith('.html')) out.push(full)
  }
  return out
}

const hits = new Map()
const dialable = []
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8')
  const route = '/' + relative(DIST, file).replace(/\\/g, '/')
  const found = MARKERS.filter((m) => html.includes(m))
  if (found.length) hits.set(route, found)
  if (DIALABLE_FAKE.test(html)) dialable.push(route)
}

// Checked FIRST, and never excused by a flag or by --forbid-demo.
if (dialable.length) {
  console.error(
    `\nFAIL: ${dialable.length} page(s) make an unassigned-prefix number dialable.\n` +
      'Sample and demo numbers must render as plain text, never as tel: links.\n' +
      dialable
        .slice(0, 5)
        .map((r) => `  ${r}`)
        .join('\n'),
  )
  process.exit(1)
}

if (hits.size === 0) {
  console.log('No demo data in build output.')
  if (FORBID) console.log('Production gate: PASS.')
  process.exit(0)
}

console.log(`Demo markers found in ${hits.size} page(s).`)
for (const [route, found] of [...hits].slice(0, 5)) {
  console.log(`  ${route} — ${found.join(', ')}`)
}
if (hits.size > 5) console.log(`  …and ${hits.size - 5} more`)

if (FORBID) {
  console.error(
    '\nFAIL: this is a DEMO build and must not be deployed to production.\n' +
      'Rebuild without PUBLIC_DEMO_MODE=true.',
  )
  process.exit(1)
}

if (!IS_DEMO_BUILD) {
  console.error(
    '\nFAIL: demo data is present but PUBLIC_DEMO_MODE is not set.\n' +
      'Demo content has leaked into a normal build. This is the exact failure\n' +
      'the flag exists to prevent — do not ship it.',
  )
  process.exit(1)
}

console.log('\nOK: demo build, correctly flagged. Not for production.')
process.exit(0)
