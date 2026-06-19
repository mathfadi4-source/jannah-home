import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatPrice, getEffectivePrice } from "@/lib/utils";

type ProductCardProps = {
  locale: Locale;
  dict: Dictionary;
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    promoPrice: number | null;
    imageUrl: string | null;
  };
};

export default function ProductCard({ locale, dict, product }: ProductCardProps) {
  const effectivePrice = getEffectivePrice(product);
  const hasPromo = product.promoPrice != null && product.promoPrice < product.price;
  const discountPct = hasPromo
    ? Math.round((1 - product.promoPrice! / product.price) * 100)
    : 0;
  const category =
    dict.categories[product.category as keyof typeof dict.categories] ?? product.category;

  return (
    <article className="card card-hover group cursor-pointer">
      <Link href={`/${locale}/produit/${product.id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-[#f5ede0]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="product-image-fallback h-full">
              <svg viewBox="0 0 24 24" fill="none" className="h-14 w-14 text-accent-dark/40" aria-hidden="true">
                <path d="M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6M3 18h18M3 18v2m18-2v2M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          {hasPromo && (
            <span className="absolute top-3 start-3 badge bg-danger text-white shadow-md">
              −{discountPct}%
            </span>
          )}
        </div>

        <div className="p-5">
          <span className="badge bg-accent-light/40 text-primary mb-2">{category}</span>
          <h3 className="font-semibold text-lg mb-1.5 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted line-clamp-2 mb-4">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-primary text-xl">
                {formatPrice(effectivePrice, locale)}
              </span>
              {hasPromo && (
                <span className="text-sm text-muted-soft line-through">
                  {formatPrice(product.price, locale)}
                </span>
              )}
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-accent-dark opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
