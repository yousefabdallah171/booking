import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  setRequestLocale(locale);

  return children;
}
