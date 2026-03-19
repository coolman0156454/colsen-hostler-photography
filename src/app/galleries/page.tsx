import Image from "next/image";
import Link from "next/link";

import { listDriveFolderImages, resolveDriveImage } from "@/lib/drive";
import { getAllGalleries } from "@/lib/gallery-service";
import { type GalleryVisibility } from "@/types/gallery";

export const dynamic = "force-dynamic";

const visibilityLabel: Record<GalleryVisibility, string> = {
  PUBLIC: "Public",
  PASSWORD: "Password",
  GOOGLE_AUTH: "Google Login",
};

export default async function GalleriesPage() {
  const galleries = await getAllGalleries();
  const galleryCards = (
    await Promise.all(
      galleries.map(async (gallery) => {
        if (gallery.coverImageId) {
          const coverImage = await resolveDriveImage(gallery.coverImageId);
          if (coverImage) {
            return {
              gallery,
              previewUrl: coverImage.thumbnailUrl,
            };
          }
        }

        try {
          const [firstImage] = await listDriveFolderImages(gallery.folderId);
          if (!firstImage) {
            return null;
          }

          return {
            gallery,
            previewUrl: firstImage.thumbnailUrl,
          };
        } catch (error) {
          console.error(`Failed to build preview for gallery ${gallery.slug}`, error);
          return null;
        }
      }),
    )
  ).filter(
    (
      card,
    ): card is {
      gallery: Awaited<ReturnType<typeof getAllGalleries>>[number];
      previewUrl: string;
    } => Boolean(card?.previewUrl),
  );

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
          Portfolio
        </p>
        <h1 className="font-heading text-5xl uppercase tracking-wide">Galleries</h1>
        <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Every gallery is connected to a Google Drive folder and updates with live
          image pulls.
        </p>
      </div>

      {galleryCards.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryCards.map(({ gallery, previewUrl }) => (
            <Link
              key={gallery.id}
              href={`/galleries/${gallery.slug}`}
              className="group overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={previewUrl}
                  alt={`${gallery.name} cover`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{gallery.name}</h2>
                  <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                    {visibilityLabel[gallery.visibility]}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-300">
                  {gallery.category}
                </p>
                {gallery.description ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {gallery.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          No galleries with published preview images are available yet.
        </div>
      )}
    </section>
  );
}
