import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "youseabdallah866@gmail.com";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? "changeme123";
  const clientEmail = process.env.CLIENT_TEST_EMAIL ?? "testclient@example.com";
  const clientPassword = process.env.CLIENT_TEST_PASSWORD ?? "Client@1234";
  const resetSeedPasswords = process.env.RESET_SEED_PASSWORDS === "true";

  const [adminPasswordHash, clientPasswordHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(clientPassword, 12),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Youssef",
      role: "ADMIN",
      ...(resetSeedPasswords ? { password: adminPasswordHash } : {}),
    },
    create: {
      email: adminEmail,
      name: "Youssef",
      role: "ADMIN",
      password: adminPasswordHash,
    },
  });

  console.log(`Admin user: ${admin.email}`);

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: {
      name: "Test Client",
      role: "CLIENT",
      ...(resetSeedPasswords ? { password: clientPasswordHash } : {}),
    },
    create: {
      email: clientEmail,
      name: "Test Client",
      role: "CLIENT",
      password: clientPasswordHash,
    },
  });

  console.log(`Client user: ${client.email}`);

  const tier6 = await prisma.packageTier.upsert({
    where: { name: "6-Session Package" },
    update: {},
    create: {
      name: "6-Session Package",
      sessions: 6,
      priceEgp: 0,
      isActive: true,
    },
  });

  const tier10 = await prisma.packageTier.upsert({
    where: { name: "10-Session Package" },
    update: {},
    create: {
      name: "10-Session Package",
      sessions: 10,
      priceEgp: 0,
      isActive: true,
    },
  });

  console.log(`Package tiers: ${tier6.name}, ${tier10.name}`);

  await prisma.systemConfig.upsert({
    where: { key: "SINGLE_SESSION_PRICE_EGP" },
    update: {},
    create: { key: "SINGLE_SESSION_PRICE_EGP", value: "0" },
  });

  await prisma.systemConfig.upsert({
    where: { key: "USD_EXCHANGE_RATE" },
    update: {},
    create: { key: "USD_EXCHANGE_RATE", value: "31.00" },
  });

  console.log("SystemConfig defaults seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
