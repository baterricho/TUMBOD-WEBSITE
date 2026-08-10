/**
 * Media library — upload, optimise, browse, pick.
 *
 * OPTIMISATION HAPPENS IN THE BROWSER, BEFORE UPLOAD. There is no image
 * pipeline on this project and adding one would mean a server, which
 * DECISION-cms.md spent a page explaining we do not want. A canvas re-encode
 * costs nothing, runs on the machine that already has the file open, and
 * solves the actual problem: a 4 MB phone photograph landing on the homepage
 * of a site whose whole design is about people on 2G.
 *
 * WHAT IT DOES, IN ORDER:
 *   1. Downscale so the long edge is at most 2000px. Nothing on this site is
 *      displayed larger, and a 4000px original is 4× the bytes for pixels
 *      nobody sees.
 *   2. Re-encode to WebP at q0.82 when the browser can, JPEG otherwise.
 *   3. Generate a 480px thumbnail, stored beside the original.
 *   4. KEEP THE ORIGINAL. Uploaded untouched to `originals/`, because a
 *      re-encode is lossy and the barangay's only copy of a photograph must
 *      not be one we degraded.
 *
 * SVG and PDF are passed through byte-for-byte — rasterising a vector defeats
 * the point of it, and a PDF is not an image.
 */
import { el, txt, clear, icon, button, toast, confirmDialog, promptDialog, emptyState, fmtBytes, fmtDate, skeleton } from './ui'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface MediaRow {
  id: string
  storage_path: string
  thumb_path: string | null
  filename: string
  mime_type: string
  bytes: number
  width: number | null
  height: number | null
  folder: string
  tags: string[]
  alt_fil: string | null
  alt_en: string | null
  has_consent: boolean
  deleted_at: string | null
  created_at: string
}

const BUCKET = 'media'
const MAX_EDGE = 2000
const THUMB_EDGE = 480
/** Formats we re-encode. Everything else is uploaded exactly as supplied. */
const RASTER = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Video was rejected until 2026-08-07, and NOT because of this file.
 *
 * The Supabase storage bucket carried `allowed_mime_types` of images + PDF and
 * a 10 MB cap, so an upload was refused by the server no matter what the UI
 * offered. The bucket now accepts mp4/webm/quicktime up to 50 MB. If video
 * uploads start failing again, check the bucket before reading any of this.
 */
export const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const

/** `startsWith` rather than a list membership test: a browser may report
 *  `video/mp4; codecs=...` on some platforms, and the prefix is what matters. */
const isVideo = (mime: string) => mime.startsWith('video/')

/**
 * The size past which a video is a problem rather than a file.
 *
 * Not a hard limit — the barangay may legitimately want to keep an original.
 * It is the point at which the uploader says so plainly, because a 40 MB clip
 * on the homepage is roughly six minutes of a 1 Mbps connection and a visible
 * bite out of a prepaid load. `scripts/optimise-video.mjs` turns a camera
 * original into something around 2 MB per 10 seconds.
 */
const VIDEO_WARN_BYTES = 8 * 1024 * 1024

/**
 * A poster frame, grabbed from the video itself.
 *
 * Without this the library shows a generic document icon for every clip, and
 * an editor picking a hero video has to guess from the filename. Seeking to 1s
 * rather than 0 avoids the black frame most cameras start on.
 *
 * Fails soft: a codec the browser cannot decode simply gets no thumbnail,
 * which is the same place we were before.
 */
