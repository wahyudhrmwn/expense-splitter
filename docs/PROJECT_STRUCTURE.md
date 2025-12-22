# Project Structure

Penjelasan lengkap struktur folder dan file dalam project Expense Splitter App.

## Root Directory

```
expense-splitter-app/
├── prisma/                    # Prisma ORM configuration
├── src/                       # Source code aplikasi
├── docs/                      # Dokumentasi tambahan
├── .env.local                 # Environment variables (tidak di-commit)
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies dan scripts
├── README.md                 # Dokumentasi utama
└── DATABASE_STRUCTURE.md     # Dokumentasi database
```

---

## 📁 Prisma Directory

```
prisma/
├── schema.prisma            # Database schema definition
├── migrations/              # Database migration files
│   ├── 20251221160913_init/
│   ├── 20251222053458_make_email_optional/
│   └── ...
├── seed.ts                  # Database seeder script
├── clear.ts                 # Script untuk clear database
└── prisma.config.ts         # Prisma configuration (jika ada)
```

**Penjelasan:**
- `schema.prisma` - Definisi model database (User, ExpenseGroup, Person, ExpenseItem, ExpenseItemPerson)
- `migrations/` - History perubahan database schema
- `seed.ts` - Script untuk populate database dengan data contoh
- `clear.ts` - Script untuk menghapus semua data dari database

---

## 📁 Source Directory (`src/`)

### App Directory (`src/app/`)

Next.js App Router directory. Setiap folder mewakili route.

```
src/app/
├── api/                     # API routes
│   ├── auth/                # NextAuth routes
│   │   └── [...nextauth]/   # NextAuth catch-all route
│   │       └── route.ts
│   └── expense-groups/      # Expense groups API
│       ├── route.ts         # GET, POST /api/expense-groups
│       └── [id]/            # Dynamic route untuk group ID
│           ├── route.ts     # GET, PUT, DELETE /api/expense-groups/[id]
│           ├── people/      # People API
│           │   ├── route.ts # POST /api/expense-groups/[id]/people
│           │   └── [personId]/
│           │       └── route.ts # PUT, DELETE /api/expense-groups/[id]/people/[personId]
│           └── expenses/    # Expenses API
│               ├── route.ts # POST /api/expense-groups/[id]/expenses
│               └── [expenseId]/
│                   └── route.ts # PUT, DELETE /api/expense-groups/[id]/expenses/[expenseId]
├── login/                   # Login page
│   └── page.tsx
├── layout.tsx              # Root layout (wraps semua pages)
├── page.tsx                # Home page (/)
└── globals.css             # Global CSS styles
```

**Penjelasan:**
- `api/` - API routes menggunakan Next.js Route Handlers
- `login/` - Halaman login
- `layout.tsx` - Root layout dengan providers (SessionProvider, dll)
- `page.tsx` - Home page aplikasi
- `globals.css` - Global styles (Tailwind CSS directives)

---

### Components Directory (`src/components/`)

React components yang reusable.

```
src/components/
├── providers/              # Context providers
│   └── SessionProvider.tsx # NextAuth session provider
└── ui/                     # UI components (shadcn/ui style)
    ├── button.tsx          # Button component
    ├── card.tsx            # Card component
    ├── input.tsx           # Input component
    ├── label.tsx           # Label component
    └── select.tsx          # Select component
```

**Penjelasan:**
- `providers/` - Context providers untuk global state (session, theme, dll)
- `ui/` - Reusable UI components menggunakan Radix UI dan Tailwind CSS

---

### Lib Directory (`src/lib/`)

Utility libraries dan helper functions.

```
src/lib/
├── auth.ts                 # Auth helper functions
├── auth-config.ts          # NextAuth configuration
├── prisma.ts               # Prisma client instance
└── utils.ts                # Utility functions (cn, dll)
```

**Penjelasan:**
- `auth.ts` - Helper untuk mendapatkan current user dari session
- `auth-config.ts` - Konfigurasi NextAuth (providers, callbacks, dll)
- `prisma.ts` - Prisma client singleton instance
- `utils.ts` - Utility functions (class name merger, dll)

---

### Store Directory (`src/store/`)

Zustand state management stores.

```
src/store/
└── expenseSplitterStore.ts # Main store untuk expense splitter
```

**Penjelasan:**
- `expenseSplitterStore.ts` - Store utama yang mengelola state aplikasi (groups, selectedGroup, loading, dll) dan API functions

