import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('BUG-005 — IRR Type Duplicate Options [EXPECTED TO FAIL ON PROD]', () => {
  test('IRR type options should be uniquely identifiable for automation', async ({ page }) => {
    await page.goto('/irr');
    await page.waitForLoadState('networkidle');

    const irrTypeSelect = page.getByRole('combobox').nth(1);
    
    // Attempt to locate "Whole fund" option
    const wholeFundOptions = irrTypeSelect.locator('option', { hasText: 'Whole fund' });
    const count = await wholeFundOptions.count();

    // If there are multiple options with the same text, they MUST have unique data-testids
    // to be considered "testable" without relying on index-based hacking.
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        const testId = await wholeFundOptions.nth(i).getAttribute('data-testid');
        // This assertion FAILS on production because no data-testid exists to distinguish the duplicates
        expect(testId, `Option ${i} with label "Whole fund" should have a unique data-testid`).not.toBeNull();
      }
    }

    // Alternatively, verify labels are unique to avoid UX confusion
    const allOptions = await irrTypeSelect.locator('option').allInnerTexts();
    const uniqueOptions = new Set(allOptions);
    expect(allOptions.length, 'Labels in IRR type dropdown should be unique for UX clarity').toEqual(uniqueOptions.size);
  });
});
