"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent, PointerEvent } from "react";
import Image from "next/image";
import { ImageIcon, Play, ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

type View = { type: "image" | "video"; src: string };

/** How much the zoom panel magnifies the source image. */
const ZOOM = 2.5;
/** Width of the zoom panel that opens beside the gallery, in pixels. */
const PANEL_WIDTH = 420;
/** Pointer travel, in pixels, that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 44;
/** Delay before a hovered thumbnail takes over, so sweeping across them doesn't strobe. */
const HOVER_INTENT_MS = 120;

type GalleryProps = {
  imageUrl: string | null;
  galleryUrls?: string[];
  videoUrl: string | null;
  name: string;
  dict: Dictionary;
};

export default function ProductGallery({
  imageUrl,
  galleryUrls,
  videoUrl,
  name,
  dict,
}: GalleryProps) {
  const views = buildViews(imageUrl, galleryUrls, videoUrl);

  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [canHover, setCanHover] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  // Zoom and hover-to-switch are pointer affordances: on touch they would fight
  // with scrolling and never be discoverable. Swipe and fullscreen serve instead.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => () => clearHoverTimer(hoverTimer), []);

  const current = views[active];
  const zoomActive = zooming && canHover && current?.type === "image";
  const lensWidth = PANEL_WIDTH / ZOOM;
  const lensHeight = frame.height / ZOOM;

  const step = useCallback(
    (direction: -1 | 1) => {
      setActive((prev) => (prev + direction + views.length) % views.length);
    },
    [views.length]
  );

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Keep the lens fully inside the frame so the panel never shows empty edges.
    const x = clamp(e.clientX - rect.left - lensWidth / 2, 0, rect.width - lensWidth);
    const y = clamp(e.clientY - rect.top - rect.height / ZOOM / 2, 0, rect.height - rect.height / ZOOM);
    setLens({ x, y });
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || views.length < 2) return;

    const dx = e.clientX - start.x;
    // Ignore mostly-vertical drags: those are the page scrolling, not a swipe.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(e.clientY - start.y)) return;
    swiped.current = true;
    step(dx < 0 ? 1 : -1);
  }

  function handleThumbHover(index: number) {
    clearHoverTimer(hoverTimer);
    hoverTimer.current = setTimeout(() => setActive(index), HOVER_INTENT_MS);
  }

  return (
    <div className="relative">
      <div
        ref={frameRef}
        role="tabpanel"
        onMouseEnter={() => {
          const rect = frameRef.current?.getBoundingClientRect();
          if (rect) setFrame({ width: rect.width, height: rect.height });
          setZooming(true);
        }}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface touch-pan-y"
      >
        {!current ? (
          <div className="product-image-fallback h-full">
            <ImageIcon className="h-16 w-16 text-accent-dark/30" />
          </div>
        ) : current.type === "image" ? (
          <button
            type="button"
            onClick={() => {
              // A swipe ends with a click on the image; that must not open fullscreen.
              if (swiped.current) {
                swiped.current = false;
                return;
              }
              setLightboxOpen(true);
            }}
            aria-label={dict.product.openFullscreen}
            className="absolute inset-0 cursor-zoom-in"
          >
            <Image
              key={current.src}
              src={current.src}
              alt={name}
              fill
              className="animate-gallery-fade object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>
        ) : (
          <video src={current.src} controls className="h-full w-full object-cover" />
        )}

        {zoomActive && (
          <span
            aria-hidden="true"
            className="gallery-lens pointer-events-none absolute"
            style={{ left: lens.x, top: lens.y, width: lensWidth, height: lensHeight }}
          />
        )}

        {current?.type === "image" && canHover && !zooming && (
          <span className="pointer-events-none absolute bottom-3 flex items-center gap-1.5 rounded-full bg-foreground/70 px-3 py-1.5 text-xs text-white ltr:left-3 rtl:right-3">
            <ZoomIn className="h-3.5 w-3.5" />
            {dict.product.zoomHint}
          </span>
        )}

        {views.length > 1 && (
          <>
            <GalleryArrow side="start" label={dict.product.prevImage} onClick={() => step(-1)} revealOnHover />
            <GalleryArrow side="end" label={dict.product.nextImage} onClick={() => step(1)} revealOnHover />
            <span className="pointer-events-none absolute bottom-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-white tabular-nums ltr:right-3 rtl:left-3">
              {active + 1} / {views.length}
            </span>
          </>
        )}
      </div>

      {/* Magnified panel, opening beside the gallery like a marketplace listing. */}
      {zoomActive && frame.height > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-30 hidden overflow-hidden rounded-xl border border-border bg-surface shadow-lg lg:block ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4"
          style={{
            width: PANEL_WIDTH,
            height: frame.height,
            backgroundImage: `url("${current.src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${frame.width * ZOOM}px ${frame.height * ZOOM}px`,
            backgroundPosition: `-${lens.x * ZOOM}px -${lens.y * ZOOM}px`,
          }}
        />
      )}

      {views.length > 1 && (
        <div
          role="tablist"
          aria-label={name}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          className="mt-3 flex gap-2.5 overflow-x-auto pb-1"
        >
          {views.map((view, index) => (
            <button
              key={view.src}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={view.type === "video" ? dict.product.video : `${name} ${index + 1}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onMouseEnter={() => canHover && handleThumbHover(index)}
              onMouseLeave={() => clearHoverTimer(hoverTimer)}
              onFocus={() => setActive(index)}
              className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-lg transition-[box-shadow,opacity] cursor-pointer ${
                active === index
                  ? "opacity-100 ring-2 ring-accent-dark ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {view.type === "image" ? (
                <Image src={view.src} alt="" fill className="object-cover" sizes="72px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-foreground/80 text-white">
                  <Play className="h-5 w-5" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && current?.type === "image" && (
        <Lightbox
          views={views}
          active={active}
          name={name}
          dict={dict}
          onStep={step}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/** Featured photo first, then the gallery, with the video last. */
function buildViews(
  imageUrl: string | null,
  galleryUrls: string[] | undefined,
  videoUrl: string | null
): View[] {
  const views: View[] = [];
  if (imageUrl) views.push({ type: "image", src: imageUrl });
  for (const url of galleryUrls ?? []) {
    if (url !== imageUrl) views.push({ type: "image", src: url });
  }
  if (videoUrl) views.push({ type: "video", src: videoUrl });
  return views;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function clearHoverTimer(ref: { current: ReturnType<typeof setTimeout> | null }) {
  if (ref.current) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function Lightbox({
  views,
  active,
  name,
  dict,
  onStep,
  onClose,
}: {
  views: View[];
  active: number;
  name: string;
  dict: Dictionary;
  onStep: (direction: -1 | 1) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const current = views[active];

  useEffect(() => {
    const node = ref.current;
    if (node && !node.open) node.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
      aria-label={name}
      className="gallery-lightbox"
    >
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="relative flex h-full w-full items-center justify-center p-4"
      >
        {current?.type === "image" && (
          <Image
            key={current.src}
            src={current.src}
            alt={name}
            width={1600}
            height={1600}
            className="animate-gallery-fade max-h-full w-auto object-contain"
            sizes="100vw"
          />
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label={dict.nav.close}
          className="absolute top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-colors hover:bg-white cursor-pointer ltr:right-4 rtl:left-4"
        >
          <X className="h-5 w-5" />
        </button>

        {views.length > 1 && (
          <>
            <GalleryArrow side="start" label={dict.product.prevImage} onClick={() => onStep(-1)} />
            <GalleryArrow side="end" label={dict.product.nextImage} onClick={() => onStep(1)} />
            <span className="absolute bottom-5 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white tabular-nums">
              {active + 1} / {views.length}
            </span>
          </>
        )}
      </div>
    </dialog>
  );
}

function GalleryArrow({
  side,
  label,
  onClick,
  revealOnHover = false,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
  /** Inside the gallery frame the arrows stay out of the way until pointed at. */
  revealOnHover?: boolean;
}) {
  const Icon = side === "start" ? ChevronLeft : ChevronRight;
  const reveal = revealOnHover
    ? "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
    : "";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-opacity hover:bg-white cursor-pointer ${reveal} ${
        side === "start" ? "ltr:left-3 rtl:right-3" : "ltr:right-3 rtl:left-3"
      }`}
    >
      <Icon className="h-5 w-5 rtl:rotate-180" />
    </button>
  );
}
