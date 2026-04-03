import { PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Use pooled connection for runtime when available; fall back to direct.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma connection.");
}

const adapter = new PrismaPg({
  // Prefer pooled connection for runtime; fall back to DIRECT_URL if needed.
  connectionString,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
