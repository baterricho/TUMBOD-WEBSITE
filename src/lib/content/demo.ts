/**
 * DEMO DATA — NOT REAL. NEVER SHIPS TO PRODUCTION.
 *
 * Why this exists: the barangay cannot judge a site made entirely of
 * [[NEEDS DATA]] markers. This dataset lets them see the real thing populated,
 * so they can react to the design and understand what information the site is
 * asking them for.
 *
 * Why it is built the way it is: BUILD-PROMPT.md §0.2 forbids inventing data,
 * and the reason is specific — a fabricated hotline number on a disaster page,
 * for an island where a typhoon made landfall in this municipality in November
 * 2025, could get someone hurt. Demo data does not get to weaken that rule, so:
 *
 *   1. Gated behind PUBLIC_DEMO_MODE=true. Off by default.
 *   2. `scripts/check-demo.mjs` FAILS the build if demo output is produced
 *      without the flag, or if a production deploy contains it.
 *   3. Every page carries an undismissable banner saying the data is fake.
 *   4. Phone numbers use 0999-000-00XX — a non-assigned pattern — AND are
 *      rendered as plain text, never as `tel:` links, so no one can dial one
 *      by reflex.
 *   5. People are named "Juan Dela Cruz"-style, the Philippine equivalent of
 *      John Doe, and every name is suffixed "(halimbawa)".
 *
 * When real content arrives, delete this file. Nothing imports it directly —
 * only `active.ts` does, behind the flag.
 */

import type {
  Advisory,
  Announcement,
  BoatTrip,
  ChecklistItem,
  EvacuationSite,
  Hotline,
  OfficeHours,
  SeaCondition,
  ServiceSummary,
} from './types'
import type { ServiceDetail } from './services'
import { TYPHOON_CHECKLIST } from './fallback'

/** Deliberately non-dialable and visibly fake. */
const fakeNumber = (n: number) => `0999-000-00${String(n).padStart(2, '0')}`

const SAMPLE = '(halimbawa)'

export const DEMO_HOTLINES: readonly Hotline[] = [
  {
    id: 'barangay',
    labelFil: 'Barangay Hotline',
    labelEn: 'Barangay Hotline',
    number: fakeNumber(1),
    category: 'barangay',
    verifiedAt: new Date('2026-07-20T08:00:00+08:00'),
    active: true,
  },
  {
    id: 'bdrrmc',
    labelFil: 'BDRRMC',
    labelEn: 'BDRRMC',
    number: fakeNumber(2),
    category: 'disaster',
    verifiedAt: new Date('2026-07-20T08:00:00+08:00'),
    active: true,
  },
  {
    id: 'coastguard',
    labelFil: 'Coast Guard — Northern Palawan',
    labelEn: 'Coast Guard — Northern Palawan',
    number: fakeNumber(3),
    category: 'maritime',
    verifiedAt: new Date('2026-06-01T08:00:00+08:00'),
    active: true,
  },
  {
    id: 'rhu',
    labelFil: 'RHU Taytay',
    labelEn: 'RHU Taytay',
    number: fakeNumber(4),
    category: 'health',
    verifiedAt: new Date('2026-07-15T08:00:00+08:00'),
    active: true,
  },
  {
    id: 'mdrrmo',
    labelFil: 'MDRRMO Taytay',
    labelEn: 'MDRRMO Taytay',
    number: fakeNumber(5),
    category: 'disaster',
    verifiedAt: new Date('2026-05-02T08:00:00+08:00'),
    active: true,
  },
  {
    id: 'pnp',
    labelFil: 'PNP Taytay',
    labelEn: 'PNP Taytay',
    number: fakeNumber(6),
    category: 'police',
    verifiedAt: new Date('2026-07-01T08:00:00+08:00'),
    active: true,
  },
]

