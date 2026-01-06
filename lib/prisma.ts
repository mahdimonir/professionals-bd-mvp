
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `globalThis` object in development to prevent
// exhausting your database connection limit.
// Fix: Changed 'global' to 'globalThis' to resolve TypeScript error in environments where 'global' is not natively defined.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
