import { notFound } from "next/navigation";

import { GalleryDetailClient } from "@/components/gallery-detail-client";
import { getAuthSession } from "@/lib/auth";
import { getGalleryBySlug } from "@/lib/gallery-service";
import { GalleryVisibility } from "@/types/gallery";

type GalleryDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GalleryDetailPage({
  params,
  searchParams,
}: GalleryDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const rawPath = Array.isArray(query.path) ? query.path[0] : query.path;
  const initialPath = rawPath
    ? rawPath
        .split(",")
        .map((segment) => segment.trim())
        .filter(Boolean)
    : [];

  const [gallery, session] = await Promise.all([
    getGalleryBySlug(slug),
    getAuthSession(),
  ]);

  if (!gallery) {
    notFound();
  }

  const canBypassProtection =
    gallery.visibility === GalleryVisibility.GOOGLE_AUTH &&
    (Boolean(session?.user?.isAdmin) || Boolean(session?.user?.email));

  return (
    <GalleryDetailClient
      slug={gallery.slug}
      name={gallery.name}
      description={gallery.description}
      visibility={gallery.visibility}
      canBypassProtection={canBypassProtection}
      initialPath={initialPath}
    />
  );
}
