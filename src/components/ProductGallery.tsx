"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Play } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

type View = { type: "image" | "video"; src: string };

export default function ProductGallery({
  imageUrl,
  videoUrl,
  name,
  dict,
}: {
  imageUrl: string | null;
  videoUrl: string | null;
  name: string;
  dict: Dictionary;
}) {
  const views: View[] = [];
  if (imageUrl) views.push({ type: "image", src: imageUrl });
  if (videoUrl) views.push({ type: "video", src: videoUrl });

  const [active, setActive] = useState(0);
  const current = views[active];

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="aspect-square relative bg-[#f5ede0]">
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
        </div>
      </div>

      {views.length > 1 && (
        <div className="mt-3 flex gap-3">
          {views.map((view, index) => (
            <button
              key={view.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={view.type === "video" ? dict.product.video : name}
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
