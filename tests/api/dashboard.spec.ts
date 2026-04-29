import { test, expect } from '@playwright/test';
import { authenticatedApiContext } from '../support/api';

test.describe('Dashboard API', () => {
  test('API-DASH-HAPPY-001 - authenticated dashboard endpoint avoids server errors', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/qfdashboard');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });
});
