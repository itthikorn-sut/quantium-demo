import { test, expect } from '@playwright/test';
import { AccountingPage } from '../pages/AccountingPage';

test.describe('Accounting', () => {
  let accountingPage: AccountingPage;

  test.beforeEach(async ({ page }) => {
    accountingPage = new AccountingPage(page);
  });

  // ── Trial Balance ──────────────────────────────────────────
  test('ACC-HAPPY-001 — trial balance page renders heading', async () => {
    await accountingPage.goto('trial-balance');
    await expect(accountingPage.heading(/trial balance/i)).toBeVisible({ timeout: 15000 });
  });

  test('ACC-HAPPY-002 — trial balance has fund vehicle selector', async () => {
    await accountingPage.goto('trial-balance');
    await expect(accountingPage.fundVehicleSelector()).toBeVisible({ timeout: 15000 });
  });

  test('ACC-HAPPY-003 — trial balance has "Group by type" control', async () => {
    await accountingPage.goto('trial-balance');
    await expect(accountingPage.groupByTypeControl()).toBeVisible();
  });

  test('ACC-HAPPY-004 — trial balance has "Account level" control', async () => {
    await accountingPage.goto('trial-balance');
    await expect(accountingPage.accountLevelControl()).toBeVisible();
  });

  test('ACC-HAPPY-005 — "Generate" button is visible and enabled', async () => {
    await accountingPage.goto('trial-balance');
    const generateBtn = accountingPage.generateButton();
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled();
  });

  test('ACC-HAPPY-006 — export dropdown contains Excel, Word, and PDF', async () => {
    await accountingPage.goto('trial-balance');
    const exportBtn = accountingPage.exportButton();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await expect(accountingPage.exportDropdownOption('excel')).toBeVisible();
    await expect(accountingPage.exportDropdownOption('word')).toBeVisible();
    await expect(accountingPage.exportDropdownOption('pdf')).toBeVisible();
  });

  // ── Period Controls ────────────────────────────────────────
  test('ACC-HAPPY-007 — trial balance has custom period inputs (From/To)', async () => {
    await accountingPage.goto('trial-balance');
    await expect(accountingPage.customPeriodToggle()).toBeVisible();
    await expect(accountingPage.fromDateLabel()).toBeVisible();
    await expect(accountingPage.toDateLabel()).toBeVisible();
  });

  // ── Generate Interaction ───────────────────────────────────
  test('ACC-EDGE-001 — clicking Generate without changing defaults does not crash', async () => {
    await accountingPage.goto('trial-balance');
    await accountingPage.generateButton().click();
    await expect(accountingPage.serverErrorText()).not.toBeVisible();
  });

  // ── Approval Page ──────────────────────────────────────────
  test('ACC-HAPPY-008 — approval page renders heading', async () => {
    await accountingPage.goto('approval-accounting');
    await expect(accountingPage.heading(/approval|close books/i)).toBeVisible({ timeout: 15000 });
  });

  test('ACC-HAPPY-009 — close books tab is present on approval page', async () => {
    await accountingPage.goto('approval-accounting');
    await expect(accountingPage.closeBooksTab()).toBeVisible();
  });

  test('ACC-NEGATIVE-001 — approval page does not show server error', async () => {
    await accountingPage.goto('approval-accounting');
    await expect(accountingPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  // ── Banking Module ─────────────────────────────────────────
  test('ACC-HAPPY-010 — banking module loads with content', async () => {
    await accountingPage.goto('banking');
    // Banking should have a heading or table
    const hasHeading = await accountingPage.heading(/./).count();
    const hasTable = await accountingPage.dataTable().count();
    expect(hasHeading + hasTable).toBeGreaterThanOrEqual(1);
  });

  test('ACC-HAPPY-011 — banking module has interactive elements', async () => {
    await accountingPage.goto('banking');
    const interactiveElements = accountingPage.interactiveElements();
    expect(await interactiveElements.count()).toBeGreaterThanOrEqual(3);
  });

  // ── Journal Module ─────────────────────────────────────────
  test('ACC-HAPPY-012 — journal module loads with content', async () => {
    await accountingPage.goto('journal');
    const hasHeading = await accountingPage.heading(/./).count();
    const hasTable = await accountingPage.dataTable().count();
    expect(hasHeading + hasTable).toBeGreaterThanOrEqual(1);
  });

  test('ACC-HAPPY-013 — journal module has interactive elements', async () => {
    await accountingPage.goto('journal');
    const interactiveElements = accountingPage.interactiveElements();
    expect(await interactiveElements.count()).toBeGreaterThanOrEqual(3);
  });

  // ── Journal Column Headers ─────────────────────────────────
  test('ACC-HAPPY-014 — journal list has expected column headers', async ({ page }) => {
    await accountingPage.goto('journal');
    await page.waitForSelector('th', { timeout: 15000 });
    const texts = (await page.locator('th').allInnerTexts()).join(' ').toLowerCase();
    expect(texts).toMatch(/journal date|date/);
    expect(texts).toMatch(/serial number|serial/);
    expect(texts).toMatch(/account/);
  });

  // ── Chart of Account ──────────────────────────────────────
  test('ACC-HAPPY-015 — chart of account page renders heading', async () => {
    await accountingPage.goto('chart-of-account');
    await expect(accountingPage.heading(/chart of account/i)).toBeVisible({ timeout: 15000 });
  });

  test('ACC-HAPPY-016 — chart of account has data table', async () => {
    await accountingPage.goto('chart-of-account');
    const table = accountingPage.dataTable();
    await expect(table).toBeVisible({ timeout: 15000 });
  });

  test('ACC-HAPPY-017 — chart of account table has expected columns', async ({ page }) => {
    await accountingPage.goto('chart-of-account');
    await page.waitForSelector('th', { timeout: 15000 });
    const texts = (await page.locator('th').allInnerTexts()).join(' ').toLowerCase();
    expect(texts).toMatch(/account code/);
    expect(texts).toMatch(/account name/);
    expect(texts).toMatch(/category|type/);
  });

  test('ACC-HAPPY-018 — chart of account has Add button', async ({ page }) => {
    await accountingPage.goto('chart-of-account');
    const addBtn = page.getByRole('button', { name: /add|new/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
  });

  // ── Banking Column Headers ─────────────────────────────────
  test('ACC-HAPPY-019 — banking list has expected column headers', async ({ page }) => {
    await accountingPage.goto('banking');
    await page.waitForSelector('th', { timeout: 15000 });
    const texts = (await page.locator('th').allInnerTexts()).join(' ').toLowerCase();
    expect(texts).toMatch(/account/);
    expect(texts).toMatch(/account code|code/);
  });

  // ── Negative ───────────────────────────────────────────────
  test('ACC-NEGATIVE-002 — chart of account does not show server error', async () => {
    await accountingPage.goto('chart-of-account');
    await expect(accountingPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('ACC-NEGATIVE-003 — journal does not show server error', async () => {
    await accountingPage.goto('journal');
    await expect(accountingPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('ACC-NEGATIVE-004 — banking does not show server error', async () => {
    await accountingPage.goto('banking');
    await expect(accountingPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
