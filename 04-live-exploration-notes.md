# Live Exploration Notes - Quantium CORE

Explored: 2026-04-29  
Base URL: `https://www.quantiumcore.com/`  
Account type: guest interview login

## Confirmed Navigation

| Route | Live Signal |
| --- | --- |
| `/qfdashboard` | Dashboard for `USD Fund I`; KPI values include Total invested, Available for Drawdown, Fund Gross IRR, Net IRR, and TVPI. |
| `/investor` | Investor list with filter and add actions; columns include Name, Investor group, Type, Investing entity, Total Commitment, and Paid-in capital. |
| `/capital` | Capital call - distribution list with Filter, Folder View, New, Single transaction, Excel import, Delete, and New commitment actions. |
| `/investment` | Deal transaction list with status counters and new/import actions. |
| `/valuation` | Valuation list with valuation date, deal, entity, instrument, remaining cost, previous valuation, and new FMV. |
| `/irr` | IRR simulator with fund vehicle, IRR type, IRR as-of date, and Generate. |
| `/waterfall` | Waterfall distribution simulator with entity, allocation rule, investors, amount, date, Calculate, and Export. |
| `/all-reports/list` | Reports page with List, Packages, and History tabs plus report table headings. |
| `/trial-balance` | Trial balance with entity, accounting level, period, Generate, and Export. |
| `/approval-accounting` | Approval and Close books tabs with journal filter and add actions. |
| `/crm/entity` | Explicit Unauthorized page with administrator guidance. |
| `/crm/contact` | Contacts list renders, but `crmcontactrole/list` returns `403` and logs a console error. |
| `/search` | Redirects to `/search/entity`; exposes Entity, Transaction, and Investor allocation search. |
| `/entitieschart` | Structure chart renders fund hierarchy and as-of date input. |

## Console And Network Findings

- The browser warning `The API origin URL has not been set.` appears across authenticated pages.
- The iframe sandbox warning appears across authenticated pages.
- `/api/crmentity/list` returns `403` on `/crm/entity`, but the page now displays a proper Unauthorized state.
- `/api/crmcontactrole/list` returns `403` on `/crm/contact` and logs a raw permission error.

## Test Harness Implications

- Keep `/crm/entity` as an RBAC smoke case if needed, but do not describe it as a silent blank-page bug in the current live environment.
- Keep the CRM contact-role issue as the active bug reproduction.
- Adjust reports coverage toward tabs/table headings rather than assuming action buttons are visible on the List tab.
- Treat `/search` as redirecting to `/search/entity`.
- Treat empty Search as guarded: the Search button is disabled until criteria are selected.
