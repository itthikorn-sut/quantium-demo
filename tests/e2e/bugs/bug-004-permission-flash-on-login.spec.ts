import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('BUG-004 - permission warning flashes during authenticated navigation', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('reproduces CRM contact-role permission noise during normal authenticated navigation', async ({ page }) => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    test.skip(!email || !password, 'TEST_EMAIL and TEST_PASSWORD are required for login validation.');

    const permissionConsoleMessages: string[] = [];
    page.on('console', (message) => {
      if (/permission|403|unauthori[sz]ed/i.test(message.text())) {
        permissionConsoleMessages.push(message.text());
      }
    });

    await new LoginPage(page).signIn(email!, password!);
    const forbiddenContactRoleResponse = page.waitForResponse(
      (response) => response.status() === 403 && /crmcontactrole\/list/i.test(response.url()),
      { timeout: 20000 },
    );

    await page.goto('/crm/contact');
    await page.waitForLoadState('domcontentloaded');
    const response = await forbiddenContactRoleResponse;
    await page.waitForTimeout(1000);

    expect(response.url()).toContain('/api/crmcontactrole/list');
    expect(permissionConsoleMessages.join('\n')).toMatch(/permission|403|unauthori[sz]ed/i);
  });
});
