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
  reporter: process.env.CI ? 'blob' : 'html',
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
          Authorization: `Bearer ${process.env.GOREST_TOKEN ?? ''}`,
        },
        // Traces would capture the Authorization header above; keep this project trace-free.
        trace: 'off',
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
      name: 'kafka-setup',
      testDir: './tests/kafka',
      testMatch: /kafka\.setup\.ts/,
      teardown: 'kafka-teardown',
    },
    {
      name: 'kafka-teardown',
      testDir: './tests/kafka',
      testMatch: /kafka\.teardown\.ts/,
    },
    {
      name: 'kafka',
      testDir: './tests/kafka',
      testMatch: /kafka-(producer|consumer)\.spec\.ts/,
      dependencies: ['kafka-setup'],
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
