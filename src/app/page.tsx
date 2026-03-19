import Link from "next/link";

import { AnimatedSection } from "@/components/animated-section";
import { FeaturedGrid } from "@/components/featured-grid";
import { getAllGalleries, getFeaturedImages } from "@/lib/gallery-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredImages, galleries] = await Promise.all([
    getFeaturedImages(),
    getAllGalleries(),
  ]);

  const featuredGalleries = galleries.filter((gallery) => gallery.isFeatured);

  return (
    <div className="space-y-16">
      <AnimatedSection className="grid gap-8 rounded-3xl border border-zinc-300/70 bg-white/80 p-8 shadow-sm backdrop-blur lg:grid-cols-[1.2fr_1fr] dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
            Sports + Portrait Photographer
          </p>
          <h1 className="font-heading text-6xl uppercase leading-[0.95] tracking-wide text-zinc-900 sm:text-7xl dark:text-zinc-100">
            Colsen Hostler Photography
          </h1>
          <p className="max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-300">
            Modern sports action and portrait storytelling shot with pace, detail,
            and attitude.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/galleries"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              View Galleries
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Book a Session
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-300/70 bg-gradient-to-br from-zinc-100 to-zinc-200 p-6 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Focus Areas
          </p>
          <ul className="mt-3 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <li>&bull; Athletic portraits</li>
            <li>&bull; High-speed action coverage</li>
            <li>&bull; Team media day sessions</li>
            <li>&bull; Senior and lifestyle portraits</li>
          </ul>
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            Based in the U.S. and available for local and travel shoots.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-4xl uppercase tracking-wide">
              Featured Work
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Images are loaded live from Google Drive.
            </p>
          </div>
        </div>
        <FeaturedGrid images={featuredImages} />
      </AnimatedSection>

      <AnimatedSection className="space-y-4">
        <h2 className="font-heading text-4xl uppercase tracking-wide">
          Featured Galleries
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGalleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/galleries/${gallery.slug}`}
              className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-300">
                {gallery.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{gallery.name}</h3>
              {gallery.description ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {gallery.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
