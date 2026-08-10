/**
 * Barangay Tumbod CMS.
 *
 * Plain TypeScript against the DOM. No framework: this is a sidebar, a table
 * and a form, and React would be the heaviest dependency in the repository for
 * three screens that never need reconciliation.
 *
 * WHAT ENFORCES THE RULES IS POSTGRES, NOT THIS FILE. Every table has
 * row-level security; a bug here that tried to write something the signed-in
 * user may not write is refused by the database. Treat the UI as a convenience
 * over the policy, never as the policy.
 *
 * Screens: dashboard · collection list · record form · media library ·
 * hero slider · activity.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Collection, Field } from '@/lib/cms/collections'
import {
  el, txt, clear, $, icon, button, toast, confirmDialog, emptyState,
  skeleton, fmtDate, fmtRelative,
} from './ui'
import { initMedia, renderMediaLibrary, pickMedia, publicUrl, FOLDERS } from './media'
import { initContext } from './context'
import { renderAnalytics } from './screens/analytics'

interface AdminConfig {
  SUPABASE_URL: string
  SUPABASE_KEY: string
  COLLECTIONS: Collection[]
}

const cfg = (window as unknown as { __ADMIN__: AdminConfig }).__ADMIN__
const app = document.getElementById('app')!

if (!cfg?.SUPABASE_URL) {
  app.append(el('p', { class: 'a-err' }, 'Walang configuration. Tingnan ang .env.example.'))
  throw new Error('admin: missing configuration')
}

const sb: SupabaseClient = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY)
initMedia(sb, cfg.SUPABASE_URL)

/*
 * Hand the shared context to the extracted screens.
 *
 * This runs at module scope, immediately after the client exists and before
 * anything can render, so `sb()` inside a screen can never be called against a
 * null client. `navigate` is passed as a thunk because `go` is defined below —
 * and because a screen importing `go` directly would create the import cycle
 * (main → screen → main) that made the first extraction attempt fail.
 */
initContext({
  sb,
  collections: cfg.COLLECTIONS,
  navigate: (route: string) => go(route),
})

/** `#app` boots with `data-loading`, which forces `display:block`. Leaving it
    set means the two-column grid never engages and the sidebar paints over the
    content, swallowing every click. */
const ready = () => app.removeAttribute('data-loading')

/* ── Navigation model ─────────────────────────────────────────
   Grouped, because thirteen collections in one flat list is a scan every
   time. The groups match how the barangay talks about the work, not how the
   tables are named. */

interface NavEntry {
  id: string
  label: string
  icon: string
  /** Collection-backed entries carry a table; the rest are bespoke screens. */
  table?: string
}

const NAV: { group: string; items: NavEntry[] }[] = [
  {
    group: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'analytics', label: 'Bisita sa website', icon: 'activity' },
      { id: 'media', label: 'Media Library', icon: 'image' },
      { id: 'hero', label: 'Hero Slider', icon: 'slides' },
    ],
  },
  {
    group: 'Nilalaman',
    items: [
      { id: 'announcements', label: 'Balita', icon: 'megaphone', table: 'announcements' },
      { id: 'events', label: 'Kaganapan', icon: 'calendar', table: 'events' },
      { id: 'pages', label: 'Mga Pahina', icon: 'doc', table: 'pages' },
      { id: 'gallery', label: 'Larawan', icon: 'image', table: 'gallery' },
    ],
  },
  {
    group: 'Kaligtasan',
    items: [
      { id: 'advisories', label: 'Babala', icon: 'warning', table: 'advisories' },
      { id: 'hotlines', label: 'Emergency Numbers', icon: 'phone', table: 'hotlines' },
    ],
  },
  {
    group: 'Pamamahala',
    items: [
      { id: 'officials', label: 'Mga Opisyal', icon: 'shield', table: 'officials' },
      { id: 'projects', label: 'Proyekto', icon: 'build', table: 'projects' },
      { id: 'project_photos', label: 'Larawan ng Proyekto', icon: 'image', table: 'project_photos' },
      { id: 'forms', label: 'Mga Porma', icon: 'download', table: 'forms' },
      { id: 'faqs', label: 'Madalas Itanong', icon: 'help', table: 'faqs' },
    ],
  },
  {
    group: 'Komunidad',
    items: [
      { id: 'attractions', label: 'Turismo', icon: 'palm', table: 'attractions' },
      { id: 'businesses', label: 'Negosyo', icon: 'store', table: 'businesses' },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { id: 'activity', label: 'Aktibidad', icon: 'activity' },
      { id: 'site_settings', label: 'Mga Setting', icon: 'settings', table: 'site_settings' },
    ],
  },
]

const collectionFor = (table: string) => cfg.COLLECTIONS.find((c) => c.table === table)

/* ── App state ────────────────────────────────────────────────── */

interface State {
  route: string
  profile: { full_name: string | null; email: string; role: string } | null
  counts: Record<string, number>
  search: string
  sortBy: string | null
  sortAsc: boolean
  page: number
  perPage: number
  statusFilter: 'all' | 'live' | 'draft' | 'archived'
  selection: Set<string>
}

const state: State = {
  route: 'dashboard',
  profile: null,
  counts: {},
  search: '',
  sortBy: null,
  sortAsc: false,
  page: 1,
  perPage: 20,
  statusFilter: 'all',
  selection: new Set(),
}

/* ── Activity ─────────────────────────────────────────────────
   Best-effort. A failure to write the log must never fail the edit that
   caused it — the content is the point, the log is the record. */
async function log(action: string, table: string, recordId: string | null, summary: string) {
  try {
    await sb.from('activity_log').insert({
      actor_id: (await sb.auth.getUser()).data.user?.id ?? null,
      actor_email: state.profile?.email ?? null,
      action,
      table_name: table,
      record_id: recordId,
      summary,
    })
  } catch {
    /* ignore */
  }
}

/* ── Sign in ──────────────────────────────────────────────────── */

function renderLogin(message?: string) {
  ready()
  clear(app)
  app.className = ''

  const email = el('input', { class: 'a-input', type: 'email', id: 'a-email', required: true, autocomplete: 'username' }) as HTMLInputElement
  const pass = el('input', { class: 'a-input', type: 'password', id: 'a-pass', required: true, autocomplete: 'current-password' }) as HTMLInputElement
  const submit = el('button', { type: 'submit', class: 'a-btn a-btn--primary' }, 'Mag-sign in') as HTMLButtonElement

  const form = el(
    'form',
    { class: 'a-login' },
    el('span', { class: 'a-seal' }, 'BT'),
    txt('h1', 'a-logintitle', 'Barangay Tumbod'),
    txt('p', 'a-loginsub', 'Content Management System'),
    el('div', { class: 'a-field' }, txt('label', 'a-label', 'Email'), email),
    el('div', { class: 'a-field' }, txt('label', 'a-label', 'Password'), pass),
    submit,
    message ? txt('p', 'a-err', message) : null,
  )

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    submit.disabled = true
    submit.textContent = 'Sinusuri…'
    const { error } = await sb.auth.signInWithPassword({
      email: email.value.trim(),
      password: pass.value,
    })
    // Same message for a wrong password and an unknown address: telling an
    // attacker which addresses exist is free reconnaissance.
    if (error) renderLogin('Mali ang email o password.')
    else void boot()
  })

  app.append(el('div', { class: 'a-loginwrap' }, form))
}

