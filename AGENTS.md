# Agent instructions

The source of demo.druxtjs.org: a Drupal backend with committed Tome content
in `drupal/`, and a Nuxt front end built with Druxt in `nuxt/`.

## Rules

- **This repository is public.** Nothing that resolves only on a private
  network may reach a tracked file: no internal URLs, hostnames, repository
  names or issue links, in any file including comments and patch descriptions.
  `npm run lint:private` enforces the URL-shaped half of this.
- **Conventional Commits**, and the same for pull request and merge request
  titles. This repository squash-merges, so the title becomes the commit
  subject, and a prose title breaks the next push to the target branch.
- **No AI tool is credited.** No co-author trailer naming an assistant, no
  generated-with footer, no session link, in commits, descriptions or tracked
  files. The work is the author's. The commit-msg hook rejects it locally, and
  `npm run lint:attribution` and the pipelines check the rest.
- **Prose is linted with Vale.** The ai-tells style is the minimum, and it
  covers the markdown a change touches, its commit messages and the merge
  request description. `npm run lint:prose:install` once, then
  `npm run lint:prose`.
- **The coverage floor in `nuxt/jest.config.js` goes up, never down.**
- **Never regenerate visual baselines locally.** Use the manual `visual:update`
  job.
- **Content changes are exported, not hand-edited.** Change content in Drupal,
  then `drush tome:export` and commit `drupal/content` and `drupal/config`.

## Layout

| Path                | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `drupal/`           | Drupal 11 backend. `config/` and `content/` are the site              |
| `drupal/.devtools/` | Docker-free provisioning: assemble, provision, start, stop, info      |
| `nuxt/`             | The Nuxt 2 front end. Generated to `nuxt/dist` and served statically  |
| `scripts/`          | Repository tooling: the private-host lint and the static server       |
| `test/e2e/`         | Playwright against the generated site, baselines in `__snapshots__`   |
| `.githooks/`        | Committed hooks, enabled by `npm install`                             |
| `.gitlab/scripts/`  | Content checks and merge-request automation, copied from the standard |

## Commands

```sh
npm install          # tooling, and enables the git hooks
npm run setup        # assemble, provision and start the backend
npm run dev          # Nuxt dev server on port 3000
npm run generate     # static site into nuxt/dist
npm test             # unit tests, coverage floor enforced
npm run test:e2e     # Playwright, needs the generated site
npm run lint         # every linter except prose
npm run lint:prose   # Vale, after `npm run lint:prose:install`
```

## Toolchain

Node 16.18.1 and PHP 8.4, pinned in `mise.toml` and `.nvmrc`. Nuxt 2 builds on
webpack 4, which does not run on a newer Node. The Playwright jobs run on the
Playwright image's own Node, because Playwright 1.44 is the last release that
supports Node 16 and the visual comparisons only need a served directory.
