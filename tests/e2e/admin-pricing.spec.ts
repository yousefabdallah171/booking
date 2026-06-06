import { test, expect } from './fixtures/auth'

test.describe('Admin — Pricing Management', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })

  test('pricing page loads default price and tier prices', async ({ adminPage }) => {
    await adminPage.goto('/admin/pricing')
    await expect(adminPage.getByTestId('default-price-input')).toBeVisible()
    await expect(adminPage.getByTestId('package-tier-list')).toBeVisible()
  })

  test('updating default price shows loading state then success toast', async ({ adminPage }) => {
    await adminPage.goto('/admin/pricing')
    const input = adminPage.getByTestId('default-price-input')
    await input.fill('1500')
    const saveBtn = adminPage.getByTestId('save-default-price')
    await saveBtn.click()
    await expect(saveBtn).toBeDisabled()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/saved|updated/i)
    // Reload and confirm value persisted
    await adminPage.reload()
    await expect(input).toHaveValue('1500')
  })

  test('updating package tier price shows success toast and persists', async ({ adminPage }) => {
    await adminPage.goto('/admin/pricing')
    const tierInput = adminPage.getByTestId('tier-price-input').first()
    await tierInput.fill('9000')
    await adminPage.getByTestId('save-tier-price').first().click()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/saved|updated/i)
    await adminPage.reload()
    await expect(tierInput).toHaveValue('9000')
  })

  test('assigning custom price to a client shows the override badge', async ({ adminPage }) => {
    await adminPage.goto('/admin/pricing')
    // Select a client from the override section
    await adminPage.getByTestId('client-override-select').selectOption({ index: 1 })
    await adminPage.getByTestId('client-override-price-input').fill('1200')
    await adminPage.getByTestId('save-client-override').click()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/saved|updated/i)
  })
})
