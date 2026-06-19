"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Package, ShoppingBag, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { SITE } from "@/lib/site";
import Logo from "@/components/Logo";

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
            className="absolute inset-0 bg-black/40 animate-scale-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 w-[82%] max-w-xs bg-white shadow-xl flex flex-col animate-scale-in">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo withText={false} markSize={40} />
              <span className="sr-only">{dict.siteName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.nav.close}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-background cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {links.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-background hover:text-primary transition-colors"
                >
                  <Icon className="h-5 w-5 text-accent-dark" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-border p-4 space-y-3">
              <Link
                href={`/${locale}/commander`}
                className="btn btn-primary w-full"
              >
                <ShoppingBag className="h-4 w-4" />
                {dict.nav.order}
              </Link>
              <a
                href={`tel:${SITE.whatsappPhone}`}
                className="flex items-center justify-center gap-2 text-sm text-muted hover:text-primary"
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
