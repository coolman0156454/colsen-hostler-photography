"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { GalleryImage } from "@/types/gallery";

type GalleryViewerProps = {
  images: GalleryImage[];
  galleryName: string;
};

export function GalleryViewer({ images, galleryName }: GalleryViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = useMemo(
    () => (activeIndex === null ? null : images[activeIndex]),
    [activeIndex, images],
  );

  const showPrev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length]);

  const showNext = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
  }, [activeIndex, images.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, showNext, showPrev]);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        This gallery does not have images yet.
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group mb-4 w-full overflow-hidden rounded-2xl border border-zinc-300/60 bg-zinc-100/20 text-left shadow-sm transition-transform hover:-translate-y-1 dark:border-zinc-800/60 dark:bg-zinc-900/40"
          >
            <Image
              src={image.fullUrl}
              alt={image.name}
              width={1400}
              height={1000}
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-8">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full border border-zinc-200/20 bg-black/40 p-2 text-zinc-100 transition-colors hover:bg-black/60"
            aria-label="Close fullscreen viewer"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={showPrev}
            className="absolute left-4 rounded-full border border-zinc-200/20 bg-black/40 p-2 text-zinc-100 transition-colors hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="relative h-[80vh] w-full max-w-6xl">
            <Image
              src={activeImage.fullUrl}
              alt={`${galleryName} - ${activeImage.name}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-4 rounded-full border border-zinc-200/20 bg-black/40 p-2 text-zinc-100 transition-colors hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </>
  );
}
