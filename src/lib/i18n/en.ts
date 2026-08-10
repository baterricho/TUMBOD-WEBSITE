/**
 * English dictionary — a TRANSLATION of `fil.ts`, which is canonical.
 *
 * Must mirror the Filipino shape exactly; a missing key is a type error.
 * Serves persona P5 (municipal / NGO / researcher) and P6 (OFW relatives).
 * No partial-language pages are permitted (BUILD-PROMPT.md §6.2).
 */

import type { Dictionary } from './index'

export const dictionaryEn: Dictionary = {
  meta: {
    siteName: 'Barangay Tumbod',
    municipality: 'Taytay, Palawan',
    tagline: 'The official website of Barangay Tumbod',
  },

  nav: {
    skipToContent: 'Skip to content',
    home: 'Today',
    services: 'Services',
    news: 'News',
    safety: 'Safety',
    more: 'More',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    emergency: 'Emergency',
    emergencyLabel: 'Emergency numbers',
    officials: 'Officials',
    transparency: 'Transparency',
    about: 'About the Barangay',
    contact: 'Contact',
    calendar: 'Calendar',
    forms: 'Forms',
    language: 'Language',
    switchToEnglish: 'Filipino',
    theme: 'Dark background',
  },

  home: {
    title: 'Today in Tumbod',
    seaNow: 'Sea today',
    nextTrip: 'Next boat',
    officeStatus: 'Office',
    quickActions: 'Quick actions',
    getClearance: 'Get a Clearance',
    emergencyNumbers: 'Emergency numbers',
    boatTrips: 'Boat trips',
    search: 'Search',
    announcements: 'Announcements',
    allAnnouncements: 'All announcements',
    nextHealth: 'Next medical mission',
    bring: 'Bring',
    emergencyContacts: 'Emergency numbers',
    fullDirectory: 'Full directory',
    commonDocuments: 'Most requested documents',
    calendar: 'Calendar',
    projects: 'Projects',
    forms: 'Downloadable forms',
    fromFacebook: 'From the Facebook page',
    openFacebook: 'Open the Facebook page',
    aboutHeading: 'About Tumbod',
    aboutBody:
      'An island barangay at the mouth of Malampaya Sound. The whole of Tuluran Island is our barangay. There is no road here — every trip is by boat.',
    aboutPopulation: 'There are 1,744 of us, per the PSA 2020 census.',
    readHistory: 'Read our history',
  },

  /*
   * SEA SAFETY ADVISORY. Mirrors fil.ts — see the note there for why the copy
   * lives in the dictionary rather than in an editable database field.
   */
  advisory: {
    heading: 'Sea conditions',
    safeTitle: 'Sea conditions are favourable',
    safeMessage: 'Conditions at sea are currently favourable.',
    safeAction:
      'Boat travel may proceed with normal caution. Keep watching the barangay advisory and the weather.',
    cautionTitle: 'Sea conditions require caution',
    cautionMessage: 'Small boats should take extra care.',
    cautionAction:
      'Check with the barangay before travelling farther from shore. Avoid long trips and deep water.',
    dangerTitle: 'DO NOT HEAD OUT TO SEA',
    dangerMessage: 'Sea conditions are dangerous.',
    dangerAction:
      'Do not sail, do not fish, do not travel far from shore, and do not enter open or deep water.',
    unknownTitle: 'Sea condition information unavailable',
    unknownMessage: 'There is no verified advisory for sea conditions right now.',
    unknownAction:
      'Check with the barangay before heading out to sea. No warning does not mean the sea is safe.',
    updated: 'Last updated',
    source: 'Source',
    staleNote: 'The last reading is out of date, so it cannot be treated as current.',
    noDataNote: 'No advisory has been recorded in the barangay system yet.',
    localNote: 'Barangay note',
  },
  sea: {
    calm: 'CALM',
    moderate: 'MODERATE',
    rough: 'ROUGH',
    dangerous: 'DANGEROUS',
    waveHeight: 'Waves',
    wind: 'Wind',
    readAt: 'Read at',
    source: 'Source',
    label: 'Sea condition',
  },

  boat: {
    running: 'TRIPS RUNNING',
    uncertain: 'UNCERTAIN',
    cancelled: 'CANCELLED',
    departure: 'Departs',
    fare: 'Fare',
    operator: 'Operator',
    route: 'Route',
    reasonSea: 'due to rough seas',
    reasonBan: 'Coast Guard order — sailing prohibited',
    reasonOperator: 'operator decision',
    reasonOther: 'other reason',
  },

  office: {
    open: 'OFFICE OPEN',
    closed: 'OFFICE CLOSED',
    limited: 'LIMITED SERVICE',
    opensTomorrow: 'Opens tomorrow',
    hoursToday: "Today's hours",
  },

  alert: {
    info: 'Notice',
    advisory: 'Advisory',
    warning: 'Warning',
    emergency: 'Emergency',
    issued: 'Issued',
    expires: 'Until',
    dismiss: 'Hide this notice',
    callNow: 'Call now',
  },

  safety: {
    title: 'Safety',
    currentStatus: 'Current status',
    noWarning: 'NO WARNING IN EFFECT',
    normalConditions: 'Conditions are normal.',
    lastAdvisory: 'Last advisory',
    mayBeNewer: 'There may be a newer advisory — call the hotline.',
    callNow: 'Call now',
    whereToEvacuate: 'Where to evacuate',
    evacuationIncomplete:
      'The evacuation site list is not yet complete. Ask the BDRRMC.',
    beforeTyphoon: 'Before a typhoon arrives',
    printChecklist: 'Print this checklist',
    seaTravel: 'Sea travel and waves',
    coastGuardRule:
      'The Coast Guard prohibits vessels of 3 gross tons and below from sailing in Taytay and El Nido during rough seas. Most of our boats fall under this rule.',
    fullPolicy: 'Full policy',
    bdrrmc: 'BDRRMC',
    noSignal: 'When there is no signal',
    capacity: 'Capacity',
    purok: 'Purok',
  },

  services: {
    title: 'Services',
    fee: 'Fee',
    free: 'Free',
    processingTime: 'Processing time',
    officeHours: 'Office hours',
    approach: 'Ask for',
    bringThis: 'Bring these',
    ready: 'ready',
    of: 'of',
    copyList: 'Copy this list',
    copied: 'Copied',
    print: 'Print',
    process: 'How it works',
    legalBasis: 'Legal basis',
    faq: 'Common questions',
    viewRequirements: 'View requirements',
    notAutomated:
      'This is not automated issuance. You still need to go to the barangay hall to collect the document.',
  },

  common: {
    lastUpdated: 'Last updated',
    updatedAt: 'Updated',
    staleWarning: 'This information may be out of date.',
    staleFail: 'Not updated. Call the hotline for the current situation.',
    offline: 'You are offline. Showing what was saved on',
    download: 'Download',
    call: 'Call',
    readMore: 'Read the full item',
    back: 'Back',
    breadcrumb: 'You are here',
    source: 'Source',
    required: 'required',
    needsData: 'Information still missing',
  },

  empty: {
    announcements:
      'No announcements yet this month. New notices are posted here and on the barangay Facebook page.',
    calendar: 'Nothing scheduled in the coming days.',
    health: 'No medical mission scheduled at the moment.',
    projects: 'No projects listed yet.',
    facebook:
      'Posts cannot be fetched right now. Visit the barangay Facebook page.',
    generic: 'Nothing here yet.',
  },

  error: {
    generic: 'Something went wrong loading this information.',
    tryAgain: 'Try again',
    contactBarangay: 'If it keeps happening, call the barangay hall.',
    notFound: 'That page is not on this website.',
    notFoundHelp: 'Try the main pages listed below.',
  },

  footer: {
    sitemap: 'Pages',
    officeHours: 'Office hours',
    address: 'Address',
    privacy: 'Privacy policy',
    accessibility: 'Accessibility',
    chartAttribution: 'Chart: © OpenStreetMap contributors (ODbL)',
    dataNote: 'Population: PSA 2020 Census of Population and Housing.',
  },
}
