"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import ProductCard from "@/components/ProductCard";
import { getEffectivePrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  promoPrice: number | null;
  imageUrl: string | null;
};

type SortKey = "newest" | "priceAsc" | "priceDesc";

export default function ProductGrid({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return (["COUETTE", "DRAP", "PARURE"] as const).filter((c) => present.has(c));
  }, [products]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesCategory = category === "ALL" || p.category === category;
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false);
      return matchesCategory && matchesSearch;
    });

    if (sort === "priceAsc") {
      list = [...list].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sort === "priceDesc") {
      list = [...list].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    }
    return list;
  }, [products, search, category, sort]);

  const hasFilters = search !== "" || category !== "ALL" || sort !== "newest";

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-soft" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.filters.searchPlaceholder}
            aria-label={dict.filters.searchPlaceholder}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory("ALL")}
            className={`badge cursor-pointer transition-colors ${
              category === "ALL"
                ? "bg-primary text-white"
                : "bg-white text-muted ring-1 ring-border hover:text-primary"
            }`}
          >
            {dict.filters.all}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`badge cursor-pointer transition-colors ${
                category === c
                  ? "bg-primary text-white"
                  : "bg-white text-muted ring-1 ring-border hover:text-primary"
              }`}
            >
              {dict.categories[c as keyof typeof dict.categories]}
            </button>
          ))}

          <div className="relative ms-1 flex items-center">
            <SlidersHorizontal className="pointer-events-none absolute ltr:left-2.5 rtl:right-2.5 h-4 w-4 text-muted-soft" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={dict.filters.sortNewest}
              className="w-auto ltr:pl-8 rtl:pr-8 py-2 text-sm"
            >
              <option value="newest">{dict.filters.sortNewest}</option>
              <option value="priceAsc">{dict.filters.sortPriceAsc}</option>
              <option value="priceDesc">{dict.filters.sortPriceDesc}</option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("ALL");
                setSort("newest");
              }}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
              {dict.filters.clear}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-muted text-center py-16 card">{dict.filters.resultsNone}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} locale={locale} dict={dict} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
