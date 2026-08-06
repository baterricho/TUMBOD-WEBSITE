import { test, expect } from '@playwright/test'

/**
 * The critical paths from BUILD-PROMPT.md §33. These must never break.
 *
 * They are written against what a resident actually needs, not against
 * implementation details, so they should survive refactors.
 */

test.describe('critical paths', () => {
  test('1. home shows sea condition, office status and emergency contacts', async ({ page }) => {
    await page.goto('/')

    // The "today" answer must be present without interaction.
    await expect(page.getByRole('heading', { name: /dagat ngayon/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /susunod na biyahe/i })).toBeVisible()

    // Office status: one of the three states, never blank.
    await expect(page.getByText(/BUKAS ANG OPISINA|SARADO ANG OPISINA|LIMITADO/)).toBeVisible()

    await expect(
      page.getByRole('heading', { name: /mga numerong pang-emergency/i }),
    ).toBeVisible()
  })

  test('2. emergency control is reachable from every page type', async ({ page }) => {
    for (const path of ['/', '/ligtas', '/serbisyo', '/tungkol', '/transparency', '/kontak']) {
      await page.goto(path)
      const emergency = page.getByRole('banner').getByRole('link', { name: /emergency/i })
      await expect(emergency, `emergency link missing on ${path}`).toBeVisible()
      await expect(emergency).toHaveAttribute('href', /\/ligtas\/hotline/)
    }
  })

  test('3. emergency control is among the first tab stops', async ({ page }) => {
    await page.goto('/')
    // Skip link first, then the seal/home, then language, then emergency —
    // it must be reachable in a handful of keystrokes (A11Y-PLAN.md §2).
    const reached: string[] = []
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      reached.push((await page.evaluate(() => document.activeElement?.textContent ?? '')).trim())
    }
    expect(reached.join(' | ')).toMatch(/emergency/i)
  })

  test('4. clearance requirements are two taps from home', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /kumuha ng clearance/i }).click()
    await expect(page).toHaveURL(/\/serbisyo\/barangay-clearance/)
    // The checklist is the answer and must be above the process narrative.
    await expect(page.getByRole('heading', { name: /dalhin mo ito/i })).toBeVisible()
  })

  test('5. language toggle preserves the current page', async ({ page }) => {
    await page.goto('/ligtas')
    await page.getByRole('link', { name: 'English', exact: true }).click()
    await expect(page).toHaveURL(/\/en\/ligtas/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    // And no Filipino copy leaks into the English page.
    await expect(page.getByText('Ipinagbabawal ng Coast Guard')).toHaveCount(0)
  })

  test('6. hotline directory lists every emergency service', async ({ page }) => {
    await page.goto('/ligtas/hotline')
    // Scoped to <main>. The Safety mega menu repeats these labels site-wide and
    // sits earlier in the DOM inside a closed <details>, so an unscoped
    // `.first()` matches the collapsed copy in the header and reports the
    // directory on the page as hidden. The directory is what this test guards.
    const directory = page.locator('main')
    for (const label of ['Barangay Hotline', 'BDRRMC', 'Coast Guard', 'RHU Taytay']) {
      await expect(directory.getByText(label, { exact: false }).first()).toBeVisible()
    }
  })

  /**
   * The ONLY numbers verified to reach Barangay Tumbod, confirmed 2026-08-05
   * (FINDINGS-2026-08-05.md §2). Adding a number here without dialling it first
   * defeats the entire point of this test.
   */
  const VERIFIED_NUMBERS = ['0927-978-7629', '0928-284-0826']

  /**
   * The unassigned sample prefix. `sample.ts` uses 0999-000-00xx in the
   * navigation panels of every build, deliberately: 0999 is not an assigned
   * Philippine prefix, so these cannot ring anyone. They are permitted in the
   * text scan below and forbidden in `tel:` hrefs by test 7c.
   */
  const SAMPLE_PREFIX = /^0999000\d{4}$/

  test('7. every published phone number is a verified one', async ({ page }) => {
    // This test used to assert that NO number appeared anywhere, because none
    // were verified. Two now are, so the guard moves rather than disappears:
    // any digit-string that looks like a Philippine mobile number must be one
    // we have actually confirmed, or an unassigned sample. An unrecognised
    // number is a fabrication and a P0 defect (BUILD-PROMPT.md §0.2).
    await page.goto('/ligtas/hotline')
    const body = (await page.textContent('body')) ?? ''

    const found = body.match(/09\d{2}[\s-]?\d{3}[\s-]?\d{4}/g) ?? []
    const normalise = (s: string) => s.replace(/\D/g, '')
    const allowed = VERIFIED_NUMBERS.map(normalise)

    for (const n of found) {
      const digits = normalise(n)
      if (SAMPLE_PREFIX.test(digits)) continue
      expect(allowed, `unverified number published: ${n}`).toContain(digits)
    }

    // The remaining hotlines (BDRRMC, Coast Guard, RHU, MDRRMO, PNP) are still
    // unknown, and must still say so rather than render blank.
    expect(body).toContain('NEEDS DATA')
  })

  test('7c. no unassigned sample number is ever dialable', async ({ page }) => {
    /*
     * The rule that makes carrying sample numbers on a live site acceptable at
     * all: they may be READ, never TAPPED. `scripts/check-demo.mjs` enforces
     * this over the whole built output; this checks the runtime DOM of the two
     * pages that carry the most phone numbers, so a regression is caught in the
     * browser as well as in the artefact.
     */
    for (const route of ['/', '/ligtas/hotline']) {
      await page.goto(route)
      const hrefs = await page.locator('a[href^="tel:"]').evaluateAll((els) =>
        els.map((e) => e.getAttribute('href') ?? ''),
      )
      for (const href of hrefs) {
        expect(
          href.replace(/\D/g, ''),
          `${route} makes an unassigned sample number dialable: ${href}`,
        ).not.toMatch(SAMPLE_PREFIX)
      }
    }
  })

  test('7b. verified numbers are dialable and strip visual separators', async ({ page }) => {
    // Feature phones and older WebViews mis-parse hyphens in a tel: href, and
    // the failure mode is a dialer opening blank mid-emergency.
    await page.goto('/ligtas/hotline')
    const href = await page.locator('a[href^="tel:"]').first().getAttribute('href')
    expect(href).toMatch(/^tel:\+?\d+$/)
  })

  test('8. service checklist state persists across a reload', async ({ page }) => {
    await page.goto('/serbisyo/barangay-clearance')
    const box = page.locator('input[type="checkbox"]').first()
    await box.check()
    await page.reload()
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked()
  })

  test('9. every download and outbound link is honest about leaving', async ({ page }) => {
    await page.goto('/balita')
    const fb = page.getByRole('link', { name: /facebook page/i }).first()
    await expect(fb).toHaveAttribute('href', /facebook\.com/)
  })

  /**
   * NARROWED, 2026-08-05 — and made stricter where it counts.
   *
   * This asserted zero third-party requests on every public route (§22.3).
   * The owner asked for a satellite map as the homepage hero, which cannot be
   * satisfied without fetching tiles, so the blanket rule is no longer true.
   *
   * Deleting the test would have thrown away the property that actually
   * matters. The rule is therefore split:
   *
   *   - EMERGENCY routes keep the absolute guarantee. `/ligtas` and
   *     `/ligtas/hotline` are precache tier 1 and are opened during typhoons,
   *     on 2G, or with no signal at all. Nothing there may depend on a host we
   *     do not control.
   *   - The homepage may request map TILES and nothing else. An allowlist, not
   *     an amnesty: a font CDN, an analytics beacon or an embed would still
   *     fail this test.
   */
  const TILE_HOSTS = ['server.arcgisonline.com']

  for (const route of ['/ligtas', '/ligtas/hotline']) {
    test(`10. no third-party origin is requested on ${route}`, async ({ page }) => {
      const external: string[] = []
      page.on('request', (req) => {
        if (new URL(req.url()).hostname !== 'localhost') external.push(req.url())
      })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      expect(external, `third-party requests: ${external.join(', ')}`).toHaveLength(0)
    })
  }

  test('10b. the homepage requests map tiles and nothing else third-party', async ({ page }) => {
    const disallowed: string[] = []
    page.on('request', (req) => {
      const host = new URL(req.url()).hostname
      if (host === 'localhost') return
      if (!TILE_HOSTS.includes(host)) disallowed.push(req.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Give the idle-deferred map its chance to load before judging.
    await page.waitForTimeout(2500)
    expect(
      disallowed,
      `unexpected third-party requests: ${disallowed.join(', ')}`,
    ).toHaveLength(0)
  })
})
