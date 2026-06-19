import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type Tile = {
  key: string;
  title: string;
  desc: string;
  image: string;
};

// Fallback artwork used only when a category has no product image yet.
const FALLBACK_IMAGE: Record<string, string> = {
  COUETTE: "/images/products/couette-sable.svg",
  DRAP: "/images/products/drap-caramel.svg",
  PARURE: "/images/products/parure-satin.svg",
};

export default function CategoryTiles({
  locale,
  dict,
  images,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Representative image per category, sourced from the products API. */
  images?: Partial<Record<string, string | null>>;
}) {
  const tiles: Tile[] = [
    {
      key: "COUETTE",
      title: dict.tiles.couetteTitle,
      desc: dict.tiles.couetteDesc,
      image: images?.COUETTE || FALLBACK_IMAGE.COUETTE,
    },
    {
      key: "DRAP",
      title: dict.tiles.drapTitle,
      desc: dict.tiles.drapDesc,
      image: images?.DRAP || FALLBACK_IMAGE.DRAP,
    },
    {
      key: "PARURE",
      title: dict.tiles.parureTitle,
      desc: dict.tiles.parureDesc,
      image: images?.PARURE || FALLBACK_IMAGE.PARURE,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Link
          key={tile.key}
          href={`/${locale}#products`}
          className="group relative block overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 min-h-[200px]"
        >
          <Image
            src={tile.image}
            alt={tile.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Legibility overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a2d0e]/85 via-[#4a2d0e]/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <h3 className="font-display text-2xl font-semibold drop-shadow-sm">
              {tile.title}
            </h3>
            <p className="mt-1.5 text-sm text-white/90 leading-snug max-w-[90%]">
              {tile.desc}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
              {dict.tiles.viewAll}
              <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
