import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

export const ADMIN_AUTH_FILE = path.join(__dirname, '../../playwright/.auth/admin.json')
export const CLIENT_AUTH_FILE = path.join(__dirname, '../../playwright/.auth/client.json')

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()

  // ─── Save admin session ──────────────────────────────────────────────────────
  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await adminPage.goto('/login')
  await adminPage.getByLabel('Email').fill(process.env.ADMIN_TEST_EMAIL ?? 'youseabdallah866@gmail.com')
  await adminPage.getByLabel('Password').fill(process.env.ADMIN_TEST_PASSWORD ?? 'testpassword')
  await adminPage.getByRole('button', { name: /sign in/i }).click()
  await adminPage.waitForURL('/admin')
  await adminContext.storageState({ path: ADMIN_AUTH_FILE })
  await adminContext.close()

  // ─── Save client session ─────────────────────────────────────────────────────
  const clientContext = await browser.newContext()
  const clientPage = await clientContext.newPage()
  await clientPage.goto('/login')
  await clientPage.getByLabel('Email').fill(process.env.CLIENT_TEST_EMAIL ?? 'testclient@example.com')
  await clientPage.getByLabel('Password').fill(process.env.CLIENT_TEST_PASSWORD ?? 'testpassword')
  await clientPage.getByRole('button', { name: /sign in/i }).click()
  await clientPage.waitForURL('/booking')
  await clientContext.storageState({ path: CLIENT_AUTH_FILE })
  await clientContext.close()

  await browser.close()
}

export default globalSetup
