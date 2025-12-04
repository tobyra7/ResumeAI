import { PrismaClient } from "./generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Ensure SSL for Supabase connections from serverless environments
    ssl: { rejectUnauthorized: false },
  });
  // Quick runtime connection check (non-blocking) to surface clear errors in logs.
  // This logs only the error message (no secrets) to help debugging on Vercel.
  (async () => {
    try {
      const client = await pool.connect();
      client.release();
      console.info('Prisma: DB connection OK');
    } catch (err: any) {
      console.error('Prisma: DB connection error:', err?.message ?? err);
    }
  })();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
