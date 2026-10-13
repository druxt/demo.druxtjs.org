/**
 * The site's identity, in one place.
 *
 * nuxt.config.js and the generated text files both read it, so a change to
 * the name or the description cannot land in one and miss the other.
 */
const site = {
  SITE_ORIGIN: process.env.SITE_ORIGIN || 'https://demo.druxtjs.org',
  SITE_NAME: 'DruxtJS',
  SITE_TITLE: 'Decoupled Drupal demos - DruxtJS',
  SITE_DESCRIPTION:
    'Live demos of decoupled Drupal: a Drupal backend serving JSON:API and a Nuxt frontend rendering it with Druxt. Each one is open source and runs from a public repository you can read, fork and run yourself.',
  TWITTER_HANDLE: '@DruxtJS',
}

module.exports = { site }
