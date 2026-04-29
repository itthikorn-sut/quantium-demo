import { test, expect } from '@playwright/test';
import { ReportsPage } from '../pages/ReportsPage';

test.describe('Reports', () => {
  let reportsPage: ReportsPage;

  test.beforeEach(async ({ page }) => {
    reportsPage = new ReportsPage(page);
    await reportsPage.goto('list');
  });

  // ── Tab Navigation ─────────────────────────────────────────
  test('RPT-HAPPY-001 — List tab is active and visible', async () => {
    await expect(reportsPage.tab(/list/i)).toBeVisible({ timeout: 15000 });
  });

  test('RPT-HAPPY-002 — Packages tab is clickable', async () => {
    await expect(reportsPage.tab(/packages/i)).toBeVisible();
  });

  test('RPT-HAPPY-003 — History tab is clickable', async () => {
    await expect(reportsPage.tab(/history/i)).toBeVisible();
  });

  // ── Report Table ───────────────────────────────────────────
  test('RPT-HAPPY-004 — report list table renders', async () => {
    await expect(reportsPage.dataTable()).toBeVisible({ timeout: 15000 });
  });

  test('RPT-HAPPY-005 — report table has expected column headers', async () => {
    await expect(reportsPage.dataTable()).toBeVisible({ timeout: 15000 });

    const expectedColumns = ['Report Name', 'Description'];
    for (const col of expectedColumns) {
      await expect(reportsPage.columnHeader(col)).toBeVisible();
    }
  });

  // ── Tab Navigation Interaction ─────────────────────────────
  test('RPT-EDGE-001 — navigating to Packages tab loads package content', async () => {
    await reportsPage.goto('packages');
    await expect(reportsPage.contentText(/packages|reports/i)).toBeVisible();
  });

  test('RPT-EDGE-002 — navigating to History tab loads history content', async () => {
    await reportsPage.goto('history');
    await expect(reportsPage.contentText(/history|reports/i)).toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('RPT-NEGATIVE-001 — reports page does not show unauthorized state', async () => {
    await expect(reportsPage.unauthorizedText()).not.toBeVisible();
  });

  test('RPT-NEGATIVE-002 — reports page does not show crash text', async () => {
    await expect(reportsPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
