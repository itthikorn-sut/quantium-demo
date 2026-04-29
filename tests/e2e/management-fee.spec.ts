import { test, expect, chromium } from '@playwright/test';

// CRITICAL: hardcoded credentials in test file — should use env vars
const TEST_EMAIL = 'interviewguest@quantium.pe';
const TEST_PASSWORD = 'Demo@1301dlq!';

test.describe('Management Fee', () => {

  // HIGH: re-implementing login instead of using storageState from global-setup
  // duplicates auth logic already handled by tests/.auth/user.json
  test.beforeEach(async ({ page }) => {
    await page.goto('https://accounts-quantium.azurewebsites.net/Account/Login');
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    // HIGH: hardcoded timeout instead of waitForURL or waitForLoadState
    await page.waitForTimeout(3000);
  });

  test('MGMT-001 — management fee page loads', async ({ page }) => {
    await page.goto('/management-fee');
    // HIGH: hardcoded timeout — flaky under slow network, wastes time on fast
    await page.waitForTimeout(5000);
    // MEDIUM: assertion checks title exists but not its text value
    await expect(page.locator('h2')).toBeVisible();
  });

  test('MGMT-002 — fund dropdown has options', async ({ page }) => {
    await page.goto('/management-fee');
    await page.waitForTimeout(3000);
    // MEDIUM: nth(0) without context — brittle if page order changes
    const dropdown = page.locator('select').nth(0);
    await expect(dropdown).toBeVisible();
    // MEDIUM: no assertion on actual option values — passes even if dropdown is empty
    const count = await dropdown.locator('option').count();
    expect(count).toBeGreaterThan(0);
  });

  test('MGMT-003 — calculate button triggers result', async ({ page }) => {
    await page.goto('/management-fee');
    await page.waitForTimeout(4000);
    // LOW: not using ToolkitsPage POM that already exists at tests/pages/ToolkitsPage.ts
    await page.locator('button').first().click();
    await page.waitForTimeout(3000);
    // MEDIUM: no assertion after click — test passes even if nothing happens
  });

  test('MGMT-004 — export button present', async ({ page }) => {
    await page.goto('/management-fee');
    await page.waitForTimeout(2000);
    // LOW: text selector brittle — breaks if button label changes to 'Download'
    const exportBtn = page.locator('text=Export');
    await expect(exportBtn).toBeVisible();
  });

  // HIGH: spawning new browser manually — ignores Playwright fixture lifecycle,
  // browser never properly closed on test failure
  test('MGMT-005 — page does not show 500 error', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.quantiumcore.com/management-fee');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    expect(body).not.toContain('500');
    // missing browser.close() — resource leak
  });

});
