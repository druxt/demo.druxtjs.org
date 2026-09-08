# Contributing

This site follows the Druxt repository standard. The checks below run in the
git hooks and in both pipelines, so a change that passes locally passes in
review.

## Setup

```sh
npm install
npm run setup
```

`npm install` enables the committed hooks in `.githooks/`. If you install with
scripts disabled, run `npm run hooks:install` by hand, or the hooks stay on
disk doing nothing.

## Commits

Conventional Commits, and the same for pull request and merge request titles.
This repository squash-merges, so the title becomes the commit subject, and a
prose title breaks the next push to the target branch.

No AI tool is credited. A co-author trailer naming an assistant, a
generated-with footer or a session link is rejected wherever it appears, in
commits, descriptions and tracked files. The commit-msg hook catches it first,
and `npm run lint:attribution` and the pipelines check the rest.

## Prose

Markdown, commit messages and merge request descriptions are linted with Vale
and the ai-tells style, which rejects em-dashes and the other tells of
generated text. Run `npm run lint:prose:install` once, then `npm run
lint:prose`.

## Tests

`npm test` runs the unit tests with a coverage floor measured from this
repository's own tests. The floor in `nuxt/jest.config.js` goes up, never
down. If a change drops coverage, the change needs a test.

`npm run test:e2e` runs Playwright against the generated site. Generate it
first with `npm run generate`, or point `PLAYWRIGHT_BASE_URL` at a running
copy.

## Visual baselines

Never regenerate visual baselines locally. Use the manual `visual:update`
pipeline job and commit the PNGs it produces. Chromium renders differently
across architectures, and a locally generated baseline is a permanent false
diff for everyone else.

## Private hosts

This repository is public. Nothing that resolves only on a private network may
reach a tracked file, as a URL, in a comment or in a patch description. `npm
run lint:private` checks the URL-shaped half of this and runs in the pipeline.
