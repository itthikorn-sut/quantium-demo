import { test, expect } from '@playwright/test';
import { expectBodyToContain, expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Search', () => {
  test('SEARCH-HAPPY-001 - search page exposes entity and transaction discovery', async ({ page }) => {
    await gotoModule(page, '/search');

    await expect(page).toHaveURL(/\/search\/entity/i);
    await expectBodyToContain(page, /search/i);
    await expectBodyToContain(page, /entity|transaction|investor/i);
  });

  test('SEARCH-HAPPY-002 - entity search exposes category selector', async ({ page }) => {
    await gotoModule(page, '/search/entity');

    await expectBodyToContain(page, /entity type/i);
    await expectBodyToContain(page, /fund vehicle|investor|asset|deal/i);
  });

  test('SEARCH-HAPPY-003 - transaction search route is reachable', async ({ page }) => {
    await gotoModule(page, '/search/transaction');

    await expectBodyToContain(page, /transaction/i);
    await expectBodyToContain(page, /search/i);
  });

  test('SEARCH-HAPPY-004 - investor allocation search route is reachable', async ({ page }) => {
    await gotoModule(page, '/search/investor-allocation');

    await expectBodyToContain(page, /investor allocation|search/i);
  });

  test('SEARCH-EDGE-001 - search action is guarded until criteria are selected', async ({ page }) => {
    await gotoModule(page, '/search');

    await expect(page.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  test('SEARCH-EDGE-002 - customize columns and export affordances are visible', async ({ page }) => {
    await gotoModule(page, '/search/entity');

    await expectBodyToContain(page, /customize column table/i);
    await expectBodyToContain(page, /export/i);
  });

  test('SEARCH-NEGATIVE-001 - search page does not expose crash text', async ({ page }) => {
    await gotoModule(page, '/search/entity');

    await expectNoCrashText(page);
  });
});
