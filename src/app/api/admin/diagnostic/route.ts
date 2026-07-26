export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);
  const nextauthSecretSet = Boolean(process.env.NEXTAUTH_SECRET);
  const adminEmailSet = Boolean(process.env.ADMIN_EMAIL);
  const adminPasswordSet = Boolean(process.env.ADMIN_PASSWORD);
  const nextauthUrlSet = Boolean(process.env.NEXTAUTH_URL);

  let dbConnected = false;
  let adminCount = 0;
  let adminExists = false;
  let passwordMatches = false;
  let dbError: string | null = null;

  if (databaseUrlSet) {
    try {
      await prisma.$connect();
      adminCount = await prisma.adminUser.count();
      const admin = process.env.ADMIN_EMAIL
        ? await prisma.adminUser.findUnique({
            where: { email: process.env.ADMIN_EMAIL },
          })
        : null;
      adminExists = Boolean(admin);
      if (admin && process.env.ADMIN_PASSWORD) {
        passwordMatches = await bcrypt.compare(
          process.env.ADMIN_PASSWORD,
          admin.senhaHash
        );
      }
      dbConnected = true;
    } catch (err: any) {
      dbError = err?.message || String(err);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }

  return NextResponse.json({
    env: {
      databaseUrlSet,
      nextauthSecretSet,
      adminEmailSet,
      adminPasswordSet,
      nextauthUrlSet,
    },
    db: {
      connected: dbConnected,
      error: dbError,
      adminCount,
      adminExists,
      passwordMatches,
    },
  });
}
