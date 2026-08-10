/**
 * Shared context for the admin screens.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS (ARCHITECTURE-REVIEW.md §3.3).
 *
 * `main.ts` reached 1,538 lines holding login, the shell, routing, the
 * dashboard, analytics, the activity feed, the hero slider, collection lists
 * and record forms. Every admin change touched one file, and two people
 * working on different screens touched the same file.
 *
 * A screen needs four things from the app: the Supabase client, the shared
 * state, the breadcrumb setter and the ability to navigate. This module owns
 * exactly those, so a screen can live in its own file without importing
 * `main.ts` — which it cannot do, because `main.ts` imports the screens. That
 * cycle is the reason a naive extraction of this file fails.
 *
 * NOT A DEPENDENCY-INJECTION FRAMEWORK. Four values and a registration
 * function. The admin is a sidebar, a table and a form; anything more
 * ceremonious than this would be the abstraction the brief warns against.
 * ═══════════════════════════════════════════════════════════════════
 *
 * NOTE ON SAFETY. The admin has no automated coverage — it is `noindex` and
 * deliberately outside every route list, so Playwright never opens it. This
 * extraction was therefore done by moving whole functions unchanged and
 * verifying each screen by hand in a browser. Do the same to any further
 * split, and prefer moving a function verbatim over improving it on the way.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Collection } from '@/lib/cms/collections'
import { $, clear, txt } from './ui'

export interface State {
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

export const state: State = {
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

/*
 * Set once at boot by `main.ts`, before any screen renders.
 *
 * `sb` is deliberately NOT created here. The client needs configuration that
 * only exists at runtime, and a module that creates it on import would fire
 * before `main.ts` has checked that the configuration is present at all —
 * turning a clear "Walang configuration" message into a stack trace.
 */
let client: SupabaseClient | null = null
let collections: Collection[] = []
let navigate: (route: string) => void = () => {}

export function initContext(opts: {
  sb: SupabaseClient
  collections: Collection[]
  navigate: (route: string) => void
}) {
  client = opts.sb
  collections = opts.collections
  navigate = opts.navigate
}

/** The Supabase client. Throws rather than returning null: a screen that runs
 *  before boot is a bug, and a null-check at forty call sites is not the fix. */
export function sb(): SupabaseClient {
  if (!client) throw new Error('admin: context used before initContext()')
  return client
}

export const collectionFor = (table: string) => collections.find((c) => c.table === table)

/** Navigate to a route. Registered by `main.ts` so screens never import it. */
export const go = (route: string) => navigate(route)

/** The breadcrumb trail above the page title. */
export function crumbs(...parts: string[]) {
  const host = $('#a-crumbs')
  if (!host) return
  clear(host)
  parts.forEach((p, i) => {
    if (i) host.append(txt('span', '', '/'))
    host.append(i === parts.length - 1 ? txt('strong', '', p) : txt('span', '', p))
  })
}
