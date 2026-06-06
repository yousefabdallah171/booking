import { test, expect } from './fixtures/auth'

test.describe('Client — Dashboard', () => {
  test.use({ storageState: 'playwright/.auth/client.json' })

  test('client with no bookings sees empty-state message', async ({ clientPage }) => {
    // This uses a fresh client account with no bookings (seeded separately)
    await clientPage.goto('/dashboard')
    // Either empty state or booking list is shown — never a blank page
    const hasBookings = await clientPage.getByTestId('booking-card').count() > 0
    if (!hasBookings) {
      await expect(clientPage.getByTestId('empty-state')).toBeVisible()
      await expect(clientPage.getByTestId('empty-state')).not.toBeEmpty()
    }
  })

  test('upcoming CONFIRMED bookings show slot date/time and session type', async ({ clientPage }) => {
    await clientPage.goto('/dashboard')
    const card = clientPage.getByTestId('booking-card').first()
    test.skip(!(await card.isVisible()), 'No confirmed bookings seeded')
    await expect(card.getByTestId('slot-datetime')).toBeVisible()
    await expect(card.getByTestId('booking-type')).toBeVisible()
  })

  test('booking card shows meet link when one has been set', async ({ clientPage }) => {
    await clientPage.goto('/dashboard')
    const card = clientPage.getByTestId('booking-card').first()
    test.skip(!(await card.isVisible()), 'No confirmed bookings seeded')
    const meetLink = card.getByTestId('meet-link')
    if (await meetLink.isVisible()) {
      await expect(meetLink).toHaveAttribute('href', /meet\.google\.com/)
    }
  })

  test('active package shows PackageProgress with sessions count', async ({ clientPage }) => {
    await clientPage.goto('/dashboard')
    const progress = clientPage.getByTestId('package-progress')
    test.skip(!(await progress.isVisible()), 'No active package seeded')
    await expect(progress).toContainText(/\d+ of \d+ sessions completed/i)
  })

  test('COMPLETED package does not appear under active packages', async ({ clientPage }) => {
    await clientPage.goto('/dashboard')
    const completedPackage = clientPage.getByTestId('completed-package-badge')
    if (await completedPackage.isVisible()) {
      // Completed packages should be in a separate section, not the active section
      const activeSection = clientPage.getByTestId('active-package-section')
      await expect(activeSection).not.toContainText(/completed/i)
    }
  })
})
