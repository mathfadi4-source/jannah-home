import { prisma } from "@/lib/prisma";

/** The hero collage lays out at most three images. */
export const HERO_IMAGE_SLOTS = 3;

/**
 * Shown on the storefront until an administrator adds their own hero images.
 * Kept in code rather than seeded so a fresh database still renders a complete
 * hero without a seeding step.
 */
export const DEFAULT_HERO_IMAGES = [
  "/images/hero/hero-1.webp",
  "/images/hero/hero-2.webp",
  "/images/hero/hero-3.webp",
] as const;

/**
 * Hero image URLs for the storefront: the active images an administrator
 * configured, falling back to the bundled defaults when none are active.
 */
export async function getHeroImages(): Promise<string[]> {
  const images = await prisma.heroImage.findMany({
    where: { active: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    take: HERO_IMAGE_SLOTS,
    select: { url: true },
  });

  if (images.length === 0) {
    return [...DEFAULT_HERO_IMAGES];
  }
  return images.map((image) => image.url);
}
