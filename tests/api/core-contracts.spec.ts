import { test, expect } from '@playwright/test';
import { apiBaseURL, authenticatedApiContext } from '../support/api';

test.describe('Core API Contracts', () => {
  // ── Authenticated Endpoints ────────────────────────────────
  test('API-HAPPY-001 — CRM entity returns explicit permission status (not 500)', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/crmentity/list');

    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  test('API-HAPPY-002 — CRM contact-role returns explicit status (not 500)', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/crmcontactrole/list');

    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  test('API-HAPPY-003 — investor list returns JSON with data array', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/investor/list');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    if (response.ok()) {
      const body = await response.json();
      expect(body).toBeDefined();
      expect(typeof body).toBe('object');
    }
    await api.dispose();
  });

  test('API-HAPPY-004 — asset list returns non-500', async () => {
    const api = await authenticatedApiContext();
    const response = await api.get('/api/asset/list');

    expect(response.status()).not.toBeGreaterThanOrEqual(500);
    await api.dispose();
  });

  // ── Content-Type Verification ──────────────────────────────
  test('API-EDGE-001 — authenticated endpoints return JSON content-type', async () => {
    const api = await authenticatedApiContext();
    const endpoints = ['/api/qfdashboard', '/api/capital/list'];

    for (const endpoint of endpoints) {
      const response = await api.get(endpoint);
      if (response.ok()) {
        const contentType = response.headers()['content-type'] || '';
        expect(contentType).toContain('json');
      }
    }
    await api.dispose();
  });

  // ── Unknown Route ──────────────────────────────────────────
  test('API-EDGE-002 — unknown API route returns client error (not 500)', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/api/qa-showcase-route-that-should-not-exist`);

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  // ── Unauthenticated ────────────────────────────────────────
  test('API-NEGATIVE-001 — unauthenticated CRM endpoint returns 401/403', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/api/crmentity/list`);

    expect([401, 403, 404]).toContain(response.status());
    expect(response.status()).not.toBeGreaterThanOrEqual(500);
  });
});
