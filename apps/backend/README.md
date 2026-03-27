# POS Express API (apps/api/express)

Minimal Express service for the POS monorepo.

## Scripts

- `pnpm dev` – run the API in watch mode
- `pnpm build` – build TypeScript to `dist`
- `pnpm start` – run the compiled server
- `pnpm db:reset` – drop and recreate the schema
- `pnpm seed:questions` – seed the default question into an existing org
- `pnpm seed:dev` – rebuild and seed a full MySQL dev dataset

## Environment

See `.env.example` for expected variables.
