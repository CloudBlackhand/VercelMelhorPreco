import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "[auth] NEXTAUTH_SECRET nao esta configurado. O login vai falhar em producao."
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("[auth] login sem email/senha");
          return null;
        }

        if (!process.env.DATABASE_URL) {
          console.error("[auth] DATABASE_URL nao esta configurado");
          return null;
        }

        try {
          const user = await prisma.adminUser.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.warn("[auth] usuario nao encontrado:", credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.senhaHash);

          if (!isPasswordValid) {
            console.warn("[auth] senha invalida para:", credentials.email);
            return null;
          }

          await prisma.adminUser.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          console.log("[auth] login ok:", credentials.email);
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] erro durante autenticacao:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role;
        }
        return token;
      } catch (err) {
        console.error("[auth] jwt callback error:", err);
        throw err;
      }
    },
    async session({ session, token }) {
      try {
        if (!session.user) {
          session.user = {} as any;
        }
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
        return session;
      } catch (err) {
        console.error("[auth] session callback error:", err);
        throw err;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

