/**
 * Mega-menu content.
 *
 * Three of the five primary navigation items open a panel instead of going
 * straight to a page: News, Safety and Contact. This module supplies what goes
 * in them.
 *
 * TWO KINDS OF CONTENT LIVE HERE, and the difference matters:
 *
 *   1. STRUCTURAL — the quick-access tiles, the emergency-procedure list, the
 *      contact shortcuts. These are NAVIGATION: a label and a URL that exist
 *      because the page exists. They are real in every build.
 *
 *   2. EDITORIAL — the featured story, the news list, the events, the social
 *      accounts, the weather readings. These are FACTS ABOUT THE BARANGAY, and
 *      §0.2 does not let us invent any of them. They come from `active.ts`, so
 *      they are populated in demo mode and honestly empty otherwise, and every
 *      panel renders a designed empty state naming who can supply the missing
 *      piece.
 *
 * That split is why there is no `NEWS_ITEMS` constant below. A hard-coded
 * "Barangay Launches Coastal Cleanup Program" would be indistinguishable from a
 * real announcement in the markup, would be indexed, and would be quoted back
 * at the barangay by someone who read it. The demo dataset exists precisely so
 * the design can be reviewed populated without that risk — run
 * `npm run dev:demo`.
 */

import type { IconName } from '@/components/Icon.astro'
import { SITE } from './site'
import type { Locale } from '@/lib/i18n'

export interface MenuLink {
  readonly href: string
  readonly labelFil: string
  readonly labelEn: string
  readonly icon: IconName
  /** One line of orientation. Optional — tiles read fine without it. */
  readonly noteFil?: string
  readonly noteEn?: string
}

/** Prefixes a locale-relative path. `''` for Filipino, `/en` for English. */
export const prefix = (locale: Locale) => (locale === 'fil' ? '' : '/en')

export const label = (locale: Locale, item: { labelFil: string; labelEn: string }) =>
  locale === 'fil' ? item.labelFil : item.labelEn

export const note = (locale: Locale, item: { noteFil?: string; noteEn?: string }) =>
  locale === 'fil' ? item.noteFil : item.noteEn

/* ── News: quick access ─────────────────────────────────────────
   Every one of these is a route that already exists. */

export const NEWS_QUICK: readonly MenuLink[] = [
  {
    href: '/balita',
    labelFil: 'Lahat ng balita',
    labelEn: 'All news',
    icon: 'megaphone',
  },
  {
    href: '/proyekto',
    labelFil: 'Mga proyekto',
    labelEn: 'Projects',
    icon: 'evacuation',
  },
  {
    href: '/larawan',
    labelFil: 'Mga larawan',
    labelEn: 'Photo gallery',
    icon: 'copy',
  },
  {
    href: '/turismo',
    labelFil: 'Turismo',
    labelEn: 'Tourism',
    icon: 'mangrove',
  },
  {
    href: '/transparency',
    labelFil: 'Transparency',
    labelEn: 'Transparency',
    icon: 'checklist',
  },
  {
    href: '/hanapin',
    labelFil: 'Hanapin',
    labelEn: 'Search',
    icon: 'search',
  },
]

/* ── Safety: procedures ─────────────────────────────────────────
   Anchors into /ligtas, which is precache tier 1 — the target is guaranteed
   to be there offline, which is the whole point of the panel. */

