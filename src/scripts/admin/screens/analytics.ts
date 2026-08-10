/**
 * Visitors screen — the first admin screen extracted from main.ts
 * (ARCHITECTURE-REVIEW.md §3.3).
 *
 * Moved VERBATIM. Not one line of behaviour changed on the way out: the only
 * edits are the imports, and `sb` becoming `sb()` because the client now comes
 * from the shared context rather than a module-level const.
 *
 * That restraint is the point. The admin has no automated coverage — it is
 * `noindex` and outside every Playwright route list — so a move that also
 * "improved" something would leave no way to tell which of the two changes
 * broke it. Move first, verify by hand, improve in a separate pass.
 */
import {
  el, txt, clear, icon, button, skeleton, emptyState,
} from '../ui'
import { sb, crumbs } from '../context'

/* ── Visitors ─────────────────────────────────────────────────
 *
 * Reads `analytics_summary()`, a SECURITY DEFINER function gated on
 * `is_staff()`. The raw `page_views` table is NOT readable by anyone but
 * staff, deliberately: correlating session ids with timestamps would rebuild
 * individual browsing sessions, so the log is never exposed and this screen
 * only ever sees aggregates.
 *
 * ON THE WORD "VISITORS". There is no cookie and no persistent id — the
 * session id lives in sessionStorage and dies with the tab. So a "session" is
 * one visit, and one person returning next week counts twice. The screen says
 * this in plain Filipino rather than quietly overstating reach; a barangay
 * making a decision on these numbers deserves to know what they mean.
 */

interface Summary {
  days: number
  totals: { views: number; sessions: number; today: number; last7: number }
  daily: { day: string; views: number; sessions: number }[]
  top_paths: { path: string; views: number; sessions: number }[]
  devices: { device: string; views: number }[]
  locales: { locale: string; views: number }[]
  referrers: { host: string; views: number }[]
}

let analyticsDays = 30

