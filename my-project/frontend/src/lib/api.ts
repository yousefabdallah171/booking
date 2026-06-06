import { cookies } from "next/headers";

import { auth } from "./auth";
import { env } from "./env";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type SlotDto = {
  id: string;
  startTime: string;
  endTime: string;
  status?: "AVAILABLE" | "BOOKED" | "BLOCKED";
};

export type BookingListItem = {
  id: string;
  clientName?: string;
  clientEmail?: string;
  slotStartTime: string;
  slotEndTime: string;
  type: "SINGLE" | "PACKAGE";
  status: "PENDING" | "CONFIRMED" | "FAILED";
  amountEgp?: number | null;
  meetLink?: string | null;
};

export type PackageTierDto = {
  id: string;
  name: string;
  sessions: number;
  priceEgp: number;
};

function getSessionTokenFromCookies() {
  const store = cookies();
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];

  for (const cookieName of cookieNames) {
    const directMatch = store.get(cookieName)?.value;

    if (directMatch) {
      return directMatch;
    }

    const chunked = store
      .getAll()
      .filter(({ name }) => name.startsWith(`${cookieName}.`))
      .sort((left, right) => left.name.localeCompare(right.name));

    if (chunked.length > 0) {
      return chunked.map(({ value }) => value).join("");
    }
  }

  return null;
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { requiresAuth?: boolean } = {},
) {
  const requiresAuth = options.requiresAuth ?? true;

  if (requiresAuth) {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthenticated request");
    }
  }

  const token = requiresAuth ? getSessionTokenFromCookies() : null;
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "Request failed" : payload.code ?? payload.error);
  }

  return payload.data;
}

export const api = {
  getAvailableSlots(date: string) {
    return apiRequest<{ slots: SlotDto[] }>(`/api/slots?date=${encodeURIComponent(date)}`);
  },
  getAdminSlots(date: string) {
    return apiRequest<{ slots: Required<SlotDto>[] }>(
      `/api/slots/admin?date=${encodeURIComponent(date)}`,
    );
  },
  createSlot(startTime: string) {
    return apiRequest<{ slot: Required<SlotDto> }>("/api/slots", {
      method: "POST",
      body: JSON.stringify({ startTime }),
    });
  },
  generateSlots(input: {
    date: string;
    startTime: string;
    endTime: string;
    intervalMinutes: number;
  }) {
    return apiRequest<{ created: number; skipped: number }>("/api/slots/generate", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  deleteSlot(id: string) {
    return apiRequest<{}>(`/api/slots/${id}`, { method: "DELETE" });
  },
  blockDay(input: { date: string; reason?: string }) {
    return apiRequest<{ blockedDay: { id: string; date: string; reason?: string | null } }>(
      "/api/slots/block-day",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },
  unblockDay(date: string) {
    return apiRequest<{}>(`/api/slots/block-day/${encodeURIComponent(date)}`, {
      method: "DELETE",
    });
  },
  createSingleBooking(slotId: string) {
    return apiRequest<{ bookingId: string; paymobRedirectUrl: string }>("/api/bookings/single", {
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
  },
  createPackageSessionBooking(slotId: string, packageId: string) {
    return apiRequest<{ bookingId: string }>("/api/bookings/package-session", {
      method: "POST",
      body: JSON.stringify({ slotId, packageId }),
    });
  },
  getMyBookings() {
    return apiRequest<{
      upcomingBookings: BookingListItem[];
      activePackage?: {
        id: string;
        tierName: string;
        totalSessions: number;
        sessionsUsed: number;
        sessionsRemaining: number;
      } | null;
    }>("/api/bookings/my");
  },
  getAdminBookings(filters?: {
    status?: "PENDING" | "CONFIRMED" | "FAILED";
    type?: "SINGLE" | "PACKAGE";
    clientId?: string;
    month?: string;
  }) {
    const query = new URLSearchParams(
      Object.entries(filters ?? {}).filter(([, value]) => value !== undefined) as Array<
        [string, string]
      >,
    );

    return apiRequest<{ bookings: BookingListItem[] }>(
      `/api/bookings/admin${query.size ? `?${query.toString()}` : ""}`,
    );
  },
  updateMeetLink(id: string, meetLink: string) {
    return apiRequest<{ booking: { id: string; meetLink: string } }>(
      `/api/bookings/${id}/meet-link`,
      {
        method: "PATCH",
        body: JSON.stringify({ meetLink }),
      },
    );
  },
  getPackageTiers() {
    return apiRequest<{ tiers: PackageTierDto[] }>("/api/packages/tiers");
  },
  createPackageBooking(input: {
    tierId: string;
    intakeForm: {
      skillLevel: string;
      primaryGoal: string;
      expectedOutcomes: string;
      preferredTimeline: string;
    };
  }) {
    return apiRequest<{ packageId: string; paymobRedirectUrl: string }>("/api/packages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  bookPackageSession(input: { slotId: string; packageId: string }) {
    return apiRequest<{ bookingId: string }>("/api/packages/book-session", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  getPricing() {
    return apiRequest<{ defaultPriceEgp: number; tiers: PackageTierDto[] }>("/api/pricing");
  },
  updateDefaultPrice(amountEgp: number) {
    return apiRequest<{ newPrice: number }>("/api/pricing/default", {
      method: "PUT",
      body: JSON.stringify({ amountEgp }),
    });
  },
  updateTierPrice(tierId: string, priceEgp: number) {
    return apiRequest<{ tier: PackageTierDto }>(`/api/pricing/tier/${tierId}`, {
      method: "PUT",
      body: JSON.stringify({ priceEgp }),
    });
  },
  updateClientPrice(clientId: string, amountEgp: number | null) {
    return apiRequest<{}>(`/api/pricing/client/${clientId}`, {
      method: "PUT",
      body: JSON.stringify({ amountEgp }),
    });
  },
  getClients() {
    return apiRequest<{
      clients: Array<{
        id: string;
        name: string | null;
        email: string;
        bookingCount: number;
        activePackage: boolean;
      }>;
    }>("/api/clients");
  },
  getClient(id: string) {
    return apiRequest<{
      client: {
        id: string;
        name: string | null;
        email: string;
        customPriceEgp: number | null;
        bookings: BookingListItem[];
        packages: Array<{
          id: string;
          tierName: string;
          totalSessions: number;
          sessionsUsed: number;
          status: "ACTIVE" | "COMPLETED";
          intakeForm?: {
            skillLevel: string;
            primaryGoal: string;
            expectedOutcomes: string;
            preferredTimeline: string;
          } | null;
        }>;
      };
    }>(`/api/clients/${id}`);
  },
  getMonthlyReport(year: number, month: number) {
    return apiRequest<{
      report: {
        totalRevenueEgp: number;
        totalRevenueUsd: number;
        totalConfirmedSessions: number;
        topClients: Array<{
          clientName: string;
          clientEmail: string;
          bookingCount: number;
        }>;
      };
    }>(`/api/reports/monthly?year=${year}&month=${month}`);
  },
};
