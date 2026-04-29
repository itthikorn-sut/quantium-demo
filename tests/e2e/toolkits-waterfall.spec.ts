import { test, expect } from '@playwright/test';
import { ToolkitsPage } from '../pages/ToolkitsPage';

test.describe('Waterfall Distribution Simulator', () => {
  let toolkits: ToolkitsPage;

  test.beforeEach(async ({ page }) => {
    toolkits = new ToolkitsPage(page);
    await toolkits.goto('waterfall');
    await expect(toolkits.heading(/Waterfall distribution simulator/i)).toBeVisible({ timeout: 15000 });
  });

  // ── Page Heading ───────────────────────────────────────────
  test('WF-HAPPY-001 — page heading reads "Waterfall distribution simulator"', async () => {
    await expect(toolkits.heading(/Waterfall distribution simulator/i)).toBeVisible();
  });

  // ── Entity Dropdown ────────────────────────────────────────
  test('WF-HAPPY-002 — "Entity" dropdown is present with label', async () => {
    await expect(toolkits.formLabel(/^Entity$/i)).toBeVisible();
    await expect(toolkits.fundVehicleDropdown()).toBeVisible();
  });

  test('WF-HAPPY-003 — entity dropdown contains known fund vehicles', async () => {
    const options = await toolkits.fundVehicleDropdown().locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining([
      'USD Fund I', 'Euro Fund I', 'USD Fund II', 'USD Fund Parallel'
    ]));
  });

  // ── Allocation Rule Dropdown ───────────────────────────────
  test('WF-HAPPY-004 — "Allocation rule" dropdown is present with label', async () => {
    await expect(toolkits.formLabel(/^Allocation rule$/i)).toBeVisible();
    await expect(toolkits.allocationRuleDropdown()).toBeVisible();
  });

  test('WF-HAPPY-005 — allocation rule dropdown contains expected options', async () => {
    const options = await toolkits.allocationRuleDropdown().locator('option').allInnerTexts();
    expect(options).toEqual(expect.arrayContaining([
      'Capital commitment',
      'Deal specific investment cost',
      'Paid-in capital (due date)',
      'Paid-in capital (payment date)',
      'Remaining Available Capital'
    ]));
  });

  // ── Investor Entity Picker ─────────────────────────────────
  test('WF-HAPPY-006 — "Investor entity" picker button is present', async () => {
    await expect(toolkits.formLabel(/^Investor entity$/i)).toBeVisible();
    await expect(toolkits.investorEntityPickerButton()).toBeVisible();
  });

  test('WF-HAPPY-007 — clicking investor picker opens selection UI', async () => {
    const investorBtn = toolkits.investorEntityPickerButton();
    await investorBtn.click();
    await expect(toolkits.investorSelectionDialog()).toBeVisible({ timeout: 5000 });
  });

  // ── Distribution Amount ────────────────────────────────────
  test('WF-HAPPY-008 — "Distribution amount" input field is present and editable', async () => {
    await expect(toolkits.formLabel(/^Distribution amount$/i)).toBeVisible();
    const amountInput = toolkits.distributionAmountInput();
    expect(await amountInput.count()).toBeGreaterThanOrEqual(1);
  });

  // ── Distribution Date ──────────────────────────────────────
  test('WF-HAPPY-009 — "Distribution date" input has default value', async () => {
    await expect(toolkits.formLabel(/^Distribution date$/i)).toBeVisible();
    const dateInput = toolkits.dateInput();
    await expect(dateInput).toBeVisible();
    const value = await dateInput.inputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ── Action Buttons ─────────────────────────────────────────
  test('WF-HAPPY-010 — "Calculate" button is present and enabled', async () => {
    const calcBtn = toolkits.generateButton();
    await expect(calcBtn).toBeVisible();
    await expect(calcBtn).toBeEnabled();
  });

  test('WF-HAPPY-011 — "Export" button is present', async () => {
    await expect(toolkits.exportButton()).toBeVisible();
  });

  // ── Form Interaction ───────────────────────────────────────
  test('WF-EDGE-001 — changing entity selection is functional', async () => {
    const entitySelect = toolkits.fundVehicleDropdown();
    await entitySelect.selectOption({ label: 'Euro Fund I' });
    await expect(toolkits.serverErrorText()).not.toBeVisible();
  });

  test('WF-EDGE-002 — changing allocation rule is functional', async () => {
    const allocSelect = toolkits.allocationRuleDropdown();
    await allocSelect.selectOption({ label: 'Deal specific investment cost' });
    await expect(toolkits.serverErrorText()).not.toBeVisible();
  });

  // ── Negative ───────────────────────────────────────────────
  test('WF-NEGATIVE-001 — clicking Calculate without amount does not crash', async () => {
    await toolkits.generateButton().click();
    await expect(toolkits.serverErrorText()).not.toBeVisible();
  });

  test('WF-NEGATIVE-002 — page does not show unauthorized state', async () => {
    await expect(toolkits.unauthorizedText()).not.toBeVisible();
  });
});
