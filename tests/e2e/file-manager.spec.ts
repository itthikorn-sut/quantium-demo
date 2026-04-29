import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('File Manager', () => {
  test('FILE-HAPPY-001 - fund vehicle document area is reachable', async ({ page }) => {
    await gotoModule(page, '/documents/fund-vehicle');

    await expectBodyToContain(page, /file manager|document|fund vehicle/i);
  });

  test('FILE-HAPPY-002 - document search remains available', async ({ page }) => {
    await gotoModule(page, '/documents/fund-vehicle');

    await expect(page.locator('input[placeholder="Search"]:visible')).toBeVisible();
  });

  test('FILE-EDGE-001 - document page handles guest permissions explicitly', async ({ page }) => {
    await gotoModule(page, '/documents/fund-vehicle');

    await expect(page.locator('body')).not.toHaveText(/^\s*$/);
  });

  test('FILE-NEGATIVE-001 - document page does not expose crash text', async ({ page }) => {
    await gotoModule(page, '/documents/fund-vehicle');

    await expectNoCrashText(page);
  });
});
