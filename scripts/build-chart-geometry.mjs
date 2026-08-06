/**
 * Generate real chart geometry for the Living Chart Header.
 *
 * Source: OpenStreetMap relation 9732739 ("Tuluran Island"), fetched from the
 * Overpass API. Licence ODbL — attribution is rendered in the chart legend and
 * the footer.
 *
 * BUILD-PROMPT.md §3.2 forbids hand-drawing fake coastline for a real
 * navigable sound. This script exists so the coastline in the UI is the actual
 * one, simplified at a RECORDED tolerance rather than drawn by eye.
 *
 * Usage:
 *   1. Fetch:  https://overpass-api.de/api/interpreter?data=
 *              [out:json];relation(9732739);out geom;
 *      Save as scratch-tuluran.json
 *   2. node scripts/build-chart-geometry.mjs
 *      Writes src/features/chart/geometry.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'scratch-tuluran.json'
const OUT = 'src/features/chart/geometry.ts'

/**
 * 4:1 viewBox. The chart is a wide strip and the island runs north–south, so a
 * 2:1 box cropped it top and bottom under `slice`. Widening the box gives the
 * island full height with open water either side — which is where Blockade and
 * Endeavor Strait actually are, so the extra width is the subject, not padding.
 */
const VIEW_W = 640
const VIEW_H = 160

/**
 * Generous padding. The island must not fill the box: the depth bands expand
 * outward from it, and at PAD=12 the outermost band ran past the viewBox and
 * was clipped — which is what made the chart look cut off top and bottom.
 */
const PAD = 28

/** Douglas–Peucker tolerance in viewBox units. Recorded in the output. */
const TOLERANCE = 0.45

const raw = JSON.parse(readFileSync(SRC, 'utf8'))
const rel = raw.elements.find((e) => e.type === 'relation')
if (!rel) throw new Error('No relation in source data')

/* ── 1. Collect outer ways ──────────────────────────────────── */

const ways = rel.members
  .filter((m) => m.geometry && m.geometry.length > 1 && m.role !== 'inner')
  .map((m) => m.geometry.map((p) => [p.lon, p.lat]))

if (ways.length === 0) throw new Error('No outer geometry found')

/* ── 2. Stitch ways into one ring by matching endpoints ─────── */

const EPS = 1e-7
const near = (a, b) => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS

const pool = ways.slice()
let ring = pool.shift()

let progress = true
while (pool.length && progress) {
  progress = false
  for (let i = 0; i < pool.length; i++) {
    const w = pool[i]
    const head = ring[0]
    const tail = ring[ring.length - 1]
    if (near(tail, w[0])) ring = ring.concat(w.slice(1))
    else if (near(tail, w[w.length - 1])) ring = ring.concat(w.slice().reverse().slice(1))
    else if (near(head, w[w.length - 1])) ring = w.slice(0, -1).concat(ring)
    else if (near(head, w[0])) ring = w.slice().reverse().slice(0, -1).concat(ring)
    else continue
    pool.splice(i, 1)
    progress = true
    break
  }
}

/* ── 3. Project. Equirectangular with a cosine correction at this
       latitude, so the island keeps its true proportions. ────── */

const lats = ring.map((p) => p[1])
const lons = ring.map((p) => p[0])
const minLat = Math.min(...lats)
const maxLat = Math.max(...lats)
const minLon = Math.min(...lons)
const maxLon = Math.max(...lons)
const midLat = (minLat + maxLat) / 2
const kx = Math.cos((midLat * Math.PI) / 180)

const spanX = (maxLon - minLon) * kx
const spanY = maxLat - minLat

/**
 * Fit by HEIGHT, not by the larger dimension.
 *
 * The real geometry corrects an assumption the schematic got wrong: Tuluran is
 * elongated NORTH–SOUTH, not east–west. Fitting by height fills the strip
 * vertically and leaves open water either side — which is exactly what the
 * chart needs to show, because Blockade Strait (west) and Endeavor Strait
 * (east) are the whole point of the drawing.
 *
 * Orientation is never rotated to suit the layout. That would misrepresent a
 * real navigable sound.
 */
const scale = (VIEW_H - PAD * 2) / spanY

const offX = (VIEW_W - spanX * scale) / 2
const offY = (VIEW_H - spanY * scale) / 2

