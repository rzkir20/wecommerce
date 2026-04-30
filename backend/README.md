# wecommerce API (Hono + Supabase)

## Development Setup

### 1) Siapkan env

Salin env template:

```bash
cp .env.example .env
```

Lalu isi nilai berikut di `.env`:

```env
JWT_SECRET=<minimal-16-karakter>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

Generate `JWT_SECRET`:

```bat
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2) Install dan jalankan API

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

API: `http://localhost:8787`  
Endpoint auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.

### 3) Struktur tabel Supabase
Struktur tabel dikelola Prisma pada `prisma/schema.prisma` dan migration SQL di `prisma/migrations`.

## Cookie Session

Untuk shared login antar subdomain, set:

```env
SESSION_COOKIE_DOMAIN=.rizkiramadhan.web.id
```

Jika frontend dan API beda domain (cross-site), gunakan:

```env
SESSION_COOKIE_SAMESITE=none
SESSION_COOKIE_SECURE=true
```

## Cloudflare Worker

File `src/index.ts` saat ini diposisikan sebagai endpoint edge (bukan auth API langsung). Pastikan domain API publik diarahkan ke origin Node API jika Worker proxy tidak dipakai.
