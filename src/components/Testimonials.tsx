import { Star, Quote } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

export default function Testimonials({ dict }: { dict: Dictionary }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {dict.testimonials.items.map((item) => (
        <figure key={item.name} className="card p-6 flex flex-col">
          <Quote className="h-7 w-7 text-accent-light rtl:scale-x-[-1]" />
          <div className="mt-2 flex gap-0.5 text-accent" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <blockquote className="mt-3 text-sm text-foreground/90 leading-relaxed flex-1">
            “{item.text}”
          </blockquote>
          <figcaption className="mt-4 border-t border-border pt-3">
            <span className="font-semibold text-primary">{item.name}</span>
            <span className="text-sm text-muted"> — {item.location}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
