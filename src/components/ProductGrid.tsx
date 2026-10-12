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

  const resultsLabel =
    filtered.length === 1
      ? dict.filters.resultsCountOne
      : dict.filters.resultsCount.replace("{n}", String(filtered.length));

  function resetFilters() {
    setSearch("");
    setCategory("ALL");
    setSort("newest");
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-soft" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.filters.searchPlaceholder}
              aria-label={dict.filters.searchPlaceholder}
              className="ps-9 pe-9"
            />
            {search !== "" && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={dict.filters.clear}
                className="absolute top-1/2 -translate-y-1/2 end-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-soft hover:text-primary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative flex items-center sm:ms-auto">
            <SlidersHorizontal className="pointer-events-none absolute start-2.5 h-4 w-4 text-muted-soft" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={dict.filters.sortLabel}
              className="w-auto ps-8 pe-3 py-2 text-sm"
            >
              <option value="newest">{dict.filters.sortNewest}</option>
              <option value="priceAsc">{dict.filters.sortPriceAsc}</option>
              <option value="priceDesc">{dict.filters.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {/* One scrolling row on a phone rather than a ragged wrap. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <CategoryPill
            active={category === "ALL"}
            label={dict.filters.all}
            onClick={() => setCategory("ALL")}
          />
          {categories.map((c) => (
            <CategoryPill
              key={c}
              active={category === c}
              label={dict.categories[c as keyof typeof dict.categories]}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted">
          <span aria-live="polite">{resultsLabel}</span>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 hover:text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
              {dict.filters.clear}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-muted">{dict.filters.resultsNone}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-outline mt-4"
            >
              <X className="h-4 w-4" />
              {dict.filters.clear}
            </button>
          )}
        </div>
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

function CategoryPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`badge shrink-0 cursor-pointer transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-white text-muted ring-1 ring-border hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}
