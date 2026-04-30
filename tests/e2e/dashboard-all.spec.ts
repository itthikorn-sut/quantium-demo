import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

const CUSTOM_DASHBOARDS = [
  { name: 'CFO Dashboard',                    id: '61e130c5ce6deda422ff561c' },
  { name: 'Single asset metrics dashboard',   id: '62c5406c2103caf15a54bd8d' },
  { name: 'VP Test',                          id: '669dda3cd226052a1ba8f616' },
  { name: 'MB TEST',                          id: '66d4b0d4c106e51ca349e25c' },
];

test.describe('All Master Funds Dashboard', () => {
  // ── Happy ────────────────────────────────────────────────────
  test('AMF-HAPPY-001 — all master funds page renders heading', async ({ page }) => {
    await page.goto('/allmasterfunds');
    await page.waitForLoadState('domcontentloaded');
    const heading = page.getByRole('heading').filter({ hasText: /all master funds/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-002 — currency selector is present', async ({ page }) => {
    await page.goto('/allmasterfunds');
    await page.waitForLoadState('domcontentloaded');
    const currencyBtn = page.getByRole('button', { name: /USD|EUR|GBP/i });
    await expect(currencyBtn.first()).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-003 — period picker is present', async ({ page }) => {
    await page.goto('/allmasterfunds');
    await page.waitForLoadState('domcontentloaded');
    const periodBtn = page.getByRole('button').filter({ hasText: /\d{4}/ });
    await expect(periodBtn.first()).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-004 — aggregated funds overview section renders', async ({ page }) => {
    await page.goto('/allmasterfunds');
    await page.waitForLoadState('domcontentloaded');
    const overview = page.locator('body').filter({ hasText: /aggregated funds overview/i });
    await expect(overview).toBeVisible({ timeout: 15000 });
  });

  test('AMF-HAPPY-005 — fund summary table renders', async ({ page }) => {
    await page.goto('/allmasterfunds');
    await page.waitForLoadState('domcontentloaded');
    const summary = page.locator('body').filter({ hasText: /fund summary/i });
    await expect(summary).toBeVisible({ timeout: 15000 });
  });

  // ── Edge ────────────────────────────────────────────────────
  test('AMF-EDGE-001 — page accessible from "All master funds" nav link', async ({ page }) => {
    await page.goto('/qfdashboard');
    await page.waitForLoadState('domcontentloaded');
    const navLink = page.locator('a[href="/allmasterfunds"]');
    await expect(navLink.first()).toBeVisible();
  });

  // ── Negative ────────────────────────────────────────────────
  test('AMF-NEGATIVE-001 — page does not show server error', async ({ page }) => {
    await page.goto('/allmasterfunds');
    const serverError = page.locator('body').filter({ hasText: /500|internal server error|stack trace/i });
    await expect(serverError).not.toBeVisible({ timeout: 15000 });
  });

  test('AMF-NEGATIVE-002 — page does not show unauthorized message', async ({ page }) => {
    await page.goto('/allmasterfunds');
    const unauthorized = page.getByRole('heading').filter({ hasText: /unauthorized/i });
    await expect(unauthorized).not.toBeVisible({ timeout: 15000 });
  });
});

test.describe('Custom Analytics Dashboards', () => {
  for (const dash of CUSTOM_DASHBOARDS) {
    // ── Happy ──────────────────────────────────────────────────
    test(`CDASH-HAPPY — ${dash.name} loads without server error`, async ({ page }) => {
      await page.goto(`/dashboard/${dash.id}`);
      await page.waitForLoadState('domcontentloaded');
      const serverError = page.locator('body').filter({ hasText: /500|internal server error|stack trace/i });
      await expect(serverError).not.toBeVisible({ timeout: 15000 });
    });

    test(`CDASH-HAPPY — ${dash.name} renders page content`, async ({ page }) => {
      await page.goto(`/dashboard/${dash.id}`);
      await page.waitForLoadState('domcontentloaded');
      const body = page.locator('body');
      await expect(body).toBeVisible({ timeout: 15000 });
      const text = await body.innerText();
      expect(text.trim().length).toBeGreaterThan(50);
    });

    // ── Edge ────────────────────────────────────────────────────
    test(`CDASH-EDGE — ${dash.name} accessible from Dashboard nav sub-menu`, async ({ page }) => {
      await page.goto('/qfdashboard');
      await page.waitForLoadState('domcontentloaded');
      const link = page.locator(`a[href="/dashboard/${dash.id}"]`);
      await expect(link.first()).toBeVisible({ timeout: 10000 });
    });

    // ── Negative ────────────────────────────────────────────────
    test(`CDASH-NEGATIVE — ${dash.name} does not show unauthorized`, async ({ page }) => {
      await page.goto(`/dashboard/${dash.id}`);
      await page.waitForLoadState('domcontentloaded');
      const unauthorized = page.getByRole('heading').filter({ hasText: /unauthorized/i });
      await expect(unauthorized).not.toBeVisible({ timeout: 15000 });
    });
  }
});
