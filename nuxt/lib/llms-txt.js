/**
 * Builders for `/llms.txt` and `/llms-full.txt`, the plain-text site index
 * described at https://llmstxt.org: an H1, a blockquote summary, orienting
 * prose, then H2 sections of `- [name](url): notes` links.
 *
 * Unlike sitemap.xml, every URL carries a description of what it is.
 *
 * Pure and side-effect free, so they can be tested without a build.
 */

/** UTM params identifying assistant-sourced clicks. */
const UTM = {
  utm_source: 'llms-txt',
  utm_medium: 'ai',
  utm_campaign: 'syndication',
}

/**
 * Adds the tracking params to a URL's query.
 *
 * Any query the URL already has is kept, and the fragment stays after the
 * query where a browser expects it. Appending the params as a string instead
 * dropped them from a URL that already had a query, and put them inside the
 * fragment on a URL that had one.
 *
 * @param {string} url - An absolute URL.
 * @returns {string} The URL with the tracking params in its query.
 */
const withUtm = (url) => {
  try {
    const parsed = new URL(url)
    for (const [key, value] of Object.entries(UTM))
      parsed.searchParams.set(key, value)
    return parsed.href
  } catch (e) {
    // Not a URL this can parse, so leave it exactly as the editor wrote it.
    return url
  }
}

/** One `- [name](url): notes` list item. */
const item = (title, url, notes) =>
  `- [${title}](${withUtm(url)})` + (notes ? `: ${notes}` : '')

/**
 * The index: what each demo is, and every link it offers.
 *
 * @param {object[]} demos - Projects from `readDemos`.
 * @param {object} site - SITE_ORIGIN, SITE_NAME and SITE_DESCRIPTION.
 * @returns {string} The llms.txt body.
 */
const buildLlmsTxt = (demos, site) => {
  const lines = [
    `# ${site.SITE_NAME} demos`,
    '',
    `> ${site.SITE_DESCRIPTION}`,
    '',
    'Decoupled Drupal, end to end: a Drupal backend serving JSON:API and a Nuxt frontend rendering it with Druxt, which maps Drupal entities, view modes, views and menus onto Vue components. Each demo runs from a public repository, so the code behind any screen here can be read and run.',
    '',
  ]

  for (const demo of demos) {
    lines.push(`## ${demo.title}`, '')
    if (demo.summary) lines.push(demo.summary, '')
    for (const link of demo.links) lines.push(item(link.title, link.uri, ''))
    lines.push('')
  }

  lines.push(
    '## About',
    '',
    item(
      'Druxt documentation',
      'https://druxtjs.org',
      'The framework these demos are built with'
    ),
    item(
      'Druxt on Drupal.org',
      'https://www.drupal.org/project/druxt',
      'The Drupal module'
    ),
    item(
      'Source on GitHub',
      'https://github.com/druxt/druxt.js',
      'The Nuxt packages'
    ),
    ''
  )

  return lines.join('\n')
}

/**
 * The full text: the same index, plus each demo's prose, so an assistant needs
 * no second fetch to answer what a demo is.
 *
 * @param {object[]} demos - Projects from `readDemos`.
 * @param {object} site - SITE_ORIGIN, SITE_NAME and SITE_DESCRIPTION.
 * @returns {string} The llms-full.txt body.
 */
const buildLlmsFullTxt = (demos, site) => {
  const lines = [
    `# ${site.SITE_NAME} demos`,
    '',
    `> ${site.SITE_DESCRIPTION}`,
    '',
    `Source: ${site.SITE_ORIGIN}/`,
    '',
  ]

  for (const demo of demos) {
    lines.push(`## ${demo.title}`, '')
    if (demo.summary) lines.push(demo.summary, '')
    if (demo.links.length) {
      lines.push('Links:', '')
      for (const link of demo.links) lines.push(`- ${link.title}: ${link.uri}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

module.exports = { buildLlmsTxt, buildLlmsFullTxt, withUtm, item }
