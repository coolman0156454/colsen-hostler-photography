"use client";

import { motion } from "framer-motion";
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

type FeaturedGridProps = {
  images: GalleryImage[];
};

export function FeaturedGrid({ images }: FeaturedGridProps) {
  const visibleImages = images.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const activeImage = useMemo(
    () => (activeIndex === null ? null : visibleImages[activeIndex]),
    [activeIndex, visibleImages],
  );

  const showPrev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + visibleImages.length) % visibleImages.length);
  }, [activeIndex, visibleImages.length]);

  const showNext = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % visibleImages.length);
  }, [activeIndex, visibleImages.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, showNext, showPrev]);

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
    const shareTitle = `Featured Work - ${activeImage.name}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: "Photo from Colsen Hostler Photography",
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

  if (visibleImages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No gallery images are available for featured work yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleImages.map((image, index) => (
          <motion.button
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="group overflow-hidden rounded-2xl border border-zinc-300/70 bg-zinc-200/20 text-left dark:border-zinc-800/70 dark:bg-zinc-900/40"
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image
              src={image.fullUrl}
              alt={image.name}
              width={1400}
              height={1000}
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </motion.button>
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
                  Featured Work
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
                  alt={activeImage.name}
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
                    {activeIndex! + 1} / {visibleImages.length}
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
