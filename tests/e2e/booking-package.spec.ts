import { test, expect } from './fixtures/auth'

test.describe('Client — Roadmap Package Purchase', () => {
  test.use({ storageState: 'playwright/.auth/client.json' })

  test('package tier cards render with name, session count, and price', async ({ clientPage }) => {
    await clientPage.goto('/booking/package')
    const tierCards = clientPage.getByTestId('package-tier-card')
    await expect(tierCards.first()).toBeVisible()
    await expect(tierCards.first()).toContainText(/session/i)
    await expect(tierCards.first()).toContainText(/EGP|price/i)
  })

  test('selecting a tier shows the intake form', async ({ clientPage }) => {
    await clientPage.goto('/booking/package')
    await clientPage.getByTestId('package-tier-card').first().click()
    await clientPage.getByRole('button', { name: /continue|select/i }).click()
    await expect(clientPage.getByTestId('intake-form')).toBeVisible()
    // All 4 fields must be present
    await expect(clientPage.getByLabel(/skill level/i)).toBeVisible()
    await expect(clientPage.getByLabel(/primary goal/i)).toBeVisible()
    await expect(clientPage.getByLabel(/expected outcomes/i)).toBeVisible()
    await expect(clientPage.getByLabel(/preferred timeline/i)).toBeVisible()
  })

  test('submitting intake form with empty primaryGoal shows inline error', async ({ clientPage }) => {
    await clientPage.goto('/booking/package')
    await clientPage.getByTestId('package-tier-card').first().click()
    await clientPage.getByRole('button', { name: /continue|select/i }).click()

    // Fill 3 of 4 fields, leave primaryGoal empty
    await clientPage.getByLabel(/skill level/i).fill('Intermediate developer, 3 years React experience')
    await clientPage.getByLabel(/expected outcomes/i).fill('Land a senior role within 6 months')
    await clientPage.getByLabel(/preferred timeline/i).fill('6 months')

    await clientPage.getByRole('button', { name: /pay|proceed|continue/i }).click()

    // Inline error must appear below the primaryGoal field — NOT as an alert/toast
    const primaryGoalError = clientPage.locator('[data-field="primaryGoal"] p, #primaryGoal ~ p')
    await expect(primaryGoalError).toBeVisible()
    await expect(clientPage.locator('[role="alertdialog"]')).not.toBeVisible()
  })

  test('valid intake form submission redirects to Paymob', async ({ clientPage }) => {
    await clientPage.goto('/booking/package')
    await clientPage.getByTestId('package-tier-card').first().click()
    await clientPage.getByRole('button', { name: /continue|select/i }).click()

    await clientPage.getByLabel(/skill level/i).fill('Intermediate developer, 3 years React experience')
    await clientPage.getByLabel(/primary goal/i).fill('Transition to senior developer role')
    await clientPage.getByLabel(/expected outcomes/i).fill('Land a senior role within 6 months')
    await clientPage.getByLabel(/preferred timeline/i).fill('6 months')

    const payBtn = clientPage.getByRole('button', { name: /pay|proceed/i })
    await payBtn.click()
    await expect(payBtn).toBeDisabled()
    await clientPage.waitForURL(/accept\.paymob\.com/, { timeout: 10_000 })
    expect(clientPage.url()).toContain('accept.paymob.com')
  })

  test('after package confirmed, dashboard shows PackageProgress "0 of N"', async ({ clientPage }) => {
    // Assumes package was confirmed via seeded data or prior webhook simulation
    await clientPage.goto('/dashboard')
    await expect(clientPage.getByTestId('package-progress')).toBeVisible()
    await expect(clientPage.getByTestId('package-progress')).toContainText(/0 of \d+ sessions completed/i)
  })
})
