# Validation Rules

Offer validation:

- `name` is required.
- `offer_number` is required and should be unique.
- `input_date` is required.
- `close_date` should not be earlier than `input_date`.

Scope and line validation:

- Each offer should have at least one scope before calculation.
- Each selected scope should have at least one line before calculation.
- Line name is required within a scope.

Part validation:

- Part must belong to the selected scope in MTO data.
- Qty must be greater than zero.
- Duplicate parts in the same line should either be merged or explicitly allowed by product decision.

Pricing validation:

- Unit price cannot be negative.
- Empty unit prices must be blocked or clearly marked as unresolved before calculation.
