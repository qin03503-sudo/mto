# Acceptance Criteria

Calculation acceptance tests:

| Test | Expected Result |
| --- | --- |
| MTO grand total | `54,798,877,829.239` |
| `FEEDER-1000` in `1000A AL` | `802,700,038.30` |
| `TOP OFF BOX 250`, qty `2` | `440,640,000` |
| Example Line sheet grand total | `7,766,115,132.90` |

Functional acceptance criteria:

- User can create an offer with name, offer number, input date, and close date.
- Creating an offer copies default material prices into project-specific prices.
- Changing material price in Project A does not affect Project B.
- User can select one or more scopes for an offer.
- User can create multiple lines under each selected scope.
- User can add multiple parts and quantities under each line.
- User cannot select a part that does not belong to the selected scope.
- System calculates part unit price from the selected scope, selected part, MTO Master, and project material prices.
- System calculates line item total price from quantity and calculated unit price.
- System displays totals for each line, each scope, and the whole offer/project.
- Calculation output is grouped by scope, line, and part.
- Recalculation stores a new calculation run.
- Previous calculation result can be audited after recalculation.
- Missing MTO records for a selected scope and part produce a clear user-facing error.
