# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> valid admin credentials login and redirect to /admin
- Location: tests\e2e\auth.spec.ts:26:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://127.0.0.1:3100/admin"
Received: "http://127.0.0.1:3100/login?callbackUrl=/admin"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://127.0.0.1:3100/login?callbackUrl=/admin"

```

```yaml
- img "Yousef Abdallah": YA Yousef ABDALLAH
- heading "تسجيل الدخول" [level=1]
- paragraph: سجّل دخولك للمتابعة إلى الحجز أو لوحة الإدارة.
- button "Continue with Google": الدخول بحساب Google
- text: أو البريد الإلكتروني
- textbox "Email":
  - /placeholder: name@example.com
  - text: youseabdallah866@gmail.com
- text: كلمة المرور
- link "نسيت كلمة المرور؟":
  - /url: "#"
- textbox "Password": Admin@1234
- alert: البريد الإلكتروني أو كلمة المرور غير صحيحة
- button "Sign in":
  - img
  - text: تسجيل الدخول
- alert
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | const adminEmail = process.env.ADMIN_TEST_EMAIL ?? "youseabdallah866@gmail.com";
  4  | const adminPassword = process.env.ADMIN_TEST_PASSWORD ?? "Admin@1234";
  5  | const clientEmail = process.env.CLIENT_TEST_EMAIL ?? "testclient@example.com";
  6  | const clientPassword = process.env.CLIENT_TEST_PASSWORD ?? "Client@1234";
  7  | 
  8  | async function login(page: Page, email: string, password: string, destination = "/login") {
  9  |   await page.goto(destination);
  10 |   await page.getByLabel("Email").fill(email);
  11 |   await page.getByLabel("Password").fill(password);
  12 |   await page.getByRole("button", { name: /sign in/i }).click();
  13 | }
  14 | 
  15 | test.describe("Authentication", () => {
  16 |   test("unauthenticated visit to /booking redirects to /login", async ({ page }) => {
  17 |     await page.goto("/booking");
  18 |     await expect(page).toHaveURL(/\/login/);
  19 |   });
  20 | 
  21 |   test("unauthenticated visit to /admin redirects to /login", async ({ page }) => {
  22 |     await page.goto("/admin");
  23 |     await expect(page).toHaveURL(/\/login/);
  24 |   });
  25 | 
  26 |   test("valid admin credentials login and redirect to /admin", async ({ page }) => {
  27 |     await login(page, adminEmail, adminPassword, "/admin");
> 28 |     await expect(page).toHaveURL("/admin");
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  29 |   });
  30 | 
  31 |   test("wrong password shows inline error below password field", async ({ page }) => {
  32 |     await login(page, adminEmail, "wrongpassword", "/admin");
  33 |     await expect(page).toHaveURL(/\/login/);
  34 |     await expect(page.getByRole("alert").first()).toBeVisible();
  35 |   });
  36 | 
  37 |   test("client role user cannot access /admin and receives 403", async ({ page }) => {
  38 |     await login(page, clientEmail, clientPassword, "/booking");
  39 |     await page.waitForURL("/booking");
  40 | 
  41 |     await page.goto("/admin");
  42 |     await expect(page).toHaveURL("/admin");
  43 |     await expect(page.locator("text=Forbidden")).toBeVisible();
  44 |   });
  45 | 
  46 |   test("client role user can access the booking page after login", async ({ page }) => {
  47 |     await login(page, clientEmail, clientPassword, "/booking");
  48 |     await expect(page).toHaveURL("/booking");
  49 |     await expect(page.getByRole("heading", { name: /^booking$/i })).toBeVisible();
  50 |   });
  51 | });
  52 | 
```