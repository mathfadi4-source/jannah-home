"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/order-message";
import type { Locale } from "@/i18n/config";

const GREETING: Record<Locale, string> = {
  fr: "Bonjour 👋, je vous contacte au sujet de Jannah Home.",
  ar: "مرحباً 👋، أتواصل معكم بخصوص Jannah Home.",
};

export default function WhatsAppFab({
  locale,
  tooltip,
}: {
  locale: Locale;
  tooltip: string;
}) {
  const [open, setOpen] = useState(true);
  const href = buildWhatsAppUrl(SITE.whatsappPhone, GREETING[locale] ?? GREETING.fr);

  return (
    <div className="fixed z-50 bottom-5 ltr:right-5 rtl:left-5 flex items-center gap-2 ltr:flex-row-reverse rtl:flex-row">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={tooltip}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:scale-105 cursor-pointer"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25d366] opacity-30" />
        <MessageCircle className="relative h-7 w-7" strokeWidth={2.2} />
      </a>

      {open && (
        <div className="animate-scale-in flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-md ring-1 ring-border">
          <span>{tooltip}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="text-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
