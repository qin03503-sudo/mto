# High-Level Architecture

Recommended starting architecture: modular monolith.

Suggested modules:

- Auth
- Master Data
- Offer Management
- Material Pricing
- Calculation Engine
- Reporting
- Import

Suggested technology direction:

| Layer | Recommendation |
| --- | --- |
| Frontend | React or Next.js |
| Backend | Node.js, Python, or Go based on team skill |
| Database | PostgreSQL |
| API | REST for MVP, OpenAPI documented contracts |
| Background Jobs | Optional for heavy import/calculation tasks |

PostgreSQL is recommended because the domain is relational and calculation correctness depends on explicit relationships between scopes, parts, materials, MTO rows, offers, and snapshots.
