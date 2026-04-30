# Quantium CORE — QA Lead Interview Showcase


## Product Overview

**Quantium CORE** is a private equity fund management SaaS platform. It manages the full PE lifecycle: fundraising → capital calls → deal transactions → valuation → reporting → investor relations.

**Why QA matters here:** Incorrect financial data (IRR, waterfall, capital calls) or broken permissions has real fiduciary consequences. This is not a typical CRUD app — correctness, trust, and permission clarity are first-class concerns.

**Tech stack:**
- Frontend: Angular SPA
- Backend: ASP.NET Core API (`https://quantiumfundwebapi.azurewebsites.net`)
- Auth: IdentityServer4 / OAuth2 silent refresh iframe
- Hosting: Azure (`accounts-quantium.azurewebsites.net` for login)

---

## Page Routes (Confirmed Live — 38 routes)

> Explored live as `interviewguest@quantium.pe` on 2026-04-30. All routes verified via browser automation.

**Product family** (visible in top bar): CORE · EDGE · SmartPage · PORTAL — Quantium is a multi-product suite.

### Dashboard

| Route | Label | What It Does |
|---|---|---|
| `/allmasterfunds` | All master funds | Aggregated KPI view across all funds — currency selector, period picker, fund summary table |
| `/qfdashboard` | Single fund | Per-fund KPIs: Total Invested, Available for Drawdown, Fund Gross IRR, Net IRR, TVPI; J Curve; portfolio summary table with 19 assets |
| `/dashboard/61e130c5ce6deda422ff561c` | CFO Dashboard | Custom analytics dashboard |
| `/dashboard/62c5406c2103caf15a54bd8d` | Single asset metrics dashboard | Custom analytics dashboard |
| `/dashboard/669dda3cd226052a1ba8f616` | VP Test | Custom analytics dashboard |
| `/dashboard/66d4b0d4c106e51ca349e25c` | MB TEST | Custom analytics dashboard |

### Entities

| Route | Label | What It Does |
|---|---|---|
| `/entitieschart` | Structure | Fund hierarchy chart + as-of date input |
| `/fundvehicle` | Fund vehicle | Fund vehicle list — Add button, table |
| `/investor` | Investor | Investor list — Name, Group, Type, Investing Entity, Total Commitment, Paid-in Capital |
| `/asset` | Asset | Asset list — Name, Legal name, Investing entities, Current investment cost, Ownership %, Latest valuation date |

### Transactions

| Route | Label | What It Does |
|---|---|---|
| `/commitment` | Commitment | Commitment list — Date, Type, Fund vehicle; New / Transfer of commitment / Excel import |
| `/capital` | Capital call - distribution | Capital call list — Filter, Folder View, New, Single transaction, Excel import, Delete |
| `/fund-operation` | Fund operation | Fund-level operations — Transaction date, Type, Subtype, Entity |
| `/investment` | Deal | Deal transaction list — status counters, new/import |
| `/fund-investment` | Fund investment | Fund-in-fund investments — Date, Investee fund, Fund vehicle, Type, Serial No., Commitment amount |
| `/spv-transfer` | SPV transfer | SPV transfers — Transaction date, Entity, Type, Reference, Amount, Status |

### Valuation

| Route | Label | What It Does |
|---|---|---|
| `/valuation` | Valuation | FMV list — valuation date, deal, entity, instrument, remaining cost, previous FMV |

### Toolkits

| Route | Label | What It Does |
|---|---|---|
| `/management-fee` | Management fee calculator | Fee calculation tool |
| `/irr` | IRR simulator | Fund vehicle + IRR type + as-of date → Generate; **BUG-005: ambiguous dropdown labels** |
| `/waterfall` | Waterfall simulator | Entity + allocation rule + investors + amount + date → Calculate + Export |
| `/search` → `/search/entity` | Advanced search | Entity / Transaction / Investor Allocation; search button disabled until criteria selected |

### Reports

| Route | Label | What It Does |
|---|---|---|
| `/all-reports/list` | Reports | List / Packages / History tabs |

### Accounting

| Route | Label | What It Does |
|---|---|---|
| `/chart-of-account` | Chart of account | Account code, Account Name, Category, Type, Subtype, YTD Balance |
| `/banking` | Banking | Bank account list — Account, Account code, Account number, Latest balance |
| `/journal` | Journal | Journal list — Journal date, Serial number, Transaction, Reference, Account code, Account name |
| `/trial-balance` | Trial balance | Entity + accounting level + period → Generate + Export (Excel/Word/PDF) |
| `/approval-accounting` | Approval | Approval + Close Books tabs, journal filter |

### CRM

