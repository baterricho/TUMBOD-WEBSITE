/**
 * Service worker — Barangay Tumbod.
 *
 * The island loses signal. This is not a progressive-enhancement nicety; it is
 * the reason a resident can still find the BDRRMC number during a typhoon
 * (BUILD-PROMPT.md §19, §23; PERF-PLAN.md §7).
 *
 * Four tiers:
 *   1 CRITICAL  /ligtas/*, hotlines, /offline, home — precached on install,
 *               refreshed on every visit, NEVER evicted.
 *   2 IMPORTANT services, officials, contact — stale-while-revalidate.
 *   3 NICE      news, transparency, images — network-first, cache fallback.
 *   4 NEVER     admin, API mutations — network only.
 *
 * Bump CACHE_VERSION on any change to the tier lists.
 */

const CACHE_VERSION = 'v1'
const TIER1 = `tumbod-critical-${CACHE_VERSION}`
const TIER2 = `tumbod-important-${CACHE_VERSION}`
const TIER3 = `tumbod-nice-${CACHE_VERSION}`

/**
 * Tier 1. Estimated well under 400 KB — the entire disaster system costs less
 * than three homepage loads. CSS is inlined into each document, so there are
 * no hashed stylesheet URLs to track here.
 */
const CRITICAL_URLS = [
  '/',
  '/ligtas',
  '/ligtas/hotline',
  '/offline',
  // Fonts belong in tier 1: /ligtas must be fully legible offline, not just
  // present. 72 KB total, and they never change without a filename change.
  '/fonts/source-sans-3-latin-400-normal.woff2',
  '/fonts/source-sans-3-latin-600-normal.woff2',
  '/fonts/source-sans-3-latin-400-italic.woff2',
  '/fonts/archivo-narrow-latin-600-normal.woff2',
  '/fonts/ibm-plex-mono-latin-400-normal.woff2',
]

const TIER2_PREFIXES = ['/serbisyo', '/opisyal', '/kontak', '/tungkol', '/kalendaryo', '/form']
const TIER3_PREFIXES = ['/balita', '/transparency']
/**
 * `/ping.txt` MUST never be cached. It is the connectivity probe: if the
 * service worker answered it from cache, it would report "online" while the
 * device has no connection, which is the exact failure it exists to detect.
 */
/**
 * `/media` is here because the hero video is 5.5 MB. Caching it would evict
 * pages that matter — the whole point of the offline cache is that /ligtas and
 * the hotline directory survive a typhoon, and a single decorative clip is
 * larger than every page, font and icon on the site combined. It streams from
 * the network or it does not play; nothing else is affected either way.
 */
const NEVER_PREFIXES = ['/admin', '/api', '/ping.txt', '/media']

const TIER3_MAX_ENTRIES = 50

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(TIER1)
      .then((cache) => cache.addAll(CRITICAL_URLS))
      // A single 404 must not abort the whole install and leave the user with
      // no offline safety net at all.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([TIER1, TIER2, TIER3])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

function matchesPrefix(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/** Keep tier 3 from growing without bound. */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key)
  }
}

/** Serve from cache immediately, refresh in the background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => undefined)

  return cached || (await network) || caches.match('/offline')
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone())
      trimCache(cacheName, TIER3_MAX_ENTRIES)
    }
    return response
  } catch {
    const cached = await cache.match(request)
    return cached || (await caches.match('/offline')) || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only same-origin GETs.
  //
  // The one third-party traffic on the whole site is map tiles, and only after
  // someone taps "Buksan ang mapa" on /kontak. Those are deliberately NOT
  // cached: tile responses are opaque, so they would occupy storage without a
  // readable size, and a cache full of tiles is storage taken from /ligtas.
  // Leaflet itself is same-origin (public/vendor) and caches normally.
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  const path = url.pathname

  if (matchesPrefix(path, NEVER_PREFIXES)) return

  const isCritical =
    CRITICAL_URLS.includes(path) ||
    CRITICAL_URLS.includes(path.replace(/\/$/, '')) ||
    path.startsWith('/ligtas') ||
    path.startsWith('/fonts/')

  if (isCritical) {
    event.respondWith(staleWhileRevalidate(request, TIER1))
    return
  }

  if (matchesPrefix(path, TIER2_PREFIXES)) {
    event.respondWith(staleWhileRevalidate(request, TIER2))
    return
  }

  if (matchesPrefix(path, TIER3_PREFIXES) || request.destination === 'image') {
    event.respondWith(networkFirst(request, TIER3))
    return
  }

  // Anything else (fonts, icons, the manifest): cache-first, they are static
  // and content-hashed.
  event.respondWith(staleWhileRevalidate(request, TIER2))
})
