/**
 * The rest of the site, wired to the CMS.
 *
 * `articles.ts` handles news and events, which need slugs and detail pages.
 * This module handles the collections that are plain lists — projects,
 * officials, hotlines, tourism, businesses, FAQs, the gallery.
 *
 * SAME RULE AS EVERYWHERE: database first, checked-in content second, and a
 * failure to reach the database is silently equivalent to "nothing published".
 * Every getter here resolves; none of them can throw a build.
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY THESE PAGES WERE EMPTY.
 *
 * `active.ts` reads: `export const PROJECTS = IS_DEMO ? demo.DEMO_PROJECTS : []`
 * — and the same for attractions, businesses and the FAQ. Outside demo mode
 * they are literally empty arrays, so /proyekto, /turismo, /negosyo and /faq
 * rendered their empty states no matter what the barangay had published. The
 * database held five projects, three attractions and five FAQs at the time
 * this was written, all published, all readable by the anon key.
 *
 * That is the same bug as the news one, four more times.
 * ─────────────────────────────────────────────────────────────────
 *
 * ON HOTLINES, WHICH ARE DIFFERENT.
 *
 * A wrong hotline number during a typhoon is the worst thing this site can do.
 * Two protections, and neither is optional:
 *
 *   1. The checked-in `REAL_HOTLINES` remain the fallback. If the database is
 *      unreachable at build time, /ligtas/hotline ships the verified numbers
 *      it has always shipped. There is no state in which that page has no
 *      numbers because a CMS was down.
 *   2. `verified_at` and `verified_by` travel with the row. A number nobody
 *      will vouch for is not a number to publish, and the page already renders
 *      that provenance.
 *
 * The build-time fetch does NOT weaken the zero-third-party guarantee on
 * /ligtas (ARCHITECTURE.md §22.3). That rule is about what the BROWSER
 * requests. This request happens on the build machine; the browser receives
 * static HTML and contacts nobody.
 */

import type { Hotline } from './types'
import type { Attraction, Business, Faq } from './demo-pages'
import type { DemoProject } from './demo'
import {
  HOTLINES as FALLBACK_HOTLINES,
  PROJECTS as FALLBACK_PROJECTS,
  ATTRACTIONS as FALLBACK_ATTRACTIONS,
  BUSINESSES as FALLBACK_BUSINESSES,
  FAQ as FALLBACK_FAQ,
} from './active'
import { needsData } from './placeholder'
import { published, useRows } from '@/lib/cms/build'

/** A list plus whether any of it is demonstration content. */
export interface LiveList<T> {
  readonly items: readonly T[]
  readonly isSample: boolean
}

const anySample = (rows: readonly { is_sample?: boolean | null }[]) =>
  rows.some((r) => r.is_sample === true)

/** Memoises a resolver so 75 pages share one fetch. */
function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined
  return () => (cached ??= fn())
}

/* ── Projects ──────────────────────────────────────────────────────── */

interface ProjectRow {
  id: string
  title_fil: string | null
  title_en: string | null
  status: string | null
  percent: number | null
  budget: string | null
  fund_source: string | null
  is_sample: boolean | null
}

/**
 * A project, plus the id its evidence photographs hang off.
 *
 * `DemoProject` has no id — it was a display shape for two hard-coded demo
 * rows. Evidence needs to be joined to something, so the live shape carries
 * the primary key. `id` is optional because the checked-in fallback projects
 * genuinely have none, and a fallback project simply has no photographs.
 */
export interface ProjectItem extends DemoProject {
  readonly id?: string
}

export const getProjects = once(async (): Promise<LiveList<ProjectItem>> => {
  const rows = await published<ProjectRow>('projects', 'sort_order.asc')
  if (!useRows(rows)) return { items: FALLBACK_PROJECTS, isSample: FALLBACK_PROJECTS.length > 0 }
  return {
    items: rows.map((r) => ({
      id: r.id,
      title: r.title_fil ?? r.title_en ?? '',
      status: r.status ?? '',
      // `percent` drives a progress bar width. A null would render `width:
      // NaN%`, which browsers treat as 0 — a finished project shown as not
      // started. Clamped, because a stray 150 would overflow its track.
      percent: Math.max(0, Math.min(100, r.percent ?? 0)),
      budget: r.budget ?? '',
      fund: r.fund_source ?? '',
    })),
    isSample: anySample(rows),
  }
})

/* ── Project evidence photographs ──────────────────────────────────── */