async function videoPoster(file: File): Promise<{ blob: Blob; w: number; h: number } | null> {
  const url = URL.createObjectURL(file)
  try {
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'metadata'
    v.src = url

    await new Promise<void>((resolve, reject) => {
      const fail = () => reject(new Error('decode'))
      v.onloadedmetadata = () => {
        // Never seek past the end: an 0.5s clip has no frame at 1s, and the
        // `seeked` event would never fire.
        v.currentTime = Math.min(1, (v.duration || 1) / 2)
      }
      v.onseeked = () => resolve()
      v.onerror = fail
      setTimeout(fail, 10_000)
    })

    const scale = Math.min(1, THUMB_EDGE / Math.max(v.videoWidth, v.videoHeight))
    const w = Math.round(v.videoWidth * scale)
    const h = Math.round(v.videoHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d')?.drawImage(v, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.72))
    return blob ? { blob, w: v.videoWidth, h: v.videoHeight } : null
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

let sb: SupabaseClient
let baseUrl = ''

export function initMedia(client: SupabaseClient, supabaseUrl: string) {
  sb = client
  baseUrl = supabaseUrl
}

export const publicUrl = (path: string) =>
  path.startsWith('/') || path.startsWith('http')
    ? path
    : `${baseUrl}/storage/v1/object/public/${BUCKET}/${path}`

/** `tumbod-falls.jpg` → `tumbod-falls`. Keeps names readable in the library. */
const slugify = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file'

/* ── Optimisation ─────────────────────────────────────────────── */

interface Encoded {
  blob: Blob
  ext: string
  mime: string
  width: number
  height: number
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Hindi mabuksan ang larawan.'))
    }
    img.src = url
  })
}

async function encode(img: HTMLImageElement, maxEdge: number): Promise<Encoded> {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)

  // Feature-detect rather than assume: Safari gained WebP encoding late, and
  // a browser that cannot encode it returns a PNG with a webp mime, silently.
  const webpOk = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  const mime = webpOk ? 'image/webp' : 'image/jpeg'

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, 0.82))
  if (!blob) throw new Error('Hindi ma-optimise ang larawan.')

  return { blob, ext: webpOk ? 'webp' : 'jpg', mime, width: w, height: h }
}

/* ── Upload ───────────────────────────────────────────────────── */

export interface UploadHandle {
  cancel(): void
}

