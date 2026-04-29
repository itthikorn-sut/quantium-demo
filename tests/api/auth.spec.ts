import { test, expect } from '@playwright/test';
import { apiBaseURL } from '../support/api';

test.describe('Auth API', () => {
  test('API-AUTH-NEGATIVE-001 - unauthenticated API request fails safely', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/api/qfdashboard`);

    expect([401, 403, 404]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
  });
});
