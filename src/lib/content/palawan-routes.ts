/**
 * Verified Palawan Geospatial Dataset & Two-Tier Route Architecture.
 *
 * GEOGRAPHIC INTEGRITY:
 *   - All coordinates are verified against OpenStreetMap (Nominatim / Overpass)
 *     and PhilAtlas PSA boundaries. Approximate landings where OSM lacks a mapped
 *     pier node are explicitly flagged via `verification`.
 *   - Sea distances are Haversine polyline lengths along navigable Endeavor Strait
 *     and Malampaya Sound water waypoints (zero overland shortcuts).
 *   - Mainland highway distances, travel times, and geometries come directly from
 *     OpenStreetMap road network routing (OSRM driving profile from Liminangcong Port),
 *     bundled statically so routes render offline with zero external routing API calls.
 *   - ZERO FARE DATA: No ticket prices or peso estimates appear anywhere in this module.
 */

export type LatLng = readonly [number, number]

export type LocationKind = 'island-port' | 'gateway-port' | 'island-destination' | 'mainland-town'
export type VerificationLevel = 'osm-terminal' | 'osm-place' | 'approximate-landing'
export type TransportNetwork = 'sea' | 'mainland'
export type SeaVesselId = 'small-bangka' | 'passenger-bangka' | 'patrol-boat'
export type RoadVehicleId = 'van' | 'bus' | 'motorcycle' | 'private'

export interface GeoLocation {
  readonly id: string
  readonly lat: number
  readonly lon: number
  readonly kind: LocationKind
  readonly verification: VerificationLevel
  readonly source: string
  readonly nameFil: string
  readonly nameEn: string
  readonly roleFil: string
  readonly roleEn: string
}

export interface SeaRoute {
  readonly id: string
  readonly fromId: string
  readonly toId: string
  readonly distanceKm: number
  readonly estMinutes: readonly [number, number]
  readonly path: readonly LatLng[]
  readonly notesFil: string
  readonly notesEn: string
  readonly cautionFil: string
  readonly cautionEn: string
  readonly approximateLanding: boolean
}

export interface MainlandRoute {
  readonly id: string
  readonly toId: string
  readonly group: 'primary' | 'northern-central' | 'southern'
  readonly highwayKm: number
  readonly driveMinutes: number
  readonly vanBusMinutes: readonly [number, number]
  readonly viaFil: string
  readonly viaEn: string
  readonly modes: readonly RoadVehicleId[]
  readonly path: readonly LatLng[]
}

export interface JourneyLeg {
  readonly network: TransportNetwork
  readonly fromId: string
  readonly toId: string
  readonly distanceKm: number
  readonly estMinutes: readonly [number, number]
  readonly allowedModes: readonly (SeaVesselId | RoadVehicleId)[]
  readonly path: readonly LatLng[]
  readonly summaryFil: string
  readonly summaryEn: string
}

