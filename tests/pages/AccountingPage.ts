import { expect, type Page } from '@playwright/test';

export class AccountingPage {
  constructor(private readonly page: Page) {}

  async goto(module: string) {
    await this.page.goto(`/${module}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── General ────────────────────────────────────────────────
  heading(pattern: RegExp) {
    return this.page.getByRole('heading').filter({ hasText: pattern }).first();
  }

  dataTable() {
    return this.page.getByRole('table').first();
  }

  interactiveElements() {
    return this.page.locator('button, select, input, a');
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  // ── Trial Balance Specific ─────────────────────────────────
  fundVehicleSelector() {
    // Usually the first combobox on the TB page
    return this.page.getByRole('combobox').first();
  }

  groupByTypeControl() {
    return this.page.locator('label, span').filter({ hasText: /^group by type$/i }).first();
  }

  accountLevelControl() {
    return this.page.locator('label, span').filter({ hasText: /^account level$/i }).first();
  }

  customPeriodToggle() {
    return this.page.locator('label, span, button').filter({ hasText: /^custom$/i }).first();
  }

  fromDateLabel() {
    return this.page.locator('label, span').filter({ hasText: /^from$/i }).first();
  }

  toDateLabel() {
    return this.page.locator('label, span').filter({ hasText: /^to$/i }).first();
  }

  generateButton() {
    return this.page.getByRole('button', { name: /^generate|run$/i }).first();
  }

  exportButton() {
    return this.page.getByRole('button', { name: /^export$/i }).first();
  }

  exportDropdownOption(format: string) {
    return this.page.locator('[role="menu"], [class*="dropdown-menu"], [class*="overlay"]').locator('a, button, [role="menuitem"]').filter({ hasText: new RegExp(`^${format}$`, 'i') }).first();
  }

  // ── Approval Specific ──────────────────────────────────────
  closeBooksTab() {
    return this.page.locator('a, button, [role="tab"]').filter({ hasText: /^close books$/i }).first();
  }
}
