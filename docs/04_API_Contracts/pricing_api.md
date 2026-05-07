# Pricing API

Base path: `/api/v1`

Endpoints:

- `GET /offers/{offer_id}/material-prices`
- `PUT /offers/{offer_id}/material-prices/{material_id}`

Update material price request:

```json
{
  "unit_price": 1250000
}
```

Expected behavior:

- Update only the selected offer's material price.
- Set `is_overridden = true`.
- Mark affected offer calculations as outdated.
- Do not change default material prices.
- Do not change other offers.
