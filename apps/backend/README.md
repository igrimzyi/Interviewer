# POS Express API (apps/api/express)

Minimal Express service for the POS monorepo.

## Scripts

- `pnpm dev` – run the API in watch mode
- `pnpm build` – build TypeScript to `dist`
- `pnpm start` – run the compiled server

## Environment

See `.env.example` for expected variables.

## Signup API

- Endpoint: `POST /auth/signup`
- Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongpass123"
}
```

- Success response: `201 Created`
- Conflict response for duplicate email: `409 Conflict`
