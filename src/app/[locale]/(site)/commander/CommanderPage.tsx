"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Home,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { formatPrice } from "@/lib/utils";
import { buildOrderMessage, buildWhatsAppUrl, type OrderForMessage } from "@/lib/order-message";
import { SITE } from "@/lib/site";

type Product = {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
};

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
    { productId: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<OrderForMessage | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        if (preselectedId && data.some((p) => p.id === preselectedId)) {
          setSelectedProducts([{ productId: preselectedId, quantity: 1 }]);
        }
      })
      .catch(() => setProducts([]));
  }, [preselectedId]);

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.find((p) => p.productId === productId)
        ? prev.filter((p) => p.productId !== productId)
        : [...prev, { productId, quantity: 1 }]
    );
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
      return { product, quantity: sel.quantity, lineTotal: effectivePrice(product) * sel.quantity };
    })
    .filter((x): x is { product: Product; quantity: number; lineTotal: number } => x !== null);

  const total = selectedLines.reduce((sum, l) => sum + l.lineTotal, 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedProducts.length === 0) {
      setError(dict.order.selectProduct);
      return;
    }

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
          tailleCouette: formData.get("tailleCouette"),
          tailleDrap: formData.get("tailleDrap"),
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

  // ----- Success screen with WhatsApp send -----
  if (completedOrder) {
    const message = buildOrderMessage(completedOrder, locale);
    const waHref = buildWhatsAppUrl(SITE.whatsappPhone, message);
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card p-8 text-center animate-scale-in">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="font-display text-2xl font-bold mb-3 text-primary">
            {dict.order.successTitle}
          </h1>
          <p className="text-muted mb-6 leading-relaxed">{dict.order.successMessage}</p>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp w-full py-3.5 text-base"
          >
            <MessageCircle className="h-5 w-5" />
            {dict.order.sendWhatsapp}
          </a>
          <p className="text-xs text-muted-soft mt-3">{dict.order.whatsappHint}</p>

          <Link
            href={`/${locale}`}
            className="btn btn-outline w-full mt-4"
          >
            <Home className="h-4 w-4" />
            {dict.order.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2 text-primary">
        {dict.order.title}
      </h1>
      <p className="text-muted mb-8 max-w-2xl">{dict.order.subtitle}</p>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
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

          {/* Sizes */}
          <section className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{dict.order.sizes}</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="tailleCouette">
                  {dict.order.couetteSize}
                </label>
                <select id="tailleCouette" name="tailleCouette" defaultValue="">
                  <option value="">{dict.order.choose}</option>
                  {dict.sizes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="tailleDrap">
                  {dict.order.drapSize}
                </label>
                <select id="tailleDrap" name="tailleDrap" defaultValue="">
                  <option value="">{dict.order.choose}</option>
                  {dict.sizes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="notes">
                {dict.order.notes}
              </label>
              <textarea id="notes" name="notes" rows={2} placeholder={dict.order.notesPlaceholder} />
            </div>
          </section>

          {/* Products */}
          <section className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{dict.order.products}</h2>
            {products.length === 0 ? (
              <p className="text-muted text-sm">{dict.order.loadingProducts}</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const selected = selectedProducts.find((p) => p.productId === product.id);
                  const price = effectivePrice(product);

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selected ? "border-accent bg-[#faf6f0]" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        aria-pressed={!!selected}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                          selected ? "bg-primary border-primary text-white" : "border-border bg-white"
                        }`}
                      >
                        {selected && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-primary font-semibold">
                          {formatPrice(price, locale)}
                        </p>
                      </div>
                      {selected && (
                        <div className="flex items-center rounded-lg border border-border bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, selected.quantity - 1)}
                            aria-label="-"
                            className="flex h-9 w-9 items-center justify-center text-muted hover:text-primary cursor-pointer disabled:opacity-40"
                            disabled={selected.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{selected.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, selected.quantity + 1)}
                            aria-label="+"
                            className="flex h-9 w-9 items-center justify-center text-muted hover:text-primary cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {error && (
            <p className="flex items-center gap-2 text-danger text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 mt-5 text-base"
            >
              <ShoppingBag className="h-5 w-5" />
              {loading ? dict.order.submitting : dict.order.submit}
            </button>
            <p className="text-xs text-muted-soft mt-3 text-center">{dict.order.whatsappHint}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
