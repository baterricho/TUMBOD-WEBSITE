import { test, expect } from '@playwright/test'

/**
 * Offline behaviour — the promise this whole project rests on.
 *
 * The island loses signal. If /ligtas and the hotline directory do not open
 * with the network down, the site has failed at the moment it matters most
 * (BUILD-PROMPT.md §19, §23).
 *
 * This is a merge blocker.
 */

test.describe('offline', () => {
  test('hotline directory renders with the network disabled', async ({ page, context }) => {
    // Prime the service worker.
    await page.goto('/ligtas/hotline')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })

    await context.setOffline(true)
    await page.reload()

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // <main>, not the page: the Safety mega menu carries the same labels in a
    // collapsed <details> above it, and those are hidden by definition.
    const directory = page.locator('main')
    for (const label of ['Barangay Hotline', 'BDRRMC', 'Coast Guard']) {
      await expect(directory.getByText(label, { exact: false }).first()).toBeVisible()
    }

    await context.setOffline(false)
  })

  test('/ligtas renders with the network disabled', async ({ page, context }) => {
    await page.goto('/ligtas')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })

    await context.setOffline(true)
    await page.reload()

    await expect(page.getByRole('heading', { name: /ligtas/i }).first()).toBeVisible()
    // The Coast Guard sailing rule is decisive information and must survive.
    // Scoped past the collapsed mega menu — see the note above.
    await expect(page.locator('main').getByText(/Coast Guard/).first()).toBeVisible()

    await context.setOffline(false)
  })

  test('the offline band appears and names when data was last fetched', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })

    await context.setOffline(true)
    await page.reload()

    const band = page.locator('#offline-band')
    await expect(band).toBeVisible()
    // A calm band, not a modal and not a browser error page.
    await expect(band).toContainText(/naka-offline/i)

    await context.setOffline(false)
  })

  test('a cached advisory is never presented as current', async ({ page }) => {
    // Staleness must be stated, never silent — during a typhoon this is a
    // safety property, not a UX nicety (UX-STRATEGY.md §4.3).
    await page.goto('/ligtas')
    await expect(page.getByText(/baka may bago nang abiso/i)).toBeVisible()
  })
})

/**
 * ═══════════════════════════════════════════════════════════════════
 * HERO MEDIA OFFLINE — added 2026-08-08 at the owner's request: the hero
 * video, map and photographs must work with no connection.
 *
 * The design being asserted here is "keep what was already fetched", not
 * "pre-download everything", and the difference is the whole reason these
 * tests exist. Three hero clips total 14.8 MB. Pre-caching them would spend a
 * resident's prepaid data on decoration AND push the origin toward its storage
 * quota — and eviction is per-origin and all-or-nothing, so it could take
 * /ligtas down with it. That is the failure this project exists to prevent.
 *
 * So the invariants are:
 *   - photographs and posters cache on sight (small, always worth it);
 *   - a video is cached only after it has actually been PLAYED;
 *   - a cached video really plays back offline, which needs the worker to
 *     answer `Range:` requests with 206 — a plain 200 does not start playback;
 *   - map tiles that were viewed are still there offline;
 *   - and none of it costs /ligtas its place in the cache.
 * ═══════════════════════════════════════════════════════════════════
 */
test.describe('offline hero media', () => {
  test('a played video plays again with the network disabled', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })

    // Play it online. `playing` is what tells the worker to keep a copy.
    const online = await page.evaluate(async () => {
      const v = document.querySelector('video')
      if (!v) return null
      const s = v.querySelector('source[data-src]')
      if (s && !s.src) s.src = s.getAttribute('data-src')!
      v.load()
      v.muted = true
      await v.play()
      await new Promise((r) => setTimeout(r, 2000))
      return v.currentTime
    })
    expect(online, 'video should play online').toBeGreaterThan(0)

    // The worker fetches its own full copy in the background.
    await page.waitForFunction(
      async () => {
        const n = (await caches.keys()).find((k) => k.includes('media'))
        if (!n) return false
        const keys = await (await caches.open(n)).keys()
        return keys.some((k) => k.url.endsWith('.mp4'))
      },
      null,
      { timeout: 60_000 },
    )

    await context.setOffline(true)
    await page.reload()

    const offline = await page.evaluate(async () => {
      const v = document.querySelector('video')
      if (!v) return null
      const s = v.querySelector('source[data-src]')
      if (s && !s.src) s.src = s.getAttribute('data-src')!
      v.load()
      v.muted = true
      try {
        await v.play()
      } catch {
        return { currentTime: 0, error: 'play rejected' }
      }
      await new Promise((r) => setTimeout(r, 2000))
      return { currentTime: v.currentTime, error: v.error ? String(v.error.code) : null }
    })

    expect(offline?.error, 'no media error offline').toBeNull()
    expect(offline?.currentTime, 'video must advance offline').toBeGreaterThan(0)
  })

  test('hero photographs render with the network disabled', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })

    /*
     * RELOAD ONCE WHILE STILL ONLINE, and this is not test choreography — it is
     * the behaviour being asserted.
     *
     * On a genuine first visit the worker is still installing while the hero's
     * images are fetched, so its fetch handler never sees them and nothing is
     * cached. `clients.claim()` takes control of the page but cannot
     * retroactively cache requests that already completed. Media therefore
     * becomes available offline from the SECOND page view onward.
     *
     * That is the correct and unavoidable shape of it: nobody can be offline on
     * their first ever visit and expect to see a photograph they have never
     * downloaded. This reload is what a returning resident does by existing.
     */
    await page.reload()
    await page.waitForTimeout(2000)

    await context.setOffline(true)
    await page.reload()

    const painted = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>('img[src*="/media/"]')].filter(
        (i) => i.naturalWidth > 0,
      ).length,
    )
    expect(painted, 'at least one hero photograph paints offline').toBeGreaterThan(0)
  })

  test('caching media does not cost /ligtas its offline copy', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    })
    await page.goto('/ligtas')
    await page.waitForTimeout(1000)

    await context.setOffline(true)
    const res = await page.goto('/ligtas')
    expect(res?.status(), '/ligtas must still be served offline').toBe(200)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })
})
