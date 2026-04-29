import { test } from '@playwright/test';
import { expectNoCrashText, gotoModule } from '../support/ui';

test.describe('Management Fee', () => {
  test('FEE-HAPPY-001 - management fee module loads without crashing', async ({ page }) => {
    await gotoModule(page, '/management-fee');
    await expectNoCrashText(page);
  });
});
