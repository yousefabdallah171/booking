import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.ADMIN_TEST_EMAIL ?? "youseabdallah866@gmail.com";
const adminPassword = process.env.ADMIN_TEST_PASSWORD ?? "Admin@1234";
const clientEmail = process.env.CLIENT_TEST_EMAIL ?? "testclient@example.com";
const clientPassword = process.env.CLIENT_TEST_PASSWORD ?? "Client@1234";

async function login(page: Page, email: string, password: string, destination = "/login") {
  await page.goto(destination);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("Authentication", () => {
  test("unauthenticated visit to /booking redirects to /login", async ({ page }) => {
    await page.goto("/booking");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated visit to /admin redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid admin credentials login and redirect to /admin", async ({ page }) => {
    await login(page, adminEmail, adminPassword, "/admin");
    await expect(page).toHaveURL("/admin");
  });

  test("wrong password shows inline error below password field", async ({ page }) => {
    await login(page, adminEmail, "wrongpassword", "/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("client role user cannot access /admin and receives 403", async ({ page }) => {
    await login(page, clientEmail, clientPassword, "/booking");
    await page.waitForURL("/booking");

    await page.goto("/admin");
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("text=Forbidden")).toBeVisible();
  });

  test("client role user can access the booking page after login", async ({ page }) => {
    await login(page, clientEmail, clientPassword, "/booking");
    await expect(page).toHaveURL("/booking");
    await expect(page.getByRole("heading", { name: /^booking$/i })).toBeVisible();
  });
});
