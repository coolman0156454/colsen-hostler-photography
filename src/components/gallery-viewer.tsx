"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Share2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { GalleryImage } from "@/types/gallery";

type GalleryViewerProps = {
  images: GalleryImage[];
  galleryName: string;
};

export function GalleryViewer({ images, galleryName }: GalleryViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeIndex]);

  const closeViewer = () => {
    setActiveIndex(null);
    setShareMessage(null);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchEndX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(delta) < 48) {
      return;
    }

    if (delta > 0) {
      showPrev();
      return;
    }

    showNext();
  };

  const handleShare = async () => {
    if (!activeImage || isSharing) {
      return;
    }

    setIsSharing(true);
    setShareMessage(null);

    const shareUrl = activeImage.downloadUrl;
    const shareTitle = `${galleryName} - ${activeImage.name}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `Photo from ${galleryName}`,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Image link copied.");
    } catch {
      setShareMessage("Unable to share this image.");
    } finally {
      setIsSharing(false);
    }
  };

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
        <div
          className="fixed inset-0 z-50 bg-black/95"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close viewer overlay"
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex h-full w-full flex-col">
            <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.18em] text-zinc-300">
                  {galleryName}
                </p>
                <p className="truncate text-sm text-zinc-100">{activeImage.name}</p>
              </div>
              <button
                type="button"
                onClick={closeViewer}
                className="rounded-full border border-zinc-200/20 bg-black/40 p-2 text-zinc-100 transition-colors hover:bg-black/60"
                aria-label="Close fullscreen viewer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-2 pb-2 sm:px-8">
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 z-20 rounded-full border border-zinc-200/20 bg-black/45 p-2.5 text-zinc-100 transition-colors hover:bg-black/70 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="relative h-full w-full max-w-6xl">
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
                className="absolute right-3 z-20 rounded-full border border-zinc-200/20 bg-black/45 p-2.5 text-zinc-100 transition-colors hover:bg-black/70 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="border-t border-zinc-200/15 bg-zinc-950/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  <span>
                    {activeIndex! + 1} / {images.length}
                  </span>
                  <span className="ml-3 hidden sm:inline">Swipe or use arrows</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeImage.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200/20 bg-zinc-900/50 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <a
                    href={activeImage.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200/20 bg-zinc-900/50 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
                  >
                    <ExternalLink size={14} />
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200/20 bg-zinc-900/50 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Share2 size={14} />
                    {isSharing ? "Sharing..." : "Share"}
                  </button>
                </div>
              </div>

              {shareMessage ? (
                <p className="mt-2 text-xs text-zinc-300">{shareMessage}</p>
              ) : (
                <p className="mt-2 text-xs text-zinc-500 sm:hidden">
                  Tip: press and hold image on iPhone to save.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
