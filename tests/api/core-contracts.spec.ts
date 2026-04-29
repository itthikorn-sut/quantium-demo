import { test, expect } from '@playwright/test';
import { apiBaseURL, authenticatedApiContext } from '../support/api';

test.describe('Core API Contracts', () => {
  test('API-HAPPY-001 - authenticated CRM entity permission failure is explicit', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/crmentity/list');

    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  test('API-HAPPY-002 - authenticated CRM contact-role response avoids server error', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/crmcontactrole/list');

    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  test('API-EDGE-001 - unknown API route returns client error not server error', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/api/qa-showcase-route-that-should-not-exist`);

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('API-NEGATIVE-001 - unauthenticated CRM endpoint fails safely', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/api/crmentity/list`);

    expect([401, 403, 404]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
  });
});

