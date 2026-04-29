# Example Output — ticket_to_testcases.py

Command used:
```bash
python ticket_to_testcases.py --ticket-id CORE-BUG-001 --format gherkin
```

---

============================================================
CORE-BUG-001 — CRM Entity and Contact Role: Silent 403 with no user feedback
============================================================

Feature: CRM Entity Permission Error Handling
  As a user without CRM entity access
  When I navigate to the CRM entity or contact pages
  I should see a clear, user-friendly error message
  So that I understand why the page is empty and what to do next

  Background:
    Given I am logged in as "interviewguest@quantium.pe"
    And the API returns 403 on GET /api/crmentity/list
    And the API returns 403 on GET /api/crmcontactrole/list

  # ── Happy Path ───────────────────────────────────────────────────

  Scenario: User with CRM access sees entity list
    Given I have CRM entity read permissions
    When I navigate to "/crm/entity"
    Then the page title "CRM Entities" should be visible
    And a list of CRM entities should be displayed
    And no console errors should appear

  Scenario: User with CRM access sees contact list
    Given I have CRM entity and contact role permissions
    When I navigate to "/crm/contact"
    Then the contact list should be visible
    And no 403 errors should appear in the network tab

  # ── Negative Cases ────────────────────────────────────────────────

  Scenario: User without CRM permission sees friendly error on entity page
    Given I do not have CRM entity read permissions
    When I navigate to "/crm/entity"
    And the API responds with 403 Forbidden
    Then I should see the message "You don't have permission to view this. Contact your administrator."
    And I should NOT see a blank white page
    And I should NOT see a raw HTTP error code or stack trace

  Scenario: User without CRM permission sees friendly error on contact page
    Given I do not have CRM contact role permissions
    When I navigate to "/crm/contact"
    And the API responds with 403 on /api/crmcontactrole/list
    Then I should see a permission error message
    And the error message should be in plain language (not "403 Forbidden")

  Scenario: Error message does not expose raw API response
    Given I do not have CRM entity access
    When I navigate to "/crm/entity"
    Then the visible error text should NOT contain "403"
    And the visible error text should NOT contain "Forbidden"
    And the visible error text should NOT contain any API endpoint paths

  # ── Edge Cases ────────────────────────────────────────────────────

  Scenario: User gains permission mid-session and refreshes
    Given I previously saw a 403 error on "/crm/entity"
    When my admin grants me CRM read access
    And I reload the page
    Then the entity list should be displayed
    And the permission error message should no longer be visible

  Scenario: Network timeout vs 403 shows different messages
    Given I do not have CRM entity access
    When the API responds with 403 (not a network timeout)
    Then the error message should indicate a permissions issue
    And NOT a network connectivity problem

  # ── UI Assertions ────────────────────────────────────────────────

  Scenario: Error message is visible above the fold
    Given I do not have CRM entity access
    When I navigate to "/crm/entity"
    Then the error message should be visible without scrolling
    And the error text should have sufficient contrast (WCAG AA)
    And there should be no spinner or loading indicator stuck on screen

  Scenario: Page title is still correct even when access is denied
    Given I do not have CRM entity access
    When I navigate to "/crm/entity"
    Then the browser tab title should still read "Quantium CORE"
    And the navigation sidebar should remain functional

  # ── API Assertions ────────────────────────────────────────────────

  Scenario: API correctly returns 403 with message body
    When I call GET /api/crmentity/list without CRM entity permission
    Then the HTTP response status should be 403
    And the response body should not be empty
    And the response body should contain an error or message field

  Scenario: 403 is not accidentally swallowed as empty array
    Given I do not have CRM entity access
    When the frontend receives the 403 response
    Then the application state should not treat it as "empty list"
    And the entity count should NOT display as "0 entities"