/* ── Shell ────────────────────────────────────────────────────── */

function renderShell() {
  ready()
  clear(app)

  const side = el('aside', { class: 'a-side' })
  side.append(
    el(
      'div',
      { class: 'a-brand' },
      el('span', { class: 'a-seal' }, 'BT'),
      el('div', { class: 'a-brandtext' }, txt('span', 'a-brandname', 'Barangay Tumbod'), txt('span', 'a-brandsub', 'CMS')),
    ),
  )

  const nav = el('nav', { class: 'a-nav', id: 'a-nav' })
  for (const section of NAV) {
    if (section.group) nav.append(txt('p', 'a-navgroup', section.group))
    for (const item of section.items) {
      const b = el('button', { type: 'button', class: 'a-navitem', 'data-route': item.id })
      b.append(icon(item.icon, 17), el('span', {}, item.label))
      if (item.table) b.append(txt('span', 'a-navcount', state.counts[item.table] ?? ''))
      b.addEventListener('click', () => go(item.id))
      nav.append(b)
    }
  }
  side.append(nav)

  const initials = (state.profile?.full_name || state.profile?.email || '?')
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')

  side.append(
    el(
      'div',
      { class: 'a-who' },
      el('span', { class: 'a-avatar' }, initials),
      el(
        'div',
        { class: 'a-whotext' },
        txt('span', 'a-whoname', state.profile?.full_name || state.profile?.email),
        txt('span', 'a-whorole', state.profile?.role === 'admin' ? 'Administrator' : 'Editor'),
      ),
      button('', {
        variant: 'ghost',
        iconName: 'external',
        title: 'Mag-sign out',
        onClick: async () => {
          await sb.auth.signOut()
          renderLogin()
        },
      }),
    ),
  )

  const main = el(
    'div',
    { class: 'a-main' },
    el(
      'header',
      { class: 'a-topbar' },
      el('div', { class: 'a-crumbs', id: 'a-crumbs' }),
      el(
        'div',
        { class: 'a-topactions' },
        button('Tingnan ang website', {
          variant: 'ghost',
          iconName: 'eye',
          onClick: () => window.open('/', '_blank'),
        }),
      ),
    ),
    el('div', { class: 'a-content', id: 'a-content' }),
  )

  app.append(side, main)
}

function setActive() {
  for (const b of document.querySelectorAll('.a-navitem')) {
    b.classList.toggle('is-active', b.getAttribute('data-route') === state.route)
  }
}

function crumbs(...parts: string[]) {
  const host = $('#a-crumbs')
  if (!host) return
  clear(host)
  parts.forEach((p, i) => {
    if (i) host.append(txt('span', '', '/'))
    host.append(i === parts.length - 1 ? txt('strong', '', p) : txt('span', '', p))
  })
}

function go(route: string) {
  state.route = route
  state.search = ''
  state.page = 1
  state.sortBy = null
  state.statusFilter = 'all'
  state.selection.clear()
  setActive()
  void renderRoute()
}

async function renderRoute() {
  const host = $('#a-content')
  if (!host) return

  if (state.route === 'dashboard') return renderDashboard(host)
  if (state.route === 'media') {
    crumbs('CMS', 'Media Library')
    clear(host)
    host.append(
      el(
        'div',
        { class: 'a-pagehead' },
        el('div', {}, txt('h1', 'a-title', 'Media Library'),
          txt('p', 'a-subtitle', 'Lahat ng larawan at file ng website. Ang mga larawan ay awtomatikong pinapaliit at ginagawang WebP; itinatago ang orihinal.')),
      ),
    )
    const wrap = el('div', {})
    host.append(wrap)
    return renderMediaLibrary(wrap)
  }
  if (state.route === 'hero') return renderHero(host)
  if (state.route === 'activity') return renderActivity(host)
  if (state.route === 'analytics') return renderAnalytics(host)

  const col = collectionFor(state.route)
  if (col) return renderCollection(host, col)
}

/* ── Dashboard ────────────────────────────────────────────────── */

const STAT_CARDS: { table: string; label: string; icon: string; route: string; filter?: string }[] = [
  { table: 'announcements', label: 'Nakalathalang balita', icon: 'megaphone', route: 'announcements' },
  { table: 'events', label: 'Darating na kaganapan', icon: 'calendar', route: 'events' },
  { table: 'projects', label: 'Aktibong proyekto', icon: 'build', route: 'projects' },
  { table: 'attractions', label: 'Pasyalan', icon: 'palm', route: 'attractions' },
  { table: 'businesses', label: 'Negosyo', icon: 'store', route: 'businesses' },
  { table: 'gallery', label: 'Larawan sa gallery', icon: 'image', route: 'gallery' },
  { table: 'officials', label: 'Mga opisyal', icon: 'shield', route: 'officials' },
  { table: 'media', label: 'Media files', icon: 'folder', route: 'media' },
]

async function loadCounts() {
  const tables = [
    ...cfg.COLLECTIONS.map((c) => c.table).filter((t) => t !== 'site_settings'),
    'media',
    'hero_slides',
  ]
  const results = await Promise.all(
    tables.map(async (t) => {
      const { count } = await sb.from(t).select('id', { count: 'exact', head: true })
      return [t, count ?? 0] as const
    }),
  )
  state.counts = Object.fromEntries(results)
}

