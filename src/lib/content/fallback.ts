/**
 * Static content fallbacks.
 *
 * /ligtas renders from this if the CMS is unreachable at build or request
 * time. That page has no single point of failure (ARCHITECTURE.md §6) —
 * research found the parent municipality's own website returning HTTP 503 for
 * at least 24 hours, which is exactly the scenario this guards against
 * (RESEARCH.md §5.3).
 *
 * NOTHING HERE IS INVENTED. Every unknown is a placeholder that fails the
 * production build while it remains.
 */

import { needsData } from './placeholder'
import type {
  BoatTrip,
  ChecklistItem,
  EvacuationSite,
  Hotline,
  OfficeHours,
  Official,
  SeaCondition,
  ServiceSummary,
} from './types'

/* ── Officials ──────────────────────────────────────────────────
   THE FIRST REAL LOCAL DATA ON THIS SITE. Provenance matters, so it is
   recorded here rather than in a commit message:

     Sourced   barangaydirectory.com/barangay/taytay-2/tumbod, 2026-08-05,
               after the Barangay Tumbod Facebook page proved unextractable
               for the second time (FINDINGS-2026-08-05.md §1).
     Conflict  A second source (micto.net, the municipality's own site) gave a
               DIFFERENT Secretary, SK Chairperson and four different Kagawad.
               Five names appear in both. FINDINGS-2026-08-05.md §2 tabulates
               the disagreement in full.
     Resolved  Site owner confirmed this list as the current 2023–2026 council
               on 2026-08-05. That confirmation is the only reason this is here
               and not still a placeholder — the web sources alone were not
               sufficient under §0.2.

   NOT recorded because it is not known — and therefore not written:
     - committee assignments for any Kagawad
     - exact start/end dates of the term
     - photographs, and the consent that would be required to publish them

   EXPIRES. The next Barangay and SK Elections are 2 November 2026 (COMELEC
   Resolution 11191). This roster is wrong the moment results are proclaimed.
   ─────────────────────────────────────────────────────────────── */

/**
 * Elected officials carry `Kgg.` (Kagalang-galang); appointed officers do not.
 * That is Philippine form of address, not a claim about the person.
 */
const TERM = '2023–2026'

