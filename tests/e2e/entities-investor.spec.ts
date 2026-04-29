import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Investor Entities', () => {
  test('INV-HAPPY-001 - investor list loads', async ({ page }) => {
    await gotoModule(page, '/investor');

    await expectBodyToContain(page, /investor/i);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('INV-HAPPY-002 - create investor form exposes core master-data fields', async ({ page }) => {
    await gotoModule(page, '/investor/create');

    for (const label of [/legal name/i, /investor role/i, /display name/i, /entity type/i]) {
      await expectBodyToContain(page, label);
    }
  });

  test('INV-HAPPY-003 - investor table exposes commitment and paid-in data', async ({ page }) => {
    await gotoModule(page, '/investor');

    await expectBodyToContain(page, /total commitment/i);
    await expectBodyToContain(page, /paid-in capital/i);
  });

  test('INV-HAPPY-004 - add menu exposes single and bulk creation paths', async ({ page }) => {
    await gotoModule(page, '/investor');
    await page.getByRole('button', { name: /add/i }).click();

    await expectBodyToContain(page, /single investor/i);
    await expectBodyToContain(page, /multiple investors|excel import/i);
  });

  test('INV-EDGE-001 - investor group tab is available', async ({ page }) => {
    await gotoModule(page, '/investor');

    await expectBodyToContain(page, /investor group/i);
  });

  test('INV-EDGE-002 - create form supports logo upload affordance', async ({ page }) => {
    await gotoModule(page, '/investor/create');

    await expectBodyToContain(page, /drag and drop|supported formats/i);
  });

  test('INV-NEGATIVE-001 - create form exposes required legal-name validation surface', async ({ page }) => {
    await gotoModule(page, '/investor/create');

    await expect(page.locator('input[placeholder="Legal name"], input[name*="legal" i]').first()).toBeVisible();
  });

  test('INV-NEGATIVE-002 - investor pages do not render crash text', async ({ page }) => {
    await gotoModule(page, '/investor');

    await expectNoCrashText(page);
  });
});
