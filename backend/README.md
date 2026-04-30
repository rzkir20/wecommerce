# wecommerce API (Hono)

## Auth + MySQL + Prisma (development)

### 1) Siapkan MySQL lokal (phpMyAdmin / XAMPP / Laragon)

- Pastikan MySQL jalan di `127.0.0.1:3306`
- Buat database `wecommerce` (bisa dari phpMyAdmin)

### 2) Setup env

Salin env, lalu isi `JWT_SECRET` (minimal 16 karakter):

```bash
cp .env.example .env
```

(Di **CMD Windows**: `copy .env.example .env`)

Isi `DATABASE_URL` di `.env` (disarankan). Contoh:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/wecommerce"
```

Kalau tidak diisi, `DATABASE_URL` akan otomatis dibangun dari variabel `MYSQL_*`.

Generate secret:

Di **CMD** atau **PowerShell** (folder apa saja, asal Node terpasang), jalankan:

```bat
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Salin output ke baris `JWT_SECRET=` di `.env`.

### 3) Install dependencies + migrate schema (Prisma)

```bash
pnpm install
pnpm prisma:migrate -- --name init
pnpm prisma:generate
pnpm prisma db push
pnpm dev
```

API: `http://localhost:8787`  
 Endpoint auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (header `Authorization: Bearer <token>`).

## Cloudflare Worker (`pnpm dev:cf`)

Entry `src/index.ts` mengekspor app yang sama, tetapi route auth **membutuhkan MySQL** — Worker tidak cocok untuk `mysql2` langsung. Gunakan Node (`pnpm dev`) untuk auth, atau nanti sambungkan lewat Hyperdrive / layanan DB yang didukung Workers.

## Deploy Worker

```bash
pnpm deploy
```

Pastikan variabel dan database disesuaikan untuk environment produksi.

## Docker (Node API + MySQL)

Jalankan API berbasis Prisma di container Node (bukan Worker):

```bash
docker compose up -d --build
```

Service yang dijalankan:

- API: `http://localhost:8787`
- MySQL: `localhost:3306`

Setelah container up pertama kali, jalankan migrasi:

```bash
docker compose exec api pnpm prisma:migrate -- --name init
docker compose exec api pnpm prisma:generate
```

`JWT_SECRET`, `CORS_ORIGIN`, dan `DATABASE_URL` bisa diubah di `docker-compose.yml`.