export type ProjectStage = 'bago' | 'ginagawa' | 'tapos'

export interface ProjectPhoto {
  readonly projectId: string
  readonly src: string
  readonly captionFil: string
  readonly captionEn: string
  readonly altFil: string
  readonly altEn: string
  readonly stage: ProjectStage
  readonly takenAt: Date | null
  readonly isSample: boolean
}

interface ProjectPhotoRow {
  project_id: string
  image_url: string | null
  caption_fil: string | null
  caption_en: string | null
  alt_fil: string | null
  alt_en: string | null
  stage: string | null
  taken_at: string | null
  is_sample: boolean | null
}

const STAGES: readonly ProjectStage[] = ['bago', 'ginagawa', 'tapos']

/** Stage order for display: the story reads before → during → after. */
const STAGE_RANK: Record<ProjectStage, number> = { bago: 0, ginagawa: 1, tapos: 2 }

/**
 * Evidence photographs, grouped by project id.
 *
 * Returns a Map so a view can ask for one project's photographs in constant
 * time inside a loop, rather than filtering the whole array per project — the
 * projects page renders every project, and the quadratic version is the kind
 * of thing that only shows up once the barangay has fifty of them.
 */
export const getProjectPhotos = once(async (): Promise<Map<string, ProjectPhoto[]>> => {
  const rows = await published<ProjectPhotoRow>('project_photos', 'sort_order.asc')
  const byProject = new Map<string, ProjectPhoto[]>()
  if (!useRows(rows)) return byProject

  for (const r of rows) {
    // A row with no image is not evidence. The column is NOT NULL, but the
    // admin writes an empty string when the picker is cleared and saved.
    if (!r.image_url) continue

    const stage = (STAGES as readonly string[]).includes(r.stage ?? '')
      ? (r.stage as ProjectStage)
      : 'ginagawa'

    const caption = r.caption_fil ?? r.caption_en ?? ''
    const photo: ProjectPhoto = {
      projectId: r.project_id,
      src: r.image_url,
      captionFil: caption,
      captionEn: r.caption_en ?? r.caption_fil ?? '',
      // Alt falls back to the caption, never to empty. An empty alt tells a
      // screen reader "decorative", which is a lie about a photograph that
      // exists specifically to be examined as proof.
      altFil: r.alt_fil ?? caption,
      altEn: r.alt_en ?? r.caption_en ?? r.alt_fil ?? caption,
      stage,
      takenAt: r.taken_at ? new Date(r.taken_at) : null,
      isSample: r.is_sample === true,
    }

    const list = byProject.get(r.project_id)
    if (list) list.push(photo)
    else byProject.set(r.project_id, [photo])
  }

  for (const list of byProject.values()) {
    list.sort((a, b) => {
      const s = STAGE_RANK[a.stage] - STAGE_RANK[b.stage]
      if (s !== 0) return s
      return (a.takenAt?.getTime() ?? 0) - (b.takenAt?.getTime() ?? 0)
    })
  }

  return byProject
})

/* ── Officials — DELIBERATELY NOT WIRED ─────────────────────────────
 *
 * There is no `getOfficials` here, and that is a decision rather than an
 * omission.
 *
 * `fallback.ts` does not hold a flat list. It holds
 * `Record<string, readonly Official[]>` — the roster GROUPED by body:
 * `sangguniang_barangay`, `sangguniang_kabataan`, and so on. The database has
 * a flat `officials` table with a free-text `committee` column, which is a
 * committee assignment ("Committee on Health"), not the body someone sits in.
 * There is no reliable mapping from one to the other, and guessing would file
 * an SK official under the Sangguniang Barangay on a government page.
 *
 * Against that risk, the benefit is close to zero. The checked-in roster is
 * the real, verified 2023–2026 slate (FINDINGS-2026-08-05.md), and a barangay
 * roster changes once every three years — at which point editing one file is
 * a perfectly good workflow, and one that gets reviewed.
 *
 * To wire it properly, add a `body` column to `officials`, populate it, and
 * group on that. Do not group on `committee`.
 * ─────────────────────────────────────────────────────────────────── */

/* ── Hotlines ──────────────────────────────────────────────────────── */

interface HotlineRow {
  id: string
  label_fil: string | null
  label_en: string | null
  number: string | null
  category: string | null
  verified_at: string | null
  verified_by: string | null
  is_sample: boolean | null
}

const HOTLINE_CATEGORIES = ['barangay', 'disaster', 'health', 'maritime', 'police'] as const
type HotlineCategory = (typeof HOTLINE_CATEGORIES)[number]

