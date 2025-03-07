import { PrismaClient } from '@prisma/client';

// Add error handling for Prisma initialization
let prisma: PrismaClient;

try {
  // PrismaClient is attached to the `global` object in development to prevent
  // exhausting your database connection limit.
  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
    console.log('Prisma Client initialized in production mode');
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
      console.log('Prisma Client initialized in development mode');
    }
    prisma = globalForPrisma.prisma;
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  // Initialize with a basic client as fallback
  prisma = new PrismaClient();
}

export default prisma; 