"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

export default function Faq({ dict }: { dict: Dictionary }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {dict.faq.items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start cursor-pointer hover:bg-background/60 transition-colors"
            >
              <span className="font-semibold text-foreground">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-accent-dark transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 -mt-1 text-sm text-muted leading-relaxed animate-fade-up">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
