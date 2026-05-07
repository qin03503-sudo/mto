# Project Overview

The MTO Pricing Web App converts the current Excel-based busduct pricing workflow into a structured, database-backed proposal system.

The system must let users create offers/projects, select technical scopes, define lines under each scope, add parts with quantities, and calculate prices automatically from MTO master data and project-specific material prices.

Core calculation objective:

```text
Scope + Part + Material + Value + Unit Price = MTO Row Total
Part Unit Price = SUM(MTO Row Total by Scope and Part)
Line Part Total = Qty * Part Unit Price
Offer Total = SUM(all line part totals)
```

Primary users:

- Product manager
- Estimator
- Sales user
- Manager
- Technical/engineering user
- Backend developer
- Frontend developer
- QA engineer

MVP focus:

- Offer creation
- Scope selection
- Line and part entry
- Project-specific material prices
- Calculation engine matching Excel outputs
- Structured output report by scope, line, and part

MVP exclusions:

- Full user access control and advanced role workflows
- Approval workflow for offers
- ERP or accounting integration
- Formal offer revisioning
- Complete CU support unless the source data is ready
- Formal customer-facing PDF template, except for a simple internal report
