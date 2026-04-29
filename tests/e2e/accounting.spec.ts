import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Accounting', () => {
  test('ACC-HAPPY-001 - trial balance page exposes generate controls', async ({ page }) => {
    await gotoModule(page, '/trial-balance');

    await expectBodyToContain(page, /trial balance/i);
    await expect(page.getByRole('button', { name: /generate/i }).first()).toBeVisible();
  });

  test('ACC-HAPPY-002 - accounting approval page exposes approval workflow', async ({ page }) => {
    await gotoModule(page, '/approval-accounting');

    await expectBodyToContain(page, /approval|close books/i);
  });

  test('ACC-HAPPY-003 - trial balance exposes accounting levels', async ({ page }) => {
    await gotoModule(page, '/trial-balance');

    await expectBodyToContain(page, /group by type/i);
    await expectBodyToContain(page, /account level/i);
  });

  test('ACC-HAPPY-004 - trial balance supports export formats', async ({ page }) => {
    await gotoModule(page, '/trial-balance');
    await page.getByRole('button', { name: /export/i }).click();

    await expectBodyToContain(page, /excel/i);
    await expectBodyToContain(page, /word/i);
    await expectBodyToContain(page, /pdf/i);
  });

  test('ACC-EDGE-001 - trial balance supports custom period inputs', async ({ page }) => {
    await gotoModule(page, '/trial-balance');

    await expectBodyToContain(page, /custom/i);
    await expectBodyToContain(page, /from/i);
    await expectBodyToContain(page, /to/i);
  });

  test('ACC-EDGE-002 - close books tab is present', async ({ page }) => {
    await gotoModule(page, '/approval-accounting');

    await expectBodyToContain(page, /close books/i);
  });

  test('ACC-NEGATIVE-001 - generate without changing defaults does not crash', async ({ page }) => {
    await gotoModule(page, '/trial-balance');
    await page.getByRole('button', { name: /generate/i }).click();

    await expectNoCrashText(page);
  });

  test('ACC-NEGATIVE-002 - approval page does not expose server error text', async ({ page }) => {
    await gotoModule(page, '/approval-accounting');

    await expectNoCrashText(page);
  });
});