async function uploadOne(
  file: File,
  folder: string,
  onProgress: (pct: number, note?: string) => void,
): Promise<MediaRow> {
  const stamp = Date.now().toString(36)
  const base = `${folder}/${slugify(file.name)}-${stamp}`

  let main: Blob = file
  let mime = file.type
  let ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  let width: number | null = null
  let height: number | null = null
  let thumbPath: string | null = null

  if (RASTER.includes(file.type)) {
    onProgress(10, 'Ino-optimise…')
    const img = await loadImage(file)
    const enc = await encode(img, MAX_EDGE)

    width = enc.width
    height = enc.height

    /*
     * ONLY KEEP THE RE-ENCODE IF IT IS ACTUALLY SMALLER.
     *
     * "Convert to WebP" is not unconditionally a saving. A JPEG that is
     * already compressed and already under the size cap gets no downscale, and
     * re-encoding it at q0.82 can come out LARGER — the first upload through
     * this path turned a 141 KB JPEG into a 179 KB WebP, which is the opposite
     * of the point on a site designed for 2G.
     *
     * So the two are measured against each other and the smaller one wins. The
     * dimensions are recorded either way, and the thumbnail is generated either
     * way, because those are useful regardless of which body we ship.
     */
    if (enc.blob.size < file.size) {
      main = enc.blob
      mime = enc.mime
      ext = enc.ext
    } else {
      main = file
      mime = file.type
      ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    }

    // Thumbnail, stored next to it under a predictable name so the library
    // grid never downloads a 2000px file to draw a 180px card.
    onProgress(25, 'Gumagawa ng thumbnail…')
    const thumb = await encode(img, THUMB_EDGE)
    thumbPath = `${base}-thumb.${thumb.ext}`
    await sb.storage.from(BUCKET).upload(thumbPath, thumb.blob, {
      contentType: thumb.mime,
      upsert: true,
    })

    // The untouched original. Lossy re-encoding is not reversible and this may
    // be the barangay's only copy.
    onProgress(45, 'Iniingatan ang orihinal…')
    await sb.storage.from(BUCKET).upload(`originals/${slugify(file.name)}-${stamp}.${file.name.split('.').pop()}`, file, {
      contentType: file.type,
      upsert: true,
    })
  } else if (isVideo(file.type)) {
    /*
     * Video is uploaded UNTOUCHED — there is no in-browser re-encoder here.
     *
     * ffmpeg.wasm would be ~30 MB of dependency for the admin bundle and
     * minutes of work on the phones this barangay owns. So the compression
     * step lives outside the browser, in `scripts/optimise-video.mjs`, and
     * what happens here is: record the real dimensions, grab a poster so the
     * library is browsable, and warn if the file is large.
     */
    onProgress(15, 'Kinukuha ang poster…')
    const poster = await videoPoster(file)
    if (poster) {
      width = poster.w
      height = poster.h
      thumbPath = `${base}-thumb.jpg`
      await sb.storage.from(BUCKET).upload(thumbPath, poster.blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
    }
  }

  onProgress(70, 'Ina-upload…')
  const path = `${base}.${ext}`
  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, main, { contentType: mime, upsert: true })
  if (upErr) throw new Error(upErr.message)

  onProgress(90, 'Isinasapinal…')
  const { data, error } = await sb
    .from('media')
    .insert({
      storage_path: path,
      thumb_path: thumbPath,
      filename: file.name,
      mime_type: mime,
      bytes: main.size,
      width,
      height,
      folder,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  onProgress(100)
  return data as MediaRow
}

/* ── Library view ─────────────────────────────────────────────── */

interface LibraryState {
  rows: MediaRow[]
  search: string
  folder: string
  showDeleted: boolean
}

const state: LibraryState = { rows: [], search: '', folder: 'all', showDeleted: false }

export const FOLDERS = [
  { value: 'general', label: 'Pangkalahatan' },
  { value: 'hero', label: 'Hero slider' },
  { value: 'news', label: 'Balita' },
  { value: 'tourism', label: 'Turismo' },
  { value: 'gallery', label: 'Larawan' },
  { value: 'officials', label: 'Mga opisyal' },
  { value: 'projects', label: 'Proyekto' },
  { value: 'documents', label: 'Dokumento' },
]

async function loadMedia() {
  const q = sb.from('media').select('*').order('created_at', { ascending: false })
  const { data, error } = state.showDeleted ? await q : await q.is('deleted_at', null)
  if (error) {
    toast(error.message, 'bad')
    return
  }
  state.rows = (data ?? []) as MediaRow[]
}

function visible(): MediaRow[] {
  const term = state.search.trim().toLowerCase()
  return state.rows.filter((r) => {
    if (state.folder !== 'all' && r.folder !== state.folder) return false
    if (!term) return true
    return (
      r.filename.toLowerCase().includes(term) ||
      (r.alt_fil ?? '').toLowerCase().includes(term) ||
      r.tags.some((t) => t.toLowerCase().includes(term))
    )
  })
}

function lightbox(row: MediaRow) {
  const wrap = el('div', { class: 'a-lightbox', role: 'dialog', 'aria-modal': 'true' })
  const close = () => {
    wrap.remove()
    document.removeEventListener('keydown', onKey)
  }
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') close()
  }
  wrap.append(
    el('img', { src: publicUrl(row.storage_path), alt: row.alt_fil ?? row.filename }),
    el('div', { class: 'a-lightbar' }, button('Isara', { variant: 'ghost', iconName: 'close', onClick: close })),
  )
  wrap.addEventListener('click', (ev) => {
    if (ev.target === wrap) close()
  })
  document.addEventListener('keydown', onKey)
  document.body.append(wrap)
}

/** Renders the library into `host`. `onPick` turns it into a picker. */
export async function renderMediaLibrary(
  host: HTMLElement,
  onPick?: (row: MediaRow) => void,
) {
  clear(host)

  const drop = el(
    'div',
    { class: 'a-drop', tabindex: '0', role: 'button' },
    icon('upload', 26),
    txt('p', 'a-dropmain', 'I-drop ang mga larawan dito'),
    txt('p', '', 'o pindutin para pumili — JPG, PNG, WebP, SVG, PDF (hanggang 10 MB)'),
  )

  const fileInput = el('input', {
    type: 'file',
    multiple: true,
    // Must stay in step with the bucket's `allowed_mime_types`. A type offered
    // here but refused there produces a server error the editor cannot act on.
    accept:
      'image/jpeg,image/png,image/webp,image/svg+xml,image/gif,application/pdf,video/mp4,video/webm,video/quicktime',
    style: 'display:none',
  }) as HTMLInputElement

  const queue = el('div', { class: 'a-queue' })
  const grid = el('div', { class: 'a-mediagrid' })

  /* Toolbar: folder filter, search, archive toggle. */
  const search = el('input', { type: 'search', placeholder: 'Hanapin sa pangalan, tag, o paglalarawan…' }) as HTMLInputElement
  search.value = state.search
  search.addEventListener('input', () => {
    state.search = search.value
    paint()
  })

  const folderSel = el('select', { class: 'a-select' }) as HTMLSelectElement
  folderSel.append(el('option', { value: 'all' }, 'Lahat ng folder'))
  for (const f of FOLDERS) folderSel.append(el('option', { value: f.value }, f.label))
  folderSel.value = state.folder
  folderSel.addEventListener('change', () => {
    state.folder = folderSel.value
    paint()
  })

  const uploadFolder = el('select', { class: 'a-select', title: 'Saan ilalagay' }) as HTMLSelectElement
  for (const f of FOLDERS) uploadFolder.append(el('option', { value: f.value }, `→ ${f.label}`))

  const archiveBtn = button(state.showDeleted ? 'Itago ang binura' : 'Ipakita ang binura', {
    variant: 'ghost',
    iconName: state.showDeleted ? 'eyeoff' : 'eye',
    onClick: async () => {
      state.showDeleted = !state.showDeleted
      await loadMedia()
      void renderMediaLibrary(host, onPick)
    },
  })

  host.append(
    el(
      'div',
      { class: 'a-toolbar' },
      el('div', { class: 'a-search' }, icon('search', 16), search),
      folderSel,
      uploadFolder,
      archiveBtn,
    ),
    drop,
    fileInput,
    queue,
    grid,
  )

  /* ── Upload wiring ── */

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length) return

    for (const file of list) {
      const bar = el('div', { class: 'a-qfill' })
      const note = txt('span', 'a-cellsub', 'Naghihintay…')
      const item = el(
        'div',
        { class: 'a-qitem' },
        el('div', {}, txt('div', 'a-qname', file.name), note),
        txt('span', 'a-cellsub', fmtBytes(file.size)),
        el('div', { class: 'a-qbar' }, bar),
      )
      queue.append(item)

      /*
       * Say it before the upload, not after.
       *
       * A large video uploads perfectly happily and then costs every visitor
       * on the island real money. The editor is the only person who can
       * prevent that, and only if they are told while they can still act.
       */
      if (isVideo(file.type) && file.size > VIDEO_WARN_BYTES) {
        const warn = txt(
          'div',
          'a-cellsub',
          `⚠ Malaki ang video na ito (${fmtBytes(file.size)}). Sa mabagal na signal, ` +
            'mabigat itong i-download. Mas mabuti kung pinaliit muna bago i-upload.',
        )
        warn.style.color = 'var(--amber, #b45309)'
        item.append(warn)
      }

      try {
        const row = await uploadOne(file, uploadFolder.value, (pct, msg) => {
          bar.style.width = `${pct}%`
          if (msg) note.textContent = msg
        })
        note.textContent = 'Tapos na'
        state.rows.unshift(row)
        paint()
        window.setTimeout(() => item.remove(), 1200)
      } catch (err) {
        item.classList.add('is-error')
        bar.style.width = '100%'
        note.textContent = err instanceof Error ? err.message : 'Nabigo'
        // Retry, because the common cause is a dropped island connection and
        // re-selecting six files by hand is a punishment for bad signal.
        item.append(
          button('Subukan muli', {
            small: true,
            iconName: 'restore',
            onClick: () => {
              item.remove()
              void handleFiles([file])
            },
          }),
        )
      }
    }
  }

  drop.addEventListener('click', () => fileInput.click())
  drop.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      fileInput.click()
    }
  })
  fileInput.addEventListener('change', () => {
    if (fileInput.files) void handleFiles(fileInput.files)
    fileInput.value = ''
  })
  for (const evt of ['dragenter', 'dragover']) {
    drop.addEventListener(evt, (ev) => {
      ev.preventDefault()
      drop.classList.add('is-over')
    })
  }
  for (const evt of ['dragleave', 'drop']) {
    drop.addEventListener(evt, (ev) => {
      ev.preventDefault()
      drop.classList.remove('is-over')
    })
  }
  drop.addEventListener('drop', (ev) => {
    const dt = (ev as DragEvent).dataTransfer
    if (dt?.files) void handleFiles(dt.files)
  })

  /* ── Grid ── */

  function paint() {
    clear(grid)
    const rows = visible()

    if (!rows.length) {
      grid.append(
        emptyState({
          iconName: 'image',
          title: state.search ? 'Walang tugma' : 'Wala pang larawan',
          body: state.search
            ? 'Subukan ang ibang salita, o palitan ang folder.'
            : 'I-drop ang mga larawan sa itaas para simulan ang library.',
        }),
      )
      return
    }

    for (const row of rows) {
      const isImage = row.mime_type.startsWith('image/')

      const card = el('div', { class: 'a-mediacard' })

      const thumb = el('button', {
        class: 'a-mediathumb',
        type: 'button',
        title: 'Buksan nang buo',
      }) as HTMLButtonElement

      const video = isVideo(row.mime_type)

      if (isImage || (video && row.thumb_path)) {
        const img = el('img', {
          src: publicUrl(row.thumb_path ?? row.storage_path),
          alt: row.alt_fil ?? row.filename,
          loading: 'lazy',
          decoding: 'async',
          style: 'width:100%;height:100%;object-fit:cover;display:block',
        }) as HTMLImageElement
        // SVGs get no thumbnail, and rows created before `thumb_path` existed
        // have none recorded. Both fall back to the full file. A VIDEO must
        // not: falling back would put the whole clip in an <img> that can
        // never render it, and download it to draw nothing.
        img.addEventListener('error', () => {
          if (video) {
            thumb.replaceChildren(icon('slides', 28))
            return
          }
          img.src = publicUrl(row.storage_path)
        })
        thumb.append(img)

        // A poster is indistinguishable from a photograph without this.
        if (video) {
          const badge = el('span', { class: 'a-mediakind' }, icon('slides', 13), 'VIDEO')
          thumb.append(badge)
        }
      } else if (video) {
        thumb.append(icon('slides', 28))
      } else {
        thumb.append(icon('doc', 28))
      }

      thumb.addEventListener('click', () => {
        if (isImage) lightbox(row)
        else window.open(publicUrl(row.storage_path), '_blank')
      })

      const meta = el(
        'div',
        { class: 'a-mediameta' },
        txt('p', 'a-medianame', row.filename),
        txt(
          'p',
          'a-mediasub',
          `${row.width && row.height ? `${row.width}×${row.height} · ` : ''}${fmtBytes(row.bytes)} · ${fmtDate(row.created_at)}`,
        ),
      )

      const bar = el('div', { class: 'a-mediabar' })

      if (onPick) {
        bar.append(
          button('Piliin', {
            small: true,
            variant: 'primary',
            iconName: 'check',
            onClick: () => onPick(row),
          }),
        )
      }

      bar.append(
        button('', {
          small: true,
          iconName: 'copy',
          title: 'Kopyahin ang URL',
          onClick: async () => {
            await navigator.clipboard.writeText(publicUrl(row.storage_path))
            toast('Nakopya ang URL.')
          },
        }),
        button('', {
          small: true,
          iconName: 'edit',
          title: 'Palitan ang pangalan',
          onClick: async () => {
            const name = await promptDialog({
              title: 'Palitan ang pangalan',
              label: 'Pangalan ng file',
              value: row.filename,
            })
            if (!name) return
            const { error } = await sb.from('media').update({ filename: name }).eq('id', row.id)
            if (error) return toast(error.message, 'bad')
            row.filename = name
            paint()
            toast('Napalitan ang pangalan.')
          },
        }),
        button('', {
          small: true,
          iconName: 'download',
          title: 'I-download',
          onClick: () => window.open(publicUrl(row.storage_path), '_blank'),
        }),
      )

      if (row.deleted_at) {
        card.style.opacity = '0.6'
        bar.append(
          button('Ibalik', {
            small: true,
            iconName: 'restore',
            onClick: async () => {
              const { error } = await sb.from('media').update({ deleted_at: null }).eq('id', row.id)
              if (error) return toast(error.message, 'bad')
              row.deleted_at = null
              paint()
              toast('Naibalik.')
            },
          }),
        )
      } else {
        bar.append(
          button('', {
            small: true,
            variant: 'danger',
            iconName: 'trash',
            title: 'Burahin',
            onClick: async () => {
              const ok = await confirmDialog({
                title: 'Burahin ang larawan?',
                body: 'Itatago ito sa library. Hindi ito mawawala nang tuluyan — maibabalik ito mamaya. Kung ginagamit ito sa website, mawawala ang larawan doon.',
                confirmLabel: 'Burahin',
                danger: true,
              })
              if (!ok) return
              const { error } = await sb
                .from('media')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', row.id)
              if (error) return toast(error.message, 'bad')
              row.deleted_at = new Date().toISOString()
              if (!state.showDeleted) state.rows = state.rows.filter((r) => r.id !== row.id)
              paint()
              toast('Nabura. Mababalik ito mula sa "Ipakita ang binura".')
            },
          }),
        )
      }

      card.append(thumb, meta, bar)
      grid.append(card)
    }
  }

  grid.append(skeleton('card', 8))
  await loadMedia()
  paint()
}

