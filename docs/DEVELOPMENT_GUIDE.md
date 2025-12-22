# Development Guide

Panduan lengkap untuk development aplikasi Expense Splitter.

## 🚀 Getting Started

### Prerequisites

Pastikan sudah install:
- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **Git** (jika menggunakan version control)

### Initial Setup

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
Buat file `.env.local` di root project (lihat [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))

4. **Setup database**:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run db:seed
```

5. **Start development server**:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🛠 Development Workflow

### 1. Membuat Feature Baru

#### Step 1: Update Database Schema (jika perlu)

Edit `prisma/schema.prisma`:
```prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
```

Generate migration:
```bash
npx prisma migrate dev --name add_new_model
```

#### Step 2: Create API Route

Buat file di `src/app/api/[feature]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ data: [] });
}
```

#### Step 3: Update Store (jika perlu)

Edit `src/store/expenseSplitterStore.ts`:
```typescript
// Add new state
newFeature: NewFeature[] = [],

// Add new action
fetchNewFeature: async () => {
  // API call
},
```

#### Step 4: Create Component

Buat component di `src/components/[category]/[ComponentName].tsx`:
```typescript
export default function NewComponent() {
  // Component logic
  return <div>...</div>;
}
```

#### Step 5: Test

- Test di browser
- Check console untuk errors
- Test edge cases

---

### 2. Database Migrations

#### Create Migration

```bash
npx prisma migrate dev --name migration_name
```

Ini akan:
- Create migration file di `prisma/migrations/`
- Apply migration ke database
- Regenerate Prisma Client

#### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

**WARNING**: Ini akan menghapus semua data!

#### Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

---

### 3. Working with Prisma

#### Generate Client

Setelah mengubah schema:
```bash
npx prisma generate
```

#### Prisma Studio (GUI)

Buka Prisma Studio untuk melihat/mengedit data:
```bash
npx prisma studio
```

Buka di browser: [http://localhost:5555](http://localhost:5555)

#### Query Examples

```typescript
// Find many
const groups = await prisma.expenseGroup.findMany({
  where: { userId: user.id },
  include: { people: true, expenses: true }
});

// Find unique
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});

// Create
const group = await prisma.expenseGroup.create({
  data: {
    title: "New Group",
    userId: user.id,
    people: {
      create: [{ name: "Person 1" }]
    }
  }
});

// Update
const updated = await prisma.expenseGroup.update({
  where: { id: groupId },
  data: { title: "Updated Title" }
});

// Delete
await prisma.expenseGroup.delete({
  where: { id: groupId }
});
```

---

### 4. API Development

#### Route Handler Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validate input (if needed)
    // ...

    // 3. Query database
    const data = await prisma.model.findMany({
      where: { userId: user.id }
    });

    // 4. Return response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Error Handling

```typescript
try {
  // Your code
} catch (error) {
  console.error("Error:", error);
  
  // Return appropriate error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate entry" },
        { status: 400 }
      );
    }
  }
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

---

### 5. State Management (Zustand)

#### Store Structure

```typescript
import { create } from "zustand";

interface StoreState {
  // State
  data: DataType[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  addData: (item: DataType) => Promise<void>;
  updateData: (id: string, updates: Partial<DataType>) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  data: [],
  loading: false,
  error: null,

  // Actions
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/endpoint");
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error",
        loading: false
      });
    }
  },
  // ... more actions
}));
```

#### Using Store in Components

```typescript
import { useStore } from "@/store/store";

export default function Component() {
  const { data, loading, fetchData } = useStore();

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <div>{/* Render data */}</div>;
}
```

---

### 6. Component Development

#### Component Structure

```typescript
"use client"; // If using hooks

import { useState, useEffect } from "react";
import { useStore } from "@/store/store";

interface ComponentProps {
  // Props
}

export default function Component({ }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();
  const { data } = useStore();

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Using UI Components

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Component() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button onClick={handleClick}>Submit</Button>
    </Card>
  );
}
```

---

### 7. Styling

#### Tailwind CSS

Gunakan Tailwind utility classes:
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

#### Custom Styles

Tambahkan custom styles di `src/app/globals.css`:
```css
@layer components {
  .custom-class {
    /* Custom styles */
  }
}
```

---

### 8. Testing

#### Manual Testing Checklist

- [ ] Test semua CRUD operations
- [ ] Test error handling
- [ ] Test authentication
- [ ] Test edge cases (empty data, invalid input, dll)
- [ ] Test di browser berbeda
- [ ] Test responsive design

#### Debugging

**Console Logs:**
```typescript
console.log("Debug:", data);
console.error("Error:", error);
```

**React DevTools:**
- Install React DevTools extension
- Inspect components dan state

**Network Tab:**
- Check API requests/responses
- Check for errors

---

### 9. Code Quality

#### Linting

```bash
npm run lint
```

#### Type Checking

TypeScript akan otomatis check types saat development.

#### Code Formatting

Gunakan Prettier (jika di-setup):
```bash
npx prettier --write .
```

---

### 10. Git Workflow

#### Commit Messages

Gunakan conventional commits:
```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
style: formatting changes
test: add tests
```

#### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/[name]` - Feature branches
- `fix/[name]` - Bug fix branches

---

## 🐛 Common Issues

### Issue: Prisma Client not found

**Solution:**
```bash
npx prisma generate
```

### Issue: Database connection error

**Solution:**
- Check `DATABASE_URL` di `.env.local`
- Check PostgreSQL server running
- Check database exists

### Issue: NextAuth not working

**Solution:**
- Check `NEXTAUTH_SECRET` di-set
- Check `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` benar
- Check redirect URI di Google Console

### Issue: Type errors

**Solution:**
- Regenerate Prisma Client: `npx prisma generate`
- Restart TypeScript server di IDE
- Check `tsconfig.json` paths

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 💡 Tips

1. **Use TypeScript** - Leverage type safety untuk catch errors early
2. **Use Prisma Studio** - Visual tool untuk melihat/mengedit data
3. **Use React DevTools** - Debug components dan state
4. **Use Network Tab** - Debug API calls
5. **Read Error Messages** - Error messages biasanya memberikan clue yang jelas
6. **Check Console** - Browser console dan server console untuk errors
7. **Incremental Development** - Build feature step by step, test setiap step
8. **Code Organization** - Keep code organized, follow project structure

---

**Happy Coding! 🚀**

