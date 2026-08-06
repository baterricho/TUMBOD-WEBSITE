/**
 * Capture screenshots of the built site for design review.
 *
 * Usage: npm run build && npm run preview  (in one terminal)
 *        node scripts/screenshot.mjs
 *
 * Writes to ./screenshots/. Not part of CI — this is a review aid.
 */

import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env['BASE_URL'] ?? 'http://localhost:4321'
const OUT = 'screenshots'

const SHOTS = [
  { name: 'home-phone', path: '/', device: 'Pixel 7', fullPage: false },
  { name: 'home-phone-full', path: '/', device: 'Pixel 7', fullPage: true },
  { name: 'home-desktop', path: '/', device: 'Desktop Chrome', fullPage: false },
  { name: 'ligtas-phone', path: '/ligtas', device: 'Pixel 7', fullPage: true },
  { name: 'service-phone', path: '/serbisyo/barangay-clearance', device: 'Pixel 7', fullPage: true },
  { name: 'design-system', path: '/design-system', device: 'Desktop Chrome', fullPage: true },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const shot of SHOTS) {
  const context = await browser.newContext(devices[shot.device])
  const page = await context.newPage()
  await page.goto(BASE + shot.path, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.fullPage })
  console.log(`captured ${shot.name}`)
  await context.close()
}

await browser.close()
console.log(`\nWritten to ./${OUT}/`)
