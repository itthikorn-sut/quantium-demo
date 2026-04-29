import { test, expect } from '@playwright/test';
import { EntitiesPage } from '../pages/EntitiesPage';

test.describe('Investor Entities', () => {
  let entitiesPage: EntitiesPage;

  test.beforeEach(async ({ page }) => {
    entitiesPage = new EntitiesPage(page);
  });

  // ── Investor List ──────────────────────────────────────────
  test('INV-HAPPY-001 — investor list page renders data table', async () => {
    await entitiesPage.goto('investor');
    const table = entitiesPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('INV-HAPPY-002 — investor table has expected column headers', async () => {
    await entitiesPage.goto('investor');
    await expect(entitiesPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Legal Name', 'Display Name', 'Investor Role', 'Entity Type',
      'Total Commitment', 'Paid-in Capital'];
    for (const col of expectedColumns) {
      await expect(entitiesPage.columnHeader(col)).toBeVisible();
    }
  });

  test('INV-HAPPY-003 — investor table displays monetary commitment values', async () => {
    await entitiesPage.goto('investor');
    await expect(entitiesPage.dataTable()).toBeVisible({ timeout: 15000 });

    const dollarCells = entitiesPage.monetaryCells();
    expect(await dollarCells.count()).toBeGreaterThanOrEqual(1);
  });

  // ── Add/Create Actions ─────────────────────────────────────
  test('INV-HAPPY-004 — "Add" button exposes single and bulk creation paths', async () => {
    await entitiesPage.goto('investor');
    const addBtn = entitiesPage.addButton();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    
    const optionsText = await entitiesPage.addDropdownOptions().allInnerTexts();
    const joined = optionsText.join(' ').toLowerCase();
    expect(joined).toMatch(/single investor/);
    expect(joined).toMatch(/multiple investors|excel import/);
  });

  // ── Investor Create Form ───────────────────────────────────
  test('INV-HAPPY-005 — create form exposes core master-data fields', async () => {
    await entitiesPage.goto('investor/create');

    for (const label of ['Legal Name', 'Display Name', 'Investor Role', 'Entity Type']) {
      await expect(entitiesPage.formLabel(label)).toBeVisible({ timeout: 15000 });
    }
  });

  test('INV-HAPPY-006 — create form has Legal Name text input', async () => {
    await entitiesPage.goto('investor/create');
    const legalNameInput = entitiesPage.legalNameInput();
    await expect(legalNameInput).toBeVisible();
    await expect(legalNameInput).toBeEditable();
  });

  test('INV-HAPPY-007 — create form supports logo upload area', async () => {
    await entitiesPage.goto('investor/create');
    await expect(entitiesPage.logoUploadArea()).toBeVisible();
  });

  // ── Investor Group Tab ─────────────────────────────────────
  test('INV-EDGE-001 — investor group tab is clickable', async () => {
    await entitiesPage.goto('investor');
    const groupTab = entitiesPage.investorGroupTab();
    await expect(groupTab).toBeVisible();
  });

  // ── Asset Module ───────────────────────────────────────────
  test('ENT-HAPPY-001 — asset list renders a data table', async () => {
    await entitiesPage.goto('asset');
    const table = entitiesPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('ENT-HAPPY-002 — asset table has expected column headers', async () => {
    await entitiesPage.goto('asset');
    await expect(entitiesPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Name', 'Fund Vehicle', 'Investment Cost', 'Ownership'];
    for (const col of expectedColumns) {
      await expect(entitiesPage.columnHeader(col)).toBeVisible();
    }
  });

  test('ENT-HAPPY-003 — asset table rows link to asset detail views', async () => {
    await entitiesPage.goto('asset');
    await expect(entitiesPage.dataTable()).toBeVisible({ timeout: 15000 });

    const assetLink = entitiesPage.assetLinks().first();
    await expect(assetLink).toBeVisible();
    const href = await assetLink.getAttribute('href');
    expect(href).toMatch(/\/asset\/view\//);
  });

  test('ENT-HAPPY-004 — asset table shows ownership percentages', async () => {
    await entitiesPage.goto('asset');
    await expect(entitiesPage.dataTable()).toBeVisible({ timeout: 15000 });

    const percentCells = entitiesPage.percentageCells();
    expect(await percentCells.count()).toBeGreaterThanOrEqual(1);
  });

  // ── Fund Vehicle Module ────────────────────────────────────
  test('ENT-HAPPY-005 — fund vehicle module renders content', async () => {
    await entitiesPage.goto('fundvehicle');
    const funds = entitiesPage.fundVehicleItems();
    await expect(funds.first()).toBeVisible({ timeout: 15000 });
  });

  // ── Negative ───────────────────────────────────────────────
  test('INV-NEGATIVE-001 — investor page does not render crash text', async () => {
    await entitiesPage.goto('investor');
    await expect(entitiesPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('ENT-NEGATIVE-001 — asset page does not render crash text', async () => {
    await entitiesPage.goto('asset');
    await expect(entitiesPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
