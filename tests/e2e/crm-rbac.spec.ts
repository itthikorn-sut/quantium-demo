import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('CRM and RBAC', () => {
  test('CRM-HAPPY-001 - contacts list renders for guest user', async ({ page }) => {
    await gotoModule(page, '/crm/contact');

    await expectBodyToContain(page, /contacts/i);
    await expectBodyToContain(page, /new contact/i);
  });

  test('CRM-HAPPY-002 - contact filters are visible', async ({ page }) => {
    await gotoModule(page, '/crm/contact');

    await expectBodyToContain(page, /any title/i);
    await expectBodyToContain(page, /any primary entity/i);
  });

  test('CRM-EDGE-001 - CRM entity route shows explicit unauthorized state', async ({ page }) => {
    await gotoModule(page, '/crm/entity');

    await expectBodyToContain(page, /unauthorized/i);
    await expectBodyToContain(page, /contact your administrator/i);
  });

  test('CRM-EDGE-002 - contact view supports list display mode', async ({ page }) => {
    await gotoModule(page, '/crm/contact');

    await expectBodyToContain(page, /view:/i);
  });

  test('CRM-NEGATIVE-001 - unauthorized route does not look like a blank page', async ({ page }) => {
    await gotoModule(page, '/crm/entity');

    await expect(page.locator('body')).not.toHaveText(/^\s*$/);
  });

  test('CRM-NEGATIVE-002 - contacts page does not expose server crash text', async ({ page }) => {
    await gotoModule(page, '/crm/contact');

    await expectNoCrashText(page);
  });
});

