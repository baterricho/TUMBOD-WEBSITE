/**
 * Run the dev server with demo content.
 *
 * A Node wrapper rather than `VAR=x astro dev`, which is not portable to
 * Windows shells — and the barangay's laptop may well be one.
 *
 * Usage: npm run dev:demo
 */

import { spawn } from 'node:child_process'

console.log('Dev server in DEMO mode — all content is sample data.\n')

// `shell: true` is required on Windows to resolve npx at all.
spawn('npx', ['astro', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PUBLIC_DEMO_MODE: 'true' },
})
