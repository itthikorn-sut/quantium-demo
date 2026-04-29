import { test, expect } from '@playwright/test';

test.describe('BUG-002 - API origin URL warning', () => {
  test('reproduces missing API origin warning for authenticated pages', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') {
        warnings.push(message.text());
      }
    });

    await page.goto('/qfdashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Dashboard/i, { timeout: 15000 });

    expect(warnings.join('\n')).toMatch(/API origin URL has not been set/i);
  });
});
