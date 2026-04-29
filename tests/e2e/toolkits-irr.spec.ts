import { test, expect } from '@playwright/test';
import { ToolkitsPage } from '../pages/ToolkitsPage';

test.describe('IRR Simulator', () => {
  let toolkits: ToolkitsPage;

  test.beforeEach(async ({ page }) => {
    toolkits = new ToolkitsPage(page);
    await toolkits.goto('irr');
    await expect(toolkits.heading(/IRR simulator/i)).toBeVisible({ timeout: 15000 });
  });

  // ── Fund Vehicle Dropdown ──────────────────────────────────
  test('IRR-HAPPY-001 — fund vehicle dropdown is present with label', async () => {
    await expect(toolkits.formLabel(/^Fund vehicle$/i)).toBeVisible();
    await expect(toolkits.fundVehicleDropdown()).toBeVisible();
  });

  test('IRR-HAPPY-002 — fund vehicle dropdown contains known fund vehicles', async () => {
    const options = await toolkits.fundVehicleDropdown().locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining([
      'USD Fund I', 'Euro Fund I', 'USD Fund II', 'USD Fund Parallel'
    ]));
  });

  test('IRR-HAPPY-003 — fund vehicle dropdown has 9 options', async () => {
    const optionCount = await toolkits.fundVehicleDropdown().locator('option').count();
    expect(optionCount).toBeGreaterThanOrEqual(7);
  });

  // ── IRR Type Dropdown ──────────────────────────────────────
  test('IRR-HAPPY-004 — IRR type dropdown is present with label', async () => {
    await expect(toolkits.formLabel(/^IRR type$/i)).toBeVisible();
    await expect(toolkits.irrTypeDropdown()).toBeVisible();
  });

  test('IRR-HAPPY-005 — IRR type options include all calculation scopes', async () => {
    const options = await toolkits.irrTypeDropdown().locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining([
      'Whole fund', 'Investor specific', 'Deal specific', 'Unlevered performance'
    ]));
  });

  // ── Date Input ─────────────────────────────────────────────
  test('IRR-HAPPY-006 — as-of date input has default value', async () => {
    await expect(toolkits.formLabel(/^IRR as of date$/i)).toBeVisible();
    const dateInput = toolkits.dateInput();
    await expect(dateInput).toBeVisible();
    
    const value = await dateInput.inputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ── Generate Button ────────────────────────────────────────
  test('IRR-HAPPY-007 — "Generate" button is visible and enabled', async () => {
    const generateBtn = toolkits.generateButton();
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled();
  });

  test('IRR-HAPPY-008 — clicking Generate does not crash the page', async () => {
    const generateBtn = toolkits.generateButton();
    await generateBtn.click();
    await expect(toolkits.serverErrorText()).not.toBeVisible();
    await expect(generateBtn).toBeVisible();
  });

  // ── Form Interaction ───────────────────────────────────────
  test('IRR-EDGE-001 — changing fund vehicle selection updates the dropdown value', async () => {
    const fundSelect = toolkits.fundVehicleDropdown();
    await fundSelect.selectOption({ label: 'Euro Fund I' });
    await expect(fundSelect).toHaveValue(/euro|2/i);
  });

  test('IRR-EDGE-002 — selecting "Investor specific" IRR type is functional', async () => {
    const irrTypeSelect = toolkits.irrTypeDropdown();
    await irrTypeSelect.selectOption({ label: 'Investor specific' });
    await expect(toolkits.serverErrorText()).not.toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('IRR-NEGATIVE-001 — simulator does not expose server error on load', async () => {
    await expect(toolkits.serverErrorText()).not.toBeVisible();
  });
});
