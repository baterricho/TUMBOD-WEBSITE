#!/usr/bin/env node
/**
 * Prepare a video for the hero slider.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS.
 *
 * A phone records at whatever bitrate the phone likes — typically 10 Mbps at
 * 1080p, which is right for an archive and wrong for a website. The two clips
 * this script was written for arrived at 42.6 MB and 9.4 MB, both 10 Mbps.
 *
 * 42.6 MB is not a large file on a laptop. On this island it is roughly six
 * minutes of a 1 Mbps connection and a visible bite out of a prepaid data
 * load, spent on the decorative element of a page whose actual job is to show
 * a hotline number. The existing hero clip runs at 1.5 Mbps and looks fine.
 *
 * So: every video that goes into the hero passes through here first.
 *
 * WHAT IT DOES, AND WHY EACH ONE
 *
 *   scale to 1280×720   The hero is a background behind a headline. Nobody
 *                       inspects it, and 1080p costs 2.25× the pixels for a
 *                       difference invisible under a scrim.
 *   H.264 high, CRF 26  Quality-targeted rather than bitrate-targeted: a still
 *                       shot of water gets small, a moving one gets the bits
 *                       it needs. Universally decodable, including on the old
 *                       Android WebViews this site is built for.
 *   -an                 STRIP THE AUDIO ENTIRELY. The hero autoplays, and
 *                       autoplay only works muted, so the audio track can
 *                       never be heard by anyone. It is pure weight.
 *   +faststart          Moves the index to the front of the file so playback
 *                       can begin before the download finishes. Without it a
 *                       "streaming" background waits for the last byte.
 *   poster frame        A JPEG from 1s in, used as the `poster` so the slide
 *                       shows something immediately and reserves its box.
 *
 * USAGE
 *   node scripts/optimise-video.mjs <input.mp4> <output-basename>
 *   → public/media/<output-basename>.mp4
 *   → public/media/<output-basename>-poster.jpg
 * ═══════════════════════════════════════════════════════════════════
 */
import { spawnSync } from 'node:child_process'
import { existsSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'media')

const [input, name] = process.argv.slice(2)

if (!input || !name) {
  console.error('usage: node scripts/optimise-video.mjs <input> <output-basename>')
  process.exit(1)
}
if (!existsSync(input)) {
  console.error(`not found: ${input}`)
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

const mp4 = join(OUT_DIR, `${name}.mp4`)
const poster = join(OUT_DIR, `${name}-poster.jpg`)

const mb = (p) => (statSync(p).size / 1048576).toFixed(1)

function run(args, label) {
  const r = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  if (r.status !== 0) {
    console.error(`${label} failed:\n${r.stderr?.toString().split('\n').slice(-15).join('\n')}`)
    process.exit(1)
  }
}

console.log(`in   ${input}  ${mb(input)} MB`)

run(
  [
    '-y', '-i', input,
    // `force_original_aspect_ratio=decrease` never upscales: a clip already
    // smaller than 720p is left alone rather than blown up into blur.
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-preset', 'slow',
    '-crf', '26',
    // Cap the peak so one busy scene cannot spike a 2G connection.
    '-maxrate', '2M', '-bufsize', '4M',
    '-pix_fmt', 'yuv420p',   // required by Safari and older Android decoders
    '-movflags', '+faststart',
    '-an',
    mp4,
  ],
  'video encode',
)

run(['-y', '-ss', '1', '-i', mp4, '-frames:v', '1', '-q:v', '4', poster], 'poster frame')

console.log(`out  ${mp4}  ${mb(mp4)} MB`)
console.log(`     ${poster}  ${(statSync(poster).size / 1024).toFixed(0)} KB`)
console.log(`saved ${(100 - (statSync(mp4).size / statSync(input).size) * 100).toFixed(0)}%`)
