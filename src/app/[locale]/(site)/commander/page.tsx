import { Suspense } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import CommanderPage from "./CommanderPage";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = (isValidLocale(localeParam) ? localeParam : "fr") as Locale;
  const dict = await getDictionary(locale);

  return (
    <Suspense fallback={<div className="p-10 text-center text-muted">...</div>}>
      <CommanderPage locale={locale} dict={dict} />
    </Suspense>
  );
}
