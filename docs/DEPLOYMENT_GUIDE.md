# Deployment Guide - Vercel

Panduan lengkap untuk deploy aplikasi Expense Splitter ke Vercel.

## 📋 Prasyarat

Sebelum deploy, pastikan Anda sudah memiliki:

1. ✅ **Akun Vercel** - Daftar di [vercel.com](https://vercel.com)
2. ✅ **Database PostgreSQL** - Gunakan salah satu:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recommended)
   - [Supabase](https://supabase.com)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)
   - [Render](https://render.com)
3. ✅ **Google OAuth Credentials** - Sudah setup di [Google Cloud Console](https://console.cloud.google.com/)

---

## 🚀 Langkah-langkah Deployment

### 1. Persiapkan Database

#### Opsi A: Menggunakan Vercel Postgres (Recommended)

1. Di dashboard Vercel, buka project Anda
2. Buka tab **Storage**
3. Klik **Create Database** → Pilih **Postgres**
4. Pilih plan (Hobby plan gratis untuk development)
5. Setelah database dibuat, copy connection string

#### Opsi B: Menggunakan Database External

Setup database PostgreSQL di provider pilihan Anda dan dapatkan connection string.

**Format connection string:**

```
postgresql://user:password@host:port/database?schema=public
```

---

### 2. Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda atau buat project baru
3. Enable **Google+ API** atau **Google Identity API**
4. Buka **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Pilih **Web application**
6. Tambahkan **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
   (Ganti `your-app` dengan nama project Anda)
7. Copy **Client ID** dan **Client Secret**

---

### 3. Deploy ke Vercel

#### Opsi A: Deploy via Vercel Dashboard

1. **Push code ke GitHub/GitLab/Bitbucket**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import project ke Vercel**

   - Buka [vercel.com/new](https://vercel.com/new)
   - Pilih repository Anda
   - Klik **Import**

3. **Konfigurasi Environment Variables**

   Di halaman **Settings** → **Environment Variables**, tambahkan:

   | Variable               | Value                             | Environment                      |
   | ---------------------- | --------------------------------- | -------------------------------- |
   | `DATABASE_URL`         | Connection string dari database   | Production, Preview, Development |
   | `NEXTAUTH_URL`         | `https://your-app.vercel.app`     | Production                       |
   | `NEXTAUTH_SECRET`      | Generate secret (lihat di bawah)  | Production, Preview, Development |
   | `GOOGLE_CLIENT_ID`     | Client ID dari Google Console     | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | Client Secret dari Google Console | Production, Preview, Development |

   **Generate NEXTAUTH_SECRET:**

   ```bash
   # Linux/Mac
   openssl rand -base64 32

   # Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

4. **Deploy**
   - Klik **Deploy**
   - Tunggu proses build selesai

#### Opsi B: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Set Environment Variables**

   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   ```

5. **Deploy ke Production**
   ```bash
   vercel --prod
   ```

---

### 4. Setup Database Schema

Setelah deploy pertama kali, jalankan Prisma migrations:

#### Opsi A: Via Vercel CLI

```bash
# Set DATABASE_URL untuk production
vercel env pull .env.production

# Jalankan migrations
npx prisma migrate deploy
```

#### Opsi B: Via Vercel Dashboard

1. Buka project di Vercel
2. Buka tab **Deployments**
3. Klik pada deployment terbaru
4. Buka **Runtime Logs**
5. Gunakan **Vercel Shell** (jika tersedia) untuk menjalankan:
   ```bash
   npx prisma migrate deploy
   ```

#### Opsi C: Via Local Machine

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-database-url"

# Jalankan migrations
npx prisma migrate deploy
```

---

### 5. Verifikasi Deployment

1. **Buka URL aplikasi** (misalnya: `https://your-app.vercel.app`)
2. **Test login** dengan Google OAuth
3. **Test fitur utama**:
   - Buat expense group
   - Tambah anggota
   - Tambah pengeluaran
   - Lihat perhitungan saldo

---

## 🔧 Konfigurasi Tambahan

### Custom Domain (Opsional)

1. Di Vercel dashboard, buka **Settings** → **Domains**
2. Tambahkan domain Anda
3. Follow instruksi untuk setup DNS
4. Update `NEXTAUTH_URL` environment variable dengan domain baru

### Environment Variables per Environment

Vercel mendukung environment variables berbeda untuk:

- **Production** - Untuk production deployment
- **Preview** - Untuk preview deployments (pull requests)
- **Development** - Untuk local development (via `vercel env pull`)

Pastikan semua environment variables di-set untuk semua environment yang diperlukan.

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

**Solusi:**

- Pastikan environment variable sudah di-set di Vercel dashboard
- Pastikan variable di-set untuk environment yang benar (Production/Preview/Development)
- Redeploy setelah menambah environment variable

### Error: "Prisma Client not generated"

**Solusi:**

- Pastikan `postinstall` script sudah ada di `package.json`
- Check build logs di Vercel untuk melihat apakah `prisma generate` berhasil
- Pastikan `prisma` ada di `devDependencies` (sudah benar)

### Error: "Migration failed"

**Solusi:**

- Pastikan `DATABASE_URL` benar dan database accessible
- Pastikan database sudah dibuat
- Jalankan `npx prisma migrate deploy` secara manual

### Error: "NextAuth callback error"

**Solusi:**

- Pastikan `NEXTAUTH_URL` sesuai dengan URL aplikasi di Vercel
- Pastikan redirect URI di Google Console sesuai dengan `NEXTAUTH_URL`
- Pastikan `NEXTAUTH_SECRET` sudah di-set

### Build Timeout

**Solusi:**

- Pastikan `vercel.json` sudah ada dan benar
- Check apakah ada dependency yang terlalu besar
- Pastikan build command tidak terlalu lama

---

## 📝 Checklist Deployment

Sebelum deploy, pastikan:

- [ ] Code sudah di-push ke repository
- [ ] Database PostgreSQL sudah dibuat
- [ ] Google OAuth credentials sudah dibuat
- [ ] Environment variables sudah di-set di Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `package.json` sudah memiliki `postinstall` script
- [ ] `vercel.json` sudah ada
- [ ] Database migrations sudah dijalankan
- [ ] Aplikasi sudah di-test di production

---

## 🔄 Update Deployment

Setelah melakukan perubahan:

1. **Commit dan push perubahan**

   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```

2. **Vercel akan otomatis deploy** (jika auto-deploy enabled)

3. **Atau deploy manual**

   ```bash
   vercel --prod
   ```

4. **Jika ada perubahan schema database:**

   ```bash
   # Buat migration baru
   npx prisma migrate dev --name your_migration_name

   # Commit migration files
   git add prisma/migrations
   git commit -m "Add database migration"
   git push

   # Setelah deploy, jalankan migration
   npx prisma migrate deploy
   ```

---

## 📚 Referensi

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options)

---

## 💡 Tips

1. **Gunakan Vercel Postgres** untuk kemudahan setup dan integrasi
2. **Enable Preview Deployments** untuk test sebelum merge ke production
3. **Setup monitoring** dengan Vercel Analytics
4. **Gunakan Vercel Environment Variables** untuk secrets, jangan hardcode
5. **Test di Preview** sebelum deploy ke production

---

**Selamat! Aplikasi Anda sudah siap di production! 🎉**
