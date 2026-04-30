import { test, expect } from '@playwright/test';
import { AccountingPage } from '../pages/AccountingPage';

const LIST_MODULES = [
  {
    id: 'FUNDOP',
    route: 'fund-operation',
    heading: /fund operation/i,
    columns: ['transaction date', 'type', 'subtype', 'entity'],
  },
  {
    id: 'FUNDINV',
    route: 'fund-investment',
    heading: /fund investments?/i,
    columns: ['date', 'investee fund', 'fund vehicle', 'type'],
  },
  {
    id: 'SPV',
    route: 'spv-transfer',
    heading: /spv transfer/i,
    columns: ['transaction date', 'entity', 'type', 'amount', 'status'],
  },
];

for (const mod of LIST_MODULES) {
  test.describe(`${mod.heading.source} (/${mod.route})`, () => {
    let page_: AccountingPage;

    test.beforeEach(async ({ page }) => {
      page_ = new AccountingPage(page);
      await page_.goto(mod.route);
    });

    // ── Happy ──────────────────────────────────────────────────
    test(`${mod.id}-HAPPY-001 — page renders heading`, async () => {
      await expect(page_.heading(mod.heading)).toBeVisible({ timeout: 15000 });
    });

    test(`${mod.id}-HAPPY-002 — data table is visible`, async () => {
      const table = page_.dataTable();
      await expect(table).toBeVisible({ timeout: 15000 });
    });

    test(`${mod.id}-HAPPY-003 — table has expected column headers`, async ({ page }) => {
      await page.waitForSelector('th', { timeout: 15000 });
      const texts = (await page.locator('th').allInnerTexts()).join(' ').toLowerCase();
      for (const col of mod.columns) {
        expect(texts).toContain(col);
      }
    });

    test(`${mod.id}-HAPPY-004 — interactive elements are present`, async () => {
      const elements = page_.interactiveElements();
      expect(await elements.count()).toBeGreaterThanOrEqual(3);
    });

    // ── Edge ────────────────────────────────────────────────────
    test(`${mod.id}-EDGE-001 — filter controls are accessible`, async ({ page }) => {
      const filterBtn = page.locator('button').filter({ hasText: /filter|search/i }).first();
      await expect(filterBtn).toBeVisible({ timeout: 15000 });
    });

    // ── Negative ────────────────────────────────────────────────
    test(`${mod.id}-NEGATIVE-001 — page does not show server error`, async () => {
      await expect(page_.serverErrorText()).not.toBeVisible({ timeout: 15000 });
    });

    test(`${mod.id}-NEGATIVE-002 — page does not show unauthorized heading`, async ({ page }) => {
      const unauthorized = page.getByRole('heading').filter({ hasText: /unauthorized/i });
      await expect(unauthorized).not.toBeVisible({ timeout: 15000 });
    });
  });
}
