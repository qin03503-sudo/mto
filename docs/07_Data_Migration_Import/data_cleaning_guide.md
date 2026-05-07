# Data Cleaning Guide

Required cleaning before production import:

- Trim material names.
- Normalize Persian/English character variants where applicable.
- Normalize repeated spaces.
- Normalize unit names.
- Separate numeric coefficients from real unit values.
- Resolve materials with the same name but different dimensions or prices.
- Confirm spelling of suspicious part names, such as `SPRINH HANGER`.
- Classify every MTO row by calculation method.
- Preserve original Excel values for traceability.
