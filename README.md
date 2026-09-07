<!-- vale off -->
<!-- The alt text describes what the banner shows, which is the framework wordmark. -->
<a href="https://druxtjs.org">
  <img src=".github/banner.svg" alt="DruxtJS: The Fully Decoupled Drupal Framework">
</a>
<!-- vale on -->

# demo.druxtjs.org

[![CI](https://github.com/druxt/demo.druxtjs.org/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/druxt/demo.druxtjs.org/actions/workflows/ci.yml)
[![Deploy](https://github.com/druxt/demo.druxtjs.org/actions/workflows/build-test-deploy.yml/badge.svg?branch=main)](https://github.com/druxt/demo.druxtjs.org/actions/workflows/build-test-deploy.yml)

The source of [demo.druxtjs.org](https://demo.druxtjs.org): a list of live
Drupal sites decoupled with Nuxt, each built with [Druxt](https://druxtjs.org)
from a public repository.

The site is two applications in one repository. `drupal/` is a Drupal backend
whose configuration and content are committed and imported by
[Tome](https://www.drupal.org/project/tome). `nuxt/` is a Nuxt front end that
reads that backend through Druxt at generate time and produces a static site,
which Netlify serves.

## Run it locally

You need PHP 8.1 with the `pdo_sqlite`, `gd`, `intl` and `zip` extensions,
Composer, and Node 16. [mise](https://mise.jdx.dev) installs the pinned
versions from `mise.toml`, and the dev container in `.devcontainer/` has them
already.

```sh
npm install         # tooling, and enables the git hooks
npm run setup       # installs Drupal, imports the content, starts the backend
npm run dev         # the Nuxt dev server on http://localhost:3000
```

`setup` provisions a throwaway SQLite database from `drupal/config` and
`drupal/content`, starts PHP's built-in server on the first free port from
8888, and writes its URL to `.env` as `BASE_URL`. The Nuxt side reads that
file, so nothing is copied between terminals. `npm run stop` stops the
backend and `npm run info` prints where it is.

DDEV still works for the backend: `cd drupal && ddev start && ddev
drupal-install` installs the same site, and `nuxt/nuxt.config.js` falls back
to the DDEV URL when no `BASE_URL` is set.

## Commands

| Command                  | What it does                                                    |
| ------------------------ | --------------------------------------------------------------- |
| `npm run setup`          | Assemble, provision and start the backend                       |
| `npm run assemble`       | `composer install` for the backend                              |
| `npm run provision`      | Install the site from configuration and import the Tome content |
| `npm run start` / `stop` | Start or stop the PHP built-in server                           |
| `npm run dev`            | Nuxt dev server against the running backend                     |
| `npm run generate`       | Generate the static site into `nuxt/dist`                       |
| `npm run serve`          | Serve `nuxt/dist` on port 3000, as the tests do                 |
| `npm test`               | Unit tests, with the coverage floor enforced                    |
| `npm run test:e2e`       | Playwright against the generated site                           |
| `npm run lint`           | Every linter except prose                                       |
| `npm run lint:prose`     | Vale, after `npm run lint:prose:install` once                   |

## Content

The demo list is Drupal content. Add or change a demo in Drupal, then export
it with `drush tome:export` from `drupal/` and commit the result under
`drupal/content` and `drupal/config`. The pipeline provisions a fresh site from
those files on every change, so what is committed is what gets built.

## Deployment

Pushes to `main` build and deploy to Netlify from
`.github/workflows/build-test-deploy.yml`. Every pull request gets a Netlify
deploy preview, posted as a comment. Analytics is only enabled on `main`, so
previews and local builds never send hits to the production property.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). This repository follows the Druxt
repository standard, and the git hooks and both pipelines check it.

## License

[MIT](LICENSE)
