import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, browserName: "chromium" },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PREVIEW_SECRET: "e2e-secret",
      NEXT_PUBLIC_BUYMEACOFFEE_URL: "https://buymeacoffee.com/example",
    },
  },
});