async function renderDashboard(host: HTMLElement) {
  crumbs('CMS', 'Dashboard')
  clear(host)

  host.append(
    el(
      'div',
      { class: 'a-pagehead' },
      el(
        'div',
        {},
        txt('h1', 'a-title', 'Magandang araw'),
        txt('p', 'a-subtitle', 'Lahat ng binago rito ay agad na makikita sa website.'),
      ),
      el(
        'div',
        { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        button('Bagong balita', { variant: 'primary', iconName: 'plus', onClick: () => { go('announcements'); window.setTimeout(() => openForm(collectionFor('announcements')!, null), 60) } }),
        button('Mag-upload', { iconName: 'upload', onClick: () => go('media') }),
      ),
    ),
  )

  const statsGrid = el('div', { class: 'a-grid a-grid--stats' })
  statsGrid.append(skeleton('stat', 8))
  host.append(statsGrid)

  const lower = el('div', { class: 'a-grid a-grid--2', style: 'margin-top:24px' })
  host.append(lower)

  await loadCounts()

  clear(statsGrid)
  STAT_CARDS.forEach((card, i) => {
    const a = el('a', { class: 'a-stat', href: '#', style: `--i:${i}` })
    a.addEventListener('click', (ev) => {
      ev.preventDefault()
      go(card.route)
    })
    a.append(
      el('div', { class: 'a-stathead' }, el('span', { class: 'a-staticon' }, icon(card.icon, 15)), card.label),
      txt('div', 'a-statvalue', state.counts[card.table] ?? 0),
    )
    statsGrid.append(a)
  })

  /* Content mix — a bar per collection. Answers "what is thin" at a glance.

     (This comment used to end "there is no analytics on this site, so there
     are no visitor figures to show". There are now: see the Bisita sa website
     screen. The counter is first-party and cookie-free, and it does not run on
     the emergency routes.) */
  const chartCard = el('div', { class: 'a-card' })
  chartCard.append(txt('h2', 'a-legend', 'Nilalaman ng website'))

  const bars = [
    { label: 'Balita', table: 'announcements' },
    { label: 'Kaganapan', table: 'events' },
    { label: 'Proyekto', table: 'projects' },
    { label: 'Turismo', table: 'attractions' },
    { label: 'Negosyo', table: 'businesses' },
    { label: 'FAQ', table: 'faqs' },
    { label: 'Larawan', table: 'gallery' },
  ]
  const max = Math.max(1, ...bars.map((b) => state.counts[b.table] ?? 0))
  const chart = el('div', { class: 'a-chart', style: 'margin-top:16px' })
  bars.forEach((b, i) => {
    const v = state.counts[b.table] ?? 0
    chart.append(
      el(
        'div',
        { class: 'a-bar' },
        txt('span', 'a-barvalue', v),
        el(
          'div',
          { class: 'a-bartrack' },
          el('div', { class: 'a-barfill', style: `height:${Math.max(4, (v / max) * 100)}%;--i:${i}` }),
        ),
        txt('span', 'a-barlabel', b.label),
      ),
    )
  })
  chartCard.append(chart)

  /* Recent activity */
  const feedCard = el('div', { class: 'a-card' })
  feedCard.append(txt('h2', 'a-legend', 'Kamakailang aktibidad'))
  const feed = el('div', { class: 'a-feed', style: 'margin-top:12px' })
  feed.append(skeleton('row', 4))
  feedCard.append(feed)

  lower.append(chartCard, feedCard)

  const { data: acts } = await sb
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  clear(feed)
  if (!acts?.length) {
    feed.append(txt('p', 'a-help', 'Wala pang naitalang pagbabago. Lalabas dito ang bawat pag-edit.'))
  } else {
    const ICONS: Record<string, string> = {
      create: 'plus', update: 'edit', delete: 'trash', restore: 'restore',
      publish: 'eye', unpublish: 'eyeoff', upload: 'upload',
    }
    for (const a of acts as Record<string, string>[]) {
      feed.append(
        el(
          'div',
          { class: 'a-feeditem' },
          el('span', { class: 'a-feeddot' }, icon(ICONS[a['action']!] ?? 'edit', 14)),
          txt('span', 'a-feedtext', a['summary'] ?? ''),
          txt('span', 'a-feedtime', fmtRelative(a['created_at'])),
        ),
      )
    }
  }

  /* System health — real checks, not decoration. */
  const healthCard = el('div', { class: 'a-card' })
  healthCard.append(txt('h2', 'a-legend', 'Kalusugan ng sistema'))
  const health = el('div', { class: 'a-health', style: 'margin-top:12px' })
  healthCard.append(health)
  lower.append(healthCard)

  const sampleCounts = await Promise.all(
    ['announcements', 'events', 'projects', 'attractions', 'businesses', 'faqs', 'forms', 'pages', 'gallery'].map(
      async (t) => {
        const { count } = await sb.from(t).select('id', { count: 'exact', head: true }).eq('is_sample', true)
        return count ?? 0
      },
    ),
  )
  const totalSample = sampleCounts.reduce((a, b) => a + b, 0)

  const { count: unverified } = await sb
    .from('hotlines')
    .select('id', { count: 'exact', head: true })
    .is('verified_at', null)
    .eq('active', true)

  const { data: liveAdv } = await sb
    .from('advisories')
    .select('id, expires_at')
    .eq('is_published', true)
    .gt('expires_at', new Date().toISOString())

  const rows: { state: 'ok' | 'warn' | 'bad'; label: string; value: string }[] = [
    { state: 'ok', label: 'Koneksyon sa database', value: 'Gumagana' },
    {
      state: totalSample > 0 ? 'warn' : 'ok',
      label: 'Halimbawang datos sa website',
      value: totalSample > 0 ? `${totalSample} tala` : 'Wala',
    },
    {
      state: (unverified ?? 0) > 0 ? 'bad' : 'ok',
      label: 'Hindi pa na-verify na emergency number',
      value: (unverified ?? 0) > 0 ? `${unverified} numero` : 'Lahat verified',
    },
    {
      state: (liveAdv?.length ?? 0) > 0 ? 'warn' : 'ok',
      label: 'Aktibong babala',
      value: (liveAdv?.length ?? 0) > 0 ? `${liveAdv!.length} babala` : 'Wala',
    },
  ]

  for (const r of rows) {
    health.append(
      el(
        'div',
        { class: 'a-healthrow' },
        el('span', { class: `a-dot a-dot--${r.state}` }),
        el('span', {}, r.label),
        txt('span', 'a-healthval', r.value),
      ),
    )
  }
}

/* ── Activity screen ──────────────────────────────────────────── */

async function renderActivity(host: HTMLElement) {
  crumbs('CMS', 'Aktibidad')
  clear(host)
  host.append(
    el('div', { class: 'a-pagehead' },
      el('div', {}, txt('h1', 'a-title', 'Aktibidad'),
        txt('p', 'a-subtitle', 'Ang talaan ng bawat pagbabago — sino, ano, at kailan.'))),
  )

  const wrap = el('div', { class: 'a-card' })
  host.append(wrap)
  wrap.append(skeleton('row', 6))

  const { data, error } = await sb
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  clear(wrap)
  if (error) return void wrap.append(txt('p', 'a-err', error.message))
  if (!data?.length) {
    return void wrap.append(
      emptyState({ iconName: 'activity', title: 'Wala pang aktibidad', body: 'Bawat pag-edit, pag-upload at pagbura ay maitatala rito.' }),
    )
  }

  const feed = el('div', { class: 'a-feed' })
  for (const a of data as Record<string, string>[]) {
    feed.append(
      el(
        'div',
        { class: 'a-feeditem' },
        el('span', { class: 'a-feeddot' }, icon('edit', 14)),
        el('span', { class: 'a-feedtext' },
          txt('div', '', a['summary'] ?? ''),
          txt('div', 'a-cellsub', a['actor_email'] ?? 'sistema')),
        txt('span', 'a-feedtime', fmtRelative(a['created_at'])),
      ),
    )
  }
  wrap.append(feed)
}

/* ── Hero slider ──────────────────────────────────────────────
   Reorder is drag-and-drop with keyboard arrows as an equal path, not a
   fallback — a drag is impossible with a switch, a head pointer, or one hand
   on a phone, and reordering is the whole feature. */

async function renderHero(host: HTMLElement) {
  crumbs('CMS', 'Hero Slider')
  clear(host)

  host.append(
    el(
      'div',
      { class: 'a-pagehead' },
      el('div', {}, txt('h1', 'a-title', 'Hero Slider'),
        txt('p', 'a-subtitle', 'Ang malaking larawan sa itaas ng homepage. I-drag para baguhin ang pagkakasunod, o gamitin ang mga arrow.')),
      button('Bagong slide', { variant: 'primary', iconName: 'plus', onClick: () => openSlide(null) }),
    ),
  )

  const list = el('div', { class: 'a-grid' })
  list.append(skeleton('card', 3))
  host.append(list)

  const { data, error } = await sb.from('hero_slides').select('*').order('sort_order')
  clear(list)
  if (error) return void list.append(txt('p', 'a-err', error.message))

  const slides = (data ?? []) as Record<string, unknown>[]
  if (!slides.length) {
    return void list.append(
      emptyState({ iconName: 'slides', title: 'Walang slide', body: 'Magdagdag ng slide para punan ang hero ng homepage.' }),
    )
  }

  const persistOrder = async () => {
    const ids = [...list.querySelectorAll('[data-slide]')].map((n) => n.getAttribute('data-slide')!)
    await Promise.all(ids.map((id, i) => sb.from('hero_slides').update({ sort_order: i + 1 }).eq('id', id)))
    void log('update', 'hero_slides', null, 'Binago ang pagkakasunod ng hero slider')
    toast('Na-save ang bagong pagkakasunod.')
  }

  slides.forEach((s, idx) => {
    const id = String(s['id'])
    const card = el('div', {
      class: 'a-card',
      'data-slide': id,
      draggable: 'true',
      style: 'display:grid;grid-template-columns:auto 160px minmax(0,1fr) auto;gap:16px;align-items:center;padding:16px;cursor:grab',
    })

    card.append(el('span', { style: 'color:var(--ink-3)' }, icon('drag', 18)))

    const thumb = el('div', {
      style: 'aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:var(--surface);display:grid;place-items:center;color:var(--ink-3)',
    })
    if (s['image_url']) {
      thumb.append(el('img', { src: publicUrl(String(s['image_url'])), alt: '', style: 'width:100%;height:100%;object-fit:cover' }))
    } else {
      thumb.append(txt('span', 'a-cellsub', s['kind'] === 'map' ? 'Live map' : s['kind'] === 'video' ? 'Video' : 'Walang larawan'))
    }
    card.append(thumb)

    card.append(
      el(
        'div',
        { style: 'min-width:0' },
        txt('div', 'a-cellmain', s['title_fil'] || '(walang pamagat)'),
        txt('div', 'a-cellsub', s['subtitle_fil'] || s['kind']),
        el('div', { style: 'margin-top:6px' },
          txt('span', s['is_published'] ? 'a-pill a-pill--live' : 'a-pill a-pill--draft',
            s['is_published'] ? 'Nakalathala' : 'Naka-draft')),
      ),
    )

    const move = async (dir: -1 | 1) => {
      const nodes = [...list.querySelectorAll('[data-slide]')]
      const i = nodes.indexOf(card)
      const j = i + dir
      if (j < 0 || j >= nodes.length) return
      if (dir === -1) list.insertBefore(card, nodes[j]!)
      else list.insertBefore(nodes[j]!, card)
      await persistOrder()
    }

    card.append(
      el(
        'div',
        { style: 'display:flex;gap:4px' },
        button('', { small: true, iconName: 'up', title: 'Itaas', onClick: () => void move(-1) }),
        button('', { small: true, iconName: 'down', title: 'Ibaba', onClick: () => void move(1) }),
        button('', { small: true, iconName: 'edit', title: 'Baguhin', onClick: () => openSlide(s) }),
        button('', {
          small: true, variant: 'danger', iconName: 'trash', title: 'Burahin',
          onClick: async () => {
            const ok = await confirmDialog({
              title: 'Burahin ang slide?',
              body: 'Mawawala ito sa hero ng homepage kaagad.',
              confirmLabel: 'Burahin', danger: true,
            })
            if (!ok) return
            const { error: e } = await sb.from('hero_slides').delete().eq('id', id)
            if (e) return toast(e.message, 'bad')
            void log('delete', 'hero_slides', id, `Binura ang hero slide: ${s['title_fil'] ?? id}`)
            toast('Nabura ang slide.')
            void renderHero(host)
          },
        }),
      ),
    )

    card.addEventListener('dragstart', () => card.classList.add('is-dragging'))
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging')
      void persistOrder()
    })

    list.append(card)
    void idx
  })

  list.addEventListener('dragover', (ev) => {
    ev.preventDefault()
    const dragging = list.querySelector('.is-dragging')
    if (!dragging) return
    const after = [...list.querySelectorAll('[data-slide]:not(.is-dragging)')].find((node) => {
      const box = node.getBoundingClientRect()
      return (ev as DragEvent).clientY < box.top + box.height / 2
    })
    if (after) list.insertBefore(dragging, after)
    else list.append(dragging)
  })
}

