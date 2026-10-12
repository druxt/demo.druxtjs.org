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
import http from 'node:http'
import https from 'node:https'
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

/**
 * Reads intrinsic dimensions so a claimed width and height can be checked.
 *
 * Covers every format the image field accepts (png gif jpg jpeg webp), because
 * an unreadable image fails below: a format this could not read would
 * otherwise pass unchecked.
 *
 * @param {string} abs - Absolute path to the image.
 * @returns {?object} `{w, h, kind}`, or null when the bytes are not an image.
 */
const probe = (abs) => {
  const b = fs.readFileSync(abs)

  if (b.length > 24 && b.slice(1, 4).toString('latin1') === 'PNG') {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), kind: 'png' }
  }

  if (b.length > 10 && b.slice(0, 3).toString('latin1') === 'GIF') {
    return { w: b.readUInt16LE(6), h: b.readUInt16LE(8), kind: 'gif' }
  }

  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    // Walk the segment chain to the frame header, which carries the size.
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = b[i + 1]
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2
        continue
      }
      const length = b.readUInt16BE(i + 2)
      const isFrame =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      if (isFrame) {
        return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5), kind: 'jpeg' }
      }
      i += 2 + length
    }
    return null
  }

  if (
    b.length > 30 &&
    b.slice(0, 4).toString('latin1') === 'RIFF' &&
    b.slice(8, 12).toString('latin1') === 'WEBP'
  ) {
    const chunk = b.slice(12, 16).toString('latin1')
    if (chunk === 'VP8X') {
      return {
        w: (b.readUIntLE(24, 3) & 0xffffff) + 1,
        h: (b.readUIntLE(27, 3) & 0xffffff) + 1,
        kind: 'webp',
      }
    }
    if (chunk === 'VP8L') {
      const n = b.readUInt32LE(21)
      return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1, kind: 'webp' }
    }
    if (chunk === 'VP8 ') {
      return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff, kind: 'webp' }
    }
  }

  return null
}

/**
 * Checks the bytes an image should end with.
 *
 * The header alone cannot show truncation: a PNG's dimensions live in its
 * first 24 bytes, so a file cut in half still probes as a valid image. Each
 * format has a terminator or a recorded length, and that is what goes missing.
 *
 * @param {Buffer} b - The whole file.
 * @param {string} kind - The kind `probe` reported.
 * @returns {boolean} True when the file reaches its proper end.
 */
const isComplete = (b, kind) => {
  if (kind === 'png') return b.slice(-8, -4).toString('latin1') === 'IEND'
  if (kind === 'gif') return b[b.length - 1] === 0x3b
  if (kind === 'jpeg') return b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9
  // RIFF records its own payload length, which truncation leaves overstated.
  if (kind === 'webp') return b.readUInt32LE(4) === b.length - 8
  return true
}

/** The extensions each probed kind may be recorded as. */
const KIND_EXTENSIONS = {
  png: ['png'],
  gif: ['gif'],
  jpeg: ['jpg', 'jpeg'],
  webp: ['webp'],
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
    if (!has(pf)) {
      fail.push(`${title}: missing ${pf}`)
      continue
    }
    reached.add(item.target_uuid)
    const para = read(pf)

    const link = para.field_link?.[0]
    if (!link?.uri) fail.push(`${title}: a tile has no link`)
    else if (!link.title) fail.push(`${title}: ${link.uri} has no label`)
    else links.push([title, link.title, link.uri])

    for (const m of para.field_media || []) {
      const mf = `media.${m.target_uuid}.json`
      if (!has(mf)) {
        fail.push(`${title} / ${link?.title}: missing ${mf}`)
        continue
      }
      reached.add(m.target_uuid)
      const media = read(mf)
      const image = media.field_media_image?.[0]
      if (!image) {
        fail.push(`${title} / ${link?.title}: media has no image`)
        continue
      }
      if (!(image.alt || '').trim()) fail.push(`${title} / ${link?.title}: image has no alt text`)

      const ff = `file.${image.target_uuid}.json`
      if (!has(ff)) {
        fail.push(`${title} / ${link?.title}: missing ${ff}`)
        continue
      }
      reached.add(image.target_uuid)
      const file = read(ff)
      const rel = file.uri[0].value.replace('public://', '')
      const abs = path.join(PUBLIC, rel)
      if (!fs.existsSync(abs)) {
        fail.push(`${title} / ${link?.title}: ${rel} is not on disk`)
        continue
      }

      const size = fs.statSync(abs).size
      if (file.filesize[0].value !== size)
        fail.push(
          `${title} / ${link?.title}: ${rel} is ${size} bytes, entity says ${file.filesize[0].value}`
        )

      // A truncated or corrupt image whose recorded filesize still matches
      // would otherwise pass, so one that cannot be read fails rather than warns.
      const real = probe(abs)
      if (!real) {
        fail.push(`${title} / ${link?.title}: ${rel} is not a readable png, gif, jpeg or webp`)
      } else if (!isComplete(fs.readFileSync(abs), real.kind)) {
        fail.push(`${title} / ${link?.title}: ${rel} is a truncated ${real.kind}`)
      } else {
        if (real.w !== image.width || real.h !== image.height) {
          fail.push(
            `${title} / ${link?.title}: ${rel} is ${real.w}x${real.h}, entity says ${image.width}x${image.height}`
          )
        }
        const mime = file.filemime[0].value
        if (!KIND_EXTENSIONS[real.kind].some((ext) => mime === `image/${ext}`)) {
          fail.push(`${title} / ${link?.title}: ${rel} is ${real.kind}, entity says ${mime}`)
        }
      }
      if (size > 400 * 1024)
        warn.push(
          `${title} / ${link?.title}: ${rel} is ${(size / 1024).toFixed(0)}KB, over the 400KB tile budget`
        )
    }
  }
}