export const OFFICIALS: Record<string, readonly Official[]> = {
  sangguniang_barangay: [
    { name: 'Kgg. Natividad M. Gabriel', position: 'Punong Barangay', term: TERM },
    { name: 'Kgg. Jacky C. Baterzal', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Reynaldo C. Catapang', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Luisito E. Ditan', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Laarni B. Erma', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Felix R. Gibaya Jr.', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Lerio O. Hermoso', position: 'Barangay Kagawad', term: TERM },
    { name: 'Kgg. Elma M. Salindo', position: 'Barangay Kagawad', term: TERM },
  ],
  sangguniang_kabataan: [
    { name: 'Kgg. Cjay U. Manalo', position: 'SK Chairperson', term: TERM },
  ],
  itinalaga: [
    { name: 'Julie B. Batiancela', position: 'Barangay Secretary', term: 'Itinalaga' },
    { name: 'Cecilia T. Ebajo', position: 'Barangay Treasurer', term: 'Itinalaga' },
  ],
}

/* ── Hotlines ───────────────────────────────────────────────────
   The most dangerous data on the site. Not one number is guessed.
   BUILD-PROMPT.md §0.2, DISCOVERY-QUESTIONS.md B3.
   ─────────────────────────────────────────────────────────────── */

/**
 * Confirmed working by the site owner on 2026-08-05. Both numbers are
 * attributed to the Barangay Tumbod hall by the Taytay municipal directory
 * (micto.net); the second source listed no numbers at all, so the confirmation
 * — not the citation — is what makes these publishable.
 *
 * RE-VERIFY BEFORE 2026-11-03. Mobile numbers in a barangay hall usually
 * belong to whoever holds the handset, and the 2 November 2026 BSKE changes who
 * that is. A number that rings the outgoing Secretary during a typhoon is the
 * exact failure this field exists to prevent.
 */
const HOTLINE_VERIFIED = new Date('2026-08-05T00:00:00+08:00')
const HOTLINE_VERIFIER = 'Site owner'

export const HOTLINES: readonly Hotline[] = [
  {
    id: 'barangay',
    labelFil: 'Barangay Hotline',
    labelEn: 'Barangay Hotline',
    number: '0927-978-7629',
    category: 'barangay',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: HOTLINE_VERIFIER,
    active: true,
  },
  {
    id: 'barangay-2',
    labelFil: 'Barangay Hotline (pangalawang numero)',
    labelEn: 'Barangay Hotline (second number)',
    number: '0928-284-0826',
    category: 'barangay',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: HOTLINE_VERIFIER,
    active: true,
  },
  {
    id: 'bdrrmc',
    labelFil: 'BDRRMC',
    labelEn: 'BDRRMC',
    number: needsData('numero ng BDRRMC', 'BDRRMC', true),
    category: 'disaster',
    verifiedAt: null,
    active: true,
  },
  {
    id: 'coastguard',
    labelFil: 'Coast Guard — Northern Palawan',
    labelEn: 'Coast Guard — Northern Palawan',
    number: needsData(
      'numero ng Coast Guard Station Northern Palawan',
      'PCG Station Northern Palawan',
      true,
    ),
    category: 'maritime',
    verifiedAt: null,
    active: true,
  },
  {
    id: 'rhu',
    labelFil: 'RHU Taytay',
    labelEn: 'RHU Taytay',
    number: needsData('numero ng RHU Taytay', 'Municipal Health Office', true),
    category: 'health',
    verifiedAt: null,
    active: true,
  },
  {
    id: 'mdrrmo',
    labelFil: 'MDRRMO Taytay',
    labelEn: 'MDRRMO Taytay',
    number: needsData('numero ng MDRRMO Taytay', 'Municipality of Taytay', true),
    category: 'disaster',
    verifiedAt: null,
    active: true,
  },
  {
    id: 'pnp',
    labelFil: 'PNP Taytay',
    labelEn: 'PNP Taytay',
    number: needsData('numero ng PNP Taytay', 'PNP Taytay', true),
    category: 'police',
    verifiedAt: null,
    active: true,
  },
]

/* ── Pre-typhoon checklist ──────────────────────────────────────
   Generic preparedness guidance, safe to write without local data, and
   genuinely useful. Reviewed against the November 2025 landfall at Batas
   Island in this municipality with >3 m storm surge (RESEARCH.md §4).
   ─────────────────────────────────────────────────────────────── */

export const TYPHOON_CHECKLIST: readonly ChecklistItem[] = [
  { id: 'water', labelFil: 'Tubig na maiinom — sapat para sa 3 araw', labelEn: 'Drinking water — enough for 3 days' },
  { id: 'food', labelFil: 'Pagkaing hindi nasisira', labelEn: 'Food that will not spoil' },
  { id: 'light', labelFil: 'Flashlight at ekstrang baterya', labelEn: 'Flashlight and spare batteries' },
  { id: 'radio', labelFil: 'Radyong de-baterya', labelEn: 'Battery-powered radio' },
  { id: 'papers', labelFil: 'Mahahalagang papeles sa plastik na selyado', labelEn: 'Important documents in sealed plastic' },
  { id: 'meds', labelFil: 'Gamot na iniinom ng pamilya', labelEn: "Family's regular medicines" },
  { id: 'load', labelFil: 'May load at bateryang puno ang telepono', labelEn: 'Phone charged and with load' },
  { id: 'evac', labelFil: 'Alam ng bawat isa kung saan lilikas', labelEn: 'Everyone knows where to evacuate' },
  { id: 'boat', labelFil: 'Nakatali at nakaligtas ang bangka', labelEn: 'Boat secured and moved to safety' },
]

export const EVACUATION_SITES: readonly EvacuationSite[] = [
  {
    id: 'placeholder',
    name: needsData('pangalan ng mga lilikasan', 'BDRRMC', true),
    purok: needsData('purok ng lilikasan', 'BDRRMC', true),
    capacity: needsData('kayang tanggapin', 'BDRRMC', true),
    accessNoteFil: needsData('paano marating, lalo na kapag masama ang panahon', 'BDRRMC', true),
    contactPerson: needsData('sino ang may hawak ng susi', 'BDRRMC', true),
  },
]

/* ── Live-ish conditions ────────────────────────────────────────
   Shape is real; values are placeholders until a source is wired up.
   `state` defaults to 'moderate' rather than 'calm' so the UI never implies
   safety it cannot vouch for.
   ─────────────────────────────────────────────────────────────── */

export function fallbackSeaCondition(observedAt: Date): SeaCondition {
  return {
    state: 'moderate',
    waveHeightM: needsData('taas ng alon', 'PAGASA / barangay observation', true),
    windKph: needsData('bilis ng hangin', 'PAGASA', true),
    windDirection: needsData('direksyon ng hangin', 'PAGASA', true),
    observedAt,
    source: 'PAGASA',
    manualOverride: false,
  }
}

export function fallbackBoatTrip(updatedAt: Date): BoatTrip {
  return {
    id: 'main',
    route: needsData('ruta ng bangka mula Tumbod', 'Barangay / bangkero', true),
    operator: needsData('pangalan ng bangkero', 'Barangay', true),
    departureTime: needsData('oras ng alis', 'Barangay / bangkero', true),
    fare: needsData('pamasahe', 'Barangay / bangkero', true),
    status: 'uncertain',
    statusReason: null,
    updatedAt,
  }
}

export function fallbackOfficeHours(todayLabel: string): OfficeHours {
  return {
    state: 'closed',
    todayLabel,
    hoursToday: needsData('oras ng opisina ngayon', 'Barangay Secretary', true),
    nextOpen: needsData('anong oras bubukas', 'Barangay Secretary', true),
  }
}

/* ── Services ───────────────────────────────────────────────────
   Slugs and names are structural and safe. Fees and processing times are
   placeholders — they are set by ordinance and must come from the barangay
   (DISCOVERY-QUESTIONS.md N3).
   ─────────────────────────────────────────────────────────────── */

export const SERVICES: readonly ServiceSummary[] = [
  {
    slug: 'barangay-clearance',
    nameFil: 'Barangay Clearance',
    nameEn: 'Barangay Clearance',
    fee: needsData('bayad sa clearance', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
  {
    slug: 'sertipiko-ng-indigency',
    nameFil: 'Sertipiko ng Indigency',
    nameEn: 'Certificate of Indigency',
    fee: needsData('bayad', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
  {
    slug: 'sertipiko-ng-paninirahan',
    nameFil: 'Sertipiko ng Paninirahan',
    nameEn: 'Certificate of Residency',
    fee: needsData('bayad', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
  {
    slug: 'business-clearance',
    nameFil: 'Business Clearance',
    nameEn: 'Business Clearance',
    fee: needsData('bayad', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
  {
    slug: 'barangay-id',
    nameFil: 'Barangay ID',
    nameEn: 'Barangay ID',
    fee: needsData('bayad', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
  {
    slug: 'blotter-katarungang-pambarangay',
    nameFil: 'Blotter / Katarungang Pambarangay',
    nameEn: 'Blotter / Katarungang Pambarangay',
    fee: needsData('bayad kung mayroon', 'Barangay Treasurer', true),
    processingTime: needsData('gaano katagal', 'Barangay Secretary', true),
  },
]

/**
 * Announcements come from the CMS. There are none yet, and the empty state is
 * a designed state that gives direction rather than apologising (§7.3).
 */
export const ANNOUNCEMENTS: readonly [] = []
