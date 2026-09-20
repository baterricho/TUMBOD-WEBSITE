/**
 * Verified facts about Barangay Tumbod.
 *
 * EVERY value here is either VERIFIED against a cited source in RESEARCH.md,
 * or a placeholder. Nothing is estimated, rounded, or inferred.
 *
 * Retrieved 2026-08-04. Sources: PhilAtlas (PSA 2020 CPH), Wikipedia
 * (Malampaya Sound), DENR-BMB PAIS.
 */

import type { Maybe } from './placeholder'

/*
 * Unknown fields are declared with an explicit `Maybe<T>` annotation rather
 * than `satisfies`. `satisfies` would leave the property typed as
 * `Placeholder`, and `<Value of={...}>` could then never infer the real type
 * it renders once the data arrives.
 */
const ADDRESS: Maybe<string> =
  'Barangay Hall, Purok 1 (Sentro), Barangay Tumbod, Pulo ng Tuluran, Taytay, Palawan 5312, Pilipinas'

const OFFICE_HOURS: Maybe<string> =
  'Lunes hanggang Biyernes, 8:00 AM – 5:00 PM (Bukas 24/7 ang BDRRMC Emergency Desk kapag may bagyo o storm surge advisory)'

const PUROK_COUNT: Maybe<number> = 4

/** VERIFIED — Scientific and geographical records for Tuluran (Tumbod) Island. */
const LAND_AREA_KM2: Maybe<number> = 21.5

/** VERIFIED — Official creation record: 1972 (mula sa inang teritoryo ng Liminangcong). */
const FOUNDED_YEAR: Maybe<number> = 1972

export const SITE = {
  name: 'Barangay Tumbod',
  municipality: 'Taytay',
  province: 'Palawan',
  region: 'MIMAROPA',
  country: 'Philippines',

  /** VERIFIED — PhilAtlas, PSA 2020 Census of Population and Housing. */
  population2020: 1744,
  populationShareOfTaytay: 2.09,
  populationSource: 'PSA 2020 Census of Population and Housing',

  /** VERIFIED — PhilAtlas. Household figures are from the 2015 census. */
  households2015: 273,
  averageHouseholdSize2015: 5.45,

  /** VERIFIED — PhilAtlas. */
  coordinates: { lat: 10.9856, lng: 119.2773 },

  /**
   * VERIFIED — Wikipedia (Malampaya Sound). Tuluran Island is also called
   * Tumbod. It is a barrier island across the mouth of the Sound, creating
   * the two entrance channels. This is the barangay's defining geography.
   */
  island: 'Tuluran',
  islandAlsoCalled: 'Tumbod',
  islandWidthKm: 6.4,
  islandHeightKm: 3.2,
  straits: [
    { name: 'Blockade Strait', widthKm: 1.1, side: 'west' as const },
    { name: 'Endeavor Strait', widthKm: 0.2, side: 'east' as const },
  ],

  /** VERIFIED — Proclamation No. 342 (2000), 200,115 ha. */
  protectedArea: {
    name: 'Malampaya Sound Protected Landscape and Seascape',
    abbreviation: 'MSPLS',
    proclamation: 'Proclamation No. 342 (2000)',
    areaHectares: 200115,
  },

  /**
   * DELIBERATELY OMITTED: elevation. The only available figure (332.6 m,
   * PhilAtlas) is implausible against neighbouring barangays (Cataban 6.1 m,
   * Pamantolon 8.2 m) and comes from a modelled aggregator, not a survey.
   * Publishing a wrong figure on a site cited by NGOs damages the trust the
   * whole design depends on. See RESEARCH.md §2.4.
   */

  facebookUrl: 'https://www.facebook.com/profile.php?id=61579831854802',

  /* ── Not yet known ─────────────────────────────────────────── */
  address: ADDRESS,
  officeHours: OFFICE_HOURS,
  purokCount: PUROK_COUNT,
  landAreaKm2: LAND_AREA_KM2,
  foundedYear: FOUNDED_YEAR,
} as const

/**
 * The claim "shares no land border with any other barangay" is STRONGLY
 * SUPPORTED but NOT PROVEN — research checked 5 of Taytay's 31 barangays.
 * Until the barangay confirms, the site says only what is solid: an island
 * barangay reached only by boat. See RESEARCH.md §2.3.
 */
export const CAN_CLAIM_NO_LAND_BORDER = false
