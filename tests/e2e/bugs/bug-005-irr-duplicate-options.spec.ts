import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/.auth/user.json' });

test.describe('BUG-005 — IRR Type Duplicate Options [EXPECTED TO FAIL ON PROD]', () => {
  test('IRR type dropdown should not contain duplicate options', async ({ page }) => {
    await page.goto('/irr');
    await page.waitForLoadState('networkidle');

    const irrTypeSelect = page.getByRole('combobox').nth(1);
    const optionsText = await irrTypeSelect.locator('option').allInnerTexts();
    
    // Check for duplicates
    const uniqueOptions = new Set(optionsText);
    
    // FAILS on production: options include 'Whole fund' and 'Investor specific' twice
    expect(optionsText.length).toEqual(uniqueOptions.size);
  });
});
