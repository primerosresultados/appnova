import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaGlobal: PrismaClient };

// Configure connection pool to avoid exhausting Supabase limits
export const db =
    globalForPrisma.prismaGlobal ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

// Ensure we reuse the same instance in development
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaGlobal = db;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await db.$disconnect();
});
