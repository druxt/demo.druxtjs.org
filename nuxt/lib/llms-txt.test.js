/* global describe, expect, test */

import { buildLlmsTxt, buildLlmsFullTxt, withUtm } from './llms-txt'
import { documentOf, readDemos, toText } from './demos'

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
  test('tags a bare URL, and keeps a query and fragment it already has', () => {
    expect(withUtm('https://example.com/a')).toContain('?utm_source=llms-txt')
    expect(withUtm('https://example.com/a?b=1')).toBe(
      'https://example.com/a?b=1&utm_source=llms-txt&utm_medium=ai&utm_campaign=syndication'
    )
    expect(withUtm('https://example.com/a#frag')).toBe(
      'https://example.com/a?utm_source=llms-txt&utm_medium=ai&utm_campaign=syndication#frag'
    )
  })

  test('leaves a string it cannot parse exactly as written', () => {
    expect(withUtm('not a url')).toBe('not a url')
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

describe('toText', () => {
  test('decodes entities in one pass, so a double escape survives', () => {
    expect(toText('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;')
    expect(toText('&amp;amp;')).toBe('&amp;')
  })

  test('decodes the entities a body field produces, and leaves the rest', () => {
    expect(toText('<p>Drupal&#8217;s own</p>')).toBe('Drupal’s own')
    expect(toText('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>')
    expect(toText('&unknown; stays')).toBe('&unknown; stays')
  })
})

describe('documentOf', () => {
  const node = {
    type: 'node--project',
    id: 'n1',
    attributes: {
      title: 'Umami food magazine',
      body: { processed: '<p>A food magazine.</p>' },
    },
    relationships: {
      field_items: {
        data: [
          { type: 'paragraph--link', id: 'p1' },
          { type: 'paragraph--link', id: 'p2' },
        ],
      },
    },
  }
  const included = [
    {
      type: 'paragraph--link',
      id: 'p1',
      attributes: {
        field_link: { uri: 'https://a.example', title: 'Frontend' },
      },
    },
    {
      type: 'paragraph--link',
      id: 'p2',
      attributes: {
        field_link: { uri: 'https://b.example', title: 'Source code' },
      },
    },
  ]

  test('reads the title, the body as text and the links in order', () => {
    expect(documentOf(node, included)).toEqual({
      title: 'Umami food magazine',
      summary: 'A food magazine.',
      links: [
        { title: 'Frontend', uri: 'https://a.example' },
        { title: 'Source code', uri: 'https://b.example' },
      ],
    })
  })

  test('survives a project whose paragraphs were not included', () => {
    expect(documentOf(node, []).links).toEqual([])
  })

  test('drops a paragraph with no link rather than emitting an empty one', () => {
    const partial = [
      included[0],
      { type: 'paragraph--link', id: 'p2', attributes: {} },
    ]
    expect(documentOf(node, partial).links).toHaveLength(1)
  })
})

describe('readDemos', () => {
  test('follows links.next until the collection ends', async () => {
    const pages = {
      'http://backend/jsonapi/node/project?filter[status]=1&sort=title&include=field_items&page[limit]=50': {
        data: [{ attributes: { title: 'One' }, relationships: {} }],
        included: [],
        links: { next: { href: 'http://backend/page2' } },
      },
      'http://backend/page2': {
        data: [{ attributes: { title: 'Two' }, relationships: {} }],
        included: [],
        links: {},
      },
    }
    const seen = []
    const get = (url) => {
      seen.push(url)
      return Promise.resolve(pages[url])
    }
    const out = await readDemos('http://backend', get)
    expect(out.map((d) => d.title)).toEqual(['One', 'Two'])
    expect(seen).toHaveLength(2)
  })

  test('asks Drupal for published projects, sorted, with the paragraphs', async () => {
    let asked = ''
    await readDemos('http://backend', (url) => {
      asked = url
      return Promise.resolve({ data: [], links: {} })
    })
    expect(asked).toContain('/jsonapi/node/project')
    expect(asked).toContain('filter[status]=1')
    expect(asked).toContain('sort=title')
    expect(asked).toContain('include=field_items')
  })
})
