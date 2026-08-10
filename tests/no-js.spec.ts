import { test, expect } from '@playwright/test'
import { ARTICLE_ROUTES } from './routes'

/**
 * Progressive enhancement — every route renders complete and readable with
 * JavaScript disabled (ARCHITECTURE.md §2).
 *
 * This runs under the `no-javascript` Playwright project.
 */

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
  // Redesign routes. These matter most to this project: the reveal animation
  // and the nav disclosure are the two places a redesign most easily breaks
  // the no-JavaScript guarantee.
  '/kasaysayan',
  '/bisyon',
  '/turismo',
  '/negosyo',
  '/larawan',
  '/faq',
  '/porma',
  '/proyekto',
  // Article and event pages, 2026-08-07. Static routes with no client script at
  // all, so they should pass trivially — which is exactly why they belong here:
  // the day someone adds a share button or a lazy body, this notices.
  '/kaganapan',
  // Discovered from the build — CMS slugs are not constants. See routes.ts.
  ...ARTICLE_ROUTES,
]

const ROUTES = [...FIL_ROUTES, ...FIL_ROUTES.map((r) => (r === '/' ? '/en' : `/en${r}`))]

for (const route of ROUTES) {
  test(`no-JS: ${route} renders its primary content`, async ({ page }) => {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeAttached()
    await expect(page.getByRole('main')).not.toBeEmpty()
    // Navigation must work as plain links.
    await expect(page.getByRole('banner').getByRole('link').first()).toBeVisible()
  })
}

test('no-JS: the emergency control still works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('banner').getByRole('link', { name: /emergency/i }).click()
  await expect(page).toHaveURL(/\/ligtas\/hotline/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('no-JS: the requirement checklist is still readable', async ({ page }) => {
  await page.goto('/serbisyo/barangay-clearance')
  // Checkboxes are an enhancement; the list itself is the answer and must be
  // fully present without them.
  await expect(page.getByRole('heading', { name: /dalhin mo ito/i })).toBeVisible()
  // Scoped to <main>: the Services mega panel names a fee on every page and
  // sits earlier in the DOM inside a collapsed <details>, so an unscoped
  // `.first()` matched the hidden copy in the header.
  await expect(page.locator('main').getByText(/bayad/i).first()).toBeVisible()
})

test('no-JS: the language toggle works as a plain link', async ({ page }) => {
  await page.goto('/ligtas')
  await page.getByRole('link', { name: 'English', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/ligtas/)
})
