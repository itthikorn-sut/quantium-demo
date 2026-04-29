import { expect, type Page } from '@playwright/test';

export class CrmPage {
  constructor(private readonly page: Page) {}

  async goto(subroute: string) {
    await this.page.goto(`/crm/${subroute}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Headings ───────────────────────────────────────────────
  contactsHeading() {
    return this.page.getByRole('heading').filter({ hasText: /contacts/i }).first();
  }

  unauthorizedHeading() {
    return this.page.getByRole('heading').filter({ hasText: /unauthorized/i }).first();
  }

  // ── Actions ────────────────────────────────────────────────
  newContactButton() {
    return this.page.getByRole('button', { name: /new contact/i }).or(this.page.locator('text=/^new contact$/i')).first();
  }

  filterDropdown(name: string) {
    return this.page.locator('label, span').filter({ hasText: new RegExp(`^${name}$`, 'i') }).first();
  }

  viewModeToggle() {
    return this.page.locator('label, span').filter({ hasText: /^view:$/i }).first();
  }

  // ── Content ────────────────────────────────────────────────
  contactListItems() {
    return this.page.locator('[class*="card" i], [class*="contact" i], table tbody tr');
  }

  adminGuidanceText() {
    return this.page.locator('p, div, span').filter({ hasText: /contact your administrator/i }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
