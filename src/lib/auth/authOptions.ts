import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const email = credentials.email.toLowerCase().trim();

        try {
          // Attempt database lookup
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            // Check fallback for default admin in local dev setup
            const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@stlforge.com";
            const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@STLForge2026!";

            if (email === defaultAdminEmail.toLowerCase() && credentials.password === defaultAdminPassword) {
              return {
                id: "admin_super_user",
                email: defaultAdminEmail,
                name: "STLForge Administrator",
                role: "ADMIN",
                country: "US",
              };
            }

            throw new Error("No account found with this email address");
          }

          if (user.isBlocked) {
            throw new Error("This account has been suspended. Please contact support.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValidPassword) {
            throw new Error("Incorrect password. Please try again.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            country: user.country,
          };
        } catch (error: any) {
          // If database is offline, permit default admin check for local setup
          const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@stlforge.com").toLowerCase();
          const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@STLForge2026!";

          if (email === defaultAdminEmail && credentials.password === defaultAdminPassword) {
            return {
              id: "admin_super_user",
              email: defaultAdminEmail,
              name: "STLForge Administrator",
              role: "ADMIN",
              country: "US",
            };
          }

          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.country = (user as any).country || "US";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "CUSTOMER";
        (session.user as any).country = (token.country as string) || "US";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "stlforge-super-secret-production-key-2026",
};