export interface ComposedJourney {
  readonly id: string
  readonly network: TransportNetwork
  readonly originId: string
  readonly destinationId: string
  readonly seaDistanceKm: number
  readonly roadDistanceKm: number
  readonly totalDistanceKm: number
  readonly estTotalMinutes: readonly [number, number]
  readonly legs: readonly JourneyLeg[]
  readonly isMultiLeg: boolean
  readonly hasApproximateLanding: boolean
  readonly advisoryFil: string
  readonly advisoryEn: string
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLon = ((b[1] - a[1]) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function polylineDistanceKm(pts: readonly LatLng[]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    total += haversineKm(pts[i - 1]!, pts[i]!)
  }
  return Number(total.toFixed(1))
}

export const LOCATIONS: Record<string, GeoLocation> = {
  tumbod: {
    id: 'tumbod',
    lat: 11.00873,
    lon: 119.30047,
    kind: 'island-port',
    verification: 'osm-terminal',
    source: 'OpenStreetMap ferry_terminal (Tumbod Pier, Tuluran Island)',
    nameFil: 'Pantalan ng Tumbod (Tuluran Island)',
    nameEn: 'Tumbod Pier (Tuluran Island)',
    roleFil: 'Daungan ng bangka sa isla · Barangay Tumbod',
    roleEn: 'Island boat landing · Barangay Tumbod',
  },
  liminangcong: {
    id: 'liminangcong',
    lat: 11.00879,
    lon: 119.30713,
    kind: 'gateway-port',
    verification: 'osm-terminal',
    source: 'OpenStreetMap ferry_terminal (Port of Liminangcong)',
    nameFil: 'Liminangcong Port (Coastal Gateway)',
    nameEn: 'Liminangcong Port (Coastal Gateway)',
    roleFil: 'Pangunahing daungan at dugtungan sa highway ng Palawan',
    roleEn: 'Coastal boat landing connecting Tuluran Island to Palawan highways',
  },
  cataban: {
    id: 'cataban',
    lat: 10.98408,
    lon: 119.39785,
    kind: 'island-destination',
    verification: 'approximate-landing',
    source: 'OpenStreetMap village Cataban & PhilAtlas (coastal bay approach approximate)',
    nameFil: 'Cataban',
    nameEn: 'Cataban',
    roleFil: 'Destinasyong pandagat sa Taytay Bay (tinatayang daungan sa look)',
    roleEn: 'Sea-access barangay in Taytay Bay (approx. coastal landing)',
  },
  'san-jose': {
    id: 'san-jose',
    lat: 10.92054,
    lon: 119.28098,
    kind: 'island-destination',
    verification: 'approximate-landing',
    source: 'OpenStreetMap village San Jose in Malampaya Sound (no highway access; ~8.2 km off road)',
    nameFil: 'San Jose Island (Malampaya Sound)',
    nameEn: 'San Jose Island (Malampaya Sound)',
    roleFil: 'Komunidad sa katubigan timog ng Tuluran (tinatayang daungan)',
    roleEn: 'Water-access Sound community south of Tuluran (approx. landing)',
  },
  calapa: {
    id: 'calapa',
    lat: 10.8395,
    lon: 119.3006,
    kind: 'island-destination',
    verification: 'approximate-landing',
    source: 'Mapcarta / Banbanan Sitio Calapa (inner Malampaya Sound; pier unmapped in OSM)',
    nameFil: 'Calapa (Malampaya Sound)',
    nameEn: 'Calapa (Malampaya Sound)',
    roleFil: 'Sitio sa loob ng Malampaya Sound (tinatayang daungan sa baybayin)',
    roleEn: 'Inner Malampaya Sound coastal locality (approx. landing)',
  },
  taytay: {
    id: 'taytay',
    lat: 10.82502,
    lon: 119.51788,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Taytay Poblacion',
    nameFil: 'Taytay Poblacion',
    nameEn: 'Taytay Poblacion',
    roleFil: 'Sentro ng Munisipyo · Mainland Highway Hub',
    roleEn: 'Municipal Town Proper · Mainland Highway Hub',
  },
  'el-nido': {
    id: 'el-nido',
    lat: 11.18004,
    lon: 119.3905,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap administrative center El Nido',
    nameFil: 'El Nido',
    nameEn: 'El Nido',
    roleFil: 'Hilagang Munisipyo · Palawan',
    roleEn: 'Northern Municipality · Palawan',
  },
  'san-vicente': {
    id: 'san-vicente',
    lat: 10.52701,
    lon: 119.25628,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town San Vicente',
    nameFil: 'San Vicente',
    nameEn: 'San Vicente',
    roleFil: 'Kanlurang Baybayin · Palawan',
    roleEn: 'West Coast Municipality · Palawan',
  },
  roxas: {
    id: 'roxas',
    lat: 10.31963,
    lon: 119.343,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Roxas',
    nameFil: 'Roxas',
    nameEn: 'Roxas',
    roleFil: 'Sentral-Hilagang Munisipyo · Palawan',
    roleEn: 'North-Central Municipality · Palawan',
  },
  'puerto-princesa': {
    id: 'puerto-princesa',
    lat: 9.78347,
    lon: 118.73202,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap townhall Puerto Princesa City',
    nameFil: 'Puerto Princesa City',
    nameEn: 'Puerto Princesa City',
    roleFil: 'Kabisera ng Lalawigan ng Palawan',
    roleEn: 'Provincial Capital · Palawan',
  },
  aborlan: {
    id: 'aborlan',
    lat: 9.4371,
    lon: 118.54842,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Aborlan',
    nameFil: 'Aborlan',
    nameEn: 'Aborlan',
    roleFil: 'Timog Palawan · National Highway',
    roleEn: 'Southern Palawan · National Highway',
  },
  narra: {
    id: 'narra',
    lat: 9.26851,
    lon: 118.40355,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Narra',
    nameFil: 'Narra',
    nameEn: 'Narra',
    roleFil: 'Timog Palawan · National Highway',
    roleEn: 'Southern Palawan · National Highway',
  },
  quezon: {
    id: 'quezon',
    lat: 9.23774,
    lon: 117.99638,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Quezon',
    nameFil: 'Quezon',
    nameEn: 'Quezon',
    roleFil: 'Kanlurang Bahagi ng Timog Palawan',
    roleEn: 'South-West Coast · Palawan',
  },
  espanola: {
    id: 'espanola',
    lat: 8.96362,
    lon: 118.00044,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Sofronio Española',
    nameFil: 'Sofronio Española',
    nameEn: 'Sofronio Española',
    roleFil: 'Timog Palawan · National Highway',
    roleEn: 'Southern Palawan · National Highway',
  },
  'brookes-point': {
    id: 'brookes-point',
    lat: 8.7736,
    lon: 117.83898,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: "OpenStreetMap town Brooke's Point",
    nameFil: "Brooke's Point",
    nameEn: "Brooke's Point",
    roleFil: 'Timog Palawan · Coastal Highway Hub',
    roleEn: 'Southern Palawan · Coastal Highway Hub',
  },
  rizal: {
    id: 'rizal',
    lat: 9.0341,
    lon: 117.64257,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Rizal',
    nameFil: 'Rizal (Marcos)',
    nameEn: 'Rizal (Marcos)',
    roleFil: 'Kanlurang Timog Palawan',
    roleEn: 'Western Southern Palawan',
  },
  bataraza: {
    id: 'bataraza',
    lat: 8.6733,
    lon: 117.62869,
    kind: 'mainland-town',
    verification: 'osm-place',
    source: 'OpenStreetMap town Bataraza',
    nameFil: 'Bataraza',
    nameEn: 'Bataraza',
    roleFil: 'Pinakatimog na Munisipyo · Palawan',
    roleEn: 'Southernmost Municipality · Palawan',
  },
}

const PATH_TUMBOD_LIMINANGCONG: readonly LatLng[] = [
  [11.00873, 119.30047],
  [11.00876, 119.3038],
  [11.00879, 119.30713],
]

const PATH_TUMBOD_CATABAN: readonly LatLng[] = [
  [11.00873, 119.30047],
  [11.025, 119.306],
  [11.034, 119.315],
  [11.035, 119.335],
  [11.02, 119.365],
  [11.005, 119.375],
  [10.99, 119.392],
  [10.98408, 119.39785],
]

const PATH_TUMBOD_SAN_JOSE: readonly LatLng[] = [
  [11.00873, 119.30047],
  [10.99, 119.304],
  [10.968, 119.303],
  [10.946, 119.3],
  [10.93, 119.286],
  [10.92054, 119.28098],
]

const PATH_TUMBOD_CALAPA: readonly LatLng[] = [
  [11.00873, 119.30047],
  [10.99, 119.304],
  [10.968, 119.303],
  [10.946, 119.3],
  [10.91, 119.305],
  [10.875, 119.306],
  [10.845, 119.302],
  [10.8395, 119.3006],
]

/**
 * NETWORK A: ISLAND & SEA TRANSPORTATION (Boat / Bangka ONLY)
 */
export const SEA_ROUTES: readonly SeaRoute[] = [
  {
    id: 'tumbod-to-liminangcong',
    fromId: 'tumbod',
    toId: 'liminangcong',
    distanceKm: polylineDistanceKm(PATH_TUMBOD_LIMINANGCONG),
    estMinutes: [5, 10],
    path: PATH_TUMBOD_LIMINANGCONG,
    notesFil: 'Direktang tawid sa makitid na Endeavor Strait patungong Liminangcong Port (dugtungan sa van/bus).',
    notesEn: 'Direct crossing across narrow Endeavor Strait to Liminangcong Port (mainland highway gateway).',
    cautionFil: 'Karaniwang protektado ngunit bumibilis ang agos tuwing pagpalit ng taog.',
    cautionEn: 'Generally sheltered strait; tidal currents pick up during tide changes.',
    approximateLanding: false,
  },
  {
    id: 'liminangcong-to-tumbod',
    fromId: 'liminangcong',
    toId: 'tumbod',
    distanceKm: polylineDistanceKm(PATH_TUMBOD_LIMINANGCONG),
    estMinutes: [5, 10],
    path: [...PATH_TUMBOD_LIMINANGCONG].reverse(),
    notesFil: 'Pabalik na tawid mula Liminangcong Port patawid ng Endeavor Strait patungong Pantalan ng Tumbod.',
    notesEn: 'Return crossing from Liminangcong Port across Endeavor Strait to Tumbod Pier.',
    cautionFil: 'Magsuot ng life vest; makipag-ugnayan sa mga bangkero sa Liminangcong Port.',
    cautionEn: 'Wear life jackets; check with boat operators at Liminangcong Port before boarding.',
    approximateLanding: false,
  },
  {
    id: 'tumbod-to-cataban',
    fromId: 'tumbod',
    toId: 'cataban',
    distanceKm: polylineDistanceKm(PATH_TUMBOD_CATABAN),
    estMinutes: [40, 55],
    path: PATH_TUMBOD_CATABAN,
    notesFil: 'Biyaheng pandagat palabas sa hilaga ng tangway patungong look at baybayin ng Cataban.',
    notesEn: 'Coastal water route rounding the northern headland into Cataban Bay.',
    cautionFil: 'Lantad sa Amihan/Habagat paglabas ng tangway; iwasan kapag malakas ang alon.',
    cautionEn: 'Exposed to monsoon swells outside Endeavor Strait; avoid in rough seas.',
    approximateLanding: true,
  },
  {
    id: 'tumbod-to-san-jose',
    fromId: 'tumbod',
    toId: 'san-jose',
    distanceKm: polylineDistanceKm(PATH_TUMBOD_SAN_JOSE),
    estMinutes: [30, 40],
    path: PATH_TUMBOD_SAN_JOSE,
    notesFil: 'Timog na ruta sa loob ng protektadong Endeavor Strait patungong San Jose sa Malampaya Sound.',
    notesEn: 'Southbound sheltered passage down Endeavor Strait into Malampaya Sound toward San Jose.',
    cautionFil: 'Suriin ang babaw ng tubig malapit sa daungan tuwing low tide.',
    cautionEn: 'Check coastal landing depth near shore during extreme low tide.',
    approximateLanding: true,
  },
  {
    id: 'tumbod-to-calapa',
    fromId: 'tumbod',
    toId: 'calapa',
    distanceKm: polylineDistanceKm(PATH_TUMBOD_CALAPA),
    estMinutes: [50, 65],
    path: PATH_TUMBOD_CALAPA,
    notesFil: 'Mahabang biyahe pababa sa gitna ng Malampaya Sound patungong Sitio Calapa (Banbanan).',
    notesEn: 'Waterway journey deep into Malampaya Sound toward Sitio Calapa coastal landing.',
    cautionFil: 'Mag-ingat sa hapon kung lumalakas ang hangin sa maluwag na bahagi ng Sound.',
    cautionEn: 'Monitor afternoon crosswinds across wider sections of inner Malampaya Sound.',
    approximateLanding: true,
  },
]

export const SEA_VESSELS: Record<
  SeaVesselId,
  {
    readonly id: SeaVesselId
    readonly nameFil: string
    readonly nameEn: string
    readonly safeWaveM: number
  }
> = {
  'small-bangka': {
    id: 'small-bangka',
    nameFil: 'Bangkang de-katig (< 3 GT)',
    nameEn: 'Small Outrigger Bangka (< 3 GT)',
    safeWaveM: 1.2,
  },
  'passenger-bangka': {
    id: 'passenger-bangka',
    nameFil: 'Bangkang Pampasahero (3–10 GT)',
    nameEn: 'Passenger Motor Bangka (3–10 GT)',
    safeWaveM: 2.0,
  },
  'patrol-boat': {
    id: 'patrol-boat',
    nameFil: 'Barangay / Rescue Boat',
    nameEn: 'Barangay / Rescue Boat',
    safeWaveM: 2.5,
  },
}

export const ROAD_VEHICLES: Record<
  RoadVehicleId,
  {
    readonly id: RoadVehicleId
    readonly nameFil: string
    readonly nameEn: string
    readonly timeFactor: number
  }
> = {
  van: {
    id: 'van',
    nameFil: 'Van (Shuttle / UV Express)',
    nameEn: 'Public Van / Shuttle',
    timeFactor: 1.15,
  },
  bus: {
    id: 'bus',
    nameFil: 'Bus (RoRo / Cherry Bus)',
    nameEn: 'Provincial Bus',
    timeFactor: 1.32,
  },
  motorcycle: {
    id: 'motorcycle',
    nameFil: 'Motorsiklo',
    nameEn: 'Motorcycle',
    timeFactor: 1.08,
  },
  private: {
    id: 'private',
    nameFil: 'Pribadong Sasakyan',
    nameEn: 'Private Vehicle',
    timeFactor: 1.0,
  },
}

/**
 * NETWORK B: MAINLAND PALAWAN ROAD ROUTES FROM LIMINANGCONG PORT
 * Highway distances & curved geometries verified from OpenStreetMap via OSRM.
 */
export const MAINLAND_ROUTES: readonly MainlandRoute[] = [
  {
    id: 'road-taytay',
    toId: 'taytay',
    group: 'primary',
    highwayKm: 54.4,
    driveMinutes: 65,
    vanBusMinutes: [70, 95],
    viaFil: 'Liminangcong – Taytay National Highway',
    viaEn: 'Liminangcong – Taytay National Highway',
    modes: ['van', 'motorcycle', 'private', 'bus'],
    path: [[11.0075,119.3074],[11.0167,119.3112],[11.0182,119.3146],[11.02,119.3155],[11.0219,119.3145],[11.0256,119.3175],[11.0269,119.3209],[11.026,119.3268],[11.0242,119.326],[11.0221,119.328],[11.0169,119.3294],[11.0155,119.328],[11.0048,119.3277],[11,119.3313],[11.0008,119.3361],[10.9984,119.3377],[10.9906,119.335],[10.9795,119.3378],[10.9803,119.3421],[10.9841,119.3437],[10.9864,119.3427],[10.9867,119.3483],[11.0012,119.3499],[10.9992,119.355],[10.9924,119.3554],[10.9882,119.3601],[10.9881,119.3641],[10.9912,119.3683],[10.9884,119.3761],[10.9902,119.3791],[10.9941,119.3819],[10.9952,119.3851],[10.9946,119.3885],[10.9857,119.3959],[10.9841,119.3989],[10.9845,119.4053],[10.9826,119.4077],[10.9834,119.4141],[10.9789,119.4151],[10.9703,119.4108],[10.9656,119.4105],[10.9589,119.4076],[10.9465,119.4067],[10.9232,119.412],[10.9192,119.4097],[10.9139,119.4092],[10.8949,119.4134],[10.8766,119.4127],[10.8701,119.4206],[10.8678,119.4212],[10.8689,119.4222],[10.8676,119.4233],[10.8659,119.4365],[10.861,119.4507],[10.8463,119.4649],[10.8423,119.4631],[10.8378,119.4584],[10.839,119.4565],[10.8377,119.4533],[10.8336,119.4563],[10.8287,119.4637],[10.8254,119.4636],[10.8231,119.4722],[10.8176,119.4734],[10.8143,119.4758],[10.8124,119.4807],[10.8155,119.4955],[10.8241,119.5097],[10.8252,119.5134],[10.8245,119.5162]],
  },
  {
    id: 'road-el-nido',
    toId: 'el-nido',
    group: 'primary',
    highwayKm: 55.1,
    driveMinutes: 65,
    vanBusMinutes: [75, 100],
    viaFil: 'Liminangcong – El Nido Northern Highway',
    viaEn: 'Liminangcong – El Nido Northern Highway',
    modes: ['van', 'motorcycle', 'private'],
    path: [[11.0075,119.3074],[11.0167,119.3112],[11.0182,119.3146],[11.02,119.3155],[11.0219,119.3145],[11.0256,119.3175],[11.0269,119.3209],[11.026,119.3268],[11.0242,119.326],[11.0221,119.328],[11.0169,119.3294],[11.0155,119.328],[11.0048,119.3277],[11,119.3313],[11.0008,119.3361],[10.9984,119.3377],[10.9906,119.335],[10.9795,119.3378],[10.9803,119.3421],[10.9841,119.3437],[10.9864,119.3427],[10.9867,119.3483],[11.0012,119.3499],[10.9992,119.355],[10.9924,119.3554],[10.9882,119.36],[10.9881,119.3641],[10.9912,119.3683],[10.9884,119.3761],[10.9902,119.3791],[10.9941,119.3819],[10.9952,119.3851],[10.9946,119.3885],[10.9857,119.3959],[10.9841,119.3989],[10.9848,119.4026],[10.984,119.4065],[10.9826,119.4077],[10.9829,119.414],[11.006,119.4142],[11.0228,119.4214],[11.0272,119.4254],[11.0335,119.4246],[11.0363,119.4258],[11.0408,119.4312],[11.0436,119.4296],[11.0454,119.4237],[11.0592,119.4228],[11.0618,119.4264],[11.0734,119.4273],[11.0766,119.4259],[11.0823,119.427],[11.0837,119.4289],[11.0888,119.4272],[11.0942,119.4277],[11.1002,119.4297],[11.1053,119.4334],[11.1121,119.4325],[11.126,119.4341],[11.1316,119.4368],[11.1371,119.437],[11.1404,119.4353],[11.1484,119.4368],[11.1548,119.4304],[11.1579,119.4238],[11.1563,119.4202],[11.1563,119.4156],[11.1527,119.4138],[11.1556,119.4114],[11.1554,119.4064],[11.1513,119.4047],[11.1505,119.4028],[11.1451,119.4008],[11.1487,119.3976],[11.1546,119.3978],[11.1567,119.3994],[11.1583,119.398],[11.1662,119.3981],[11.175,119.3912],[11.1789,119.3897],[11.18,119.3906]],
  },
  {
    id: 'road-puerto-princesa',
    toId: 'puerto-princesa',
    group: 'primary',
    highwayKm: 262.7,
    driveMinutes: 262,
    vanBusMinutes: [280, 340],
    viaFil: 'Liminangcong → Taytay → Roxas → Puerto Princesa',
    viaEn: 'Liminangcong → Taytay → Roxas → Puerto Princesa',
    modes: ['van', 'bus', 'private'],
    path: [[11.0088,119.3071],[11.026,119.3268],[10.9795,119.3379],[11.0012,119.3499],[10.9882,119.3601],[10.9952,119.3851],[10.9834,119.4141],[10.9465,119.4067],[10.8766,119.4127],[10.861,119.4507],[10.8463,119.4649],[10.8377,119.4533],[10.8139,119.4766],[10.825,119.5177],[10.8134,119.4977],[10.7519,119.5067],[10.7408,119.4892],[10.7006,119.4922],[10.6803,119.4546],[10.6284,119.4117],[10.6238,119.388],[10.5836,119.3625],[10.5106,119.3651],[10.4785,119.3541],[10.4384,119.3761],[10.4183,119.3688],[10.3825,119.377],[10.3196,119.3432],[10.3049,119.3154],[10.3151,119.2915],[10.3115,119.266],[10.268,119.2127],[10.2505,119.2055],[10.1814,119.2253],[10.0902,119.2124],[10.0497,119.1926],[10.0263,119.1473],[10.0201,119.0781],[9.9794,118.9391],[9.9933,118.8781],[9.9448,118.8112],[9.9458,118.7974],[9.9671,118.7855],[9.9447,118.7826],[9.9464,118.7511],[9.9246,118.7342],[9.9175,118.7105],[9.9086,118.7035],[9.8591,118.7377],[9.8027,118.7492],[9.7807,118.7483],[9.7835,118.7323]],
  },
  {
    id: 'road-san-vicente',
    toId: 'san-vicente',
    group: 'northern-central',
    highwayKm: 122.5,
    driveMinutes: 134,
    vanBusMinutes: [145, 180],
    viaFil: 'Liminangcong → Taytay → San Vicente Junction',
    viaEn: 'Liminangcong → Taytay → San Vicente Junction',
    modes: ['van', 'motorcycle', 'private'],
    path: [[11.0075,119.3074],[11.0256,119.3175],[11.026,119.3268],[11.0048,119.3277],[10.9984,119.3377],[10.9795,119.3378],[10.9867,119.3483],[11.0012,119.3499],[10.9882,119.3601],[10.9884,119.3761],[10.9952,119.3851],[10.9841,119.3989],[10.9834,119.4141],[10.9465,119.4067],[10.8766,119.4127],[10.8678,119.4212],[10.861,119.4507],[10.8463,119.4649],[10.8377,119.4533],[10.8254,119.4636],[10.8231,119.4722],[10.8143,119.4758],[10.8155,119.4955],[10.8245,119.5162],[10.8134,119.4977],[10.7982,119.4978],[10.7844,119.5058],[10.7519,119.5067],[10.7408,119.4892],[10.7202,119.4959],[10.7161,119.4914],[10.7006,119.4922],[10.6803,119.4546],[10.6746,119.4565],[10.6557,119.4428],[10.6529,119.4292],[10.6469,119.4306],[10.6284,119.4117],[10.6239,119.3881],[10.6048,119.3799],[10.6029,119.3717],[10.5872,119.3638],[10.5512,119.3606],[10.5106,119.3651],[10.5191,119.3472],[10.5287,119.342],[10.5325,119.3255],[10.5283,119.3148],[10.5373,119.3077],[10.5251,119.2857],[10.539,119.2775],[10.5306,119.2548],[10.527,119.2564]],
  },
  {
    id: 'road-roxas',
    toId: 'roxas',
    group: 'northern-central',
    highwayKm: 129.9,
    driveMinutes: 137,
    vanBusMinutes: [150, 185],
    viaFil: 'Liminangcong → Taytay Poblacion → Roxas',
    viaEn: 'Liminangcong → Taytay Poblacion → Roxas',
    modes: ['van', 'bus', 'motorcycle', 'private'],
    path: [[11.0075,119.3074],[11.0256,119.3175],[11.026,119.3268],[11.0048,119.3277],[10.9984,119.3377],[10.9795,119.3378],[10.9867,119.3483],[11.0012,119.3499],[10.9882,119.3601],[10.9884,119.3761],[10.9952,119.3851],[10.9841,119.3989],[10.9834,119.4141],[10.9465,119.4067],[10.8766,119.4127],[10.8678,119.4212],[10.861,119.4507],[10.8463,119.4649],[10.8377,119.4533],[10.8254,119.4636],[10.8231,119.4722],[10.8143,119.4758],[10.8155,119.4955],[10.8245,119.5162],[10.8134,119.4977],[10.7982,119.4978],[10.7844,119.5058],[10.7519,119.5067],[10.7408,119.4892],[10.7202,119.4959],[10.7161,119.4914],[10.7006,119.4922],[10.6803,119.4546],[10.6746,119.4565],[10.6557,119.4428],[10.6529,119.4292],[10.6469,119.4306],[10.6284,119.4117],[10.6238,119.388],[10.5836,119.3625],[10.5106,119.3651],[10.4845,119.3604],[10.4785,119.3541],[10.4632,119.3585],[10.453,119.3708],[10.4384,119.3761],[10.4183,119.3688],[10.3825,119.377],[10.3697,119.3642],[10.3485,119.36],[10.3286,119.3444],[10.3196,119.3432]],
  },
  {
    id: 'road-aborlan',
    toId: 'aborlan',
    group: 'northern-central',
    highwayKm: 334.8,
    driveMinutes: 329,
    vanBusMinutes: [360, 420],
    viaFil: 'Liminangcong → Taytay → Puerto Princesa → Aborlan',
    viaEn: 'Liminangcong → Taytay → Puerto Princesa → Aborlan',
    modes: ['van', 'bus', 'private'],
    path: [[11.0075,119.3074],[11.026,119.3268],[10.9795,119.3378],[11.0012,119.3499],[10.9882,119.3601],[10.9952,119.3851],[10.9834,119.4141],[10.9465,119.4067],[10.8766,119.4127],[10.861,119.4507],[10.8463,119.4649],[10.8377,119.4533],[10.8143,119.4758],[10.8245,119.5162],[10.8134,119.4977],[10.7519,119.5067],[10.7408,119.4892],[10.7006,119.4922],[10.6803,119.4546],[10.6284,119.4117],[10.6238,119.388],[10.5836,119.3625],[10.5106,119.3651],[10.4785,119.3541],[10.4384,119.3761],[10.4183,119.3688],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3152,119.2914],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[10.0263,119.1473],[10.0201,119.0781],[9.9794,118.9391],[9.9933,118.8781],[9.9437,118.8084],[9.9671,118.7855],[9.9447,118.7826],[9.9382,118.7382],[9.9246,118.7342],[9.9093,118.7034],[9.8591,118.7377],[9.8029,118.7492],[9.7483,118.7479],[9.7394,118.7354],[9.7527,118.7478],[9.7947,118.7354],[9.8014,118.694],[9.7659,118.6778],[9.7325,118.6842],[9.7148,118.6661],[9.6908,118.699],[9.6423,118.7093],[9.6411,118.7317],[9.5732,118.676],[9.5628,118.6467],[9.495,118.5701],[9.4371,118.549]],
  },
  {
    id: 'road-narra',
    toId: 'narra',
    group: 'northern-central',
    highwayKm: 359.8,
    driveMinutes: 353,
    vanBusMinutes: [380, 450],
    viaFil: 'Liminangcong → Taytay → Puerto Princesa → Narra',
    viaEn: 'Liminangcong → Taytay → Puerto Princesa → Narra',
    modes: ['van', 'bus', 'private'],
    path: [[11.0075,119.3074],[11.026,119.3268],[10.9795,119.3378],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8143,119.4758],[10.8245,119.5162],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.8781],[9.9437,118.8084],[9.9671,118.7855],[9.9447,118.7826],[9.9382,118.7382],[9.9093,118.7034],[9.8029,118.7492],[9.7394,118.7354],[9.7947,118.7354],[9.8014,118.694],[9.7148,118.6661],[9.6908,118.699],[9.6423,118.7093],[9.6401,118.7313],[9.495,118.5701],[9.4215,118.5409],[9.2682,118.4038]],
  },
  {
    id: 'road-quezon',
    toId: 'quezon',
    group: 'southern',
    highwayKm: 414.5,
    driveMinutes: 403,
    vanBusMinutes: [440, 510],
    viaFil: 'Liminangcong → Taytay → Puerto Princesa → Quezon',
    viaEn: 'Liminangcong → Taytay → Puerto Princesa → Quezon',
    modes: ['van', 'bus', 'private'],
    path: [[11.0075,119.3074],[11.026,119.3268],[10.9795,119.3378],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8143,119.4758],[10.8245,119.5162],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.8781],[9.9437,118.8084],[9.9671,118.7855],[9.9447,118.7826],[9.9382,118.7382],[9.9093,118.7034],[9.8029,118.7492],[9.7394,118.7354],[9.7947,118.7354],[9.8014,118.694],[9.7148,118.6661],[9.6908,118.699],[9.6423,118.7093],[9.6401,118.7313],[9.4949,118.57],[9.4215,118.5409],[9.2606,118.3977],[9.1786,118.2498],[9.156,118.1359],[9.2375,117.9965]],
  },
  {
    id: 'road-espanola',
    toId: 'espanola',
    group: 'southern',
    highwayKm: 421.4,
    driveMinutes: 411,
    vanBusMinutes: [445, 515],
    viaFil: 'Liminangcong → Taytay → Puerto Princesa → Narra → Sofronio Española',
    viaEn: 'Liminangcong → Taytay → Puerto Princesa → Narra → Sofronio Española',
    modes: ['van', 'bus', 'private'],
    path: [[11.0088,119.3071],[11.026,119.3268],[10.9795,119.3379],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8139,119.4766],[10.825,119.5177],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.878],[9.9436,118.8082],[9.9671,118.7853],[9.9447,118.7826],[9.9464,118.7511],[9.9106,118.7037],[9.8588,118.7378],[9.7807,118.7483],[9.7835,118.7323],[9.8014,118.694],[9.7152,118.6661],[9.6365,118.7293],[9.495,118.5701],[9.4215,118.5409],[9.2688,118.4033],[9.1786,118.2498],[9.1539,118.1053],[9.1086,118.1008],[9.0885,118.0628],[8.96,118.0399],[8.9636,118.0005]],
  },
  {
    id: 'road-brookes-point',
    toId: 'brookes-point',
    group: 'southern',
    highwayKm: 459.8,
    driveMinutes: 447,
    vanBusMinutes: [480, 560],
    viaFil: "Liminangcong → Taytay → Puerto Princesa → Narra → Brooke's Point",
    viaEn: "Liminangcong → Taytay → Puerto Princesa → Narra → Brooke's Point",
    modes: ['van', 'bus', 'private'],
    path: [[11.0075,119.3074],[11.026,119.3268],[10.9795,119.3378],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8143,119.4758],[10.8245,119.5162],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.8781],[9.9437,118.8084],[9.9671,118.7855],[9.9447,118.7826],[9.9382,118.7382],[9.9093,118.7034],[9.8029,118.7492],[9.7394,118.7354],[9.7947,118.7354],[9.8014,118.694],[9.7148,118.6661],[9.6908,118.699],[9.6423,118.7093],[9.6401,118.7313],[9.495,118.5701],[9.4215,118.5409],[9.2682,118.4038],[9.1786,118.2498],[9.1538,118.1053],[9.1086,118.1008],[9.0885,118.0628],[8.9598,118.0398],[8.935,117.9703],[8.8968,117.9608],[8.8083,117.8464],[8.774,117.839]],
  },
  {
    id: 'road-rizal',
    toId: 'rizal',
    group: 'southern',
    highwayKm: 474.5,
    driveMinutes: 459,
    vanBusMinutes: [500, 580],
    viaFil: 'Liminangcong → Taytay → Puerto Princesa → Quezon → Rizal',
    viaEn: 'Liminangcong → Taytay → Puerto Princesa → Quezon → Rizal',
    modes: ['van', 'bus', 'private'],
    path: [[11.0075,119.3074],[11.026,119.3268],[10.9795,119.3378],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8143,119.4758],[10.8245,119.5162],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.8781],[9.9437,118.8084],[9.9671,118.7855],[9.9447,118.7826],[9.9382,118.7382],[9.9093,118.7034],[9.8029,118.7492],[9.7394,118.7354],[9.7947,118.7354],[9.8014,118.694],[9.7148,118.6661],[9.6908,118.699],[9.6423,118.7093],[9.6401,118.7313],[9.4949,118.57],[9.4215,118.5409],[9.2606,118.3977],[9.1786,118.2498],[9.156,118.1359],[9.2375,117.9965],[9.1815,117.9201],[9.163,117.8251],[9.0334,117.7415],[9.0563,117.6888],[9.034,117.6426]],
  },
  {
    id: 'road-bataraza',
    toId: 'bataraza',
    group: 'southern',
    highwayKm: 476.9,
    driveMinutes: 462,
    vanBusMinutes: [500, 585],
    viaFil: "Liminangcong → Taytay → Puerto Princesa → Brooke's Point → Bataraza",
    viaEn: "Liminangcong → Taytay → Puerto Princesa → Brooke's Point → Bataraza",
    modes: ['van', 'bus', 'private'],
    path: [[11.0088,119.3071],[11.026,119.3268],[10.9795,119.3379],[11.0012,119.3499],[10.9834,119.4141],[10.8766,119.4127],[10.861,119.4507],[10.8139,119.4766],[10.825,119.5177],[10.8134,119.4977],[10.7006,119.4922],[10.5836,119.3625],[10.4785,119.3541],[10.383,119.377],[10.3485,119.36],[10.3052,119.3169],[10.3071,119.2567],[10.2519,119.2058],[10.1814,119.2253],[10.0554,119.1993],[9.9794,118.9391],[9.9933,118.878],[9.9436,118.8082],[9.9671,118.7853],[9.9447,118.7826],[9.9464,118.7511],[9.9106,118.7037],[9.8588,118.7378],[9.7807,118.7483],[9.7835,118.7323],[9.8014,118.694],[9.7152,118.6661],[9.6365,118.7293],[9.495,118.5701],[9.4215,118.5409],[9.2688,118.4033],[9.1786,118.2498],[9.1539,118.1053],[9.1086,118.1008],[9.0885,118.0628],[8.9598,118.0397],[8.935,117.9703],[8.8968,117.9608],[8.7025,117.7213],[8.6729,117.6286]],
  },
]

