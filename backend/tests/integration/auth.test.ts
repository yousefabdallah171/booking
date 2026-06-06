import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/booking_test";
process.env.DATABASE_URL_TEST ??= "postgresql://postgres:postgres@localhost:5432/booking_test";
process.env.AUTH_SECRET ??= "test-auth-secret-test-auth-secret";
process.env.PAYMOB_API_KEY ??= "test-paymob-key";
process.env.PAYMOB_INTEGRATION_ID ??= "12345";
process.env.PAYMOB_IFRAME_ID ??= "67890";
process.env.PAYMOB_HMAC_SECRET ??= "test-paymob-hmac-secret";
process.env.RESEND_API_KEY ??= "re_test_key";
process.env.RESEND_FROM_EMAIL ??= "noreply@example.com";
process.env.CRON_SECRET ??= "test-cron-secret-test-cron-secret";
process.env.ADMIN_EMAIL ??= "admin@example.com";
process.env.ADMIN_INITIAL_PASSWORD ??= "StrongPass123";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.PORT ??= "4000";

const { createApp } = await import("../../src/app.js");
const { env } = await import("../../src/lib/env.js");
const { prisma } = await import("../../src/lib/prisma.js");
const { adminMiddleware } = await import("../../src/middleware/admin.middleware.js");
const { authMiddleware } = await import("../../src/middleware/auth.middleware.js");

async function createTestServer() {
  const app = express();

  app.get("/protected", authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.get("/admin", authMiddleware, adminMiddleware, (_req, res) => {
    res.json({ success: true });
  });

  const server = await new Promise<import("node:http").Server>((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to create test server");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

async function createAppServer() {
  const app = createApp();

  const server = await new Promise<import("node:http").Server>((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to create app server");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

function createToken(role: "ADMIN" | "CLIENT") {
  return jwt.sign({ role }, env.AUTH_SECRET, { subject: `${role.toLowerCase()}-user-id` });
}

describe("auth middleware", () => {
  it("returns 401 when the token is missing", async () => {
    const server = await createTestServer();

    try {
      const response = await fetch(`${server.baseUrl}/protected`);
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toEqual({ success: false, error: "Unauthorized" });
    } finally {
      await server.close();
    }
  });

  it("returns 401 when the token is invalid", async () => {
    const server = await createTestServer();

    try {
      const response = await fetch(`${server.baseUrl}/protected`, {
        headers: {
          Authorization: "Bearer definitely-not-a-jwt",
        },
      });
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toEqual({ success: false, error: "Unauthorized" });
    } finally {
      await server.close();
    }
  });

  it("allows a valid client token on protected routes", async () => {
    const server = await createTestServer();

    try {
      const response = await fetch(`${server.baseUrl}/protected`, {
        headers: {
          Authorization: `Bearer ${createToken("CLIENT")}`,
        },
      });
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({
        success: true,
        user: {
          id: "client-user-id",
          role: "CLIENT",
        },
      });
    } finally {
      await server.close();
    }
  });

  it("allows a valid admin token on admin routes", async () => {
    const server = await createTestServer();

    try {
      const response = await fetch(`${server.baseUrl}/admin`, {
        headers: {
          Authorization: `Bearer ${createToken("ADMIN")}`,
        },
      });
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ success: true });
    } finally {
      await server.close();
    }
  });

  it("returns 403 when a client token hits an admin route", async () => {
    const server = await createTestServer();

    try {
      const response = await fetch(`${server.baseUrl}/admin`, {
        headers: {
          Authorization: `Bearer ${createToken("CLIENT")}`,
        },
      });
      const payload = await response.json();

      expect(response.status).toBe(403);
      expect(payload).toEqual({ success: false, error: "Forbidden" });
    } finally {
      await server.close();
    }
  });
});

describe("credential verification route", () => {
  it("returns the authenticated user for valid credentials", async () => {
    const server = await createAppServer();
    const email = "testclient@example.com";
    const password = "Client@1234";
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
      where: { email },
      update: {
        password: passwordHash,
        role: "CLIENT",
        name: "Test Client",
      },
      create: {
        email,
        password: passwordHash,
        role: "CLIENT",
        name: "Test Client",
      },
    });

    try {
      const response = await fetch(`${server.baseUrl}/api/auth/verify-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toMatchObject({
        success: true,
        data: {
          user: {
            email,
            role: "CLIENT",
            name: "Test Client",
          },
        },
      });
    } finally {
      await server.close();
    }
  });

  it("returns 401 for invalid credentials", async () => {
    const server = await createAppServer();

    try {
      const response = await fetch(`${server.baseUrl}/api/auth/verify-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "missing@example.com",
          password: "wrongpassword",
        }),
      });
      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toEqual({ success: false, error: "Unauthorized" });
    } finally {
      await server.close();
    }
  });
});
