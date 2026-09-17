"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { ImageIcon, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

type View = { type: "image" | "video"; src: string };

/** How much the zoom panel magnifies the source image. */
const ZOOM = 2.5;
/** Width of the zoom panel that opens beside the gallery, in pixels. */
const PANEL_WIDTH = 420;

export default function ProductGallery({
  imageUrl,
  galleryUrls,
  videoUrl,
  name,
  dict,
}: {
  imageUrl: string | null;
  galleryUrls?: string[];
  videoUrl: string | null;
  name: string;
  dict: Dictionary;
}) {
  const views: View[] = [];
  if (imageUrl) views.push({ type: "image", src: imageUrl });
  for (const url of galleryUrls ?? []) {
    if (url !== imageUrl) views.push({ type: "image", src: url });
  }
  if (videoUrl) views.push({ type: "video", src: videoUrl });

  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [canZoom, setCanZoom] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Zoom is a pointer affordance: skip it on touch devices, where it would
  // fight with scrolling and never be discoverable.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanZoom(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const current = views[active];
  const zoomActive = zooming && canZoom && current?.type === "image";

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const node = frameRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const lensWidth = PANEL_WIDTH / ZOOM;
    const lensHeight = rect.height / ZOOM;

    // Keep the lens fully inside the frame so the panel never shows empty edges.
    const x = clamp(e.clientX - rect.left - lensWidth / 2, 0, rect.width - lensWidth);
    const y = clamp(e.clientY - rect.top - lensHeight / 2, 0, rect.height - lensHeight);
    setLens({ x, y });
  }

  function step(direction: -1 | 1) {
    setActive((prev) => (prev + direction + views.length) % views.length);
  }

  const lensWidth = PANEL_WIDTH / ZOOM;
  const lensHeight = frame.height / ZOOM;

  return (
    <div className="relative">
      <div className="card overflow-hidden">
        <div
          ref={frameRef}
          onMouseEnter={() => {
            const rect = frameRef.current?.getBoundingClientRect();
            if (rect) setFrame({ width: rect.width, height: rect.height });
            setZooming(true);
          }}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
          className="aspect-square relative bg-[#f5ede0]"
        >
          {!current ? (
            <div className="product-image-fallback h-full">
              <ImageIcon className="h-16 w-16 text-accent-dark/30" />
            </div>
          ) : current.type === "image" ? (
            <Image
              src={current.src}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <video src={current.src} controls className="h-full w-full object-cover" />
          )}

          {zoomActive && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute border border-white/70 bg-white/25"
              style={{
                left: lens.x,
                top: lens.y,
                width: lensWidth,
                height: lensHeight,
              }}
            />
          )}

          {views.length > 1 && (
            <>
              <GalleryArrow side="start" onClick={() => step(-1)} />
              <GalleryArrow side="end" onClick={() => step(1)} />
            </>
          )}
        </div>
      </div>

      {/* Magnified panel, opening beside the gallery like a marketplace listing. */}
      {zoomActive && frame.height > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-30 hidden overflow-hidden rounded-xl border border-border bg-white shadow-lg lg:block ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4"
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
        <div className="mt-3 flex flex-wrap gap-3">
          {views.map((view, index) => (
            <button
              key={view.src}
              type="button"
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              aria-label={view.type === "video" ? dict.product.video : name}
              aria-current={active === index}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                active === index ? "border-accent" : "border-border hover:border-accent-light"
              }`}
            >
              {view.type === "image" ? (
                <Image src={view.src} alt="" fill className="object-cover" sizes="64px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                  <Play className="h-5 w-5" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: "start" | "end";
  onClick: () => void;
}) {
  const Icon = side === "start" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "start" ? "Précédent" : "Suivant"}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-md transition-colors hover:bg-white cursor-pointer ${
        side === "start" ? "ltr:left-3 rtl:right-3" : "ltr:right-3 rtl:left-3"
      }`}
    >
      <Icon className="h-5 w-5 rtl:rotate-180" />
    </button>
  );
}
