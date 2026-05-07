# MTO Busduct Pricing System Proposal

## 1. Product Summary

This proposal defines a web application for managing busduct MTO pricing offers. The system replaces or complements the current Excel workbook by moving project setup, scope selection, line definition, part entry, material pricing, calculation, and reporting into a structured database-backed workflow.

The main goal is to let a sales or estimation user create a new offer without touching Excel formulas. The user defines the offer, selects technical scopes, creates lines, enters parts and quantities, and the system automatically calculates part, line, scope, and project totals from MTO master data and project-specific material prices.

## 2. Product Goals

- Convert the current Excel MTO workflow into a structured and maintainable software system.
- Create and manage projects or pricing offers.
- Maintain master data for materials, scopes, parts, and MTO rows.
- Calculate part unit prices automatically from scope, part, MTO value, and material unit price.
- Keep material prices independent per project/offer.
- Produce a final pricing output similar to the current Excel Pivot Table.
- Prepare the system for future access control, CU support, advanced reporting, and price/version management.

## 3. Target Users

- Sales or estimation user: Creates offers, selects scopes, defines lines, adds parts, and receives pricing output.
- Manager or senior user: Reviews projects, manages base prices, and may control user access in future phases.
- Technical or engineering user: Maintains MTO structure, parts, materials, and consumption values.

## 4. MVP Scope

Included in version 1:

- Project/offer creation.
- Project scope selection.
- Line creation under each scope.
- Part and quantity entry under each line.
- Connection between selected parts and MTO master rows.
- Unit price and total price calculation.
- Project-specific material price management.
- Aggregated output by scope, line, and part.

Excluded from version 1:

- Full role-based access control.
- Advanced multi-role workflows.
- Offer approval workflow.
- Automatic customer delivery.
- ERP or accounting integration.
- Formal offer revisioning.
- Complete CU/copper support unless source data is ready.
- Formal customer-facing PDF template, except for a simple internal report.

## 5. Core Concepts

### Project / Offer

Each offer is an independent project quotation.

Recommended fields:

| Field | Description |
| --- | --- |
| Project ID | Unique identifier. |
| Offer Name / Project Name | Offer or project name. |
| Offer Number | Letter or proposal number. |
| Type | Offer/project type. |
| Input Date | Inquiry received date. |
| Close Date | Proposal deadline. |
| Created By | Creator user. |
| Created At | Creation date. |
| Status | Draft, In Progress, Closed, or similar. |

### Scope

Scope represents the technical model or capacity, such as `1000 AL`, `2500 AL`, `800 AL`, or `6000 AL`.

Recommended fields:

| Field | Description |
| --- | --- |
| Scope ID | Unique identifier. |
| Scope Name | Scope name, for example `1000 AL`. |
| Ampere | Ampere value. |
| Material Type | `AL` or `CU`. |
| Is Active | Active/inactive flag. |

### Part

Part is the component selected inside a line. In the Excel source this maps to the `Name` field.

Recommended fields:

| Field | Description |
| --- | --- |
| Part ID | Unique identifier. |
| Part Name | Component name. |
| Description | Optional description. |
| Is Active | Active/inactive flag. |

### Material

Material is the master list of raw materials or components, including default price, unit, and dimension.

Recommended fields:

| Field | Description |
| --- | --- |
| Material ID | Unique identifier. |
| Material Name | Material name. |
| Default Unit Price | Default material unit price. |
| Unit | Unit such as kg, meter, or each. |
| Dimension | Material dimension. |
| Is Active | Active/inactive flag. |

### MTO Master

MTO Master is the imported master calculation table from the current `All Update MTO` sheet. It defines which materials are used by each part in each scope and the consumption value for each material.

Important fields:

| Field | Description |
| --- | --- |
| Scope Name | Related scope, for example `1000 AL`. |
| Name | Related part/component. |
| Material | Consumed material. |
| Quantity | Stored for reference, but not the primary MVP calculation input. |
| Value | Main consumption coefficient for MVP calculations. |
| Unit | Unit. |
| Unit Price | Material unit price. |
| Total Price | `Value * Unit Price`. |

### Project Material Price

Each project must have its own copy of material prices. When a project is created, the system copies base material prices into project-specific prices so later changes in one project do not affect other projects or master prices.

Recommended fields:

| Field | Description |
| --- | --- |
| Project Material Price ID | Unique identifier. |
| Project ID | Related project. |
| Material ID | Related material. |
| Unit Price | Project-specific unit price. |
| Unit | Unit. |
| Dimension | Dimension. |
| Created At | Creation date. |

