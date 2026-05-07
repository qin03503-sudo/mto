# Voice Transcript Analysis

Source: `unstrucured.md`

Key points extracted from the client voice transcript:

- The current Excel file acts as the master MTO database.
- Important MTO fields are `Scope Name`, `Name`, `Material`, `Value`, `Unit`, `Unit Price`, and `Total Price`.
- The client states that `Value` is the main consumption coefficient used for pricing.
- `Qty` should be kept, even if it is not the main field in the default MTO calculation.
- Material data must include material name, price, unit, and dimension.
- Future scopes may include `CU` in addition to current `AL` scopes.
- Users need a list of all offers/projects and a `New Offer` action.
- Offer fields include name, offer number, input date, close date, and type.
- Each offer has selected scopes.
- Each scope has multiple lines.
- Each line has multiple parts and each part has a quantity.
- Each project needs its own copied material price table, separate from default material prices.
- The calculation must find MTO rows matching selected scope and part, sum their prices, and multiply by part quantity in the line.
- Final output should be grouped by scope, line, and part.

Open confirmation items:

- Whether `400A-630A AL` should remain one shared scope or split into two scopes.
- Whether `SPRINH HANGER` is the intended part name or a typo for `SPRING HANGER`.
- Which roles and permissions are required for MVP.
- Whether customer-facing output should hide material-level details.
