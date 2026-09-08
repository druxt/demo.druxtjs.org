const { test, expect } = require('@playwright/test')

/**
 * The generated front page. The demo list is read from Drupal at generate
 * time, so a page that renders a demo link proves the backend was up, the
 * content imported, and Druxt built against it.
 */
test.describe('the front page', () => {
  test('is generated and served', async ({ page }) => {
    const response = await page.goto('/')
    expect(response.status()).toBe(200)
    await expect(page).toHaveTitle(/DruxtJS/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('lists the demos', async ({ page }) => {
    await page.goto('/')
    const demo = page.locator('a[href*="umami"]').first()
    await expect(demo).toBeVisible()
    await expect(demo).toHaveAttribute('rel', /noopener/)
  })

  test('matches the committed baseline @visual', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })
})
