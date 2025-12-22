import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a connection pool
const pool = new Pool({
  connectionString,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prismaClient = new PrismaClient({
  adapter,
});

// In development, use a global variable to prevent multiple instances
export const prisma = globalThis.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

