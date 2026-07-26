import { defineConfig, devices } from "@playwright/test";

const testPort = Number(process.env.PLAYWRIGHT_PORT || 4273);
const baseURL = `http://127.0.0.1:${testPort}`;
// Optional: run against an installed browser (e.g. PLAYWRIGHT_CHANNEL=chrome)
// when the bundled Chromium download cannot be executed locally.
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    channel,
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm start",
    url: baseURL,
    env: { PORT: String(testPort) },
    reuseExistingServer: false,
    timeout: 15_000
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 980 } }
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } }
    }
  ]
});
