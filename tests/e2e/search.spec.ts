import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

test.describe('Search', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  // ── Entity Search ──────────────────────────────────────────
  test('SEARCH-HAPPY-001 — search page redirects to entity search', async ({ page }) => {
    await searchPage.goto();
    await expect(page).toHaveURL(/\/search\/entity/i);
  });

  test('SEARCH-HAPPY-002 — entity type selector is a dropdown/combobox', async () => {
    await searchPage.goto('entity');
    // We expect either the selector to exist, or the options to be selectable
    const selector = searchPage.entityTypeSelector();
    const options = searchPage.entityTypeOptions();
    expect((await selector.count()) > 0 || (await options.count()) > 0).toBeTruthy();
  });

  test('SEARCH-HAPPY-003 — search button is disabled until criteria selected', async () => {
    await searchPage.goto('');
    const searchBtn = searchPage.searchButton();
    await expect(searchBtn).toBeVisible();
    await expect(searchBtn).toBeDisabled();
  });

  test('SEARCH-HAPPY-004 — "Customize column table" option is available', async () => {
    await searchPage.goto('entity');
    await expect(searchPage.customizeColumnButton()).toBeVisible();
  });

  test('SEARCH-HAPPY-005 — "Export" button is available', async () => {
    await searchPage.goto('entity');
    await expect(searchPage.exportButton()).toBeVisible();
  });

  // ── Transaction Search ─────────────────────────────────────
  test('SEARCH-HAPPY-006 — transaction search route is reachable', async () => {
    await searchPage.goto('transaction');
    await expect(searchPage.contentText(/transaction/i)).toBeVisible({ timeout: 15000 });
  });

  // ── Investor Allocation Search ─────────────────────────────
  test('SEARCH-HAPPY-007 — investor allocation search route is reachable', async () => {
    await searchPage.goto('investor-allocation');
    await expect(searchPage.contentText(/investor allocation|search/i)).toBeVisible({ timeout: 15000 });
  });

  // ── Negative ───────────────────────────────────────────────
  test('SEARCH-NEGATIVE-001 — search page does not crash', async () => {
    await searchPage.goto('entity');
    await expect(searchPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
