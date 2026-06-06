import { CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";

export default async function BookingHomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/booking");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-border/60 bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="flex items-center gap-3 text-primary">
          <CalendarDays className="h-7 w-7" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Client access</p>
        </div>
        <h1 className="mt-6 font-display text-4xl text-card-foreground">Booking</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {session?.user.name
            ? `You're signed in as ${session.user.name}.`
            : "You're signed in."}{" "}
          The full booking calendar arrives in the next phase, but the protected booking entry route is ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/booking/package"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Package Booking
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
