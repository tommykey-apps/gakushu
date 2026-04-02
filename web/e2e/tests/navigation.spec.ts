import { test, expect } from '@playwright/test'

test.describe('ナビゲーション', () => {
  test('ヘッダーのナビリンクが正しく動作する', async ({ page }) => {
    await page.goto('/')

    // 章一覧へ
    await page.getByRole('link', { name: '章一覧' }).click()
    await expect(page).toHaveURL(/\/chapters$/)

    // ホームへ
    await page.getByRole('link', { name: 'ホーム' }).click()
    await expect(page).toHaveURL(/\/$/)

    // サンドボックスへ
    await page.getByRole('link', { name: 'サンドボックス' }).click()
    await expect(page).toHaveURL(/\/sandbox$/)
  })

  test('ログインページに遷移できる', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'ログイン' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('アカウントにログインして学習を続けましょう')).toBeVisible()
  })

  test('未認証で dashboard にアクセスすると login にリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