const projected = ring.map(([lon, lat]) => [
  offX + (lon - minLon) * kx * scale,
  // SVG y grows downward; latitude grows upward.
  offY + (maxLat - lat) * scale,
])

/* ── 4. Douglas–Peucker ─────────────────────────────────────── */

function perpDistance(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
  const cx = a[0] + t * dx
  const cy = a[1] + t * dy
  return Math.hypot(p[0] - cx, p[1] - cy)
}

function simplify(points, tolerance) {
  if (points.length < 3) return points
  let maxDist = 0
  let index = 0
  const first = points[0]
  const last = points[points.length - 1]
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], first, last)
    if (d > maxDist) {
      maxDist = d
      index = i
    }
  }
  if (maxDist <= tolerance) return [first, last]
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ]
}

const simplified = simplify(projected, TOLERANCE)

const fmt = (n) => Number(n.toFixed(1))
const toPath = (pts) =>
  'M' + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L') + 'Z'

const islandPath = toPath(simplified)

/* ── 5. Depth bands.
   We have real coastline but NOT real soundings. Rather than print invented
   depths on a chart of a navigable sound, the bands are honest offsets of the
   true coastline, and `depthIsStylised` stays true so the legend says so. ── */

/*
 * Expand from the BOUNDING-BOX centre, not the vertex average. On an irregular
 * outline the vertex average is pulled toward wherever points are dense, so the
 * bands grew off to one side and read as a drop-shadow instead of contours.
 */
const bx = simplified.map((p) => p[0])
const by = simplified.map((p) => p[1])
const cx = (Math.min(...bx) + Math.max(...bx)) / 2
const cy = (Math.min(...by) + Math.max(...by)) / 2

/*
 * Tight offsets. Earlier factors (up to 1.5) scaled the whole outline from its
 * centroid, which on an asymmetric island reads as a drop-shadow stack rather
 * than depth contours. Hugging the coast keeps them looking like soundings.
 */
const contours = [1.03, 1.07, 1.12, 1.18, 1.25].map((k) =>
  toPath(simplified.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k])),
)

/* ── 6. Emit ────────────────────────────────────────────────── */

const file = `/**
 * Chart geometry for the Living Chart Header.
 *
 * GENERATED — do not edit by hand.
 *   node scripts/build-chart-geometry.mjs
 *
 * COASTLINE IS REAL. Source: OpenStreetMap relation 9732739 "Tuluran Island",
 * fetched from the Overpass API on ${new Date().toISOString().slice(0, 10)}.
 * Licence: ODbL — attribution is rendered in the chart legend and the footer.
 *
 * ${ring.length} source points, simplified by Douglas-Peucker at a tolerance of
 * ${TOLERANCE} viewBox units to ${simplified.length} points.
 *
 * DEPTH BANDS ARE STYLISED. We have real coastline but not real soundings.
 * BUILD-PROMPT.md §3.2 forbids printing invented depths on a chart of a real
 * navigable sound, so the bands are honest offsets of the true coastline and
 * \`depthIsStylised\` stays true. No numeric depth is displayed anywhere.
 *
 * Verified facts this drawing asserts (RESEARCH.md §1):
 *   - Tuluran Island is also called Tumbod; it is a barrier island.
 *   - Blockade Strait, 1.1 km, WEST.  Endeavor Strait, 0.2 km, EAST.
 */

export interface ChartGeometry {
  readonly viewBox: string
  readonly islandPath: string
  readonly contours: readonly string[]
  readonly isSchematic: boolean
  readonly depthIsStylised: boolean
  readonly simplificationTolerance: number | null
  readonly sourcePointCount: number
  readonly attribution: string
}

export const CHART_GEOMETRY: ChartGeometry = {
  viewBox: '0 0 ${VIEW_W} ${VIEW_H}',
  islandPath:
    '${islandPath}',
  contours: [
${contours.map((c) => `    '${c}',`).join('\n')}
  ],
  isSchematic: false,
  depthIsStylised: true,
  simplificationTolerance: ${TOLERANCE},
  sourcePointCount: ${ring.length},
  attribution: '© OpenStreetMap contributors (ODbL)',
}
`

writeFileSync(OUT, file)

console.log(`Source points:     ${ring.length}`)
console.log(`Simplified to:     ${simplified.length} (tolerance ${TOLERANCE})`)
console.log(`Island path bytes: ${islandPath.length}`)
console.log(`Total file bytes:  ${file.length}`)
console.log(`Written:           ${OUT}`)
