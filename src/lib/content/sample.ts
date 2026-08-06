/**
 * SAMPLE CONTENT for the mega panels — visible by default, and labelled.
 *
 * This is a different thing from `demo.ts`. Demo mode replaces the WHOLE SITE
 * with fake data behind `PUBLIC_DEMO_MODE`, and puts a banner on every page.
 * This file is narrower: it fills the four navigation panels so the design can
 * be reviewed and handed over populated, and every block it feeds carries a
 * visible "SAMPLE DATA" chip so nobody mistakes it for barangay information.
 *
 * FOUR RULES, and they are the reason this file can ship at all.
 *
 * 1. NO REAL-LOOKING PHONE NUMBERS. The brief supplied 0917-555-100x. 0917 is
 *    a live Globe prefix, so those numbers reach SOMEBODY — printing them on a
 *    barangay site points residents at a stranger's handset. Every number here
 *    uses 0999-000-00xx, which is not an assigned Philippine prefix, exactly as
 *    demo.ts already requires.
 *
 * 2. NO `tel:` LINKS ON SAMPLE NUMBERS. They render as plain text. The one
 *    genuinely dangerous outcome of populated placeholder data is somebody
 *    dialling it during an emergency.
 *
 * 3. NO INVENTED GOVERNMENT ADDRESSES. The brief supplied
 *    `info@barangaytumbod.gov.ph`. A .gov.ph address is an official identifier
 *    and this barangay has not published one; minting it here would put a
 *    fabricated government contact into search results. The sample uses
 *    `.example`, which IANA reserves precisely so documentation cannot collide
 *    with a real domain (RFC 2606).
 *
 * 4. NO FABRICATED ANNOUNCEMENTS PRESENTED AS NEWS. Every headline below is
 *    suffixed "(sample)" in both languages, so a screenshot of this panel
 *    cannot be quoted back as something the barangay announced.
 *
 * REPLACING THIS: delete the entries and point the panels at `active.ts`. The
 * shapes deliberately mirror `types.ts`, so real content drops straight in.
 */

import type { IconName } from '@/components/Icon.astro'

/** Appended to every headline and event name. Both languages, deliberately. */
export const SAMPLE_TAG = '(sample)'

export interface SampleStory {
  readonly id: string
  readonly titleFil: string
  readonly titleEn: string
  readonly bodyFil: string
  readonly bodyEn: string
  readonly date: string
  readonly categoryFil: string
  readonly categoryEn: string
  /** Reuses photography already in the repo — no new stock imagery. */
  readonly image?: string
}

export const SAMPLE_FEATURED: SampleStory = {
  id: 'feature',
  titleFil: `Naglunsad ang Barangay Tumbod ng programa sa pagtatanim ng bakawan ${SAMPLE_TAG}`,
  titleEn: `Barangay Tumbod launches a coastal mangrove restoration programme ${SAMPLE_TAG}`,
  bodyFil:
    'Inilunsad ng Barangay Council ang isang programa para sa muling pagtatanim ng bakawan, upang palakasin ang proteksyon ng baybayin at pagbutihin ang yamang-dagat.',
  bodyEn:
    'The Barangay Council launched a community-wide mangrove restoration initiative to strengthen coastal protection and improve marine biodiversity.',
  date: 'Agosto 5, 2026',
  categoryFil: 'Kalikasan',
  categoryEn: 'Environment',
  image: '/media/tumbod-cove-1-thumb.jpg',
}

