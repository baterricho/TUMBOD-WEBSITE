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

/* v4 — 2026-08-08, hero media became available offline: a MEDIA cache, a
   bounded TILE cache, and Range-aware playback from cache.
   v3 — 2026-08-07, PWA icons became PNGs and the manifest colours changed.
   v2 — 2026-08-07, the Deep Coastal Oceanic theme changed every precached font
   filename. Without the bump, existing installs keep serving a tier-1 cache
   whose font entries no longer exist on the origin. */
const CACHE_VERSION = 'v4'
const TIER1 = `tumbod-critical-${CACHE_VERSION}`
const TIER2 = `tumbod-important-${CACHE_VERSION}`
const TIER3 = `tumbod-nice-${CACHE_VERSION}`
/**
 * Tier 5 — HERO MEDIA. Photographs, video posters and video, plus the map tiles
 * someone has actually looked at.
 *
 * SEPARATE CACHES, and that is the whole safety design rather than tidiness.
 * Storage eviction is per ORIGIN and it is all-or-nothing: if this origin
 * exceeds its quota the browser can drop every cache we own, including the
 * tier-1 one that holds /ligtas and the hotline directory. Media is by far the
 * largest thing here and therefore the likeliest to trigger that, so it lives
 * in caches we can find and trim FIRST, before the disaster pages are ever at
 * risk. `trimCache` on these two is the pressure valve.
 */
const MEDIA = `tumbod-media-${CACHE_VERSION}`
const TILES = `tumbod-tiles-${CACHE_VERSION}`

/**
 * Bounds. Deliberately small enough that the whole media budget is a fraction
 * of a typical 6 GB origin quota, and trimmed LRU-ish (oldest key first).
 *
 * Two videos, not three: the hero carries three clips totalling 14.8 MB and
 * caching all of them is 14.8 MB of somebody's storage for decoration. Two
 * covers the common case — the clip you watched, and the one you watched before
 * it — and the third streams from the network exactly as it does today.
 */
const MEDIA_MAX_VIDEOS = 2
const MEDIA_MAX_IMAGES = 30
const TILES_MAX_ENTRIES = 400

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
  // present. 98 KiB total, and they never change without a filename change.
  //
  // These paths are load-bearing beyond typography: `cache.addAll` is atomic,
  // so a single 404 here rejects the whole install and the site silently
  // stops working offline. They were stale for exactly one commit when the
  // typefaces changed on 2026-08-07 — if you swap a face, swap it here too.
  '/fonts/inter-latin-400-normal.woff2',
  '/fonts/inter-latin-600-normal.woff2',
  '/fonts/inter-latin-400-italic.woff2',
  '/fonts/plus-jakarta-sans-latin-700-normal.woff2',
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
 * `/media` USED TO BE HERE, and the reasoning behind that was sound: the hero
 * video is megabytes, caching it could evict pages that matter, and /ligtas
 * surviving a typhoon outranks a decorative clip. That trade has not changed.
 *
 * What changed is the strategy. The site owner asked for the hero video, map
 * and photographs to work with no connection, and the way to do that without
 * re-introducing the old risk is to cache what a person has ALREADY
 * DOWNLOADED rather than to pre-download anything:
 *
 *   - photographs and posters (~820 KB for all of them) cache on first view;
 *   - a video is cached only after someone actually plays it, and at most two
 *     are kept;
 *   - nothing at all is cached when the device asks us not to (Save-Data);
 *   - media lives in its own caches, trimmed before tier 1 is ever pressured.
 *
 * So the offline cost is bounded and it is never paid by someone who did not
 * already spend the bytes.
 */
const NEVER_PREFIXES = ['/admin', '/api', '/ping.txt']

/** Tile hosts the two maps use. Same list as LivingChartHeader/LocationMap. */
const TILE_HOSTS = ['server.arcgisonline.com', 'tile.openstreetmap.org', 'tile.opentopomap.org']

/**
 * Respect Save-Data and 2g. Someone on a ₱50 prepaid load who has told their
 * browser to economise should not have us quietly filling a media cache.
 */
function mayStoreMedia() {
  const c = self.navigator && self.navigator.connection
  if (!c) return true
  if (c.saveData) return false
  return !/(^|-)2g$/.test(c.effectiveType || '')
}

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
  const keep = new Set([TIER1, TIER2, TIER3, MEDIA, TILES])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      /*
       * Ask the browser to make this origin's storage persistent.
       *
       * Without it every cache here is "best effort" and can be dropped under
       * storage pressure — which is exactly the scenario the offline tier
       * exists for, on exactly the cheap phones most likely to be short of
       * space. Now that media can occupy megabytes this matters more than it
       * did. It is a request, not a guarantee; browsers grant it on engagement
       * and installation, and a refusal changes nothing else here.
       */
      .then(() =>
        self.navigator && self.navigator.storage && self.navigator.storage.persist
          ? self.navigator.storage.persist().catch(() => undefined)
          : undefined,
      )
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


/**
 * Serve a cached response while honouring a `Range:` request.
 *
 * THIS FUNCTION IS WHY CACHED VIDEO PLAYS AT ALL. A <video> element does not
 * make an ordinary GET — it asks for byte ranges and expects `206 Partial
 * Content` with a `Content-Range` header. Hand it a plain 200 from the cache
 * and Safari in particular refuses to begin playback, which looks exactly like
 * "offline video is broken" while the bytes sit in the cache untouched.
 *
 * So the cache stores ONE complete copy under a range-free key, and every
 * partial request is answered by slicing that copy here.
 */
