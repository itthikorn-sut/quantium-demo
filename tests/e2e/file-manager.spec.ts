import { test, expect } from '@playwright/test';
import { FileManagerPage } from '../pages/FileManagerPage';

test.describe('File Manager', () => {
  let fileManagerPage: FileManagerPage;

  test.beforeEach(async ({ page }) => {
    fileManagerPage = new FileManagerPage(page);
    await fileManagerPage.goto();
  });

  // ── Page Structure ─────────────────────────────────────────
  test('FILE-HAPPY-001 — file manager page renders heading', async ({ page }) => {
    // Check if the page has loaded successfully by verifying text content
    const pageText = await page.locator('body').innerText();
    expect(pageText.toLowerCase()).toMatch(/file manager|document|fund vehicle/i);
  });

  test('FILE-HAPPY-002 — search input is present and functional', async () => {
    const searchInput = fileManagerPage.searchInput();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
  });

  test('FILE-HAPPY-003 — file listing area renders content', async () => {
    await expect(fileManagerPage.fileListingArea()).toBeVisible({ timeout: 15000 });
  });

  test('FILE-HAPPY-004 — interactive controls are present (buttons, links)', async () => {
    const controls = fileManagerPage.interactiveControls();
    expect(await controls.count()).toBeGreaterThanOrEqual(2);
  });

  // ── Edge ───────────────────────────────────────────────────
  test('FILE-EDGE-001 — page handles guest permissions without blank page', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });

  // ── Negative ───────────────────────────────────────────────
  test('FILE-NEGATIVE-001 — file manager does not show crash text', async () => {
    await expect(fileManagerPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
  });
});

const DOCUMENT_SUBROUTES = ['investor', 'asset', 'spv', 'other'] as const;

test.describe('Document sub-sections', () => {
  for (const sub of DOCUMENT_SUBROUTES) {
    test.describe(`/documents/${sub}`, () => {
      let fileManagerPage: FileManagerPage;

      test.beforeEach(async ({ page }) => {
        fileManagerPage = new FileManagerPage(page);
        await fileManagerPage.goto(sub);
      });

      // ── Happy ────────────────────────────────────────────────
      test(`FILE-${sub.toUpperCase()}-HAPPY-001 — page renders without blank body`, async ({ page }) => {
        const text = await page.locator('body').innerText();
        expect(text.trim().length).toBeGreaterThan(10);
      });

      test(`FILE-${sub.toUpperCase()}-HAPPY-002 — page has interactive controls`, async () => {
        const controls = fileManagerPage.interactiveControls();
        expect(await controls.count()).toBeGreaterThanOrEqual(2);
      });

      // ── Edge ──────────────────────────────────────────────────
      test(`FILE-${sub.toUpperCase()}-EDGE-001 — document area or content section renders`, async () => {
        await expect(fileManagerPage.fileListingArea()).toBeVisible({ timeout: 15000 });
      });

      // ── Negative ────────────────────────────────────────────
      test(`FILE-${sub.toUpperCase()}-NEGATIVE-001 — page does not show server error`, async () => {
        await expect(fileManagerPage.serverErrorText()).not.toBeVisible({ timeout: 15000 });
      });
    });
  }
});
