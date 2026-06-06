import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('unauthenticated visit to /booking redirects to /login', async ({ page }) => {
    await page.goto('/booking')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated visit to /admin redirects to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('valid admin credentials login and redirect to /admin', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.ADMIN_TEST_EMAIL ?? 'youseabdallah866@gmail.com')
    await page.getByLabel('Password').fill(process.env.ADMIN_TEST_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/admin')
  })

  test('wrong password shows inline error below password field', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Error should appear inline below the field, not as an alert
    const errorMsg = page.locator('[data-field="password"] [role="alert"], input[name="password"] + *')
    await expect(errorMsg).toBeVisible()
    // Must NOT show a dialog/toast alert
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible()
  })

  test('CLIENT role user cannot access /admin — receives 403', async ({ page }) => {
    // Log in as client
    await page.goto('/login')
    await page.getByLabel('Email').fill(process.env.CLIENT_TEST_EMAIL ?? 'testclient@example.com')
    await page.getByLabel('Password').fill(process.env.CLIENT_TEST_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/booking')
    // Attempt to navigate to admin
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('text=403, text=Forbidden')).toBeVisible()
  })
})
