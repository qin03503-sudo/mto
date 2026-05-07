# MTO Busduct Pricing Proposal

This project is a web-based proposal and MTO pricing system for busduct offers. It replaces or complements the current Excel workflow by letting users create an offer, choose technical scopes, define project lines, add parts and quantities, and calculate prices automatically from MTO master data and project-specific material prices.

## Product Goal

The system should let sales and estimation users price a project without working directly with Excel formulas. It must calculate part, line, scope, and project totals from controlled master data and produce a structured output similar to the current Pivot Table result.

Core calculation:

```text
Material Total Price = MTO Value * Project Material Unit Price
Part Unit Price = SUM(Material Total Price by Scope and Part)
Line Item Total Price = Part Unit Price * Line Item Quantity
Project Total Price = SUM(all line item totals)
```

## MVP Scope

Included in the first release:

- Offer/project creation with offer number, type, input date, close date, status, and creator.
- Scope selection per offer.
- Line creation under each selected scope.
- Part and quantity entry under each line.
- Master data for materials, scopes, parts, and MTO rows.
- Project-specific material prices copied from default material prices when an offer is created.
- Automatic calculation of unit price and total price.
- Output grouped by scope, line, and part, with line, scope, and project totals.

Out of scope for the first release:

- Full role-based access control.
- Advanced approval workflow.
- ERP/accounting integration.
- Formal offer revisioning.
- Full CU support unless clean data is available.
- Customer-facing PDF templates beyond a simple internal report.

## Core Entities

- `Offer` or `Project`: The quotation record created by a user.
- `Scope`: A technical capacity/material scope such as `1000 AL` or `2500 AL`.
- `Line`: A route or execution segment inside an offer scope.
- `Part`: A busduct component selected inside a line.
- `Material`: Base raw material or component used by MTO rows.
- `MTO Master`: The imported master table that maps each scope and part to material consumption values.
- `Project Material Price`: A per-offer copy of material unit prices used for isolated calculations.

## Business Rules

- Each offer must have at least one scope.
- Each selected scope can have multiple lines.
- Each line can contain multiple parts.
- Project material prices are independent per offer.
- Part unit prices are calculated from MTO rows and cannot be manually entered in the MVP.
- `Value` is the main MTO consumption coefficient for MVP calculations.
- MTO `Quantity` is stored but is not the primary calculation input in the MVP.
- Missing MTO rows for a selected scope and part must produce a clear validation error.
- Missing project material prices must block calculation or produce a clear warning.

## Proposal And Documentation

The full product proposal generated from `readthis.md` is available in `proposal.md`.

Structured documentation is in `docs/`:

- Product requirements: `docs/01_Product_Requirements_PRD/`
- Architecture: `docs/02_Architecture_System_Design/`
- Database design: `docs/03_Database_Design/`
- API contracts: `docs/04_API_Contracts/`
- UI/UX notes: `docs/05_Frontend_UI_UX/`
- Calculation engine: `docs/06_Calculation_Engine/`
- Import and migration: `docs/07_Data_Migration_Import/`
- Testing and QA: `docs/08_Testing_and_QA/`

The detailed Persian PRD source is available in `readthis.md`.

## Development

Create the local SQLite database and seed the starter data:

```bash
DATABASE_URL="file:./dev.db" pnpm db:reset
```

Run the Next.js development server:

```bash
DATABASE_URL="file:./dev.db" pnpm dev
```

Then open `http://localhost:3000`.
