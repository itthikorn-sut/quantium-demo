import { expect, type Page } from '@playwright/test';

export class EntitiesPage {
  constructor(private readonly page: Page) {}

  async goto(module: string) {
    await this.page.goto(`/${module}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Tables ─────────────────────────────────────────────────
  dataTable() {
    return this.page.getByRole('table').first();
  }

  columnHeader(colName: string) {
    return this.dataTable().locator('th, [role="columnheader"]').filter({ hasText: new RegExp(`^${colName}$`, 'i') }).first();
  }

  monetaryCells() {
    return this.dataTable().locator('td').filter({ hasText: /^\$[\d,.]+$/ });
  }

  percentageCells() {
    return this.dataTable().locator('td').filter({ hasText: /^\d+\.\d+%$/ });
  }

  assetLinks() {
    return this.dataTable().getByRole('link');
  }

  // ── Actions ────────────────────────────────────────────────
  addButton() {
    return this.page.getByRole('button', { name: /^add$/i }).first();
  }

  addDropdownOptions() {
    return this.page.locator('[role="menu"], [class*="dropdown-menu"], [class*="overlay"]').locator('a, button, [role="menuitem"]');
  }

  // ── Forms ──────────────────────────────────────────────────
  formLabel(labelText: string) {
    return this.page.locator('label').filter({ hasText: new RegExp(`^${labelText}$`, 'i') }).first();
  }

  legalNameInput() {
    return this.page.locator('input[placeholder="Legal name"], input[name*="legal" i]').first();
  }

  logoUploadArea() {
    return this.page.locator('div, section').filter({ hasText: /drag and drop|supported formats/i }).last();
  }

  investorGroupTab() {
    return this.page.locator('a, button, [role="tab"]').filter({ hasText: /^investor group$/i }).first();
  }

  fundVehicleItems() {
    return this.page.locator('div, span, td, a').filter({ hasText: /^(?:USD Fund I|Euro Fund I|USD Fund II)$/i });
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