export function isModeValidForNetwork(network: TransportNetwork, mode: SeaVesselId | RoadVehicleId): boolean {
  if (network === 'sea') return mode === 'small-bangka' || mode === 'passenger-bangka' || mode === 'patrol-boat'
  return mode === 'van' || mode === 'bus' || mode === 'motorcycle' || mode === 'private'
}

export function formatMinutesRange(range: readonly [number, number], fil: boolean): string {
  const [min, max] = range
  if (max < 90) return `~${min}–${max} min`
  const h1 = (min / 60).toFixed(1).replace(/\.0$/, '')
  const h2 = (max / 60).toFixed(1).replace(/\.0$/, '')
  return fil ? `~${h1}–${h2} oras` : `~${h1}–${h2} hrs`
}

export function composeSeaJourney(routeId: string): ComposedJourney {
  const route = SEA_ROUTES.find((r) => r.id === routeId) ?? SEA_ROUTES[0]!
  return {
    id: route.id,
    network: 'sea',
    originId: route.fromId,
    destinationId: route.toId,
    seaDistanceKm: route.distanceKm,
    roadDistanceKm: 0,
    totalDistanceKm: route.distanceKm,
    estTotalMinutes: route.estMinutes,
    isMultiLeg: false,
    hasApproximateLanding: route.approximateLanding,
    advisoryFil: route.cautionFil,
    advisoryEn: route.cautionEn,
    legs: [
      {
        network: 'sea',
        fromId: route.fromId,
        toId: route.toId,
        distanceKm: route.distanceKm,
        estMinutes: route.estMinutes,
        allowedModes: ['small-bangka', 'passenger-bangka', 'patrol-boat'],
        path: route.path,
        summaryFil: route.notesFil,
        summaryEn: route.notesEn,
      },
    ],
  }
}