export const DEMO_EVACUATION_SITES: readonly EvacuationSite[] = [
  {
    id: 'eskwelahan',
    name: `Tumbod Elementary School ${SAMPLE}`,
    purok: 'Purok 1',
    capacity: 180,
    accessNoteFil: 'Nasa mataas na bahagi. Maglakad mula sa pantalan, mga 10 minuto.',
    contactPerson: `Kgg. Juan Dela Cruz ${SAMPLE}`,
  },
  {
    id: 'kapilya',
    name: `Barangay Covered Court ${SAMPLE}`,
    purok: 'Purok 2',
    capacity: 120,
    accessNoteFil: 'Katabi ng barangay hall. May kuryente kapag may generator.',
    contactPerson: `Kgg. Maria Santos ${SAMPLE}`,
  },
]

export const DEMO_SEA_CONDITION = (observedAt: Date): SeaCondition => ({
  state: 'rough',
  waveHeightM: 2.1,
  windKph: 32,
  windDirection: 'Habagat',
  observedAt,
  source: 'PAGASA (demo)',
  manualOverride: false,
})

export const DEMO_BOAT_TRIP = (updatedAt: Date): BoatTrip => ({
  id: 'main',
  route: 'Tumbod → Liminangcong',
  operator: `Bangkang "Malampaya Star" ${SAMPLE}`,
  departureTime: '6:00 AM',
  fare: '₱120',
  status: 'uncertain',
  // The demo deliberately shows the Coast Guard case, because it is the one
  // residents most need explained (RESEARCH.md §4).
  statusReason: 'pcg_sailing_ban',
  updatedAt,
})

export const DEMO_OFFICE_HOURS = (todayLabel: string): OfficeHours => ({
  state: 'open',
  todayLabel,
  hoursToday: '8:00 AM – 5:00 PM',
  nextOpen: '8:00 AM',
})

export const DEMO_ADVISORY: Advisory = {
  id: 'demo-advisory',
  level: 'warning',
  titleFil: `Signal No. 2 — Bagyong ${SAMPLE}`,
  titleEn: `Signal No. 2 — Sample Typhoon ${SAMPLE}`,
  instructionFil:
    'Manatili sa loob ng bahay. Huwag maglayag. Ihanda ang gamit para sa paglikas.',
  instructionEn: 'Stay indoors. Do not sail. Prepare your things for evacuation.',
  issuedAt: new Date('2026-08-04T16:00:00+08:00'),
  expiresAt: new Date('2026-08-06T16:00:00+08:00'),
  hotlineOverride: null,
}

export const DEMO_ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'a1',
    slug: 'distribusyon-ng-relief-goods',
    category: 'ayuda',
    titleFil: `Distribusyon ng relief goods ${SAMPLE}`,
    titleEn: `Relief goods distribution ${SAMPLE}`,
    excerptFil:
      'Sa Miyerkules, 8:00 AM sa Barangay Hall. Dalhin ang barangay ID at listahan ng pamilya.',
    publishedAt: new Date('2026-08-03T09:00:00+08:00'),
  },
  {
    id: 'a2',
    slug: 'bakuna-para-sa-mga-bata',
    category: 'kalusugan',
    titleFil: `Libreng bakuna para sa 0–5 taong gulang ${SAMPLE}`,
    titleEn: `Free vaccination for ages 0–5 ${SAMPLE}`,
    excerptFil: 'Biyernes, 8:00 AM–12:00 NN sa Health Station. Dalhin ang health card.',
    publishedAt: new Date('2026-08-01T14:00:00+08:00'),
  },
  {
    id: 'a3',
    slug: 'ordinansa-2026-04',
    category: 'ordinansa',
    titleFil: `Ordinansa Blg. 2026-04 ${SAMPLE}`,
    titleEn: `Ordinance No. 2026-04 ${SAMPLE}`,
    excerptFil:
      'Pagbabawal sa pagtatapon ng basura sa baybayin. Multa: ₱500 sa unang paglabag.',
    publishedAt: new Date('2026-07-28T10:00:00+08:00'),
  },
]

