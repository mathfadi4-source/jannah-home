"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Package, ShoppingBag, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { SITE } from "@/lib/site";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MobileNav({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: `/${locale}`, label: dict.nav.home, Icon: Home },
    { href: `/${locale}#products`, label: dict.nav.products, Icon: Package },
    { href: `/${locale}/commander`, label: dict.nav.order, Icon: ShoppingBag },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.nav.menu}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-background cursor-pointer"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-primary-dark/50 backdrop-blur-sm animate-scale-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 w-[86%] max-w-sm bg-surface shadow-2xl flex flex-col animate-scale-in border-s border-border">
            <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
              <Logo href={`/${locale}`} tagline={dict.siteTagline} markSize={38} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.nav.close}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground hover:bg-border cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 p-4">
              {links.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname === `${href}/`;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-foreground border border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-white" : "text-accent-dark"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4">
              <p className="brand-eyebrow mb-2 text-muted">{dict.nav.language}</p>
              <LanguageSwitcher currentLocale={locale} />
            </div>

            <div className="mt-auto border-t border-border bg-white p-4 space-y-3">
              <Link
                href={`/${locale}/commander`}
                className="btn btn-primary w-full text-base py-3"
              >
                <ShoppingBag className="h-5 w-5" />
                {dict.nav.order}
              </Link>
              <a
                href={`tel:${SITE.whatsappPhone}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                {SITE.displayPhone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
