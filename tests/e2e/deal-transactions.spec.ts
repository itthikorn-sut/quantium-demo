import { test, expect } from '@playwright/test';
import { DealTransactionsPage } from '../pages/DealTransactionsPage';

test.describe('Deal Transactions', () => {
  let dealsPage: DealTransactionsPage;

  test.beforeEach(async ({ page }) => {
    dealsPage = new DealTransactionsPage(page);
    await dealsPage.goto();
  });

  // ── Page Structure ─────────────────────────────────────────
  test('DEAL-HAPPY-001 — deal transaction page renders heading', async () => {
    await expect(dealsPage.heading(/deal|transaction|investment/i)).toBeVisible({ timeout: 15000 });
  });

  test('DEAL-HAPPY-002 — data table renders with rows', async () => {
    const table = dealsPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('DEAL-HAPPY-003 — table has transaction column headers', async () => {
    await expect(dealsPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Date', 'Code', 'Deal', 'Fund', 'Type', 'Amount'];
    for (const col of expectedColumns) {
      await expect(dealsPage.columnHeader(col)).toBeVisible();
    }
  });

  // ── Status Counters ────────────────────────────────────────
  test('DEAL-HAPPY-004 — status counters show completion states', async () => {
    const counters = dealsPage.statusCounters();
    await expect(counters.first()).toBeVisible({ timeout: 15000 });
  });

  // ── Action Buttons ─────────────────────────────────────────
  test('DEAL-HAPPY-005 — "New" button exposes deal creation paths', async () => {
    const newBtn = dealsPage.newButton();
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    
    const optionsText = await dealsPage.newDropdownOptions().allInnerTexts();
    const joined = optionsText.join(' ').toLowerCase();
    expect(joined).toMatch(/new deal|existing deal|single asset|excel import/);
  });

  test('DEAL-HAPPY-006 — folder view toggle is available', async () => {
    await expect(dealsPage.folderViewButton()).toBeVisible();
  });

  test('DEAL-HAPPY-007 — filter button opens filter panel', async () => {
    const filterBtn = dealsPage.filterButton();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(dealsPage.filterResetButton()).toBeVisible();
  });

  // ── Pagination ─────────────────────────────────────────────
  test('DEAL-EDGE-001 — pagination controls exist', async () => {
    await expect(dealsPage.paginationLabel()).toBeVisible({ timeout: 15000 });
  });

  // ── Sub-module: Fund Operation ─────────────────────────────
  test('TXN-HAPPY-001 — fund operation module loads with heading and table', async () => {
    await dealsPage.gotoModule('/fund-operation');
    await expect(dealsPage.heading(/fund operation|operation/i)).toBeVisible({ timeout: 15000 });
    await expect(dealsPage.dataTable()).toBeVisible();
  });

  // ── Sub-module: Fund Investment ────────────────────────────
  test('TXN-HAPPY-002 — fund investment module loads with heading and table', async () => {
    await dealsPage.gotoModule('/fund-investment');
    await expect(dealsPage.heading(/fund investment|investment/i)).toBeVisible({ timeout: 15000 });
    await expect(dealsPage.dataTable()).toBeVisible();
  });

  // ── Sub-module: SPV Transfer ───────────────────────────────
  test('TXN-HAPPY-003 — SPV transfer module loads with heading', async () => {
    await dealsPage.gotoModule('/spv-transfer');
    await expect(dealsPage.heading(/SPV|transfer/i)).toBeVisible({ timeout: 15000 });
  });

  // ── Negative ───────────────────────────────────────────────
  test('DEAL-NEGATIVE-001 — deal list does not expose crash text', async () => {
    await expect(dealsPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('DEAL-NEGATIVE-002 — guest view does not show unauthorized state', async () => {
    await expect(dealsPage.unauthorizedText()).not.toBeVisible();
  });
});
