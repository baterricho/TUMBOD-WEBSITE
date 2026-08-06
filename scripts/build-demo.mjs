/**
 * Build the site with demo content.
 *
 * A Node wrapper rather than an inline env assignment, because `VAR=x cmd`
 * is not portable to Windows shells and the barangay's laptop may well be one.
 *
 * Usage: npm run build:demo
 * Then:  npm run preview
 */

import { spawnSync } from 'node:child_process'

console.log('Building in DEMO mode — output must NOT be deployed to production.\n')

const env = { ...process.env, PUBLIC_DEMO_MODE: 'true' }

// `shell: true` is required on Windows to resolve npx at all.
const build = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', env, shell: true })
if (build.status !== 0) process.exit(build.status ?? 1)

const check = spawnSync(process.execPath, ['scripts/check-demo.mjs'], {
  stdio: 'inherit',
  env,
})
process.exit(check.status ?? 0)
