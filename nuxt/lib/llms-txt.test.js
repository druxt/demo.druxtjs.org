/* global describe, expect, test */

import { readDemos } from './demos'
import { buildLlmsTxt, buildLlmsFullTxt, withUtm } from './llms-txt'

const site = {
  SITE_ORIGIN: 'https://demo.druxtjs.org',
  SITE_NAME: 'DruxtJS',
  SITE_DESCRIPTION: 'Live demos.',
}

const demos = [
  {
    title: 'Umami food magazine',
    summary: 'A food magazine.',
    links: [
      { title: 'Umami Go', uri: 'https://umami.demo.druxtjs.org/play' },
      {
        title: 'Source code',
        uri: 'https://github.com/druxt/umami.demo.druxtjs.org',
      },
    ],
  },
]

describe('llms.txt', () => {
  test('tags a bare URL, and leaves one that already has a query alone', () => {
    expect(withUtm('https://example.com/a')).toContain('?utm_source=llms-txt')
    expect(withUtm('https://example.com/a?b=1')).toBe(
      'https://example.com/a?b=1'
    )
  })

  test('opens with the heading and the summary blockquote', () => {
    const out = buildLlmsTxt(demos, site)
    expect(out.startsWith('# DruxtJS demos\n')).toBe(true)
    expect(out).toContain('> Live demos.')
  })

  test('gives every demo a section and every link a list item', () => {
    const out = buildLlmsTxt(demos, site)
    expect(out).toContain('## Umami food magazine')
    expect(out).toContain('A food magazine.')
    expect(out).toContain(
      '- [Umami Go](https://umami.demo.druxtjs.org/play?utm_source=llms-txt'
    )
  })

  test('the full text carries the prose and the untagged links', () => {
    const out = buildLlmsFullTxt(demos, site)
    expect(out).toContain('Source: https://demo.druxtjs.org/')
    expect(out).toContain('- Umami Go: https://umami.demo.druxtjs.org/play')
    expect(out).not.toContain('utm_source')
  })
})

describe('readDemos', () => {
  const content = require('path').join(
    __dirname,
    '..',
    '..',
    'drupal',
    'content'
  )

  test('reads only published projects, title ascending', () => {
    const found = readDemos(content)
    expect(found.length).toBeGreaterThan(0)
    expect(found.map((d) => d.title)).toEqual(
      [...found.map((d) => d.title)].sort()
    )
    expect(found.every((d) => d.links.length > 0)).toBe(true)
  })

  test('strips the body markup', () => {
    expect(readDemos(content).every((d) => !d.summary.includes('<'))).toBe(true)
  })
})
