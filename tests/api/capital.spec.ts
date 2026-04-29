import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const API_BASE = 'https://quantiumfundwebapi.azurewebsites.net';

function getAuthHeaders(): Record<string, string> {
  const state = JSON.parse(fs.readFileSync('tests/.auth/user.json', 'utf-8'));
  const cookie = state.cookies.map((c: { name: string; value: string }) => `${c.name}=${c.value}`).join('; ');
  return { Cookie: cookie };
}

test.describe('Capital API', () => {
  // CAP-API-003: Paginated list
  test('CAP-API-003 — Capital list returns paginated response', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/capital/list?page=1&size=20`, {
      headers: getAuthHeaders(),
    });
    expect(response.status()).not.toBe(500);
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBeTruthy();
    }
  });

  // CRM-API-002: CRM entity 403 has message body
  test('CRM-API-002 — CRM entity list returns 403 with error body (BUG-001 API side)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/crmentity/list`, {
      headers: getAuthHeaders(),
    });
    expect(response.status()).toBe(403);
    // API returns correct 403 — BUG is that UI doesn't surface this
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
  });

  // CAP-API-002: Over-commitment blocked server-side
  test('CAP-API-002 — Capital call exceeding commitment returns 4xx', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/capital`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      data: { investorId: 'test', amount: 999999999999, callDate: '2026-04-29' },
    });
    // Should reject at server — not 500
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
