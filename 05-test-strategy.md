# Playwright Test Strategy

## Intent

This harness is meant to read like a QA Lead interview artifact, not just a smoke-test starter. Test names explicitly identify the purpose:

- `HAPPY`: expected workflow or page capability.
- `EDGE`: alternate mode, optional control, boundary state, or route variation.
- `NEGATIVE`: safe failure, validation, permission, or no-crash behavior.
- `BUG`: known production behavior that should become a regression check after remediation.
- `API`: API contract or safe-failure coverage.

## Current Coverage

Current discovery: 103 tests across 20 spec files.

| Layer | Coverage |
| --- | --- |
| UI happy paths | Dashboard, capital calls, deals, valuation, IRR, waterfall, reports, accounting, investors, search, CRM, structure, file manager |
| UI edge paths | Alternate tabs/routes, filters, exports, period controls, disabled guardrails, upload affordances |
| UI negative paths | Validation surfaces, unauthorized pages, no-crash assertions, guest access safety |
| API checks | Authenticated and unauthenticated safe-failure contracts |
| Bug repro | API origin warning, iframe sandbox warning, CRM contact-role permission handling |

## Reporting

Playwright HTML report is the primary review artifact. The config uses:

```ts
reporter: [
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['list']
]
```

JSON output is intentionally not configured for this phase. It can be added later for CI dashboards if needed, but the interview demo should lead with the HTML report.

## Execution Notes

Run with environment variables rather than committing credentials. `npm run test:e2e` runs the full E2E suite in headed browser mode:

```powershell
$env:BASE_URL='https://www.quantiumcore.com'
$env:API_BASE_URL='https://quantiumfundwebapi.azurewebsites.net'
$env:TEST_EMAIL='interviewguest@quantium.pe'
$env:TEST_PASSWORD='<provided password>'
npm run test:e2e
npm run report
```

## Architecture: Page Object Model (POM) & Strict Mode Resolution

Initially, the expanded test suite used raw locators directly inside `.spec.ts` files (e.g., `page.locator('text="Fund vehicle"')`). While this enabled rapid assertion coverage, it led to **Playwright Strict Mode Violations** because broad text selectors matched multiple DOM elements (like menu items, headers, and form labels simultaneously), causing 142 test failures.

To build a robust, QA Lead-level showcase, the entire suite was refactored to use the **Page Object Model (POM)** pattern.

### Resolution Steps
1. **Dedicated Page Classes**: All DOM interactions were extracted into 12 dedicated classes inside `tests/pages/` (e.g., `DashboardPage`, `CapitalCallPage`, `ValuationPage`).
2. **Precise Locators**: Inside the POM, generic text locators were replaced with highly scoped, structurally-aware locators to eliminate strict mode errors:
   - *Before (Strict Mode Error)*: `page.locator('text="Fund vehicle"')`
   - *After (Precise POM)*: `page.locator('label').filter({ hasText: /^Fund vehicle$|^Entity$/i }).locator('..').locator('select').first()`
3. **Clean Specs**: The 14 `.spec.ts` files were rewritten to consume the POM instances, decoupling the test logic (assertions) from the traversal logic (locators). 

This architectural upgrade drastically improves the maintainability of the suite and insulates the tests from minor UI changes and strict-mode fragility (addressing BUG-006).
