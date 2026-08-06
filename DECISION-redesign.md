# DECISION-redesign.md
## §35's anti-pattern list is retired. The site becomes a full civic portal.

**Date:** 2026-08-05
**Decided by:** the site owner, explicitly, after the conflict was put to them.
**Supersedes:** `BUILD-PROMPT.md` §35 (UI anti-patterns), and the "no hero
banner" rule asserted in §12 and repeated in `HomeView.astro`.

---

## 1. WHAT CHANGED

The owner supplied a new brief calling for a cinematic hero, a tourism-grade
visual treatment, scroll animation, glassmorphism, sticky navigation and roughly
twenty sections. Much of that was previously **forbidden** by §35, which this
project treated as binding and which the precedent scan (`PRECEDENT-SCAN.md` §5)
had just finished *confirming* against real sites.

That conflict was raised rather than resolved silently, and the owner chose:

> **New brief wins — redesign.** §35's anti-patterns are formally retired.
> **Build with demo content** so the full design can be seen working.

Both are recorded here because a reversal that lives only in a chat log is a
reversal nobody can audit later.

---

## 2. WHAT IS NOW ALLOWED THAT WAS NOT

| Previously forbidden (§35) | Status |
|---|---|
| Full-bleed hero banner | **Allowed** — now the homepage's first screen |
| Officials carousel / headshot grid | **Allowed** |
| Three/four-card programme grids | **Allowed** |
| Stat-count rows | **Allowed** |
| Decorative gradients, glass surfaces | **Allowed, used sparingly** |
| Scroll-triggered animation | **Allowed, behind `prefers-reduced-motion`** |

---

## 3. WHAT DOES *NOT* CHANGE, AND WHY

The owner retired an aesthetic rule. They did not retire the project's
truthfulness or safety guarantees, and nothing in the new brief asks them to.
These stand:

1. **§0.2 — invention is still forbidden.** Every new section is populated from
   the DEMO dataset, which is labelled as fake in the UI, uses non-assigned
   phone numbers, suffixes names with *(halimbawa)*, and is blocked from
   production by `check-demo.mjs`. Demo content is not a way to smuggle in
   invented facts; it is a way to *see the design* while the real content is
   still outstanding.
2. **`/ligtas` stays sober.** No hero, no parallax, no animation on the page
   someone opens during a typhoon. Decoration there costs bytes and attention
   at the exact moment neither is available.
3. **Accessibility is not negotiable.** WCAG 2.2 AA, 44px targets, visible
   focus, and the automated axe sweep across every route. Glassmorphism is used
   only where the text over it still measures AA.
4. **Works without JavaScript.** Every new section renders its content with JS
   off. Animation and the mobile menu are enhancements, never the delivery
   mechanism.
5. **Offline-first.** No new third-party requests on any route. The one
   exception — map tiles — is opt-in behind a tap (`LocationMap.astro`).
6. **Performance budgets hold.** Measured after the redesign, not assumed.

---

## 4. THE HONEST RISK

The precedent scan found empirically that **liveliness is a content property,
not a design property** — four of its six signals are content. A hero banner
over a stock gradient, above sections of sample data, does not make the site
more alive; it makes it look more finished than it is.

The demo build is therefore the right vehicle for this redesign and the wrong
thing to launch. `PUBLIC_DEMO_MODE` gates it, two CI checks enforce the gate,
and the undismissable banner tells any viewer what they are looking at.

**The real content in `DISCOVERY-QUESTIONS.md` B1–B7 is still what stands
between this and a site the barangay can actually publish.**
