import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Structure Chart', () => {
  test.beforeEach(async ({ page }) => {
    await gotoModule(page, '/entitieschart');
  });

  test('STRUCT-HAPPY-001 - structure chart loads', async ({ page }) => {
    await expectBodyToContain(page, /structure/i);
    await expectBodyToContain(page, /main fund|feeder fund/i);
  });

  test('STRUCT-HAPPY-002 - fund hierarchy financial labels are visible', async ({ page }) => {
    await expectBodyToContain(page, /commitment/i);
    await expectBodyToContain(page, /remaining investment cost/i);
  });

  test('STRUCT-EDGE-001 - as-of date input is present', async ({ page }) => {
    await expect(page.locator('input[placeholder="yyyy-mm-dd"], input[name*="date" i]').first()).toBeVisible();
  });

  test('STRUCT-EDGE-002 - multiple fund vehicles appear in the chart', async ({ page }) => {
    await expectBodyToContain(page, /USD Fund I|Euro Fund I|USD Fund II/i);
  });

  test('STRUCT-NEGATIVE-001 - structure chart does not expose crash text', async ({ page }) => {
    await expectNoCrashText(page);
  });
});

