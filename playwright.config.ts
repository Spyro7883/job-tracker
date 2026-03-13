import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
  },
  webServer: {
    command: "pnpm dev --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    env: {
      E2E_TEST: "1",
      E2E_USER_ID: "e2e_user",
    },
  },
});