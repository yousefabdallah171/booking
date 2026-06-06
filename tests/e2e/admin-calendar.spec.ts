import { test, expect } from './fixtures/auth'

test.describe('Admin — Calendar Management', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })

  test('shows empty state when no slots exist for selected date', async ({ adminPage }) => {
    await adminPage.goto('/admin/calendar')
    // Select a date far in the future with no slots
    // The empty state component must be visible
    await expect(adminPage.getByTestId('empty-state')).toBeVisible()
  })

  test('admin creates individual slot and it appears in the list', async ({ adminPage }) => {
    await adminPage.goto('/admin/calendar')
    await adminPage.getByRole('button', { name: /add slot/i }).click()
    // Fill date + time inputs
    await adminPage.getByLabel('Date').fill('2026-12-01')
    await adminPage.getByLabel('Time').fill('10:00')
    await adminPage.getByRole('button', { name: /save/i }).click()
    // Success toast must appear
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/slot created|success/i)
    // Slot must appear in the list with AVAILABLE badge
    await expect(adminPage.getByText('10:00')).toBeVisible()
    await expect(adminPage.getByText(/available/i).first()).toBeVisible()
  })

  test('generates 9 slots from 09:00–18:00 range', async ({ adminPage }) => {
    await adminPage.goto('/admin/calendar')
    await adminPage.getByRole('button', { name: /generate slots/i }).click()
    await adminPage.getByLabel('Date').fill('2026-12-02')
    await adminPage.getByLabel('Start Time').fill('09:00')
    await adminPage.getByLabel('End Time').fill('18:00')
    await adminPage.getByRole('button', { name: /generate/i }).click()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/9 slot/i)
  })

  test('blocks a day — no slots shown for that date', async ({ adminPage }) => {
    await adminPage.goto('/admin/calendar')
    await adminPage.getByRole('button', { name: /block day/i }).click()
    await adminPage.getByLabel('Date').fill('2026-12-03')
    // Confirmation dialog must name the date
    await expect(adminPage.getByRole('dialog')).toContainText('2026-12-03')
    await adminPage.getByRole('button', { name: /confirm/i }).click()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/blocked/i)
    // Navigate to that date — no slots visible
    await adminPage.getByTestId('calendar-date-2026-12-03').click()
    await expect(adminPage.getByTestId('empty-state')).toBeVisible()
  })

  test('deletes a slot after ConfirmDialog names the slot time', async ({ adminPage }) => {
    await adminPage.goto('/admin/calendar')
    // Assumes at least one slot exists from previous test
    const deleteBtn = adminPage.getByRole('button', { name: /delete/i }).first()
    await deleteBtn.click()
    // ConfirmDialog must name the slot time
    await expect(adminPage.getByRole('dialog')).toContainText(/10:00|delete slot/i)
    await adminPage.getByRole('button', { name: /confirm/i }).click()
    await expect(adminPage.locator('[data-sonner-toast], [role="status"]')).toContainText(/deleted|removed/i)
  })
})
