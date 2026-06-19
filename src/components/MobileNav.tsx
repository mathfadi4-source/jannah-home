"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Package, ShoppingBag, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { SITE } from "@/lib/site";
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
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#f6eee2] animate-scale-in"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={dict.nav.close}
            className="absolute top-4 ltr:right-4 rtl:left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-foreground shadow-md hover:bg-background cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex-1 overflow-y-auto px-6 pt-14 pb-6 flex flex-col">
            <Link
              href={`/${locale}`}
              className="mx-auto mb-8 block w-40 max-w-[45vw]"
              aria-label={dict.siteName}
            >
              <Image
                src="/images/logo.jpg"
                alt="Jannah Home"
                width={320}
                height={320}
                priority
                className="h-auto w-full rounded-2xl shadow-sm"
              />
            </Link>

            <nav className="flex flex-col gap-3">
              {links.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname === `${href}/`;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold transition-all ${
                      active
                        ? "bg-primary text-white shadow-md"
                        : "bg-white/90 text-foreground shadow-sm hover:bg-white hover:text-primary"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${active ? "text-white" : "text-accent-dark"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 text-center">
              <p className="brand-eyebrow mb-3 text-muted">{dict.nav.language}</p>
              <div className="flex justify-center">
                <LanguageSwitcher currentLocale={locale} />
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 bg-white/70 backdrop-blur px-6 py-5 space-y-3">
            <Link
              href={`/${locale}/commander`}
              className="btn btn-primary w-full text-base py-3.5"
            >
              <ShoppingBag className="h-5 w-5" />
              {dict.nav.order}
            </Link>
            <a
              href={`tel:${SITE.whatsappPhone}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              {SITE.displayPhone}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
