import crypto from "node:crypto";

import { env } from "../lib/env.js";

const PAYMOB_API_BASE_URL = "https://accept.paymob.com/api";

type FetchLike = typeof fetch;

type PaymobBillingData = {
  apartment?: string;
  building?: string;
  city?: string;
  country?: string;
  email?: string;
  first_name?: string;
  floor?: string;
  last_name?: string;
  phone_number?: string;
  postal_code?: string;
  state?: string;
  street?: string;
};

type RegisterOrderInput = {
  amountCents: number;
  authToken: string;
  deliveryNeeded?: boolean;
  items?: Array<Record<string, unknown>>;
  merchantOrderId?: string;
};

type RequestPaymentKeyInput = {
  amountCents: number;
  authToken: string;
  billingData?: PaymobBillingData;
  currency?: string;
  expiration?: number;
  orderId: number;
};

const DEFAULT_BILLING_DATA: Required<PaymobBillingData> = {
  apartment: "NA",
  building: "NA",
  city: "Cairo",
  country: "EG",
  email: "noreply@example.com",
  first_name: "Consultation",
  floor: "NA",
  last_name: "Booking",
  phone_number: "+201000000000",
  postal_code: "00000",
  state: "Cairo",
  street: "NA",
};

async function paymobRequest<TResponse>(
  path: string,
  body: Record<string, unknown>,
  fetchImpl: FetchLike = fetch,
) {
  const response = await fetchImpl(`${PAYMOB_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Paymob request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function createAuthToken(fetchImpl?: FetchLike) {
  const response = await paymobRequest<{ token: string }>(
    "/auth/tokens",
    { api_key: env.PAYMOB_API_KEY },
    fetchImpl,
  );

  return response.token;
}

export async function registerOrder(
  { amountCents, authToken, deliveryNeeded = false, items = [], merchantOrderId }: RegisterOrderInput,
  fetchImpl?: FetchLike,
) {
  const response = await paymobRequest<{ id: number }>(
    "/ecommerce/orders",
    {
      auth_token: authToken,
      amount_cents: amountCents,
      currency: "EGP",
      delivery_needed: deliveryNeeded,
      items,
      merchant_order_id: merchantOrderId,
    },
    fetchImpl,
  );

  return response.id;
}

export async function requestPaymentKey(
  {
    amountCents,
    authToken,
    billingData,
    currency = "EGP",
    expiration = 3600,
    orderId,
  }: RequestPaymentKeyInput,
  fetchImpl?: FetchLike,
) {
  const response = await paymobRequest<{ token: string }>(
    "/acceptance/payment_keys",
    {
      amount_cents: amountCents,
      auth_token: authToken,
      billing_data: {
        ...DEFAULT_BILLING_DATA,
        ...billingData,
      },
      currency,
      expiration,
      integration_id: Number(env.PAYMOB_INTEGRATION_ID),
      order_id: orderId,
    },
    fetchImpl,
  );

  return response.token;
}

export function buildIframeRedirectUrl(paymentToken: string) {
  const iframeId = encodeURIComponent(env.PAYMOB_IFRAME_ID);
  const token = encodeURIComponent(paymentToken);

  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${token}`;
}

function getValueAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (value === null || typeof value !== "object") {
      return "";
    }

    return (value as Record<string, unknown>)[segment];
  }, source);
}

function normalizeHmacValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function flattenPayload(source: unknown, prefix = ""): Array<{ key: string; value: string }> {
  if (source === null || typeof source !== "object" || source instanceof Date) {
    return [{ key: prefix, value: normalizeHmacValue(source) }];
  }

  return Object.entries(source)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([key, value]) => flattenPayload(value, prefix ? `${prefix}.${key}` : key));
}

export function verifyHmac(payload: unknown, expectedHmac: string, fieldOrder?: string[]) {
  const message = fieldOrder?.length
    ? fieldOrder.map((field) => normalizeHmacValue(getValueAtPath(payload, field))).join("")
    : flattenPayload(payload)
        .sort((left, right) => left.key.localeCompare(right.key))
        .map(({ value }) => value)
        .join("");

  const digest = crypto.createHmac("sha512", env.PAYMOB_HMAC_SECRET).update(message).digest("hex");
  const normalizedExpectedHmac = expectedHmac.toLowerCase();

  if (digest.length !== normalizedExpectedHmac.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(normalizedExpectedHmac));
}
