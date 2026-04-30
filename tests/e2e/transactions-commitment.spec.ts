import { test, expect } from '@playwright/test';
import { AccountingPage } from '../pages/AccountingPage';

test.describe('Commitment', () => {
  let page_: AccountingPage;

  test.beforeEach(async ({ page }) => {
    page_ = new AccountingPage(page);
    await page_.goto('commitment');
  });

  // ── Happy ────────────────────────────────────────────────────
  test('CMT-HAPPY-001 — commitment page renders heading', async () => {
    await expect(page_.heading(/commitment/i)).toBeVisible({ timeout: 15000 });
  });

  test('CMT-HAPPY-002 — commitment list has data table with rows', async () => {
    const table = page_.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(1);
  });

  test('CMT-HAPPY-003 — table has expected column headers (Date, Type, Fund vehicle)', async ({ page }) => {
    await page.waitForSelector('th', { timeout: 15000 });
    const headers = page.locator('th');
    const texts = await headers.allInnerTexts();
    const joined = texts.join(' ').toLowerCase();
    expect(joined).toMatch(/date/);
    expect(joined).toMatch(/type/);
    expect(joined).toMatch(/fund vehicle/i);
  });

  test('CMT-HAPPY-004 — "New" button is present with commitment actions', async ({ page }) => {
    const newBtn = page.getByRole('button', { name: /^new$/i }).or(
      page.locator('button').filter({ hasText: /^new$/i })
    ).first();
    await expect(newBtn).toBeVisible({ timeout: 15000 });
  });

  test('CMT-HAPPY-005 — Filter and Reset buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /filter/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /reset/i }).first()).toBeVisible({ timeout: 15000 });
  });

  // ── Edge ────────────────────────────────────────────────────
  test('CMT-EDGE-001 — Folder View toggle is available', async ({ page }) => {
    const folderView = page.locator('button, a').filter({ hasText: /folder view/i });
    await expect(folderView.first()).toBeVisible({ timeout: 15000 });
  });

  test('CMT-EDGE-002 — New dropdown exposes multiple commitment actions', async ({ page }) => {
    const newBtn = page.locator('button').filter({ hasText: /^new$/i }).first();
    await newBtn.click();
    const menu = page.locator('[role="menu"], [class*="dropdown"], [class*="overlay"]');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });
    const options = await menu.first().innerText();
    expect(options.toLowerCase()).toMatch(/commitment|transfer/);
  });

  // ── Negative ────────────────────────────────────────────────
  test('CMT-NEGATIVE-001 — page does not show server error', async () => {
    await expect(page_.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('CMT-NEGATIVE-002 — page does not show unauthorized heading', async ({ page }) => {
    const unauthorized = page.getByRole('heading').filter({ hasText: /unauthorized/i });
    await expect(unauthorized).not.toBeVisible({ timeout: 15000 });
  });
});
