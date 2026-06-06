import { test as base, type Page } from "@playwright/test";
import { ADMIN_AUTH_FILE, CLIENT_AUTH_FILE } from "../global-setup";

type AuthFixtures = {
  adminPage: Page;
  clientPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ADMIN_AUTH_FILE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  clientPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: CLIENT_AUTH_FILE });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
