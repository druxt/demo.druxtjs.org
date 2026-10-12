#!/usr/bin/env node
/**
 * Pre-flight checks for the Tome demo content.
 *
 * The build needs ddev and a Drupal install before anything can be rendered,
 * so these run against drupal/content directly and catch the failures that
 * have actually happened here: a tile whose screenshot was of a different
 * site, and an advertised link that returned 502 for two years.
 *
 * Usage:
 *   node scripts/check-content.mjs            # structure + files, no network
 *   node scripts/check-content.mjs --links    # also resolve every outbound link
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(ROOT, 'drupal/content')
const PUBLIC = path.join(ROOT, 'drupal/files/public')
const checkLinks = process.argv.includes('--links')

const fail = []
const warn = []
const read = (f) => JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8'))
const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json'))
const has = (f) => files.includes(f)
const uuidOf = (f) => f.split('.')[1]

/** Reads intrinsic dimensions so a claimed width/height can be checked. */
const probe = (abs) => {
  const b = fs.readFileSync(abs)
  if (b.slice(1, 4).toString() === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), kind: 'png' }
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const c = b.slice(12, 16).toString()
    if (c === 'VP8X') return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1, kind: 'webp' }
    if (c === 'VP8L') {
      const n = b.readUInt32LE(21)
      return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1, kind: 'webp' }
    }
    if (c === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff, kind: 'webp' }
  }
  return null
}

const reached = new Set()
const links = []

for (const nf of files.filter((f) => f.startsWith('node.'))) {
  const node = read(nf)
  const title = node.title?.[0]?.value ?? nf
  if (!node.status?.[0]?.value) continue

  if (!(node.body?.[0]?.value || '').trim()) warn.push(`${title}: published with an empty body`)
  if (!(node.field_items || []).length) fail.push(`${title}: published with no tiles`)

  for (const item of node.field_items || []) {
    const pf = `paragraph.${item.target_uuid}.json`
    if (!has(pf)) { fail.push(`${title}: missing ${pf}`); continue }
    reached.add(item.target_uuid)
    const para = read(pf)

    const link = para.field_link?.[0]
    if (!link?.uri) fail.push(`${title}: a tile has no link`)
    else if (!link.title) fail.push(`${title}: ${link.uri} has no label`)
    else links.push([title, link.title, link.uri])

    for (const m of para.field_media || []) {
      const mf = `media.${m.target_uuid}.json`
      if (!has(mf)) { fail.push(`${title} / ${link?.title}: missing ${mf}`); continue }
      reached.add(m.target_uuid)
      const media = read(mf)
      const image = media.field_media_image?.[0]
      if (!image) { fail.push(`${title} / ${link?.title}: media has no image`); continue }
      if (!(image.alt || '').trim()) fail.push(`${title} / ${link?.title}: image has no alt text`)

      const ff = `file.${image.target_uuid}.json`
      if (!has(ff)) { fail.push(`${title} / ${link?.title}: missing ${ff}`); continue }
      reached.add(image.target_uuid)
      const file = read(ff)
      const rel = file.uri[0].value.replace('public://', '')
      const abs = path.join(PUBLIC, rel)
      if (!fs.existsSync(abs)) { fail.push(`${title} / ${link?.title}: ${rel} is not on disk`); continue }

      const size = fs.statSync(abs).size
      if (file.filesize[0].value !== size) fail.push(`${title} / ${link?.title}: ${rel} is ${size} bytes, entity says ${file.filesize[0].value}`)

      const real = probe(abs)
      if (!real) warn.push(`${title} / ${link?.title}: ${rel} dimensions not readable`)
      else if (real.w !== image.width || real.h !== image.height) {
        fail.push(`${title} / ${link?.title}: ${rel} is ${real.w}x${real.h}, entity says ${image.width}x${image.height}`)
      }
      const mime = file.filemime[0].value
      if (real && !mime.endsWith(real.kind)) fail.push(`${title} / ${link?.title}: ${rel} is ${real.kind}, entity says ${mime}`)
      if (size > 400 * 1024) warn.push(`${title} / ${link?.title}: ${rel} is ${(size / 1024).toFixed(0)}KB, over the 400KB tile budget`)
    }
  }
}

const orphans = files.filter((f) => /^(paragraph|media|file)\./.test(f) && !reached.has(uuidOf(f)))
orphans.forEach((o) => warn.push(`orphan, not reachable from a published node: ${o}`))

if (checkLinks) {
  const seen = new Map()
  for (const [title, label, uri] of links) {
    if (seen.has(uri)) continue
    seen.set(uri, true)
    let status = 0
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 20000)
      let res = await fetch(uri, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal })
      if (res.status === 405 || res.status === 501) res = await fetch(uri, { redirect: 'follow', signal: ctrl.signal })
      clearTimeout(t)
      status = res.status
    } catch (e) {
      fail.push(`${title} / ${label}: ${uri} did not respond (${e.cause?.code || e.name})`)
      continue
    }
    if (status >= 400) fail.push(`${title} / ${label}: ${uri} returned HTTP ${status}`)
    else console.log(`  ok   ${String(status).padEnd(3)} ${uri}`)
  }
}

console.log(`\nchecked ${files.filter((f) => f.startsWith('node.')).length} nodes, ${links.length} tiles${checkLinks ? ', links resolved' : ', links not checked (pass --links)'}`)
warn.forEach((w) => console.log(`WARN  ${w}`))
fail.forEach((f) => console.log(`FAIL  ${f}`))
if (fail.length) { console.log(`\n${fail.length} failure(s)`); process.exit(1) }
console.log(warn.length ? `\n${warn.length} warning(s), no failures` : '\nno problems')