function openSlide(row: Record<string, unknown> | null) {
  const host = $('#a-content')!
  crumbs('CMS', 'Hero Slider', row ? 'Baguhin' : 'Bago')
  clear(host)

  const isNew = !row
  const form = el('form', { class: 'a-form' })
  const controls: Record<string, HTMLElement> = {}

  const field = (name: string, label: string, node: HTMLElement, help?: string) => {
    controls[name] = node
    return el('div', { class: 'a-field' }, txt('label', 'a-label', label), node, help ? txt('p', 'a-help', help) : null)
  }

  const input = (value?: unknown) =>
    el('input', { class: 'a-input', value: value == null ? '' : String(value) })

  const kind = el('select', { class: 'a-input' }) as HTMLSelectElement
  for (const [v, l] of [['image', 'Larawan'], ['map', 'Live na mapa'], ['video', 'Video']]) {
    kind.append(el('option', { value: v! }, l!))
  }
  kind.value = String(row?.['kind'] ?? 'image')

  /* Image picker — the same modal every image field uses. */
  const imgVal = el('input', { type: 'hidden', value: String(row?.['image_url'] ?? '') }) as HTMLInputElement
  const preview = el('div', { class: 'a-imgpreview' })
  const paintPreview = () => {
    clear(preview)
    if (imgVal.value) preview.append(el('img', { src: publicUrl(imgVal.value), alt: '' }))
    else preview.append(txt('span', '', 'Walang napiling larawan'))
  }
  paintPreview()

  const imgField = el(
    'div',
    { class: 'a-imgfield' },
    preview,
    el(
      'div',
      { style: 'display:flex;gap:8px;flex-wrap:wrap' },
      button('Pumili sa library', {
        iconName: 'image',
        onClick: async () => {
          const picked = await pickMedia()
          if (!picked) return
          imgVal.value = publicUrl(picked.storage_path)
          paintPreview()
        },
      }),
      button('Alisin', { variant: 'ghost', iconName: 'close', onClick: () => { imgVal.value = ''; paintPreview() } }),
    ),
    imgVal,
  )

  const published = el('input', { type: 'checkbox' }) as HTMLInputElement
  published.checked = row ? Boolean(row['is_published']) : true

  form.append(
    el(
      'div',
      { class: 'a-fieldset' },
      txt('h2', 'a-legend', 'Slide'),
      field('kind', 'Uri', kind, 'Ang "Live na mapa" ay ang satellite map ng barangay — hindi ito nangangailangan ng larawan.'),
      el('div', { class: 'a-field' }, txt('label', 'a-label', 'Larawan'), imgField),
      field('title_fil', 'Pamagat (Filipino)', input(row?.['title_fil'])),
      field('title_en', 'Pamagat (English)', input(row?.['title_en'])),
      field('subtitle_fil', 'Subtitle (Filipino)', input(row?.['subtitle_fil'])),
      field('subtitle_en', 'Subtitle (English)', input(row?.['subtitle_en'])),
    ),
    el(
      'div',
      { class: 'a-fieldset' },
      txt('h2', 'a-legend', 'Paglalarawan at CTA'),
      field('alt_fil', 'Paglalarawan para sa hindi nakakakita (Filipino)',
        el('textarea', { class: 'a-textarea' }, String(row?.['alt_fil'] ?? '')),
        'Ilarawan ang NAKIKITA sa larawan. Ito ang naririnig ng bulag na bisita — hindi ito kapsyon.'),
      field('alt_en', 'Paglalarawan (English)', el('textarea', { class: 'a-textarea' }, String(row?.['alt_en'] ?? ''))),
      field('cta_label_fil', 'Pindutan — teksto (Filipino)', input(row?.['cta_label_fil'])),
      field('cta_label_en', 'Pindutan — teksto (English)', input(row?.['cta_label_en'])),
      field('cta_href', 'Pindutan — link', input(row?.['cta_href']), 'Hal. /serbisyo'),
    ),
    el(
      'div',
      { class: 'a-fieldset' },
      txt('h2', 'a-legend', 'Paglathala'),
      el('label', { class: 'a-switch' }, published, el('span', {}, 'Nakalathala sa website')),
      field('publish_at', 'Ilathala simula (opsyonal)',
        el('input', { class: 'a-input', type: 'datetime-local', value: toLocalInput(row?.['publish_at']) }),
        'Iwanang blangko para agad itong lumabas.'),
      field('unpublish_at', 'Itago simula (opsyonal)',
        el('input', { class: 'a-input', type: 'datetime-local', value: toLocalInput(row?.['unpublish_at']) })),
    ),
  )

  const save = el('button', { type: 'submit', class: 'a-btn a-btn--primary' }, 'I-save') as HTMLButtonElement
  form.append(
    el('div', { class: 'a-formbar' },
      button('Bumalik', { variant: 'ghost', onClick: () => go('hero') }),
      save),
  )

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    save.disabled = true

    const val = (n: string) => {
      const c = controls[n] as HTMLInputElement | HTMLTextAreaElement | undefined
      const v = c?.value?.trim()
      return v ? v : null
    }

    const payload: Record<string, unknown> = {
      kind: (controls['kind'] as HTMLSelectElement).value,
      image_url: imgVal.value || null,
      title_fil: val('title_fil'),
      title_en: val('title_en'),
      subtitle_fil: val('subtitle_fil'),
      subtitle_en: val('subtitle_en'),
      alt_fil: val('alt_fil'),
      alt_en: val('alt_en'),
      cta_label_fil: val('cta_label_fil'),
      cta_label_en: val('cta_label_en'),
      cta_href: val('cta_href'),
      is_published: published.checked,
      publish_at: fromLocalInput(controls['publish_at'] as HTMLInputElement),
      unpublish_at: fromLocalInput(controls['unpublish_at'] as HTMLInputElement),
      is_sample: false,
    }

    const { error } = isNew
      ? await sb.from('hero_slides').insert(payload)
      : await sb.from('hero_slides').update(payload).eq('id', row!['id'] as string)

    save.disabled = false
    if (error) return toast(error.message, 'bad')
    void log(isNew ? 'create' : 'update', 'hero_slides', String(row?.['id'] ?? ''), `${isNew ? 'Nagdagdag' : 'Binago'} ng hero slide: ${payload['title_fil'] ?? 'walang pamagat'}`)
    toast('Na-save. Makikita na ito sa homepage.')
    go('hero')
  })

  host.append(form)
}

