import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
        <section className="w-full rounded-3xl border border-destructive/30 bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <div className="flex items-center gap-3 text-destructive">
            <ShieldCheck className="h-7 w-7" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">Access denied</p>
          </div>
          <h1 className="mt-6 font-display text-4xl text-card-foreground">Forbidden</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            This area is only available to administrators.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Booking
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border/60 bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="h-7 w-7" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">
            {session?.user.role} access
          </p>
        </div>
        <h1 className="mt-6 font-display text-4xl text-card-foreground">Admin Dashboard</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {session?.user.name
            ? `Welcome back, ${session.user.name}.`
            : "Welcome back."}{" "}
          The full admin workspace lands in the next phase, but authentication and role enforcement are live now.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/calendar"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Calendar
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}
