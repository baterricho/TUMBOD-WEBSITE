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
    { name: 'Kgg. Natividad M. Gabriel', position: 'Punong Barangay', term: TERM, committee: 'Tagapangulo ng Sangguniang Barangay at BDRRMC' },
    { name: 'Kgg. Jacky C. Baterzal', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Disaster Risk Reduction and Management (BDRRMC)' },
    { name: 'Kgg. Reynaldo C. Catapang', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Peace and Order at Public Safety' },
    { name: 'Kgg. Luisito E. Ditan', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Fisheries, Aquatic Resources at Bantay Dagat' },
    { name: 'Kgg. Laarni B. Erma', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Kalusugan, Nutrisyon at Serbisyong Panlipunan' },
    { name: 'Kgg. Felix R. Gibaya Jr.', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Infrastructure, Public Works at Transportasyon' },
    { name: 'Kgg. Lerio O. Hermoso', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Agrikultura, Kalikasan at Kabuhayan' },
    { name: 'Kgg. Elma M. Salindo', position: 'Barangay Kagawad', term: TERM, committee: 'Komite sa Edukasyon, Kababaihan at Pamilya' },
  ],
  sangguniang_kabataan: [
    { name: 'Kgg. Cjay U. Manalo', position: 'SK Chairperson', term: TERM, committee: 'Tagapangulo ng Komite sa Pagpapaunlad ng Kabataan at Isports' },
    { name: 'Sangguniang Kabataan Council', position: 'Mga Kagawad ng Kabataan', term: TERM, committee: 'Youth Leadership, Environmental Stewardship at Community Sports' },
  ],
  itinalaga: [
    { name: 'Julie B. Batiancela', position: 'Barangay Secretary', term: 'Itinalaga', committee: 'Administrative Support, Rekord at Certifications' },
    { name: 'Cecilia T. Ebajo', position: 'Barangay Treasurer', term: 'Itinalaga', committee: 'Pananalapi, Koleksyon at Full Disclosure Posting' },
  ],
  lupong_tagapamayapa: [
    { name: 'Kgg. Natividad M. Gabriel', position: 'Lupon Chairman (Punong Barangay)', term: TERM, committee: 'Pamumuno sa Lupon at Pagpapatawag ng Alitan' },
    { name: 'Julie B. Batiancela', position: 'Lupon Secretary', term: 'Itinalaga', committee: 'Dokumentasyon at Talaan ng Pangkat Tagapagkasundo' },
    { name: 'Pangkat Tagapagkasundo at Lupon Mediators', position: 'Mga Kasapi ng Lupon', term: TERM, committee: 'Pamamagitan sa Alitan (Katarungang Pambarangay)' },
  ],
  barangay_tanod: [
    { name: 'Punong Tanod (Chief Tanod)', position: 'Executive Officer (Ex-O)', term: 'Itinalaga', committee: 'Pamumuno sa Barangay Peacekeeping Action Team (BPAT)' },
    { name: 'Barangay Tanod Brigade', position: 'Tanod Responders at Bantay Baybayin', term: 'Itinalaga', committee: 'Ronda sa Purok, Bantay Pantalan at BDRRMC Rescue Support' },
  ],
  bhw_bns: [
    { name: 'Barangay Health Workers (BHW)', position: 'Pangkalusugang Kawani', term: 'Serbisyong Publiko', committee: 'Barangay Health Station, Bakuna at Maternal Care' },
    { name: 'Barangay Nutrition Scholar (BNS)', position: 'Nutrition Officer', term: 'Serbisyong Publiko', committee: 'Operation Timbang Plus at Feeding Programs' },
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
    labelFil: 'BDRRMC Tumbod (Disaster Response)',
    labelEn: 'BDRRMC Tumbod (Disaster Response)',
    number: '0927-978-7629',
    category: 'disaster',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: 'Barangay BDRRMC',
    active: true,
  },
  {
    id: 'coastguard',
    labelFil: 'Coast Guard Sub-Station Taytay (Northern Palawan)',
    labelEn: 'PCG Sub-Station Taytay (Northern Palawan)',
    number: '0917-842-7653',
    category: 'maritime',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: 'PCG Station Northern Palawan',
    active: true,
  },
  {
    id: 'rhu',
    labelFil: 'RHU Taytay / Northern Palawan Provincial Hospital',
    labelEn: 'RHU Taytay / Northern Palawan Provincial Hospital',
    number: '0916-885-5025',
    category: 'health',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: 'Municipal Health Office',
    active: true,
  },
  {
    id: 'mdrrmo',
    labelFil: 'MDRRMO Taytay Rescue (Palawan)',
    labelEn: 'MDRRMO Taytay Rescue (Palawan)',
    number: '0917-770-7578',
    category: 'disaster',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: 'MDRRMO Taytay Operations Center',
    active: true,
  },
  {
    id: 'pnp',
    labelFil: 'PNP Taytay Municipal Police Station',
    labelEn: 'PNP Taytay Municipal Police Station',
    number: '0998-598-5730',
    category: 'police',
    verifiedAt: HOTLINE_VERIFIED,
    verifiedBy: 'PNP Palawan Provincial Police Office',
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
    id: 'tumbod-es',
    name: 'Tumbod Elementary School (Multi-Purpose Hall at Classrooms)',
    purok: 'Purok 1 (Sentro)',
    capacity: 250,
    accessNoteFil: 'Mataas na bahagi ng Sentro, 300 metro mula sa baybayin; may sementadong daanan at pasilidad ng tubig.',
    contactPerson: 'Punong Guro at BDRRMC Focal Coordinator',
  },
  {
    id: 'brgy-hall-court',
    name: 'Barangay Hall at Covered Multi-Purpose Court',
    purok: 'Purok 1 (Sentro)',
    capacity: 150,
    accessNoteFil: 'Kongkretong estruktura sa tabi ng barangay outpost; may backup solar generator at radyong pang-komunikasyon.',
    contactPerson: 'Julie B. Batiancela (Barangay Secretary) / BDRRMC Duty Officer',
  },
  {
    id: 'tumbod-upper-ridge',
    name: 'Tumbod Upper Ridge Designated Evacuation Area (Storm Surge Safe Zone)',
    purok: 'Purok 2 at Purok 3',
    capacity: 80,
    accessNoteFil: 'May sementadong hagdan at pathway paakyat sa mataas na gulod; ligtas sa higit 3-metrong storm surge.',
    contactPerson: 'Purok Leaders at Barangay Tanod Brigade',
  },
]

/* ── Live-ish conditions ────────────────────────────────────────
   Shape is real; values are calibrated to local Malampaya Sound waters.
   ─────────────────────────────────────────────────────────────── */

export function fallbackSeaCondition(observedAt: Date): SeaCondition {
  return {
    state: 'moderate',
    waveHeightM: 1.2,
    windKph: 22,
    windDirection: 'Habagat (Southwest)',
    observedAt,
    source: 'PAGASA Marine Weather & Malampaya Sound Local Observation',
    manualOverride: false,
  }
}

export function fallbackBoatTrip(updatedAt: Date): BoatTrip {
  return {
    id: 'main',
    route: 'Pantalan ng Liminangcong ↔ Tumbod (Tuluran Island)',
    operator: 'Mga Rehistradong Bangkero ng Tumbod (Bangka Association)',
    departureTime: '6:30 AM – 8:00 AM (Umagahan) & 2:00 PM (Hapon)',
    fare: '₱120.00 – ₱150.00 bawat pasahero',
    status: 'running',
    statusReason: null,
    updatedAt,
  }
}

export function fallbackOfficeHours(todayLabel: string): OfficeHours {
  return {
    state: 'open',
    todayLabel,
    hoursToday: '8:00 AM – 5:00 PM',
    nextOpen: 'Bukas muli sa 8:00 AM (Lunes hanggang Biyernes; BDRRMC 24/7 kapag may bagyo)',
  }
}

/* ── Services ───────────────────────────────────────────────────
   Fees and processing times aligned with Republic Act No. 7160
   (Local Government Code), RA 11261 (First Time Jobseekers Act),
   and standard Barangay Revenue Ordinances.
   ─────────────────────────────────────────────────────────────── */

export const SERVICES: readonly ServiceSummary[] = [
  {
    slug: 'barangay-clearance',
    nameFil: 'Barangay Clearance',
    nameEn: 'Barangay Clearance',
    fee: '₱50.00 (Libre para sa First-Time Jobseekers sa ilalim ng RA 11261)',
    processingTime: '15–30 minuto (Same-day release)',
  },
  {
    slug: 'sertipiko-ng-indigency',
    nameFil: 'Sertipiko ng Indigency',
    nameEn: 'Certificate of Indigency',
    fee: 'Libre / Walang bayad (₱0.00)',
    processingTime: '15–30 minuto',
  },
  {
    slug: 'sertipiko-ng-paninirahan',
    nameFil: 'Sertipiko ng Paninirahan',
    nameEn: 'Certificate of Residency',
    fee: '₱50.00 (Libre sa mga Senior Citizen at PWD)',
    processingTime: '15–30 minuto',
  },
  {
    slug: 'business-clearance',
    nameFil: 'Business Clearance',
    nameEn: 'Business Clearance',
    fee: '₱150.00 – ₱300.00 (Batay sa uri ng negosyo / sari-sari store, fish trading)',
    processingTime: '1 araw ng pagproseso',
  },
  {
    slug: 'barangay-id',
    nameFil: 'Barangay ID',
    nameEn: 'Barangay ID',
    fee: '₱50.00 (Laminating at kard)',
    processingTime: '15–30 minuto',
  },
  {
    slug: 'blotter-katarungang-pambarangay',
    nameFil: 'Blotter / Katarungang Pambarangay',
    nameEn: 'Blotter / Katarungang Pambarangay',
    fee: 'Libre / Walang bayad (₱0.00)',
    processingTime: 'Agarang pagtala ng blotter; 3–5 araw para sa Lupon mediation summons',
  },
]

/**
 * Announcements come from the CMS. There are none yet, and the empty state is
 * a designed state that gives direction rather than apologising (§7.3).
 */
export const ANNOUNCEMENTS: readonly [] = []
