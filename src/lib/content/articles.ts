/**
 * The article set the site actually renders — database first, samples second.
 *
 * ONE RULE, and everything here follows from it:
 *
 *   If the barangay has published something, that is what the website shows.
 *   Only when it has published nothing does the sample content appear.
 *
 * This is the module that makes /admin publish. `cms/build.ts` does the
 * fetching; this decides what the pages get, maps database rows onto the shape
 * the views already render, and carries the "is this real or a sample?" flag
 * that drives the SAMPLE DATA chips.
 *
 * WHY THE MAPPING LIVES HERE AND NOT IN THE VIEWS. Three templates render
 * articles — the news list, the events list and the detail page — plus the
 * News mega panel. If each mapped `title_fil` → title itself, a schema change
 * would need four correct edits. They all call this instead, and the database
 * shape is known in exactly one file.
 */

import {
  type Article,
  type ArticleImage,
  SAMPLE_NEWS,
  SAMPLE_EVENT_ARTICLES,
  isUpcoming,
} from './sample-news'
import { published, useRows } from '@/lib/cms/build'

/* ── Row shapes, as the tables actually are ─────────────────────────────
   Mirrors `information_schema` for `announcements` and `events`. Note what
   `events` does NOT have: no slug, no body, no image. That is not an omission
   to be papered over — see `eventSlug` and the empty-body handling below. */

interface AnnouncementRow {
  id: string
  slug: string | null
  category: string | null
  title_fil: string | null
  title_en: string | null
  excerpt_fil: string | null
  excerpt_en: string | null
  body_fil: string | null
  body_en: string | null
  image_url: string | null
  published_at: string
  is_featured: boolean | null
  is_sample: boolean | null
}

interface EventRow {
  id: string
  title_fil: string | null
  title_en: string | null
  starts_at: string
  time_label: string | null
  location_fil: string | null
  location_en: string | null
  is_sample: boolean | null
}

const CATEGORY: Record<string, { fil: string; en: string }> = {
  anunsyo: { fil: 'Anunsyo', en: 'Notice' },
  kalusugan: { fil: 'Kalusugan', en: 'Health' },
  ayuda: { fil: 'Ayuda', en: 'Aid' },
  babala: { fil: 'Babala', en: 'Warning' },
  ordinansa: { fil: 'Ordinansa', en: 'Ordinance' },
  kaganapan: { fil: 'Kaganapan', en: 'Event' },
}

/**
 * Paragraphs from a text column.
 *
 * The body fields are markdown in the admin editor. This does NOT render
 * markdown — it splits on blank lines and returns plain strings, which the
 * views print with `textContent` semantics.
 *
 * That is deliberate and it is a security decision, not a laziness one. An
 * announcement is typed by a person into a form; rendering it as HTML would
 * make a stored `<script>` run on every visitor to a government website. The
 * cost is that `**bold**` shows as asterisks. Worth it. If rich text is wanted
 * later, the answer is a sanitising renderer, never `set:html`.
 */
function paragraphs(text: string | null): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** URL-safe slug from a title. Keeps ASCII letters, digits and dashes. */
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'kaganapan'
  )
}

/**
 * A stable, unique slug for an event.
 *
 * The `events` table has no slug column — the admin form never asked for one,
 * because until today events had no pages. Two events called "Barangay
 * assembly" would collide, and a colliding slug means one of them silently
 * overwrites the other's page at build time.
 *
 * So the date is part of the slug: `barangay-assembly-2026-08-20`. It is
 * unique in practice, it is readable, and it stays the same across rebuilds —
 * which matters because a slug that changes is a shared link that dies.
 */
function eventSlug(row: EventRow): string {
  const title = row.title_fil ?? row.title_en ?? 'kaganapan'
  const day = String(row.starts_at).slice(0, 10)
  return `${slugify(title)}-${day}`
}

/** Images from the CMS have no stored dimensions, so width/height are omitted
 *  and the CSS aspect-ratio reserves the box instead. See ArticleImage. */
function image(url: string | null, altFil: string, altEn: string): ArticleImage | undefined {
  if (!url) return undefined
  return { src: url, thumb: url, altFil, altEn }
}

function fromAnnouncement(row: AnnouncementRow): Article {
  const titleFil = row.title_fil ?? row.title_en ?? 'Walang pamagat'
  const titleEn = row.title_en ?? row.title_fil ?? 'Untitled'
  const cat = CATEGORY[row.category ?? 'anunsyo'] ?? CATEGORY['anunsyo']!

  return {
    // A published row with no slug would otherwise build to `/balita/`, i.e.
    // over the index page. Fall back to the id — ugly, but addressable.
    slug: row.slug?.trim() || row.id,
    kind: 'news',
    categoryFil: cat.fil,
    categoryEn: cat.en,
    titleFil,
    titleEn,
    leadFil: row.excerpt_fil ?? '',
    leadEn: row.excerpt_en ?? row.excerpt_fil ?? '',
    bodyFil: paragraphs(row.body_fil),
    bodyEn: paragraphs(row.body_en ?? row.body_fil),
    ...(image(row.image_url, titleFil, titleEn) ? { image: image(row.image_url, titleFil, titleEn)! } : {}),
    publishedAt: new Date(row.published_at),
    isSample: row.is_sample === true,
  }
}

