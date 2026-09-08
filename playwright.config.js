const { defineConfig, devices } = require('@playwright/test')

/**
 * End-to-end and visual checks against the generated site.
 *
 * One project per viewport, because a layout change that breaks one
 * breakpoint passes the unit tests and every other viewport. Tests tagged
 * @visual compare against committed baselines in test/e2e/__snapshots__ and
 * run only where those baselines were made: the manual `visual:update`
 * pipeline job regenerates them on the shared runner, and a baseline made on
 * a developer's machine is a permanent false diff for everyone else.
 *
 * With no PLAYWRIGHT_BASE_URL the config serves nuxt/dist itself, so one
 * command runs the same thing CI does. Generate first: `npm run generate`.
 */
module.exports = defineConfig({
  testDir: './test/e2e',
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{arg}{ext}',
  outputDir: './test-results',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  // All three on Chromium. The iPad device defaults to WebKit, and one
  // browser everywhere keeps the baselines comparable and the runners small.
  projects: [
    { name: 'phone', use: { ...devices['Pixel 5'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'], defaultBrowserType: 'chromium' } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run serve',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 60 * 1000,
      },
})
