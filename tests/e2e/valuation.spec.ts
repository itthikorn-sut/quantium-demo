import { test, expect } from '@playwright/test';
import { ValuationPage } from '../pages/ValuationPage';

test.describe('Valuation', () => {
  let valuationPage: ValuationPage;

  test.beforeEach(async ({ page }) => {
    valuationPage = new ValuationPage(page);
    await valuationPage.goto();
  });

  // ── Page Structure ─────────────────────────────────────────
  test('VAL-HAPPY-001 — page heading contains "Valuation"', async () => {
    await expect(valuationPage.heading()).toBeVisible({ timeout: 15000 });
  });

  test('VAL-HAPPY-002 — valuation data table is rendered', async () => {
    const table = valuationPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('VAL-HAPPY-003 — table has expected financial column headers', async () => {
    await expect(valuationPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Date', 'Code', 'Fund', 'Instrument',
      'Remaining Investment Cost', 'Previous Valuation', 'New Fair Market Valuation'];
    for (const col of expectedColumns) {
      await expect(valuationPage.columnHeader(col)).toBeVisible();
    }
  });

  // ── Action Buttons ─────────────────────────────────────────
  test('VAL-HAPPY-004 — "New" button exposes creation options', async () => {
    const newBtn = valuationPage.newButton();
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    
    const optionsText = await valuationPage.newDropdownOptions().allInnerTexts();
    const joined = optionsText.join(' ').toLowerCase();
    expect(joined).toMatch(/all deals|single asset|existing deal/);
  });

  test('VAL-HAPPY-005 — filter button opens the filter panel with controls', async () => {
    const filterBtn = valuationPage.filterButton();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(valuationPage.filterResetButton()).toBeVisible();
    await expect(valuationPage.filterApplyButton()).toBeVisible();
  });

  test('VAL-HAPPY-006 — folder view toggle is available', async () => {
    await expect(valuationPage.folderViewButton()).toBeVisible();
  });

  // ── Pagination ─────────────────────────────────────────────
  test('VAL-HAPPY-007 — pagination controls with items-per-page selector', async () => {
    await expect(valuationPage.paginationLabel()).toBeVisible({ timeout: 15000 });
    await expect(valuationPage.itemsPerPageSelect()).toBeVisible();
  });

  test('VAL-HAPPY-008 — page navigation arrows are present', async () => {
    await expect(valuationPage.paginationLabel()).toBeVisible({ timeout: 15000 });
    const nav = valuationPage.pageNavigation();
    expect(await nav.getByRole('link').count()).toBeGreaterThanOrEqual(1);
  });

  // ── Table Data Quality ─────────────────────────────────────
  test('VAL-EDGE-001 — table rows contain date links', async () => {
    await expect(valuationPage.dataTable()).toBeVisible({ timeout: 15000 });
    const dateLinks = valuationPage.dateLinks();
    expect(await dateLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('VAL-EDGE-002 — monetary values are dollar-formatted', async () => {
    await expect(valuationPage.dataTable()).toBeVisible({ timeout: 15000 });
    const dollarCells = valuationPage.monetaryCells();
    expect(await dollarCells.count()).toBeGreaterThanOrEqual(3);
  });

  test('VAL-EDGE-003 — "Last Modified" column shows user and timestamp info', async () => {
    await expect(valuationPage.dataTable()).toBeVisible({ timeout: 15000 });
    await expect(valuationPage.lastModifiedUserCell('interviewguest@quantium.pe')).toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('VAL-NEGATIVE-001 — page does not render crash text', async () => {
    await expect(valuationPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
