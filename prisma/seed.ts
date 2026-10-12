import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

/** Real bedding photographs, reused as gallery shots for the showcase products. */
const PHOTOS = [
  "/images/hero/hero-1.webp",
  "/images/hero/hero-2.webp",
  "/images/hero/hero-3.webp",
];

const COUETTE_SIZES = ["140 x 200", "200 x 200", "240 x 220"];
const DRAP_SIZES = ["90 x 190", "140 x 190", "160 x 200", "180 x 200"];
const PARURE_SIZES = ["160 x 200", "180 x 200", "200 x 200"];

const products = [
  // ---------- Couettes ----------
  {
    name: "Couette Naturelle Sable",
    description:
      "Couette en coton doux et respirant, garnissage moelleux pour des nuits chaudes et apaisées. Coloris sable chaleureux.",
    category: ProductCategory.COUETTE,
    price: 189,
    promoPrice: 149,
    imageUrl: PHOTOS[0],
    galleryUrls: [PHOTOS[1], PHOTOS[2], "/images/products/couette-sable.svg"],
    sizes: COUETTE_SIZES,
  },
  {
    name: "Couette Lin Lavé Écru",
    description:
      "Couette en lin lavé, thermorégulatrice et naturellement anti-allergène. Toucher souple, tombé élégant.",
    category: ProductCategory.COUETTE,
    price: 229,
    imageUrl: "/images/products/couette-lin.svg",
    sizes: COUETTE_SIZES,
  },
  {
    name: "Couette Terracotta Coton Bio",
    description:
      "Coton biologique certifié, chaleur douce et respirante. La touche terracotta qui réchauffe la chambre.",
    category: ProductCategory.COUETTE,
    price: 199,
    promoPrice: 169,
    imageUrl: "/images/products/couette-terracotta.svg",
    galleryUrls: [PHOTOS[2], PHOTOS[0]],
    sizes: ["200 x 200", "240 x 220"],
  },

  // ---------- Draps ----------
  {
    name: "Drap Housse Coton Blanc",
    description:
      "Drap housse 100% coton peigné, bonnet profond, tenue parfaite sur le matelas. Plusieurs tailles disponibles.",
    category: ProductCategory.DRAP,
    price: 79,
    promoPrice: 65,
    imageUrl: PHOTOS[1],
    galleryUrls: [PHOTOS[2], "/images/products/drap-blanc.svg"],
    sizes: DRAP_SIZES,
  },
  {
    name: "Parure de Drap Caramel",
    description:
      "Ensemble drap plat et drap housse en coton satiné, coloris caramel. Doux au toucher, facile d'entretien.",
    category: ProductCategory.DRAP,
    price: 119,
    imageUrl: "/images/products/drap-caramel.svg",
    sizes: DRAP_SIZES,
  },
  {
    name: "Drap Noyer Microfibre",
    description:
      "Microfibre anti-acariens, séchage rapide et couleur profonde. Idéal pour un intérieur élégant et chaleureux.",
    category: ProductCategory.DRAP,
    price: 89,
    promoPrice: 72,
    imageUrl: "/images/products/drap-nuit.svg",
    askSize: false,
  },

  // ---------- Parures ----------
  {
    name: "Parure Satin Blanc Nacré",
    description:
      "Parure complète en satin de coton : housse de couette + 2 taies. Reflet nacré subtil pour une chambre raffinée.",
    category: ProductCategory.PARURE,
    price: 249,
    promoPrice: 199,
    imageUrl: PHOTOS[2],
    galleryUrls: [PHOTOS[0], PHOTOS[1], "/images/products/parure-satin.svg"],
    sizes: PARURE_SIZES,
  },
  {
    name: "Parure Caramel Confort",
    description:
      "Housse de couette et taies assorties, coton dense et chaleureux. Le confort naturel signé Jannah Home.",
    category: ProductCategory.PARURE,
    price: 219,
    imageUrl: "/images/products/parure-caramel.svg",
    sizes: PARURE_SIZES,
  },
  {
    name: "Parure Nuit Noyer",
    description:
      "Parure haut de gamme aux tons noyer profonds, finitions soignées. Une élégance discrète pour un sommeil cocooning.",
    category: ProductCategory.PARURE,
    price: 269,
    promoPrice: 229,
    imageUrl: "/images/products/parure-nuit.svg",
    sizes: [],
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promotion.deleteMany();

  await prisma.product.createMany({ data: products });

  await prisma.promotion.createMany({
    data: [
      {
        title: "Offre Confort Naturel",
        description:
          "Jusqu'à −20% sur une sélection de couettes et parures. Paiement à la livraison.",
        discountPct: 20,
        active: true,
      },
      {
        title: "Livraison partout en Tunisie",
        description:
          "Commandez par WhatsApp, payez à la réception. Livraison rapide et soignée.",
        active: true,
      },
    ],
  });

  const withSizes = products.filter((p) => (p.sizes?.length ?? 0) > 0).length;
  const withGallery = products.filter((p) => (p.galleryUrls?.length ?? 0) > 0).length;
  console.log(
    `Base de données initialisée : ${products.length} produits ` +
      `(${withSizes} avec tailles, ${withGallery} avec galerie).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