export const SAMPLE_STORIES: readonly SampleStory[] = [
  {
    id: 's1',
    titleFil: `Medical mission para sa mga senior citizen ${SAMPLE_TAG}`,
    titleEn: `Medical mission for senior citizens ${SAMPLE_TAG}`,
    bodyFil: '',
    bodyEn: '',
    date: 'Agosto 2, 2026',
    categoryFil: 'Kalusugan',
    categoryEn: 'Health',
    image: '/media/tumbod-falls-thumb.jpg',
  },
  {
    id: 's2',
    titleFil: `Natapos ang rehabilitasyon ng daan ${SAMPLE_TAG}`,
    titleEn: `Road rehabilitation completed ${SAMPLE_TAG}`,
    bodyFil: '',
    bodyEn: '',
    date: 'Hulyo 29, 2026',
    categoryFil: 'Imprastruktura',
    categoryEn: 'Infrastructure',
    image: '/media/tumbod-pantalan-thumb.jpg',
  },
  {
    id: 's3',
    titleFil: `Bagong programa ng scholarship ${SAMPLE_TAG}`,
    titleEn: `New scholarship programme announced ${SAMPLE_TAG}`,
    bodyFil: '',
    bodyEn: '',
    date: 'Hulyo 22, 2026',
    categoryFil: 'Edukasyon',
    categoryEn: 'Education',
    image: '/media/tumbod-cove-2-thumb.jpg',
  },
  {
    id: 's4',
    titleFil: `Iskedyul ng barangay assembly ${SAMPLE_TAG}`,
    titleEn: `Barangay assembly schedule ${SAMPLE_TAG}`,
    bodyFil: '',
    bodyEn: '',
    date: 'Hulyo 18, 2026',
    categoryFil: 'Anunsyo',
    categoryEn: 'Notice',
    image: '/media/tumbod-hero-poster.jpg',
  },
  {
    id: 's5',
    titleFil: `Tagumpay ang clean-up sa baybayin ${SAMPLE_TAG}`,
    titleEn: `Coastal clean-up success ${SAMPLE_TAG}`,
    bodyFil: '',
    bodyEn: '',
    date: 'Hulyo 12, 2026',
    categoryFil: 'Kalikasan',
    categoryEn: 'Environment',
    image: '/media/tumbod-cove-1-thumb.jpg',
  },
]

export interface SampleEvent {
  readonly month: string
  readonly day: string
  readonly titleFil: string
  readonly titleEn: string
  readonly placeFil: string
  readonly placeEn: string
}

export const SAMPLE_EVENTS: readonly SampleEvent[] = [
  {
    month: 'AGO',
    day: '15',
    titleFil: `Medical mission ${SAMPLE_TAG}`,
    titleEn: `Medical mission ${SAMPLE_TAG}`,
    placeFil: 'Barangay Covered Court',
    placeEn: 'Barangay Covered Court',
  },
  {
    month: 'AGO',
    day: '20',
    titleFil: `Barangay assembly ${SAMPLE_TAG}`,
    titleEn: `Barangay assembly ${SAMPLE_TAG}`,
    placeFil: 'Barangay Hall',
    placeEn: 'Barangay Hall',
  },
  {
    month: 'SET',
    day: '02',
    titleFil: `Clean-up sa baybayin ${SAMPLE_TAG}`,
    titleEn: `Coastal clean-up ${SAMPLE_TAG}`,
    placeFil: 'Baybayin ng Tumbod',
    placeEn: 'Tumbod shoreline',
  },
]

/* ── Safety ─────────────────────────────────────────────────────
   Numbers are 0999-000-00xx: not an assigned Philippine prefix, so nothing
   here can ring a real handset. They are rendered as text, never as links. */

export interface SampleContact {
  readonly id: string
  readonly labelFil: string
  readonly labelEn: string
  readonly number: string
  readonly icon: IconName
}

export const SAMPLE_EMERGENCY: readonly SampleContact[] = [
  {
    id: 'police',
    labelFil: 'Taytay Police Station',
    labelEn: 'Taytay Police Station',
    number: '0999-000-0011',
    icon: 'shield',
  },
  {
    id: 'fire',
    labelFil: 'Fire Station',
    labelEn: 'Fire Station',
    number: '0999-000-0012',
    icon: 'warning',
  },
  {
    id: 'rhu',
    labelFil: 'Rural Health Unit',
    labelEn: 'Rural Health Unit',
    number: '0999-000-0013',
    icon: 'health',
  },
  {
    id: 'pcg',
    labelFil: 'Philippine Coast Guard',
    labelEn: 'Philippine Coast Guard',
    number: '0999-000-0014',
    icon: 'anchor',
  },
]

