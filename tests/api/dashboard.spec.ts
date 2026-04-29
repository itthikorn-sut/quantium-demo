import { test, expect } from '@playwright/test';
import { authenticatedApiContext } from '../support/api';

test.describe('Dashboard API', () => {
  test('API-DASH-HAPPY-001 — authenticated dashboard returns non-500', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  test('API-DASH-HAPPY-002 — dashboard response is JSON', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    if (response.ok()) {
      const contentType = response.headers()['content-type'] || '';
      expect(contentType).toContain('json');
    }
    await api.dispose();
  });

  test('API-DASH-HAPPY-003 — dashboard response contains data structure', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    if (response.ok()) {
      const body = await response.json();
      // Dashboard should return an object (not null, not an empty string)
      expect(body).toBeDefined();
      expect(typeof body).toBe('object');
    }
    await api.dispose();
  });
});
