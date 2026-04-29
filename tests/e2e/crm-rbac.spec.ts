import { test, expect } from '@playwright/test';
import { CrmPage } from '../pages/CrmPage';

test.describe('CRM and RBAC', () => {
  let crmPage: CrmPage;

  test.beforeEach(async ({ page }) => {
    crmPage = new CrmPage(page);
  });

  // ── Contacts Page ──────────────────────────────────────────
  test('CRM-HAPPY-001 — contacts page renders heading', async () => {
    await crmPage.goto('contact');
    await expect(crmPage.contactsHeading()).toBeVisible({ timeout: 15000 });
  });

  test('CRM-HAPPY-002 — "New contact" button is visible', async () => {
    await crmPage.goto('contact');
    await expect(crmPage.newContactButton()).toBeVisible();
  });

  test('CRM-HAPPY-003 — contact filter dropdowns are present', async () => {
    await crmPage.goto('contact');
    await expect(crmPage.filterDropdown('any title')).toBeVisible();
    await expect(crmPage.filterDropdown('any primary entity')).toBeVisible();
  });

  test('CRM-HAPPY-004 — view mode toggle is present', async () => {
    await crmPage.goto('contact');
    await expect(crmPage.viewModeToggle()).toBeVisible();
  });

  test('CRM-HAPPY-005 — contact list renders data (cards or table rows)', async () => {
    await crmPage.goto('contact');
    const contactItems = crmPage.contactListItems();
    await expect(contactItems.first()).toBeVisible({ timeout: 15000 });
  });

  // ── CRM Entity (Unauthorized) ──────────────────────────────
  test('CRM-EDGE-001 — CRM entity route shows "Unauthorized" heading', async () => {
    await crmPage.goto('entity');
    await expect(crmPage.unauthorizedHeading()).toBeVisible({ timeout: 15000 });
  });

  test('CRM-EDGE-002 — CRM entity shows administrator guidance', async () => {
    await crmPage.goto('entity');
    await expect(crmPage.adminGuidanceText()).toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('CRM-NEGATIVE-001 — unauthorized route is not a blank page', async ({ page }) => {
    await crmPage.goto('entity');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });

  test('CRM-NEGATIVE-002 — contacts page does not show server error', async () => {
    await crmPage.goto('contact');
    await expect(crmPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
