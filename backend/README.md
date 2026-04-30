# wecommerce API (Hono)

## Auth + MySQL (development)

1. Buat database dan tabel:

   ```bash
   mysql -u root -p < schema.sql
   ```

2. Salin env, lalu isi `JWT_SECRET` (minimal 16 karakter):

   ```bash
   cp .env.example .env
   ```

   (Di **CMD Windows**: `copy .env.example .env`)

   Di **CMD** atau **PowerShell** (folder apa saja, asal Node terpasang), jalankan:

   ```bat
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Salin output ke baris `JWT_SECRET=` di `.env`.

3. Install & jalankan server Node (MySQL harus sudah jalan):

   ```bash
   pnpm install
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
