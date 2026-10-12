/**
 * Reads the demo projects out of the Tome export.
 *
 * The build imports `drupal/content` into Drupal and the pages then read
 * JSON:API, so the same files are the honest source for the text files the
 * build writes beside them. Reading them directly keeps this pure and needs
 * no running backend.
 */
const fs = require('fs')
const path = require('path')

/** Strips tags and collapses whitespace, so body HTML reads as one line. */
const toText = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Collects every published project, in the view's order: title ascending.
 *
 * @param {string} dir - The Tome content directory.
 * @returns {object[]} Projects, each with a title, summary and links.
 */
const readDemos = (dir) => {
  const read = (name) =>
    JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
  const names = fs.readdirSync(dir)

  return names
    .filter((name) => name.startsWith('node.'))
    .map(read)
    .filter((node) => node.status && node.status[0] && node.status[0].value)
    .map((node) => ({
      title: node.title[0].value,
      summary: toText((node.body && node.body[0] && node.body[0].value) || ''),
      links: (node.field_items || [])
        .map((item) => {
          const file = `paragraph.${item.target_uuid}.json`
          if (!names.includes(file)) return null
          const link = (read(file).field_link || [])[0]
          return link ? { title: link.title, uri: link.uri } : null
        })
        .filter(Boolean),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

module.exports = { readDemos, toText }
