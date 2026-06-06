"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: "ar" | "en") {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  const nextLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "عر";

  return (
    <button
      onClick={() => switchLocale(nextLocale as "ar" | "en")}
      disabled={isPending}
      className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-md border border-border bg-transparent px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      aria-label={`Switch to ${nextLocale === "ar" ? "Arabic" : "English"}`}
    >
      {label}
    </button>
  );
}
