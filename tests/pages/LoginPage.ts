import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async signIn(email: string, password: string) {
    await this.goto();
    await this.emailField().fill(email);
    await this.passwordField().fill(password);
    await this.page.getByRole('button', { name: /sign in|log in|login/i }).click();
    await expect(this.page).toHaveURL(/qfdashboard|dashboard/i, { timeout: 20000 });
  }

  async submitEmpty() {
    await this.goto();
    await this.page.getByRole('button', { name: /sign in|log in|login/i }).click();
  }

  errorMessage() {
    return this.page.locator('[class*="error" i], [class*="alert" i], [class*="invalid" i], [role="alert"]').first();
  }

  private emailField() {
    return this.page.locator('input[type="email"], input[name*="email" i], input[autocomplete="username"]').first();
  }

  private passwordField() {
    return this.page.locator('input[type="password"], input[name*="password" i], input[autocomplete="current-password"]').first();
  }
}
