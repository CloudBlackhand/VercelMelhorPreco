export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { encode, decode } from "next-auth/jwt";

function parseUrlSafe(url?: string) {
  try {
    const u = new URL(url || "http://localhost:3000/api/auth");
    return { origin: u.origin, pathname: u.pathname, host: u.host };
  } catch {
    return { origin: null, pathname: null, host: null, error: "URL invalida" };
  }
}

export async function GET(request: Request) {
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

  // Testa se NEXTAUTH_SECRET consegue assinar e verificar um JWT (igual o login faz).
  let jwtTest: { ok: boolean; error?: string; secretLength?: number; secretHasQuotes?: boolean } = { ok: false };
  if (process.env.NEXTAUTH_SECRET) {
    try {
      const secret = process.env.NEXTAUTH_SECRET;
      const token = await encode({ token: { test: true } as any, secret, maxAge: 60 });
      const decoded = await decode({ token, secret });
      if (decoded && (decoded as any).test === true) {
        jwtTest = {
          ok: true,
          secretLength: secret.length,
          secretHasQuotes: secret.startsWith('"') || secret.endsWith('"'),
        };
      } else {
        jwtTest = { ok: false, error: "decode nao retornou payload esperado" };
      }
    } catch (err: any) {
      jwtTest = { ok: false, error: err?.message || String(err) };
    }
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const detectedOrigin = `https://${forwardedHost ?? host ?? "unknown"}`;

  return NextResponse.json({
    env: {
      databaseUrlSet,
      nextauthSecretSet,
      adminEmailSet,
      adminPasswordSet,
      nextauthUrlSet,
      vercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV,
    },
    request: {
      forwardedProto,
      forwardedHost,
      host,
      detectedOrigin,
    },
    nextauthUrl: parseUrlSafe(process.env.NEXTAUTH_URL),
    db: {
      connected: dbConnected,
      error: dbError,
      adminCount,
      adminExists,
      passwordMatches,
    },
    jwt: jwtTest,
  });
}
