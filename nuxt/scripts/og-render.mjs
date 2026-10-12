#!/usr/bin/env node
/**
 * Renders static/og-druxt.png from scripts/og-card.html.
 *
 * A browser rather than satori: the card is ordinary CSS, and Chromium is
 * already a dependency of the link check. pngquant is optional, as elsewhere.
 *
 * Usage: node scripts/og-render.mjs   (needs playwright resolvable)
 */
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const here = path.dirname(fileURLToPath(import.meta.url))
const card = path.join(here, 'og-card.html')
const out = path.join(here, '..', 'static', 'og-druxt.png')

const resolvePlaywright = () => {
  let globalRoot
  try {
    globalRoot = execFileSync('npm', ['root', '-g'], {
      encoding: 'utf8',
    }).trim()
  } catch (e) {
    /* optional */
  }
  for (const candidate of [
    process.env.PLAYWRIGHT_MODULE,
    'playwright',
    path.join(process.cwd(), 'node_modules', 'playwright'),
    globalRoot && path.join(globalRoot, 'playwright'),
  ].filter(Boolean)) {
    try {
      return require(candidate)
    } catch (e) {
      /* next */
    }
  }
  console.error(
    'playwright not found: `npm i --no-save playwright`, or set PLAYWRIGHT_MODULE'
  )
  process.exit(1)
}

const { chromium } = resolvePlaywright()
const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto('file://' + card, { waitUntil: 'load' })
await page.waitForTimeout(500)
await page.screenshot({ path: out })
await browser.close()

try {
  execFileSync(process.env.PNGQUANT || 'pngquant', [
    '--force',
    '--skip-if-larger',
    '--quality',
    '70-92',
    '--output',
    out,
    out,
  ])
} catch (e) {
  console.warn(
    'NOT optimized (pngquant unavailable); install pngquant and re-run'
  )
}
console.log('wrote ' + path.relative(process.cwd(), out))
