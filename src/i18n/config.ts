export type Locale = "fr" | "ar";

export const locales: Locale[] = ["fr", "ar"];
export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
