# Calculation API

Base path: `/api/v1`

Endpoints:

- `POST /offers/{offer_id}/calculate`
- `GET /offers/{offer_id}/calculation-results`

Calculation behavior:

1. Read offer scopes, lines, and line parts.
2. Read project material prices.
3. Calculate MTO row totals by `calculation_method`.
4. Sum MTO row totals by scope and part.
5. Multiply part unit price by line part quantity.
6. Store calculation run, details, and summary snapshots.
7. Return output grouped by scope, line, and part.
