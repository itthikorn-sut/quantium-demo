import { expect, type Page } from '@playwright/test';

export async function gotoModule(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('domcontentloaded');
}

export async function expectBodyToContain(page: Page, pattern: RegExp) {
  await expect(page.locator('body')).toContainText(pattern, { timeout: 15000 });
}

export async function expectNoCrashText(page: Page) {
  await expect(page.locator('body')).not.toContainText(
    /http\s*500|status\s*500|500\s+internal server error|stack trace|unhandled exception|runtime error/i,
    { timeout: 15000 },
  );
}

export async function expectAnyVisible(page: Page, selector: string) {
  await expect(page.locator(selector).first()).toBeVisible();
}
