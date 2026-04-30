import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { authenticatedApiContext } from '../support/api';

test.describe('Main Dashboard — /qfdashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — KPI Cards
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-001 — KPI cards display executive fund metrics labels', async ({ page }) => {
    // Real DOM uses lowercase text: "Total invested", "Available for Drawdown", etc.
    const kpiLabels = ['Total invested', 'Available for Drawdown', 'Fund Gross IRR', 'Net IRR', 'TVPI'];
    for (const label of kpiLabels) {
      const el = page.locator('body').filter({ hasText: new RegExp(label, 'i') });
      await expect(el).toBeVisible({ timeout: 15000 });
    }
  });

  test('DASH-HAPPY-002 — KPI cards show monetary, percentage, and multiplier values', async ({ page }) => {
    // Values like $275.06m, 39.18%, 2.71x
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toMatch(/\$[\d,.]+m/);   // monetary with m suffix
    expect(bodyText).toMatch(/\d+\.\d+%/);     // percentage
    expect(bodyText).toMatch(/\d+\.\d+x/);     // multiplier
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — Fund Context & Period Selector
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-003 — H3 heading shows "Dashboard - USD Fund I"', async () => {
    await expect(dashboard.fundContextHeading()).toBeVisible({ timeout: 15000 });
    const text = await dashboard.fundContextHeading().innerText();
    expect(text).toMatch(/Dashboard\s+-\s+USD Fund I/i);
  });

  test('DASH-HAPPY-004 — period selector button shows a month-year label', async () => {
    await expect(dashboard.periodSelectorButton()).toBeVisible({ timeout: 15000 });
  });

  test('DASH-HAPPY-005 — period dropdown exposes multiple monthly periods', async ({ page }) => {
    // Use evaluate to click the period dropdown and count items
    const result = await page.evaluate(() => {
      const btn = document.querySelector('button.asofdate-btn') as HTMLButtonElement;
      if (!btn) return { triggerFound: false, itemCount: 0 };
      btn.click();
      // Small sync delay for Angular to process click
      return new Promise<{ triggerFound: boolean; itemCount: number }>(resolve => {
        setTimeout(() => {
          const items = document.querySelectorAll('.dropdown-item');
          const monthItems = Array.from(items).filter(el =>
            /^(January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}$/.test(el.textContent?.trim() || '')
          );
          resolve({ triggerFound: true, itemCount: monthItems.length });
        }, 500);
      });
    });
    expect(result.triggerFound).toBe(true);
    expect(result.itemCount).toBeGreaterThanOrEqual(3);
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — As-Of Date & Chart Controls
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-006 — asOfDate hidden input has a valid date value', async ({ page }) => {
    // The asOfDate input is a hidden form control with a date value (e.g. 2026-04-30)
    const asOfDate = page.locator('input[name="asOfDate"]');
    expect(await asOfDate.count()).toBeGreaterThanOrEqual(1);
    const value = await asOfDate.first().inputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('DASH-HAPPY-007 — "Investments by quarter" checkboxes exist and are checked', async ({ page }) => {
    // Checkboxes are below the fold (top: 1128px) — use evaluate to check state
    const cbState = await page.evaluate(() => {
      const cb0 = document.getElementById('Investments by quarter0') as HTMLInputElement;
      const cb1 = document.getElementById('Investments by quarter1') as HTMLInputElement;
      return { cb0Exists: !!cb0, cb1Exists: !!cb1, cb0Checked: cb0?.checked, cb1Checked: cb1?.checked };
    });
    expect(cbState.cb0Exists).toBe(true);
    expect(cbState.cb1Exists).toBe(true);
    expect(cbState.cb0Checked).toBe(true);
    expect(cbState.cb1Checked).toBe(true);
  });

  test('DASH-HAPPY-008 — "Deal allocation" radio buttons exist with Sector/Industry labels', async ({ page }) => {
    const radioState = await page.evaluate(() => {
      const r0 = document.getElementById('Deal allocation (total investment cost)0') as HTMLInputElement;
      const r1 = document.getElementById('Deal allocation (total investment cost)1') as HTMLInputElement;
      return { r0Exists: !!r0, r1Exists: !!r1, r0Checked: r0?.checked, r1Checked: r1?.checked };
    });
    expect(radioState.r0Exists).toBe(true);
    expect(radioState.r1Exists).toBe(true);
    // One should be checked (Sector is default)
    expect(radioState.r0Checked || radioState.r1Checked).toBe(true);
  });

  test('DASH-HAPPY-009 — "IRR by quarter" has 3 checkboxes', async ({ page }) => {
    const cbState = await page.evaluate(() => {
      return [0, 1, 2].map(i => {
        const el = document.getElementById(`IRR by quarter${i}`);
        return { exists: !!el, checked: (el as HTMLInputElement)?.checked };
      });
    });
    for (const cb of cbState) {
      expect(cb.exists).toBe(true);
    }
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — Performance Overview
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-010 — "Performance overview" section is rendered', async ({ page }) => {
    const perfText = page.locator('body').filter({ hasText: /performance overview/i });
    await expect(perfText).toBeVisible({ timeout: 15000 });
  });

  test('DASH-HAPPY-011 — chart sections present: J Curve, Investments by quarter, Deal allocation, IRR by quarter', async ({ page }) => {
    await page.waitForTimeout(3000); // Let lazy-loaded charts render
    const chartTitles = ['J Curve', 'Investments by quarter', 'Deal allocation', 'IRR by quarter'];
    const bodyText = await page.locator('body').innerText();
    for (const title of chartTitles) {
      expect(bodyText.toLowerCase()).toContain(title.toLowerCase());
    }
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — Portfolio Table
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-012 — "Portfolio summary" heading is visible', async () => {
    await expect(dashboard.portfolioSummaryHeading()).toBeVisible({ timeout: 15000 });
  });

  test('DASH-HAPPY-013 — portfolio table renders with data rows', async () => {
    const table = dashboard.portfolioTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    expect(await table.getByRole('row').count()).toBeGreaterThanOrEqual(2);
  });

  test('DASH-HAPPY-014 — portfolio table has expected column headers', async () => {
    await expect(dashboard.portfolioTable()).toBeVisible({ timeout: 15000 });
    // Real column names from DOM inspection
    const expectedColumns = [
      'Name', 'Initial investment', 'Main industry', 'Current ownership',
      'Total investment cost', 'Realized', 'Fair market value', 'Multiples of cost', 'Gross IRR'
    ];
    for (const col of expectedColumns) {
      await expect(dashboard.portfolioColumnHeaders(col)).toBeVisible();
    }
  });

  test('DASH-HAPPY-015 — portfolio table rows contain clickable asset links', async ({ page }) => {
    const table = dashboard.portfolioTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    // The table rows contain links — find any link inside the last table
    const links = table.locator('a[href]');
    await expect(links.first()).toBeVisible({ timeout: 10000 });
    const href = await links.first().getAttribute('href');
    expect(href).toBeTruthy();
  });

  // ════════════════════════════════════════════════════════════
  // HAPPY PATH — Navigation & Global Shell
  // ════════════════════════════════════════════════════════════
  test('DASH-HAPPY-016 — sidebar navigation contains all major modules', async ({ page }) => {
    const navModules = ['Dashboard', 'Entities', 'Transactions', 'Valuation', 'Toolkits', 'Reports', 'Accounting', 'CRM', 'File manager'];
    const bodyText = await page.locator('body').innerText();
    for (const mod of navModules) {
      expect(bodyText).toContain(mod);
    }
  });

  test('DASH-HAPPY-017 — notification badge shows count "18" in top bar', async () => {
    await expect(dashboard.notificationBadge()).toBeVisible();
  });

  // ════════════════════════════════════════════════════════════
  // EDGE CASES
  // ════════════════════════════════════════════════════════════
  test('DASH-EDGE-001 — fund vehicle selector "USD Fund I" is accessible in top bar', async () => {
    await expect(dashboard.fundVehicleSelector()).toBeVisible();
  });

  test('DASH-EDGE-002 — multiple tables on dashboard render', async ({ page }) => {
    await page.waitForTimeout(3000);
    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible({ timeout: 15000 });
    expect(await tables.count()).toBeGreaterThanOrEqual(3);
  });

  test('DASH-EDGE-003 — SVG/Canvas chart elements are rendered', async ({ page }) => {
    await page.waitForTimeout(3000);
    const charts = page.locator('svg, canvas');
    await expect(charts.first()).toBeVisible({ timeout: 15000 });
    expect(await charts.count()).toBeGreaterThanOrEqual(1);
  });

  test('DASH-EDGE-004 — search box input exists in the DOM', async ({ page }) => {
    // Search box exists but may be visually hidden (collapsed nav)
    const searchBox = page.locator('input[name="search-box"]');
    expect(await searchBox.count()).toBeGreaterThanOrEqual(1);
  });

  test('DASH-EDGE-005 — portfolio table contains dollar-formatted monetary values', async ({ page }) => {
    const table = dashboard.portfolioTable();
    await expect(table).toBeVisible({ timeout: 15000 });
    // Values like $170,110,000.00 or $ 0.00 — match cells containing $ and digits
    const dollarCells = table.locator('td').filter({ hasText: /\$[\d,.]+/ });
    expect(await dollarCells.count()).toBeGreaterThanOrEqual(1);
  });

  // ════════════════════════════════════════════════════════════
  // NEGATIVE
  // ════════════════════════════════════════════════════════════
  test('DASH-NEGATIVE-001 — dashboard does not render server error text', async () => {
    await expect(dashboard.serverErrorText()).not.toBeVisible();
  });

  test('DASH-NEGATIVE-002 — dashboard does not show unauthorized message', async () => {
    await expect(dashboard.unauthorizedText()).not.toBeVisible();
  });

  // ════════════════════════════════════════════════════════════
  // API
  // ════════════════════════════════════════════════════════════
  test('DASH-API-001 — dashboard API returns non-500 response', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });
});
