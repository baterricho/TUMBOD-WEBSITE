/**
 * Admin UI primitives — DOM helpers, icons, and the four feedback surfaces
 * (toast, modal, confirm, empty/skeleton).
 *
 * EVERYTHING BUILDS NODES, NOTHING BUILDS HTML STRINGS. Every value rendered
 * in this admin was typed into a form by a person, and a barangay announcement
 * is not a trusted template. `el()` and `txt()` set `textContent`, so a stored
 * `<script>` is text on the screen rather than script in the page — the one
 * class of bug that would turn a content tool into a way to attack every
 * visitor to the public site.
 */

/* ── DOM ──────────────────────────────────────────────────────── */

type Attrs = Record<string, string | number | boolean | undefined>

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...kids: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false || v === null) continue
    if (k === 'class') n.className = String(v)
    else if (k === 'html') n.innerHTML = String(v) // ONLY for our own icon markup
    else n.setAttribute(k, String(v))
  }
  for (const kid of kids) {
    if (kid === null || kid === undefined || kid === false) continue
    n.append(kid)
  }
  return n
}

/** Text node in a tagged wrapper. The safe default for every value. */
export const txt = (
  tag: keyof HTMLElementTagNameMap,
  cls: string,
  value: unknown,
): HTMLElement => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  n.textContent = value === null || value === undefined ? '' : String(value)
  return n
}

export const clear = (node: Element) => {
  while (node.firstChild) node.removeChild(node.firstChild)
}

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel)

/* ── Icons ────────────────────────────────────────────────────
   Same 24px grid, single stroke weight and visual family as the public site's
   icon set, so the admin does not look like a different product. Inline, so
   there is no icon font and no library. */

const PATHS: Record<string, string> = {
  dashboard: 'M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z',
  megaphone: 'M4 10v4h4l7 5V5l-7 5H4Zm14-1a4 4 0 0 1 0 6',
  calendar: 'M4 6h16v15H4V6Zm0 5h16M9 3v4M15 3v4',
  warning: 'M12 3 2 20h20L12 3Zm0 6v6m0 3v.5',
  phone: 'M6 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2Z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Zm-3 9 2 2 4-4',
  build: 'M4 20h16M8 20V9l6-4v15M14 12h5v8',
  image: 'M3 5h18v14H3V5Zm0 10 5-5 4 4 3-3 6 6',
  palm: 'M12 21V9M12 9 7 4M12 9l5-5M6 21c2-4 4-6 6-6s4 2 6 6',
  store: 'M8 8h8l2 12H6L8 8Zm0 0c0-2 1-4 4-4s4 2 4 4',
  help: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-13v.5M12 12v5',
  download: 'M12 3v12m0 0-4-4m4 4 4-4M4 19h16',
  doc: 'M6 3h8l4 4v14H6V3Zm8 0v4h4M9 12h6M9 16h6',
  settings: 'M4 7l2 2 3-3M4 15l2 2 3-3M13 8h7M13 16h7',
  slides: 'M3 5h18v11H3V5Zm4 15h10',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5-2 5 5',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm11-15 4 4',
  restore: 'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  copy: 'M9 9h11v11H9V9Zm-4 6H4V4h11v1',
  eye: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeoff: 'M3 3l18 18M10 5.1A9 9 0 0 1 22 12s-1.2 1.9-3.3 3.5M6.6 6.6C3.9 8.3 2 12 2 12s4 6 10 6c1.2 0 2.3-.2 3.3-.6',
  up: 'M12 19V5m0 0-6 6m6-6 6 6',
  down: 'M12 5v14m0 0 6-6m-6 6-6-6',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12l5 5L20 6',
  chevronR: 'M9 5l7 7-7 7',
  drag: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',
  upload: 'M12 17V5m0 0-4 4m4-4 4 4M4 19h16',
  folder: 'M3 6h6l2 3h10v11H3V6Z',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
}

export function icon(name: string, size = 18): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.75')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(NS, 'path')
  path.setAttribute('d', PATHS[name] ?? PATHS['doc']!)
  svg.append(path)
  return svg
}

/* ── Buttons ──────────────────────────────────────────────────── */

