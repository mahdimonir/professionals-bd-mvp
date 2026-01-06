// Fix: Use Prisma namespace and cast to any to resolve "no exported member" error when PrismaClient isn't correctly recognized.
import * as Prisma from '@prisma/client';

// PrismaClient is attached to the `globalThis` object in development to prevent
// exhausting your database connection limit.
// Fix: Changed 'global' to 'globalThis' to resolve TypeScript error in environments where 'global' is not natively defined.
const PrismaClient = (Prisma as any).PrismaClient;
const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