/* ── Picker modal ─────────────────────────────────────────────
   Used by every image field in the admin, so choosing a picture is the same
   interaction everywhere and no field grows its own uploader. */

export function pickMedia(): Promise<MediaRow | null> {
  return new Promise((resolve) => {
    const wrap = el('div', { class: 'a-modalwrap', role: 'dialog', 'aria-modal': 'true' })
    const modal = el('div', { class: 'a-modal', style: 'width:min(100%,940px);max-height:86vh;overflow:auto' })
    const host = el('div', {})

    const done = (row: MediaRow | null) => {
      wrap.remove()
      document.removeEventListener('keydown', onKey)
      resolve(row)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') done(null)
    }

    modal.append(
      el(
        'div',
        { style: 'display:flex;align-items:center;gap:12px' },
        txt('h2', 'a-modaltitle', 'Pumili ng larawan'),
        el('div', { style: 'margin-left:auto' }, button('Isara', { variant: 'ghost', iconName: 'close', onClick: () => done(null) })),
      ),
      host,
    )
    wrap.append(modal)
    wrap.addEventListener('click', (ev) => {
      if (ev.target === wrap) done(null)
    })
    document.addEventListener('keydown', onKey)
    document.body.append(wrap)

    void renderMediaLibrary(host, (row) => done(row))
  })
}
