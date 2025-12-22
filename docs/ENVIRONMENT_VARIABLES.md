# Environment Variables

Dokumentasi lengkap untuk semua environment variables yang digunakan dalam aplikasi.

## File Environment

Aplikasi menggunakan file `.env.local` untuk menyimpan environment variables. File ini **TIDAK** di-commit ke repository (sudah ada di `.gitignore`).

**Lokasi**: Root project (`expense-splitter-app/.env.local`)

## Required Variables

### Database

#### `DATABASE_URL`

Connection string untuk PostgreSQL database.

**Format:**

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Contoh:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_splitter?schema=public"
```

**Penjelasan:**

- `user`: Username database (default: `postgres`)
- `password`: Password database
- `host`: Host database (localhost untuk development)
- `port`: Port database (default: `5432`)
- `database`: Nama database
- `schema`: Schema database (default: `public`)

**Cara Setup:**

1. Install PostgreSQL
2. Buat database baru:
   ```sql
   CREATE DATABASE expense_splitter;
   ```
3. Copy connection string ke `.env.local`

---

### NextAuth

#### `NEXTAUTH_URL`

URL base aplikasi untuk NextAuth callbacks.

**Contoh:**

```env
# Development
NEXTAUTH_URL="http://localhost:3000"

# Production
NEXTAUTH_URL="https://yourdomain.com"
```

**Catatan:**

- Harus sesuai dengan URL aplikasi yang sebenarnya
- Untuk production, gunakan HTTPS

---

#### `NEXTAUTH_SECRET`

Secret key untuk encrypt session tokens. **PENTING**: Jangan share secret ini!

**Cara Generate:**

**Linux/Mac:**

```bash
openssl rand -base64 32
```

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Contoh:**

```env
NEXTAUTH_SECRET="your-generated-secret-key-here-min-32-chars"
```

**Catatan:**

- Minimal 32 karakter
- Generate secret yang berbeda untuk development dan production
- Jangan commit ke repository

---

### Google OAuth

#### `GOOGLE_CLIENT_ID`

Client ID dari Google OAuth 2.0 credentials.

**Contoh:**

```env
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
```

**Cara Mendapatkan:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable **Google+ API** atau **Google Identity API**
4. Buka **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Pilih **Web application**
6. Set **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** ke `.env.local`

---

#### `GOOGLE_CLIENT_SECRET`

Client Secret dari Google OAuth 2.0 credentials.

**Contoh:**

```env
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

**Cara Mendapatkan:**

- Sama seperti `GOOGLE_CLIENT_ID`, copy **Client Secret** dari Google Cloud Console

**Catatan:**

- Jangan share atau commit secret ini
- Jika secret ter-expose, regenerate di Google Cloud Console

---

## Optional Variables

### Node Environment

#### `NODE_ENV`

Environment mode aplikasi.

**Values:**

- `development` - Development mode (default saat `npm run dev`)
- `production` - Production mode (default saat `npm run build`)

**Contoh:**

```env
NODE_ENV="development"
```

**Catatan:**

- Biasanya tidak perlu di-set manual
- Next.js otomatis set berdasarkan command yang dijalankan

---

## File `.env.local` Template

Buat file `.env.local` di root project dengan template berikut:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_splitter?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## Environment Variables untuk Production

Untuk production, gunakan environment variables yang disediakan oleh hosting platform:

### Vercel

- Set di **Settings** → **Environment Variables**
- Otomatis tersedia saat deploy

### Railway

- Set di **Variables** tab
- Atau gunakan `.env` file

### Heroku

- Gunakan `heroku config:set KEY=value`
- Atau set di dashboard

### Docker

- Gunakan `-e` flag atau `docker-compose.yml` dengan `environment:` section

---

## Security Best Practices

1. **Jangan commit `.env.local`** - File ini sudah ada di `.gitignore`
2. **Gunakan secret yang berbeda** untuk development dan production
3. **Rotate secrets secara berkala** - Terutama jika ter-expose
4. **Gunakan environment variables** di hosting platform, jangan hardcode
5. **Validasi environment variables** saat aplikasi start (lihat `src/lib/prisma.ts`)

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

**Solusi:**

- Pastikan file `.env.local` ada di root project
- Pastikan `DATABASE_URL` sudah di-set dengan benar
- Restart development server setelah menambah environment variable

### Error: "NEXTAUTH_SECRET is not set"

**Solusi:**

- Generate secret baru menggunakan command di atas
- Pastikan secret minimal 32 karakter
- Restart development server

### Error: Google OAuth tidak bekerja

**Solusi:**

- Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` benar
- Pastikan redirect URI di Google Console sesuai dengan `NEXTAUTH_URL`
- Pastikan Google+ API sudah di-enable

---

## Validasi Environment Variables

Aplikasi akan melakukan validasi saat startup:

- `DATABASE_URL` - Di-validate di `src/lib/prisma.ts`
- `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` - Di-validate di `src/lib/auth-config.ts`

Jika ada environment variable yang required tidak di-set, aplikasi akan throw error saat startup.
