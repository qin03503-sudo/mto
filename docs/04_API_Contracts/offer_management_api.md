# Offer Management API

Base path: `/api/v1`

Endpoints:

- `GET /offers`
- `POST /offers`
- `GET /offers/{offer_id}`
- `PATCH /offers/{offer_id}`
- `POST /offers/{offer_id}/scopes`
- `POST /offer-scopes/{offer_scope_id}/lines`
- `POST /offer-lines/{offer_line_id}/parts`
- `PATCH /offer-line-parts/{offer_line_part_id}`
- `DELETE /offer-line-parts/{offer_line_part_id}`

Create offer request:

```json
{
  "name": "Project A",
  "offer_number": "OFF-2026-001",
  "type": "standard",
  "input_date": "2026-05-07",
  "close_date": "2026-05-20",
  "description": "Optional notes"
}
```

Create offer side effect:

- System copies default material prices into `project_material_prices` for this offer.
