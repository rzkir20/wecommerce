# Postman Docs - Wecommerce Auth API

Dokumen ini untuk testing endpoint auth backend `wecommerce` lewat Postman.

## Base URL

- Local: `http://localhost:8787`
- Prefix auth: `/api/auth`

Contoh full endpoint login:

`http://localhost:8787/api/auth/login`

## Persiapan

1. Jalankan backend:
   - `pnpm dev`
2. Pastikan API hidup:
   - `GET http://localhost:8787/`
   - Response minimal:
     ```json
     {
       "ok": true,
       "service": "wecommerce-api",
       "auth": "/api/auth"
     }
     ```

## Buat Environment di Postman

Nama environment: `wecommerce-local`

Variables:

- `baseUrl` = `http://localhost:8787`
- `token` = (kosong dulu)

## Buat Collection

Nama collection: `Wecommerce Auth`

Isi request berikut:

### 1) Register

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "name": "Rizki",
  "email": "rizki@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.png",
  "phone": "08123456789"
}
```

Contoh response sukses (`200`):

```json
{
  "token": "<jwt_token>",
  "user": {
    "id": "uuid",
    "email": "rizki@example.com",
    "name": "Rizki",
    "avatar": "https://example.com/avatar.png",
    "phone": "08123456789"
  }
}
```

Kemungkinan error:

- `400` body tidak valid / validasi gagal
- `409` email sudah terdaftar

### 2) Login

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):

```json
{
  "email": "rizki@example.com",
  "password": "password123"
}
```

Contoh response sukses (`200`):

```json
{
  "token": "<jwt_token>",
  "user": {
    "id": "uuid",
    "email": "rizki@example.com",
    "name": "Rizki",
    "avatar": "https://example.com/avatar.png",
    "phone": "08123456789"
  }
}
```

Kemungkinan error:

- `400` JSON invalid
- `401` email/password salah

### 3) Get Profile (Me)

Endpoint ini butuh autentikasi. Bisa pakai:

- Header `Authorization: Bearer <token>`, atau
- Cookie `session` dari login/register (jika Postman menyimpan cookie otomatis)

- Method: `GET`
- URL: `{{baseUrl}}/api/auth/me`
- Header (opsional jika pakai bearer):
  - `Authorization: Bearer {{token}}`

Contoh response sukses (`200`):

```json
{
  "user": {
    "id": "uuid",
    "email": "rizki@example.com",
    "name": "Rizki",
    "avatar": "https://example.com/avatar.png",
    "phone": "08123456789"
  }
}
```

Kemungkinan error:

- `401` unauthorized / token expired

### 4) Logout

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/logout`

Contoh response sukses (`200`):

```json
{
  "ok": true
}
```

## Simpan Token Otomatis (Opsional, disarankan)

Supaya `{{token}}` terisi otomatis setelah register/login, tambahkan script ini di tab **Tests** request `Register` dan `Login`:

```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set("token", json.token);
}
```

## Quick Test Flow

Urutan test yang disarankan:

1. `Register`
2. `Login`
3. `Get Profile (Me)`
4. `Logout`
5. `Get Profile (Me)` lagi (harus gagal `401` jika hanya mengandalkan cookie session)

## Catatan

- JWT berlaku 7 hari.
- Email harus format valid.
- Password minimal 8 karakter.
- Name minimal 2 karakter.
