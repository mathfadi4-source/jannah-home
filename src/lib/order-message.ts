import type { Locale } from "@/i18n/config";

export type OrderItemForMessage = {
  quantity: number;
  unitPrice: number;
  product: { name: string };
};

export type OrderForMessage = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  tailleCouette?: string | null;
  tailleDrap?: string | null;
  notes?: string | null;
  createdAt?: string | Date | null;
  items: OrderItemForMessage[];
};

const LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    newOrder: "🛏️ NOUVELLE COMMANDE — Jannah Home",
    client: "👤 Client",
    phone: "📱 Téléphone",
    email: "📧 Email",
    address: "📍 Adresse",
    products: "📦 Produits",
    couette: "📐 Taille couette",
    drap: "📐 Taille drap",
    notes: "📝 Notes",
    total: "💰 TOTAL",
    ref: "🆔 Commande",
    date: "🕒",
  },
  ar: {
    newOrder: "🛏️ طلب جديد — Jannah Home",
    client: "👤 العميل",
    phone: "📱 الهاتف",
    email: "📧 البريد",
    address: "📍 العنوان",
    products: "📦 المنتجات",
    couette: "📐 مقاس الغطاء",
    drap: "📐 مقاس الملاءة",
    notes: "📝 ملاحظات",
    total: "💰 المجموع",
    ref: "🆔 الطلب",
    date: "🕒",
  },
};

const DIVIDER = "━━━━━━━━━━━━━━━━━━━━━━";

function formatDate(value: string | Date | null | undefined, locale: Locale): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/**
 * Builds the full WhatsApp order message containing every order requirement:
 * customer info, address, each product + quantity + line price, sizes, notes,
 * total, order reference and timestamp. Used by both the client (wa.me link)
 * and the server-side notifier.
 */
export function buildOrderMessage(order: OrderForMessage, locale: Locale = "fr"): string {
  const t = LABELS[locale] ?? LABELS.fr;
  const lines: string[] = [t.newOrder, DIVIDER];

  lines.push(`${t.client} : ${order.customerName}`);
  lines.push(`${t.phone} : ${order.phone}`);
  if (order.email) lines.push(`${t.email} : ${order.email}`);
  lines.push(`${t.address} : ${order.address}`);
  lines.push("");
  lines.push(`${t.products} :`);

  let total = 0;
  for (const item of order.items) {
    const qty = item.quantity || 1;
    const subtotal = item.unitPrice * qty;
    total += subtotal;
    lines.push(` • ${item.product.name} ×${qty} — ${subtotal.toFixed(0)} TND`);
  }

  if (order.tailleCouette) lines.push(`${t.couette} : ${order.tailleCouette}`);
  if (order.tailleDrap) lines.push(`${t.drap} : ${order.tailleDrap}`);
  if (order.notes) lines.push(`${t.notes} : ${order.notes}`);

  lines.push(DIVIDER);
  lines.push(`${t.total} : ${total.toFixed(0)} TND`);
  lines.push(`${t.ref} #${order.id.slice(-8).toUpperCase()}`);

  const date = formatDate(order.createdAt, locale);
  if (date) lines.push(`${t.date} ${date}`);

  return lines.join("\n");
}

/** Builds a https://wa.me click-to-chat URL with a pre-filled message. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
