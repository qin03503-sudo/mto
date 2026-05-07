# Schema Overview

Core tables:

| Table | Purpose |
| --- | --- |
| `users` | System users. |
| `roles` | User roles. |
| `units` | Normalized units. |
| `materials` | Material master data. |
| `parts` | Part master data. |
| `scopes` | Scope master data, such as `1000A AL`. |
| `mto_versions` | Imported MTO versions. |
| `mto_rows` | Master MTO calculation rows. |
| `offers` | Project/offer records. |
| `project_material_prices` | Material prices copied per offer. |
| `offer_scopes` | Scopes selected for an offer. |
| `offer_lines` | Lines under an offer scope. |
| `offer_line_parts` | Parts and quantities under a line. |
| `calculation_runs` | Each calculation execution. |
| `calculation_details` | Detailed calculated rows for drill-down. |
| `offer_price_snapshots` | Stored summary results. |

Important modeling rules:

- Use IDs for joins, not names from Excel.
- Preserve original Excel row references for auditability.
- Keep project material prices separate from default material prices.
- Store calculation snapshots to prevent historical offers from changing unexpectedly.
