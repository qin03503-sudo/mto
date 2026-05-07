# Core Logic

The calculation engine replaces Excel `SUMIFS` and line formulas.

Main formulas:

```text
MTO Row Total = calculated by mto_rows.calculation_method
Part Unit Price = SUM(MTO Row Total WHERE scope_id = selected_scope_id AND part_id = selected_part_id)
Line Part Total = qty * Part Unit Price
Line Total = SUM(Line Part Total)
Scope Total = SUM(Line Total)
Offer Total = SUM(Scope Total)
```

Important behavior:

- Use project material prices, not global default prices, when calculating an offer.
- Store details for each calculation run.
- Preserve snapshots so previous offer results remain auditable.
