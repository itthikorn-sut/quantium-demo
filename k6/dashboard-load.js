// k6/dashboard-load.js
// ⚠️  DO NOT run against production. Manual trigger only via workflow_dispatch.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.01'],
  },
};

export function setup() {
  const loginRes = http.post(`${__ENV.LOAD_TEST_BASE_URL}/api/auth/token`, {
    email: __ENV.LOAD_TEST_EMAIL,
    password: __ENV.LOAD_TEST_PASSWORD,
  });
  return { token: loginRes.json('access_token') };
}

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}` };

  const dashRes = http.get(`${__ENV.LOAD_TEST_BASE_URL}/api/qfdashboard`, { headers });
  errorRate.add(dashRes.status !== 200);
  check(dashRes, {
    'dashboard 200': (r) => r.status === 200,
    'dashboard < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);

  const reportRes = http.post(
    `${__ENV.LOAD_TEST_BASE_URL}/api/reports/1/run`,
    JSON.stringify({ fundId: 1 }),
    { headers }
  );
  check(reportRes, {
    'report 200': (r) => r.status === 200,
    'report < 10s': (r) => r.timings.duration < 10000,
  });
  sleep(2);
}
