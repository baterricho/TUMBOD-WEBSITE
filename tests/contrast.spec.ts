import { test, expect } from '@playwright/test'
import { ARTICLE_ROUTES } from './routes'

/**
 * DETERMINISTIC CONTRAST GATE — the one axe cannot be relied on for here.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS. Read before deleting it as "redundant with a11y.spec.ts".
 *
 * On 2026-08-07 the "Read full story" button in the News mega panel was found
 * — by a person, looking at the site — shipping white text on teal-400 at
 * 1.86:1. Effectively invisible, on a control present in the header of every
 * page. The axe suite reported ZERO violations throughout.
 *
 * Two independent blind spots produced that, and both still exist:
 *
 *   1. HIDDEN SUBTREES. The five mega panels are closed `<details>`. axe does
 *      not scan hidden content, so the densest markup on the site — and the
 *      only markup on every single page — was never audited at all.
 *      `a11y.spec.ts` now opens the panels, which closes this one.
 *
 *   2. PSEUDO-ELEMENT BACKGROUNDS, which is the deeper problem. The theme
 *      paints an ambient gradient on `body::before` and the header blur on
 *      `.siteheader::before`. axe cannot resolve a computed background
 *      through a pseudo element, so it files those nodes as **incomplete**
 *      rather than as violations — 34 of them on the homepage alone. Nothing
 *      fails. A gate that answers "I could not tell" and is read as "pass" is
 *      not a gate.
 *
 * So this file computes WCAG relative luminance directly from resolved styles.
 * It only judges text sitting on an element with its OWN opaque background —
 * which is exactly the case axe punts on, and exactly the case that broke.
 * It is narrower than axe and certain, where axe is broad and sometimes silent.
 *
 * KEEP BOTH. axe catches structure, ARIA, names, roles and ordering that this
 * knows nothing about. This catches colour that axe declines to judge.
 * ═══════════════════════════════════════════════════════════════════
 */

const ROUTES = [
  '/',
  '/serbisyo',
  '/balita',
  '/kaganapan',
  '/ligtas',
  '/ligtas/hotline',
  '/proyekto',
  '/turismo',
  '/faq',
  '/kontak',
  '/opisyal',
  ...ARTICLE_ROUTES.slice(0, 2),
]

interface Finding {
  ratio: number
  required: number
  selector: string
  fg: string
  bg: string
  size: number
  weight: string
  text: string
}

