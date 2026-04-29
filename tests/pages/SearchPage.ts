import { expect, type Page } from '@playwright/test';

export class SearchPage {
  constructor(private readonly page: Page) {}

  async goto(subroute: string = '') {
    await this.page.goto(`/search/${subroute}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Entity Search ──────────────────────────────────────────
  entityTypeSelector() {
    return this.page.locator('label, span').filter({ hasText: /^entity type$/i }).locator('..').locator('select, [role="combobox"]').first();
  }

  entityTypeOptions() {
    return this.page.locator('[role="option"], option').filter({ hasText: /^(?:Fund Vehicle|Investor|Asset|Deal)$/i });
  }

  searchButton() {
    return this.page.getByRole('button', { name: /^search$/i }).first();
  }

  customizeColumnButton() {
    return this.page.getByRole('button', { name: /customize column/i }).or(this.page.locator('text=/customize column/i')).first();
  }

  exportButton() {
    return this.page.getByRole('button', { name: /^export$/i }).first();
  }

  // ── Route Validations ──────────────────────────────────────
  heading(pattern: RegExp) {
    return this.page.getByRole('heading').filter({ hasText: pattern }).first();
  }

  contentText(pattern: RegExp) {
    return this.page.locator('div, span, p, h1, h2, h3, h4').filter({ hasText: pattern }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
