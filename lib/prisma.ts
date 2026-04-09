import { PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

// Use pooled connection for runtime when available; fall back to direct.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

const prisma =
  globalForPrisma.prisma ||
  (connectionString
    ? new PrismaClient({
        adapter: new PrismaPg({
          // Prefer pooled connection for runtime; fall back to DIRECT_URL if needed.
          connectionString,
        }),
      })
    : (new Proxy({} as PrismaClient, {
        get() {
          throw new Error(
            "Prisma is not initialized because DATABASE_URL or DIRECT_URL is missing. " +
              "Set these environment variables for both Build and Runtime in Vercel."
          );
        },
      }) as PrismaClient));

if (process.env.NODE_ENV !== "production" && connectionString) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
