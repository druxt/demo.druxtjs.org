import fs from 'fs'
import path from 'path'
import axios from 'axios'

/**
 * Writes llms.txt and llms-full.txt beside the generated site.
 *
 * The demo list comes from Drupal over JSON:API, the same way every page on
 * this site gets its content, because that is what the site demonstrates. The
 * Tome export under drupal/content seeds the database and is not read here.
 */
export default function () {
  const get = async (url) =>
    (await axios.get(url, { headers: { Accept: 'application/vnd.api+json' } }))
      .data

  this.nuxt.hook('generate:done', async (generator) => {
    const { readDemos } = require('../lib/demos')
    const { buildLlmsTxt, buildLlmsFullTxt } = require('../lib/llms-txt')
    const { site } = require('../lib/site')

    const baseUrl = this.options.druxt.baseUrl
    const demos = await readDemos(baseUrl, get)
    if (!demos.length) {
      throw new Error(
        `seo-files: no published projects came back from ${baseUrl}`
      )
    }

    const dir = generator.nuxt.options.generate.dir
    const files = {
      'llms.txt': buildLlmsTxt(demos, site),
      'llms-full.txt': buildLlmsFullTxt(demos, site),
    }
    for (const [name, body] of Object.entries(files)) {
      await fs.promises.writeFile(path.join(dir, name), body)
    }

    const links = demos.reduce((n, demo) => n + demo.links.length, 0)
    console.info(
      `seo-files: wrote ${Object.keys(files).join(' and ')} for ${
        demos.length
      } demos and ${links} links, read from ${baseUrl}`
    )
  })
}
