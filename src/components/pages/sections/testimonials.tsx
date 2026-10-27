"use client";

import React, { useState, useEffect } from "react";
import { portfolioData } from "@/lib/portfolio-data";
import { achievepicsApi } from "@/lib/client-api";

import SectionHeading from "@/components/section-heading";

const SQRT_5000 = Math.sqrt(5000);

// keeps the original testimonial-card frame: angled top corners + diagonal accent line
const CARD_CLIP_PATH =
  "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)";

export const Testimonials: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    achievepicsApi.getImages().then(setImages).catch(() => setImages([]));
  }, []);

  return (
    <SectionHeading text="Achievements" id="testimonials">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.06)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:18px_18px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)]" />
      </div>

      {/* Gallery — image-only cards, no per-image captions */}
      <div className="grid grid-cols-2 gap-6 p-8 sm:grid-cols-3 md:grid-cols-4 md:p-12 lg:grid-cols-5 lg:p-16">
        {images.map((src) => (
          <div
            key={src}
            className="relative aspect-square border-2 transition-colors duration-500 hover:border-primary/50"
            style={{ clipPath: CARD_CLIP_PATH }}
          >
            <span
              className="bg-border absolute block origin-top-right rotate-45"
              style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }}
            />
            <img
              src={src}
              alt="Achievement photo"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Unified achievement details — separate from the individual images */}
      <div className="border-t px-8 py-12 md:px-12 lg:px-16">
        <ul className="grid gap-x-12 md:grid-cols-2">
          {portfolioData.achievements.map((a) => (
            <li
              key={a.title}
              className="flex items-baseline justify-between gap-4 border-b py-3"
            >
              <span className="text-sm font-medium md:text-base">
                {a.title}
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-xs">
                {a.organization} · {a.date}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SectionHeading>
  );
};
