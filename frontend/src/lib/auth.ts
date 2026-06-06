import crypto from "node:crypto";

import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { env } from "./env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "ADMIN" | "CLIENT";
};

function isRole(value: unknown): value is AppUser["role"] {
  return value === "ADMIN" || value === "CLIENT";
}

type SessionTokenPayload = {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role: "ADMIN" | "CLIENT";
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return Buffer.from(padded, "base64").toString("utf8");
}

function signJwt(payload: SessionTokenPayload) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", env.AUTH_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${header}.${encodedPayload}.${signature}`;
}

function verifyJwt(token: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    return null;
  }

  let decodedPayload: SessionTokenPayload;

  try {
    decodedPayload = JSON.parse(base64UrlDecode(payload)) as SessionTokenPayload;
  } catch {
    return null;
  }

  if (decodedPayload.exp * 1000 <= Date.now()) {
    return null;
  }

  return decodedPayload;
}

async function verifyCredentials(email: string, password: string): Promise<AppUser | null> {
  const response = await fetch(`${env.BACKEND_URL}/api/auth/verify-credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: { user: AppUser };
  };

  return payload.success ? payload.data?.user ?? null : null;
}

const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
            profile(profile) {
              return {
                id: String(profile.sub ?? profile.id),
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: "CLIENT" as const,
              };
            },
          }),
        ]
      : []),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        return verifyCredentials(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && isRole(token.role)) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
      }

      return session;
    },
  },
  jwt: {
    async encode({ token, maxAge }) {
      if (!token?.sub || !isRole(token.role)) {
        return "";
      }

      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresAt = issuedAt + (maxAge ?? 30 * 24 * 60 * 60);

      return signJwt({
        sub: token.sub,
        name: token.name ?? null,
        email: token.email ?? null,
        picture: (typeof token.picture === "string" ? token.picture : null) ?? null,
        role: token.role,
        iat: issuedAt,
        exp: expiresAt,
      });
    },
    async decode({ token }) {
      if (!token) {
        return null;
      }

      const payload = verifyJwt(token);

      if (!payload) {
        return null;
      }

      return {
        sub: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
