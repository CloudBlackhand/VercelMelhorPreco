import { PrismaClient } from "@prisma/client";

function cleanEnvValue(value?: string) {
  if (!value) return value;
  // Remove aspas e espaços acidentais ao colar a env no painel.
  return value.trim().replace(/^["']+|["']+$/g, "");
}

const databaseUrl = cleanEnvValue(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


