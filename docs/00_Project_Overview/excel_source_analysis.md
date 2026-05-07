# Excel Source Analysis

Source workbook described in `unstrucured.md`: `All.xlsx` / `All update MTO`.

Known sheets:

| Sheet | Purpose |
| --- | --- |
| `Al update MTO - 05-1-30` | Main MTO table. |
| `متریال` | Material master data, default prices, scope list, part list, and line names. |
| `Line` | Example offer line calculation. |
| `Sheet2` | Pivot summary of MTO totals by scope. |
| `خروجی` | Pivot output grouped by scope, line, and part. |

Main MTO columns:

| Column | Meaning |
| --- | --- |
| `Source.Name` | Scope/source name. |
| `Name` | Part name. |
| `ردیف` | Internal row number. |
| `دسته` | Category. |
| `متریال` | Material name. |
| `DIMENTION` | Dimension. Should be normalized to `dimension`. |
| `QTY` | Quantity. |
| `VALUE` | Consumption coefficient. |
| `UNIT` | Unit. |
| `UNIT PRICE` | Unit price. |
| `TOTAL PRICE` | Row total price. |
| `Item` | Duplicate of `Name` in the analyzed data. |
| `Kind` | Source kind. |
| `Hidden` | Hidden flag. |

Important extracted numbers:

| Metric | Value |
| --- | --- |
| MTO rows | 2,398 |
| Current scopes | 10 |
| Current parts | 23 |
| Unique materials | 91 |
| Units | 9 |
| MTO grand total | 54,798,877,829.239 |

Known Excel formulas:

```excel
=SUMIFS('Al update MTO - 05-1-30'!K:K,'Al update MTO - 05-1-30'!A:A,A2,'Al update MTO - 05-1-30'!B:B,Line!C2)
=D2*E2
=VLOOKUP(A:A,H:K,4,1)
=COUNTIF(H:H,A2)
```

Data risks to resolve during import:

- Approximate `VLOOKUP` can return wrong material prices.
- Material names may be duplicated with different prices.
- Some material names differ only by spacing or character case.
- Some `UNIT` values appear to contain calculation coefficients such as `7.86`.
- Some rows have empty unit prices or unclear manual totals.
