import type { APIRoute } from 'astro'
import { SERVICE_DETAILS } from '@/lib/content/active'
import { getHotlines } from '@/lib/content/live-collections'

/**
 * Prebuilt search index, emitted as a static JSON file at build time.
 *
 * Loaded only when a resident focuses the search field (IA.md §3), so it costs
 * nothing on first paint. Budget ≤25 KB gzipped; it is currently far under.
 *
 * `alt` carries the words people actually type. IA.md requires search to find
 * services by colloquial name — someone looking for a barangay clearance may
 * well type "cedula", and finding nothing would send them on a boat trip.
 */

interface Entry {
  readonly t: string // title
  readonly u: string // url
  readonly d: string // one-line description
  readonly k: string // extra keywords, space-separated
}

export const GET: APIRoute = async () => {
  // Hotlines come from the CMS, so search finds the numbers the barangay
  // actually published rather than the checked-in fallback set.
  const HOTLINES = (await getHotlines()).items
  const entries: Entry[] = [
    {
      t: 'Mga numerong pang-emergency',
      u: '/ligtas/hotline',
      d: 'Barangay hotline, BDRRMC, Coast Guard, RHU Taytay',
      k: 'emergency hotline numero tawag telepono bdrrmc coast guard rhu tulong sos',
    },
    {
      t: 'Ligtas — bagyo at dagat',
      u: '/ligtas',
      d: 'Checklist bago ang bagyo, lilikasan, at patakaran sa paglalayag',
      k: 'bagyo typhoon lindol baha storm surge likas evacuation checklist alon dagat safety',
    },
    {
      t: 'Saan lilikas',
      u: '/ligtas#evacuation',
      d: 'Mga lilikasan at kanilang kapasidad',
      k: 'likas evacuation center lilikasan bagyo',
    },
    {
      t: 'Mga Serbisyo',
      u: '/serbisyo',
      d: 'Lahat ng dokumentong ipinapalabas ng barangay',
      k: 'serbisyo services dokumento papeles requirements bayad',
    },
    {
      t: 'Mga Opisyal',
      u: '/opisyal',
      d: 'Punong Barangay, Kagawad, SK, at mga itinalaga',
      k: 'opisyal officials kapitan kap punong barangay kagawad sk secretary treasurer tanod bhw',
    },
    {
      t: 'Transparency',
      u: '/transparency',
      d: 'Badyet, proyekto, procurement, at mga ordinansa',
      k: 'badyet budget ordinansa ordinance resolusyon proyekto project procurement full disclosure',
    },
    {
      t: 'Balita at Anunsyo',
      u: '/balita',
      d: 'Mga abiso mula sa barangay',
      k: 'balita news anunsyo abiso announcement ayuda relief',
    },
    {
      t: 'Tungkol sa Barangay',
      u: '/tungkol',
      d: 'Ang pulo, populasyon, at Malampaya Sound',
      k: 'tungkol about kasaysayan history populasyon malampaya tuluran isla island',
    },
    {
      t: 'Kontak',
      u: '/kontak',
      d: 'Paano makipag-ugnayan at paano marating ang Tumbod',
      k: 'kontak contact address oras opisina biyahe bangka boat pantalan',
    },
  ]

  for (const s of SERVICE_DETAILS) {
    const alt: Record<string, string> = {
      'barangay-clearance': 'clearance cedula katibayan trabaho work permit',
      'sertipiko-ng-indigency': 'indigency mahirap tulong medikal scholarship ayuda certificate',
      'sertipiko-ng-paninirahan': 'residency paninirahan resident proof tirahan',
      'business-clearance': 'business negosyo tindahan permit dti',
      'barangay-id': 'id identification card',
      'blotter-katarungang-pambarangay': 'blotter reklamo away alitan katarungan complaint settlement',
    }
    entries.push({
      t: s.nameFil,
      u: `/serbisyo/${s.slug}`,
      d: s.descriptionFil,
      k: `${alt[s.slug] ?? ''} ${s.nameEn}`.toLowerCase(),
    })
  }

  for (const h of HOTLINES) {
    entries.push({
      t: h.labelFil,
      u: '/ligtas/hotline',
      d: 'Numerong pang-emergency',
      k: `${h.labelEn} hotline numero tawag`.toLowerCase(),
    })
  }

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
