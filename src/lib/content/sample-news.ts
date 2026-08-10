/**
 * SAMPLE ARTICLES — news stories and events that have their own pages.
 *
 * `sample.ts` fills the navigation panels with headlines. This file is the
 * next step: the same stories as READABLE ARTICLES, each with a slug, a photo,
 * a category and a real body, so that clicking a headline opens something
 * rather than dumping the reader on a list.
 *
 * ─────────────────────────────────────────────────────────────────
 * THE FOUR SAFETY RULES FROM `sample.ts` APPLY HERE UNCHANGED, and one of them
 * does more work in this file than it did there:
 *
 *   RULE 4 — NO FABRICATED ANNOUNCEMENTS PRESENTED AS NEWS.
 *
 * In the mega panel a fake headline is a line of text in a menu. Here it is a
 * full article, at its own URL, with a date and a photograph — which is to say
 * it is exactly the shape of a thing that gets screenshotted, shared, and
 * quoted back as something the barangay announced.
 *
 * So every title carries `(sample)` in BOTH languages, every page renders a
 * `<SampleChip>`, and every article body opens with a standing notice. None of
 * these are decoration; remove them and this file becomes a machine for
 * publishing barangay announcements that no barangay official ever wrote.
 *
 * Also observed here:
 *   - No real people. No official is named, no resident is quoted, no
 *     attendance or budget figure is stated. Invented civic statistics are the
 *     hardest kind of fake to walk back.
 *   - No phone numbers at all. `sample.ts` needed them and used the unassigned
 *     0999-000-00xx prefix; nothing in an article body needs one, so there are
 *     none to get wrong.
 *   - Photography is reused from `/public/media`, which is already what the
 *     mega panel does. No new stock imagery enters the repo for this.
 *
 * REPLACING THIS WITH REAL CONTENT: the shapes below mirror the `announcements`
 * and `events` tables in `lib/cms/collections.ts` field for field. Point the
 * views at the live source and delete this file; nothing else has to move.
 * ─────────────────────────────────────────────────────────────────
 */

import { SAMPLE_TAG } from './sample'

/**
 * A photograph.
 *
 * Width/height are optional ONLY because CMS images have none stored — the
 * `media` table records dimensions but `announcements.image_url` is a bare URL
 * and nothing joins them. The box is still reserved either way: the CSS locks
 * `aspect-ratio: 16/9` on every article image, so CLS stays at 0.000 with or
 * without the intrinsic attributes. Supply them when you know them; the
 * attributes let the browser pick the right layout before CSS is parsed.
 */
export interface ArticleImage {
  readonly src: string
  readonly thumb: string
  readonly width?: number
  readonly height?: number
  readonly altFil: string
  readonly altEn: string
}

/** @deprecated Kept so existing imports keep resolving. Use `ArticleImage`. */
export type SampleImage = ArticleImage

const IMG = {
  cove1: {
    src: '/media/tumbod-cove-1.jpg',
    thumb: '/media/tumbod-cove-1-thumb.jpg',
    width: 960,
    height: 539,
    altFil: 'Tanawin ng baybayin mula sa itaas, may mababaw na tubig at mga bato.',
    altEn: 'A coastline seen from above, with shallow water and rocks.',
  },
  cove2: {
    src: '/media/tumbod-cove-2.jpg',
    thumb: '/media/tumbod-cove-2-thumb.jpg',
    width: 960,
    height: 539,
    altFil: 'Look na napapalibutan ng mga puno, malinaw ang tubig.',
    altEn: 'A cove ringed by trees, with clear water.',
  },
  falls: {
    src: '/media/tumbod-falls.jpg',
    thumb: '/media/tumbod-falls-thumb.jpg',
    width: 960,
    height: 539,
    altFil: 'Talon at batuhan sa gitna ng kagubatan.',
    altEn: 'A waterfall and rocks in the middle of forest.',
  },
  shore: {
    src: '/media/tumbod-hero-poster.jpg',
    thumb: '/media/tumbod-hero-poster.jpg',
    width: 640,
    height: 360,
    altFil: 'Tanawin ng dagat at pampang ng Tumbod.',
    altEn: 'A view of the sea and the Tumbod shoreline.',
  },
  /* pantalan.jpg is 1080×1920 — PORTRAIT, while its thumbnail is landscape.
     Using it as a wide article header would letterbox badly, so only the
     thumbnail is referenced and the article header falls back to `shore`. */
  pantalanThumb: {
    src: '/media/tumbod-pantalan-thumb.jpg',
    thumb: '/media/tumbod-pantalan-thumb.jpg',
    width: 350,
    height: 197,
    altFil: 'Daan patungo sa pantalan.',
    altEn: 'The road down to the landing.',
  },
} as const satisfies Record<string, ArticleImage>

