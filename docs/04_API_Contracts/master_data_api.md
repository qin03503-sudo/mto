# Master Data API

Base path: `/api/v1`

Endpoints:

- `GET /scopes`
- `GET /parts`
- `GET /parts?scope_id={scope_id}`
- `GET /materials`
- `GET /units`
- `GET /mto-versions`

Important rule:

- When adding parts to a line, parts should be filtered by the selected scope so users cannot select invalid scope/part combinations.
