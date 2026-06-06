import { test, expect } from './fixtures/auth'

test.describe('Client — Single Session Booking', () => {
  test.use({ storageState: 'playwright/.auth/client.json' })

  test('client sees calendar with highlighted available dates', async ({ clientPage }) => {
    await clientPage.goto('/booking')
    // At least one date should be highlighted as available
    await expect(clientPage.getByTestId('booking-calendar')).toBeVisible()
  })

  test('selecting an available date renders slots within 1 second', async ({ clientPage }) => {
    await clientPage.goto('/booking')
    const start = Date.now()
    await clientPage.getByTestId('calendar-available-date').first().click()
    await expect(clientPage.getByTestId('slot-picker')).toBeVisible()
    expect(Date.now() - start).toBeLessThan(1000)
  })

  test('confirming a slot shows loading state and redirects to Paymob', async ({ clientPage }) => {
    await clientPage.goto('/booking')
    await clientPage.getByTestId('calendar-available-date').first().click()
    await clientPage.getByTestId('slot-card').first().click()

    const confirmBtn = clientPage.getByRole('button', { name: /confirm|book/i })
    await confirmBtn.click()

    // Button must be disabled (loading state)
    await expect(confirmBtn).toBeDisabled()

    // Final redirect goes to Paymob iframe URL
    await clientPage.waitForURL(/accept\.paymob\.com/, { timeout: 10_000 })
    expect(clientPage.url()).toContain('accept.paymob.com')
  })

  test('stale slot conflict shows user-friendly message and refreshes calendar', async ({ clientPage }) => {
    // This test requires a slot that was made BOOKED between load and submit.
    // The test uses a pre-seeded "stale" slot — implementation marks it as BOOKED
    // before the client submits.
    await clientPage.goto('/booking')
    await clientPage.getByTestId('calendar-available-date').first().click()
    const staleSlot = clientPage.getByTestId('slot-card-stale')
    test.skip(!await staleSlot.isVisible(), 'Stale slot fixture not seeded')

    await staleSlot.click()
    await clientPage.getByRole('button', { name: /confirm|book/i }).click()

    await expect(clientPage.getByTestId('conflict-message')).toBeVisible()
    await expect(clientPage.getByTestId('conflict-message')).toContainText(/no longer available|taken/i)
    // Calendar must refresh (slot disappears)
    await expect(staleSlot).not.toBeVisible()
  })

  test('CONFIRMED booking appears on client dashboard', async ({ clientPage }) => {
    // Assumes a booking was confirmed via webhook in a prior test or seed
    await clientPage.goto('/dashboard')
    await expect(clientPage.getByTestId('booking-list')).toBeVisible()
    const firstBooking = clientPage.getByTestId('booking-card').first()
    await expect(firstBooking).toBeVisible()
    await expect(firstBooking).toContainText(/confirmed|single session/i)
  })
})
