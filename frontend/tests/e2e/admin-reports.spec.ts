import { test, expect } from './fixtures/auth'

test.describe('Admin — Monthly Reports', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })

  test('report page loads and shows current month stats within 3 seconds', async ({ adminPage }) => {
    const start = Date.now()
    await adminPage.goto('/admin/reports')
    await expect(adminPage.getByTestId('monthly-report')).toBeVisible()
    expect(Date.now() - start).toBeLessThan(3000)
  })

  test('report shows total revenue in EGP and USD separately', async ({ adminPage }) => {
    await adminPage.goto('/admin/reports')
    await expect(adminPage.getByTestId('revenue-egp')).toBeVisible()
    await expect(adminPage.getByTestId('revenue-usd')).toBeVisible()
  })

  test('empty month shows zero values with descriptive empty-state message', async ({ adminPage }) => {
    await adminPage.goto('/admin/reports')
    // Select a past month with no bookings (e.g., January 2024)
    await adminPage.getByTestId('month-select').selectOption('1')
    await adminPage.getByTestId('year-select').selectOption('2024')
    await adminPage.getByRole('button', { name: /view|load/i }).click()

    await expect(adminPage.getByTestId('revenue-egp')).toContainText('0')
    await expect(adminPage.getByTestId('revenue-usd')).toContainText('0')
    // Empty state must show a message, not a blank section
    await expect(adminPage.getByTestId('empty-state')).toBeVisible()
    await expect(adminPage.locator('[role="alert"], [role="status"]')).not.toBeVisible()
  })

  test('top clients table ranks by booking count', async ({ adminPage }) => {
    await adminPage.goto('/admin/reports')
    const rows = adminPage.getByTestId('top-client-row')
    const count = await rows.count()
    if (count > 1) {
      const firstCount = parseInt(await rows.first().getByTestId('booking-count').textContent() ?? '0')
      const secondCount = parseInt(await rows.nth(1).getByTestId('booking-count').textContent() ?? '0')
      expect(firstCount).toBeGreaterThanOrEqual(secondCount)
    }
  })
})
