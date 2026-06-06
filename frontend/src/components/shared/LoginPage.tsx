"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

const isGoogleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

export function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(
    searchParams.get("error") ? t("invalidCredentials") : null,
  );
  const [isGooglePending, startGoogleTransition] = useTransition();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(values: LoginValues) {
    setAuthError(null);

    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (!response || response.error) {
      setAuthError(t("invalidCredentials"));
      return;
    }

    router.replace(response.url ?? callbackUrl);
    router.refresh();
  }

  function onGoogleSignIn() {
    startGoogleTransition(async () => {
      await signIn("google", { redirectTo: callbackUrl });
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo width={170} height={42} />
          <h1 className="mt-6 font-display text-3xl text-card-foreground">{t("login")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "ar"
              ? "سجل دخولك للمتابعة إلى الحجز أو لوحة الإدارة."
              : "Sign in to continue to booking or the admin workspace."}
          </p>
        </div>

        {isGoogleEnabled ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="mb-6 h-11 w-full"
              onClick={onGoogleSignIn}
              disabled={isGooglePending || isSubmitting}
              aria-label="Continue with Google"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="me-2 h-4 w-4">
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v2.98h5.36c-.23 1.48-1.78 4.35-5.36 4.35-3.22 0-5.84-2.66-5.84-5.93S8.78 6.57 12 6.57c1.84 0 3.07.78 3.77 1.45l2.57-2.49C16.7 4.01 14.56 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.59-.07-1.04-.15-1.1Z"
                />
              </svg>
              {t("loginWithGoogle")}
            </Button>

            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              <span className="h-px flex-1 bg-border" />
              <span>{locale === "ar" ? "أو" : "or"}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <div data-field="email" className="space-y-2">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-label="Email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">{t("password")}</Label>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                {t("forgotPassword")}
              </Link>
            </div>
            <div data-field="password" className="space-y-2">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-label="Password"
                {...register("password")}
              />
              {errors.password ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
          </div>

          {authError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {authError}
            </p>
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={isSubmitting || isGooglePending}
            aria-label="Sign in"
          >
            <LogIn className="me-2 h-4 w-4" />
            {isSubmitting ? (locale === "ar" ? "جارٍ تسجيل الدخول..." : "Signing in...") : t("login")}
          </Button>
        </form>
      </div>
    </div>
  );
}
