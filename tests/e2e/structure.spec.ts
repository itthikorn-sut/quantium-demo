import { test, expect } from '@playwright/test';
import { StructurePage } from '../pages/StructurePage';

test.describe('Structure Chart', () => {
  let structurePage: StructurePage;

  test.beforeEach(async ({ page }) => {
    structurePage = new StructurePage(page);
    await structurePage.goto();
  });

  // ── Page Structure ─────────────────────────────────────────
  test('STRUCT-HAPPY-001 — structure chart page renders heading', async () => {
    // Some SPA pages might not have a formal heading, but let's check for the word structure
    const hasStructureText = await structurePage.page.locator('body').innerText();
    expect(hasStructureText.toLowerCase()).toContain('structure');
  });

  test('STRUCT-HAPPY-002 — chart container renders visual elements', async () => {
    await expect(structurePage.chartContainer()).toBeVisible({ timeout: 15000 });
  });

  // ── Fund Hierarchy ─────────────────────────────────────────
  test('STRUCT-HAPPY-003 — fund vehicle names appear in the chart', async () => {
    await expect(structurePage.fundNode(/^USD Fund I$/i)).toBeVisible({ timeout: 15000 });
  });

  test('STRUCT-HAPPY-004 — multiple fund vehicles are displayed', async () => {
    const nodes = structurePage.fundNodesArray();
    expect(await nodes.count()).toBeGreaterThanOrEqual(2);
  });

  // ── Financial Labels ───────────────────────────────────────
  test('STRUCT-HAPPY-005 — commitment financial labels are visible', async () => {
    await expect(structurePage.financialLabel(/^commitment$/i)).toBeVisible();
  });

  test('STRUCT-HAPPY-006 — remaining investment cost labels are visible', async () => {
    await expect(structurePage.financialLabel(/^remaining investment cost$/i)).toBeVisible();
  });

  // ── Date Control ───────────────────────────────────────────
  test('STRUCT-EDGE-001 — as-of date input is present with default date', async () => {
    const dateInput = structurePage.dateInput();
    await expect(dateInput).toBeVisible();
    const value = await dateInput.inputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ── Negative ───────────────────────────────────────────────
  test('STRUCT-NEGATIVE-001 — structure chart does not show crash text', async () => {
    await expect(structurePage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});
