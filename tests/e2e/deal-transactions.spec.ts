import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Deal Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await gotoModule(page, '/investment');
  });

  test('DEAL-HAPPY-001 - deal transaction list loads', async ({ page }) => {
    await expectBodyToContain(page, /deal/i);
    await expectBodyToContain(page, /transaction date/i);
  });

  test('DEAL-HAPPY-002 - deal status counters are visible', async ({ page }) => {
    await expectBodyToContain(page, /complete/i);
    await expectBodyToContain(page, /open|scheduled|overdue/i);
  });

  test('DEAL-HAPPY-003 - new deal entry points are exposed', async ({ page }) => {
    await page.getByRole('button', { name: /new/i }).click();

    await expectBodyToContain(page, /new deal/i);
    await expectBodyToContain(page, /existing deal|single asset/i);
  });

  test('DEAL-EDGE-001 - folder view is available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /folder view/i })).toBeVisible();
  });

  test('DEAL-EDGE-002 - excel import paths are visible from the new menu', async ({ page }) => {
    await page.getByRole('button', { name: /new/i }).click();

    await expectBodyToContain(page, /excel import/i);
  });

  test('DEAL-NEGATIVE-001 - deal list does not expose crash text', async ({ page }) => {
    await expectNoCrashText(page);
  });

  test('DEAL-NEGATIVE-002 - guest view does not show unauthorized state', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText(/unauthorized|access denied/i);
  });

  test('TXN-HAPPY-001 - fund operation module loads without crashing', async ({ page }) => {
    await gotoModule(page, '/fund-operation');
    await expectNoCrashText(page);
  });

  test('TXN-HAPPY-002 - fund investment module loads without crashing', async ({ page }) => {
    await gotoModule(page, '/fund-investment');
    await expectNoCrashText(page);
  });

  test('TXN-HAPPY-003 - spv transfer module loads without crashing', async ({ page }) => {
    await gotoModule(page, '/spv-transfer');
    await expectNoCrashText(page);
  });
});

