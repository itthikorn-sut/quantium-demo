import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { authenticatedApiContext } from '../support/api';

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  // ── KPI Cards ──────────────────────────────────────────────
  test('DASH-HAPPY-001 — KPI cards display executive fund metrics', async () => {
    const kpiLabels = ['Total Invested', 'Available for Drawdown', 'Fund Gross IRR', 'Net IRR', 'TVPI'];
    for (const label of kpiLabels) {
      await expect(dashboard.kpiCard(label)).toBeVisible({ timeout: 15000 });
    }
  });

  test('DASH-HAPPY-002 — KPI cards show numerical values (not blank)', async () => {
    const kpiValues = dashboard.kpiValues();
    await expect(kpiValues.first()).toBeVisible({ timeout: 15000 });
    expect(await kpiValues.count()).toBeGreaterThanOrEqual(4);
  });

  // ── Fund Context & Period Selector ─────────────────────────
  test('DASH-HAPPY-003 — fund context heading shows active fund vehicle', async () => {
    await expect(dashboard.fundContextHeading()).toBeVisible({ timeout: 15000 });
  });

  test('DASH-HAPPY-004 — period selector button shows a month-year label', async () => {
    await expect(dashboard.periodSelectorButton()).toBeVisible();
  });

  test('DASH-HAPPY-005 — period dropdown exposes multiple monthly periods', async () => {
    await dashboard.periodSelectorButton().click();
    const periodOptions = dashboard.periodOptions();
    expect(await periodOptions.count()).toBeGreaterThanOrEqual(3);
  });

  // ── Performance Overview Section ───────────────────────────
  test('DASH-HAPPY-006 — performance overview section is rendered', async () => {
    await expect(dashboard.performanceOverviewHeading()).toBeVisible();
  });

  test('DASH-HAPPY-007 — chart sections are present with titles', async () => {
    const chartTitles = [/^Investments by quarter$/i, /^Deal allocation$/i, /^IRR by quarter$/i];
    for (const title of chartTitles) {
      await expect(dashboard.chartTitle(title)).toBeVisible();
    }
  });

  // ── Portfolio Table ────────────────────────────────────────
  test('DASH-HAPPY-008 — portfolio table renders with data rows', async () => {
    const table = dashboard.portfolioTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('DASH-HAPPY-009 — portfolio table has expected column headers', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = [
      'Name', 'Vintage', 'Industry', 'Commitment', 'Ownership',
      'Investment Cost', 'Remaining Cost', 'Realized Proceeds',
      'Unrealized FMV', 'Total Value', 'MOIC', 'Gross IRR'
    ];
    for (const col of expectedColumns) {
      await expect(dashboard.portfolioColumnHeaders(col)).toBeVisible();
    }
  });

  test('DASH-HAPPY-010 — portfolio table rows contain asset links', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });
    const assetLinks = dashboard.assetLinkByText(/Treasury Tech|WD|Syntec|Embed Systems/i);
    expect(await assetLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('DASH-HAPPY-011 — asset links navigate to asset detail views', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });
    const firstAssetLink = dashboard.assetLinks().first();
    await expect(firstAssetLink).toBeVisible();
    const href = await firstAssetLink.getAttribute('href');
    expect(href).toMatch(/\/asset\/view\//);
  });

  // ── Navigation & Global Shell ──────────────────────────────
  test('DASH-HAPPY-012 — sidebar navigation contains all major modules', async () => {
    const navModules = ['Dashboard', 'Entities', 'Transactions', 'Valuation', 'Toolkits', 'Reports', 'Accounting', 'CRM', 'File manager'];
    for (const mod of navModules) {
      await expect(dashboard.sidebarNav(mod)).toBeVisible();
    }
  });

  test('DASH-HAPPY-013 — notification badge shows count in top bar', async () => {
    await expect(dashboard.notificationBadge()).toBeVisible();
  });

  // ── Edge Cases ─────────────────────────────────────────────
  test('DASH-EDGE-001 — fund vehicle selector is accessible in the top bar', async () => {
    await expect(dashboard.fundVehicleSelector()).toBeVisible();
  });

  test('DASH-EDGE-002 — dashboard data includes monetary values with $ formatting', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });
    const dollarCells = dashboard.monetaryCells();
    expect(await dollarCells.count()).toBeGreaterThanOrEqual(5);
  });

  test('DASH-EDGE-003 — MOIC column values are formatted as multipliers', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });
    const moicCells = dashboard.moicCells();
    expect(await moicCells.count()).toBeGreaterThanOrEqual(1);
  });

  // ── Negative ───────────────────────────────────────────────
  test('DASH-NEGATIVE-001 — dashboard does not render server error text', async () => {
    await expect(dashboard.serverErrorText()).not.toBeVisible();
  });

  test('DASH-NEGATIVE-002 — dashboard does not show unauthorized message', async () => {
    await expect(dashboard.unauthorizedText()).not.toBeVisible();
  });

  // ── API ────────────────────────────────────────────────────
  test('DASH-API-001 — dashboard API returns non-500 response', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });
});
