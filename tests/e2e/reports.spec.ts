import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Reports', () => {
  test('RPT-HAPPY-001 - reports list exposes list, package, and history navigation', async ({ page }) => {
    await gotoModule(page, '/all-reports/list');

    await expectBodyToContain(page, /reports?/i);
    await expectBodyToContain(page, /list/i);
    await expectBodyToContain(page, /package|history/i);
  });

  test('RPT-HAPPY-002 - report table columns are discoverable', async ({ page }) => {
    await gotoModule(page, '/all-reports/list');

    await expectBodyToContain(page, /report name/i);
    await expectBodyToContain(page, /description/i);
    await expectBodyToContain(page, /last run date/i);
  });

  test('RPT-HAPPY-003 - packages tab route is reachable', async ({ page }) => {
    await gotoModule(page, '/all-reports/packages');

    await expectBodyToContain(page, /packages|reports?/i);
  });

  test('RPT-HAPPY-004 - history tab route is reachable', async ({ page }) => {
    await gotoModule(page, '/all-reports/history');

    await expectBodyToContain(page, /history|reports?/i);
  });

  test('RPT-EDGE-001 - report list handles empty table state without crashing', async ({ page }) => {
    await gotoModule(page, '/all-reports/list');

    await expectNoCrashText(page);
  });

  test('RPT-EDGE-002 - reports tab navigation remains available', async ({ page }) => {
    await gotoModule(page, '/all-reports/list');

    await expect(page.getByRole('tab', { name: /list/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /packages/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /history/i })).toBeVisible();
  });

  test('RPT-NEGATIVE-001 - reports page does not show unauthorized state for guest', async ({ page }) => {
    await gotoModule(page, '/all-reports/list');

    await expect(page.locator('body')).not.toContainText(/unauthorized|access denied/i);
  });
});
