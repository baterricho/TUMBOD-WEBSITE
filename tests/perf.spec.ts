import { test, expect, chromium } from '@playwright/test'

/**
 * Core Web Vitals, measured on a throttled connection and CPU.
 *
 * This exists alongside `lighthouserc.json` rather than instead of it.
 * Lighthouse CI runs in GitHub Actions; its chrome-launcher cannot clean up
 * its temp directory on this Windows machine (EPERM on teardown), so these
 * tests are what actually verify PERF-PLAN.md §6 during local development.
 *
 * Conditions mirror the budget: Slow 4G, 4× CPU slowdown, Moto G Power class.
 * That is persona P1's phone, not a developer laptop.
 */

const SLOW_4G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
}

interface Vitals {
  readonly lcp: number
  readonly cls: number
  readonly domContentLoaded: number
}

async function measure(path: string): Promise<Vitals> {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 412, height: 823 } })
  const page = await context.newPage()

  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', SLOW_4G)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  await page.goto(`http://localhost:4321${path}`, { waitUntil: 'load' })

  const vitals = await page.evaluate<Vitals>(() => {
    return new Promise((resolve) => {
      let lcp = 0
      let cls = 0

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
          if (!shift.hadRecentInput) cls += shift.value
        }
      }).observe({ type: 'layout-shift', buffered: true })

      // Let late shifts (fonts, images) land before reporting.
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined
        resolve({
          lcp,
          cls,
          domContentLoaded: nav ? nav.domContentLoadedEventEnd : 0,
        })
      }, 3000)
    })
  })

  await browser.close()
  return vitals
}

const ROUTES = ['/', '/ligtas', '/ligtas/hotline', '/serbisyo/barangay-clearance']

/**
 * Measure one route at a time.
 *
 * `measure()` launches its own browser with 4x CPU throttling, outside the
 * Playwright worker pool. Under `fullyParallel` that meant four throttled
 * browsers running at once, on top of every other project's workers — which
 * caused two problems, not one:
 *
 *   1. Contention crashed unrelated tests. A a11y run would die mid-navigation
 *      with "Protocol error … session closed" roughly one full run in two.
 *   2. The perf numbers were measuring each other. Four browsers deliberately
 *      throttled to a quarter speed, competing for the same cores, do not tell
 *      you what one phone experiences.
 *
 * Sequential execution fixes both. It costs about 30 seconds.
 *
 * This is done with `fullyParallel: false` on the `perf` project rather than
 * `mode: 'serial'` here, because serial ABORTS the remaining tests once one
 * fails — so a slow homepage would hide the results for the other three routes,
 * which is precisely when you most want to see them.
 */

/**
 * Warm the preview server before measuring anything.
 *
 * Without this the FIRST route measured absorbs the server's cold start and
 * reports 2.5–3.1s while the same route measures ~1.9s once warm — so whichever
 * route happened to run first failed at random. That is a flaky harness, not a
 * slow page, and relaxing the 2.5s budget to accommodate it would have hidden
 * real regressions behind measurement noise (PERF-PLAN.md §6 budgets are
 * deliberately not negotiable).
 */
test.beforeAll(async ({ request }) => {
  for (const route of ROUTES) await request.get(route)
})

/**
 * Median of three runs, not a single sample.
 *
 * A single throttled measurement on a dev machine varies enormously — the same
 * unchanged homepage measured 2456ms, 2692ms, 3220ms and 3632ms across
 * consecutive runs. A budget checked against one sample from that distribution
 * is a coin toss, and a coin-toss gate teaches everyone to ignore it.
 *
 * Lighthouse takes repeated runs for exactly this reason. Median for LCP;
 * WORST for CLS, because a layout shift that happens even sometimes is a
 * layout shift a resident will sometimes see.
 */
async function measureMedian(route: string): Promise<Vitals> {
  const runs: Vitals[] = []
  for (let i = 0; i < 3; i++) runs.push(await measure(route))

  const lcps = runs.map((r) => r.lcp).sort((a, b) => a - b)
  return {
    lcp: lcps[1]!,
    cls: Math.max(...runs.map((r) => r.cls)),
    domContentLoaded: runs.map((r) => r.domContentLoaded).sort((a, b) => a - b)[1]!,
  }
}

for (const route of ROUTES) {
  test(`vitals: ${route} on Slow 4G, 4x CPU`, async () => {
    test.slow()
    const v = await measureMedian(route)

    // eslint-disable-next-line no-console
    console.log(
      `${route.padEnd(32)} LCP ${v.lcp.toFixed(0).padStart(5)}ms   ` +
        `CLS ${v.cls.toFixed(3)}   DCL ${v.domContentLoaded.toFixed(0)}ms`,
    )

    // PERF-PLAN.md §6.
    expect(v.lcp, `${route} LCP must be under 2.5s on Slow 4G`).toBeLessThan(2500)
    expect(v.cls, `${route} CLS must be under 0.05`).toBeLessThan(0.05)
  })
}

test('no layout shift from font loading', async () => {
  test.slow()
  // Metric-matched fallbacks exist precisely so the page does not jump under
  // someone's thumb while the webfont arrives (styles/fonts.css).
  const v = await measure('/')
  expect(v.cls, 'font swap must not shift layout').toBeLessThan(0.02)
})
