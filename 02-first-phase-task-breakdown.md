# First Phase Task Breakdown

Scope: interview artifacts and Playwright test harness only. AI tooling, GitHub Actions, and k6 are intentionally left for a later phase.

## Completed In This Phase

### Interview Artifacts

- `00-talking-points.md`: interview narrative, demo flow, QA positioning, and questions to ask Quantium.
- `01-feature-audit.md`: product surface summary, confirmed bug writeups, risk framing, and coverage table.
- `03-qa-lead-pov.md`: QA lead operating model, first priorities, and success criteria.
- `04-live-exploration-notes.md`: live route, console, and network observations from the actual Quantium CORE site.

### Playwright Harness

- `package.json`: test scripts for E2E, API, bug reproduction, full suite, and smoke checks.
- `playwright.config.ts`: live Quantium CORE base URL, Chromium project, auth storage state, reports, retry behavior.
- `.env.example`: required runtime variables without storing credentials.
- `tests/e2e/global-setup.ts`: login setup that stores authenticated browser state.
- `tests/pages/LoginPage.ts`: reusable login page object.
- `tests/pages/DashboardPage.ts`: reusable dashboard page object.
- `tests/support/api.ts`: authenticated API request helper.

### Test Coverage

- 103 discovered Playwright tests across 20 spec files.
- Test names use `HAPPY`, `EDGE`, `NEGATIVE`, `API`, and `BUG` prefixes so coverage intent is visible in the Playwright report.
- Coverage spans authentication, dashboard, capital calls, deal transactions, valuation, IRR, waterfall, reports, accounting, investor entities, search, CRM/RBAC, structure chart, file manager, and API contracts.
- Known bug reproduction specs stay under `tests/e2e/bugs` and are included in the headed E2E run.
- Playwright HTML report is the primary review artifact via `playwright-report/`; JSON reporting was removed from the config.

## Review Checklist

- Confirm the interview docs match the story you want to tell.
- Confirm the bug severity and wording feel accurate.
- Confirm the live exploration update matches the story you want to tell.
- Confirm the test scope is right for the first reviewable draft.
- Confirm whether known-bug specs should remain separate from normal E2E runs.
- Confirm whether the next phase should be AI tooling, CI, k6, or repo publishing.

## Commands

- `npm run test:e2e`: run the full E2E suite in headed browser mode.
- `npm run test:api`: run API contract tests.
- `npm run report`: open the Playwright HTML report.
