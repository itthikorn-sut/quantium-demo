import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText } from '../support/ui';

test.describe('Capital Call', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/capital');
    await page.waitForLoadState('domcontentloaded');
  });

  test('CAP-HAPPY-001 - capital call list renders a heading and data surface', async ({ page }) => {
    await expectBodyToContain(page, /capital call - distribution/i);
    await expect(page.getByRole('table').or(page.locator('[class*="table" i], [class*="grid" i]').first()).first()).toBeVisible();
  });

  test('CAP-HAPPY-002 - filter action is available', async ({ page }) => {
    const filter = page.getByRole('button', { name: /filter/i }).first();

    await expect(filter).toBeVisible();
    await filter.click();
    await expect(page.locator('[class*="filter" i], [class*="dropdown" i], [role="dialog"]').first()).toBeVisible();
  });

  test('CAP-HAPPY-003 - new transaction entry points are visible', async ({ page }) => {
    await page.getByRole('button', { name: /new/i }).click();

    await expectBodyToContain(page, /single transaction|excel import|new commitment/i);
  });

  test('CAP-HAPPY-004 - transaction table exposes financial columns', async ({ page }) => {
    await expectBodyToContain(page, /due date/i);
    await expectBodyToContain(page, /total amount/i);
    await expectBodyToContain(page, /status/i);
  });

  test('CAP-EDGE-001 - folder view option is available for alternate navigation', async ({ page }) => {
    await expect(page.getByRole('button', { name: /folder view/i })).toBeVisible();
  });

  test('CAP-EDGE-002 - filter reset and apply actions are available together', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();

    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
  });

  test('CAP-NEGATIVE-001 - create flow protects required amount fields', async ({ page }) => {
    const create = page.getByRole('button', { name: /new|create|add/i }).first();
    test.skip(!(await create.isVisible()), 'Create action is not available for this role.');

    await create.click();
    await page.getByRole('button', { name: /save|submit|create/i }).first().click();

    await expect(page.locator('[class*="error" i], [class*="invalid" i], [class*="validation" i], input:invalid').first()).toBeVisible();
  });

  test('CAP-NEGATIVE-002 - list page does not render a crash state', async ({ page }) => {
    await expectNoCrashText(page);
  });
});
