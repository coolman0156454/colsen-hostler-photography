"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import type { GalleryImage } from "@/types/gallery";

type FeaturedGridProps = {
  images: GalleryImage[];
};

export function FeaturedGrid({ images }: FeaturedGridProps) {
  const visibleImages = images.slice(0, 6);

  if (visibleImages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Add a Drive folder ID to load featured photos on the homepage.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleImages.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.06, duration: 0.35 }}
          className="group overflow-hidden rounded-2xl border border-zinc-300/70 bg-zinc-200/20 dark:border-zinc-800/70 dark:bg-zinc-900/40"
        >
          <Image
            src={image.fullUrl}
            alt={image.name}
            width={1400}
            height={1000}
            className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  );
}

