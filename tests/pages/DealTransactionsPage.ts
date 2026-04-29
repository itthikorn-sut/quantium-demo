import { expect, type Page } from '@playwright/test';

export class DealTransactionsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/investment');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoModule(route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState('domcontentloaded');
  }

  heading(pattern: RegExp) {
    return this.page.getByRole('heading').filter({ hasText: pattern }).first();
  }

  dataTable() {
    return this.page.getByRole('table').first();
  }

  columnHeader(colName: string) {
    return this.dataTable().locator('th, [role="columnheader"]').filter({ hasText: new RegExp(`^${colName}$`, 'i') }).first();
  }

  statusCounters() {
    return this.page.locator('div, span, button').filter({ hasText: /^(?:Complete|Open|Scheduled|Overdue)$/i });
  }

  newButton() {
    return this.page.getByRole('button', { name: /^new$/i }).first();
  }

  newDropdownOptions() {
    return this.page.locator('[role="menu"], [class*="dropdown-menu"], [class*="overlay"]').locator('a, button, [role="menuitem"]');
  }

  folderViewButton() {
    return this.page.getByRole('button', { name: /^folder view$/i }).first();
  }

  filterButton() {
    return this.page.getByRole('button', { name: /^filter$/i }).first();
  }

  filterResetButton() {
    return this.page.getByRole('button', { name: /^reset$/i }).first();
  }

  paginationLabel() {
    return this.page.locator('label, span').filter({ hasText: /^Items per page:?$/i }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  unauthorizedText() {
    return this.page.locator('body').filter({ hasText: /unauthorized|access denied/i });
  }
}