// Tome's dependency graph, which orders the import. An entity missing from it
// is created before the thing it points at, and the import dies with
// `No "paragraph" entity found with UUID ... for field "0"`.
const indexPath = path.join(CONTENT, 'meta', 'index.json')
if (!fs.existsSync(indexPath)) {
  fail.push('drupal/content/meta/index.json is missing')
} else {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const named = new Set(Object.keys(index))
  const onDisk = new Set(files.map((f) => f.replace(/\.json$/, '')))

  for (const name of onDisk)
    if (!named.has(name)) fail.push(`meta/index.json does not list ${name}`)
  for (const name of named)
    if (!onDisk.has(name)) fail.push(`meta/index.json lists ${name}, which is not on disk`)
  for (const [name, deps] of Object.entries(index)) {
    for (const dep of deps)
      if (!named.has(dep))
        fail.push(`meta/index.json: ${name} depends on ${dep}, which it does not list`)
  }

  // Every entity must come after everything it depends on.
  const created = new Set()
  for (const [name, deps] of Object.entries(index)) {
    const early = deps.filter((dep) => !created.has(dep))
    if (early.length) fail.push(`meta/index.json: ${name} is listed before ${early.join(', ')}`)
    created.add(name)
  }
}

const orphans = files.filter((f) => /^(paragraph|media|file)\./.test(f) && !reached.has(uuidOf(f)))
orphans.forEach((o) => warn.push(`orphan, not reachable from a published node: ${o}`))

/**
 * Fetches a URL's status with a real GET, following redirects.
 *
 * `node:https` rather than `fetch`: the repository's floor is Node 16.18.1,
 * where global fetch needs --experimental-fetch and is otherwise undefined.
 * GET rather than HEAD, because a host can answer 200 to HEAD and 502 to the
 * GET a visitor actually makes. The body is discarded once the status is in.
 *
 * @param {string} target - The URL to request.
 * @param {number} [depth] - Redirects followed so far.
 * @returns {Promise<number>} The final status code.
 */
const statusOf = (target, depth = 0) =>
  new Promise((resolve, reject) => {
    if (depth > 5) {
      reject(new Error('too many redirects'))
      return
    }
    const url = new URL(target)
    const client = url.protocol === 'http:' ? http : https
    const request = client.get(
      target,
      { headers: { 'user-agent': 'druxt-demo-link-check' }, timeout: 20000 },
      (response) => {
        const { statusCode, headers } = response
        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          response.resume()
          resolve(statusOf(new URL(headers.location, target).href, depth + 1))
          return
        }
        response.resume()
        response.on('end', () => resolve(statusCode))
      }
    )
    request.on('timeout', () => request.destroy(new Error('timed out')))
    request.on('error', reject)
  })

if (checkLinks) {
  const seen = new Map()
  for (const [title, label, uri] of links) {
    if (seen.has(uri)) continue
    seen.set(uri, true)
    let status = 0
    try {
      status = await statusOf(uri)
    } catch (e) {
      fail.push(`${title} / ${label}: ${uri} did not respond (${e.code || e.message})`)
      continue
    }
    if (status >= 400) fail.push(`${title} / ${label}: ${uri} returned HTTP ${status}`)
    else console.log(`  ok   ${String(status).padEnd(3)} ${uri}`)
  }
}

console.log(
  `\nchecked ${files.filter((f) => f.startsWith('node.')).length} nodes, ${links.length} tiles${checkLinks ? ', links resolved' : ', links not checked (pass --links)'}`
)
warn.forEach((w) => console.log(`WARN  ${w}`))
fail.forEach((f) => console.log(`FAIL  ${f}`))
if (fail.length) {
  console.log(`\n${fail.length} failure(s)`)
  process.exit(1)
}
console.log(warn.length ? `\n${warn.length} warning(s), no failures` : '\nno problems')
