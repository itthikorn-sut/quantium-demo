import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/.auth/user.json' });

const routes = [
  { path: '/asset', name: 'Asset' },
  { path: '/fundvehicle', name: 'Fund Vehicle' },
  { path: '/management-fee', name: 'Management Fee' },
  { path: '/fund-operation', name: 'Fund Operation' },
  { path: '/fund-investment', name: 'Fund Investment' },
  { path: '/spv-transfer', name: 'SPV Transfer' },
  { path: '/banking', name: 'Banking' },
  { path: '/journal', name: 'Journal' }
];

test.describe('Additional Modules Smoke Coverage', () => {
  for (const route of routes) {
    test(`SMOKE-001 — ${route.name} module loads without crashing`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Basic non-crash assertions
      await expect(page.locator('text=500').first()).not.toBeVisible();
      await expect(page.locator('text=Exception').first()).not.toBeVisible();
      
      // Verify something is rendered (not a blank page)
      // We look for any button or heading to confirm page structure loaded
      const hasInteractiveElements = await page.locator('button, a, input, select, table').count();
      expect(hasInteractiveElements).toBeGreaterThan(0);
    });
  }
});
