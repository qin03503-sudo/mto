# Calculation Methods

| Method | Description |
| --- | --- |
| `VALUE_X_UNIT_PRICE` | Default method. `value * unit_price`. |
| `QTY_X_UNIT_PRICE` | Used when quantity drives the material row total. `qty * unit_price`. |
| `DIMENSIONAL_WEIGHT` | Used for dimensional/weight calculations, including rows involving coefficient `7.86`. |
| `ZERO_OR_INFO` | Informational row or zero-price row. |
| `MANUAL` | Manually controlled exception that needs explicit review. |

Each imported MTO row should have one method. Rows that cannot be safely classified should block import approval or be marked for review.
