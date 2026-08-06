/**
 * Demo content for the sections added by the redesign (DECISION-redesign.md).
 *
 * WHY THIS IS A SEPARATE FILE FROM `demo.ts`
 *
 * `demo.ts` carries demo versions of things that have a REAL counterpart —
 * hotlines, officials, services. Everything here is a section that has no real
 * counterpart at all yet: no history has been recorded, no tourism copy
 * written, no FAQ collected. Keeping them apart means `CONTENT-TODO.md` can
 * distinguish "we have this, it is just not verified" from "this has never
 * existed", which are different asks of the barangay.
 *
 * EVERY STRING HERE IS FICTION. It exists so the design can be reviewed with
 * realistic volume and shape, which the precedent scan showed is the only way
 * to judge whether a civic site reads as alive (PRECEDENT-SCAN.md §3).
 *
 * Guardrails, unchanged from `demo.ts`:
 *   - only reachable when PUBLIC_DEMO_MODE=true
 *   - `check-demo.mjs` fails any production build containing it
 *   - the undismissable banner names it as sample data on every page
 *   - people are named Philippine-John-Doe style and suffixed "(halimbawa)"
 *
 * The ONLY non-fiction below is `REAL_STATS`, which is PSA census data already
 * verified in RESEARCH.md. It is here because a stat row of invented counts is
 * precisely the failure we observed on brgy.to (PRECEDENT-SCAN.md §5).
 */

const SAMPLE = '(halimbawa)'

/* ── Verified statistics — NOT demo ─────────────────────────────
   These render in demo and production alike. Source: PSA via PhilAtlas,
   re-verified 2026-08-05 (FINDINGS-2026-08-05.md §3).

   Deliberately absent: land area (unknown) and elevation (PhilAtlas lists
   332.6 m, implausible for a barrier island whose neighbours sit at 6.1 m and
   8.2 m — withheld, see RESEARCH.md).
   ─────────────────────────────────────────────────────────────── */

export interface Stat {
  readonly value: string
  readonly labelFil: string
  readonly labelEn: string
  readonly noteFil: string
  readonly noteEn: string
}

export const REAL_STATS: readonly Stat[] = [
  {
    value: '1,744',
    labelFil: 'Populasyon',
    labelEn: 'Population',
    noteFil: 'Senso ng PSA, 2020',
    noteEn: 'PSA Census, 2020',
  },
  {
    value: '273',
    labelFil: 'Kabahayan',
    labelEn: 'Households',
    noteFil: 'Senso ng PSA, 2015',
    noteEn: 'PSA Census, 2015',
  },
  {
    value: '2.09%',
    labelFil: 'Bahagi ng Taytay',
    labelEn: 'Share of Taytay',
    noteFil: 'Sa kabuuang populasyon, 2020',
    noteEn: 'Of total municipal population, 2020',
  },
  {
    value: '5312',
    labelFil: 'Postal code',
    labelEn: 'Postal code',
    noteFil: 'PHLPost',
    noteEn: 'PHLPost',
  },
]

/* ── History ────────────────────────────────────────────────────
   FICTION. The real founding year and its basis are unknown and are an open
   item (CONTENT-TODO.md, "taon ng pagkakatatag").
   ─────────────────────────────────────────────────────────────── */

export interface TimelineEntry {
  readonly year: string
  readonly titleFil: string
  readonly titleEn: string
  readonly bodyFil: string
  readonly bodyEn: string
}

export const DEMO_HISTORY: readonly TimelineEntry[] = [
  {
    year: '1948',
    titleFil: `Unang panirahan ${SAMPLE}`,
    titleEn: `First settlement ${SAMPLE}`,
    bodyFil:
      'Nanirahan ang mga unang pamilyang mangingisda sa hilagang baybayin ng Pulo ng Tuluran, malapit sa mababaw na bahagi ng Endeavor Strait.',
    bodyEn:
      'The first fishing families settled on the northern shore of Tuluran Island, near the shallows of Endeavor Strait.',
  },
  {
    year: '1957',
    titleFil: `Naitatag bilang barangay ${SAMPLE}`,
    titleEn: `Established as a barangay ${SAMPLE}`,
    bodyFil: 'Kinilala ang Tumbod bilang hiwalay na barangay ng Bayan ng Taytay.',
    bodyEn: 'Tumbod was recognised as a separate barangay of the Municipality of Taytay.',
  },
  {
    year: '1974',
    titleFil: `Naitayo ang unang paaralan ${SAMPLE}`,
    titleEn: `First school built ${SAMPLE}`,
    bodyFil: 'Nagbukas ang Tumbod Elementary School na may dalawang silid-aralan.',
    bodyEn: 'Tumbod Elementary School opened with two classrooms.',
  },
  {
    year: '1998',
    titleFil: `Naitayo ang barangay hall ${SAMPLE}`,
    titleEn: `Barangay hall built ${SAMPLE}`,
    bodyFil: 'Napalitan ng kongkretong gusali ang dating kubo na pinagpupulungan.',
    bodyEn: 'A concrete building replaced the nipa structure used for meetings.',
  },
  {
    year: '2019',
    titleFil: `Kuryente sa buong barangay ${SAMPLE}`,
    titleEn: `Barangay-wide electricity ${SAMPLE}`,
    bodyFil: 'Naabot ng linya ng kuryente ang lahat ng purok.',
    bodyEn: 'Power lines reached every purok.',
  },
  {
    year: '2025',
    titleFil: `Bagyo at storm surge ${SAMPLE}`,
    titleEn: `Typhoon and storm surge ${SAMPLE}`,
    bodyFil:
      'Tumama ang bagyo sa munisipalidad noong Nobyembre. Ito ang nagtulak sa pagbuo ng mas malinaw na plano sa paglikas.',
    bodyEn:
      'A typhoon struck the municipality in November. It prompted a clearer evacuation plan.',
  },
]

