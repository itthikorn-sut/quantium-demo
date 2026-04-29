import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText } from '../support/ui';

test.describe('IRR Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/irr');
    await page.waitForLoadState('domcontentloaded');
  });

  test('IRR-HAPPY-001 - simulator exposes required setup controls', async ({ page }) => {
    await expectBodyToContain(page, /IRR simulator/i);
    await expect(page.getByRole('button', { name: /generate|calculate/i }).first()).toBeVisible();
    await expect(page.getByRole('combobox').first().or(page.locator('select, [role="combobox"]').first()).first()).toBeVisible();
  });

  test('IRR-HAPPY-002 - IRR type options include expected calculation scopes', async ({ page }) => {
    await expectBodyToContain(page, /whole fund/i);
    await expectBodyToContain(page, /investor specific/i);
    await expectBodyToContain(page, /deal specific/i);
  });

  test('IRR-HAPPY-003 - known fund vehicles are selectable candidates', async ({ page }) => {
    await expectBodyToContain(page, /USD Fund I/i);
    await expectBodyToContain(page, /Euro Fund I/i);
    await expectBodyToContain(page, /USD Fund II/i);
  });

  test('IRR-HAPPY-004 - generate action is visible for calculation workflow', async ({ page }) => {
    await expect(page.getByRole('button', { name: /generate/i })).toBeVisible();
  });

  test('IRR-EDGE-001 - as-of date input is present for point-in-time calculations', async ({ page }) => {
    await expect(page.locator('input[placeholder="yyyy-mm-dd"], input[name*="date" i]').first()).toBeVisible();
  });

  test('IRR-EDGE-002 - unlevered performance option is visible', async ({ page }) => {
    await expectBodyToContain(page, /unlevered performance/i);
  });

  test('IRR-NEGATIVE-001 - generate without required selections does not crash', async ({ page }) => {
    await page.getByRole('button', { name: /generate/i }).click();

    await expectNoCrashText(page);
  });

  test('IRR-NEGATIVE-002 - simulator does not expose server error text on initial load', async ({ page }) => {
    await expectNoCrashText(page);
  });
});

