import { expect, type Page } from '@playwright/test';

export class ToolkitsPage {
  constructor(private readonly page: Page) {}

  async goto(toolkit: 'irr' | 'waterfall' | 'management-fee') {
    await this.page.goto(`/${toolkit}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── General ────────────────────────────────────────────────
  heading(pattern: RegExp) {
    return this.page.getByRole('heading').filter({ hasText: pattern }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  unauthorizedText() {
    return this.page.locator('body').filter({ hasText: /unauthorized|access denied/i });
  }

  // ── Form Labels ────────────────────────────────────────────
  formLabel(labelText: string | RegExp) {
    return this.page.locator('label').filter({ hasText: labelText }).first();
  }

  // ── Comboboxes (Dropdowns) ─────────────────────────────────
  fundVehicleDropdown() {
    // In Angular/Material, often a select or a custom mat-select
    return this.formLabel(/^Fund vehicle$|^Entity$/i).locator('..').locator('select, [role="combobox"]').first();
  }

  irrTypeDropdown() {
    return this.formLabel(/^IRR type$/i).locator('..').locator('select, [role="combobox"]').first();
  }

  allocationRuleDropdown() {
    return this.formLabel(/^Allocation rule$/i).locator('..').locator('select, [role="combobox"]').first();
  }

  // ── Inputs ─────────────────────────────────────────────────
  dateInput() {
    return this.page.locator('input[placeholder="yyyy-mm-dd"], input[type="date"], input[name*="date" i]').first();
  }

  distributionAmountInput() {
    // Find the input element closely associated with the Distribution amount label
    return this.page.locator('input[type="text"], input[type="number"]').filter({
      has: this.page.locator(':scope')
    }).first();
  }

  investorEntityPickerButton() {
    return this.page.getByRole('button', { name: /select investors/i }).first();
  }

  investorSelectionDialog() {
    return this.page.locator('[role="dialog"], [role="listbox"], [class*="dropdown" i], [class*="modal" i]').first();
  }

  // ── Action Buttons ─────────────────────────────────────────
  generateButton() {
    return this.page.getByRole('button', { name: /^generate|calculate|run$/i }).first();
  }

  exportButton() {
    return this.page.getByRole('button', { name: /^export$/i }).first();
  }
}