export async function renderAnalytics(host: HTMLElement) {
  crumbs('CMS', 'Bisita sa website')
  clear(host)

  const head = el('div', { class: 'a-pagehead' })
  head.append(
    el('div', {},
      txt('h1', 'a-title', 'Bisita sa website'),
      txt('p', 'a-subtitle', 'Ilang beses binuksan ang mga pahina. Walang cookie at walang itinatalang tao.')),
  )

  const range = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' })
  for (const d of [7, 30, 90]) {
    range.append(
      button(`${d} araw`, {
        variant: analyticsDays === d ? 'primary' : '',
        onClick: () => { analyticsDays = d; renderAnalytics(host) },
      }),
    )
  }
  head.append(range)
  host.append(head)

  const body = el('div', {})
  body.append(skeleton('stat', 4))
  host.append(body)

  const { data, error } = await sb().rpc('analytics_summary', { days: analyticsDays })

  clear(body)

  if (error) {
    return void body.append(
      el('div', { class: 'a-card' },
        txt('p', 'a-err', error.message),
        txt('p', 'a-help', 'Kung bago pa ang tampok na ito, patakbuhin muna ang migration na gumagawa ng page_views at analytics_summary.')),
    )
  }

  const s = data as Summary | null
  if (!s || s.totals.views === 0) {
    return void body.append(
      el('div', { class: 'a-card' },
        emptyState({
          iconName: 'activity',
          title: 'Wala pang naitalang bisita',
          body: 'Magsisimulang magbilang kapag may bumisita sa website. Hindi binibilang ang /ligtas at ang admin, at hindi rin ang mga bisitang naka-Do Not Track.',
        })),
    )
  }

  /* ── Headline numbers ─────────────────────────────────────── */
  const stats: { label: string; value: number; hint: string }[] = [
    { label: 'Ngayong araw', value: s.totals.today, hint: 'Bukas na pahina mula hatinggabi' },
    { label: 'Nitong 7 araw', value: s.totals.last7, hint: 'Bukas na pahina' },
    { label: `Kabuuan (${s.days} araw)`, value: s.totals.views, hint: 'Lahat ng bukas na pahina' },
    { label: 'Pagbisita', value: s.totals.sessions, hint: 'Isang tab, isang bilang — hindi tao' },
  ]
  const grid = el('div', { class: 'a-grid a-grid--stats' })
  stats.forEach((st, i) => {
    grid.append(
      el('div', { class: 'a-stat', style: `--i:${i}` },
        el('div', { class: 'a-stathead' }, el('span', { class: 'a-staticon' }, icon('activity', 15)), st.label),
        txt('div', 'a-statvalue', st.value.toLocaleString('fil-PH')),
        txt('div', 'a-cellsub', st.hint)),
    )
  })
  body.append(grid)

  /* ── Daily chart ──────────────────────────────────────────────
     Bars are keyed off the DENSE series the RPC returns, so a day with no
     traffic renders as an empty column rather than disappearing. A chart that
     drops quiet days makes a bad week look like a good one. */
  const chartCard = el('div', { class: 'a-card', style: 'margin-top:24px' })
  chartCard.append(txt('h2', 'a-legend', `Bawat araw — huling ${s.days} araw`))

  const max = Math.max(1, ...s.daily.map((d) => d.views))
  const chart = el('div', { class: 'a-chart', style: 'margin-top:16px' })
  // 90 labelled columns is unreadable on any screen; label sparsely instead.
  const step = Math.ceil(s.daily.length / 12)
  s.daily.forEach((d, i) => {
    const label = i % step === 0 ? d.day.slice(5) : ''
    chart.append(
      el('div', { class: 'a-bar', title: `${d.day} — ${d.views} pahina, ${d.sessions} pagbisita` },
        txt('span', 'a-barvalue', d.views || ''),
        el('div', { class: 'a-bartrack' },
          el('div', { class: 'a-barfill', style: `height:${Math.max(2, (d.views / max) * 100)}%;--i:${i}` })),
        txt('span', 'a-barlabel', label)),
    )
  })
  chartCard.append(chart)
  body.append(chartCard)

  /* ── Breakdowns ───────────────────────────────────────────── */
  const lower = el('div', { class: 'a-grid a-grid--2', style: 'margin-top:24px' })

  const pathCard = el('div', { class: 'a-card' })
  pathCard.append(txt('h2', 'a-legend', 'Pinakabinibisitang pahina'))
  const pathList = el('div', { class: 'a-feed', style: 'margin-top:12px' })
  for (const p of s.top_paths) {
    pathList.append(
      el('div', { class: 'a-feeditem' },
        el('span', { class: 'a-feeddot' }, icon('doc', 14)),
        el('span', { class: 'a-feedtext' },
          txt('div', '', p.path),
          txt('div', 'a-cellsub', `${p.sessions} pagbisita`)),
        txt('span', 'a-feedtime', `${p.views}`)),
    )
  }
  pathCard.append(pathList)

  const mixCard = el('div', { class: 'a-card' })
  mixCard.append(txt('h2', 'a-legend', 'Kagamitan, wika at pinanggalingan'))
  const mix = el('div', { style: 'margin-top:12px;display:grid;gap:16px' })

  const DEVICE: Record<string, string> = { phone: 'Cellphone', tablet: 'Tablet', desktop: 'Computer' }
  const LOCALE: Record<string, string> = { fil: 'Filipino', en: 'English' }

  const groups: { title: string; rows: { label: string; views: number }[] }[] = [
    { title: 'Kagamitan', rows: s.devices.map((d) => ({ label: DEVICE[d.device] ?? d.device, views: d.views })) },
    { title: 'Wika', rows: s.locales.map((l) => ({ label: LOCALE[l.locale] ?? l.locale, views: l.views })) },
    { title: 'Pinanggalingan', rows: s.referrers.map((r) => ({ label: r.host, views: r.views })) },
  ]

  for (const g of groups) {
    const total = Math.max(1, g.rows.reduce((n, r) => n + r.views, 0))
    const block = el('div', {})
    block.append(txt('div', 'a-cellsub', g.title))
    for (const r of g.rows) {
      const pct = Math.round((r.views / total) * 100)
      block.append(
        el('div', { style: 'display:flex;align-items:center;gap:10px;margin-top:6px' },
          el('span', { style: 'min-width:8.5rem' }, r.label),
          el('div', { class: 'a-meter' }, el('div', { class: 'a-meterfill', style: `width:${pct}%` })),
          txt('span', 'a-cellsub', `${pct}%`)),
      )
    }
    mix.append(block)
  }
  mixCard.append(mix)

  lower.append(pathCard, mixCard)
  body.append(lower)

  /* ── What this does and does not know ─────────────────────────
     Stated in the UI, not just in a code comment. The person reading these
     numbers is deciding where to put barangay effort, and a number whose
     limits are invisible is a number that will be over-read. */
  body.append(
    el('div', { class: 'a-card', style: 'margin-top:24px' },
      txt('h2', 'a-legend', 'Ano ang ibig sabihin ng mga numerong ito'),
      el('ul', { class: 'a-help', style: 'margin-top:10px;padding-left:18px;display:grid;gap:6px' },
        txt('li', '', '"Pagbisita" ay bawat pagbukas ng tab — hindi bawat tao. Kung babalik ang isang tao bukas, dalawang bilang iyon.'),
        txt('li', '', 'Walang cookie, walang IP address, at walang itinatalang pangalan o kahit anong makakakilala sa bisita.'),
        txt('li', '', 'Hindi binibilang ang /ligtas at /ligtas/hotline. Kailangang gumana ang mga iyon kahit walang signal, kaya wala silang anumang hinihiling sa labas.'),
        txt('li', '', 'Hindi rin binibilang ang mga bisitang naka-Do Not Track o walang JavaScript. Ang tunay na bilang ay bahagyang mas mataas.')),
    ),
  )
}
