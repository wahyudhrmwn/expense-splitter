// Script to clear all data from database
// Import Prisma Client dan adapter untuk PostgreSQL
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function clearDatabase() {
  console.log("🗑️  Starting database cleanup...");

  try {
    // Delete in correct order to respect foreign key constraints
    // Delete from deepest level to top level
    
    console.log("Deleting expense item people...");
    await prisma.expenseItemPerson.deleteMany();
    
    console.log("Deleting expense items...");
    await prisma.expenseItem.deleteMany();
    
    console.log("Deleting people...");
    await prisma.person.deleteMany();
    
    console.log("Deleting expense groups...");
    await prisma.expenseGroup.deleteMany();

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabase()
    .catch((e) => {
      console.error("❌ Clear failed:", e);
      process.exit(1);
    });
}

