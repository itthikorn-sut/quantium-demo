import { test, expect } from '@playwright/test';
import { CapitalCallPage } from '../pages/CapitalCallPage';

test.describe('Capital Call', () => {
  let capitalCallPage: CapitalCallPage;

  test.beforeEach(async ({ page }) => {
    capitalCallPage = new CapitalCallPage(page);
    await capitalCallPage.goto();
  });

  // ── Page Structure ─────────────────────────────────────────
  test('CAP-HAPPY-001 — page heading shows "Capital Call - Distribution"', async () => {
    await expect(capitalCallPage.heading()).toBeVisible({ timeout: 15000 });
  });

  test('CAP-HAPPY-002 — data table is rendered with rows', async () => {
    const table = capitalCallPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('CAP-HAPPY-003 — table exposes financial column headers', async () => {
    await expect(capitalCallPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Date', 'Code', 'Fund', 'Instrument', 'Amount', 'Status'];
    for (const col of expectedColumns) {
      await expect(capitalCallPage.columnHeader(col)).toBeVisible();
    }
  });

  // ── Action Buttons ─────────────────────────────────────────
  test('CAP-HAPPY-004 — "New" button is visible and clickable', async () => {
    const newBtn = capitalCallPage.newButton();
    await expect(newBtn).toBeVisible();
    await newBtn.click();
    
    // Check specific options
    const optionsText = await capitalCallPage.newDropdownOptions().allInnerTexts();
    const joined = optionsText.join(' ').toLowerCase();
    expect(joined).toMatch(/single transaction/);
    expect(joined).toMatch(/excel import/);
  });

  test('CAP-HAPPY-005 — filter button opens filter panel', async () => {
    const filterBtn = capitalCallPage.filterButton();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(capitalCallPage.filterResetButton()).toBeVisible();
    await expect(capitalCallPage.filterApplyButton()).toBeVisible();
  });

  test('CAP-HAPPY-006 — folder view toggle button is present', async () => {
    await expect(capitalCallPage.folderViewButton()).toBeVisible();
  });

  // ── Pagination ─────────────────────────────────────────────
  test('CAP-HAPPY-007 — pagination controls are present', async () => {
    await expect(capitalCallPage.dataTable()).toBeVisible({ timeout: 15000 });
    await expect(capitalCallPage.paginationLabel()).toBeVisible();
  });

  test('CAP-HAPPY-008 — items-per-page dropdown has standard options', async () => {
    const pageSizeSelect = capitalCallPage.itemsPerPageSelect();
    await expect(pageSizeSelect).toBeVisible({ timeout: 15000 });

    const options = await pageSizeSelect.locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining(['15', '50', '100']));
  });

  test('CAP-HAPPY-009 — page navigation links are present', async () => {
    await expect(capitalCallPage.paginationLabel()).toBeVisible({ timeout: 15000 });
    const nav = capitalCallPage.pageNavigation();
    const prevLink = nav.getByRole('link', { name: /Previous/i });
    const nextLink = nav.getByRole('link', { name: /Next/i });
    const hasPagination = (await prevLink.count()) > 0 || (await nextLink.count()) > 0;
    expect(hasPagination).toBeTruthy();
  });

  // ── Table Data Quality ─────────────────────────────────────
  test('CAP-EDGE-001 — table cells contain formatted monetary values', async () => {
    await expect(capitalCallPage.dataTable()).toBeVisible({ timeout: 15000 });
    const dollarCells = capitalCallPage.monetaryCells();
    expect(await dollarCells.count()).toBeGreaterThanOrEqual(1);
  });

  test('CAP-EDGE-002 — status column shows known status values', async () => {
    await expect(capitalCallPage.dataTable()).toBeVisible({ timeout: 15000 });
    const statusCells = capitalCallPage.statusCells();
    await expect(statusCells.first()).toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('CAP-NEGATIVE-001 — page does not render server error text', async () => {
    await expect(capitalCallPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('CAP-NEGATIVE-002 — guest user does not see unauthorized message', async () => {
    await expect(capitalCallPage.unauthorizedText()).not.toBeVisible();
  });
});
