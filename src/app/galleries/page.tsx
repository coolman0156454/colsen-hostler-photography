import Image from "next/image";
import Link from "next/link";

import { getAllGalleries } from "@/lib/gallery-service";
import { type GalleryVisibility } from "@/types/gallery";

const visibilityLabel: Record<GalleryVisibility, string> = {
  PUBLIC: "Public",
  PASSWORD: "Password",
  GOOGLE_AUTH: "Google Login",
};

const coverUrl = (coverImageId: string | null) =>
  coverImageId ? `https://lh3.googleusercontent.com/d/${coverImageId}=w1200` : null;

export default async function GalleriesPage() {
  const galleries = await getAllGalleries();

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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <Link
            key={gallery.id}
            href={`/galleries/${gallery.slug}`}
            className="group overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="relative h-52 w-full">
              {coverUrl(gallery.coverImageId) ? (
                <Image
                  src={coverUrl(gallery.coverImageId)!}
                  alt={`${gallery.name} cover`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-cyan-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-cyan-950" />
              )}
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
    </section>
  );
}
