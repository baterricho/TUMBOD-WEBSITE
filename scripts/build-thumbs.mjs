/**
 * Generate small carousel thumbnails from the hero photographs.
 *
 *   node scripts/build-thumbs.mjs      (needs `npm run preview` running)
 *
 * WHY THIS EXISTS
 *
 * The thumbnails paint their preview with `background-image`. Pointing those
 * at the full-size photographs meant all four downloaded the moment the
 * homepage opened — a CSS background on a visible element is not deferred, so
 * `loading="lazy"` on the <img> was doing nothing. Measured: ~540 KB on
 * arrival, on a site whose whole premise is a 2G connection.
 *
 * These derivatives are ~350 px wide, which is more than a 136 px thumbnail
 * needs even at 2× density. The full images now load only when their slide is
 * actually approached.
 *
 * There is no ffmpeg or image library in this environment, so the resizing is
 * done in a real browser via canvas — the same approach used for the video
 * poster. It also reports the true pixel dimensions of each source, which the
 * <img> width/height attributes need to reserve the correct box (the pantalan
 * photograph is portrait; declaring it 960×540 reserved the wrong shape).
 */

import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'

const SOURCES = [
  'tumbod-falls.jpg',
  'tumbod-cove-1.jpg',
  'tumbod-cove-2.jpg',
  'tumbod-pantalan.jpg',
]

const THUMB_W = 350

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4321/')

const report = []

for (const name of SOURCES) {
  const out = await page.evaluate(
    async ([file, width]) => {
      const img = new Image()
      img.src = `/media/${file}`
      await img.decode()

      // Cover-crop to 16:9 so every thumbnail is the same shape, including
      // the portrait one.
      const targetRatio = 16 / 9
      const srcRatio = img.naturalWidth / img.naturalHeight
      let sx = 0
      let sy = 0
      let sw = img.naturalWidth
      let sh = img.naturalHeight
      if (srcRatio > targetRatio) {
        sw = img.naturalHeight * targetRatio
        sx = (img.naturalWidth - sw) / 2
      } else {
        sh = img.naturalWidth / targetRatio
        sy = (img.naturalHeight - sh) / 2
      }

      const c = document.createElement('canvas')
      c.width = width
      c.height = Math.round(width / targetRatio)
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)

      return {
        dataUrl: c.toDataURL('image/jpeg', 0.7),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }
    },
    [name, THUMB_W],
  )

  const buf = Buffer.from(out.dataUrl.split(',')[1], 'base64')
  const thumbName = name.replace(/\.jpg$/, '-thumb.jpg')
  writeFileSync(`public/media/${thumbName}`, buf)

  report.push({ name, thumbName, bytes: buf.length, w: out.naturalWidth, h: out.naturalHeight })
}

await browser.close()

for (const r of report) {
  console.log(
    `${r.name.padEnd(22)} ${String(r.w).padStart(5)}×${String(r.h).padEnd(5)} → ${r.thumbName} (${(r.bytes / 1024).toFixed(1)} KB)`,
  )
}
console.log(
  `\nthumbnail total: ${(report.reduce((a, r) => a + r.bytes, 0) / 1024).toFixed(1)} KB`,
)
