import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /variant8-glitch\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'performance-glitch',
      testMatch: /variant8-glitch\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/glitch.json',
      },
      dependencies: ['setup'],
    },
  ],
});