export type ArticleKind = 'news' | 'event'

export interface Article {
  readonly slug: string
  readonly kind: ArticleKind
  readonly categoryFil: string
  readonly categoryEn: string
  readonly titleFil: string
  readonly titleEn: string
  /** One sentence. The list card and the meta description both use it. */
  readonly leadFil: string
  readonly leadEn: string
  /** Paragraphs. Plain strings — never HTML, because nothing renders HTML from
   *  content on this site and an article body is not the place to start. */
  readonly bodyFil: readonly string[]
  readonly bodyEn: readonly string[]
  /** Absent for CMS events, which have no image column. Views must handle it. */
  readonly image?: ArticleImage
  /**
   * Whether this is demonstration content, PER ARTICLE.
   *
   * Not per source. Every content table in the database carries its own
   * `is_sample` column, and the seeded rows use it: the announcements and
   * events are flagged samples while the officials roster and the hotlines are
   * real, verified data. So "it came from the database" says nothing about
   * whether it is real — only the row does.
   *
   * Getting this backwards is a two-way failure. Miss a true and the site
   * presents invented announcements as official barangay statements; miss a
   * false and it stamps "SAMPLE DATA" across content the barangay actually
   * published, which teaches readers the warning is noise.
   */
  readonly isSample?: boolean
  /** News: when it was published. Events: when it was announced. */
  readonly publishedAt: Date
  /** Events only. */
  readonly startsAt?: Date
  readonly timeLabel?: string
  readonly locationFil?: string
  readonly locationEn?: string
}

/** Read once so a list and its detail pages cannot disagree about "today"
 *  when a build straddles midnight. */
export const BUILD_NOW = new Date()

/* ── News ───────────────────────────────────────────────────────────── */