/**
 * Weather. Presented as a SAMPLE READING, not a live one — there is no
 * meteorological feed wired to this site, and a widget that looks live but is
 * baked into the HTML is the worst of both. The panel labels it and links to
 * /ligtas, which carries the readings the site actually has.
 */
export const SAMPLE_WEATHER = {
  temperature: '29',
  conditionFil: 'Maaraw',
  conditionEn: 'Sunny',
  metrics: [
    { labelFil: 'Halumigmig', labelEn: 'Humidity', value: '74%', icon: 'droplet' as IconName },
    { labelFil: 'Hangin', labelEn: 'Wind', value: '12 km/h', icon: 'wind' as IconName },
    { labelFil: 'Taas ng alon', labelEn: 'Wave height', value: '0.6 m', icon: 'wave-moderate' as IconName },
    { labelFil: 'Taog', labelEn: 'Tide', value: 'Katamtaman', icon: 'anchor' as IconName },
    { labelFil: 'UV index', labelEn: 'UV index', value: '6', icon: 'sun' as IconName },
  ],
} as const

export interface SampleSite {
  readonly nameFil: string
  readonly nameEn: string
  readonly noteFil: string
  readonly noteEn: string
}

export const SAMPLE_EVAC: readonly SampleSite[] = [
  {
    nameFil: 'Barangay Hall',
    nameEn: 'Barangay Hall',
    noteFil: 'Pangunahing evacuation centre',
    noteEn: 'Primary evacuation centre',
  },
  {
    nameFil: 'Health Center',
    nameEn: 'Health Centre',
    noteFil: 'Pangunang lunas',
    noteEn: 'First aid',
  },
  {
    nameFil: 'Covered Court',
    nameEn: 'Covered Court',
    noteFil: 'Karagdagang silungan',
    noteEn: 'Overflow shelter',
  },
]

/* ── Contact ────────────────────────────────────────────────────
   `.example` is IANA-reserved (RFC 2606) so this address cannot collide with
   a real domain, and it cannot be mistaken for an official .gov.ph one. */

export const SAMPLE_HALL = {
  nameFil: 'Barangay Tumbod Hall',
  nameEn: 'Barangay Tumbod Hall',
  addressFil: 'Pulo ng Tuluran, Taytay, Palawan',
  addressEn: 'Tuluran Island, Taytay, Palawan',
  phone: '0999-000-0015',
  email: 'info@barangaytumbod.example',
  hoursFil: 'Lunes–Biyernes, 8:00 AM – 5:00 PM',
  hoursEn: 'Monday–Friday, 8:00 AM – 5:00 PM',
} as const

export interface SampleSocial {
  readonly id: string
  readonly network: string
  readonly handleFil: string
  readonly handleEn: string
  readonly icon: IconName
  readonly brand: string
}

export const SAMPLE_SOCIAL: readonly SampleSocial[] = [
  {
    id: 'facebook',
    network: 'Facebook',
    handleFil: 'Barangay Tumbod Official',
    handleEn: 'Barangay Tumbod Official',
    icon: 'megaphone',
    brand: '#1877f2',
  },
  {
    id: 'messenger',
    network: 'Messenger',
    handleFil: 'Barangay Support',
    handleEn: 'Barangay Support',
    icon: 'mail',
    brand: '#a334fa',
  },
  {
    id: 'instagram',
    network: 'Instagram',
    handleFil: 'Visit Tumbod',
    handleEn: 'Visit Tumbod',
    icon: 'copy',
    brand: '#d62976',
  },
  {
    id: 'youtube',
    network: 'YouTube',
    handleFil: 'Barangay Tumbod TV',
    handleEn: 'Barangay Tumbod TV',
    icon: 'external',
    brand: '#ff0000',
  },
]
