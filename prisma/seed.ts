// Import Prisma Client dan adapter untuk PostgreSQL
// Catatan: Pastikan sudah menjalankan `npx prisma generate` sebelum menjalankan seed
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

interface PersonData {
  name: string;
  email: string;
}

interface ExpenseItemPersonData {
  personIndex: number; // Index dari people array
  itemName: string;
  amount: number;
}

interface ExpenseData {
  title: string;
  totalAmount: number;
  paidByIndex: number; // Index dari people array
  includeTax: boolean;
  taxPercentage: number;
  category: string;
  date: Date;
  description?: string;
  items: ExpenseItemPersonData[];
}

interface GroupData {
  title: string;
  description?: string;
  people: PersonData[];
  expenses: ExpenseData[];
}

const groupData: GroupData[] = [
  {
    title: "Trip ke Bali",
    description: "Perjalanan liburan ke Bali bersama teman-teman",
    people: [
      {
        name: "Alice",
        email: "alice@example.com",
      },
      {
        name: "Bob",
        email: "bob@example.com",
      },
      {
        name: "Charlie",
        email: "charlie@example.com",
      },
    ],
    expenses: [
      {
        title: "Hotel Booking",
        totalAmount: 1500000,
        paidByIndex: 0, // Alice membayar
        includeTax: true,
        taxPercentage: 11,
        category: "Akomodasi",
        date: new Date("2024-01-15"),
        description: "Pembayaran hotel untuk 3 malam",
        items: [
          {
            personIndex: 0, // Alice
            itemName: "Kamar Hotel",
            amount: 500000,
          },
          {
            personIndex: 1, // Bob
            itemName: "Kamar Hotel",
            amount: 500000,
          },
          {
            personIndex: 2, // Charlie
            itemName: "Kamar Hotel",
            amount: 500000,
          },
        ],
      },
      {
        title: "Makan Malam",
        totalAmount: 450000,
        paidByIndex: 1, // Bob membayar
        includeTax: true,
        taxPercentage: 11,
        category: "Makanan",
        date: new Date("2024-01-15"),
        description: "Makan malam di restoran seafood",
        items: [
          {
            personIndex: 0, // Alice
            itemName: "Makan Malam",
            amount: 150000,
          },
          {
            personIndex: 1, // Bob
            itemName: "Makan Malam",
            amount: 150000,
          },
          {
            personIndex: 2, // Charlie
            itemName: "Makan Malam",
            amount: 150000,
          },
        ],
      },
    ],
  },
  {
    title: "Nongkrong di Kafe",
    description: "Kumpul-kumpul di kafe favorit",
    people: [
      {
        name: "David",
        email: "david@example.com",
      },
      {
        name: "Eve",
        email: "eve@example.com",
      },
    ],
    expenses: [
      {
        title: "Kopi dan Snack",
        totalAmount: 120000,
        paidByIndex: 0, // David membayar
        includeTax: false,
        taxPercentage: 0,
        category: "Makanan & Minuman",
        date: new Date("2024-01-20"),
        description: "Pesanan kopi dan snack untuk semua",
        items: [
          {
            personIndex: 0, // David
            itemName: "Kopi Latte",
            amount: 35000,
          },
          {
            personIndex: 1, // Eve
            itemName: "Cappuccino + Croissant",
            amount: 85000,
          },
        ],
      },
    ],
  },
];

export async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.expenseItemPerson.deleteMany();
  await prisma.expenseItem.deleteMany();
  await prisma.person.deleteMany();
  await prisma.expenseGroup.deleteMany();

  // Create or get a default user for seed data
  const defaultUser = await prisma.user.upsert({
    where: { email: "seed@example.com" },
    update: {},
    create: {
      email: "seed@example.com",
      name: "Seed User",
    },
  });

  // Create groups with nested data
  for (const groupInput of groupData) {
    // Create group first
    const group = await prisma.expenseGroup.create({
      data: {
        title: groupInput.title,
        description: groupInput.description || null,
        userId: defaultUser.id,
      },
    });

    // Create people for this group
    const people = [];
    for (const personInput of groupInput.people) {
      const person = await prisma.person.create({
        data: {
          name: personInput.name,
          email: personInput.email,
          expenseGroupId: group.id,
        },
      });
      people.push(person);
    }

    // Create expenses with items
    for (const expenseInput of groupInput.expenses) {
      // Get paidBy person id berdasarkan index
      const paidByPerson = people[expenseInput.paidByIndex];
      if (!paidByPerson) {
        console.warn(
          `⚠️  Skipping expense "${expenseInput.title}" - paidByIndex ${expenseInput.paidByIndex} tidak valid`
        );
        continue;
      }

      // Create expense
      const expense = await prisma.expenseItem.create({
        data: {
          title: expenseInput.title,
          totalAmount: expenseInput.totalAmount,
          paidBy: paidByPerson.id,
          includeTax: expenseInput.includeTax,
          taxPercentage: expenseInput.taxPercentage,
          category: expenseInput.category,
          date: expenseInput.date,
          description: expenseInput.description || null,
          expenseGroupId: group.id,
        },
      });

      // Create expense items for each person
      for (const itemInput of expenseInput.items) {
        const person = people[itemInput.personIndex];
        if (!person) {
          console.warn(
            `⚠️  Skipping item "${itemInput.itemName}" - personIndex ${itemInput.personIndex} tidak valid`
          );
          continue;
        }

        await prisma.expenseItemPerson.create({
          data: {
            personId: person.id,
            expenseItemId: expense.id,
            itemName: itemInput.itemName,
            amount: itemInput.amount,
          },
        });
      }
    }

    console.log(
      `✅ Created group: "${group.title}" dengan ${people.length} orang dan ${groupInput.expenses.length} pengeluaran`
    );
  }

  console.log("✨ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
