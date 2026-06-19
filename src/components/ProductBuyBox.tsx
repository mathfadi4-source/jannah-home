"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatPrice, getEffectivePrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/order-message";
import { SITE } from "@/lib/site";

type Product = {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
};

export default function ProductBuyBox({
  locale,
  dict,
  product,
}: {
  locale: Locale;
  dict: Dictionary;
  product: Product;
}) {
  const [quantity, setQuantity] = useState(1);
  const unitPrice = getEffectivePrice(product);
  const hasPromo = product.promoPrice != null && product.promoPrice < product.price;

  const inquiry =
    locale === "ar"
      ? `مرحباً، أنا مهتم بـ: ${product.name} ×${quantity} — ${unitPrice.toFixed(0)} TND. هل هو متوفر؟`
      : `Bonjour, je suis intéressé(e) par : ${product.name} ×${quantity} — ${unitPrice.toFixed(0)} TND. Est-il disponible ?`;
  const waHref = buildWhatsAppUrl(SITE.whatsappPhone, inquiry);

  return (
    <div className="card p-6 bg-background border-accent-light">
      <div className="flex items-center gap-4 flex-wrap mb-5">
        <span className="font-display text-4xl font-bold text-primary">
          {formatPrice(unitPrice, locale)}
        </span>
        {hasPromo && (
          <>
            <span className="text-xl text-muted-soft line-through">
              {formatPrice(product.price, locale)}
            </span>
            <span className="badge bg-danger text-white">{dict.product.promo}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <span className="text-sm font-medium text-foreground">{dict.product.quantity}</span>
        <div className="flex items-center rounded-lg border border-border bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="-"
            className="flex h-10 w-10 items-center justify-center text-muted hover:text-primary cursor-pointer disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="+"
            className="flex h-10 w-10 items-center justify-center text-muted hover:text-primary cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href={`/${locale}/commander?produit=${product.id}`}
          className="btn btn-primary w-full py-3.5 text-base"
        >
          <ShoppingBag className="h-5 w-5" />
          {dict.product.orderThis}
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp w-full py-3.5 text-base"
        >
          <MessageCircle className="h-5 w-5" />
          {dict.product.orderWhatsapp}
        </a>
      </div>
    </div>
  );
}
