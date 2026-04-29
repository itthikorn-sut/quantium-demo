import { test, expect } from '@playwright/test';
import { ToolkitsPage } from '../pages/ToolkitsPage';

test.describe('Management Fee', () => {
  let toolkits: ToolkitsPage;

  test.beforeEach(async ({ page }) => {
    toolkits = new ToolkitsPage(page);
    await toolkits.goto('management-fee');
  });

  test('FEE-HAPPY-001 — page heading contains "Management Fee"', async () => {
    await expect(toolkits.heading(/management fee/i)).toBeVisible({ timeout: 15000 });
  });

  test('FEE-HAPPY-002 — fund vehicle selector dropdown is present', async () => {
    // Assuming Management Fee has similar layout to IRR/Waterfall
    await expect(toolkits.fundVehicleDropdown()).toBeVisible({ timeout: 15000 });
  });

  test('FEE-HAPPY-003 — date or period controls are present', async () => {
    await expect(toolkits.dateInput()).toBeVisible({ timeout: 15000 });
  });

  test('FEE-HAPPY-004 — generate or calculate button is present', async () => {
    const actionBtn = toolkits.generateButton();
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toBeEnabled();
  });

  test('FEE-NEGATIVE-001 — page does not show crash text', async () => {
    await expect(toolkits.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
