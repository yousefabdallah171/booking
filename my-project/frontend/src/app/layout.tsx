import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consultation Booking - Youssef Abdallah",
  description: "Book your professional consultation session",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      style={
        {
          "--font-display": '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
          "--font-body": '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
          "--font-arabic": '"Tahoma", "Arial", sans-serif',
        } as React.CSSProperties
      }
    >
      <body className={locale === "ar" ? "font-arabic antialiased" : "font-body antialiased"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
