import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @specialist/api dev',
      port: 3000,
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 120000,
      env: { RATE_LIMIT_DISABLED: 'true' },
    },
    {
      command: 'npx astro dev --port 4321',
      port: 4321,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
