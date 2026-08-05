import { defineConfig, devices } from "@playwright/test";

const TEST_PORT = 3210;
const TEST_REF = "0".repeat(40);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ".tmp/playwright-results",
  reporter: "line",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: `http://127.0.0.1:${TEST_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${TEST_PORT}`,
    url: `http://127.0.0.1:${TEST_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      ...process.env,
      MONICA_AGENT_SKILL_REF: process.env.MONICA_AGENT_SKILL_REF ?? TEST_REF,
      MONICA_DOCS_API_URL: "",
    },
  },
});
