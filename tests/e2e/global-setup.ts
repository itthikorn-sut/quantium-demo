import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  const project = config.projects[0];
  const baseURL = String(project.use.baseURL || process.env.BASE_URL || 'https://www.quantiumcore.com');
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('Set TEST_EMAIL and TEST_PASSWORD before running Playwright tests.');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto('/');

  const emailField = page.locator('input[type="email"], input[name*="email" i], input[autocomplete="username"]').first();
  const passwordField = page.locator('input[type="password"], input[name*="password" i], input[autocomplete="current-password"]').first();

  await emailField.fill(email);
  await passwordField.fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
  await page.waitForURL(/qfdashboard|dashboard/i, { timeout: 20000 });

  const authDir = path.join(process.cwd(), 'tests', '.auth');
  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: path.join(authDir, 'user.json') });
  await browser.close();
}

export default globalSetup;
