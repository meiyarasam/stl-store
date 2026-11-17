import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

/**
 * Transforms NextAuth session-token cookies into true non-persistent browser-session cookies.
 * By stripping `Expires` and `Max-Age` from active session cookies, standard browsers purge the
 * cookie from memory when the browser/website is closed instead of saving it persistently to disk.
 */
function convertToSessionCookies(response: Response): Response {
  const setCookies = response.headers.getSetCookie?.() || [];
  if (setCookies.length === 0) return response;

  const newHeaders = new Headers(response.headers);
  newHeaders.delete("Set-Cookie");

  for (const cookieStr of setCookies) {
    const isSessionToken = cookieStr.includes("next-auth.session-token");
    const isDeletion = cookieStr.includes("Max-Age=0") || cookieStr.includes("1970");

    if (isSessionToken && !isDeletion) {
      // Strip Expires and Max-Age attributes so the browser treats it as a non-persistent Session Cookie
      const sessionCookie = cookieStr
        .replace(/Expires=[^;]+;?\s*/gi, "")
        .replace(/Max-Age=[^;]+;?\s*/gi, "")
        .replace(/;\s*;/g, ";")
        .trim();
      newHeaders.append("Set-Cookie", sessionCookie);
    } else {
      // Keep deletion cookies and non-session cookies as-is
      newHeaders.append("Set-Cookie", cookieStr);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

async function handler(req: NextRequest, ctx: any) {
  const response = await nextAuthHandler(req, ctx);
  return convertToSessionCookies(response);
}

export { handler as GET, handler as POST };