---

### Types Directory (`src/types/`)

TypeScript type definitions.

```
src/types/
└── (kosong saat ini, types didefinisikan di store)
```

**Catatan:** Saat ini types didefinisikan di `expenseSplitterStore.ts`, tapi bisa dipindah ke sini untuk better organization.

---

### Generated Directory (`src/generated/`)

Generated files (tidak di-edit manual).

```
src/generated/
└── prisma/                 # Prisma generated client
    ├── client.ts           # Prisma Client
    ├── browser.ts          # Browser-compatible client
    ├── models/             # Generated model types
    │   ├── User.ts
    │   ├── ExpenseGroup.ts
    │   ├── Person.ts
    │   ├── ExpenseItem.ts
    │   └── ExpenseItemPerson.ts
    └── ...
```

**Penjelasan:**
- File-file ini di-generate oleh Prisma
- Jangan edit manual, regenerate dengan `npx prisma generate`
- Types digunakan untuk type safety di seluruh aplikasi

---

## 📁 Config Files

### `next.config.ts`

Next.js configuration file.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**Catatan:** Saat ini menggunakan default config, bisa ditambahkan custom config jika diperlukan.

---

### `tsconfig.json`

TypeScript configuration.

**Key Settings:**
- `target: "ES2017"` - JavaScript target version
- `strict: true` - Enable strict type checking
- `paths: { "@/*": ["./src/*"] }` - Path alias untuk import

**Path Alias:**
- `@/` → `src/`
- Contoh: `import { prisma } from "@/lib/prisma"`

---

### `package.json`

Dependencies dan scripts.

**Scripts:**
- `dev` - Development server
- `build` - Production build
- `start` - Production server
- `lint` - ESLint
- `db:clear` - Clear database
- `db:seed` - Seed database

---

## 📁 Documentation Directory (`docs/`)

Dokumentasi tambahan.

```
docs/
├── API_DOCUMENTATION.md           # Dokumentasi API endpoints
├── ENVIRONMENT_VARIABLES.md       # Dokumentasi environment variables
├── PROJECT_STRUCTURE.md           # File ini
└── DEVELOPMENT_GUIDE.md           # Panduan development
```

---

## File Naming Conventions

### Components
- **PascalCase** untuk components: `SessionProvider.tsx`, `Button.tsx`
- **camelCase** untuk utilities: `auth.ts`, `prisma.ts`

### API Routes
- **route.ts** untuk Next.js Route Handlers
- Folder structure mengikuti URL structure

### Types
- **PascalCase** untuk interfaces/types: `ExpenseGroup`, `Person`

---

## Import Paths

### Absolute Imports (Recommended)

Menggunakan path alias `@/`:

```typescript
import { prisma } from "@/lib/prisma";
import { useExpenseSplitterStore } from "@/store/expenseSplitterStore";
import { Button } from "@/components/ui/button";
```

### Relative Imports

Bisa digunakan untuk imports dalam folder yang sama:

```typescript
import { helper } from "./helper";
```

---

## Best Practices

1. **Organize by Feature** - Group related files dalam folder yang sama
2. **Use Path Aliases** - Gunakan `@/` untuk absolute imports
3. **Separate Concerns** - Pisahkan API routes, components, dan utilities
4. **Type Safety** - Gunakan TypeScript types dari Prisma generated models
5. **Reusable Components** - Taruh di `components/ui/` jika digunakan di banyak tempat

---

## Adding New Features

### Menambah API Route Baru

1. Buat folder di `src/app/api/[feature-name]/`
2. Buat `route.ts` dengan export functions: `GET`, `POST`, `PUT`, `DELETE`
3. Import `prisma` dan `getCurrentUser` dari `@/lib/`

### Menambah Component Baru

1. Buat file di `src/components/[category]/[ComponentName].tsx`
2. Export component sebagai default atau named export
3. Import di tempat yang membutuhkan

### Menambah Store Baru

1. Buat file di `src/store/[storeName].ts`
2. Gunakan `create` dari Zustand
3. Define state, actions, dan getters

---

## File Size Guidelines

- **Components**: Maksimal ~300 lines, split jika lebih besar
- **API Routes**: Maksimal ~200 lines per handler, extract logic ke separate functions
- **Stores**: Bisa lebih besar, tapi organize dengan baik menggunakan comments

---

**Dokumentasi ini akan di-update seiring dengan perkembangan project.**

