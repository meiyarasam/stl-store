import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password.");
        }

        const email = credentials.email.toLowerCase().trim();

        try {
          // Find the registered user in PostgreSQL
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("No account found with this email address.");
          }

          // Check whether the account is blocked
          if (user.isBlocked) {
            throw new Error(
              "This account has been suspended. Please contact support."
            );
          }

          // Verify password against the stored bcrypt hash
          if (!user.passwordHash) {
            throw new Error("This account does not have a valid password.");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            throw new Error("Incorrect password. Please try again.");
          }

          // Return authenticated user information
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            country: user.country,
          };
        } catch (error: any) {
          console.error("Authentication error:", error);

          throw new Error(
            error.message || "Authentication failed. Please try again."
          );
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role =
          (token.role as string) || "CUSTOMER";
        (session.user as any).country =
          (token.country as string) || "US";
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET,
};