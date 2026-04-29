import { test, expect } from '@playwright/test';

test.describe('BUG-003 - OAuth iframe sandbox warning', () => {
  test('reproduces iframe sandbox escape warning on authenticated pages', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') {
        warnings.push(message.text());
      }
    });

    await page.goto('/qfdashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Dashboard/i, { timeout: 15000 });

    expect(warnings.join('\n')).toMatch(/allow-scripts.*allow-same-origin|escape.*sandbox/i);
  });
});
