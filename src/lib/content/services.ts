/**
 * Service detail content.
 *
 * Slugs, names, process steps and the legal-basis structure are safe to author
 * — they are structural. Fees, processing times, requirement lists and the
 * responsible officer are NOT: they are set by ordinance and by the barangay,
 * and inventing them would send a resident on a boat trip with the wrong
 * papers, which is the exact failure this site exists to prevent.
 */

import type { Maybe } from './placeholder'

export interface ServiceRequirement {
  readonly id: string
  readonly labelFil: Maybe<string>
  readonly labelEn: Maybe<string>
  readonly noteFil?: string
}

export interface ServiceStep {
  readonly labelFil: string
  readonly labelEn: string
}

export interface ServiceDetail {
  readonly slug: string
  readonly nameFil: string
  readonly nameEn: string
  readonly descriptionFil: string
  readonly descriptionEn: string
  readonly fee: Maybe<string>
  readonly processingTime: Maybe<string>
  readonly responsibleOfficial: Maybe<string>
  readonly requirements: readonly ServiceRequirement[]
  readonly steps: readonly ServiceStep[]
  readonly legalBasis: Maybe<string>
  /** Reserved: online intake is deferred (decision B5), model kept live. */
  readonly acceptsOnline: boolean
}

const STANDARD_STEPS: readonly ServiceStep[] = [
  { labelFil: 'Pumunta sa barangay hall sa oras ng opisina.', labelEn: 'Go to the barangay hall during office hours.' },
  { labelFil: 'Ipakita ang mga dalang requirements.', labelEn: 'Present the requirements you brought.' },
  { labelFil: 'Magbayad kung may bayad.', labelEn: 'Pay the fee, if there is one.' },
  { labelFil: 'Hintayin at kunin ang dokumento.', labelEn: 'Wait for and collect the document.' },
]

