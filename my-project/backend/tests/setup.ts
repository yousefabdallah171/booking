import { execSync } from "child_process";
import { beforeAll } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/booking_dev";
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
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;

beforeAll(() => {
  try {
    execSync("pnpm prisma db push --force-reset --skip-generate", { stdio: "inherit" });
  } catch (error) {
    console.warn("Skipping Prisma reset during tests:", error instanceof Error ? error.message : error);
  }
});
