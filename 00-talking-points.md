# Interview Talking Points - QA Lead @ Quantium

## Opening: Product Knowledge

I explored Quantium CORE as a private equity fund management platform, not just as a generic web app. The highest-risk areas are financial correctness, permission clarity, reporting trust, and regression confidence across fund, investor, accounting, and CRM workflows.

Four concrete findings stood out:

- CRM Entity now shows a clear Unauthorized page, which is good RBAC behavior. CRM Contacts still receives a `403` for the contact-role lookup and logs a raw permission error, which is a smaller but useful example of partial permission handling.
- More critically, the permission handling leaks into the visible user experience during headed authenticated navigation: a restricted CRM contact-role metadata request returns `403`, then the app surfaces "do not have permission" style noise even though the user is completing an otherwise valid workflow. That is a trust issue, not just a console issue.
- The browser console repeatedly warns that the API origin URL has not been set. That suggests a configuration validation gap that could become fragile across hosting, proxy, or CDN environments.
- The OAuth silent-refresh iframe triggers a browser warning because its sandbox combines `allow-scripts` and `allow-same-origin`. That is worth reviewing because authentication surfaces deserve a higher security bar.

The message I would bring to the interview: I can find meaningful product risks quickly, convert them into reproducible tests, and then turn those tests into a practical QA strategy.

## Testing Approach

For Quantium CORE, I would prioritize automation around money movement and decision-support flows:

- Dashboard KPIs and portfolio summaries need smoke coverage because they are executive-facing and trust-sensitive.
- Capital calls, allocations, IRR, waterfall, and reporting need validation coverage because calculation or workflow errors can have business impact.
- CRM and RBAC need negative-path coverage because permission failures should be explicit and understandable.
- API-level tests should complement UI tests where correctness matters more than pixels.

The first test harness is intentionally practical: Playwright for UI and API checks, reusable page objects for login and dashboard behavior, and separate bug reproduction specs so known defects can be shown without blocking the happy-path suite.

## Demo Narrative

I would demo this in three passes:

1. Show the feature audit to prove I learned the product surface.
2. Run or walk through the Playwright tests to show coverage of critical workflows.
3. Open the bug reproduction specs to show how real live findings become regression tests.

The point is not to claim full coverage on day one. The point is to show a QA lead operating model: discover, prioritize, automate, communicate, and improve the release signal.

## QA Lead Positioning

My first 30 days would be audit-first:

- Map critical workflows and release risks.
- Identify defect patterns that are already escaping.
- Separate must-block risks from low-value noise.
- Build automation where it changes confidence, not just where it increases test counts.
- Make QA a release accelerator by giving engineers fast, specific feedback.

For a financial SaaS product, I would treat correctness, permissions, observability, and test data quality as first-class QA concerns.

## Questions To Ask Quantium

1. What are the highest-risk workflows before each release?
2. Which defects have escaped to production most often in the last six months?
3. How are financial calculations and reports currently validated?
4. Is there a staging environment with stable anonymized data?
5. How is RBAC tested across roles and fund structures?
6. What parts of regression are currently manual, automated, or unowned?
7. What release signals would engineering trust enough to move faster?
