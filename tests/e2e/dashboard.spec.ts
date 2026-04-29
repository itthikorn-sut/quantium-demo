import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { authenticatedApiContext } from '../support/api';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Dashboard', () => {
  test('DASH-HAPPY-001 - KPI cards show required executive metrics', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLoaded();

    for (const label of [/total invested/i, /available for drawdown/i, /fund gross irr/i, /net irr/i, /tvpi/i]) {
      await expectBodyToContain(page, label);
    }
  });

  test('DASH-HAPPY-002 - dashboard exposes a filter or date control', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.dateOrFilterControl()).toBeVisible();
  });

  test('DASH-HAPPY-003 - dashboard fund context is visible', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await expectBodyToContain(page, /Dashboard\s+-\s+USD Fund I/i);
  });

  test('DASH-HAPPY-004 - performance overview renders', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await expectBodyToContain(page, /performance overview/i);
  });

  test('DASH-HAPPY-005 - dashboard shows paid-in and investment labels', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await expectBodyToContain(page, /paid-in/i);
    await expectBodyToContain(page, /total investment/i);
  });

  test('DASH-EDGE-001 - multiple monthly dashboard periods are available', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await page.getByRole('button', { name: /[A-Z][a-z]+ 20\d{2}/ }).first().click();

    await expectBodyToContain(page, /January 2026|February 2026|March 2026|April 2026/i);
  });

  test('DASH-EDGE-002 - chart data surfaces are present for accessibility smoke coverage', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await expectBodyToContain(page, /Investments by quarter|Deal allocation|IRR by quarter/i);
  });

  test('DASH-NEGATIVE-001 - dashboard does not render a crash or server error state', async ({ page }) => {
    await gotoModule(page, '/qfdashboard');

    await expectNoCrashText(page);
  });

  test('DASH-API-HAPPY-001 - dashboard API does not return a server error', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });
});
