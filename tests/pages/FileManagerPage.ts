import { expect, type Page } from '@playwright/test';

export class FileManagerPage {
  constructor(private readonly page: Page) {}

  async goto(subroute: string = 'fund-vehicle') {
    await this.page.goto(`/documents/${subroute}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Navigation & Headings ──────────────────────────────────
  heading(pattern: RegExp) {
    return this.page.getByRole('heading').filter({ hasText: pattern }).first();
  }

  // ── Inputs ─────────────────────────────────────────────────
  searchInput() {
    return this.page.locator('input[placeholder*="Search" i], input[type="search"]').first();
  }

  // ── File Area ──────────────────────────────────────────────
  fileListingArea() {
    return this.page.locator('table, [class*="file" i], [class*="document" i], [class*="tree" i], [class*="list" i]').first();
  }

  interactiveControls() {
    return this.page.locator('button, a').filter({ hasText: /.+/ });
  }

  // ── Error States ───────────────────────────────────────────
  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
