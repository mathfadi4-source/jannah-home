import Link from "next/link";
import { ShoppingBag, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileNav from "@/components/MobileNav";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/site";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export default function Header({ locale, dict }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Logo href={`/${locale}`} tagline={dict.siteTagline} markSize={44} />

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href={`/${locale}`}
            className="hidden md:inline text-sm font-medium text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background"
          >
            {dict.nav.home}
          </Link>
          <Link
            href={`/${locale}#products`}
            className="hidden md:inline text-sm font-medium text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background"
          >
            {dict.nav.products}
          </Link>
          <a
            href={`tel:${SITE.whatsappPhone}`}
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-background"
          >
            <Phone className="h-4 w-4" />
            {SITE.displayPhone}
          </a>

          <LanguageSwitcher currentLocale={locale} />

          <Link
            href={`/${locale}/commander`}
            className="hidden sm:inline-flex btn btn-primary text-sm py-2 px-4 whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4" />
            {dict.nav.order}
          </Link>

          <MobileNav locale={locale} dict={dict} />
        </nav>
      </div>
    </header>
  );
}
