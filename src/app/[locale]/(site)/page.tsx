import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import CategoryTiles from "@/components/CategoryTiles";
import ProductGrid from "@/components/ProductGrid";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";
import { getEffectivePrice } from "@/lib/utils";

const SITE_URL = "https://jannah-home.vercel.app";

// Always render from the live database so newly added/edited products and their
// images appear immediately (the parent layout's generateStaticParams would
// otherwise cause this page to be statically cached at build time).
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = (isValidLocale(localeParam) ? localeParam : "fr") as Locale;
  const dict = await getDictionary(locale);

  const [products, promotions] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.promotion.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const heroImages = products
    .filter((p) => p.imageUrl)
    .slice(0, 3)
    .map((p) => p.imageUrl as string);

  // Representative image per category, taken from the most recent product that
  // has one (falls back to brand artwork inside CategoryTiles when absent).
  const categoryImageFor = (cat: string) =>
    products.find((p) => p.category === cat && p.imageUrl)?.imageUrl ?? null;
  const categoryImages = {
    COUETTE: categoryImageFor("COUETTE"),
    DRAP: categoryImageFor("DRAP"),
    PARURE: categoryImageFor("PARURE"),
  };

  const toAbsolute = (url: string) =>
    url.startsWith("http") ? url : `${SITE_URL}${url}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Jannah Home",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/jannah-home-logo.png`,
        slogan: "Confort Naturel",
        sameAs: [SITE.instagram],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${SITE.whatsappPhone}`,
          contactType: "customer service",
          areaServed: "TN",
          availableLanguage: ["fr", "ar"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Jannah Home",
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        itemListElement: products.slice(0, 12).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description ?? undefined,
            image: p.imageUrl ? toAbsolute(p.imageUrl) : undefined,
            url: `${SITE_URL}/${locale}/produit/${p.id}`,
            offers: {
              "@type": "Offer",
              price: getEffectivePrice(p),
              priceCurrency: "TND",
              availability: "https://schema.org/InStock",
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero locale={locale} dict={dict} images={heroImages} />

      <div className="max-w-6xl mx-auto px-4">
        {/* Trust bar */}
        <div className="-mt-10 relative z-10">
          <TrustBar dict={dict} />
        </div>

        {/* Categories */}
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="section-title">{dict.home.categoriesTitle}</h2>
            <p className="text-muted">{dict.home.categoriesSubtitle}</p>
          </div>
          <CategoryTiles locale={locale} dict={dict} images={categoryImages} />
        </section>

        {/* Promotions */}
        {promotions.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <h2 className="section-title flex items-center gap-2">
                <Tag className="h-6 w-6 text-accent-dark" />
                {dict.home.promotions}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {promotions.map((promo) => (
                <div key={promo.id} className="promo-banner card p-6">
                  <h3 className="font-display font-bold text-primary text-lg">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-sm text-muted mt-2">{promo.description}</p>
                  )}
                  {promo.discountPct && (
                    <p className="text-sm font-bold mt-3 text-danger">
                      −{promo.discountPct}% {dict.home.discount}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section id="products" className="mt-16 scroll-mt-24">
          <div className="mb-6">
            <h2 className="section-title">{dict.home.ourProducts}</h2>
            <p className="text-muted">{dict.home.ourProductsSubtitle}</p>
          </div>
          {products.length === 0 ? (
            <p className="text-muted text-center py-16 card">{dict.home.noProducts}</p>
          ) : (
            <ProductGrid locale={locale} dict={dict} products={products} />
          )}
        </section>

        {/* Testimonials */}
        <section className="mt-20">
          <div className="mb-6 text-center">
            <h2 className="section-title">{dict.home.testimonialsTitle}</h2>
            <p className="text-muted">{dict.home.testimonialsSubtitle}</p>
          </div>
          <Testimonials dict={dict} />
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <div className="mb-6 text-center">
            <h2 className="section-title">{dict.home.faqTitle}</h2>
            <p className="text-muted">{dict.home.faqSubtitle}</p>
          </div>
          <Faq dict={dict} />
        </section>
      </div>

      {/* CTA band */}
      <section className="mt-20 hero">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            {dict.home.ctaTitle}
          </h2>
          <p className="text-white/85 mb-8 max-w-xl mx-auto leading-relaxed">
            {dict.home.ctaSubtitle}
          </p>
          <Link href={`/${locale}/commander`} className="btn btn-accent px-8 py-3.5 text-base">
            {dict.home.ctaButton}
            <ArrowRight className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </>
  );
}
