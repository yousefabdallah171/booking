import { test, expect } from './fixtures/auth'

test.describe('Admin — Bookings View & Meet Links', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })

  test('bookings table shows all bookings with status badges', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings')
    await expect(adminPage.getByTestId('bookings-table')).toBeVisible()
    // Status badge must be present
    await expect(adminPage.getByTestId('booking-status-badge').first()).toBeVisible()
  })

  test('filtering by CONFIRMED status shows only confirmed bookings', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings')
    await adminPage.getByTestId('status-filter').selectOption('CONFIRMED')
    const badges = adminPage.getByTestId('booking-status-badge')
    for (const badge of await badges.all()) {
      await expect(badge).toContainText(/confirmed/i)
    }
  })

  test('entering a Meet URL for a CONFIRMED booking saves and shows success toast', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings')
    await adminPage.getByTestId('status-filter').selectOption('CONFIRMED')

    const meetInput = adminPage.getByTestId('meet-link-input').first()
    await meetInput.fill('https://meet.google.com/abc-defg-hij')

    const saveBtn = adminPage.getByTestId('save-meet-link').first()
    await saveBtn.click()
    await expect(saveBtn).toBeDisabled()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/saved|updated/i)

    // Reload and confirm URL persisted
    await adminPage.reload()
    await adminPage.getByTestId('status-filter').selectOption('CONFIRMED')
    await expect(adminPage.getByTestId('meet-link-input').first()).toHaveValue('https://meet.google.com/abc-defg-hij')
  })

  test('clients list shows name, email, and booking count', async ({ adminPage }) => {
    await adminPage.goto('/admin/clients')
    await expect(adminPage.getByTestId('clients-table')).toBeVisible()
    const firstRow = adminPage.getByTestId('client-row').first()
    await expect(firstRow.getByTestId('client-name')).toBeVisible()
    await expect(firstRow.getByTestId('client-email')).toBeVisible()
    await expect(firstRow.getByTestId('booking-count')).toBeVisible()
  })

  test('client detail page shows session history and intake form responses', async ({ adminPage }) => {
    await adminPage.goto('/admin/clients')
    await adminPage.getByTestId('client-row').first().click()
    await expect(adminPage.getByTestId('session-history')).toBeVisible()
    // Package clients also show intake form
    const packageSection = adminPage.getByTestId('package-intake-section')
    if (await packageSection.isVisible()) {
      await expect(packageSection).toContainText(/skill level|primary goal/i)
    }
  })
})
