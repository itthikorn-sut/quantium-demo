import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Valuation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoModule(page, '/valuation');
  });

  test('VAL-HAPPY-001 - valuation list loads', async ({ page }) => {
    await expectBodyToContain(page, /valuation/i);
    await expectBodyToContain(page, /fair market valuation/i);
  });

  test('VAL-HAPPY-002 - valuation financial columns are visible', async ({ page }) => {
    await expectBodyToContain(page, /remaining investment cost/i);
    await expectBodyToContain(page, /previous valuation/i);
    await expectBodyToContain(page, /new fair market valuation/i);
  });

  test('VAL-HAPPY-003 - new valuation entry points are exposed', async ({ page }) => {
    await page.getByRole('button', { name: /new/i }).click();

    await expectBodyToContain(page, /all deals|single asset|existing deal/i);
  });

  test('VAL-EDGE-001 - valuation supports folder view navigation', async ({ page }) => {
    await expect(page.getByRole('button', { name: /folder view/i })).toBeVisible();
  });

  test('VAL-EDGE-002 - valuation filter controls are present', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();

    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
  });

  test('VAL-NEGATIVE-001 - valuation page does not expose crash text', async ({ page }) => {
    await expectNoCrashText(page);
  });
});

