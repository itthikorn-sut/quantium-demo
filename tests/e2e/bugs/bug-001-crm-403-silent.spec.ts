import { test, expect } from '@playwright/test';

test.describe('BUG-001 - CRM contact-role 403 should be handled intentionally', () => {
  test('CRM contact-role permission failure is not left as a raw console error', async ({ page }) => {
    const forbiddenResponses: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() === 403 && /crmcontactrole\/list/i.test(response.url())) {
        forbiddenResponses.push(response.url());
      }
    });

    await page.goto('/crm/contact');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/contacts/i);
    await page.waitForResponse((response) => response.status() === 403 && /crmcontactrole\/list/i.test(response.url()), {
      timeout: 15000
    }).catch(() => undefined);

    expect(forbiddenResponses.length).toBeGreaterThan(0);
    expect(consoleErrors.join('\n')).not.toMatch(/do not have permission to access the CRM contact role list/i);
  });
});
