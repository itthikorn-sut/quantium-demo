import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(process.cwd(), 'tests', '.auth', 'user.json');
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

function isAuthFresh(): boolean {
  try {
    const stat = fs.statSync(AUTH_FILE);
    const age = Date.now() - stat.mtimeMs;
    if (age > MAX_AGE_MS) return false;
    // Verify the file has meaningful content (cookies present)
    const content = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    return Array.isArray(content.cookies) && content.cookies.length > 0;
  } catch {
    return false;
  }
}

async function globalSetup(config: FullConfig) {
  // Skip login if we already have a recent, valid auth state
  if (isAuthFresh()) {
    console.log('[global-setup] Using cached auth state (< 1 hour old)');
    return;
  }

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
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}

export default globalSetup;
