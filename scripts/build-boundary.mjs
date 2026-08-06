/**
 * Emit the Tumbod / Tuluran Island boundary as a lat–lon ring for Leaflet.
 *
 *   node scripts/build-boundary.mjs
 *
 * The chart geometry (`build-chart-geometry.mjs`) projects the same source
 * into SVG viewBox units, which are useless to a map. This script keeps the
 * coordinates geographic so the outline can be drawn ON the satellite imagery
 * and land exactly on the real coastline.
 *
 * Source: OpenStreetMap relation 9732739 "Tuluran Island", Overpass, ODbL.
 * The island IS Barangay Tumbod (RESEARCH.md §1) — this is a real boundary,
 * not a decorative blob, which is the only reason it may be drawn as one.
 */

import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'scratch-tuluran.json'
const OUT = 'src/features/chart/boundary.ts'

/**
 * Douglas–Peucker tolerance in DEGREES. 0.00012° ≈ 13 m at this latitude —
 * finer than a satellite tile shows at the zoom the hero uses, and it takes
 * the ring from 2358 points to a few hundred. Precision beyond what can be
 * seen is just bytes on a 2G connection.
 */
const TOLERANCE = 0.00012

const raw = JSON.parse(readFileSync(SRC, 'utf8'))
const rel = raw.elements.find((e) => e.type === 'relation')
if (!rel) throw new Error('No relation in source data')

const ways = rel.members
  .filter((m) => m.geometry && m.geometry.length > 1 && m.role !== 'inner')
  .map((m) => m.geometry.map((p) => [p.lon, p.lat]))

if (ways.length === 0) throw new Error('No outer geometry found')

/* ── Stitch ways into a single ring by matching endpoints ───── */

const EPS = 1e-7
const near = (a, b) => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS

const pool = ways.slice()
let ring = pool.shift()

while (pool.length) {
  const tail = ring[ring.length - 1]
  let joined = false

  for (let i = 0; i < pool.length; i++) {
    const w = pool[i]
    if (near(tail, w[0])) {
      ring = ring.concat(w.slice(1))
      pool.splice(i, 1)
      joined = true
      break
    }
    if (near(tail, w[w.length - 1])) {
      ring = ring.concat(w.slice().reverse().slice(1))
      pool.splice(i, 1)
      joined = true
      break
    }
  }

  // Unreachable fragments (islets, gaps in the relation) are dropped rather
  // than force-joined — a fabricated closing segment would be invented
  // coastline, which §3.2 forbids.
  if (!joined) break
}

/* ── Simplify ───────────────────────────────────────────────── */

function perpDist(p, a, b) {
  const [x, y] = p
  const [x1, y1] = a
  const [x2, y2] = b
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

function simplify(points, tol) {
  if (points.length < 3) return points
  let maxD = 0
  let idx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1])
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD <= tol) return [points[0], points[points.length - 1]]
  return [
    ...simplify(points.slice(0, idx + 1), tol).slice(0, -1),
    ...simplify(points.slice(idx), tol),
  ]
}

const sourceCount = ring.length
const simplified = simplify(ring, TOLERANCE)

/* ── Bounds, so the map can frame the island exactly ────────── */

const lats = simplified.map((p) => p[1])
const lons = simplified.map((p) => p[0])
const bounds = {
  south: Math.min(...lats),
  west: Math.min(...lons),
  north: Math.max(...lats),
  east: Math.max(...lons),
}

const round = (n) => Number(n.toFixed(5))

// Leaflet takes [lat, lon]; OSM gives [lon, lat]. Swapped here, once.
const latlngs = simplified.map(([lon, lat]) => [round(lat), round(lon)])

const out = `/**
 * Barangay Tumbod boundary — geographic coordinates for Leaflet.
 *
 * GENERATED — do not edit by hand.
 *   node scripts/build-boundary.mjs
 *
 * REAL BOUNDARY. Source: OpenStreetMap relation 9732739 "Tuluran Island",
 * Overpass API. Licence: ODbL — attribution is rendered on the map.
 *
 * Tuluran Island IS Barangay Tumbod (RESEARCH.md §1), which is what makes it
 * legitimate to outline the island and label it as the barangay. It is the
 * island's coastline, not a surveyed administrative boundary line, and the
 * map says so.
 *
 * ${sourceCount} source points, simplified at ${TOLERANCE}° (~13 m) to ${latlngs.length}.
 */

/** [lat, lon] pairs, closed ring. */
export const TUMBOD_BOUNDARY: readonly (readonly [number, number])[] = ${JSON.stringify(
  latlngs,
)}

export const TUMBOD_BOUNDS = {
  south: ${round(bounds.south)},
  west: ${round(bounds.west)},
  north: ${round(bounds.north)},
  east: ${round(bounds.east)},
} as const

export const BOUNDARY_ATTRIBUTION = '© OpenStreetMap contributors (ODbL)'
`

writeFileSync(OUT, out)
console.log(`${OUT}: ${sourceCount} → ${latlngs.length} points`)
console.log(`bounds S${round(bounds.south)} W${round(bounds.west)} N${round(bounds.north)} E${round(bounds.east)}`)
