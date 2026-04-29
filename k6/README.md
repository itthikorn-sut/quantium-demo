# k6 Load Tests

## What it tests

`dashboard-load.js` simulates concurrent users hitting the two heaviest endpoints:

| Endpoint | Threshold | Why |
|----------|-----------|-----|
| `GET /api/qfdashboard` | P95 < 2s | First screen users see — slow = bad first impression |
| `POST /api/reports/{id}/run` | P95 < 10s | Report generation is compute-heavy; 10s is acceptable |

Error rate threshold: < 1% across all requests.

## Load profile

```
0 → 20 VUs  over 1 minute   (ramp up)
20 → 100 VUs over 3 minutes  (hold — stress)
100 → 0 VUs  over 1 minute   (ramp down)
```

## How to run

**Never run against production.** Only run against a staging environment.

```bash
export LOAD_TEST_BASE_URL=https://staging.quantiumcore.com
export LOAD_TEST_EMAIL=your_staging_email
export LOAD_TEST_PASSWORD=your_staging_password

k6 run k6/dashboard-load.js
```

## Why manual-only in CI

The GitHub Actions pipeline (`ci.yml`) exposes k6 as a `workflow_dispatch` job with a boolean `run_k6` input. It is **never triggered automatically on PRs**.

Reasons:
1. Load tests hit real HTTP endpoints — accidental production runs could degrade service for real users
2. Staging environments may not always be available during PR cycles
3. Load test results vary by environment capacity — not meaningful as a PR gate

To run via GitHub Actions: go to **Actions → QA Pipeline → Run workflow**, set `run_k6 = true` and provide a staging URL.

## Production guard

The CI job validates the target URL before running:

```bash
if echo "$TARGET" | grep -q "quantiumcore.com" && ! echo "$TARGET" | grep -q "staging"; then
  echo "ERROR: k6 target URL appears to be production. Aborting."
  exit 1
fi
```

Any URL containing `quantiumcore.com` without `staging` is rejected.
