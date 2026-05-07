# User Flows

## Create Offer

1. User opens offer list.
2. User clicks `New Offer`.
3. User enters offer name, offer number, type, input date, close date, and notes.
4. System creates the offer.
5. System copies default material prices into project-specific material prices.

## Define Scope And Lines

1. User opens an offer.
2. User selects one or more scopes.
3. User creates lines under each selected scope.
4. User adds parts to each line.
5. User enters quantity for each part.

## Edit Project Material Prices

1. User opens material prices for an offer.
2. System shows copied project-specific prices.
3. User changes selected material prices.
4. System marks affected calculations as outdated.

## Calculate Offer

1. User clicks `Calculate`.
2. System calculates MTO row totals using project material prices.
3. System sums MTO rows by selected scope and part.
4. System multiplies part unit price by line quantity.
5. System stores calculation details and snapshots.
6. System shows output grouped by scope, line, and part.
