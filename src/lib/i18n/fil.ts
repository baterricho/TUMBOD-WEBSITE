/**
 * Filipino dictionary — CANONICAL. English mirrors this shape.
 *
 * Voice rules (BUILD-PROMPT.md §7.3):
 *  - Buttons state outcomes, never "Submit" / "Learn more".
 *  - Empty states give direction, not apology.
 *  - No civic boilerplate. No "Welcome to the official website of…".
 *  - Roughly Grade 6 reading level.
 *
 * ⚠ LAUNCH-BLOCKING: every string here must be reviewed by the Barangay
 * Secretary before launch. Written from general barangay register, not from
 * Tumbod's own voice — see DISCOVERY-QUESTIONS.md B1.
 */

/*
 * NOTE: deliberately NOT `as const`. The English dictionary must match this
 * object's SHAPE (every key present, nothing extra) — not its values. With
 * `as const` every string narrows to a literal type and the translation can
 * never satisfy it.
 */
export const dictionaryFil = {
  meta: {
    siteName: 'Barangay Tumbod',
    municipality: 'Taytay, Palawan',
    tagline: 'Ang opisyal na website ng Barangay Tumbod',
  },

  nav: {
    skipToContent: 'Dumiretso sa nilalaman',
    home: 'Ngayon',
    services: 'Serbisyo',
    news: 'Balita',
    safety: 'Ligtas',
    more: 'Higit pa',
    menu: 'Menu',
    openMenu: 'Buksan ang menu',
    closeMenu: 'Isara ang menu',
    emergency: 'Emergency',
    emergencyLabel: 'Mga numerong pang-emergency',
    officials: 'Mga Opisyal',
    transparency: 'Transparency',
    about: 'Tungkol sa Barangay',
    contact: 'Kontak',
    calendar: 'Kalendaryo',
    forms: 'Mga Form',
    language: 'Wika',
    switchToEnglish: 'English',
    theme: 'Itim na background',
  },

  home: {
    title: 'Ngayon sa Tumbod',
    seaNow: 'Dagat ngayon',
    nextTrip: 'Susunod na biyahe',
    officeStatus: 'Opisina',
    quickActions: 'Mabilis na aksyon',
    getClearance: 'Kumuha ng Clearance',
    emergencyNumbers: 'Emergency na numero',
    boatTrips: 'Biyahe ng bangka',
    search: 'Hanapin',
    announcements: 'Anunsyo',
    allAnnouncements: 'Lahat ng anunsyo',
    nextHealth: 'Susunod na medical mission',
    bring: 'Dalhin',
    emergencyContacts: 'Mga numerong pang-emergency',
    fullDirectory: 'Buong direktoryo',
    commonDocuments: 'Madalas hinging dokumento',
    calendar: 'Kalendaryo',
    projects: 'Mga proyekto',
    forms: 'Mga form na mada-download',
    fromFacebook: 'Mula sa Facebook page',
    openFacebook: 'Buksan ang Facebook page',
    aboutHeading: 'Tungkol sa Tumbod',
    aboutBody:
      'Isang barangay-isla sa bukana ng Malampaya Sound. Ang buong pulo ng Tuluran ay ang barangay namin. Walang kalsadang papunta rito — bangka ang lahat ng biyahe.',
    aboutPopulation: '1,744 kami ayon sa senso ng PSA noong 2020.',
    readHistory: 'Basahin ang kasaysayan',
  },

  sea: {
    calm: 'MAHINAY',
    moderate: 'KATAMTAMAN',
    rough: 'MALAKAS',
    dangerous: 'DELIKADO',
    waveHeight: 'Alon',
    wind: 'Hangin',
    readAt: 'Basa noong',
    source: 'Pinagkunan',
    label: 'Lagay ng dagat',
  },

  boat: {
    running: 'TULOY ANG BIYAHE',
    uncertain: 'HINDI TIYAK',
    cancelled: 'KANSELADO',
    departure: 'Alis',
    fare: 'Pamasahe',
    operator: 'Bangkero',
    route: 'Ruta',
    reasonSea: 'dahil sa alon',
    reasonBan: 'utos ng Coast Guard — bawal maglayag',
    reasonOperator: 'desisyon ng bangkero',
    reasonOther: 'iba pang dahilan',
  },

  office: {
    open: 'BUKAS ANG OPISINA',
    closed: 'SARADO ANG OPISINA',
    limited: 'LIMITADO ANG SERBISYO',
    opensTomorrow: 'Bubukas bukas',
    hoursToday: 'Oras ngayon',
  },

  alert: {
    info: 'Paalala',
    advisory: 'Abiso',
    warning: 'Babala',
    emergency: 'Emergency',
    issued: 'Inilabas',
    expires: 'Hanggang',
    dismiss: 'Itago ang paalala',
    callNow: 'Tumawag ngayon',
  },

  safety: {
    title: 'Ligtas',
    currentStatus: 'Kalagayan ngayon',
    noWarning: 'WALANG BABALA',
    normalConditions: 'Normal ang lagay ng panahon.',
    lastAdvisory: 'Huling abiso',
    mayBeNewer: 'Baka may bago nang abiso — tumawag sa hotline.',
    callNow: 'Tumawag agad',
    whereToEvacuate: 'Saan lilikas',
    evacuationIncomplete:
      'Hindi pa kumpleto ang listahan ng lilikasan. Tanungin ang BDRRMC.',
    beforeTyphoon: 'Bago dumating ang bagyo',
    printChecklist: 'I-print ang listahan',
    seaTravel: 'Paglalayag at alon',
    coastGuardRule:
      'Ipinagbabawal ng Coast Guard ang paglalayag ng mga bangkang 3 gross tons pababa kapag malakas ang alon sa Taytay at El Nido. Karamihan ng bangka natin ay saklaw nito.',
    fullPolicy: 'Buong patakaran',
    bdrrmc: 'BDRRMC',
    noSignal: 'Kapag walang signal',
    capacity: 'Kayang tanggapin',
    purok: 'Purok',
  },

  services: {
    title: 'Mga Serbisyo',
    fee: 'Bayad',
    free: 'Libre',
    processingTime: 'Tagal',
    officeHours: 'Oras ng opisina',
    approach: 'Lapitan si',
    bringThis: 'Dalhin mo ito',
    ready: 'handa na',
    of: 'sa',
    copyList: 'Kopyahin ang listahan',
    copied: 'Nakopya na',
    print: 'I-print',
    process: 'Paano ang proseso',
    legalBasis: 'Batayan',
    faq: 'Madalas itanong',
    viewRequirements: 'Tingnan ang requirements',
    notAutomated:
      'Hindi ito awtomatikong pag-isyu. Kailangan mo pa ring pumunta sa barangay hall para kunin ang dokumento.',
  },

  common: {
    lastUpdated: 'Huling update',
    updatedAt: 'Na-update noong',
    staleWarning: 'Maaaring luma na ang impormasyong ito.',
    staleFail: 'Hindi na-update. Tumawag sa hotline para sa tama.',
    offline: 'Naka-offline. Ipinapakita ang huling nakuha noong',
    download: 'I-download',
    call: 'Tumawag',
    readMore: 'Basahin ang buo',
    back: 'Bumalik',
    breadcrumb: 'Nasaan ka',
    source: 'Pinagkunan',
    required: 'kailangan',
    needsData: 'Kulang pa ang impormasyon',
  },

  empty: {
    announcements:
      'Wala pang anunsyo ngayong buwan. Ang mga bagong abiso ay ipa-po-post dito at sa Facebook page ng barangay.',
    calendar: 'Walang nakatakdang aktibidad sa mga susunod na araw.',
    health: 'Walang nakatakdang medical mission sa ngayon.',
    projects: 'Wala pang nakalistang proyekto.',
    facebook:
      'Hindi makuha ang mga post ngayon. Bisitahin ang Facebook page ng barangay.',
    generic: 'Wala pang nakalagay dito.',
  },

  error: {
    generic: 'May mali sa paglabas ng impormasyon.',
    tryAgain: 'Subukan ulit',
    contactBarangay: 'Kung tuloy pa rin, tumawag sa barangay hall.',
    notFound: 'Wala sa website ang hinahanap mo.',
    notFoundHelp: 'Subukan ang mga pangunahing pahina sa ibaba.',
  },

  footer: {
    sitemap: 'Mga pahina',
    officeHours: 'Oras ng opisina',
    address: 'Address',
    privacy: 'Patakaran sa privacy',
    accessibility: 'Accessibility',
    chartAttribution: 'Mapa: © OpenStreetMap contributors (ODbL)',
    dataNote: 'Populasyon: PSA 2020 Census of Population and Housing.',
  },
}
