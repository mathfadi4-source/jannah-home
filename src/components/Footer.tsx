import Link from "next/link";
import { MessageCircle, Phone, Clock, MapPin, ShieldCheck } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { SITE } from "@/lib/site";
import Logo from "@/components/Logo";
import { buildWhatsAppUrl } from "@/lib/order-message";

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export default function Footer({ locale, dict }: FooterProps) {
  const waHref = buildWhatsAppUrl(SITE.whatsappPhone, "");

  return (
    <footer className="mt-20 border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo tagline={dict.siteTagline} markSize={42} />
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              {dict.footer.tagline}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs font-medium text-primary">
              <ShieldCheck className="h-4 w-4 text-accent-dark" />
              {dict.footer.paymentNote}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {dict.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-muted hover:text-primary transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#products`} className="text-muted hover:text-primary transition-colors">
                  {dict.nav.products}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/commander`} className="text-muted hover:text-primary transition-colors">
                  {dict.nav.order}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {dict.footer.contact}
            </h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#1ebe5b] hover:text-[#16a34a] font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  {dict.whatsapp.contactCta}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-dark" />
                <a href={`tel:${SITE.whatsappPhone}`} className="hover:text-primary">
                  {SITE.displayPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon className="h-4 w-4 text-accent-dark" />
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {SITE.instagramHandle}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-dark" />
                {dict.footer.hoursValue}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-dark" />
                {dict.footer.locationValue}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted text-center">
            © {new Date().getFullYear()} {dict.siteName} — {dict.footer.rights}
          </p>
          <Link
            href="/admin"
            className="text-xs text-muted-soft hover:text-primary transition-colors border border-border px-3 py-1.5 rounded-lg hover:border-accent"
          >
            {dict.footer.ownerSpace}
          </Link>
        </div>
      </div>
    </footer>
  );
}
