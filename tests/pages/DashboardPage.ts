import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/qfdashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── KPI Cards ──────────────────────────────────────────────
  kpiCard(label: string) {
    return this.page.locator('div, span, p, h1, h2, h3, h4, h5, h6').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();
  }

  kpiValues() {
    return this.page.locator('text=/^\\$[\\d,.]+$|^[\\d.]+%+$|^[\\d.]+x$/');
  }

  // ── Fund Context & Period Selector ─────────────────────────
  fundContextHeading() {
    return this.page.getByRole('heading').filter({ hasText: /Dashboard\s+-\s+USD Fund I/i }).first();
  }

  periodSelectorButton() {
    return this.page.getByRole('button', { name: /[A-Z][a-z]+ 20\d{2}/ }).first();
  }

  periodOptions() {
    return this.page.locator('div, span, button, a').filter({ hasText: /^(?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}$/ });
  }

  // ── Performance Overview Section ───────────────────────────
  performanceOverviewHeading() {
    return this.page.getByRole('heading', { name: /Performance Overview/i }).first();
  }

  chartTitle(title: string | RegExp) {
    return this.page.locator('div, span, h1, h2, h3, h4, h5, h6').filter({ hasText: title }).first();
  }

  // ── Portfolio Table ────────────────────────────────────────
  portfolioTable() {
    return this.page.getByRole('table').first();
  }

  portfolioColumnHeaders(colName: string) {
    return this.portfolioTable().locator('th, [role="columnheader"]').filter({ hasText: new RegExp(`^${colName}$`, 'i') }).first();
  }

  assetLinks() {
    return this.portfolioTable().getByRole('link');
  }

  assetLinkByText(textPattern: RegExp) {
    return this.portfolioTable().getByRole('link').filter({ hasText: textPattern }).first();
  }

  monetaryCells() {
    return this.portfolioTable().locator('td').filter({ hasText: /^\$[\d,.]+$/ });
  }

  moicCells() {
    return this.portfolioTable().locator('td').filter({ hasText: /^\d+\.\d+x$/ });
  }

  // ── Navigation & Global Shell ──────────────────────────────
  sidebarNav(moduleName: string) {
    return this.page.locator('nav').getByText(moduleName, { exact: true }).first();
  }

  notificationBadge() {
    // Looks for a standalone number (like "18") in a badge style, often in the header
    return this.page.locator('header, nav, [class*="topbar" i]').locator('span, div').filter({ hasText: /^\d+$/ }).first();
  }

  fundVehicleSelector() {
    return this.page.locator('header, nav, [class*="topbar" i]').getByText('USD Fund I', { exact: true }).first();
  }

  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  unauthorizedText() {
    return this.page.locator('body').filter({ hasText: /unauthorized|access denied/i });
  }
}
