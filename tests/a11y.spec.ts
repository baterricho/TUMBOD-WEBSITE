import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ARTICLE_ROUTES } from './routes'

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
  // Articles and events got their own pages on 2026-08-07. A detail page is a
  // new template — figure, event fact list, sample notice, related grid — and a
  // new template is not really shipped until this gate covers it.
  '/kaganapan',
  // Article detail pages are DISCOVERED from the build, not listed — their
  // slugs come from the CMS now and change with the content. See routes.ts.
  ...ARTICLE_ROUTES,
]

const ROUTES = [...FIL_ROUTES, ...FIL_ROUTES.map((r) => (r === '/' ? '/en' : `/en${r}`))]

/**
 * Wait for the scroll-reveal fades to finish before measuring colour.
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS. Cards carrying `data-reveal="pending"` animate from
 * `opacity: 0` to `1` over 500ms. axe measures whatever opacity it finds, and
 * a half-faded card composites its text toward the background — so
 * `--ink-muted` at 0.74 alpha reports 4.02:1 and fails.
 *
 * That produced an intermittent failure on `/proyekto` and `/en/proyekto`
 * which passed every time it was re-run alone: under parallel load the scan
 * simply arrived earlier in the fade. A gate that depends on machine speed is
 * not a gate.
 *
 * This waits for the settled page — which is the state a reader actually
 * spends their time in, and the one worth auditing.
 *
 * NOT SOLVED BY EMULATING REDUCED MOTION. That would skip the animation and
 * pass, but it would also stop auditing the visual state most people get.
 * ─────────────────────────────────────────────────────────────────
 */
async function settle(page: import('@playwright/test').Page) {
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every(
          (el) => parseFloat(getComputedStyle(el).opacity) > 0.99,
        ),
      undefined,
      { timeout: 5000 },
    )
    // A page with no revealing content never settles because there is nothing
    // to wait for. That is a pass, not a failure.
    .catch(() => {})
}

for (const route of ROUTES) {
  test(`axe: ${route} has zero violations`, async ({ page }) => {
    await page.goto(route)
    await settle(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const summary = results.violations
      .map((v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`)
      .join('\n')

    expect(results.violations, `\n${summary}\n`).toEqual([])
  })
}

/**
 * THE MEGA PANELS, OPENED.
 *
 * ─────────────────────────────────────────────────────────────────
 * ADDED 2026-08-07 AFTER AN ESCAPE THIS SUITE SHOULD HAVE CAUGHT.
 *
 * `.mega-cta` — the "Read full story" button in the News panel — was shipping
 * white text on teal-400 at 1.86:1. Not marginal: invisible. It survived 40
 * routes × 2 locales × 2 colour schemes of automated auditing reporting zero
 * violations, and it was found by hand, by the owner, looking at the site.
 *
 * The reason is simple and it generalises: **the panels are closed
 * `<details>`, and axe does not scan hidden subtrees.** Five navigation panels
 * — the densest, most component-heavy markup on the site, and the only markup
 * present on EVERY page — were entirely outside the accessibility gate.
 *
 * So they are opened first. `<details open>` is exactly the state a click
 * produces, needs no script, and makes every panel a visible subtree that axe
 * will walk.
 *
 * Run once rather than per route: the header is identical everywhere, so
 * scanning it 40 times would buy nothing and cost minutes.
 * ─────────────────────────────────────────────────────────────────
 */
for (const locale of ['/', '/en']) {
  test(`axe: ${locale} with every mega panel open has zero violations`, async ({ page }) => {
    await page.goto(locale)
    await settle(page)

    const opened = await page.evaluate(() => {
      const panels = [...document.querySelectorAll('details[data-mega]')]
      panels.forEach((d) => d.setAttribute('open', ''))
      return panels.length
    })

    // If the selector ever stops matching, this test would silently scan
    // nothing and pass forever. Assert it actually opened something.
    expect(opened, 'no mega panels found — has the selector changed?').toBeGreaterThan(0)

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

  /*
   * REMOVED 2026-08-07: 'sea condition never relies on colour alone'.
   *
   * It asserted the sea-state word was visible inside <main> on `/`. The sea
   * band and boat strip were taken off the homepage that day at the owner's
   * request (see HomeView.astro), so the element it looked for no longer
   * exists there and the test could only ever fail.
   *
   * THE RULE IT PROTECTED IS NOT UNTESTED. DESIGN-PLAN.md §2.4 — state is
   * never colour alone — is still enforced on the surface that still carries
   * the reading, by the Today-panel test immediately below. Deleting that one
   * too would leave the rule unguarded; deleting this one leaves it covered
   * exactly once, which is right, because there is now exactly one surface.
   */
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
