import { test, expect } from '@playwright/test'

test.describe('章一覧・章コンテンツ', () => {
  test('章一覧ページに5つの章が表示される', async ({ page }) => {
    await page.goto('/chapters')
    const links = page.locator('a[href^="/chapters/"]')
    await expect(links).toHaveCount(5)
  })

  test('各章のタイトルが正しい', async ({ page }) => {
    await page.goto('/chapters')
    const expected = ['基礎LM', 'トークナイザ', 'Transformer', 'RLHF', '推論と生成']
    for (const title of expected) {
      await expect(page.getByText(title).first()).toBeVisible()
    }
  })

  test('Chapter 1 をクリックするとコンテンツページに遷移する', async ({ page }) => {
    await page.goto('/chapters')
    await page.locator('a[href="/chapters/1"]').click()
    await expect(page).toHaveURL(/\/chapters\/1$/)
  })

  test('Chapter 1 のコンテンツに「次の文字を当てるゲーム」が含まれる', async ({ page }) => {
    await page.goto('/chapters/1')
    await expect(page.getByText('次の文字を当てるゲーム')).toBeVisible()
  })
})