| Route | Label | What It Does |
|---|---|---|
| `/crm/contact` | Contacts | Contact list — view/filter by title and entity; **BUG-001/004: 403 on crmcontactrole/list** |
| `/crm/entity` | Entities | → **Unauthorized** page for guest (correct RBAC behavior) |
| `/crm/contact-role` | Contact roles | Contact role management |
| `/crm/approval` | Approval | → **Unauthorized** page for guest (correct RBAC behavior) |

### File Manager / Documents

| Route | Label | What It Does |
|---|---|---|
| `/documents/fund-vehicle` | Fund vehicle documents | Documents scoped to fund vehicles |
| `/documents/investor` | Investor documents | Documents scoped to investors |
| `/documents/asset` | Asset documents | Documents scoped to assets |
| `/documents/spv` | SPV documents | Documents scoped to SPV entities |
| `/documents/other` | Other documents | Miscellaneous documents |

---

## Bugs Found (Live Exploration 2026-04-29)

### BUG-001 [Medium] — CRM Contact-Role 403 Leaks as Console Error

**Route:** `/crm/contact`  
**What happens:** `GET /api/crmcontactrole/list` → `403`. Page renders contacts but logs `User do not have permission to access the CRM contact role list.` in the console.  
**Why it matters:** Console noise hides real problems during QA and support. Partial failures confuse users if a filter silently has no data.  
**Fix:** Lazy-load contact-role data only when the filter is opened. Handle `403` locally — disable the filter, don't fire a global toast.  
**Regression test:** `tests/e2e/bugs/bug-001-crm-403-silent.spec.ts`

---

### BUG-002 [Medium] — API Origin URL Warning Appears Globally

**What happens:** Console warning `The API origin URL has not been set.` appears on every authenticated page.  
**Why it matters:** Relative-URL fallback may break under different hosting, proxy, or CDN setups. Persistent warnings reduce signal quality.  
**Fix:** Validate API origin during app bootstrap. Make missing config a deployment-blocking error in staging/prod.  
**Regression test:** `tests/e2e/bugs/bug-002-api-origin-warning.spec.ts`

---

### BUG-003 [Medium/Security] — OAuth Silent-Refresh iframe Sandbox Warning

**What happens:** Browser warns that iframe sandbox combines `allow-scripts` + `allow-same-origin` — a combination browsers flag as escape-prone.  
**Why it matters:** Authentication surfaces have elevated security risk. Even without an active exploit, the warning should not become normalized noise.  
**Fix:** Review OAuth silent-refresh sandbox attributes. Remove unnecessary permissions.  
**Regression test:** `tests/e2e/bugs/bug-003-iframe-sandbox.spec.ts`

---

### BUG-004 [Critical] — Permission Warning Flashes During Authenticated Navigation

**Route:** Any page → backend call to `/api/crmcontactrole/list`  
**What happens:** During normal login as `interviewguest@quantium.pe`, the app eagerly requests CRM contact-role metadata. Backend returns `403`. Global HTTP error handler fires a "do not have permission" toast — visible to users during normal workflows.  
**Why it matters:** Users see "no permission" during valid workflows (high trust damage). Every headed test run looks noisy. Support tickets may be filed on working features.  
**Root cause:** Global shell/bootstrap eagerly requests CRM role metadata for all users. Guest role is not authorized. Global error handler treats expected `403` as a user-facing event.  
**Fix:** Lazy-load `/api/crmcontactrole/list` only on CRM screens. Route-level `403` handling for optional capabilities — no global toast.  
**Regression test:** `tests/e2e/bugs/bug-004-permission-flash-on-login.spec.ts`

---

### BUG-005 [Low] — Ambiguous IRR Type Dropdown Labels

**Route:** `/irr`  
**What happens:** "IRR type" dropdown has duplicate-looking labels. "Whole fund" and "Investor specific" represent different cash flow logic but are indistinguishable to users and automation locators.  
**Why it matters:** UX confusion — users must guess. Automation cannot reliably select a specific option.  
**Fix:** Add descriptive labels (e.g., "Whole fund (Fund CF)") and `data-testid` attributes.  
**Regression test:** `tests/e2e/bugs/bug-005-irr-duplicate-options.spec.ts`

---

### BUG-006 [Medium] — High Regression Fragility from Index-Based Locators

**What happens:** Most interactive elements lack `id`, `name`, or `data-testid`. Tests use `.nth(0)`, `.first()`, positional CSS — breaks when DOM order changes.  
**Why it matters:** Tests fail on UI reorders unrelated to functionality ("crying wolf"). High maintenance cost. Slows engineering velocity.  
**Fix:** Mandate `data-testid` on all new features. Incremental refactor on golden paths. QA–Dev "Design for Testability" contract.

---

## Test Coverage

