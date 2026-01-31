import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
    // Safety check to confirm DB source
    const dbUrl = process.env.DATABASE_URL || "UNKNOWN";
    console.log("----------------------------------------");
    console.log("🔌 Connected to DB:", dbUrl.includes("supabase.com") ? "REMOTE (Supabase)" : "LOCAL/OTHER");
    console.log("----------------------------------------");
}
