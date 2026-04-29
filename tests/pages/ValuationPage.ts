import { expect, type Page } from '@playwright/test';

export class ValuationPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/valuation');
    await this.page.waitForLoadState('domcontentloaded');
  }

  heading() {
    return this.page.getByRole('heading').filter({ hasText: /Valuation/i }).first();
  }

  dataTable() {
    return this.page.getByRole('table').first();
  }

  columnHeader(colName: string) {
    return this.dataTable().locator('th, [role="columnheader"]').filter({ hasText: new RegExp(`^${colName}$`, 'i') }).first();
  }

  newButton() {
    return this.page.getByRole('button', { name: /^new$/i }).first();
  }

  newDropdownOptions() {
    return this.page.locator('[role="menu"], [class*="dropdown-menu"], [class*="overlay"]').locator('a, button, [role="menuitem"]');
  }

  filterButton() {
    return this.page.getByRole('button', { name: /^filter$/i }).first();
  }

  filterResetButton() {
    return this.page.getByRole('button', { name: /^reset$/i }).first();
  }

  filterApplyButton() {
    return this.page.getByRole('button', { name: /^apply$/i }).first();
  }

  folderViewButton() {
    return this.page.getByRole('button', { name: /^folder view$/i }).first();
  }

  paginationLabel() {
    return this.page.locator('label, span').filter({ hasText: /^Items per page:?$/i }).first();
  }

  itemsPerPageSelect() {
    return this.page.locator('select').filter({ hasText: /15|50|100/ }).first();
  }

  pageNavigation() {
    return this.page.getByRole('navigation').last();
  }

  dateLinks() {
    return this.dataTable().getByRole('link').filter({ hasText: /^\d{4}-\d{2}-\d{2}$/ });
  }

  monetaryCells() {
    return this.dataTable().locator('td').filter({ hasText: /^\$[\d,.]+$/ });
  }

  lastModifiedUserCell(email: string) {
    return this.dataTable().locator('td').filter({ hasText: email }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
