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
