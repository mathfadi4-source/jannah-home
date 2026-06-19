export function formatPrice(price: number, locale: string = "fr"): string {
  const intlLocale = locale === "ar" ? "ar-TN" : "fr-TN";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getEffectivePrice(product: {
  price: number;
  promoPrice?: number | null;
}): number {
  return product.promoPrice != null && product.promoPrice < product.price
    ? product.promoPrice
    : product.price;
}

export const CATEGORY_LABELS: Record<string, string> = {
  COUETTE: "Matla couette",
  DRAP: "Drap de lit",
  PARURE: "Parure complète",
};

export const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
};

export const STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-amber-100 text-amber-800",
  EN_COURS: "bg-blue-100 text-blue-800",
  TERMINEE: "bg-green-100 text-green-800",
};
