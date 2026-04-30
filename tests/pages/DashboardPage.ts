import { type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(route = '/qfdashboard') {
    await this.page.goto(route);
    await this.page.waitForLoadState('domcontentloaded');
    // Global wait for Angular to finish rendering the complex dashboards
    await this.page.waitForTimeout(5000);
  }

  // ── KPI Cards ──────────────────────────────────────────────
  /** Matches KPI label text like "Total invested", "Fund Gross IRR", etc. */
  kpiCard(label: string | RegExp) {
    const pattern = typeof label === 'string' ? new RegExp(label, 'i') : label;
    return this.page.locator('body').filter({ hasText: pattern }).locator('*').filter({ hasText: pattern }).first();
  }

  /** Matches KPI numeric values: $275.06m, 39.18%, 2.71x */
  kpiValues() {
    return this.page.locator('body').locator('text=/^\\$[\\d,.]+m?$|^[\\d.]+%$|^[\\d.]+x$/');
  }

  // ── Fund Context & Period Selector ─────────────────────────
  /** H3.dashboard-header: "Dashboard - USD Fund I" */
  fundContextHeading() {
    return this.page.locator('h3.dashboard-header').first();
  }

  periodSelectorButton() {
    return this.page.getByRole('button', { name: /[A-Z][a-z]+ 20\d{2}/ }).first();
  }

  periodButtons() {
    return this.page.getByRole('button', { name: /[A-Z][a-z]+ 20\d{2}/ });
  }

  periodOptions() {
    return this.page.locator('div, span, button, a').filter({ hasText: /^(?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d{2}$/ });
  }

  // ── As-Of Date Input ──────────────────────────────────────
  asOfDateInput() {
    return this.page.locator('input[name="asOfDate"]');
  }

  // ── Chart Checkboxes & Radio Buttons ──────────────────────
  chartCheckboxById(id: string) {
    return this.page.locator(`#${CSS.escape(id)}`);
  }

  chartRadioById(id: string) {
    return this.page.locator(`#${CSS.escape(id)}`);
  }

  // ── Performance Overview Section ───────────────────────────
  /** H4 containing "Performance overview" */
  performanceOverviewHeading() {
    return this.page.locator('body').filter({ hasText: /performance overview/i }).locator('h3, h4, h5').filter({ hasText: /performance overview/i }).first();
  }

  chartTitle(title: string | RegExp) {
    return this.page.locator('body').filter({ hasText: title }).locator('*').filter({ hasText: title }).first();
  }

  /** H4 containing "Portfolio summary" */
  portfolioSummaryHeading() {
    return this.page.locator('h4').filter({ hasText: /portfolio summary/i }).first();
  }

  // ── All Tables & Charts ───────────────────────────────────
  allTables() {
    return this.page.getByRole('table');
  }

  allCharts() {
    return this.page.locator('svg, canvas');
  }

  // ── Portfolio Table (table index 6 on main dashboard) ─────
  portfolioTable() {
    // The portfolio table is the last table, with columns like "Name", "Total investment cost"
    return this.page.getByRole('table').last();
  }

  portfolioColumnHeaders(colName: string) {
    return this.portfolioTable().locator('th').filter({ hasText: new RegExp(colName, 'i') }).first();
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
    return this.page.locator('header, nav, [class*="topbar" i]').locator('span, div').filter({ hasText: /^\d+$/ }).first();
  }

  fundVehicleSelector() {
    return this.page.locator('header, nav, [class*="topbar" i]').getByText('USD Fund I', { exact: true }).first();
  }

  // ── All Master Funds ──────────────────────────────────────
  currencyButton(code: string) {
    return this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${code}\\s*$`, 'i') }).first();
  }

  allMasterFundsHeading() {
    return this.page.getByRole('heading').filter({ hasText: /all master funds/i }).first();
  }

  fundSummaryHeading() {
    return this.page.locator('body').filter({ hasText: /fund summary/i }).locator('h3, h4, h5, h6').filter({ hasText: /fund summary/i }).first();
  }

  // ── Custom Dashboard Components (CFO, Asset Metrics, etc.) ─
  currencySelect() {
    return this.page.locator('select[name="currency"], select#currency');
  }

  quarterListSelect() {
    return this.page.locator('select[name="quarterList"], select#quarterList');
  }

  exportButton(format: string) {
    return this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${format}\\s*$`, 'i') }).first();
  }

  zoomButton(level: string) {
    return this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${level.replace('%', '\\%')}\\s*$`) }).first();
  }

  resetButton() {
    return this.page.locator('button').filter({ hasText: /^\s*Reset\s*$/i }).first();
  }

  allEntitiesButton() {
    return this.page.locator('button').filter({ hasText: /all entities/i }).first();
  }

  fundVehicleHeading() {
    return this.page.getByText(/Dashboard -|Fund vehicle/i).first();
  }

  // ── Search Box (global) ────────────────────────────────────
  searchBox() {
    return this.page.locator('input[placeholder*="Search" i], input[type="search"]').first();
  }

  // ── Error States ───────────────────────────────────────────
  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }

  unauthorizedText() {
    return this.page.locator('body').filter({ hasText: /unauthorized|access denied/i });
  }
}
