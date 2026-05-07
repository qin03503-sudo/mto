# UI Architecture

Primary screens:

- Login
- Offer list
- New offer form
- Offer overview
- Material prices
- Scopes and lines editor
- Calculation results

Recommended UI behavior:

- Offer editor should show stale/outdated calculation status after pricing or line changes.
- Scope selection should drive available parts.
- Line/part entry should be optimized for fast data entry.
- Calculation results should support grouped views by scope, line, and part.
- Internal drill-down can show material-level details.
- Customer output can hide material-level details if required.
