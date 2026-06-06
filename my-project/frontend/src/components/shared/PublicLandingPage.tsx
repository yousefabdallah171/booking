import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function PublicLandingPage() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-[var(--color-surface)]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo width={160} height={38} />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {tNav("login")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-24 animate-fade-in">
        <div className="space-y-6 text-center">
          <h1 className="font-display text-5xl text-foreground sm:text-6xl">{t("headline")}</h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">{t("subheadline")}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/booking"
              className="inline-flex h-11 items-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("bookSingle")}
            </Link>
            <Link
              href="/booking/package"
              className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-8 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("bookPackage")}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 animate-fade-in-stagger">
          <div className="rounded-lg border border-border bg-card p-8">
            <h2 className="font-display text-2xl text-card-foreground">{t("singleSession")}</h2>
            <p className="mt-3 text-muted-foreground">{t("singleSessionDesc")}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8">
            <h2 className="font-display text-2xl text-card-foreground">{t("package")}</h2>
            <p className="mt-3 text-muted-foreground">{t("packageDesc")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
