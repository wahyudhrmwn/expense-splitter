# Expense Splitter App

Aplikasi web untuk membagi tagihan dengan teman secara adil dan otomatis. Aplikasi ini memungkinkan pengguna untuk membuat group pengeluaran, menambahkan anggota, mencatat pengeluaran dengan detail per item per orang, dan menghitung saldo serta penyelesaian hutang piutang secara otomatis.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Persyaratan](#-persyaratan)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Project](#-struktur-project)
- [Dokumentasi](#-dokumentasi)
- [Development](#-development)
- [Database](#-database)

## ✨ Fitur

- ✅ **Autentikasi Google OAuth** - Login menggunakan akun Google
- ✅ **Manajemen Group** - Buat, edit, dan hapus group pengeluaran
- ✅ **Manajemen Anggota** - Tambah, edit, dan hapus anggota dalam group
- ✅ **Pencatatan Pengeluaran** - Tambah pengeluaran dengan detail per item per orang
- ✅ **Support Pajak (PPN)** - Hitung pajak dengan persentase custom (default 11%)
- ✅ **Perhitungan Saldo Otomatis** - Hitung saldo setiap orang secara otomatis
- ✅ **Penyelesaian Hutang Piutang** - Tampilkan kesimpulan siapa harus bayar ke siapa

## 🛠 Teknologi

### Core Framework

- **Next.js 16** - React framework dengan App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### State Management & UI

- **Zustand** - State management
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Radix UI** - UI components (Popover, Slot)

### Backend & Database

- **NextAuth.js 4** - Authentication
- **Prisma 7** - ORM
- **PostgreSQL** - Database
- **@prisma/adapter-pg** - PostgreSQL adapter untuk Prisma

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **tsx** - TypeScript execution

## 📦 Persyaratan

- **Node.js** >= 18.x
- **npm** atau **yarn** atau **pnpm**
- **PostgreSQL** database
- **Google OAuth Credentials** (untuk autentikasi)

## 🚀 Instalasi

1. **Clone repository** (jika menggunakan git):

```bash
git clone <repository-url>
cd expense-splitter-app
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup environment variables**:
   Buat file `.env.local` di root project (lihat [Konfigurasi](#-konfigurasi))

4. **Setup database**:

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrations
npx prisma migrate dev

# (Opsional) Seed database dengan data contoh
npm run db:seed
```

## ⚙️ Konfigurasi

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_splitter?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate dengan: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Mendapatkan Google OAuth Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable **Google+ API**
4. Buat **OAuth 2.0 Client ID**
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy `Client ID` dan `Client Secret` ke `.env.local`

### Generate NEXTAUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 🏃 Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

### Database Commands

```bash
# Generate Prisma Client (setelah mengubah schema)
npx prisma generate

# Jalankan migrations
npx prisma migrate dev

# Reset database (HATI-HATI: menghapus semua data)
npx prisma migrate reset

# Clear database (menghapus semua data tanpa reset schema)
npm run db:clear

# Seed database dengan data contoh
npm run db:seed

# Buka Prisma Studio (GUI untuk melihat/mengedit data)
npx prisma studio
```

## 📁 Struktur Project

```
expense-splitter-app/
├── prisma/                    # Prisma schema dan migrations
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   ├── seed.ts               # Database seeder
│   └── clear.ts              # Script untuk clear database
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth routes
│   │   │   └── expense-groups/ # Expense groups API
│   │   ├── login/            # Login page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── providers/        # Context providers
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Auth helpers
│   │   ├── auth-config.ts    # NextAuth configuration
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
│   ├── store/                # Zustand stores
│   │   └── expenseSplitterStore.ts
│   ├── types/                # TypeScript type definitions
│   └── generated/            # Generated files (Prisma)
│       └── prisma/           # Prisma generated client
├── .env.local                # Environment variables (tidak di-commit)
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies dan scripts
├── README.md                 # Dokumentasi utama (file ini)
├── DATABASE_STRUCTURE.md     # Dokumentasi struktur database
└── docs/                     # Dokumentasi tambahan (jika ada)
```

Lihat [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) untuk penjelasan detail setiap folder.

## 📚 Dokumentasi

### Dokumentasi Utama

- **[README.md](./README.md)** - Dokumentasi utama (file ini)
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Dokumentasi lengkap struktur database
- **[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Dokumentasi API endpoints
- **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Penjelasan struktur project
- **[docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md)** - Dokumentasi environment variables
- **[docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)** - Panduan development

### Quick Links

- [API Endpoints](./docs/API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_STRUCTURE.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Development Workflow](./docs/DEVELOPMENT_GUIDE.md)

## 💻 Development

### Scripts yang Tersedia

```bash
# Development
npm run dev              # Jalankan development server
npm run build            # Build untuk production
npm start                # Jalankan production server
npm run lint             # Lint code

# Database
npm run db:clear         # Clear database (hapus semua data)
npm run db:seed          # Seed database dengan data contoh
```

### Code Style

- Menggunakan **ESLint** dengan konfigurasi Next.js
- Menggunakan **TypeScript** dengan strict mode
- Mengikuti **Next.js App Router** conventions
- Menggunakan **Tailwind CSS** untuk styling

### Menambahkan Fitur Baru

1. **API Route**: Tambah file di `src/app/api/`
2. **Component**: Tambah file di `src/components/`
3. **Store**: Tambah file di `src/store/` (jika menggunakan Zustand)
4. **Type**: Tambah file di `src/types/`
5. **Database**: Update `prisma/schema.prisma`, lalu jalankan migration

Lihat [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) untuk panduan lengkap.

## 🗄️ Database

### Schema Overview

Aplikasi menggunakan **PostgreSQL** dengan **Prisma ORM**. Database terdiri dari 5 tabel utama:

1. **User** - Data pengguna (autentikasi)
2. **ExpenseGroup** - Group pengeluaran
3. **Person** - Anggota dalam group
4. **ExpenseItem** - Transaksi/pengeluaran
5. **ExpenseItemPerson** - Item pengeluaran per orang

Lihat [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) untuk dokumentasi lengkap.

### Migrations

```bash
# Buat migration baru
npx prisma migrate dev --name migration_name

# Apply migrations ke production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🔒 Keamanan

- ✅ Autentikasi menggunakan NextAuth.js dengan Google OAuth
- ✅ Middleware untuk proteksi routes
- ✅ User hanya bisa mengakses expense groups miliknya sendiri
- ✅ Validasi input di API routes
- ✅ Environment variables untuk sensitive data

## 🐛 Troubleshooting

### Database Connection Error

Pastikan:

- PostgreSQL server berjalan
- `DATABASE_URL` di `.env.local` benar
- Database sudah dibuat

### Authentication Error

Pastikan:

- `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` benar
- Redirect URI di Google Console sesuai
- `NEXTAUTH_SECRET` sudah di-set
- `NEXTAUTH_URL` sesuai dengan URL aplikasi

### Prisma Client Error

```bash
# Regenerate Prisma Client
npx prisma generate
```

## 📝 License

[Tambahkan license jika ada]

## 👥 Contributors

[Tambahkan daftar contributors jika ada]

---

**Dibuat dengan ❤️ menggunakan Next.js dan TypeScript**
