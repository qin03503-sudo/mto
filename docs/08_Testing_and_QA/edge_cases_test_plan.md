# Edge Cases Test Plan

Data edge cases:

- MTO row with empty unit price.
- Material with same name but different dimensions.
- Material with same name and different prices.
- `UNIT` containing a numeric coefficient such as `7.86`.
- Scope name containing two amperes, such as `400A-630A AL`.

Offer edge cases:

- Offer with no scopes should not calculate.
- Scope with no lines should not calculate.
- Line with no parts should not calculate.
- Part quantity zero or negative should be rejected.
- Material price change should mark calculation outdated.

Versioning edge cases:

- Importing a new MTO version should not change closed offers.
- Recalculating an editable offer should clearly record which MTO version was used.
