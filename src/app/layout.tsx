import type { Metadata } from "next";
import { Jost, Cormorant_Garamond, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jannah-home.vercel.app"),
  title: {
    default: "Jannah Home — Confort Naturel",
    template: "%s — Jannah Home",
  },
  description:
    "Jannah Home — couettes, draps et parures de lit au confort naturel. Commandez sans paiement en ligne : livraison et paiement à la livraison.",
  keywords: [
    "Jannah Home",
    "Confort Naturel",
    "couette",
    "couette coton bio",
    "draps de lit",
    "drap housse",
    "parure de lit",
    "parure satin",
    "linge de lit",
    "literie Tunisie",
    "literie haut de gamme",
    "paiement à la livraison",
    "jannah_home_",
  ],
  authors: [{ name: "Jannah Home" }],
  creator: "Jannah Home",
  publisher: "Jannah Home",
  category: "Maison & Literie",
  alternates: {
    canonical: "/",
    languages: {
      "fr-TN": "/fr",
      "ar-TN": "/ar",
    },
  },
  openGraph: {
    title: "Jannah Home — Confort Naturel",
    description:
      "Literie élégante au confort naturel : couettes, draps et parures. Commande sans paiement en ligne, livraison partout en Tunisie.",
    type: "website",
    siteName: "Jannah Home",
    locale: "fr_TN",
    url: "https://jannah-home.vercel.app",
    images: [
      {
        url: "/brand/jannah-home-logo.png",
        width: 640,
        height: 640,
        alt: "Jannah Home — Confort Naturel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jannah Home — Confort Naturel",
    description:
      "Couettes, draps et parures de lit au confort naturel. Commande par WhatsApp, paiement à la livraison.",
    images: ["/brand/jannah-home-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${jost.variable} ${cormorant.variable} ${notoArabic.variable} antialiased min-h-screen bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
