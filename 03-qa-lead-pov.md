# QA Lead POV - Quantium CORE

## North Star

QA should help Quantium ship financial workflows with confidence. The strongest QA program here would combine product-risk thinking, focused automation, useful release signals, and clear communication with engineering.

## First Priorities

1. Map the product risk model.
2. Separate critical workflows from nice-to-have coverage.
3. Convert confirmed defects into regression tests.
4. Build reliable smoke coverage around dashboard, transactions, reporting, accounting, and RBAC.
5. Improve the feedback loop so failures explain the business risk, not just the broken selector.

## Quality Risks I Would Watch

- Financial calculation drift across IRR, waterfall, capital calls, and reports.
- Permission failures that look like broken pages.
- Report output that renders successfully but contains incorrect or stale data.
- Multi-fund or multi-entity data leakage.
- Test data instability in staging.
- Console and network warnings that become normalized and hide real regressions.

## Operating Model

I would keep the first automation layer intentionally lean:

- Smoke tests for top user journeys.
- API checks for important contract and failure behavior.
- Known-bug specs that document production issues.
- Manual exploratory charters for areas not yet stable enough to automate.

After that, I would expand coverage based on defect patterns instead of trying to automate everything equally.

## Success Criteria

The QA function is working when:

- Engineers get fast feedback that they trust.
- Product owners can see which release risks are covered.
- Known production bugs become regression tests.
- The team can explain why a release is safe enough, not merely that tests passed.

