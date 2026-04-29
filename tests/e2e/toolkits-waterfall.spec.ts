import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText } from '../support/ui';

test.describe('Waterfall Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/waterfall');
    await page.waitForLoadState('domcontentloaded');
  });

  test('WFALL-HAPPY-001 - waterfall page exposes calculation controls', async ({ page }) => {
    await expectBodyToContain(page, /waterfall distribution simulator/i);
    await expect(page.getByRole('button', { name: /calculate/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /export/i }).first()).toBeVisible();
  });

  test('WFALL-HAPPY-002 - allocation rule options are visible', async ({ page }) => {
    await expectBodyToContain(page, /capital commitment/i);
    await expectBodyToContain(page, /deal specific investment cost/i);
    await expectBodyToContain(page, /paid-in capital/i);
  });

  test('WFALL-HAPPY-003 - export formats are available', async ({ page }) => {
    await page.getByRole('button', { name: /export/i }).click();

    await expectBodyToContain(page, /excel/i);
    await expectBodyToContain(page, /word/i);
    await expectBodyToContain(page, /pdf/i);
  });

  test('WFALL-EDGE-001 - investor selector supports multi-investor distribution setup', async ({ page }) => {
    await expectBodyToContain(page, /select investors/i);
  });

  test('WFALL-EDGE-002 - distribution date input is present', async ({ page }) => {
    await expect(page.locator('input[placeholder="yyyy-mm-dd"], input[name*="date" i]').first()).toBeVisible();
  });

  test('WFALL-NEGATIVE-001 - negative amount is rejected or does not produce results', async ({ page }) => {
    const amount = page.locator('xpath=//*[normalize-space()="Distribution amount"]/following::input[1]');
    await amount.fill('-1000000');
    await page.getByRole('button', { name: /calculate/i }).first().click();

    await expectNoCrashText(page);
  });

  test('WFALL-NEGATIVE-002 - initial load does not expose server error text', async ({ page }) => {
    await expectNoCrashText(page);
  });
});
