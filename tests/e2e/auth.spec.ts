import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('AUTH-HAPPY-001 - valid guest user can sign in', async ({ page }) => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    test.skip(!email || !password, 'TEST_EMAIL and TEST_PASSWORD are required for login validation.');

    await new LoginPage(page).signIn(email!, password!);
    await expect(page).toHaveURL(/qfdashboard|dashboard/i);
  });

  test('AUTH-NEGATIVE-001 - empty submit shows validation or remains on login', async ({ page }) => {
    const login = new LoginPage(page);

    await login.submitEmpty();

    await expect(page).toHaveURL(/login|account/i);
    await expect(login.errorMessage().or(page.locator('input:invalid').first()).first()).toBeVisible();
  });

  test('AUTH-NEGATIVE-002 - invalid credentials do not reach the dashboard', async ({ page }) => {
    const login = new LoginPage(page);

    await login.signIn('invalid-user@example.com', 'not-the-real-password').catch(() => undefined);

    await expect(page).not.toHaveURL(/qfdashboard|dashboard/i);
  });

  test('AUTH-EDGE-001 - login page masks password entry', async ({ page }) => {
    await new LoginPage(page).goto();

    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});
