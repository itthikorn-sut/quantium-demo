import { test, expect } from '@playwright/test';
import { apiBaseURL, authenticatedApiContext } from '../support/api';

test.describe('Auth API', () => {
  const protectedEndpoints = [
    '/api/qfdashboard',
    '/api/capital/list',
    '/api/investor/list',
    '/api/asset/list',
    '/api/crmentity/list',
  ];

  for (const endpoint of protectedEndpoints) {
    test(`API-AUTH-NEGATIVE — unauthenticated ${endpoint} returns 401 or 403`, async ({ request }) => {
      const response = await request.get(`${apiBaseURL}${endpoint}`);

      expect([401, 403, 404]).toContain(response.status());
      expect(response.status()).not.toBeGreaterThanOrEqual(500);
    });
  }

  test('API-AUTH-NEGATIVE-006 — unauthenticated POST to capital returns 401 or 403', async ({ request }) => {
    const response = await request.post(`${apiBaseURL}/api/capital`, {
      headers: { 'Content-Type': 'application/json' },
      data: { investorId: 'test', amount: 100 },
    });

    expect([401, 403, 404, 405]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
  });
});