const toLocalInput = (v: unknown): string => {
  if (!v) return ''
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (i: HTMLInputElement | undefined): string | null =>
  i?.value ? new Date(i.value).toISOString() : null

/* ── Collection list ──────────────────────────────────────────── */

let rowsCache: Record<string, unknown>[] = []

async function renderCollection(host: HTMLElement, col: Collection) {
  crumbs('CMS', col.label)
  clear(host)

  host.append(
    el(
      'div',
      { class: 'a-pagehead' },
      el('div', {}, txt('h1', 'a-title', col.label), col.note ? txt('p', 'a-subtitle', col.note) : null),
      !col.singleton
        ? button(`Bagong ${col.labelSingular}`, { variant: 'primary', iconName: 'plus', onClick: () => openForm(col, null) })
        : null,
    ),
  )

  const body = el('div', {})
  host.append(body)
  body.append(el('div', { class: 'a-tablewrap' }, skeleton('row', 6)))

  const { data, error } = await sb
    .from(col.table)
    .select('*')
    .order(col.orderBy, { ascending: col.ascending })

  clear(body)
  if (error) return void body.append(txt('p', 'a-err', `Hindi makuha: ${error.message}`))

  rowsCache = (data ?? []) as Record<string, unknown>[]

  if (col.singleton) {
    openForm(col, rowsCache[0] ?? null, body)
    return
  }

  paintList(body, col)
}

function filteredRows(col: Collection): Record<string, unknown>[] {
  const term = state.search.trim().toLowerCase()
  let rows = rowsCache.filter((r) => {
    if (state.statusFilter === 'live' && !(r['is_published'] ?? r['active'])) return false
    if (state.statusFilter === 'draft' && (r['is_published'] ?? r['active'])) return false
    if (state.statusFilter === 'archived' && !r['deleted_at']) return false
    if (state.statusFilter !== 'archived' && r['deleted_at']) return false
    if (!term) return true
    return col.fields.some((f) => String(r[f.name] ?? '').toLowerCase().includes(term))
  })

  if (state.sortBy) {
    const key = state.sortBy
    rows = [...rows].sort((a, b) => {
      const av = String(a[key] ?? '')
      const bv = String(b[key] ?? '')
      return state.sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  return rows
}

function paintList(body: HTMLElement, col: Collection) {
  clear(body)

  /* Toolbar */
  const search = el('input', { type: 'search', placeholder: `Hanapin sa ${col.label.toLowerCase()}…` }) as HTMLInputElement
  search.value = state.search
  search.addEventListener('input', () => {
    state.search = search.value
    state.page = 1
    paintList(body, col)
  })

  const status = el('select', { class: 'a-select' }) as HTMLSelectElement
  for (const [v, l] of [['all', 'Lahat'], ['live', 'Nakalathala'], ['draft', 'Naka-draft'], ['archived', 'Naka-archive']]) {
    status.append(el('option', { value: v! }, l!))
  }
  status.value = state.statusFilter
  status.addEventListener('change', () => {
    state.statusFilter = status.value as State['statusFilter']
    state.page = 1
    state.selection.clear()
    paintList(body, col)
  })

  body.append(
    el('div', { class: 'a-toolbar' },
      el('div', { class: 'a-search' }, icon('search', 16), search),
      status),
  )

  const rows = filteredRows(col)

  /* Bulk bar */
  if (state.selection.size) {
    const bar = el('div', { class: 'a-bulk' })
    bar.append(txt('span', '', `${state.selection.size} napili`))
    bar.append(
      button('Ilathala', { small: true, iconName: 'eye', onClick: () => void bulk(col, body, { is_published: true }, 'publish') }),
      button('Itago', { small: true, iconName: 'eyeoff', onClick: () => void bulk(col, body, { is_published: false }, 'unpublish') }),
      button('I-archive', { small: true, iconName: 'trash', onClick: () => void bulk(col, body, { deleted_at: new Date().toISOString() }, 'delete') }),
      button('Alisin ang pinili', { small: true, variant: 'ghost', onClick: () => { state.selection.clear(); paintList(body, col) } }),
    )
    body.append(bar)
  }

  if (!rows.length) {
    body.append(
      emptyState({
        iconName: 'doc',
        title: state.search ? 'Walang tugma' : `Wala pang ${col.labelSingular.toLowerCase()}`,
        body: state.search
          ? 'Subukan ang ibang salita o baguhin ang filter.'
          : 'Magdagdag gamit ang pindutan sa itaas. Lalabas agad ito sa website.',
        ...(state.search
          ? {}
          : {
              action: button(`Bagong ${col.labelSingular}`, {
                variant: 'primary',
                iconName: 'plus',
                onClick: () => openForm(col, null),
              }),
            }),
      }),
    )
    return
  }

  /* Pagination */
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / state.perPage))
  state.page = Math.min(state.page, pages)
  const slice = rows.slice((state.page - 1) * state.perPage, state.page * state.perPage)

  const cols = col.fields.filter((f) => f.inList)
  const table = el('table', { class: 'a-table' })

  const selectAll = el('input', { type: 'checkbox', class: 'a-check' }) as HTMLInputElement
  selectAll.checked = slice.length > 0 && slice.every((r) => state.selection.has(String(r['id'])))
  selectAll.addEventListener('change', () => {
    for (const r of slice) {
      if (selectAll.checked) state.selection.add(String(r['id']))
      else state.selection.delete(String(r['id']))
    }
    paintList(body, col)
  })

  const hr = el('tr')
  hr.append(el('th', { style: 'width:36px' }, selectAll))
  for (const c of cols) {
    const th = el('th', { 'data-sortable': 'true' }, c.label)
    const mark = txt('span', `a-sortmark${state.sortBy === c.name ? ' is-on' : ''}`, state.sortBy === c.name ? (state.sortAsc ? '▲' : '▼') : '⇅')
    th.append(mark)
    th.addEventListener('click', () => {
      if (state.sortBy === c.name) state.sortAsc = !state.sortAsc
      else { state.sortBy = c.name; state.sortAsc = true }
      paintList(body, col)
    })
    hr.append(th)
  }
  hr.append(el('th', { style: 'width:1%' }))
  table.append(el('thead', {}, hr))

  const tbody = el('tbody')
  for (const row of slice) {
    const id = String(row['id'])
    const tr = el('tr')
    if (row['deleted_at']) tr.classList.add('is-archived')
    if (state.selection.has(id)) tr.classList.add('is-selected')

    const check = el('input', { type: 'checkbox', class: 'a-check' }) as HTMLInputElement
    check.checked = state.selection.has(id)
    check.addEventListener('change', () => {
      if (check.checked) state.selection.add(id)
      else state.selection.delete(id)
      paintList(body, col)
    })
    tr.append(el('td', {}, check))

    for (const c of cols) {
      const raw = row[c.name]
      let cell: HTMLElement

      if (c.type === 'boolean') {
        cell = el('td', {}, txt('span', raw ? 'a-pill a-pill--live' : 'a-pill a-pill--draft', raw ? 'Oo' : 'Hindi'))
      } else if (c.type === 'select') {
        cell = el('td', {}, c.options?.find((o) => o.value === raw)?.label ?? String(raw ?? '—'))
      } else if (c.type === 'date' || c.type === 'datetime') {
        cell = el('td', {}, fmtDate(raw, c.type === 'datetime'))
      } else {
        cell = el('td', {}, txt('span', 'a-cellmain', raw === null || raw === undefined || raw === '' ? '—' : String(raw)))
      }
      tr.append(cell)
    }

    const actions = el('td', {}, el('div', { class: 'a-rowactions' },
      row['is_sample'] ? txt('span', 'a-pill a-pill--sample', 'Halimbawa') : null,
      row['deleted_at']
        ? button('Ibalik', { small: true, iconName: 'restore', onClick: () => void restore(col, body, row) })
        : button('', { small: true, iconName: 'edit', title: 'Baguhin', onClick: () => openForm(col, row) }),
      !row['deleted_at']
        ? button('', { small: true, variant: 'danger', iconName: 'trash', title: 'I-archive', onClick: () => void archive(col, body, row) })
        : null,
    ))
    tr.append(actions)
    tbody.append(tr)
  }
  table.append(tbody)

  const pager = el('div', { class: 'a-pager' })
  pager.append(txt('span', '', `${total} tala · pahina ${state.page} ng ${pages}`))
  pager.append(
    button('Nakaraan', { small: true, onClick: () => { state.page--; paintList(body, col) } }),
    button('Susunod', { small: true, onClick: () => { state.page++; paintList(body, col) } }),
  )
  ;(pager.querySelectorAll('.a-btn')[0] as HTMLButtonElement).disabled = state.page <= 1
  ;(pager.querySelectorAll('.a-btn')[1] as HTMLButtonElement).disabled = state.page >= pages

  body.append(el('div', { class: 'a-tablewrap' }, table, pager))
}

async function bulk(col: Collection, body: HTMLElement, patch: Record<string, unknown>, action: string) {
  const ids = [...state.selection]
  const { error } = await sb.from(col.table).update(patch).in('id', ids)
  if (error) return toast(error.message, 'bad')
  void log(action, col.table, null, `${ids.length} tala sa ${col.label}`)
  toast(`${ids.length} tala ang na-update.`)
  state.selection.clear()
  const { data } = await sb.from(col.table).select('*').order(col.orderBy, { ascending: col.ascending })
  rowsCache = (data ?? []) as Record<string, unknown>[]
  paintList(body, col)
}

async function archive(col: Collection, body: HTMLElement, row: Record<string, unknown>) {
  const ok = await confirmDialog({
    title: `I-archive ang ${col.labelSingular.toLowerCase()}?`,
    body: 'Mawawala ito sa website ngunit hindi mabubura. Maibabalik ito mula sa filter na "Naka-archive".',
    confirmLabel: 'I-archive',
    danger: true,
  })
  if (!ok) return
  const { error } = await sb.from(col.table).update({ deleted_at: new Date().toISOString() }).eq('id', row['id'] as string)
  if (error) return toast(error.message, 'bad')
  row['deleted_at'] = new Date().toISOString()
  void log('delete', col.table, String(row['id']), `Na-archive sa ${col.label}`)
  toast('Na-archive. Mababalik ito anumang oras.')
  paintList(body, col)
}

async function restore(col: Collection, body: HTMLElement, row: Record<string, unknown>) {
  const { error } = await sb.from(col.table).update({ deleted_at: null }).eq('id', row['id'] as string)
  if (error) return toast(error.message, 'bad')
  row['deleted_at'] = null
  void log('restore', col.table, String(row['id']), `Naibalik sa ${col.label}`)
  toast('Naibalik.')
  paintList(body, col)
}

/* ── Record form ──────────────────────────────────────────────── */

/**
 * Turn a Postgres error into something a barangay secretary can act on.
 *
 * Every message below was one somebody actually hit. They are all correct
 * — the database is right to refuse each of these — and all of them are
 * unreadable to the person who caused them, because they name constraints and
 * columns rather than the thing on screen.
 *
 * THE RAW TEXT IS KEPT, appended in brackets. Hiding it entirely would leave
 * whoever debugs this next with a friendly sentence and nothing to search for.
 */
function humanError(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('photo_requires_consent')) {
    return (
      'Hindi mai-save: may larawan pero hindi naka-tsek ang pahintulot. ' +
      'I-tsek muna ang "May pahintulot sa larawan", o alisin ang larawan.'
    )
  }
  if (m.includes('violates check constraint')) {
    return `Hindi tinanggap ng database ang isang halaga sa form. [${message}]`
  }
  if (m.includes('duplicate key') || m.includes('already exists')) {
    return `May kaparehong tala na. Baka nagamit na ang slug o pangalan. [${message}]`
  }
  if (m.includes('violates foreign key')) {
    return `Nakaugnay ito sa isang tala na wala na. Piliin muli. [${message}]`
  }
  if (m.includes('violates not-null')) {
    return `May kailangang punan na hindi pa nasasagutan. [${message}]`
  }
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'Walang pahintulot ang account na ito para sa pagbabagong ito.'
  }
  if (m.includes('payload too large') || m.includes('exceeded the maximum')) {
    return 'Masyadong malaki ang file. Paliitin muna bago i-upload.'
  }
  return message
}

