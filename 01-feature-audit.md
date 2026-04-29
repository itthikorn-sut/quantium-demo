# Quantium CORE - QA Feature Audit

Tester: Interview showcase draft  
Explored: 2026-04-29  
Environment: `https://www.quantiumcore.com/`

## Product Surface

Quantium CORE appears to support a broad private equity operating model: dashboards, investors, assets, transactions, valuation, toolkits, reports, accounting, CRM, file management, structure charts, and search.

The strongest QA value is in testing the intersections between those modules: fund selection, investor allocation, transaction state, report output, accounting period controls, and permission behavior.

## Confirmed Findings

### BUG-001 [Medium] - CRM contact-role permission failure leaks as console error

Modules: CRM Contact Role lookup  
Routes: `/crm/contact`, related CRM contact-role calls  
Observed behavior: `/api/crmcontactrole/list` returns `403` on the Contacts page. The page still renders contacts, but the role lookup failure appears in the console as `User do not have permission to access the CRM contact role list.`

Live note from 2026-04-29: `/crm/entity` now renders an explicit `Unauthorized` page with administrator guidance, so the original silent-blank-page concern appears partially remediated for CRM Entity.

Expected behavior:

- Permission-restricted contact-role filtering should either be hidden, disabled with explanation, or surfaced as a clear non-blocking page message.
- Console errors should be reserved for actionable diagnostics and should use polished, user-neutral wording.

Impact:

- A partially failed page can confuse users if a filter or related feature silently lacks data.
- Console noise can hide more important client-side problems during QA and support investigation.

Suggested fix:

- Add local handling for restricted CRM contact-role access.
- Suppress or normalize the raw console error once the UI handles the restricted capability intentionally.

Regression test:

- `tests/e2e/bugs/bug-001-crm-403-silent.spec.ts`

### BUG-002 [Medium] - API origin URL warning appears globally

Observed behavior: Console warning reports that the API origin URL has not been set.

Expected behavior:

- Runtime config should provide a non-empty API origin where required.
- Staging and production should fail fast or visibly when a required config value is missing.

Impact:

- Relative fallback behavior may break under different hosting, proxy, or CDN setups.
- Persistent warnings reduce signal quality for real client-side problems.

Suggested fix:

- Validate API origin configuration during app bootstrap.
- Make missing production/staging API origin a deployment-blocking configuration error.

Regression test:

- `tests/e2e/bugs/bug-002-api-origin-warning.spec.ts`

### BUG-003 [Medium/Security] - OAuth silent-refresh iframe sandbox warning

Observed behavior: Browser reports a warning when an iframe sandbox combines `allow-scripts` and `allow-same-origin`.

Expected behavior:

- Authentication iframe sandboxing should avoid combinations that browsers flag as escape-prone.
- If silent refresh needs cross-context communication, use an explicit safe messaging path.

Impact:

- Authentication surfaces have elevated security risk.
- Even if no immediate exploit exists, the warning is worth triaging before it becomes normalized noise.

Suggested fix:

- Review the OAuth silent-refresh implementation and sandbox attributes.
- Remove unnecessary sandbox permissions where feasible.

Regression test:

- `tests/e2e/bugs/bug-003-iframe-sandbox.spec.ts`

### BUG-004 [Critical] - Permission warning flashes during authenticated navigation

Modules: Global shell / authentication bootstrap / CRM permission lookup  
Routes: Reproduced during authenticated navigation to `/crm/contact`; backend call targets `/api/crmcontactrole/list`. User also observed the same permission warning flashing repeatedly during headed suite execution.

Observed behavior:

- During normal authenticated navigation as `interviewguest@quantium.pe`, the frontend issues `GET https://quantiumfundwebapi.azurewebsites.net/api/crmcontactrole/list`.
- The backend returns `403`.
- The browser console logs `User do not have permission to access the CRM contact role list.`
- In headed runs this appears to users as a repeated/flashing "do not have permission" style warning during normal test navigation.

Expected behavior:

- Successful login and permitted modules should not show permission warnings for unrelated restricted CRM capabilities.
- The frontend should only request CRM contact-role data when the current route or visible control needs that data.
- If role metadata is optional for the guest user, the app should handle `403` locally and quietly disable/hide the restricted capability.

Likely root cause:

- A global shell/bootstrap or shared CRM filter component eagerly requests CRM contact-role metadata for the guest user.
- The guest role is not authorized for that endpoint.
- The global HTTP error handler treats the expected `403` as a user-facing permission event instead of a scoped optional-capability failure.

Impact:

- High trust impact: users see "no permission" while doing an apparently valid workflow.
- High QA signal impact: every headed test run looks noisy even when assertions pass.
- High support risk: users may report successful pages as broken because the app flashes an unrelated authorization error.
- Potential security/UX leakage: the app exposes internal permission structure for CRM contact roles on unrelated pages.

Suggested fix:

- Lazy-load `/api/crmcontactrole/list` only on CRM screens or when the relevant filter is opened.
- Add route/component-level handling for optional `403` responses so expected permission restrictions do not trigger global toasts.
- Reserve global permission toasts for the active user action or active route, not background metadata calls.
- Add a regression check that authenticated navigation has zero unexpected background `403` calls and no permission toast outside the active restricted capability.

Regression test:

- `tests/e2e/bugs/bug-004-permission-flash-on-login.spec.ts`

## Test Case Coverage Summary

| Area | Happy | Edge | Negative/Bug | First-Pass Focus |
| --- | ---: | ---: | ---: | --- |
| Authentication | 1 | 1 | 2 | Valid login, empty submit, invalid login, password masking |
| Dashboard | 6 | 2 | 1 | KPIs, fund context, period controls, chart/data surfaces, API non-500 |
| Capital calls | 4 | 2 | 2 | List, filters, new transaction paths, required-field validation |
| Deal transactions | 3 | 2 | 2 | Deal table, status counters, new/import paths, guest access safety |
| Valuation | 3 | 2 | 1 | FMV columns, new valuation paths, filters, crash safety |
| IRR simulator | 4 | 2 | 2 | Fund/type/date setup, generate behavior, negative no-crash |
| Waterfall simulator | 3 | 2 | 2 | Allocation rules, investor/date setup, export, negative amount |
| Reports | 4 | 2 | 1 | List/packages/history, report columns, empty-state safety |
| Accounting | 4 | 2 | 2 | Trial balance, approval, close books, period/export behavior |
| Investor entities | 4 | 2 | 2 | List/create, master data fields, bulk paths, validation surface |
| Search | 4 | 2 | 1 | Entity/transaction/allocation routes, disabled search guardrail |
| CRM/RBAC | 2 | 2 | 3 | Contacts, explicit unauthorized state, contact-role bug repro |
| Structure chart | 2 | 2 | 1 | Hierarchy, financial labels, as-of date, crash safety |
| File manager | 2 | 1 | 1 | Document area reachability, search, permission/crash safety |
| API contracts | 3 | 1 | 2 | Authenticated/unauthenticated safe failures and server-error guards |

Current harness discovery: 104 Playwright tests across 21 spec files.

## Recommendation

For interview purposes, lead with the three real findings, then show how the test harness turns those findings into repeatable QA assets. That tells a stronger story than presenting automation volume alone.
