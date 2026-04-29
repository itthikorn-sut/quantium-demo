import { expect, type Page } from '@playwright/test';

export class StructurePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/entitieschart');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Heading & Container ────────────────────────────────────
  heading() {
    return this.page.getByRole('heading').filter({ hasText: /structure/i }).first();
  }

  chartContainer() {
    return this.page.locator('svg, canvas, [class*="chart" i], [class*="tree" i], [class*="hierarchy" i]').first();
  }

  // ── Chart Content ──────────────────────────────────────────
  fundNode(name: string | RegExp) {
    return this.page.locator('div, span, text, tspan, [class*="node" i]').filter({ hasText: name }).first();
  }

  fundNodesArray() {
    return this.page.locator('div, span, text, tspan, [class*="node" i]').filter({ hasText: /USD Fund I|Euro Fund I|USD Fund II|USD Fund Parallel/i });
  }

  financialLabel(label: string | RegExp) {
    return this.page.locator('div, span, text, tspan').filter({ hasText: label }).first();
  }

  // ── Controls ───────────────────────────────────────────────
  dateInput() {
    return this.page.locator('input[placeholder="yyyy-mm-dd"], input[name*="date" i], input[type="date"]').first();
  }

  // ── Error States ───────────────────────────────────────────
  serverErrorText() {
    return this.page.locator('body').filter({ hasText: /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i });
  }
}