function fromEvent(row: EventRow): Article {
  const titleFil = row.title_fil ?? row.title_en ?? 'Walang pamagat'
  const titleEn = row.title_en ?? row.title_fil ?? 'Untitled'
  const starts = new Date(row.starts_at)

  /*
   * Events carry no body in the schema, so the detail page would be a headline
   * over three facts. Rather than render a page that looks broken, the facts
   * ARE the content: the lead states date and place in a sentence, and the
   * fact list below it repeats them in a scannable form. A reader gets a
   * complete answer to "when and where", which is what an event page is for.
   */
  const place = row.location_fil ?? row.location_en ?? ''

  return {
    slug: eventSlug(row),
    kind: 'event',
    categoryFil: 'Kaganapan',
    categoryEn: 'Event',
    titleFil,
    titleEn,
    leadFil: place ? `Gaganapin sa ${place}.` : 'Kaganapan sa barangay.',
    leadEn: place ? `To be held at ${place}.` : 'A barangay event.',
    bodyFil: [],
    bodyEn: [],
    publishedAt: starts,
    startsAt: starts,
    ...(row.time_label ? { timeLabel: row.time_label } : {}),
    ...(row.location_fil ? { locationFil: row.location_fil } : {}),
    ...(row.location_en ? { locationEn: row.location_en } : {}),
    isSample: row.is_sample === true,
  }
}

/* ── Resolution ─────────────────────────────────────────────────────────
   News and events fall back INDEPENDENTLY. A barangay that has published
   announcements but not yet any events should see its real news beside sample
   events, not have its real news suppressed because another table is empty. */

export interface ArticleSet {
  readonly items: readonly Article[]
  /**
   * True when ANY item in the set is demonstration content — it drives the one
   * chip that sits on a list heading.
   *
   * A per-list flag cannot describe a mixed list precisely, and a mixed list is
   * a real state: the barangay might publish one genuine announcement beside
   * five seeded samples. The chip is deliberately pessimistic — "there is
   * sample data in this column" is honest about a mixed list, whereas hiding
   * it because one row was real would not be. The DETAIL page has no such
   * problem: it shows one article and reads that article's own flag.
   */
  readonly isSample: boolean
}

const anySample = (items: readonly Article[]) => items.some((a) => a.isSample)

let newsCache: Promise<ArticleSet> | undefined
let eventsCache: Promise<ArticleSet> | undefined

export function getNews(): Promise<ArticleSet> {
  newsCache ??= (async () => {
    const rows = await published<AnnouncementRow>('announcements', 'published_at.desc')
    if (!useRows(rows)) return { items: SAMPLE_NEWS, isSample: true }
    const items = rows.map(fromAnnouncement)
    return { items, isSample: anySample(items) }
  })()
  return newsCache
}

export function getEvents(): Promise<ArticleSet> {
  eventsCache ??= (async () => {
    const rows = await published<EventRow>('events', 'starts_at.asc')
    if (!useRows(rows)) return { items: SAMPLE_EVENT_ARTICLES, isSample: true }
    const items = rows.map(fromEvent)
    return { items, isSample: anySample(items) }
  })()
  return eventsCache
}

/** Every article that needs a page built. */
export async function getAllArticles(): Promise<readonly Article[]> {
  const [news, events] = await Promise.all([getNews(), getEvents()])
  return [...news.items, ...events.items]
}

export async function getUpcomingEvents(): Promise<ArticleSet> {
  const set = await getEvents()
  const items = set.items
    .filter((e) => isUpcoming(e))
    .sort((a, b) => (a.startsAt?.getTime() ?? 0) - (b.startsAt?.getTime() ?? 0))
  // Recomputed from the SLICE, not inherited from the whole set. A past
  // section holding only real events should not wear a chip because some
  // upcoming one is a sample.
  return { items, isSample: anySample(items) }
}

export async function getPastEvents(): Promise<ArticleSet> {
  const set = await getEvents()
  const items = set.items
    .filter((e) => !isUpcoming(e))
    .sort((a, b) => (b.startsAt?.getTime() ?? 0) - (a.startsAt?.getTime() ?? 0))
  return { items, isSample: anySample(items) }
}
