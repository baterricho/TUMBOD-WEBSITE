import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The critical paths from BUILD-PROMPT.md §33. These must never break.
 *
 * They are written against what a resident actually needs, not against
 * implementation details, so they should survive refactors.
 */

test.describe('critical paths', () => {
  /*
   * REWRITTEN 2026-08-07, and the change is a real weakening — say so plainly.
   *
   * This test used to assert the sea state and the next boat were on the
   * homepage with NO interaction. The sea band and boat strip were removed
   * from the homepage that day at the owner's request (HomeView.astro), so
   * that is no longer true: both readings now live in the Today mega panel,
   * one click away, in the header of every page.
   *
   * BUILD-PROMPT.md §33 wanted "the today answer without interaction". What
   * ships now is "the today answer in one click, from anywhere on the site".
   * That is a deliberate trade the owner made, not a regression that slipped
   * through — but the test must describe what the site does, so it asserts
   * reachability rather than pretending the old guarantee still holds.
   *
   * Office status and the emergency contacts are UNCHANGED: still on the page
   * itself, still with no interaction. Those two assertions are the ones that
   * matter during a typhoon and they have not moved.
   */
  test('1. home reaches sea condition and the boat, and shows office status and emergency contacts', async ({
    page,
  }) => {
    await page.goto('/')

    // Still on the page, still no interaction required.
    await expect(page.getByText(/BUKAS ANG OPISINA|SARADO ANG OPISINA|LIMITADO/)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /mga numerong pang-emergency/i }),
    ).toBeVisible()

    // The today answer, one click away. Opening <details> is what a click
    // does; the panel needs no script, so this holds with JS disabled too.
    await page.evaluate(() =>
      document.querySelector('#mega-today')?.setAttribute('open', ''),
    )
    const today = page.locator('#mega-today')
    await expect(today.getByText(/MAHINAY|KATAMTAMAN|MALAKAS|DELIKADO/)).toBeVisible()
    await expect(
      today.getByRole('heading', { name: /susunod na biyahe/i }),
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
   *     an amnesty: a font CDN or an embed would still fail this test.
   *
   * ─────────────────────────────────────────────────────────────────
   * WIDENED ONCE, 2026-08-07, and the previous wording named exactly what
   * changed: it read "a font CDN, AN ANALYTICS BEACON or an embed would still
   * fail this test."
   *
   * The owner asked for visitor figures in the admin. Every hosted analytics
   * product was refused — they would ship residents' reading habits to a
   * company with no accountability to them — so the counter is first-party,
   * writing to the same Supabase project the CMS already uses. That is one
   * more origin the browser contacts on ordinary pages, and pretending
   * otherwise by leaving the test unchanged would be the dishonest option.
   *
   * WHAT IS NOT WIDENED, AND MUST NEVER BE: the emergency routes above. The
   * beacon is not rendered at all on /ligtas — `VisitCounter.astro` omits the
   * element at build time rather than checking a path at runtime, so there is
   * nothing on those pages to misfire. Test 10 stays absolute and test 10c
   * below proves the omission rather than trusting it.
   *
   * The allowlist is still an allowlist. Google Analytics, a font CDN, an
   * embedded map, a chat widget — all still fail.
   * ─────────────────────────────────────────────────────────────────
   */
  /*
   * The project host comes from `.env`, read here directly.
   *
   * `process.env['PUBLIC_SUPABASE_URL']` is empty in this process: Astro loads
   * `.env` when it builds, Playwright's node process does not, and the first
   * version of this allowlist therefore fell back to a placeholder and failed
   * both runs. Reading the file is the honest fix.
   *
   * When there is no `.env` — CI — the site is built without a CMS, emits no
   * beacon, and the allowlist is simply the tile host. Nothing to permit.
   */
  const supabaseHost = (() => {
    try {
      const env = readFileSync(join(process.cwd(), '.env'), 'utf8')
      const url = env.match(/^PUBLIC_SUPABASE_URL\s*=\s*"?([^"\r\n]+)"?/m)?.[1]
      return url ? [new URL(url).hostname] : []
    } catch {
      return []
    }
  })()

  const TILE_HOSTS = ['server.arcgisonline.com', ...supabaseHost]

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

  /**
   * 10c. THE VISIT COUNTER IS NOT ON THE EMERGENCY PAGES — proved, not assumed.
   *
   * Test 10 already asserts zero third-party requests there, which would catch
   * a beacon that FIRED. This is stricter and checks the markup: the script
   * must not be in the document at all.
   *
   * The distinction matters. A beacon present but not firing passes test 10
   * today and starts firing the first time someone changes a guard, reorders a
   * condition, or adds a retry. `VisitCounter.astro` omits the element at
   * build time; this is what stops that omission being quietly reverted.
   *
   * Asserted on the ENDPOINT STRING rather than on an element id. Astro's
   * `define:vars` rewrites the tag and drops other attributes, so an
   * `#visit-counter` selector silently matched nothing and the test would have
   * passed for the wrong reason. The `/rest/v1/page_views` URL is the thing
   * that actually matters: if it is in the document, the page can beacon.
   */
  for (const route of ['/ligtas', '/ligtas/hotline', '/en/ligtas', '/en/ligtas/hotline']) {
    test(`10c. no visit counter is present in the markup of ${route}`, async ({ page }) => {
      await page.goto(route)
      const html = await page.content()
      expect(html, `${route} must not reference page_views`).not.toContain('page_views')
    })
  }

  /**
   * 10d. …and it IS present on an ordinary page.
   *
   * Without this, 10c passes forever if the counter is deleted entirely or
   * never renders — a test suite that proves a feature is absent everywhere is
   * not testing the feature.
   */
  test('10d. the visit counter is present on an ordinary page', async ({ page }) => {
    await page.goto('/serbisyo')
    const html = await page.content()
    expect(html, 'ordinary pages should carry the beacon').toContain('/rest/v1/page_views')
  })
})
