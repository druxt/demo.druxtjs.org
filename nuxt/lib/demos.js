/**
 * The demo projects as documents, read from Drupal's JSON:API at build time
 * for llms.txt and llms-full.txt.
 *
 * This site is a demonstration of Druxt rendering Drupal over JSON:API, so
 * the files it publishes about itself come through that same path. The Tome
 * export seeds the database and is not a source the frontend reads.
 *
 * Pure over the fetched data, so the shaping can be tested without Drupal.
 */

/** Published projects, in the order the Projects view uses: title ascending. */
const COLLECTION = {
  path: '/jsonapi/node/project',
  query: 'filter[status]=1&sort=title&include=field_items',
}

/** The entities a body field produces, decoded in one pass. */
const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
  '#8217': '’',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
}

/**
 * Strips tags and collapses whitespace, so body HTML reads as one line.
 *
 * Entities are decoded in a single pass. Decoding them one after another
 * double-unescapes: `&amp;lt;` would become `&lt;` and then `<`.
 *
 * @param {string} html - A body field's value.
 * @returns {string} The text, on one line.
 */
const toText = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(ENTITIES, name)
        ? ENTITIES[name]
        : match
    )
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The resources a relationship points at, resolved against `included`.
 *
 * @param {object} resource - The resource holding the relationship.
 * @param {string} name - The relationship's field name.
 * @param {object[]} included - The response's included resources.
 * @returns {object[]} The referenced resources, in order.
 */
const related = (resource, name, included) => {
  const data = ((resource.relationships || {})[name] || {}).data
  return []
    .concat(data || [])
    .map((ref) => included.find((r) => r.id === ref.id && r.type === ref.type))
    .filter(Boolean)
}

/**
 * One project resource as a document.
 *
 * @param {object} resource - A project node.
 * @param {object[]} included - The response's included resources.
 * @returns {object} `{ title, summary, links }`.
 */
const documentOf = (resource, included = []) => {
  const a = resource.attributes || {}
  const body = a.body || {}
  return {
    title: a.title,
    summary: toText(body.processed || body.value || ''),
    links: related(resource, 'field_items', included)
      .map((item) => (item.attributes || {}).field_link)
      .filter((link) => link && link.uri)
      .map((link) => ({ title: link.title, uri: link.uri })),
  }
}

/**
 * Every published project, following the collection's pages.
 *
 * @param {string} baseUrl - Drupal's origin.
 * @param {function} get - `async (url) => data`: a JSON:API GET.
 * @returns {Promise<object[]>} Documents from documentOf().
 */
async function readDemos(baseUrl, get) {
  const demos = []
  let url = `${baseUrl}${COLLECTION.path}?${COLLECTION.query}&page[limit]=50`
  while (url) {
    const data = await get(url)
    for (const resource of data.data || [])
      demos.push(documentOf(resource, data.included))
    url = ((data.links || {}).next || {}).href || null
  }
  return demos
}

module.exports = { COLLECTION, toText, related, documentOf, readDemos }