export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  {
    slug: 'barangay-clearance',
    nameFil: 'Barangay Clearance',
    nameEn: 'Barangay Clearance',
    descriptionFil:
      'Katibayan na walang masamang record sa barangay. Madalas hinihingi sa trabaho, negosyo, at iba pang transaksyon.',
    descriptionEn:
      'Proof of good standing in the barangay. Commonly required for employment, business, and other transactions.',
    fee: '₱50.00 (Libre para sa First-Time Jobseekers sa ilalim ng RA 11261)',
    processingTime: '15–30 minuto (Same-day release)',
    responsibleOfficial: 'Julie B. Batiancela (Barangay Secretary) / Kgg. Natividad M. Gabriel (Punong Barangay)',
    requirements: [
      {
        id: 'cedula',
        labelFil: 'Sedula (Community Tax Certificate) para sa kasalukuyang taon',
        labelEn: 'Community Tax Certificate (Cedula) for the current year',
      },
      {
        id: 'valid-id',
        labelFil: 'Katibayan ng pagkakakilanlan (Valid Government ID o Voter ID)',
        labelEn: 'Valid government-issued ID or Voter ID',
      },
      {
        id: 'purok-endorsement',
        labelFil: 'Endorsement o katunayan ng paninirahan mula sa Purok Leader',
        labelEn: 'Purok Leader endorsement or proof of residency',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'Seksyon 152(c) ng RA 7160 (Local Government Code of 1991) at RA 11261',
    acceptsOnline: false,
  },
  {
    slug: 'sertipiko-ng-indigency',
    nameFil: 'Sertipiko ng Indigency',
    nameEn: 'Certificate of Indigency',
    descriptionFil:
      'Katibayan na mahirap ang pamilya. Ginagamit sa tulong medikal, scholarship, at ayuda.',
    descriptionEn:
      'Certification of indigency. Used for medical assistance, scholarships, and aid programmes.',
    fee: 'Libre / Walang bayad (₱0.00)',
    processingTime: '15–30 minuto',
    responsibleOfficial: 'Barangay Secretary at Punong Barangay',
    requirements: [
      {
        id: 'valid-id',
        labelFil: 'Valid ID o Barangay ID ng aplikante',
        labelEn: 'Valid ID or Barangay ID of the applicant',
      },
      {
        id: 'purpose-doc',
        labelFil: 'Katunayan ng dahilan (hal. Hospital billing/prescription, school assessment, o DSWD referral)',
        labelEn: 'Supporting documents (e.g. hospital bill, prescription, school assessment, or DSWD referral)',
      },
      {
        id: 'purok-cert',
        labelFil: 'Patunay ng paninirahan at estado mula sa Purok Leader',
        labelEn: 'Purok endorsement certifying family economic status',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'DILG Memorandum Circular sa Libreng Serbisyo sa Indigents at RA 7160',
    acceptsOnline: false,
  },
  {
    slug: 'sertipiko-ng-paninirahan',
    nameFil: 'Sertipiko ng Paninirahan',
    nameEn: 'Certificate of Residency',
    descriptionFil: 'Katibayan na nakatira ka sa Barangay Tumbod.',
    descriptionEn: 'Proof that you are a resident of Barangay Tumbod.',
    fee: '₱50.00 (Libre sa mga Senior Citizen, PWD, at First-Time Jobseekers)',
    processingTime: '15–30 minuto',
    responsibleOfficial: 'Julie B. Batiancela (Barangay Secretary)',
    requirements: [
      {
        id: 'residence-proof',
        labelFil: 'Katunayan ng paninirahan sa Tumbod ng hindi bababa sa 6 na buwan',
        labelEn: 'Proof of residency in Barangay Tumbod for at least 6 months',
      },
      {
        id: 'valid-id',
        labelFil: 'Valid ID o Sedula',
        labelEn: 'Valid government ID or Cedula',
      },
      {
        id: 'purok-sign',
        labelFil: 'Pagpapatotoo mula sa Purok Leader',
        labelEn: 'Purok Leader verification',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'Local Government Code of 1991 (RA 7160)',
    acceptsOnline: false,
  },
  {
    slug: 'business-clearance',
    nameFil: 'Business Clearance',
    nameEn: 'Business Clearance',
    descriptionFil: 'Kailangan bago magbukas o mag-renew ng negosyo sa barangay.',
    descriptionEn: 'Required before opening or renewing a business in the barangay.',
    fee: '₱150.00 – ₱300.00 (Batay sa uri ng negosyo / sari-sari store, fish trading, bangka rental)',
    processingTime: '1 araw ng pagproseso',
    responsibleOfficial: 'Cecilia T. Ebajo (Barangay Treasurer) at Punong Barangay',
    requirements: [
      {
        id: 'dti-sec',
        labelFil: 'DTI Business Name Registration o SEC Registration (kung nararapat)',
        labelEn: 'DTI Business Name Certificate or SEC Registration (if applicable)',
      },
      {
        id: 'cedula',
        labelFil: 'Sedula (Community Tax Certificate) ng may-ari ng negosyo',
        labelEn: 'Community Tax Certificate (Cedula) of business owner',
      },
      {
        id: 'prior-permit',
        labelFil: 'Dating Barangay Business Clearance (kung para sa renewal) o Barangay Inspection Report',
        labelEn: 'Previous Barangay Clearance (for renewal) or Barangay Inspection Clearance',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'Seksyon 152(a) ng RA 7160 at Municipal/Barangay Revenue Ordinance',
    acceptsOnline: false,
  },
  {
    slug: 'barangay-id',
    nameFil: 'Barangay ID',
    nameEn: 'Barangay ID',
    descriptionFil: 'Opisyal na ID na ipinapalabas ng barangay.',
    descriptionEn: 'Official identification card issued by the barangay.',
    fee: '₱50.00 (Laminating at kard)',
    processingTime: '15–30 minuto',
    responsibleOfficial: 'Julie B. Batiancela (Barangay Secretary)',
    requirements: [
      {
        id: 'photos',
        labelFil: 'Dalawang (2) pirasong 1x1 o 2x2 ID picture',
        labelEn: 'Two (2) recent 1x1 or 2x2 ID pictures',
      },
      {
        id: 'proof-residency',
        labelFil: 'Katibayan ng paninirahan sa Barangay Tumbod',
        labelEn: 'Proof of residency in Barangay Tumbod',
      },
      {
        id: 'application-form',
        labelFil: 'Pinasagutang Barangay ID Application Form',
        labelEn: 'Completed Barangay ID application form',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'Barangay Council Resolution sa Unified Local Identification System',
    acceptsOnline: false,
  },
  {
    slug: 'blotter-katarungang-pambarangay',
    nameFil: 'Blotter at Katarungang Pambarangay',
    nameEn: 'Blotter and Katarungang Pambarangay',
    descriptionFil:
      'Pagtatala ng reklamo at pag-aayos ng alitan sa antas ng barangay bago dalhin sa korte.',
    descriptionEn:
      'Recording of complaints and settlement of disputes at barangay level before going to court.',
    fee: 'Libre / Walang bayad (₱0.00 para sa blotter entry; minimal mediation fee ayon sa batas)',
    processingTime: 'Agarang pagtala ng blotter; 3–5 araw para sa pagpupulong ng Lupon Tagapagkasundo',
    responsibleOfficial: 'Lupong Tagapamayapa / Barangay Tanod Officer on Duty',
    requirements: [
      {
        id: 'complainant-presence',
        labelFil: 'Personal na pagharap ng nagrereklamo o biktima',
        labelEn: 'Personal appearance of the complainant or victim',
      },
      {
        id: 'valid-id',
        labelFil: 'Valid ID ng nagrereklamo',
        labelEn: 'Valid government ID of the complainant',
      },
      {
        id: 'incident-details',
        labelFil: 'Detalyadong salaysay ng pangyayari, pangalan at tirahan ng inirereklamo, at mga saksi',
        labelEn: 'Narrative statement of incident, full name/address of respondent, and witness details',
      },
    ],
    steps: STANDARD_STEPS,
    legalBasis: 'Katarungang Pambarangay Law (Seksyon 399–422 ng Republic Act No. 7160)',
    acceptsOnline: false,
  },
]

export function getService(slug: string): ServiceDetail | undefined {
  return SERVICE_DETAILS.find((s) => s.slug === slug)
}
