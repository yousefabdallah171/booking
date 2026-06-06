import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "powershell -ExecutionPolicy Bypass -File .\\scripts\\start-e2e.ps1",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      cwd: ".",
      timeout: 120_000,
    },
    {
      command: "powershell -ExecutionPolicy Bypass -File .\\scripts\\start-e2e.ps1",
      url: "http://127.0.0.1:4100/health",
      reuseExistingServer: false,
      cwd: "../backend",
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
