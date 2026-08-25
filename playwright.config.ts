import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'mobile-360',
      use: { viewport: { width: 360, height: 800 } },
    },
    {
      name: 'tablet-768',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1280',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
})
