const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
  webServer: {
    command: 'npx http-server -p 8080 ..',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
  },
});
