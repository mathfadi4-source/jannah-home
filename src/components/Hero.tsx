import Link from "next/link";
import Image from "next/image";
import { Truck, Wallet, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type HeroProps = {
  locale: Locale;
  dict: Dictionary;
  /** Up to 3 product images to feature in the hero collage. */
  images?: string[];
};

export default function Hero({ locale, dict, images = [] }: HeroProps) {
  const chips = [
    { Icon: Truck, label: dict.hero.chipDelivery },
    { Icon: Wallet, label: dict.hero.chipPayment },
    { Icon: ShieldCheck, label: dict.hero.chipQuality },
  ];

  const hasCollage = images.length >= 2;

  return (
    <section className="hero px-4 py-16 sm:py-20">
      <div
        className={`max-w-6xl mx-auto relative z-10 ${
          hasCollage
            ? "grid lg:grid-cols-2 gap-12 items-center"
            : "max-w-3xl text-center"
        }`}
      >
        {/* Copy */}
        <div className={`animate-fade-up ${hasCollage ? "text-center lg:text-start" : ""}`}>
          <p className="section-eyebrow text-accent-light mb-4">{dict.hero.eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-[1.08]">
            {dict.home.title}
          </h1>
          <p className="text-white/85 text-lg max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            {dict.home.subtitle}
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center gap-4 ${
              hasCollage ? "justify-center lg:justify-start" : "justify-center"
            }`}
          >
            <Link href={`/${locale}/commander`} className="btn btn-accent px-8 py-3.5 text-base">
              <ShoppingBag className="h-5 w-5" />
              {dict.nav.order}
            </Link>
            <Link
              href={`/${locale}#products`}
              className="btn border-2 border-white/40 text-white hover:bg-white/10 px-8 py-3.5 text-base"
            >
              {dict.nav.products}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
          </div>

          <div
            className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 ${
              hasCollage ? "justify-center lg:justify-start" : "justify-center"
            }`}
          >
            {chips.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/90">
                <Icon className="h-4 w-4 text-accent-light" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Product collage */}
        {hasCollage && (
          <div className="relative h-[340px] sm:h-[420px] animate-fade-up" aria-hidden="true">
            <div className="absolute top-0 ltr:right-4 rtl:left-4 w-[58%] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/20 rotate-2">
              <Image src={images[0]} alt="" fill sizes="40vw" className="object-cover" />
            </div>
            <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-[52%] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/20 -rotate-3">
              <Image src={images[1]} alt="" fill sizes="40vw" className="object-cover" />
            </div>
            {images[2] && (
              <div className="absolute top-1/2 ltr:right-0 rtl:left-0 -translate-y-1/3 w-[40%] aspect-square rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/30 rotate-6">
                <Image src={images[2]} alt="" fill sizes="30vw" className="object-cover" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
