import { test, expect } from '@playwright/test'

test.describe('ランディングページ', () => {
  test('ページが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/gakushu/i)
  })

  test('ヒーローセクションのキャッチコピーが見える', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('GPTの仕組みを、ゼロから理解する')).toBeVisible()
  })

  test('5章のカードが表示される', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('a[href^="/chapters/"]')
    await expect(cards).toHaveCount(5)
  })

  test('「始める」ボタンが chapters ページに遷移する', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '始める' }).click()
    await expect(page).toHaveURL(/\/chapters$/)
  })
})
