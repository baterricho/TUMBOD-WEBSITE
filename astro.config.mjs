import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'

/**
 * Astro, chosen after measurement (PERF-PLAN.md §1b).
 *
 * Next.js 16 + React 19 shipped 172 KB gzipped of JavaScript to pages that had
 * zero client components — the App Router hydration floor. On a site whose
 * first hard constraint is that a resident pays for every byte out of a ₱50
 * prepaid load, that was not a trade we could make.
 *
 * Astro ships zero JS by default and adds it only per-island.
 */
export default defineConfig({
  site: 'https://barangaytumbod.gov.ph',
  server: { host: '0.0.0.0', port: 3000 },

  // Filipino is canonical; the English mirror lives at /en/* as real routes.
  // The language toggle must be a plain anchor that works without JS.
  i18n: {
    defaultLocale: 'fil',
    locales: ['fil', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  /**
   * Inline all CSS. The sheet is ~4 KB gzipped; on 2G a round trip costs more
   * time than those bytes cost, and inlining removes hashed-filename handling
   * from the service worker, which makes offline correctness trivial.
   */
  build: { inlineStylesheets: 'always' },

  /**
   * The dev toolbar injects its own DOM — including several <h1> elements —
   * into every page. That pollutes accessibility audits and heading-structure
   * checks, which is how it was caught: axe was auditing the toolbar, not the
   * shipped page. Off everywhere.
   */
  devToolbar: { enabled: false },

  integrations: [
    react(),
    sitemap({
      // The design system and the offline fallback are internal surfaces.
      // `/admin` joins the list: it is a staff tool, it is `noindex`, and a
      // sitemap entry would advertise it to every crawler that reads one.
      filter: (page) =>
        !page.includes('/design-system') &&
        !page.includes('/offline') &&
        !page.includes('/admin'),
      i18n: {
        defaultLocale: 'fil',
        locales: { fil: 'fil-PH', en: 'en-PH' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
