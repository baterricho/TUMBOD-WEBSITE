/**
 * Measure real transferred bytes per route against PERF-PLAN.md §1.
 *
 * Reads each built HTML file, resolves every asset it actually loads on first
 * paint, and gzips it. Uncompressed totals are not the budget — the budget is
 * what a phone on Slow 4G actually downloads, because persona P1 pays for
 * those bytes out of a ₱50 prepaid load.
 *
 * Exits non-zero if any route is over budget. Wire into CI as a blocker.
 *
 * Usage: npm run measure
 */

import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')

/** Budgets from PERF-PLAN.md §1, in KB of transferred bytes. */
const ROUTES = [
  { name: '/', file: 'index.html', budgetKb: 150 },
  { name: '/ligtas', file: join('ligtas', 'index.html'), budgetKb: 60 },
  { name: '/ligtas/hotline', file: join('ligtas', 'hotline', 'index.html'), budgetKb: 60 },
  { name: '/design-system', file: join('design-system', 'index.html'), budgetKb: null },
]

const gz = (buf) => gzipSync(buf, { level: 9 }).length
const kb = (n) => (n / 1024).toFixed(1)

let failed = false
console.log('Transferred bytes per route (gzip -9), first paint only\n')

for (const route of ROUTES) {
  const htmlPath = join(DIST, route.file)
  if (!existsSync(htmlPath)) {
    console.log(`SKIP  ${route.name} — not built`)
    continue
  }

  const html = readFileSync(htmlPath)
  const text = html.toString()
  const htmlGz = gz(html)

  // Only what the document loads on first paint. Prefetch hints for OTHER
  // routes are excluded — they are not this route's first-load cost.
  const refs = new Set([
    ...[...text.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]),
    ...[...text.matchAll(/<link[^>]*\srel="stylesheet"[^>]*\shref="([^"]+)"/g)].map((m) => m[1]),
    ...[...text.matchAll(/<link[^>]*\shref="([^"]+\.css)"[^>]*\srel="stylesheet"/g)].map((m) => m[1]),
    // Preloaded fonts are first-paint cost and must count against the budget.
    ...[...text.matchAll(/<link[^>]*\srel="preload"[^>]*\shref="([^"]+)"/g)].map((m) => m[1]),
  ])

  let jsGz = 0
  let cssGz = 0
  let fontGz = 0
  for (const ref of refs) {
    if (!ref || ref.startsWith('http')) continue
    const assetPath = join(DIST, ref.replace(/^\//, ''))
    if (!existsSync(assetPath)) continue
    // WOFF2 is already Brotli-compressed internally; gzipping again would
    // understate nothing but is pointless. Count the file as served.
    const raw = readFileSync(assetPath)
    if (ref.endsWith('.woff2')) fontGz += raw.length
    else if (ref.endsWith('.css')) cssGz += gz(raw)
    else jsGz += gz(raw)
  }

  const total = htmlGz + jsGz + cssGz + fontGz
  const over = route.budgetKb !== null && total > route.budgetKb * 1024
  if (over) failed = true

  console.log(
    `${over ? 'FAIL' : 'PASS'}  ${route.name.padEnd(18)}` +
      `html ${kb(htmlGz).padStart(6)}KB   ` +
      `css ${kb(cssGz).padStart(6)}KB   ` +
      `font ${kb(fontGz).padStart(6)}KB   ` +
      `js ${kb(jsGz).padStart(6)}KB   ` +
      `= ${kb(total).padStart(6)}KB` +
      (route.budgetKb ? `   / ${String(route.budgetKb).padStart(3)}KB budget` : ''),
  )
}

console.log(
  '\nFont column counts the PRELOADED face only (Source Sans 3 400). The other four\n' +
    'faces load on demand and are cached by the service worker. Images are not yet\n' +
    'in the build; the 40KB image allocation on / is unspent.',
)

process.exit(failed ? 1 : 0)
