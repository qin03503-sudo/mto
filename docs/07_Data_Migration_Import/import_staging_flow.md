# Import Staging Flow

Recommended flow:

1. Upload Excel file.
2. Parse sheets into staging tables.
3. Validate required columns.
4. Normalize names and units.
5. Match or create scopes, parts, materials, and units.
6. Classify MTO row calculation methods.
7. Generate validation report.
8. Approve import.
9. Create a new `mto_versions` record.
10. Insert approved rows into `mto_rows`.

Import should not overwrite previous MTO versions. Existing offers should remain tied to the MTO version they were calculated with.
