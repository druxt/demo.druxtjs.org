// Root tooling only: the provisioning wrappers in scripts/ and the Playwright
// suite in test/. nuxt/ keeps its own Nuxt-flavoured configuration and drupal/
// is PHP.
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: [
    'nuxt/',
    'drupal/',
    'coverage/',
    'test-results/',
    'playwright-report/',
    '.vale/',
  ],
  overrides: [
    {
      files: ['**/*.cjs', 'test/e2e/**/*.js', 'playwright.config.js'],
      parserOptions: { sourceType: 'script' },
    },
  ],
}