export const PROCEDURES: readonly MenuLink[] = [
  {
    href: '/ligtas#bagyo',
    labelFil: 'Bagyo',
    labelEn: 'Typhoon',
    icon: 'wind',
    noteFil: 'Bago, habang, at pagkatapos',
    noteEn: 'Before, during and after',
  },
  {
    href: '/ligtas#baha',
    labelFil: 'Baha at storm surge',
    labelEn: 'Flood and storm surge',
    icon: 'wave-rough',
    noteFil: 'Kailan lilikas',
    noteEn: 'When to evacuate',
  },
  {
    href: '/ligtas#sunog',
    labelFil: 'Sunog',
    labelEn: 'Fire',
    icon: 'warning',
    noteFil: 'Sa bahay na kahoy at kawayan',
    noteEn: 'In timber and bamboo housing',
  },
  {
    href: '/ligtas#lindol',
    labelFil: 'Lindol',
    labelEn: 'Earthquake',
    icon: 'warning',
    noteFil: 'Duck, cover, hold',
    noteEn: 'Duck, cover, hold',
  },
  {
    href: '/ligtas#medikal',
    labelFil: 'Medical emergency',
    labelEn: 'Medical emergency',
    icon: 'health',
    noteFil: 'Paglipat sa Taytay sakay ng bangka',
    noteEn: 'Transfer to Taytay by boat',
  },
  {
    href: '/ligtas#langis',
    labelFil: 'Oil spill',
    labelEn: 'Oil spill',
    icon: 'bangka',
    noteFil: 'Sa loob ng MSPLS',
    noteEn: 'Inside the MSPLS',
  },
]

/* ── Contact: shortcuts ─────────────────────────────────────────
   `emergency: true` gets the red treatment; it is the only one that does. */

export interface ContactShortcut extends MenuLink {
  readonly emergency?: boolean
}

export const CONTACT_SHORTCUTS: readonly ContactShortcut[] = [
  {
    href: '/kontak',
    labelFil: 'Contact form',
    labelEn: 'Contact form',
    icon: 'mail',
  },
  {
    href: '/porma',
    labelFil: 'Mga porma',
    labelEn: 'Forms',
    icon: 'document',
  },
  {
    href: '/serbisyo',
    labelFil: 'Humingi ng serbisyo',
    labelEn: 'Request a service',
    icon: 'checklist',
  },
  {
    href: '/faq',
    labelFil: 'Madalas itanong',
    labelEn: 'FAQ',
    icon: 'info',
  },
  {
    href: '/opisyal',
    labelFil: 'Mga opisyal',
    labelEn: 'Officials',
    icon: 'phone',
  },
  {
    href: '/ligtas/hotline',
    labelFil: 'Emergency hotline',
    labelEn: 'Emergency hotline',
    icon: 'warning',
    emergency: true,
  },
]

/* ── Contact: social ────────────────────────────────────────────
 *
 * ONE account is verified: the Facebook page in `site.ts`, found and checked
 * in RESEARCH.md. The reference design shows five tiles — Messenger,
 * Instagram, YouTube and an address — and we have none of them.
 *
 * They are still listed, because "does the barangay have an Instagram?" is a
 * question the site should answer, and the answer is currently "not one we
 * know of". A tile with `href: null` renders unmistakably as an unclaimed slot
 * rather than as a working link, so the panel shows its full shape without
 * anybody clicking through to a 404 or, worse, to somebody else's account
 * squatting the name.
 */
export interface SocialLink {
  readonly id: string
  readonly label: string
  readonly icon: IconName
  /** `null` means "no verified account" — NOT "we didn't get round to it". */
  readonly href: string | null
  /** Brand tint for the tile, applied only when the account is real. */
  readonly brand?: string
}

export const SOCIAL: readonly SocialLink[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'megaphone',
    href: SITE.facebookUrl,
    brand: '#1877f2',
  },
  {
    id: 'messenger',
    label: 'Messenger',
    icon: 'mail',
    // The page has a Messenger inbox, but whether it is monitored is unknown,
    // and pointing residents at an unwatched inbox during a storm is worse
    // than not offering it. CONTENT-TODO.md.
    href: null,
  },
  { id: 'instagram', label: 'Instagram', icon: 'copy', href: null },
  { id: 'youtube', label: 'YouTube', icon: 'external', href: null },
  {
    id: 'email',
    label: 'Email',
    icon: 'mail',
    href: null,
  },
]

/* ── Contact: the map ───────────────────────────────────────────
   Built from the VERIFIED coordinates in `site.ts`, so "Get directions"
   actually opens the barangay and not a guess. */

const { lat, lng } = SITE.coordinates

export const MAP_LINKS = {
  view: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  satellite: `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=13&basemap=satellite`,
} as const
