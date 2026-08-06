/**
 * Service detail content.
 *
 * Slugs, names, process steps and the legal-basis structure are safe to author
 * — they are structural. Fees, processing times, requirement lists and the
 * responsible officer are NOT: they are set by ordinance and by the barangay,
 * and inventing them would send a resident on a boat trip with the wrong
 * papers, which is the exact failure this site exists to prevent.
 */

import { needsData, type Maybe } from './placeholder'

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

/** Requirements are unknown per document; the count itself is unknown. */
function unknownRequirements(document: string): readonly ServiceRequirement[] {
  return [
    {
      id: 'all',
      labelFil: needsData(
        `kumpletong listahan ng requirements para sa ${document}`,
        'Barangay Secretary',
        true,
      ),
      labelEn: needsData(
        `full requirement list for ${document}`,
        'Barangay Secretary',
        true,
      ),
    },
  ]
}

const STANDARD_STEPS: readonly ServiceStep[] = [
  { labelFil: 'Pumunta sa barangay hall sa oras ng opisina.', labelEn: 'Go to the barangay hall during office hours.' },
  { labelFil: 'Ipakita ang mga dalang requirements.', labelEn: 'Present the requirements you brought.' },
  { labelFil: 'Magbayad kung may bayad.', labelEn: 'Pay the fee, if there is one.' },
  { labelFil: 'Hintayin at kunin ang dokumento.', labelEn: 'Wait for and collect the document.' },
]

function baseService(
  slug: string,
  nameFil: string,
  nameEn: string,
  descriptionFil: string,
  descriptionEn: string,
): ServiceDetail {
  return {
    slug,
    nameFil,
    nameEn,
    descriptionFil,
    descriptionEn,
    fee: needsData(`bayad para sa ${nameFil}`, 'Barangay Treasurer', true),
    processingTime: needsData(`gaano katagal bago makuha ang ${nameFil}`, 'Barangay Secretary', true),
    responsibleOfficial: needsData('sino ang lalapitan', 'Barangay Secretary', true),
    requirements: unknownRequirements(nameFil),
    steps: STANDARD_STEPS,
    legalBasis: needsData(`ordinansang nagtatakda ng bayad sa ${nameFil}`, 'Barangay records'),
    acceptsOnline: false,
  }
}

export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  baseService(
    'barangay-clearance',
    'Barangay Clearance',
    'Barangay Clearance',
    'Katibayan na walang masamang record sa barangay. Madalas hinihingi sa trabaho, negosyo, at iba pang transaksyon.',
    'Proof of good standing in the barangay. Commonly required for employment, business, and other transactions.',
  ),
  baseService(
    'sertipiko-ng-indigency',
    'Sertipiko ng Indigency',
    'Certificate of Indigency',
    'Katibayan na mahirap ang pamilya. Ginagamit sa tulong medikal, scholarship, at ayuda.',
    'Certification of indigency. Used for medical assistance, scholarships, and aid programmes.',
  ),
  baseService(
    'sertipiko-ng-paninirahan',
    'Sertipiko ng Paninirahan',
    'Certificate of Residency',
    'Katibayan na nakatira ka sa Barangay Tumbod.',
    'Proof that you are a resident of Barangay Tumbod.',
  ),
  baseService(
    'business-clearance',
    'Business Clearance',
    'Business Clearance',
    'Kailangan bago magbukas o mag-renew ng negosyo sa barangay.',
    'Required before opening or renewing a business in the barangay.',
  ),
  baseService(
    'barangay-id',
    'Barangay ID',
    'Barangay ID',
    'Opisyal na ID na ipinapalabas ng barangay.',
    'Official identification card issued by the barangay.',
  ),
  baseService(
    'blotter-katarungang-pambarangay',
    'Blotter at Katarungang Pambarangay',
    'Blotter and Katarungang Pambarangay',
    'Pagtatala ng reklamo at pag-aayos ng alitan sa antas ng barangay bago dalhin sa korte.',
    'Recording of complaints and settlement of disputes at barangay level before going to court.',
  ),
]

export function getService(slug: string): ServiceDetail | undefined {
  return SERVICE_DETAILS.find((s) => s.slug === slug)
}
