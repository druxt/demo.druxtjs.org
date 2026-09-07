import fs from 'fs'
import path from 'path'

// BASE_URL from the environment, else from the repository-root .env that
// drupal/.devtools/start writes, else the DDEV project URL. A developer never
// copies the backend URL between terminals.
function readDotenvBaseUrl() {
  try {
    const contents = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    const match = contents.match(/^\s*BASE_URL\s*=\s*(.*?)\s*$/m)
    return match ? match[1].replace(/^(['"])(.*)\1$/, '$2') : null
  } catch {
    return null
  }
}

const baseUrl =
  process.env.BASE_URL ||
  readDotenvBaseUrl() ||
  'http://druxtjs-org-demo.ddev.site'

// GA4. Same approach as the docs site: a plain gtag.js snippet rather than a
// module, because @nuxtjs/google-analytics only ever spoke the Universal
// Analytics protocol (dead since July 2023, so it silently collected nothing)
// and its Nuxt 3 replacement nuxt-gtag needs @nuxt/kit, which cannot run on
// this frozen Nuxt 2 stack.
const GA_MEASUREMENT_ID = 'G-Y1ZRHGDGSD'

// The id is interpolated into an inline script; the shape assertion keeps any
// other character class off the page.
if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) {
  throw new Error('GA_MEASUREMENT_ID must match G-[A-Z0-9]+')
}

// The docs site gates analytics on LAGOON_ENVIRONMENT_TYPE. That does not
// exist here: this site builds in GitHub Actions and deploys to Netlify, so
// neither Lagoon's nor Netlify's own CONTEXT variable is set at build time.
// The workflow sets ANALYTICS_ENABLED only for main, so deploy previews and
// local builds never send hits into the real property.
const analyticsEnabled = process.env.ANALYTICS_ENABLED === 'true'

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://demo.druxtjs.org'
const SITE_NAME = 'DruxtJS'
const SITE_TITLE = 'DruxtJS demos'
const SITE_DESCRIPTION =
  'Live demos of Drupal sites decoupled with Nuxt, each a working backend and Druxt frontend deployed from a public repository you can read, fork and run yourself.'
const TWITTER_HANDLE = '@DruxtJS'
const OG_IMAGE = SITE_ORIGIN + '/og-druxt.png'

export default {
  // Target full static build.
  target: 'static',

  // Ensure the root route is generated and crawled.
  generate: {
    routes: ['/'],
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: SITE_TITLE,
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: SITE_DESCRIPTION },
      { name: 'format-detection', content: 'telephone=no' },

      // Share tags. The docs site learned that leaving these to a module
      // produced wrong values (og:title came out as the project name), so
      // they are declared explicitly here and kept next to the canonical URL
      // so the two cannot drift apart.
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:site_name', property: 'og:site_name', content: SITE_NAME },
      { hid: 'og:title', property: 'og:title', content: SITE_TITLE },
      {
        hid: 'og:description',
        property: 'og:description',
        content: SITE_DESCRIPTION,
      },
      { hid: 'og:url', property: 'og:url', content: SITE_ORIGIN + '/' },
      { hid: 'og:image', property: 'og:image', content: OG_IMAGE },
      { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
      { hid: 'og:image:height', property: 'og:image:height', content: '630' },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      { hid: 'twitter:site', name: 'twitter:site', content: TWITTER_HANDLE },
      { hid: 'twitter:title', name: 'twitter:title', content: SITE_TITLE },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: SITE_DESCRIPTION,
      },
      { hid: 'twitter:image', name: 'twitter:image', content: OG_IMAGE },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { hid: 'canonical', rel: 'canonical', href: SITE_ORIGIN + '/' },
    ],
    script: [
      ...(analyticsEnabled
        ? [
            {
              hid: 'ga-src',
              src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
              async: true,
            },
            {
              hid: 'ga-init',
              innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{site_section:'demos'});`,
            },
          ]
        : []),
    ],
    __dangerouslyDisableSanitizersByTagID: {
      ...(analyticsEnabled ? { 'ga-init': ['innerHTML'] } : {}),
    },
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/analytics.client.js'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxt/postcss8',
    ['@nuxt/image', { domains: [baseUrl] }],
    'druxt-entity',
    'druxt-views',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/tailwindcss'],

  // DruxtJS: https://druxtjs.org
  druxt: {
    baseUrl,
    // Enable the API proxy.
    proxy: { api: true },
    // Disable deprecated Entity fields.
    entity: { components: { fields: false } },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
