import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { get } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { resolveFile, serve } from '../scripts/serve.mjs'

// Node 16 compatible on purpose: this is the Node the site builds on, and a
// test that needs a newer one would only ever run in the pipeline.

const root = mkdtempSync(join(tmpdir(), 'serve-'))
mkdirSync(join(root, 'about'))
writeFileSync(join(root, 'index.html'), '<h1>home</h1>')
writeFileSync(join(root, 'about', 'index.html'), '<h1>about</h1>')
writeFileSync(join(root, 'robots.txt'), 'User-agent: *')

function request(url) {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => (body += chunk))
      response.on('end', () =>
        resolve({ status: response.statusCode, type: response.headers['content-type'], body })
      )
    }).on('error', reject)
  })
}

test('a directory resolves to its index.html', () => {
  assert.equal(resolveFile(root, '/about/'), join(root, 'about', 'index.html'))
  assert.equal(resolveFile(root, '/about'), join(root, 'about', 'index.html'))
})

test('a file resolves to itself, without its query string', () => {
  assert.equal(resolveFile(root, '/robots.txt?v=1'), join(root, 'robots.txt'))
})

test('a path that escapes the root resolves to nothing', () => {
  assert.equal(resolveFile(root, '/../../etc/passwd'), null)
  assert.equal(resolveFile(root, '/%2e%2e/%2e%2e/etc/passwd'), null)
})

test('a missing path resolves to nothing', () => {
  assert.equal(resolveFile(root, '/missing'), null)
})

test('the server serves generated routes and answers 404 elsewhere', async () => {
  const server = serve(root, 0)
  await new Promise((done) => server.on('listening', done))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const about = await request(`${base}/about/`)
    assert.equal(about.status, 200)
    assert.match(about.type, /text\/html/)
    assert.equal(about.body, '<h1>about</h1>')
    const missing = await request(`${base}/nope`)
    assert.equal(missing.status, 404)
  } finally {
    server.close()
  }
})
