import Image from "next/image";
import Link from "next/link";

/** Transparent-background export of the brand lockup (bed mark + wordmark + tagline). */
const LOCKUP_SRC = "/brand/logo-lockup.png";
const LOCKUP_WIDTH = 811;
const LOCKUP_HEIGHT = 416;

type LogoProps = {
  /** Localized tagline, used for the accessible name (the lockup bakes in the French one). */
  tagline?: string;
  /** If provided, the whole logo becomes a link. */
  href?: string;
  /** Height utilities, e.g. "h-12 w-auto". Width must stay auto to keep the ratio. */
  className?: string;
  /** Set on the first logo above the fold so it is not lazy-loaded. */
  priority?: boolean;
};

export default function Logo({
  tagline,
  href,
  className = "h-12 w-auto",
  priority = false,
}: LogoProps) {
  const alt = tagline ? `Jannah Home — ${tagline}` : "Jannah Home";

  const image = (
    <Image
      src={LOCKUP_SRC}
      alt={alt}
      width={LOCKUP_WIDTH}
      height={LOCKUP_HEIGHT}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label={alt}>
        {image}
      </Link>
    );
  }
  return image;
}