### Line

A line is a route or execution segment inside a project scope. Each scope can contain multiple lines.

Recommended fields:

| Field | Description |
| --- | --- |
| Line ID | Unique identifier. |
| Project ID | Related project. |
| Scope ID | Related scope. |
| Line Name | Name such as `Line 1`. |
| Description | Optional description. |

### Line Item

A line item defines which part is used in a line and in what quantity.

Recommended fields:

| Field | Description |
| --- | --- |
| Line Item ID | Unique identifier. |
| Line ID | Related line. |
| Part ID | Related part. |
| Quantity | Part quantity in this line. |
| Unit Price | Calculated part unit price. |
| Total Price | `Quantity * Unit Price`. |

## 6. Calculation Logic

### Part Unit Price

To calculate the unit price of a part in a scope, the system finds all MTO Master rows where:

- Scope matches the selected scope.
- Name/Part matches the selected part.

For each matching row:

```text
Material Total Price = Value * Project Material Unit Price
```

Then:

```text
Part Unit Price = SUM(Material Total Price for selected Scope and Part)
```

This is equivalent to the current Excel `SUMIF`/`SUMIFS` behavior.

### Line Item Total

```text
Line Item Total Price = Part Unit Price * Quantity
```

### Line Total

```text
Line Total Price = SUM(Line Item Total Price)
```

### Scope Total

```text
Scope Total Price = SUM(Line Total Price for all Lines under Scope)
```

### Project Total

```text
Project Total Price = SUM(Scope Total Price)
```

## 7. User Workflow

1. User opens the project/offer list.
2. User creates a new offer and enters name, offer number, type, input date, and close date.
3. System creates the project and copies default material prices into project-specific material prices.
4. User selects one or more scopes for the project.
5. User creates one or more lines under each selected scope.
6. User adds parts and quantities to each line.
7. System calculates part unit prices from MTO Master and project material prices.
8. System calculates line item, line, scope, and project totals.
9. User reviews a Pivot-like output grouped by scope, line, and part.

## 8. Functional Requirements

| ID | Requirement |
| --- | --- |
| FR-001 | Show a project/offer list with name, offer number, input date, close date, status, creator, and total amount when available. |
| FR-002 | Create a new project/offer from a `New Offer` or `New Project` action. |
| FR-003 | Copy default material prices into project-specific prices when a project is created. |
| FR-004 | Manage base materials with name, default price, unit, dimension, and active status. |
| FR-005 | Allow project material prices to be changed without affecting base prices or other projects. |
| FR-006 | Manage scope master data and import initial scopes from Excel. |
| FR-007 | Manage part master data and make parts selectable in line items. |
| FR-008 | Store MTO Master rows with scope, part, material, value, quantity, and unit. |
| FR-009 | Allow one or more scopes to be selected for each project. |
| FR-010 | Allow multiple lines under each selected scope. |
| FR-011 | Allow parts and quantities to be entered for each line. |
| FR-012 | Calculate part unit price from selected scope, selected part, MTO Master, and project material prices. |
| FR-013 | Calculate line item total as `Quantity * Unit Price`. |
| FR-014 | Display aggregated output by project, scope, line, part, quantity, unit price, and total price. |
| FR-015 | Display totals for each line, each scope, and the whole project/offer. |

## 9. Non-Functional Requirements

- Calculation accuracy: Final prices must be traceable back to MTO rows and project material prices.
- Maintainability: Master data must live in the database, not hard-coded application logic.
- Extensibility: The design should support future CU/copper scopes, access control, offer revisions, PDF output, advanced pricing formulas, and management approval.
- Usability: Sales and estimation users should not need to understand or edit formulas.

## 10. Proposed Data Model

Core tables:

| Table | Purpose |
| --- | --- |
| `projects` / `offers` | Project or offer records. |
| `scopes` | Scope master data. |
| `parts` | Part master data. |
| `materials` | Material master data. |
| `mto_master` / `mto_rows` | Master MTO rows. |
| `project_material_prices` | Per-project material prices. |
| `project_scopes` / `offer_scopes` | Scopes selected for a project. |
| `lines` / `offer_lines` | Lines under project scopes. |
| `line_items` / `offer_line_parts` | Parts and quantities under lines. |

Recommended `projects` fields:

