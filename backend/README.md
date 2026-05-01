## Setup

```bash
pnpm install
cp .env.example .env
```

Isi nilai env Supabase pada `.env`, terutama:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Prisma Migration

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

## Run Backend

```bash
pnpm dev
```

Server berjalan di `http://localhost:8787` (atau sesuai `PORT`).
