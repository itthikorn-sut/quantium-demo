import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/qfdashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page.locator('body')).toContainText(/IRR|TVPI|invested|drawdown|dashboard/i);
  }

  kpi(label: string) {
    return this.page.getByText(label, { exact: false }).first();
  }

  dateOrFilterControl() {
    return this.page.getByRole('button', { name: /\w+ \d{4}|filter|date/i }).first();
  }
}

