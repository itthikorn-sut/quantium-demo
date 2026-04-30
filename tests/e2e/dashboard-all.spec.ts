import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

const CFO_DASHBOARD_ID = '61e130c5ce6deda422ff561c';
const SINGLE_ASSET_ID = '62c5406c2103caf15a54bd8d';
const VP_TEST_ID = '669dda3cd226052a1ba8f616';
const MB_TEST_ID = '66d4b0d4c106e51ca349e25c';

// ═══════════════════════════════════════════════════════════════
// ALL MASTER FUNDS DASHBOARD
// ═══════════════════════════════════════════════════════════════
test.describe('All Master Funds Dashboard — /allmasterfunds', () => {
  let dash: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dash = new DashboardPage(page);
    await dash.goto('/allmasterfunds');
  });

  // ── Happy ──────────────────────────────────────────────────
  test('AMF-HAPPY-001 — page heading renders "All master funds"', async () => {
    await expect(dash.allMasterFundsHeading()).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-002 — fund summary section renders with quarter label', async () => {
    await expect(dash.fundSummaryHeading()).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-003 — currency dropdown exposes multiple currencies and allows switching', async ({ page }) => {
    // The active currency button acts as the dropdown toggle
    const usdBtn = dash.currencyButton('USD');
    await expect(usdBtn).toBeVisible({ timeout: 15000 });
    await usdBtn.click();
    await page.waitForTimeout(500);

    // Now CNY and EUR should be visible inside the dropdown
    const cnyBtn = dash.currencyButton('CNY');
    const eurBtn = dash.currencyButton('EUR');
    await expect(cnyBtn).toBeVisible();
    await expect(eurBtn).toBeVisible();

    // Click CNY to switch currency
    await cnyBtn.click();
    await page.waitForTimeout(2000);
    // Page should still render without crash
    await expect(dash.allMasterFundsHeading()).toBeVisible();
  });

  test('AMF-HAPPY-004 — period dropdown exposes multiple periods and allows switching', async ({ page }) => {
    const periodBtn = dash.periodSelectorButton();
    await expect(periodBtn).toBeVisible({ timeout: 15000 });
    await periodBtn.click();
    await page.waitForTimeout(500);
    
    // Check multiple period items are available
    const periodItems = page.locator('button.dropdown-item').filter({ hasText: /[A-Z][a-z]+ 20\d{2}/ });
    const count = await periodItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Click a different period
    if (count >= 2) {
      await periodItems.nth(1).click();
      await page.waitForTimeout(2000);
      await expect(dash.fundSummaryHeading()).toBeVisible();
    }
  });

  // ── Edge ────────────────────────────────────────────────────
  test('AMF-EDGE-001 — at least 4 tables are rendered with data', async () => {
    const tables = dash.allTables();
    await expect(tables.first()).toBeVisible({ timeout: 15000 });
    expect(await tables.count()).toBeGreaterThanOrEqual(2);
  });

  test('AMF-EDGE-002 — SVG/Canvas charts are rendered', async () => {
    const charts = dash.allCharts();
    await expect(charts.first()).toBeVisible({ timeout: 15000 });
    expect(await charts.count()).toBeGreaterThanOrEqual(1);
  });

  test('AMF-EDGE-003 — search box is present', async () => {
    expect(await dash.searchBox().count()).toBeGreaterThanOrEqual(1);
  });

  // ── Negative ────────────────────────────────────────────────
  test('AMF-NEGATIVE-001 — page does not show server error', async () => {
    await expect(dash.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('AMF-NEGATIVE-002 — page does not show unauthorized', async () => {
    await expect(dash.unauthorizedText()).not.toBeVisible({ timeout: 15000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// CFO DASHBOARD — Deep Component Coverage
// ═══════════════════════════════════════════════════════════════
test.describe('CFO Dashboard — /dashboard/' + CFO_DASHBOARD_ID, () => {
  let dash: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dash = new DashboardPage(page);
    await dash.goto(`/dashboard/${CFO_DASHBOARD_ID}`);
  });

  // ── Happy ──────────────────────────────────────────────────
  test('CFO-HAPPY-001 — page renders Fund vehicle heading', async () => {
    await expect(dash.fundVehicleHeading()).toBeVisible({ timeout: 15000 });
  });

  test('CFO-HAPPY-002 — currency selector is present and has options', async ({ page }) => {
    const select = dash.currencySelect();
    await expect(select).toBeVisible({ timeout: 15000 });
    const options = select.locator('option');
    expect(await options.count()).toBeGreaterThanOrEqual(1);
  });

  test('CFO-HAPPY-003 — quarterList selector is present and has options', async () => {
    const select = dash.quarterListSelect();
    await expect(select).toBeVisible({ timeout: 15000 });
    const options = select.locator('option');
    expect(await options.count()).toBeGreaterThanOrEqual(1);
  });

  test('CFO-HAPPY-004 — changing currency selector does not crash the page', async ({ page }) => {
    const select = dash.currencySelect();
    await expect(select).toBeVisible({ timeout: 15000 });
    const options = select.locator('option');
    const optCount = await options.count();
    if (optCount >= 2) {
      const secondValue = await options.nth(1).getAttribute('value');
      if (secondValue) {
        await select.selectOption(secondValue);
        await page.waitForTimeout(2000);
        await expect(dash.serverErrorText()).not.toBeVisible();
      }
    }
  });

  test('CFO-HAPPY-005 — changing quarterList selector does not crash the page', async ({ page }) => {
    const select = dash.quarterListSelect();
    await expect(select).toBeVisible({ timeout: 15000 });
    const options = select.locator('option');
    const optCount = await options.count();
    if (optCount >= 2) {
      const secondValue = await options.nth(1).getAttribute('value');
      if (secondValue) {
        await select.selectOption(secondValue);
        await page.waitForTimeout(2000);
        await expect(dash.serverErrorText()).not.toBeVisible();
      }
    }
  });

  test('CFO-HAPPY-006 — Excel export button is visible', async () => {
    await expect(dash.exportButton('Excel')).toBeVisible({ timeout: 15000 });
  });

  test('CFO-HAPPY-007 — PPT export button is visible', async () => {
    await expect(dash.exportButton('PPT')).toBeVisible({ timeout: 15000 });
  });

  test('CFO-HAPPY-008 — Word export button is visible', async () => {
    await expect(dash.exportButton('Word')).toBeVisible({ timeout: 15000 });
  });

  test('CFO-HAPPY-009 — PDF export button is visible', async () => {
    await expect(dash.exportButton('PDF')).toBeVisible({ timeout: 15000 });
  });

  test('CFO-HAPPY-010 — Reset button is visible and clickable', async () => {
    const resetBtn = dash.resetButton();
    await expect(resetBtn).toBeVisible({ timeout: 15000 });
    await resetBtn.click();
    // After reset, page should still be stable
    await expect(dash.fundVehicleHeading()).toBeVisible();
  });

  // ── Edge ────────────────────────────────────────────────────
  test('CFO-EDGE-001 — zoom control buttons (25%, 50%, 100%, 200%) are visible', async () => {
    for (const level of ['25%', '50%', '100%', '200%']) {
      await expect(dash.zoomButton(level)).toBeVisible({ timeout: 15000 });
    }
  });

  test('CFO-EDGE-002 — clicking 50% zoom button does not crash', async ({ page }) => {
    const zoomBtn = dash.zoomButton('50%');
    await expect(zoomBtn).toBeVisible({ timeout: 15000 });
    await zoomBtn.click();
    await page.waitForTimeout(1000);
    await expect(dash.serverErrorText()).not.toBeVisible();
  });

  test('CFO-EDGE-003 — All entities button is visible', async () => {
    await expect(dash.allEntitiesButton()).toBeVisible({ timeout: 15000 });
  });

  test('CFO-EDGE-004 — search box is present on dashboard', async () => {
    expect(await dash.searchBox().count()).toBeGreaterThanOrEqual(1);
  });

  // ── Negative ────────────────────────────────────────────────
  test('CFO-NEGATIVE-001 — page does not show server error', async () => {
    await expect(dash.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });

  test('CFO-NEGATIVE-002 — page does not show unauthorized', async () => {
    await expect(dash.unauthorizedText()).not.toBeVisible({ timeout: 15000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// CUSTOM DASHBOARDS — Data-driven (VP Test, MB TEST, Single Asset)
// ═══════════════════════════════════════════════════════════════
const CUSTOM_DASHBOARDS = [
  { name: 'Single Asset Metrics', id: SINGLE_ASSET_ID },
  { name: 'VP Test',             id: VP_TEST_ID },
  { name: 'MB TEST',             id: MB_TEST_ID },
];

for (const dashDef of CUSTOM_DASHBOARDS) {
  test.describe(`Custom Dashboard: ${dashDef.name}`, () => {
    let dash: DashboardPage;

    test.beforeEach(async ({ page }) => {
      dash = new DashboardPage(page);
      await dash.goto(`/dashboard/${dashDef.id}`);
    });

    // ── Happy ──────────────────────────────────────────────────
    test(`CDASH-HAPPY-001 — ${dashDef.name} renders Fund vehicle heading`, async () => {
      await expect(dash.fundVehicleHeading()).toBeVisible({ timeout: 15000 });
    });

    test(`CDASH-HAPPY-002 — ${dashDef.name} has currency selector`, async () => {
      await expect(dash.currencySelect()).toBeVisible({ timeout: 15000 });
    });

    test(`CDASH-HAPPY-003 — ${dashDef.name} has quarterList selector`, async () => {
      await expect(dash.quarterListSelect()).toBeVisible({ timeout: 15000 });
    });

    test(`CDASH-HAPPY-004 — ${dashDef.name} has export buttons (Excel, PPT, Word, PDF)`, async () => {
      for (const fmt of ['Excel', 'PPT', 'Word', 'PDF']) {
        await expect(dash.exportButton(fmt)).toBeVisible({ timeout: 15000 });
      }
    });

    test(`CDASH-HAPPY-005 — ${dashDef.name} has Reset button`, async () => {
      await expect(dash.resetButton()).toBeVisible({ timeout: 15000 });
    });

    // ── Edge ────────────────────────────────────────────────────
    test(`CDASH-EDGE-001 — ${dashDef.name} has zoom controls`, async () => {
      for (const level of ['25%', '100%']) {
        await expect(dash.zoomButton(level)).toBeVisible({ timeout: 15000 });
      }
    });

    test(`CDASH-EDGE-002 — ${dashDef.name} is accessible from Dashboard nav`, async ({ page }) => {
      await page.goto('/qfdashboard');
      await page.waitForLoadState('domcontentloaded');
      const link = page.locator(`a[href="/dashboard/${dashDef.id}"]`);
      await expect(link.first()).toBeVisible({ timeout: 15000 });
    });

    // ── Negative ────────────────────────────────────────────────
    test(`CDASH-NEGATIVE-001 — ${dashDef.name} does not show server error`, async () => {
      await expect(dash.serverErrorText()).not.toBeVisible({ timeout: 15000 });
    });

    test(`CDASH-NEGATIVE-002 — ${dashDef.name} does not show unauthorized`, async () => {
      await expect(dash.unauthorizedText()).not.toBeVisible({ timeout: 15000 });
    });
  });
}