| Field | Type |
| --- | --- |
| `id` | UUID / Integer |
| `name` | String |
| `offer_number` | String |
| `type` | String |
| `input_date` | Date |
| `close_date` | Date |
| `status` | String |
| `created_by` | User ID |
| `created_at` | DateTime |
| `updated_at` | DateTime |

Recommended calculation fields for `line_items`:

| Field | Type |
| --- | --- |
| `id` | UUID / Integer |
| `line_id` | FK |
| `part_id` | FK |
| `quantity` | Decimal |
| `calculated_unit_price` | Decimal |
| `calculated_total_price` | Decimal |

## 11. Proposed Pages

- Project/offer list: Search, filtering by status/date/user, new offer action, and visible project total.
- Create/edit project: Name, offer number, type, input date, and close date.
- Project details: Project info, material prices, scopes, lines, line parts, and output.
- Project material prices: Copied material prices with editable project-level unit price.
- Master data management: Materials, scopes, parts, and MTO Master, likely restricted to admin/technical users later.
- Pricing output: Tree or table grouped by project, scope, line, and part with all totals.

## 12. Business Rules

- Every project must have at least one scope.
- Every project scope can have multiple lines.
- Every line can have multiple parts.
- Project material prices are independent from other projects.
- On project creation, base material prices must be copied into project material prices.
- Part unit price must be calculated from MTO and project material prices, not manually entered by the user in the MVP.
- MTO `Quantity` is stored but is not the primary MVP calculation input.
- MTO `Value` is the main consumption coefficient in the MVP.
- Missing MTO data for a selected scope and part must show a clear error or warning.
- Missing project material prices must block calculation or show a clear warning.

## 13. Sample Scenario

Input:

- Project name: `Project A`.
- Offer number: `OF-001`.
- Input date: `2026-05-07`.
- Close date: `2026-05-15`.
- Selected scope: `1000 AL`.
- Lines: `Line 1`, `Line 2`.

Line 1 parts:

| Part | Quantity |
| --- | ---: |
| Feeder 1000 | 2 |
| Horizontal elbow | 1 |

The system finds all MTO rows for `Feeder 1000` in `1000 AL`, multiplies each row's `Value` by the project-specific material unit price, sums those values as the part unit price, and then multiplies by quantity.

Expected output includes:

| Scope | Line | Part | Quantity | Unit Price | Total Price |
| --- | --- | --- | ---: | ---: | ---: |
| 1000 AL | Line 1 | Feeder 1000 | 2 | Calculated | Calculated |
| 1000 AL | Line 1 | Horizontal elbow | 1 | Calculated | Calculated |
| 1000 AL | Line 2 | Straight length | 4 | Calculated | Calculated |

Summary totals:

| Level | Amount |
| --- | ---: |
| Line Total | Sum of line |
| Scope Total | Sum of scope |
| Project Total | Grand total |

## 14. Open Decisions

- Should MTO `Quantity` be used in future formulas or only stored for display/reference?
- Should users ever be allowed to override calculated part unit prices?
- Does each project need multiple formal price revisions?
- Is a customer-facing output required in MVP, or is an internal output enough?
- Is CU/copper support required in version 1?
- Are scopes selected only from a fixed list, or can users create new scopes?
- Are parts selected only from master data, or can users create project-level parts?
- Is role enforcement required in version 1, or is `created_by` enough?
- Is direct Excel import required in the MVP workflow?
- Should output export to Excel be included in MVP?

## 15. Acceptance Criteria

- User can create a project with name, offer number, input date, and close date.
- Creating a project automatically creates project-specific material prices from base materials.
- User can select one or more scopes for a project.
- User can create multiple lines under each selected scope.
- User can add multiple parts and quantities under each line.
- System calculates part unit price from scope, part, MTO Master, and project material prices.
- System calculates total price for each line item based on quantity.
- System displays totals for each line, each scope, and the whole project.
- Missing MTO records for a selected scope and part show a clear user-facing error.
- Changing material price in one project does not affect other projects or base material prices.

## 16. Implementation Phases

1. Database and master data: Materials, scopes, parts, MTO Master, and initial Excel import.
2. Project and material prices: Project creation, material price copy, and project-level price editing.
3. Scope, line, and part entry: Add scopes to projects, create lines, and add parts with quantities.
4. Calculation engine: Unit price calculation, total price calculation, and line/scope/project totals.
5. Output report: Pivot-like output table, summaries, and preparation for future Excel/PDF export.
