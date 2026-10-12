"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  AlertCircle,
  ImageIcon,
  Home,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatPrice } from "@/lib/utils";
import { type OrderForMessage } from "@/lib/order-message";

type Product = {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  imageUrl: string | null;
  askSize: boolean;
  sizes: string[];
};

type SelectedLine = { productId: string; quantity: number; size: string };

/** A product only offers a size when it is configured to ask for one. */
function offersSize(product: Product): boolean {
  return product.askSize && product.sizes.length > 0;
}

type CommanderPageProps = {
  locale: Locale;
  dict: Dictionary;
};

function effectivePrice(p: Product) {
  return p.promoPrice != null && p.promoPrice < p.price ? p.promoPrice : p.price;
}

export default function CommanderPage({ locale, dict }: CommanderPageProps) {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("produit");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; quantity: number; size: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [productsState, setProductsState] = useState<"loading" | "ready" | "failed">(
    "loading"
  );
  const [error, setError] = useState("");
  const [missingSizeIds, setMissingSizeIds] = useState<string[]>([]);
  const [completedOrder, setCompletedOrder] = useState<OrderForMessage | null>(null);
  const successDialogRef = useRef<HTMLDialogElement>(null);

  // Native <dialog> gives focus trapping and Escape handling for free.
  useEffect(() => {
    const node = successDialogRef.current;
    if (!node) return;
    if (completedOrder && !node.open) node.showModal();
    if (!completedOrder && node.open) node.close();
  }, [completedOrder]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error("products request failed");
        return r.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setProductsState("ready");
        if (preselectedId && data.some((p) => p.id === preselectedId)) {
          setSelectedProducts([{ productId: preselectedId, quantity: 1, size: "" }]);
        }
      })
      .catch(() => setProductsState("failed"));
  }, [preselectedId]);

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.find((p) => p.productId === productId)
        ? prev.filter((p) => p.productId !== productId)
        : [...prev, { productId, quantity: 1, size: "" }]
    );
  }

  function updateSize(productId: string, size: string) {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, size } : p))
    );
    if (size !== "") {
      setMissingSizeIds((prev) => prev.filter((id) => id !== productId));
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  }

  const selectedLines = selectedProducts
    .map((sel) => {
      const product = products.find((p) => p.id === sel.productId);
      if (!product) return null;
      return {
        product,
        quantity: sel.quantity,
        size: sel.size,
        lineTotal: effectivePrice(product) * sel.quantity,
      };
    })
    .filter(
      (x): x is { product: Product; quantity: number; size: string; lineTotal: number } =>
        x !== null
    );

  const total = selectedLines.reduce((sum, l) => sum + l.lineTotal, 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedProducts.length === 0) {
      setError(dict.order.selectProduct);
      return;
    }

    const missing = selectedLines
      .filter((line) => offersSize(line.product) && line.size === "")
      .map((line) => line.product.id);

    if (missing.length > 0) {
      setMissingSizeIds(missing);
      setError(dict.order.sizeRequired);
      document.getElementById(`size-${missing[0]}`)?.focus();
      return;
    }
    setMissingSizeIds([]);

    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          notes: formData.get("notes"),
          items: selectedProducts,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || dict.order.orderError);
      }

      const order: OrderForMessage = await res.json();
      setCompletedOrder(order);
      form.reset();
      setSelectedProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.order.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 max-lg:pb-28">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-primary">
        {dict.order.title}
      </h1>
      <p className="text-muted mb-8 max-w-2xl">{dict.order.subtitle}</p>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          {/* Products — first: you choose what you are buying before who you are. */}
          <section className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{dict.order.products}</h2>
            {productsState === "loading" ? (
              <p className="text-muted text-sm">{dict.order.loadingProducts}</p>
            ) : productsState === "failed" ? (
              <p className="flex items-center gap-2 text-danger text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {dict.order.productsUnavailable}
              </p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    line={selectedProducts.find((p) => p.productId === product.id)}
                    locale={locale}
                    dict={dict}
                    missingSize={missingSizeIds.includes(product.id)}
                    onToggle={() => toggleProduct(product.id)}
                    onQuantity={(q) => updateQuantity(product.id, q)}
                    onSize={(size) => updateSize(product.id, size)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Contact */}
          <section className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{dict.order.contactInfo}</h2>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="customerName">
                {dict.order.fullName}
              </label>
              <input id="customerName" name="customerName" required placeholder={dict.order.fullNamePlaceholder} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  {dict.order.email}
                </label>
                <input id="email" name="email" type="email" required placeholder={dict.order.emailPlaceholder} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  {dict.order.phone}
                </label>
                <input id="phone" name="phone" type="tel" required placeholder={dict.order.phonePlaceholder} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="address">
                {dict.order.address}
              </label>
              <textarea id="address" name="address" required rows={3} placeholder={dict.order.addressPlaceholder} />
            </div>
          </section>

          {/* Notes */}
          <section className="card p-6">
            <label className="block text-sm font-medium mb-1" htmlFor="notes">
              {dict.order.notes}
            </label>
            <textarea id="notes" name="notes" rows={2} placeholder={dict.order.notesPlaceholder} />
          </section>

        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">{dict.order.summaryTitle}</h2>
            {selectedLines.length === 0 ? (
              <p className="text-sm text-muted">{dict.order.summaryEmpty}</p>
            ) : (
              <ul className="space-y-3 mb-4">
                {selectedLines.map((l) => (
                  <li key={l.product.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-foreground">
                      {l.product.name}
                      <span className="text-muted-soft"> ×{l.quantity}</span>
                      {l.size && (
                        <span className="block text-xs text-muted-soft">{l.size}</span>
                      )}
                    </span>
                    <span className="font-semibold text-primary whitespace-nowrap">
                      {formatPrice(l.lineTotal, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-semibold">{dict.order.total}</span>
              <span className="font-display text-2xl font-bold text-primary">
                {formatPrice(total, locale)}
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-danger"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 mt-5 text-base max-lg:hidden"
            >
              <ShoppingBag className="h-5 w-5" />
              {loading ? dict.order.submitting : dict.order.submit}
            </button>
          </div>
        </aside>

        {/* On a phone the total and the action stay reachable without scrolling back. */}
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted">{dict.order.total}</p>
              <p className="font-display text-lg font-bold text-primary">
                {formatPrice(total, locale)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 py-3"
            >
              <ShoppingBag className="h-5 w-5" />
              {loading ? dict.order.submitting : dict.order.submit}
            </button>
          </div>
        </div>
      </form>

      {/* Order confirmation — animated, replaces the old WhatsApp hand-off screen. */}
      <dialog
        ref={successDialogRef}
        onClose={() => setCompletedOrder(null)}
        aria-labelledby="order-success-title"
        className="order-dialog m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-lg"
      >
        {completedOrder && (
          <div className="p-8 text-center">
            <span className="animate-check-ring mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
              <svg
                viewBox="0 0 52 52"
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path className="animate-check-draw" d="M14 27l8 8 16-16" />
              </svg>
            </span>

            <h2
              id="order-success-title"
              className="font-display text-2xl font-bold mb-3 text-primary"
            >
              {dict.order.successTitle}
            </h2>
            <p className="text-muted mb-5 leading-relaxed">{dict.order.successMessage}</p>

            <p className="mb-6 inline-block rounded-lg bg-background px-3 py-1.5 text-sm font-medium text-primary">
              {dict.order.ref} #{completedOrder.id.slice(-8).toUpperCase()}
            </p>

            <Link href={`/${locale}`} className="btn btn-primary w-full py-3">
              <Home className="h-4 w-4" />
              {dict.order.backHome}
            </Link>
            <button
              type="button"
              onClick={() => setCompletedOrder(null)}
              className="btn btn-outline w-full mt-3"
            >
              {dict.order.newOrder}
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}

/** One selectable product: thumbnail, price, quantity stepper and its own size list. */
function ProductRow({
  product,
  line,
  locale,
  dict,
  missingSize,
  onToggle,
  onQuantity,
  onSize,
}: {
  product: Product;
  line: SelectedLine | undefined;
  locale: Locale;
  dict: Dictionary;
  missingSize: boolean;
  onToggle: () => void;
  onQuantity: (quantity: number) => void;
  onSize: (size: string) => void;
}) {
  const price = effectivePrice(product);
  const discounted = price < product.price;

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        line ? "border-accent bg-background" : "border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={Boolean(line)}
          className="flex flex-1 items-center gap-3 text-start cursor-pointer"
        >
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
              line ? "border-primary bg-primary text-white" : "border-border bg-white"
            }`}
          >
            {line && <Check className="h-4 w-4" />}
          </span>

          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt="" fill className="object-cover" sizes="56px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-accent-dark/30">
                <ImageIcon className="h-5 w-5" />
              </span>
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-medium">{product.name}</span>
            <span className="block text-sm font-semibold text-primary">
              {formatPrice(price, locale)}
              {discounted && (
                <span className="ms-2 text-xs font-normal text-muted-soft line-through">
                  {formatPrice(product.price, locale)}
                </span>
              )}
            </span>
          </span>
        </button>

        {line && (
          <div className="flex items-center rounded-lg border border-border bg-white">
            <button
              type="button"
              onClick={() => onQuantity(line.quantity - 1)}
              aria-label={dict.order.decreaseQty}
              className="flex h-9 w-9 items-center justify-center text-muted hover:text-primary cursor-pointer disabled:opacity-40"
              disabled={line.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(line.quantity + 1)}
              aria-label={dict.order.increaseQty}
              className="flex h-9 w-9 items-center justify-center text-muted hover:text-primary cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {line && offersSize(product) && (
        <div className="mt-3 ltr:pl-9 rtl:pr-9">
          <label className="block text-sm font-medium mb-1" htmlFor={`size-${product.id}`}>
            {dict.order.sizes}
          </label>
          <select
            id={`size-${product.id}`}
            value={line.size}
            onChange={(e) => onSize(e.target.value)}
            aria-invalid={missingSize}
            className={missingSize ? "border-danger" : ""}
          >
            <option value="">{dict.order.choose}</option>
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
