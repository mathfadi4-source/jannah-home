"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  function getLocalizedPath(locale: Locale) {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    return segments.join("/") || `/${locale}`;
  }

  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background p-0.5">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(locale)}
          className={`px-2.5 py-1.5 text-xs sm:text-sm rounded-md transition-all ${
            locale === currentLocale
              ? "bg-primary text-white font-semibold shadow-sm"
              : "text-muted hover:text-primary hover:bg-white"
          }`}
        >
          {locale === "fr" ? "FR" : "عربي"}
        </Link>
      ))}
    </div>
  );
}
