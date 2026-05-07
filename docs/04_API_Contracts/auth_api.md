# Auth API

Base path: `/api/v1`

## Login

`POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:

```json
{
  "access_token": "token",
  "user": {
    "id": "uuid",
    "full_name": "User Name",
    "role": "estimator"
  }
}
```

## Profile

`GET /auth/me`
