import { prisma } from "../lib/prisma.js";

const SINGLE_SESSION_PRICE_KEY = "SINGLE_SESSION_PRICE_EGP";

function parseNumericConfig(value: string) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric configuration value: ${value}`);
  }

  return parsed;
}

export async function resolvePrice(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { customPriceEgp: true },
  });

  if (user?.customPriceEgp !== null && user?.customPriceEgp !== undefined) {
    return Number(user.customPriceEgp);
  }

  const config = await prisma.systemConfig.findUnique({
    where: { key: SINGLE_SESSION_PRICE_KEY },
  });

  return parseNumericConfig(config?.value ?? "0");
}

export async function setDefaultPrice(amountEgp: number) {
  const config = await prisma.systemConfig.upsert({
    where: { key: SINGLE_SESSION_PRICE_KEY },
    update: { value: String(amountEgp) },
    create: { key: SINGLE_SESSION_PRICE_KEY, value: String(amountEgp) },
  });

  return parseNumericConfig(config.value);
}

export async function setPackageTierPrice(tierId: string, priceEgp: number) {
  return prisma.packageTier.update({
    where: { id: tierId },
    data: { priceEgp },
  });
}

export async function setClientCustomPrice(clientId: string, amountEgp: number | null) {
  return prisma.user.update({
    where: { id: clientId },
    data: {
      customPriceEgp: amountEgp,
    },
  });
}