function controlFor(f: Field, value: unknown): HTMLElement {
  if (f.type === 'boolean') {
    const i = el('input', { type: 'checkbox' }) as HTMLInputElement
    i.checked = Boolean(value)
    return i
  }

  if (f.type === 'select') {
    const s = el('select', { class: 'a-input' }) as HTMLSelectElement
    for (const o of f.options ?? []) s.append(el('option', { value: o.value }, o.label))
    if (value != null) s.value = String(value)
    return s
  }

  /*
   * A dropdown of rows from another table.
   *
   * Populated asynchronously AFTER the control is in the DOM. The form builder
   * is synchronous and making it async would mean every field waited on the
   * slowest one; instead the select renders immediately with the current value
   * preserved as its only option, and fills in when the query answers. An
   * editor who saves before it loads keeps the value they already had rather
   * than silently writing an empty foreign key.
   */
  if (f.type === 'reference') {
    const s = el('select', { class: 'a-input' }) as HTMLSelectElement
    const current = value == null ? '' : String(value)
    s.append(el('option', { value: current }, current ? 'Naglo-load…' : '— pumili —'))
    s.value = current

    void (async () => {
      const labelCol = f.referenceLabel ?? 'title_fil'
      const { data } = await sb
        .from(f.referenceTable ?? '')
        .select(`id, ${labelCol}`)
        .is('deleted_at', null)
        .order(labelCol, { ascending: true })

      clear(s)
      if (!f.required) s.append(el('option', { value: '' }, '— pumili —'))
      // Through `unknown`: the select list is built at runtime from
      // `referenceLabel`, so supabase-js cannot infer the row shape and types
      // the result as a parser error. The shape is checked by the guards below
      // rather than by the compiler.
      for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
        s.append(el('option', { value: String(row['id']) }, String(row[labelCol] ?? row['id'])))
      }
      s.value = current
    })()

    if (f.required) s.required = true
    return s
  }

  if (f.type === 'textarea' || f.type === 'markdown') {
    const t = el('textarea', {
      class: `a-textarea${f.type === 'markdown' ? ' a-textarea--tall' : ''}`,
    }) as HTMLTextAreaElement
    t.value = value == null ? '' : String(value)
    return t
  }

  if (f.type === 'image') {
    const hidden = el('input', { type: 'hidden', value: value == null ? '' : String(value) }) as HTMLInputElement
    const preview = el('div', { class: 'a-imgpreview' })
    const paint = () => {
      clear(preview)
      if (hidden.value) preview.append(el('img', { src: publicUrl(hidden.value), alt: '' }))
      else preview.append(txt('span', '', 'Walang larawan'))
    }
    paint()
    const wrap = el('div', { class: 'a-imgfield' }, preview,
      el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        button('Pumili sa library', { iconName: 'image', onClick: async () => {
          const picked = await pickMedia()
          if (!picked) return
          hidden.value = publicUrl(picked.storage_path)
          paint()
        } }),
        button('Alisin', { variant: 'ghost', iconName: 'close', onClick: () => { hidden.value = ''; paint() } })),
      hidden)
    // The wrapper carries its value in a child hidden input; the submit
    // handler finds it by class rather than by a property bolted onto the
    // element, which TypeScript is right to object to.
    hidden.classList.add('a-imgvalue')
    return wrap
  }

  const type = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'
  const i = el('input', { class: 'a-input', type }) as HTMLInputElement
  if (value != null) {
    if (f.type === 'datetime') i.value = toLocalInput(value)
    else if (f.type === 'date') i.value = String(value).slice(0, 10)
    else i.value = String(value)
  }
  if (f.required) i.required = true
  return i
}