**~160 Playwright tests across 27 spec files — all 38 confirmed routes covered.**

| Module | Spec File | Focus |
|---|---|---|
| Authentication | `auth.spec.ts` | Login, empty submit, invalid credentials, password masking |
| Dashboard — Single fund | `dashboard.spec.ts` | Deep component coverage: KPIs (monetary/percentage regex), lazy-loaded charts, table validations, no strict-mode warnings |
| Dashboard — All master funds + custom | `dashboard-all.spec.ts` | Deep coverage for `/allmasterfunds` and custom dashboards (CFO/VP/MB), dropdown toggles, zoom controls, export buttons |
| Capital Calls | `capital-call.spec.ts` | List, filters, folder view, new transaction paths |
| Commitment | `transactions-commitment.spec.ts` | List, columns, New/Transfer dropdown, filter |
| Fund Operation / Fund Investment / SPV Transfer | `transactions-other.spec.ts` | List, column headers, filter, negative no-crash |
| Deal Transactions | `deal-transactions.spec.ts` | Table, status counters, new/import paths |
| Valuation | `valuation.spec.ts` | FMV columns, new valuation path, filters |
| IRR Simulator | `toolkits-irr.spec.ts` | Fund/type/date setup, generate behavior |
| Waterfall Simulator | `toolkits-waterfall.spec.ts` | Allocation rules, investor/date setup, export |
| Management Fee Calculator | `toolkits-management-fee.spec.ts` | Page load, fund dropdown, calculate, export |
| Reports | `reports.spec.ts` | List/Packages/History, report columns |
| Accounting (Trial balance, Approval, Banking, Journal, Chart of Accounts) | `accounting.spec.ts` | Generate, export formats, period controls, column headers, no-crash |
| Investor Entities | `entities-investor.spec.ts` | List, columns, create form, bulk path |
| Asset + Fund Vehicle | `entities-investor.spec.ts` | Asset list, asset detail links, fund vehicle list |
| Structure Chart | `structure.spec.ts` | Hierarchy, financial labels, as-of date |
| Search | `search.spec.ts` | Entity/transaction/allocation routes, disabled guardrail |
| CRM Contacts + RBAC | `crm-rbac.spec.ts` | Contacts, Unauthorized (entity + approval), Contact roles |
| File Manager — all 5 sub-routes | `file-manager.spec.ts` | fund-vehicle, investor, asset, spv, other document sections |
| API Contracts | `tests/api/` | Auth/unauth safe-failure, server-error guards |
| Bug Reproduction | `tests/e2e/bugs/` | BUG-001 through BUG-005 as regression anchors |

### Test naming convention

- `HAPPY` — expected workflow or page capability
- `EDGE` — alternate mode, boundary state, optional control
- `NEGATIVE` — validation, permission, or no-crash behavior
- `API` — API contract or safe-failure coverage
- `BUG` — known production behavior, becomes regression test after fix

---

## Architecture: Page Object Model

All DOM interactions are extracted into 12 page classes in `tests/pages/`:

```
tests/
├── pages/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── CapitalCallPage.ts
│   ├── ValuationPage.ts
│   ├── ToolkitsPage.ts         ← IRR + Waterfall
│   ├── AccountingPage.ts
│   ├── InvestorPage.ts
│   ├── CrmPage.ts
│   └── ...
├── e2e/
│   ├── dashboard.spec.ts
│   ├── capital-call.spec.ts
│   ├── ...
│   └── bugs/                   ← known bug regression specs
│       ├── bug-001-crm-403-silent.spec.ts
│       ├── bug-002-api-origin-warning.spec.ts
│       ├── bug-003-iframe-sandbox.spec.ts
│       ├── bug-004-permission-flash-on-login.spec.ts
│       └── bug-005-irr-duplicate-options.spec.ts
├── api/
│   └── auth.spec.ts
└── support/
    └── api.ts                  ← authenticated API request helper
```

**Why POM mattered:** Initial raw-locator approach caused 142 strict-mode failures because broad text selectors (e.g., `text="Fund vehicle"`) matched multiple DOM elements simultaneously. POM with scoped locators resolved all violations.

**Auth pattern:** `global-setup.ts` logs in once and saves state to `tests/.auth/user.json`. All tests reuse `storageState` — no per-test login, no session collision.

**Workers: 1** — Quantium auth allows one active session. Multiple workers would kick each other out.

---

## CI/CD Pipeline