/* ── Vision and mission — FICTION ───────────────────────────── */

export const DEMO_VISION = {
  visionFil: `Isang barangay na ligtas sa bagyo, may malinis na tubig, at may kabuhayang hindi umaasa sa iisang huli. ${SAMPLE}`,
  visionEn: `A barangay safe from storms, with clean water, and a livelihood that does not depend on a single catch. ${SAMPLE}`,
  missionFil: `Maglingkod nang bukas ang talaan, tapat sa bawat piso, at abot ng bawat purok — kahit walang signal. ${SAMPLE}`,
  missionEn: `To serve with open records, honest with every peso, and within reach of every purok — even with no signal. ${SAMPLE}`,
  valuesFil: [
    `Malinaw na paggamit ng pondo ${SAMPLE}`,
    `Handa sa sakuna ${SAMPLE}`,
    `Pangangalaga sa dagat at bakawan ${SAMPLE}`,
    `Serbisyong walang palakasan ${SAMPLE}`,
  ],
  valuesEn: [
    `Clear use of public funds ${SAMPLE}`,
    `Disaster readiness ${SAMPLE}`,
    `Care for the sea and mangroves ${SAMPLE}`,
    `Service without favouritism ${SAMPLE}`,
  ],
}

/* ── Tourism — FICTION ──────────────────────────────────────────
   Note the deliberate absence of "book here" or pricing: a barangay site
   pointing at commercial operators it has not vetted creates an endorsement
   it cannot stand behind.
   ─────────────────────────────────────────────────────────────── */

export interface Attraction {
  readonly nameFil: string
  readonly nameEn: string
  readonly bodyFil: string
  readonly bodyEn: string
  readonly gettingThereFil: string
  readonly gettingThereEn: string
}

export const DEMO_ATTRACTIONS: readonly Attraction[] = [
  {
    nameFil: `Baybayin ng Hilagang Tumbod ${SAMPLE}`,
    nameEn: `North Tumbod Beach ${SAMPLE}`,
    bodyFil: 'Mahabang buhanginan na nakaharap sa Malampaya Sound. Mahinay ang alon tuwing amihan.',
    bodyEn: 'A long sand beach facing Malampaya Sound. Calm water during the amihan season.',
    gettingThereFil: '15 minutong lakad mula sa barangay hall.',
    gettingThereEn: '15-minute walk from the barangay hall.',
  },
  {
    nameFil: `Kabakawanan sa Endeavor Strait ${SAMPLE}`,
    nameEn: `Endeavor Strait Mangroves ${SAMPLE}`,
    bodyFil:
      'Makipot na daanan ng tubig sa gitna ng bakawan. Dito nagtatago ang mga bangka kapag masama ang panahon.',
    bodyEn:
      'Narrow water channels through mangrove. This is where boats shelter in bad weather.',
    gettingThereFil: 'Bangka mula sa pantalan, mga 10 minuto.',
    gettingThereEn: 'By boat from the landing, about 10 minutes.',
  },
  {
    nameFil: `Bahura sa Blockade Strait ${SAMPLE}`,
    nameEn: `Blockade Strait Reef ${SAMPLE}`,
    bodyFil: 'Mababaw na bahura sa kanlurang bahagi. Bawal manghuli sa itinakdang sanctuary.',
    bodyEn: 'A shallow reef on the western side. Fishing is prohibited inside the sanctuary.',
    gettingThereFil: 'Bangka lamang. Kailangang may kasamang taga-roon.',
    gettingThereEn: 'By boat only. A local guide is required.',
  },
]

/* ── Local businesses — FICTION ─────────────────────────────── */

export interface Business {
  readonly name: string
  readonly kindFil: string
  readonly kindEn: string
  readonly purok: string
}

export const DEMO_BUSINESSES: readonly Business[] = [
  { name: `Tindahan ni Aling Remy ${SAMPLE}`, kindFil: 'Sari-sari store', kindEn: 'Sari-sari store', purok: 'Purok 1' },
  { name: `Bangkang Pang-arkila — Mang Tino ${SAMPLE}`, kindFil: 'Arkila ng bangka', kindEn: 'Boat hire', purok: 'Purok 2' },
  { name: `Panaderya sa Sentro ${SAMPLE}`, kindFil: 'Panaderya', kindEn: 'Bakery', purok: 'Purok 1' },
  { name: `Talyer ni Boy ${SAMPLE}`, kindFil: 'Ayos ng makina ng bangka', kindEn: 'Boat engine repair', purok: 'Purok 3' },
  { name: `Homestay ni Ate Nena ${SAMPLE}`, kindFil: 'Homestay', kindEn: 'Homestay', purok: 'Purok 2' },
  { name: `Ice Plant ng Barangay ${SAMPLE}`, kindFil: 'Yelo para sa isda', kindEn: 'Ice for fish', purok: 'Purok 3' },
]