/** Markdown toolbar — the interim rich editor. Inserts syntax at the cursor
    rather than opening a WYSIWYG surface, so what is stored stays plain text
    and cannot carry markup we would then have to sanitise on the public site. */
function mdToolbar(area: HTMLTextAreaElement): HTMLElement {
  const bar = el('div', { class: 'a-mdbar' })
  const items: [string, string, string][] = [
    ['H2', '## ', ''],
    ['H3', '### ', ''],
    ['B', '**', '**'],
    ['I', '_', '_'],
    ['• Listahan', '- ', ''],
    ['1. Bilang', '1. ', ''],
    ['" Sipi', '> ', ''],
    ['Link', '[', '](https://)'],
  ]
  for (const [label, before, after] of items) {
    const b = el('button', { type: 'button', class: 'a-mdbtn' }, label)
    b.addEventListener('click', () => {
      const s = area.selectionStart
      const e = area.selectionEnd
      const sel = area.value.slice(s, e)
      area.setRangeText(before + sel + after, s, e, 'end')
      area.focus()
    })
    bar.append(b)
  }
  return bar
}

function openForm(col: Collection, row: Record<string, unknown> | null, into?: HTMLElement) {
  const host = into ?? $('#a-content')!
  if (!into) {
    clear(host)
    crumbs('CMS', col.label, row ? 'Baguhin' : `Bagong ${col.labelSingular}`)
    host.append(
      el('div', { class: 'a-pagehead' },
        el('div', {}, txt('h1', 'a-title', row ? `Baguhin ang ${col.labelSingular}` : `Bagong ${col.labelSingular}`))),
    )
  }

  const isNew = !row
  const form = el('form', { class: 'a-form' })
  const controls: Record<string, HTMLElement> = {}

  if (row?.['is_sample']) {
    form.append(
      txt('p', 'a-samplebanner',
        'HALIMBAWANG DATOS — palitan ito ng tunay na impormasyon ng barangay. Kapag ni-save mo ito, hindi na ito ituturing na halimbawa.'),
    )
  }

  const set = el('div', { class: 'a-fieldset' })
  for (const f of col.fields) {
    const control = controlFor(f, row?.[f.name] ?? null)
    controls[f.name] = control

    const wrap = el('div', { class: f.type === 'boolean' ? 'a-field a-field--inline' : 'a-field' })
    if (f.type === 'boolean') {
      /*
       * The checkbox goes INSIDE its <label>.
       *
       * It was a sibling, laid out by a two-column grid, and the label drifted
       * to the far side of the form — a lone unlabelled box in the middle of
       * the row and its text metres away, which is how "May pahintulot sa
       * larawan" came to look like it belonged to something else.
       *
       * Wrapping is better than fixing the grid: it makes the association
       * implicit (no `for`/`id` pair to keep in sync), it makes the TEXT
       * clickable — a 13px box is a poor target on a phone — and it cannot be
       * pulled apart by a layout change again.
       */
      const lbl = el('label', { class: 'a-label a-checkline' })
      lbl.append(control, el('span', {}, f.label))
      wrap.append(lbl)
    } else {
      wrap.append(txt('label', 'a-label', f.label + (f.required ? ' *' : '')))
      if (f.type === 'markdown') wrap.append(mdToolbar(control as HTMLTextAreaElement))
      wrap.append(control)
    }
    // Help text that names a documented harm gets the warning treatment.
    if (f.help) {
      const warn = /KAILANGAN|pahintulot|hindi pa|Mas mabuti|delikado/i.test(f.help)
      wrap.append(txt('p', warn ? 'a-help a-help--warn' : 'a-help', f.help))
    }
    set.append(wrap)
  }
  form.append(set)

  const save = el('button', { type: 'submit', class: 'a-btn a-btn--primary' }, 'I-save') as HTMLButtonElement
  form.append(
    el('div', { class: 'a-formbar' },
      !into ? button('Bumalik', { variant: 'ghost', onClick: () => go(col.table) }) : null,
      save),
  )

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    save.disabled = true
    save.textContent = 'Sini-save…'

    const payload: Record<string, unknown> = {}
    for (const f of col.fields) {
      const c = controls[f.name]!
      if (f.type === 'boolean') payload[f.name] = (c as HTMLInputElement).checked
      else if (f.type === 'image') {
        payload[f.name] = (c.querySelector('.a-imgvalue') as HTMLInputElement | null)?.value || null
      }
      else {
        const v = (c as HTMLInputElement).value
        if (v === '') payload[f.name] = null
        else if (f.type === 'number') payload[f.name] = Number(v)
        else if (f.type === 'datetime') payload[f.name] = new Date(v).toISOString()
        else payload[f.name] = v
      }
    }

    /*
     * CONSENT GATE — checked here so the database never has to refuse it.
     *
     * `officials` carries `CHECK ((photo_url IS NULL) OR photo_consent)`, and
     * that constraint is the real guarantee: it is what stops a photograph of
     * a person being published without recorded permission, and it is not
     * going anywhere. But when the form let the editor pick a photo, leave the
     * box unticked and press save, what came back was
     *
     *   new row for relation "officials" violates check constraint
     *   "photo_requires_consent"
     *
     * — raw Postgres, in English, on a Filipino admin, naming a column the
     * editor has never seen. They cannot act on that. Worse, the natural
     * reading is "the site is broken", and the natural next step is to remove
     * the photo, which is the opposite of what the rule wants: the photo is
     * fine, the permission just has not been recorded.
     *
     * So the form says it first, in the editor's language, and puts the cursor
     * on the box that fixes it.
     */
    for (const f of col.fields) {
      if (f.type !== 'image' || !f.consentField) continue
      if (!payload[f.name]) continue
      if (payload[f.consentField] === true) continue

      const box = controls[f.consentField] as HTMLInputElement | undefined
      const consentLabel =
        col.fields.find((x) => x.name === f.consentField)?.label ?? 'pahintulot'

      toast(
        `Kailangan munang i-tsek ang "${consentLabel}" bago mai-save ang larawan. ` +
          'Ang pahintulot sa Facebook ay hindi pahintulot para sa website.',
        'bad',
      )

      if (box) {
        box.focus()
        box.scrollIntoView({ block: 'center', behavior: 'smooth' })
        // A tick that appears on its own would be consent granted by the
        // software rather than by the person. It is highlighted, never set.
        box.closest('.a-field')?.classList.add('a-field--needs')
        box.addEventListener(
          'change',
          () => box.closest('.a-field')?.classList.remove('a-field--needs'),
          { once: true },
        )
      }

      save.disabled = false
      save.textContent = 'I-save'
      return
    }

    // Anything the barangay edits stops being sample content by definition.
    if (row?.['is_sample']) payload['is_sample'] = false
    payload['updated_at'] = new Date().toISOString()

    const q = col.singleton
      ? sb.from(col.table).upsert({ ...payload, id: 1 })
      : isNew
        ? sb.from(col.table).insert(payload)
        : sb.from(col.table).update(payload).eq('id', row!['id'] as string)

    const { error } = await q
    save.disabled = false
    save.textContent = 'I-save'

    if (error) return toast(humanError(error.message), 'bad')

    const title = String(payload['title_fil'] ?? payload['name'] ?? payload['label_fil'] ?? col.labelSingular)
    void log(isNew ? 'create' : 'update', col.table, String(row?.['id'] ?? ''), `${isNew ? 'Nagdagdag' : 'Binago'}: ${title}`)
    toast('Na-save. Makikita na ito sa website.')
    if (!into) go(col.table)
  })

  host.append(form)
}

/* ── Boot ─────────────────────────────────────────────────────── */

async function boot() {
  const { data: sess } = await sb.auth.getSession()
  if (!sess.session) return renderLogin()

  const { data: profile, error } = await sb
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', sess.session.user.id)
    .single()

  // A valid session with no profile row is an account that exists in Auth but
  // was never granted editing rights. RLS refuses every write anyway; saying
  // so is kinder than a form that silently fails to save.
  if (error || !profile) {
    await sb.auth.signOut()
    return renderLogin('Walang pahintulot ang account na ito.')
  }

  state.profile = profile as State['profile']
  await loadCounts()
  renderShell()
  setActive()
  void renderRoute()
  void FOLDERS
}

void boot()
