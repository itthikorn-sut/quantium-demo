import { expect, type Page } from '@playwright/test';

export class ReportsPage {
  constructor(private readonly page: Page) {}

  async goto(subroute: string = 'list') {
    await this.page.goto(`/all-reports/${subroute}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Tabs ───────────────────────────────────────────────────
  tab(name: string | RegExp) {
    // Looks for explicit tab roles, or elements that look like tabs
    return this.page.getByRole('tab', { name }).or(
      this.page.locator('[class*="tab" i]').filter({ hasText: name })
    ).first();
  }

  // ── Tables ─────────────────────────────────────────────────
  dataTable() {
    return this.page.getByRole('table').first();
  }

  columnHeader(colName: string) {
    return this.dataTable().locator('th, [role="columnheader"]').filter({ hasText: new RegExp(`^${colName}$`, 'i') }).first();
  }

  // ── Content Checks ─────────────────────────────────────────
  contentText(pattern: RegExp) {
    return this.page.locator('div, span, p, h1, h2, h3, h4').filter({ hasText: pattern }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  unauthorizedText() {
    return this.page.locator('body').filter({ hasText: /unauthorized|access denied/i });
  }
}
