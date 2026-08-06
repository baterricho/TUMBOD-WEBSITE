import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility — WCAG 2.2 AA, zero violations, merge blocker (A11Y-PLAN.md §8).
 *
 * Not a warning. A government site that a resident with low vision or low
 * literacy cannot use has failed at its only job.
 */

/** Every public route, in both languages. The mirror is complete, so the
 *  accessibility gate must cover it completely too. */
const FIL_ROUTES = [
  '/',
  '/ligtas',
  '/ligtas/hotline',
  '/serbisyo',
  '/serbisyo/barangay-clearance',
  '/opisyal',
  '/tungkol',
  '/kontak',
  '/balita',
  '/transparency',
  '/offline',
  // Added by the redesign (DECISION-redesign.md). A new route is not really
  // shipped until the a11y gate covers it — the hero, the card grids and the
  // FAQ accordion are all new component types and all need auditing.
  '/kasaysayan',
  '/bisyon',
  '/turismo',
  '/negosyo',
  '/larawan',
  '/faq',
  '/porma',
  '/proyekto',
]

const ROUTES = [...FIL_ROUTES, ...FIL_ROUTES.map((r) => (r === '/' ? '/en' : `/en${r}`))]

for (const route of ROUTES) {
  test(`axe: ${route} has zero violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const summary = results.violations
      .map((v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`)
      .join('\n')

    expect(results.violations, `\n${summary}\n`).toEqual([])
  })
}

test.describe('structure', () => {
  /**
   * One test PER ROUTE, not one test walking every route.
   *
   * This was a single test looping all routes. When the redesign took the site
   * from 22 routes to 40 it began exceeding the 30s test timeout under
   * parallel load and failing on whichever route it happened to reach last —
   * reported as "skip link should be first", which looked like a real
   * accessibility regression and was not. Per-route tests parallelise, and a
   * failure names the page that actually broke.
   */
  for (const route of ROUTES) {
    test(`structure: ${route} has one h1 and a skip link first`, async ({ page }) => {
      await page.goto(route)

      const headings = await page.locator('h1').allTextContents()
      expect(
        headings.length,
        `${route} should have exactly one <h1>, found: ${JSON.stringify(headings)}`,
      ).toBe(1)

      const firstFocusable = page.locator('a, button, input').first()
      await expect(firstFocusable, `${route} skip link should be first`).toHaveClass(/skip-link/)
    })
  }

  test('touch targets on the emergency path are at least 44px', async ({ page }) => {
    await page.goto('/ligtas/hotline')
    const links = page.getByRole('listitem')
    const count = await links.count()
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox()
      if (box) expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('sea condition never relies on colour alone', async ({ page }) => {
    // Persona P7 reads slowly and may not distinguish the colours. The state
    // word must be present as text (DESIGN-PLAN.md §2.4).
    //
    // Scoped to <main>. The Safety mega menu shows the same reading, and it
    // sits earlier in the DOM inside a closed <details> — so an unscoped
    // `.first()` matched the collapsed copy in the header and reported the
    // visible one on the page as hidden. What this test is about is the
    // indicator a reader actually lands on.
    await page.goto('/')
    await expect(
      page.locator('main').getByText(/MAHINAY|KATAMTAMAN|MALAKAS|DELIKADO/).first(),
    ).toBeVisible()
  })

  test('the sea state in the Today menu is a word, not just a colour', async ({
    page,
  }) => {
    // Same rule, second surface: the Today panel repeats the reading site-wide,
    // so it has to carry the word too. (It lived in the Safety panel until the
    // panels were split five ways — Safety now shows guides and contacts, and
    // the live reading belongs with the boat and the office.) Opening <details>
    // is what a click does; the panel needs no script to show.
    await page.goto('/')
    await page.evaluate(() =>
      document.querySelector('#mega-today')?.setAttribute('open', ''),
    )
    await expect(
      page.locator('#mega-today').getByText(/MAHINAY|KATAMTAMAN|MALAKAS|DELIKADO/),
    ).toBeVisible()
  })

  test('reduced motion is honoured', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const duration = await page.evaluate(() => {
      const el = document.querySelector('a')
      return el ? getComputedStyle(el).transitionDuration : '0s'
    })
    expect(duration).toMatch(/^(0s|0\.001s|1ms)$/)
  })
})