async function rangeResponse(request, cached) {
  const range = request.headers.get('range')
  if (!range) return cached

  const buf = await cached.arrayBuffer()
  const total = buf.byteLength
  const m = /bytes=(\d*)-(\d*)/.exec(range)
  if (!m) return cached

  const start = m[1] ? parseInt(m[1], 10) : 0
  const end = m[2] ? parseInt(m[2], 10) : total - 1
  if (isNaN(start) || start >= total) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } })
  }
  const last = Math.min(end, total - 1)

  return new Response(buf.slice(start, last + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': String(last - start + 1),
      'Content-Range': 'bytes ' + start + '-' + last + '/' + total,
      'Accept-Ranges': 'bytes',
    },
  })
}

/** Cache key with any Range stripped — one stored copy serves every slice. */
function mediaKey(url) {
  return new Request(url, { method: 'GET' })
}

/** Trim a cache down to `max` entries, oldest key first. */
async function trimTo(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= max) return
  for (const key of keys.slice(0, keys.length - max)) await cache.delete(key)
}

/**
 * Photographs and video posters. Cache-first: they never change without a
 * filename change, every one on the site totals ~820 KB, and cache-first is
 * what makes the hero look right the instant it opens with no signal rather
 * than after a failed request has timed out.
 */
async function mediaImage(request) {
  const cache = await caches.open(MEDIA)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const net = await fetch(request)
    if (net && net.ok && mayStoreMedia()) {
      await cache.put(request, net.clone())
      trimTo(MEDIA, MEDIA_MAX_IMAGES + MEDIA_MAX_VIDEOS)
    }
    return net
  } catch {
    return Response.error()
  }
}

/**
 * Video. Network while there IS a network, cache when there is not.
 *
 * Deliberately NOT cache-first. Streaming is what the browser does well — it
 * starts playing after a few hundred KB and never holds the whole file — and
 * putting the cache in front of that would make every online playback wait on
 * a complete copy. Offline is the exceptional path, so it is the fallback.
 *
 * The stored copy is written by `cacheVideo`, triggered by the page once
 * somebody actually presses play. Nothing here downloads a video on its own.
 */
async function mediaVideo(request) {
  const cache = await caches.open(MEDIA)
  try {
    const net = await fetch(request)
    if (net && (net.ok || net.status === 206)) return net
    const cached = await cache.match(mediaKey(request.url))
    return cached ? rangeResponse(request, cached) : net
  } catch {
    const cached = await cache.match(mediaKey(request.url))
    if (cached) return rangeResponse(request, cached)
    return Response.error()
  }
}

/**
 * Store one complete copy of a video, once, on request from the page.
 *
 * The page asks only after playback has actually started, so the person has
 * already chosen to spend these bytes on this clip — this keeps the one they
 * chose rather than adding a download they did not. `mayStoreMedia` still
 * vetoes it under Save-Data, and only MEDIA_MAX_VIDEOS survive.
 */
async function cacheVideo(url) {
  if (!mayStoreMedia()) return
  const cache = await caches.open(MEDIA)
  const key = mediaKey(url)
  if (await cache.match(key)) return

  const full = await fetch(key).catch(() => undefined)
  // Must be a complete 200. Caching a 206 would store a fragment, and the clip
  // would stop dead partway through when it was played back offline.
  if (!full || !full.ok || full.status !== 200) return
  await cache.put(key, full)

  const keys = await cache.keys()
  const videos = keys.filter((k) => /\.mp4($|\?)/.test(k.url))
  for (const k of videos.slice(0, Math.max(0, videos.length - MEDIA_MAX_VIDEOS))) {
    await cache.delete(k)
  }
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (data && data.type === 'cache-video' && typeof data.url === 'string') {
    event.waitUntil(cacheVideo(data.url))
  }
})

/**
 * Map tiles — the ONE place this worker touches a third party.
 *
 * Cache-first and bounded. A tile is immutable for a given z/x/y, so serving a
 * stored one is always correct, and it means the extent somebody has already
 * panned over still works with no signal. Zooming past what was cached shows
 * blank tiles offline; that is the honest limit of caching-what-you-saw, and
 * the alternative — pre-fetching a pyramid — is megabytes spent on an area
 * nobody may ever look at.
 *
 * The previous worker refused to touch these because opaque responses occupy
 * storage without a readable size. That reason is handled rather than ignored:
 * both tile layers now set `crossOrigin`, so these responses are CORS-readable
 * and count against quota at their true size.
 */
async function tile(request) {
  const cache = await caches.open(TILES)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const net = await fetch(request)
    if (net && net.ok && mayStoreMedia()) {
      await cache.put(request, net.clone())
      trimTo(TILES, TILES_MAX_ENTRIES)
    }
    return net
  } catch {
    return Response.error()
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

  // The single third-party exception, handled before the same-origin gate.
  if (TILE_HOSTS.includes(url.hostname)) {
    event.respondWith(tile(request))
    return
  }

  if (url.origin !== self.location.origin) return

  const path = url.pathname

  if (matchesPrefix(path, NEVER_PREFIXES)) return

  // Hero media. Video and stills take different strategies — see each.
  if (path.startsWith('/media/')) {
    event.respondWith(/\.mp4$/.test(path) ? mediaVideo(request) : mediaImage(request))
    return
  }

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
