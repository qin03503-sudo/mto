# Snapshot Mechanism

Each calculation should create a calculation run.

The run should store:

- Offer ID
- MTO version ID
- User ID
- Run time
- Input state hash, if implemented
- Total price
- Status

Calculation details should store enough information to drill down from offer total to MTO row-level calculations.

Snapshots protect old offers from changing when default material prices, MTO rows, or calculation logic change later.