export const DEMO_SERVICES: readonly ServiceSummary[] = [
  { slug: 'barangay-clearance', nameFil: 'Barangay Clearance', nameEn: 'Barangay Clearance', fee: '₱50', processingTime: '1 araw' },
  { slug: 'sertipiko-ng-indigency', nameFil: 'Sertipiko ng Indigency', nameEn: 'Certificate of Indigency', fee: 'Libre', processingTime: '1 araw' },
  { slug: 'sertipiko-ng-paninirahan', nameFil: 'Sertipiko ng Paninirahan', nameEn: 'Certificate of Residency', fee: '₱30', processingTime: '1 araw' },
  { slug: 'business-clearance', nameFil: 'Business Clearance', nameEn: 'Business Clearance', fee: '₱200', processingTime: '3 araw' },
  { slug: 'barangay-id', nameFil: 'Barangay ID', nameEn: 'Barangay ID', fee: '₱100', processingTime: '3 araw' },
  { slug: 'blotter-katarungang-pambarangay', nameFil: 'Blotter at Katarungang Pambarangay', nameEn: 'Blotter and Katarungang Pambarangay', fee: 'Libre', processingTime: 'Depende sa kaso' },
]

/** Requirement lists per document — plausible, and all marked as samples. */
const REQUIREMENTS: Record<string, readonly string[]> = {
  'barangay-clearance': [
    'Barangay ID o ibang valid ID',
    'Cedula (community tax certificate)',
    'Resibo ng bayad',
    '1 piraso ng 1×1 na litrato',
  ],
  'sertipiko-ng-indigency': [
    'Barangay ID o valid ID',
    'Patunay ng paninirahan sa Tumbod',
    'Dahilan ng paghingi (halimbawa: tulong medikal)',
  ],
  'sertipiko-ng-paninirahan': ['Valid ID', 'Cedula', 'Resibo ng bayad'],
  'business-clearance': [
    'DTI registration',
    'Valid ID ng may-ari',
    'Sketch ng lokasyon ng negosyo',
    'Resibo ng bayad',
  ],
  'barangay-id': ['Birth certificate o valid ID', '2 piraso ng 1×1 na litrato', 'Resibo ng bayad'],
  'blotter-katarungang-pambarangay': [
    'Valid ID',
    'Salaysay ng nangyari',
    'Pangalan ng ibang partido kung alam',
  ],
}

const OFFICER: Record<string, string> = {
  'barangay-clearance': `Kgg. Maria Santos, Barangay Secretary ${SAMPLE}`,
  'sertipiko-ng-indigency': `Kgg. Maria Santos, Barangay Secretary ${SAMPLE}`,
  'sertipiko-ng-paninirahan': `Kgg. Maria Santos, Barangay Secretary ${SAMPLE}`,
  'business-clearance': `Kgg. Pedro Reyes, Barangay Treasurer ${SAMPLE}`,
  'barangay-id': `Kgg. Maria Santos, Barangay Secretary ${SAMPLE}`,
  'blotter-katarungang-pambarangay': `Kgg. Juan Dela Cruz, Punong Barangay ${SAMPLE}`,
}

export function demoService(base: ServiceDetail): ServiceDetail {
  const summary = DEMO_SERVICES.find((s) => s.slug === base.slug)
  const reqs = REQUIREMENTS[base.slug] ?? []
  return {
    ...base,
    fee: summary?.fee ?? base.fee,
    processingTime: summary?.processingTime ?? base.processingTime,
    responsibleOfficial: OFFICER[base.slug] ?? base.responsibleOfficial,
    legalBasis: `Ordinansa Blg. 2024-08 ${SAMPLE}`,
    requirements: reqs.map((label, i) => ({
      id: `r${i}`,
      labelFil: label,
      labelEn: label,
    })),
  }
}

/** Officials roster — every name is a Philippine "John Doe" plus a marker. */
export interface DemoOfficial {
  readonly name: string
  readonly position: string
  readonly committee?: string
  readonly term: string
}