export const SAMPLE_ARTICLES: readonly Article[] = [
  {
    slug: 'pagtatanim-ng-bakawan',
    kind: 'news',
    categoryFil: 'Kalikasan',
    categoryEn: 'Environment',
    titleFil: `Naglunsad ang barangay ng programa sa pagtatanim ng bakawan ${SAMPLE_TAG}`,
    titleEn: `Barangay launches a mangrove planting programme ${SAMPLE_TAG}`,
    leadFil:
      'Isang programa para sa muling pagtatanim ng bakawan sa baybayin, upang palakasin ang proteksyon laban sa daluyong at pagbutihin ang yamang-dagat.',
    leadEn:
      'A coastal mangrove replanting programme, to strengthen protection against storm surge and improve marine resources.',
    bodyFil: [
      'Ang kabakawanan ang unang harang ng isla kapag may bagyo. Kapag makapal ang bakawan, humihina ang alon bago pa ito umabot sa mga bahay sa tabing-dagat, at nagkakaroon ng pugad ang isda at alimango.',
      'Sa ilalim ng programa, tutukuyin muna ang mga bahagi ng baybayin kung saan nawala ang bakawan, saka magtatanim ng mga punla na angkop sa tubig-alat ng lugar. Kailangang bantayan ang mga punla sa unang dalawang taon — hindi sapat ang pagtatanim lamang.',
      'Ang mga residenteng nais tumulong ay maaaring magtanong sa barangay hall tuwing oras ng opisina.',
    ],
    bodyEn: [
      "Mangroves are the island's first barrier during a typhoon. Where the stand is thick, waves lose force before they reach the houses along the shore, and fish and crab have somewhere to breed.",
      'Under the programme, the stretches of shoreline where mangrove has been lost are identified first, and seedlings suited to the local salinity are planted there. The seedlings need tending for the first two years — planting alone is not enough.',
      'Residents who want to help can ask at the barangay hall during office hours.',
    ],
    image: IMG.cove1,
    publishedAt: new Date('2026-08-05T09:00:00+08:00'),
  },
  {
    slug: 'medical-mission-para-sa-senior',
    kind: 'news',
    categoryFil: 'Kalusugan',
    categoryEn: 'Health',
    titleFil: `Medical mission para sa mga senior citizen ${SAMPLE_TAG}`,
    titleEn: `Medical mission for senior citizens ${SAMPLE_TAG}`,
    leadFil:
      'Libreng check-up, pagsusuri ng presyon, at gamot para sa mga nakatatanda sa barangay.',
    leadEn:
      'Free check-ups, blood-pressure screening and medicines for the barangay’s older residents.',
    bodyFil: [
      'Isinagawa sa covered court ang medical mission para sa mga senior citizen. Kasama rito ang pagsusuri ng presyon at asukal sa dugo, at konsultasyon sa doktor.',
      'Ang mga hindi nakadalo ay maaaring pumunta sa health station sa regular nitong oras. Dalhin ang senior citizen ID kung mayroon.',
    ],
    bodyEn: [
      'The medical mission for senior citizens was held at the covered court. It included blood-pressure and blood-sugar screening, and consultation with a doctor.',
      'Anyone who could not attend can go to the health station during its regular hours. Bring a senior citizen ID if you have one.',
    ],
    image: IMG.falls,
    publishedAt: new Date('2026-08-02T08:00:00+08:00'),
  },
  {
    slug: 'rehabilitasyon-ng-daan-sa-pantalan',
    kind: 'news',
    categoryFil: 'Imprastruktura',
    categoryEn: 'Infrastructure',
    titleFil: `Natapos ang rehabilitasyon ng daan patungong pantalan ${SAMPLE_TAG}`,
    titleEn: `Road rehabilitation to the landing completed ${SAMPLE_TAG}`,
    leadFil:
      'Naayos na ang bahagi ng daang paakyat mula sa pantalan, na dating maputik at madulas kapag tag-ulan.',
    leadEn:
      'The stretch of road up from the landing — muddy and slippery through the rainy season — has been repaired.',
    bodyFil: [
      'Ang daang ito ang dinaraanan ng lahat ng dumarating sa isla: mga pasahero, paninda, at mga bagay na kailangan sa health station. Kapag maputik ito, nahihirapan ang mga may edad at ang may dalang mabigat.',
      'Sa pagkakataong ito ay sinemento ang pinakamatarik na bahagi at nilagyan ng kanal sa gilid upang may daluyan ang tubig-ulan.',
    ],
    bodyEn: [
      'Everything that arrives on the island comes up this road: passengers, goods, and supplies for the health station. When it turns to mud, older residents and anyone carrying a load struggle with it.',
      'The steepest section has now been concreted, with a drainage channel along one side so rainwater has somewhere to go.',
    ],
    image: IMG.shore,
    publishedAt: new Date('2026-07-29T14:00:00+08:00'),
  },
  {
    slug: 'programa-ng-scholarship',
    kind: 'news',
    categoryFil: 'Edukasyon',
    categoryEn: 'Education',
    titleFil: `Bagong programa ng scholarship para sa mga mag-aaral ${SAMPLE_TAG}`,
    titleEn: `New scholarship programme for students ${SAMPLE_TAG}`,
    leadFil:
      'Tulong sa pamasahe at gastusin sa pag-aaral para sa mga estudyanteng kailangang tumawid papuntang bayan.',
    leadEn:
      'Help with fares and school costs for students who have to cross to the town to study.',
    bodyFil: [
      'Ang pinakamalaking gastos ng isang estudyante sa isla ay hindi matrikula kundi pamasahe. Ang sinumang nag-aaral sa bayan ay kailangang tumawid, at may mga araw na hindi bumibiyahe ang bangka.',
      'Layunin ng programa na tulungan ang mga pamilyang ito. Ang mga detalye ng aplikasyon ay ipapaskil sa barangay hall.',
    ],
    bodyEn: [
      "A student's largest expense on this island is not tuition, it is the fare. Anyone studying in the town has to cross, and there are days when the boat does not sail.",
      'The programme is meant to help those families. Application details will be posted at the barangay hall.',
    ],
    image: IMG.cove2,
    publishedAt: new Date('2026-07-22T10:00:00+08:00'),
  },
  {
    slug: 'tagumpay-ang-clean-up-sa-baybayin',
    kind: 'news',
    categoryFil: 'Kalikasan',
    categoryEn: 'Environment',
    titleFil: `Tagumpay ang clean-up sa baybayin ${SAMPLE_TAG}`,
    titleEn: `Coastal clean-up a success ${SAMPLE_TAG}`,
    leadFil:
      'Nilinis ng mga residente at kabataan ang bahagi ng baybayin na pinakamadalas maipunan ng basurang dala ng alon.',
    leadEn:
      'Residents and young people cleared the stretch of shoreline where wave-borne rubbish collects most.',
    bodyFil: [
      'Karamihan sa nakolektang basura ay plastik na hindi galing sa isla — dala ito ng agos at alon mula sa malayo. Naiipon ito sa parehong bahagi ng baybayin sa tuwing lumalakas ang hangin.',
      'Napagkasunduang ulitin ang paglilinis bago magsimula ang amihan, kung kailan mas malakas ang paghahatid ng alon.',
    ],
    bodyEn: [
      'Most of what was collected was plastic that did not come from the island — the current and the waves carry it in from far off. It gathers on the same stretch of shore whenever the wind picks up.',
      'It was agreed to repeat the clean-up before the amihan season begins, when the waves deliver more of it.',
    ],
    image: IMG.pantalanThumb,
    publishedAt: new Date('2026-07-12T07:00:00+08:00'),
  },

  /* ── Events ───────────────────────────────────────────────────────────
     Deliberately BOTH upcoming and past relative to a mid-2026 build, so the
     events index has something in each of its two sections and neither
     renders as an empty state that nobody has ever seen. */

  {
    slug: 'medical-mission-agosto',
    kind: 'event',
    categoryFil: 'Kalusugan',
    categoryEn: 'Health',
    titleFil: `Medical mission ${SAMPLE_TAG}`,
    titleEn: `Medical mission ${SAMPLE_TAG}`,
    leadFil: 'Libreng konsultasyon at gamot para sa lahat ng residente.',
    leadEn: 'Free consultation and medicines for all residents.',
    bodyFil: [
      'Bukas sa lahat ng residente. Magdala ng anumang ID at ng listahan ng mga gamot na iniinom ninyo ngayon.',
      'Mauna ang mga buntis, may sakit, at may edad.',
    ],
    bodyEn: [
      'Open to all residents. Bring any ID and a list of the medicines you are currently taking.',
      'Pregnant women, the unwell and the elderly are seen first.',
    ],
    image: IMG.falls,
    publishedAt: new Date('2026-08-01T09:00:00+08:00'),
    startsAt: new Date('2026-08-15T08:00:00+08:00'),
    timeLabel: '8:00 AM – 12:00 NN',
    locationFil: 'Barangay Covered Court',
    locationEn: 'Barangay Covered Court',
  },
  {
    slug: 'barangay-assembly-agosto',
    kind: 'event',
    categoryFil: 'Anunsyo',
    categoryEn: 'Notice',
    titleFil: `Barangay assembly ${SAMPLE_TAG}`,
    titleEn: `Barangay assembly ${SAMPLE_TAG}`,
    leadFil: 'Bukas na pulong para sa lahat ng residente ng barangay.',
    leadEn: 'An open meeting for every resident of the barangay.',
    bodyFil: [
      'Tatalakayin ang mga proyektong isinasagawa at ang paggamit ng pondo ng barangay. May panahon para sa tanong mula sa mga dumalo.',
      'Ang assembly ang paraan kung paano nakakapagsalita ang mga residente sa mga desisyong may kinalaman sa kanila. Kung may itatanong kayo, ito ang lugar.',
    ],
    bodyEn: [
      'The projects under way and the use of barangay funds are discussed, with time set aside for questions from those attending.',
      'The assembly is how residents get a say in decisions that affect them. If you have a question, this is the place for it.',
    ],
    image: IMG.shore,
    publishedAt: new Date('2026-08-03T09:00:00+08:00'),
    startsAt: new Date('2026-08-20T14:00:00+08:00'),
    timeLabel: '2:00 PM – 4:00 PM',
    locationFil: 'Barangay Hall',
    locationEn: 'Barangay Hall',
  },
  {
    slug: 'clean-up-sa-baybayin-setyembre',
    kind: 'event',
    categoryFil: 'Kalikasan',
    categoryEn: 'Environment',
    titleFil: `Clean-up sa baybayin ${SAMPLE_TAG}`,
    titleEn: `Coastal clean-up ${SAMPLE_TAG}`,
    leadFil: 'Sama-samang paglilinis ng baybayin bago magsimula ang amihan.',
    leadEn: 'A community clean-up of the shoreline before the amihan season starts.',
    bodyFil: [
      'Magdala ng guwantes kung mayroon kayo, at ng sarili ninyong tubig. Ilalaan ang mga sako.',
      'Tatapusin bago tumaas ang init ng araw.',
    ],
    bodyEn: [
      'Bring gloves if you have them, and your own drinking water. Sacks will be provided.',
      'It finishes before the heat of the day.',
    ],
    image: IMG.cove1,
    publishedAt: new Date('2026-08-04T09:00:00+08:00'),
    startsAt: new Date('2026-09-02T06:00:00+08:00'),
    timeLabel: '6:00 AM – 9:00 AM',
    locationFil: 'Baybayin ng Tumbod',
    locationEn: 'Tumbod shoreline',
  },
  {
    slug: 'libreng-bakuna-setyembre',
    kind: 'event',
    categoryFil: 'Kalusugan',
    categoryEn: 'Health',
    titleFil: `Libreng bakuna ${SAMPLE_TAG}`,
    titleEn: `Free vaccination ${SAMPLE_TAG}`,
    leadFil: 'Regular na iskedyul ng pagbabakuna sa health station.',
    leadEn: 'The regular vaccination schedule at the health station.',
    bodyFil: [
      'Dalhin ang health record ng bata kung mayroon. Kung nawala ito, sabihin lamang sa health worker — matutulungan kayong itala muli.',
      'Walang bayad.',
    ],
    bodyEn: [
      "Bring the child's health record if you have it. If it has been lost, tell the health worker — they will help you re-register.",
      'There is no charge.',
    ],
    image: IMG.cove2,
    publishedAt: new Date('2026-08-04T09:00:00+08:00'),
    startsAt: new Date('2026-09-10T08:00:00+08:00'),
    timeLabel: '8:00 AM – 12:00 NN',
    locationFil: 'Barangay Health Station',
    locationEn: 'Barangay Health Station',
  },
  {
    slug: 'pagsasanay-sa-bagyo',
    kind: 'event',
    categoryFil: 'Kaligtasan',
    categoryEn: 'Safety',
    titleFil: `Pagsasanay sa paglikas kapag bagyo ${SAMPLE_TAG}`,
    titleEn: `Typhoon evacuation drill ${SAMPLE_TAG}`,
    leadFil:
      'Pagsasanay kung saan pupunta at ano ang dadalhin kapag may paparating na bagyo.',
    leadEn: 'A drill on where to go and what to bring when a typhoon is coming.',
    bodyFil: [
      'Dumalo ang mga pamilya mula sa bawat purok. Nilakad ang aktwal na ruta papunta sa lilikasan upang malaman ng bawat isa ang daan kahit gabi o umuulan.',
      'Ang buong checklist bago ang bagyo ay nasa pahinang Ligtas.',
    ],
    bodyEn: [
      'Families from every purok took part. The actual route to the evacuation site was walked, so that everyone knows the way even at night or in rain.',
      'The full pre-typhoon checklist is on the Safety page.',
    ],
    image: IMG.shore,
    publishedAt: new Date('2026-05-20T09:00:00+08:00'),
    startsAt: new Date('2026-05-30T08:00:00+08:00'),
    timeLabel: '8:00 AM – 11:00 AM',
    locationFil: 'Barangay Hall at mga purok',
    locationEn: 'Barangay Hall and the puroks',
  },
  {
    slug: 'brigada-eskwela',
    kind: 'event',
    categoryFil: 'Edukasyon',
    categoryEn: 'Education',
    titleFil: `Brigada Eskwela ${SAMPLE_TAG}`,
    titleEn: `Brigada Eskwela ${SAMPLE_TAG}`,
    leadFil: 'Paglilinis at pagkukumpuni ng paaralan bago magbukas ang klase.',
    leadEn: 'Cleaning and repairing the school before classes open.',
    bodyFil: [
      'Nilinis ang mga silid-aralan, inayos ang mga upuan, at pininturahan ang bahagi ng gusaling kinakalawang na.',
      'Salamat sa mga magulang at residenteng dumalo.',
    ],
    bodyEn: [
      'Classrooms were cleaned, chairs repaired, and the parts of the building that had begun to rust were repainted.',
      'Thanks to the parents and residents who came.',
    ],
    image: IMG.cove2,
    publishedAt: new Date('2026-06-28T09:00:00+08:00'),
    startsAt: new Date('2026-07-05T07:00:00+08:00'),
    timeLabel: '7:00 AM – 12:00 NN',
    locationFil: 'Tumbod Elementary School',
    locationEn: 'Tumbod Elementary School',
  },
]