Live: [github.com/itthikorn-sut/quantium-demo/actions](https://github.com/itthikorn-sut/quantium-demo/actions)

```
PR opened
    │
    ├─── E2E Tests ──────────────────────── Playwright, 1 worker, no retries
    │        │
    │        └─── Publish Report ──────── GitHub Pages (auto-deploys HTML report)
    │
    ├─── API Tests ──────────────────────── Playwright request fixture, blocks merge on fail
    │
    ├─── Bug Repro Tests ────────────────── continue-on-error: true (failures expected)
    │
    └─── AI QA Review ───────────────────── OpenAI gpt-4o posts severity table as PR comment

Manual trigger only:
    └─── k6 Load Tests ──────────────────── staging only, production guard enforced
```

**Secrets required:**
| Secret | Used By |
|---|---|
| `QA_TEST_EMAIL` | E2E, API, bug-repro jobs |
| `QA_TEST_PASSWORD` | E2E, API, bug-repro jobs |
| `OPENAI_API_KEY` | AI QA Review job |
| `QA_LOAD_TEST_EMAIL` | k6 job |
| `QA_LOAD_TEST_PASSWORD` | k6 job |

**Playwright report:** Auto-deployed to [itthikorn-sut.github.io/quantium-demo](https://itthikorn-sut.github.io/quantium-demo/) after every CI run — no artifact download needed.

---

## AI Tools (`ai-tools/`)

### `ticket_to_testcases.py` — Ticket → Gherkin/Steps/Playwright

Converts Jira-style tickets into test cases using OpenAI gpt-4o.

```bash
# Single ticket to Gherkin
python ai-tools/ticket_to_testcases.py --ticket-id CORE-BUG-001 --format gherkin

# All tickets to Playwright
python ai-tools/ticket_to_testcases.py --all --format playwright --save
```

Tickets in `ai-tools/mock_tickets.json` — 3 real bugs + 5 feature tickets (capital call, IRR, waterfall, trial balance, investor create).

Pre-generated example output: `ai-tools/example_output.md` (12 Gherkin scenarios for BUG-001).

### `mr_review_bot.py` — PR Diff → Severity Table Comment

Analyzes git diff via OpenAI gpt-4o. Posts structured severity table as PR comment.

```
| File | Line | Severity | Issue | Suggestion |
```

- CRITICAL findings → `sys.exit(1)` → blocks merge in CI
- Run automatically on every PR by the `ai-pr-review` job
- Dry-run locally: `python ai-tools/mr_review_bot.py` (reads env vars)

Demo diff: `ai-tools/mock_diff.patch` — two hunks with seeded code smells.

---

## k6 Load Tests (`k6/`)

Manual trigger only — never runs automatically on PRs.

**Endpoints tested:**
- `GET /qfdashboard` — P95 < 2s
- `GET /all-reports/list` — P95 < 10s

**Load profile:** 0 → 100 VUs over 5 minutes, hold 5 minutes, ramp down.

**Production guard:** CI validates target URL contains `staging` before running. Anything matching `quantiumcore.com` without `staging` → hard fail.

**How to trigger:**
1. GitHub Actions → Run workflow → `workflow_dispatch`
2. Set `run_k6: true`, `k6_target_url: https://staging.quantiumcore.com`

See `k6/README.md` for full threshold config.

---

## Local Setup

```bash
# Install
npm ci

# Set credentials (PowerShell)
$env:TEST_EMAIL='interviewguest@quantium.pe'
$env:TEST_PASSWORD='<password>'
$env:BASE_URL='https://www.quantiumcore.com'

# Run E2E suite
npm run test:e2e

# Run API tests
npm run test:api

# Run bug reproduction specs only
npx playwright test tests/e2e/bugs

# Open HTML report
npm run report
```

---

## QA Lead POV

### First 30 Days

1. **Map risk** — identify critical workflows before each release, find which defects escape most often
2. **Separate signal from noise** — which failures block releases vs. which are known/acceptable
3. **Convert live bugs into regression anchors** — BUG-001 through BUG-006 are already test cases
4. **Build reliable smoke coverage** — dashboard, transactions, reporting, accounting, RBAC
5. **Improve feedback quality** — failures should explain business risk, not just broken selectors

### Quality Risks I Would Watch at Quantium

| Risk | Why |
|---|---|
| Financial calculation drift | IRR, waterfall, capital calls — errors have fiduciary impact |
| Permission failures that look like broken pages | BUG-004 is a live example |
| Report output that renders but contains stale data | Silent correctness failure |
| Multi-fund data leakage | Cross-tenant safety in fund context switching |
| Test data instability in staging | Flaky tests from data state, not code |
| Console warnings normalized as noise | Hides real regressions (BUG-002, BUG-003) |

### Success Criteria

QA is working when:
- Engineers get fast feedback they **trust**
- Product owners can see which release risks are **covered**
- Known production bugs become **regression tests**
- The team can explain **why a release is safe** — not just that tests passed