const asCategory = (v: string | null): HotlineCategory =>
  (HOTLINE_CATEGORIES as readonly string[]).includes(v ?? '')
    ? (v as HotlineCategory)
    : 'barangay'

export const getHotlines = once(async (): Promise<LiveList<Hotline>> => {
  const rows = await published<HotlineRow>('hotlines', 'sort_order.asc')
  if (!useRows(rows)) return { items: FALLBACK_HOTLINES, isSample: false }
  return {
    items: rows.map((r) => ({
      id: r.id,
      labelFil: r.label_fil ?? r.label_en ?? '',
      labelEn: r.label_en ?? r.label_fil ?? '',
      /*
       * A hotline row with a NULL number becomes an auditable placeholder, not
       * an empty string.
       *
       * `Maybe<string>` exists precisely so "we do not have this number" is a
       * value the type system knows about: it renders as a visible
       * [[NEEDS DATA]] chip, it is counted by `check-placeholders.mjs`, and
       * marked launch-blocking it fails the production build while it is
       * reachable. An empty string would render as a blank space next to
       * "Coast Guard" on the emergency page — indistinguishable from a number
       * that failed to load, and invisible to every audit.
       */
      number: r.number ?? needsData(`numero ng ${r.label_fil ?? r.label_en ?? 'hotline'}`, 'Barangay Secretary', true),
      category: asCategory(r.category),
      verifiedAt: r.verified_at ? new Date(r.verified_at) : null,
      ...(r.verified_by ? { verifiedBy: r.verified_by } : {}),
      // Always true, and not read from the row: the RLS policy on `hotlines`
      // is `active AND deleted_at IS NULL`, so an inactive number is not
      // something the anon key can see. Anything that arrives here is active
      // by definition. Reading a column that cannot be false would imply a
      // check that is not happening.
      active: true,
    })),
    isSample: anySample(rows),
  }
})

/* ── Tourism ───────────────────────────────────────────────────────── */

interface AttractionRow {
  name_fil: string | null
  name_en: string | null
  description_fil: string | null
  description_en: string | null
  getting_there_fil: string | null
  getting_there_en: string | null
  is_sample: boolean | null
}

export const getAttractions = once(async (): Promise<LiveList<Attraction>> => {
  const rows = await published<AttractionRow>('attractions', 'sort_order.asc')
  if (!useRows(rows))
    return { items: FALLBACK_ATTRACTIONS, isSample: FALLBACK_ATTRACTIONS.length > 0 }
  return {
    items: rows.map((r) => ({
      nameFil: r.name_fil ?? r.name_en ?? '',
      nameEn: r.name_en ?? r.name_fil ?? '',
      bodyFil: r.description_fil ?? '',
      bodyEn: r.description_en ?? r.description_fil ?? '',
      gettingThereFil: r.getting_there_fil ?? '',
      gettingThereEn: r.getting_there_en ?? r.getting_there_fil ?? '',
    })),
    isSample: anySample(rows),
  }
})

/* ── Businesses ────────────────────────────────────────────────────── */

interface BusinessRow {
  name: string | null
  kind_fil: string | null
  kind_en: string | null
  purok: string | null
  is_sample: boolean | null
}

export const getBusinesses = once(async (): Promise<LiveList<Business>> => {
  const rows = await published<BusinessRow>('businesses', 'sort_order.asc')
  if (!useRows(rows))
    return { items: FALLBACK_BUSINESSES, isSample: FALLBACK_BUSINESSES.length > 0 }
  return {
    items: rows.map((r) => ({
      name: r.name ?? '',
      kindFil: r.kind_fil ?? r.kind_en ?? '',
      kindEn: r.kind_en ?? r.kind_fil ?? '',
      purok: r.purok ?? '',
    })),
    isSample: anySample(rows),
  }
})

/* ── FAQ ───────────────────────────────────────────────────────────── */

interface FaqRow {
  question_fil: string | null
  question_en: string | null
  answer_fil: string | null
  answer_en: string | null
  is_sample: boolean | null
}

export const getFaqs = once(async (): Promise<LiveList<Faq>> => {
  const rows = await published<FaqRow>('faqs', 'sort_order.asc')
  if (!useRows(rows)) return { items: FALLBACK_FAQ, isSample: FALLBACK_FAQ.length > 0 }
  return {
    items: rows.map((r) => ({
      qFil: r.question_fil ?? r.question_en ?? '',
      qEn: r.question_en ?? r.question_fil ?? '',
      aFil: r.answer_fil ?? '',
      aEn: r.answer_en ?? r.answer_fil ?? '',
    })),
    isSample: anySample(rows),
  }
})