/* ── Selectors ──────────────────────────────────────────────────────────
   One place that knows what "upcoming" means, so a list, a panel and a badge
   can never disagree about whether an event has happened. */

/* Everything in THIS file is demonstration content by definition, so the flag
   is stamped on at the exit rather than repeated on eleven literals where one
   could be forgotten. */
export const SAMPLE_NEWS: readonly Article[] = SAMPLE_ARTICLES.filter((a) => a.kind === 'news')
  .map((a) => ({ ...a, isSample: true }))
  .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

export const SAMPLE_EVENT_ARTICLES: readonly Article[] = SAMPLE_ARTICLES.filter(
  (a) => a.kind === 'event',
).map((a) => ({ ...a, isSample: true }))

/** An event is upcoming until the day it starts is over — not until the hour
 *  it starts. Someone checking at 10am for a 9am assembly should still be told
 *  it is today, rather than being shown it under "past" as though they missed
 *  a whole thing. */
export function isUpcoming(a: Article, now: Date = BUILD_NOW): boolean {
  if (!a.startsAt) return false
  const endOfDay = new Date(a.startsAt)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime() >= now.getTime()
}

export const UPCOMING_EVENTS: readonly Article[] = SAMPLE_EVENT_ARTICLES
  .filter((a) => isUpcoming(a))
  .sort((a, b) => (a.startsAt?.getTime() ?? 0) - (b.startsAt?.getTime() ?? 0))

export const PAST_EVENTS: readonly Article[] = SAMPLE_EVENT_ARTICLES
  .filter((a) => !isUpcoming(a))
  .sort((a, b) => (b.startsAt?.getTime() ?? 0) - (a.startsAt?.getTime() ?? 0))

/** The URL an article lives at, for a given locale. The single source — a
 *  hard-coded `/balita/` in a template is how a link rots. */
export function articleHref(a: Article, locale: 'fil' | 'en'): string {
  const p = locale === 'fil' ? '' : '/en'
  return `${p}/${a.kind === 'event' ? 'kaganapan' : 'balita'}/${a.slug}`
}

export function findArticle(slug: string): Article | undefined {
  return SAMPLE_ARTICLES.find((a) => a.slug === slug)
}
