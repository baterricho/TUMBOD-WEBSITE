import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — Barangay Tumbod.
 *
 * The default project is a **Moto G Power class Android on Chrome**, because
 * that is what persona P1 actually holds. Testing primarily on a desktop
 * browser would validate a device almost nobody here uses.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  /**
   * Always start a fresh `astro preview` against the real static build.
   *
   * `reuseExistingServer` was picking up a stray `astro dev` server, so tests
   * ran against dev output — complete with the dev toolbar's injected DOM.
   * Never reuse: the whole point is to test what actually ships.
   */
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 180_000,
  },

  projects: [
    {
      name: 'android-phone',
      use: { ...devices['Pixel 7'] },
      // Perf has its own project — see below.
      testIgnore: /perf\.spec\.ts/,
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /perf\.spec\.ts/,
    },
    {
      /**
       * DARK MODE — added 2026-08-05 after a real escape.
       *
       * The whole a11y suite ran in light mode only, because that is
       * Playwright's default. A quick-action tile was shipping near-black text
       * on near-black paint in dark mode (1.06:1) and no test saw it — the
       * background was a fixed primitive while the ink was a semantic token
       * that inverts.
       *
       * The dark palette here is not an inversion; it is a separate designed
       * theme for brownouts, pre-dawn departures and evacuation centres at 2am
       * (tokens.css). A separate theme needs separate auditing.
       */
      name: 'dark-mode',
      use: { ...devices['Pixel 7'], colorScheme: 'dark' },
      testMatch: /a11y\.spec\.ts/,
    },
    {
      // Every route must render its primary content with JavaScript disabled
      // (ARCHITECTURE.md §2). This project is what proves it.
      name: 'no-javascript',
      use: { ...devices['Pixel 7'], javaScriptEnabled: false },
      testMatch: /no-js\.spec\.ts/,
    },
    {
      /**
       * Performance runs ALONE, after everything else.
       *
       * `dependencies` makes this project wait for the other three to finish,
       * so nothing else is competing for CPU while we measure. That matters
       * more here than in a normal suite for two reasons:
       *
       *   - `measure()` deliberately throttles the CPU to 1/4 speed. A quarter
       *     of a *contended* core is not a quarter of a core, so parallel runs
       *     inflated LCP by roughly 1.3s — /ligtas measured 1604ms alone and
       *     2924ms under load, failing a 2500ms budget it comfortably meets.
       *   - The crashes it caused were landing on *other* projects, where they
       *     looked like real a11y failures.
       *
       * It also previously ran in BOTH android-phone and desktop, measuring the
       * same thing twice — `measure()` launches its own browser at a fixed
       * 412×823 phone viewport, so neither project's device config ever
       * applied. Now it runs once.
       *
       * The cost is that the suite is serialised at the end. The benefit is a
       * perf gate whose failures mean something.
       */
      name: 'perf',
      use: { ...devices['Pixel 7'] },
      testMatch: /perf\.spec\.ts/,
      dependencies: ['android-phone', 'desktop', 'dark-mode', 'no-javascript'],
      // One route at a time, so throttled browsers do not measure each other.
      // Not `mode: 'serial'` — that would abort the remaining routes on the
      // first failure, hiding exactly the numbers needed to diagnose it.
      fullyParallel: false,
    },
  ],
})