export const DEMO_OFFICIALS: Record<string, readonly DemoOfficial[]> = {
  sangguniang_barangay: [
    { name: `Kgg. Juan Dela Cruz ${SAMPLE}`, position: 'Punong Barangay', term: '2023–2026' },
    { name: `Kgg. Ana Ramos ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Kalusugan', term: '2023–2026' },
    { name: `Kgg. Ben Lopez ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Pangisdaan', term: '2023–2026' },
    { name: `Kgg. Carmen Dizon ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Edukasyon', term: '2023–2026' },
    { name: `Kgg. Ding Morales ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Imprastraktura', term: '2023–2026' },
    { name: `Kgg. Elena Bautista ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Kababaihan', term: '2023–2026' },
    { name: `Kgg. Fidel Aquino ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Kapayapaan', term: '2023–2026' },
    { name: `Kgg. Gloria Cruz ${SAMPLE}`, position: 'Barangay Kagawad', committee: 'Komite sa Badyet', term: '2023–2026' },
  ],
  sangguniang_kabataan: [
    { name: `Kgg. Jomar Villanueva ${SAMPLE}`, position: 'SK Chairperson', term: '2023–2026' },
    { name: `Kgg. Liza Torres ${SAMPLE}`, position: 'SK Kagawad', term: '2023–2026' },
  ],
  itinalaga: [
    { name: `Kgg. Maria Santos ${SAMPLE}`, position: 'Barangay Secretary', term: 'Itinalaga' },
    { name: `Kgg. Pedro Reyes ${SAMPLE}`, position: 'Barangay Treasurer', term: 'Itinalaga' },
  ],
}

export const DEMO_CHECKLIST: readonly ChecklistItem[] = TYPHOON_CHECKLIST

export interface DemoProject {
  readonly title: string
  readonly status: string
  readonly percent: number
  readonly budget: string
  readonly fund: string
}

export const DEMO_PROJECTS: readonly DemoProject[] = [
  { title: `Solar streetlights, Purok 2 ${SAMPLE}`, status: 'Ginagawa', percent: 60, budget: '₱350,000', fund: 'SB Fund 2026' },
  { title: `Pagkumpuni ng pantalan ${SAMPLE}`, status: 'Tapos na', percent: 100, budget: '₱820,000', fund: 'MLGU Taytay' },
]

/**
 * `month`/`day` are split out for the mega menu's date badge, which stacks
 * them. They are the same date as `date`, not a second one — deriving the
 * badge by slicing the display string breaks the moment a month abbreviates
 * differently in the two languages.
 */
export interface DemoEvent {
  readonly date: string
  readonly title: string
  readonly month: string
  readonly day: string
  readonly location: string
  readonly time: string
}

export const DEMO_CALENDAR: readonly DemoEvent[] = [
  {
    date: '12 Set',
    month: 'SET',
    day: '12',
    title: `Medical mission ${SAMPLE}`,
    location: 'Barangay Health Station',
    time: '8:00 AM – 12:00 NN',
  },
  {
    date: '15 Set',
    month: 'SET',
    day: '15',
    title: `Barangay assembly ${SAMPLE}`,
    location: 'Barangay Hall',
    time: '2:00 PM – 4:00 PM',
  },
  {
    date: '20 Set',
    month: 'SET',
    day: '20',
    title: `Clean-up ng baybayin ${SAMPLE}`,
    location: 'Pantalan',
    time: '6:00 AM – 9:00 AM',
  },
  {
    date: '28 Set',
    month: 'SET',
    day: '28',
    title: `Libreng bakuna ${SAMPLE}`,
    location: 'Barangay Health Station',
    time: '8:00 AM – 12:00 NN',
  },
]

export const DEMO_HEALTH_OUTREACH = {
  titleFil: `Medical mission ${SAMPLE}`,
  date: 'Biyernes, 12 Setyembre',
  time: '8:00 AM – 12:00 NN',
  location: 'Barangay Health Station',
  provider: 'RHU Taytay',
  bringFil: 'Health card o ECC ng bata',
}
