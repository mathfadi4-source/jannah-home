import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import ProductGallery from "@/components/ProductGallery";
import ProductBuyBox from "@/components/ProductBuyBox";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { title: "Produit" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale: localeParam, id } = await params;
  const locale = (isValidLocale(localeParam) ? localeParam : "fr") as Locale;
  const dict = await getDictionary(locale);

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || !product.active) notFound();

  const category =
    dict.categories[product.category as keyof typeof dict.categories] ??
    product.category;

  const benefits = [dict.product.benefit1, dict.product.benefit2, dict.product.benefit3];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href={`/${locale}#products`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.product.back}
      </Link>

      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div className="md:sticky md:top-24">
          <ProductGallery
            imageUrl={product.imageUrl}
            videoUrl={product.videoUrl}
            name={product.name}
            dict={dict}
          />
        </div>

        <div className="flex flex-col">
          <span className="badge bg-accent-light/50 text-primary mb-4 w-fit">{category}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-muted mb-6 leading-relaxed text-lg">{product.description}</p>
          )}

          <ProductBuyBox locale={locale} dict={dict} product={product} />

          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground mb-3">
              {dict.product.benefitsTitle}
            </p>
            <ul className="space-y-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