for (const route of ROUTES) {
  test(`contrast: ${route} text on opaque fills meets AA`, async ({ page }) => {
    await page.goto(route)

    // Opened, because a closed panel is where the bug hid last time. This is
    // the state a click produces and it needs no script.
    await page.evaluate(() =>
      document
        .querySelectorAll('details[data-mega]')
        .forEach((d) => d.setAttribute('open', '')),
    )

    const findings: Finding[] = await page.evaluate(() => {
      const parse = (c: string): [number, number, number, number] | null => {
        const m = c.match(/rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:[,/]\s*([\d.]+))?\)/)
        if (!m) return null
        return [+m[1]!, +m[2]!, +m[3]!, m[4] === undefined ? 1 : +m[4]!]
      }
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => {
          const c = v! / 255
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
      }
      const ratio = (a: number[], b: number[]) => {
        const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
        return (hi! + 0.05) / (lo! + 0.05)
      }

      const path = (el: Element): string => {
        const cls =
          typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
            : ''
        return el.tagName.toLowerCase() + cls
      }

      const out: Finding[] = []

      for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
        const cs = getComputedStyle(el)

        if (cs.visibility === 'hidden' || cs.display === 'none') continue
        if (parseFloat(cs.opacity) < 0.95) continue

        const bg = parse(cs.backgroundColor)
        // Only elements that paint their OWN solid fill. Anything translucent
        // or transparent depends on what is behind it, which is precisely the
        // composite this test refuses to guess at — see the header note.
        if (!bg || bg[3] < 0.95) continue

        // Direct text only. A container's colour says nothing about a child
        // that overrides it, and the child gets judged on its own turn.
        const own = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent ?? '')
          .join('')
          .trim()
        if (!own) continue

        const rect = el.getBoundingClientRect()
        if (rect.width < 2 || rect.height < 2) continue

        const fg = parse(cs.color)
        if (!fg || fg[3] < 0.95) continue

        const size = parseFloat(cs.fontSize)
        const weight = parseInt(cs.fontWeight, 10) || 400
        // WCAG 1.4.3 "large text": 24px, or 18.66px when bold.
        const large = size >= 24 || (size >= 18.66 && weight >= 700)
        const required = large ? 3 : 4.5

        const r = ratio(fg.slice(0, 3), bg.slice(0, 3))
        if (r + 0.005 < required) {
          out.push({
            ratio: Math.round(r * 100) / 100,
            required,
            selector: path(el),
            fg: cs.color,
            bg: cs.backgroundColor,
            size,
            weight: cs.fontWeight,
            text: own.slice(0, 40),
          })
        }
      }
      return out
    })

    const report = findings
      .map(
        (f) =>
          `  ${f.ratio}:1 (needs ${f.required}:1)  ${f.selector}\n` +
          `      ${f.fg} on ${f.bg} · ${f.size}px/${f.weight} · "${f.text}"`,
      )
      .join('\n')

    expect(findings, `\n${findings.length} low-contrast text pair(s) on ${route}:\n${report}\n`).toEqual(
      [],
    )
  })
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * DARK PANELS MUST CARRY LIGHT INK — the gap BOTH other gates had.
 *
 * The test above only judges text on an element with its own opaque fill, and
 * says so proudly. axe declines to judge text over a gradient or an image. The
 * homepage `<h1>` is text over a gradient, a video, or satellite imagery
 * depending on the slide — so it fell in the hole between the two, and on
 * 2026-08-08 it shipped at #020617 on a near-black scrim, about 1.1:1. The
 * largest words on the site, invisible, with every gate green.
 *
 * Neither gate was wrong; the site just has surfaces whose background is not a
 * colour. So this one stops trying to compute the background at all.
 *
 * These selectors are the painted-dark surfaces listed in oceanic.css. They are
 * dark BY DEFINITION — that is what `--surface-inverse` means — so any text in
 * them must be light, and the assertion is simply "luminance is high". No
 * background needed, nothing to guess at, and it holds whatever the hero is
 * currently showing behind the words.
 *
 * If you add a dark surface, add it to the oceanic.css ink list AND to this
 * array. The list is the fix; this is the thing that notices when the list is
 * missed.
 * ═══════════════════════════════════════════════════════════════════
 */
const DARK_SURFACES = [
  '.hero__inner',
  '.mega__hero',
  '.seaband',
  '.boatstrip',
  '.tile--doc',
  '.tile--list',
  '.tile--sos',
]

for (const route of ['/', '/en', '/ligtas', '/kontak']) {
  test(`contrast: text on dark panels is light ink on ${route}`, async ({ page }) => {
    await page.goto(route)

    const dark = await page.evaluate((selectors) => {
      const lum = (c: string) => {
        const m = c.match(/rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)/)
        if (!m) return null
        const f = (v: number) => {
          const x = v / 255
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * f(+m[1]!) + 0.7152 * f(+m[2]!) + 0.0722 * f(+m[3]!)
      }
      const out: { selector: string; color: string; lum: number; text: string }[] = []

      for (const root of Array.from(document.querySelectorAll<HTMLElement>(selectors.join(',')))) {
        const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
        for (const el of nodes) {
          const cs = getComputedStyle(el)
          if (cs.visibility === 'hidden' || cs.display === 'none') continue
          const own = Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent ?? '')
            .join('')
            .trim()
          if (!own) continue
          const r = el.getBoundingClientRect()
          if (r.width < 2 || r.height < 2) continue
          const l = lum(cs.color)
          if (l === null) continue
          // 0.18 is the WCAG midpoint: below it a colour is "a dark ink" and
          // has no business being the foreground on a panel that is dark.
          if (l < 0.18) {
            const cls =
              typeof el.className === 'string' && el.className
                ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                : ''
            out.push({
              selector: el.tagName.toLowerCase() + cls,
              color: cs.color,
              lum: Math.round(l * 1000) / 1000,
              text: own.slice(0, 40),
            })
          }
        }
      }
      return out
    }, DARK_SURFACES)

    const report = dark
      .map((d) => `  ${d.selector}  ${d.color} (luminance ${d.lum})  "${d.text}"`)
      .join('\n')

    expect(dark, `\ndark ink on a dark panel, ${route}:\n${report}\n`).toEqual([])
  })
}
