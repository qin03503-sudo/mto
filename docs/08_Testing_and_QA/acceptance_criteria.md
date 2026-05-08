# Acceptance Criteria

Calculation acceptance tests:

| Test | Expected Result |
| --- | --- |
| MTO grand total | `54,798,877,829.239` |
| `FEEDER-1000` in `1000A AL` | `802,700,038.30` |
| `TOP OFF BOX 250`, qty `2` | `440,640,000` |
| Example Line sheet grand total | `7,766,115,132.90` |

Functional acceptance criteria (based on PRD Section 16):

- **AC-001:** User can create a new project with name, offer number, input date, and close date.
- **AC-002:** After creating a project, the system automatically creates project-specific material prices copied from the base material table.
- **AC-003:** User can select one or more scopes for an offer/project.
- **AC-004:** User can create multiple lines under each scope.
- **AC-005:** User can add multiple parts and quantities to each line.
- **AC-006:** System can calculate the unit price for each part based on the scope and MTO Master.
- **AC-007:** System can calculate the total price of each part based on quantity.
- **AC-008:** System can display the total price for each line, each scope, and the whole project.
- **AC-009:** If a combination of Scope and Part does not exist in MTO, the system displays an understandable error message.
- **AC-010:** Changing a material price in one project must not affect other projects or the base material price.