/* ── Gallery ───────────────────────────────────────────────────────── */

export interface GalleryPhoto {
  readonly src: string
  readonly captionFil: string
  readonly captionEn: string
  readonly altFil: string
  readonly altEn: string
}

interface GalleryRow {
  image_url: string | null
  caption_fil: string | null
  caption_en: string | null
  alt_fil: string | null
  alt_en: string | null
  has_consent: boolean | null
  is_sample: boolean | null
}

export const getGallery = once(async (): Promise<LiveList<GalleryPhoto>> => {
  const rows = await published<GalleryRow>('gallery', 'sort_order.asc')
  if (!useRows(rows)) return { items: [], isSample: false }
  return {
    items: rows
      // A row with no image is not a photograph. The admin form marks the
      // field required, but a required field in a form is a courtesy, not a
      // constraint — the column is nullable.
      .filter((r) => Boolean(r.image_url))
      .map((r) => ({
        src: r.image_url!,
        captionFil: r.caption_fil ?? '',
        captionEn: r.caption_en ?? r.caption_fil ?? '',
        // Alt text falls back to the caption rather than to empty. An empty
        // alt tells a screen reader "this image is decorative", which is a lie
        // about a photograph of the place someone came here to see.
        altFil: r.alt_fil ?? r.caption_fil ?? '',
        altEn: r.alt_en ?? r.caption_en ?? r.alt_fil ?? '',
      })),
    isSample: anySample(rows),
  }
})

/* ── Site settings ─────────────────────────────────────────────────────
 *
 * THE TABLE NOTHING READ. `site_settings` has existed, been editable in
 * /admin, and been fetchable by the anon key for as long as the CMS has — and
 * no page ever asked for it. The barangay could type its hall address and
 * office hours into the admin and the website would keep printing
 * [[NEEDS DATA]] on 74 pages, because those two facts were hardcoded
 * placeholders in `site.ts`.
 *
 * It is one row, `id = 1`, and RLS makes it world-readable (`settings are
 * public` USING true), so there is nothing to filter and no draft state to
 * respect. `published()` cannot be used: that helper leans on the
 * is_published/deleted_at policy shape this table does not have.
 * ──────────────────────────────────────────────────────────────────── */

import { resolveAdvisory, UNKNOWN_ADVISORY, type SeaAdvisory, type SettingsRow } from './sea-advisory'
import { rows as rawRows } from '@/lib/cms/build'

export interface SiteSettings {
  readonly addressFil: string | null
  readonly addressEn: string | null
  readonly officeHoursFil: string | null
  readonly officeHoursEn: string | null
  readonly phone: string | null
  readonly email: string | null
  readonly advisory: SeaAdvisory
  readonly isSample: boolean
}

interface SettingsFullRow extends SettingsRow {
  address_fil?: string | null
  address_en?: string | null
  office_hours_fil?: string | null
  office_hours_en?: string | null
  phone?: string | null
  email?: string | null
}

/**
 * A sample row yields NO contact facts.
 *
 * Elsewhere sample content renders with a visible chip, because seeing the
 * shape of a page is useful. An address and an office hour are different: a
 * resident who travels to a sample address has lost a boat fare and a morning.
 * So the placeholder machinery keeps its turn instead — it at least says
 * plainly that the real value is not known yet.
 */
const realOrNull = (v: string | null | undefined, sample: boolean): string | null =>
  sample || !v || !v.trim() ? null : v.trim()

export const getSiteSettings = once(async (): Promise<SiteSettings> => {
  const list = await rawRows<SettingsFullRow>('site_settings', 'select=*&limit=1')
  const row = list && list.length > 0 ? list[0]! : null
  const sample = Boolean(row?.is_sample)

  return {
    addressFil: realOrNull(row?.address_fil, sample),
    addressEn: realOrNull(row?.address_en, sample),
    officeHoursFil: realOrNull(row?.office_hours_fil, sample),
    officeHoursEn: realOrNull(row?.office_hours_en, sample),
    phone: realOrNull(row?.phone, sample),
    email: realOrNull(row?.email, sample),
    advisory: row ? resolveAdvisory(row) : UNKNOWN_ADVISORY,
    isSample: sample,
  }
})