export function composeMainlandJourney(
  destinationId: string,
  startFromTumbod: boolean,
  vehicle: RoadVehicleId = 'van',
): ComposedJourney {
  const road = MAINLAND_ROUTES.find((r) => r.toId === destinationId) ?? MAINLAND_ROUTES[0]!
  const chosenMode = road.modes.includes(vehicle) ? vehicle : road.modes[0]!
  const factor = ROAD_VEHICLES[chosenMode].timeFactor
  const rMin = Math.round(road.driveMinutes * factor)
  const rMax = Math.round(road.driveMinutes * (factor + 0.16))

  const roadLeg: JourneyLeg = {
    network: 'mainland',
    fromId: 'liminangcong',
    toId: road.toId,
    distanceKm: road.highwayKm,
    estMinutes: [rMin, rMax],
    allowedModes: road.modes,
    path: road.path,
    summaryFil: `Daan: ${road.viaFil} (tantiya lamang, walang nakapirming iskedyul)`,
    summaryEn: `Corridor: ${road.viaEn} (estimated road time, not a fixed schedule)`,
  }

  if (!startFromTumbod) {
    return {
      id: `road-${road.toId}`,
      network: 'mainland',
      originId: 'liminangcong',
      destinationId: road.toId,
      seaDistanceKm: 0,
      roadDistanceKm: road.highwayKm,
      totalDistanceKm: road.highwayKm,
      estTotalMinutes: [rMin, rMax],
      isMultiLeg: false,
      hasApproximateLanding: false,
      advisoryFil: 'Walang biyaheng bangka sa rutang ito. Kalsada mula Liminangcong Port lamang.',
      advisoryEn: 'Road-only segment departing Liminangcong Port. No boat transfer required.',
      legs: [roadLeg],
    }
  }

  const seaLegRef = SEA_ROUTES[0]!
  const seaLeg: JourneyLeg = {
    network: 'sea',
    fromId: 'tumbod',
    toId: 'liminangcong',
    distanceKm: seaLegRef.distanceKm,
    estMinutes: seaLegRef.estMinutes,
    allowedModes: ['small-bangka', 'passenger-bangka', 'patrol-boat'],
    path: seaLegRef.path,
    summaryFil: 'Unang yugto (Dagat): Bangka mula Pantalan ng Tumbod patawid ng Endeavor Strait papuntang Liminangcong Port.',
    summaryEn: 'Leg 1 (Sea): Outrigger boat from Tumbod Pier across Endeavor Strait to Liminangcong Port.',
  }

  const totalKm = Number((seaLegRef.distanceKm + road.highwayKm).toFixed(1))
  return {
    id: `tumbod-via-liminangcong-${road.toId}`,
    network: 'mainland',
    originId: 'tumbod',
    destinationId: road.toId,
    seaDistanceKm: seaLegRef.distanceKm,
    roadDistanceKm: road.highwayKm,
    totalDistanceKm: totalKm,
    estTotalMinutes: [seaLegRef.estMinutes[0] + rMin, seaLegRef.estMinutes[1] + rMax],
    isMultiLeg: true,
    hasApproximateLanding: false,
    advisoryFil: 'May hiwalay na paglipat sa Liminangcong Port. Hindi garantisadong direktang koneksyon; nakadepende ang Leg 1 sa lagay ng dagat at ang Leg 2 sa biyahe ng van/bus.',
    advisoryEn: 'Transfer required at Liminangcong Port. Not a guaranteed direct connection — Leg 1 depends on sea state and Leg 2 on highway van/bus availability.',
    legs: [seaLeg, roadLeg],
  }
}