/* ── FAQ — FICTION, but the QUESTIONS are the real ones ─────────
   The questions were drawn from what the service pages already imply people
   need. The ANSWERS are sample values and must be replaced.
   ─────────────────────────────────────────────────────────────── */

export interface Faq {
  readonly qFil: string
  readonly qEn: string
  readonly aFil: string
  readonly aEn: string
}

export const DEMO_FAQ: readonly Faq[] = [
  {
    qFil: 'Anong oras bukas ang barangay hall?',
    qEn: 'What time does the barangay hall open?',
    aFil: `Lunes hanggang Biyernes, 8:00 n.u. – 5:00 n.h. Sarado tuwing Sabado at Linggo. ${SAMPLE}`,
    aEn: `Monday to Friday, 8:00 am – 5:00 pm. Closed Saturday and Sunday. ${SAMPLE}`,
  },
  {
    qFil: 'Magkano ang barangay clearance?',
    qEn: 'How much is a barangay clearance?',
    aFil: `₱50, at karaniwang matatanggap sa loob ng isang araw. ${SAMPLE}`,
    aEn: `₱50, and usually released within one day. ${SAMPLE}`,
  },
  {
    qFil: 'Paano kung kanselado ang biyahe ng bangka?',
    qEn: 'What if the boat trip is cancelled?',
    aFil:
      'Kung utos ito ng Coast Guard, walang bangkang makakaalis — hindi ito desisyon ng bangkero at hindi ito mababali. Tingnan ang pahinang Ligtas.',
    aEn:
      'If it is a Coast Guard order, no boat may sail — it is not the operator’s decision and cannot be overridden. See the Ligtas page.',
  },
  {
    qFil: 'Saan ako lilikas kapag may bagyo?',
    qEn: 'Where do I evacuate during a typhoon?',
    aFil: `Sa Tumbod Elementary School, Purok 1. Dalhin ang listahan sa pahinang Ligtas. ${SAMPLE}`,
    aEn: `To Tumbod Elementary School, Purok 1. Bring the checklist on the Ligtas page. ${SAMPLE}`,
  },
  {
    qFil: 'May internet ba sa barangay hall?',
    qEn: 'Is there internet at the barangay hall?',
    aFil: `Mahina ang signal. Gumagana ang website na ito kahit walang koneksyon kapag nabuksan na ito minsan. ${SAMPLE}`,
    aEn: `The signal is weak. This website works without a connection once it has been opened at least once. ${SAMPLE}`,
  },
  {
    qFil: 'Paano ako makakapagreklamo o makakapagmungkahi?',
    qEn: 'How do I file a complaint or suggestion?',
    aFil:
      'Sa ngayon, personal sa barangay hall o sa pamamagitan ng Barangay Secretary. Walang online form dahil walang makakasagot dito araw-araw.',
    aEn:
      'For now, in person at the barangay hall or through the Barangay Secretary. There is no online form because nobody could answer one daily.',
  },
]

/* ── Downloadable forms — FICTION ───────────────────────────────
   `file: null` throughout: no PDF is offered, because offering a download
   that 404s on a slow connection is worse than saying it is not ready.
   ─────────────────────────────────────────────────────────────── */

export interface FormDoc {
  readonly nameFil: string
  readonly nameEn: string
  readonly noteFil: string
  readonly noteEn: string
  readonly file: string | null
}

export const DEMO_FORMS: readonly FormDoc[] = [
  {
    nameFil: `Aplikasyon para sa Barangay Clearance ${SAMPLE}`,
    nameEn: `Barangay Clearance application ${SAMPLE}`,
    noteFil: 'Makukuha rin sa barangay hall.',
    noteEn: 'Also available at the barangay hall.',
    file: null,
  },
  {
    nameFil: `Kahilingan para sa Sertipiko ng Indigency ${SAMPLE}`,
    nameEn: `Certificate of Indigency request ${SAMPLE}`,
    noteFil: 'Kailangan ng ID ng nag-aapply.',
    noteEn: 'Applicant ID required.',
    file: null,
  },
  {
    nameFil: `Porma ng Blotter ${SAMPLE}`,
    nameEn: `Blotter form ${SAMPLE}`,
    noteFil: 'Isinusulat sa harap ng Lupong Tagapamayapa.',
    noteEn: 'Completed before the Lupong Tagapamayapa.',
    file: null,
  },
  {
    nameFil: `Aplikasyon para sa Business Clearance ${SAMPLE}`,
    nameEn: `Business Clearance application ${SAMPLE}`,
    noteFil: 'Taunang pag-renew tuwing Enero.',
    noteEn: 'Renewed annually each January.',
    file: null,
  },
]
