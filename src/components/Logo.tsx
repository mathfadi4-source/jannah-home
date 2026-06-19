import Link from "next/link";

type LogoVariant = "light" | "onDark";

type LogoProps = {
  /** Show the "JANNAH HOME" wordmark next to the bed mark. */
  withText?: boolean;
  /** Small spaced caption under the wordmark (e.g. "Confort Naturel"). */
  tagline?: string;
  /** If provided, the whole logo becomes a link. */
  href?: string;
  /** Pixel size of the square bed-mark tile. */
  markSize?: number;
  /** "light" for cream/white surfaces, "onDark" for walnut surfaces. */
  variant?: LogoVariant;
  className?: string;
};

/**
 * Jannah Home brand mark — a bed icon (mattress + two pillows) rendered as
 * crisp, scalable SVG, recreated from the official brand identity sheet.
 */
function BedMark({ size, variant }: { size: number; variant: LogoVariant }) {
  const isDark = variant === "onDark";
  // Caramel bed on a linen tile (light) / terracotta bed on deep walnut (dark).
  const tile = isDark ? "#3a2010" : "#f5ede0";
  const body = isDark ? "#d9935a" : "#c07b3a";
  const pillow = isDark ? "#3a2010" : "#f5ede0";
  const base = isDark ? "#c07b3a" : "#7a4b1a";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-label="Jannah Home"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect x="0" y="0" width="72" height="72" rx="16" fill={tile} />
      <g transform="translate(1, 4)">
        <rect x="5" y="24" width="60" height="28" rx="8" fill={body} />
        <rect x="7" y="8" width="20" height="20" rx="6" fill={body} />
        <rect x="43" y="8" width="20" height="20" rx="6" fill={body} />
        <rect x="9" y="25" width="16" height="11" rx="3" fill={pillow} />
        <rect x="45" y="25" width="16" height="11" rx="3" fill={pillow} />
        <rect x="5" y="50" width="60" height="8" rx="4" fill={base} />
      </g>
    </svg>
  );
}

export default function Logo({
  withText = true,
  tagline,
  href,
  markSize = 40,
  variant = "light",
  className = "",
}: LogoProps) {
  const isDark = variant === "onDark";
  const titleColor = isDark ? "text-[#f5ede0]" : "text-primary-dark";
  const subColor = isDark ? "text-[#d9935a]" : "text-accent-dark";

  const content = (
    <span className={`flex items-center gap-3 group ${className}`}>
      <span className="transition-transform group-hover:scale-105">
        <BedMark size={markSize} variant={variant} />
      </span>
      {withText && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-semibold tracking-[0.06em] ${titleColor}`}
            style={{ fontSize: Math.round(markSize * 0.46) }}
          >
            JANNAH HOME
          </span>
          {tagline && (
            <span
              className={`brand-eyebrow mt-1 ${subColor}`}
              style={{ fontSize: Math.max(9, Math.round(markSize * 0.24)) }}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex" aria-label="Jannah Home">
        {content}
      </Link>
    );
  }
  return content;
}
