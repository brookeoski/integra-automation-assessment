import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 4,
  globalTimeout: 5 * 60 * 1000,
  reporter: 'html',
  use: {
    trace: 'retain-on-failure',
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.BASE_URL,
        extraHTTPHeaders: {
          Authorization: `Bearer ${process.env.GOREST_TOKEN}`,
        },
      },
    },
    {
      name: 'setup',
      testDir: './tests/ui',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL,
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
