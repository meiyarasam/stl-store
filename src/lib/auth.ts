import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/database/prisma";

// Configurable session inactivity timeout in minutes (default: 30 minutes)
const INACTIVITY_TIMEOUT_MINUTES = Number(
  process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || 30
);
export const SESSION_INACTIVITY_TIMEOUT_SECONDS = Number(
  process.env.SESSION_INACTIVITY_TIMEOUT_SECONDS || INACTIVITY_TIMEOUT_MINUTES * 60
);

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
    maxAge: SESSION_INACTIVITY_TIMEOUT_SECONDS, // 30 minutes (1800s)
    updateAge: 60, // Sliding window: refresh token on activity after 60s
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      const now = Math.floor(Date.now() / 1000);

      // On initial login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.country = (user as any).country || "US";
        token.lastActive = now;
        (token as any).isExpired = false;
        return token;
      }

      // Explicit trigger from client to keep session alive
      if (trigger === "update") {
        token.lastActive = now;
        (token as any).isExpired = false;
        return token;
      }

      // Server-side inactivity check:
      // If lastActive timestamp exists and elapsed time exceeds timeout, mark token expired
      if (token.lastActive && typeof token.lastActive === "number") {
        const elapsed = now - token.lastActive;
        if (elapsed > SESSION_INACTIVITY_TIMEOUT_SECONDS) {
          (token as any).isExpired = true;
          return token;
        }
      }

      // Slide window: update lastActive if more than 30s have elapsed
      if (!token.lastActive || now - (token.lastActive as number) >= 30) {
        token.lastActive = now;
      }

      return token;
    },

    async session({ session, token }) {
      // Invalidate session if token is missing or expired
      if (!token || !token.id || (token as any).isExpired) {
        return null as any;
      }

      if (session?.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role =
          (token.role as string) || "CUSTOMER";
        (session.user as any).country =
          (token.country as string) || "US";
        (session.user as any).lastActive = token.lastActive;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs on the current origin
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.origin === baseObj.origin) {
          return url;
        }
      } catch {
        // invalid URL fallback
      }
      return baseUrl;
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