export function button(
  label: string,
  opts: { variant?: string; iconName?: string; small?: boolean; onClick?: () => void; title?: string } = {},
): HTMLButtonElement {
  const cls = [
    'a-btn',
    opts.variant ? `a-btn--${opts.variant}` : '',
    opts.small ? 'a-btn--sm' : '',
    !label ? 'a-btn--icon' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const b = el('button', { type: 'button', class: cls, title: opts.title ?? label })
  if (opts.iconName) b.append(icon(opts.iconName, opts.small ? 14 : 16))
  if (label) b.append(label)
  if (opts.onClick) b.addEventListener('click', opts.onClick)
  return b
}

/* ── Toast ────────────────────────────────────────────────────── */

let toastTimer: number | undefined

export function toast(message: string, kind: 'ok' | 'bad' = 'ok') {
  let t = document.getElementById('a-toast')
  if (!t) {
    t = el('div', { id: 'a-toast', role: 'status', 'aria-live': 'polite' })
    document.body.append(t)
  }
  clear(t)
  t.append(icon(kind === 'ok' ? 'check' : 'warning', 16), message)
  t.className = `a-toast a-toast--${kind} is-open`
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => t!.classList.remove('is-open'), 4200)
}

/* ── Confirm ──────────────────────────────────────────────────
   Replaces `window.confirm`, which cannot say what is about to happen in more
   than one sentence and cannot make the destructive choice look destructive.
   Resolves false on Escape and on backdrop click — the safe default. */

export function confirmDialog(opts: {
  title: string
  body: string
  confirmLabel?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    const wrap = el('div', { class: 'a-modalwrap', role: 'dialog', 'aria-modal': 'true' })
    const modal = el('div', { class: 'a-modal' })

    const done = (value: boolean) => {
      wrap.remove()
      document.removeEventListener('keydown', onKey)
      resolve(value)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') done(false)
    }

    modal.append(
      txt('h2', 'a-modaltitle', opts.title),
      txt('p', 'a-modalbody', opts.body),
      el(
        'div',
        { class: 'a-modalbar' },
        button('Huwag', { variant: 'ghost', onClick: () => done(false) }),
        button(opts.confirmLabel ?? 'Tuloy', {
          variant: opts.danger ? 'danger' : 'primary',
          onClick: () => done(true),
        }),
      ),
    )

    wrap.append(modal)
    wrap.addEventListener('click', (ev) => {
      if (ev.target === wrap) done(false)
    })
    document.addEventListener('keydown', onKey)
    document.body.append(wrap)

    // Focus the safe option, not the destructive one.
    ;(modal.querySelector('.a-btn') as HTMLButtonElement | null)?.focus()
  })
}

/* ── Prompt ───────────────────────────────────────────────────── */

export function promptDialog(opts: {
  title: string
  label: string
  value?: string
}): Promise<string | null> {
  return new Promise((resolve) => {
    const wrap = el('div', { class: 'a-modalwrap', role: 'dialog', 'aria-modal': 'true' })
    const input = el('input', { class: 'a-input', value: opts.value ?? '' }) as HTMLInputElement
    const form = el('form', { class: 'a-modal' })

    const done = (v: string | null) => {
      wrap.remove()
      resolve(v)
    }

    form.append(
      txt('h2', 'a-modaltitle', opts.title),
      el('div', { class: 'a-field' }, txt('label', 'a-label', opts.label), input),
      el(
        'div',
        { class: 'a-modalbar' },
        button('Huwag', { variant: 'ghost', onClick: () => done(null) }),
        el('button', { type: 'submit', class: 'a-btn a-btn--primary' }, 'I-save'),
      ),
    )
    form.addEventListener('submit', (ev) => {
      ev.preventDefault()
      done(input.value.trim() || null)
    })
    wrap.addEventListener('click', (ev) => {
      if (ev.target === wrap) done(null)
    })

    wrap.append(form)
    document.body.append(wrap)
    input.focus()
    input.select()
  })
}

/* ── Empty + skeleton ─────────────────────────────────────────── */

export function emptyState(opts: {
  iconName?: string
  title: string
  body: string
  action?: HTMLElement
}): HTMLElement {
  return el(
    'div',
    { class: 'a-empty' },
    el('div', { class: 'a-emptyicon' }, icon(opts.iconName ?? 'doc', 22)),
    txt('p', 'a-emptytitle', opts.title),
    txt('p', 'a-emptybody', opts.body),
    opts.action,
  )
}

export function skeleton(kind: 'row' | 'card' | 'stat', count = 1): DocumentFragment {
  const frag = document.createDocumentFragment()
  for (let i = 0; i < count; i++) frag.append(el('div', { class: `a-skel a-skel--${kind}` }))
  return frag
}

/* ── Formatting ───────────────────────────────────────────────── */

export function fmtDate(value: unknown, withTime = false): string {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

/** "2 oras ang nakalipas" — coarse on purpose; the exact minute never matters
    in an activity feed. */
export function fmtRelative(value: unknown): string {
  if (!value) return ''
  const then = new Date(String(value)).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.round((Date.now() - then) / 1000)
  if (secs < 60) return 'ngayon lang'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins} min ang nakalipas`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} oras ang nakalipas`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} araw ang nakalipas`
  return fmtDate(value)
}

export function fmtBytes(n: number): string {
  if (!n) return '0 KB'
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
