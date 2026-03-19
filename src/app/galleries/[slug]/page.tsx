import { notFound } from "next/navigation";

import { GalleryDetailClient } from "@/components/gallery-detail-client";
import { getAuthSession } from "@/lib/auth";
import { getGalleryBySlug } from "@/lib/gallery-service";
import { GalleryVisibility } from "@/types/gallery";

type GalleryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { slug } = await params;

  const [gallery, session] = await Promise.all([
    getGalleryBySlug(slug),
    getAuthSession(),
  ]);

  if (!gallery) {
    notFound();
  }

  const canBypassProtection =
    Boolean(session?.user?.isAdmin) ||
    (gallery.visibility === GalleryVisibility.GOOGLE_AUTH &&
      Boolean(session?.user?.email));

  return (
    <GalleryDetailClient
      slug={gallery.slug}
      name={gallery.name}
      description={gallery.description}
      visibility={gallery.visibility}
      canBypassProtection={canBypassProtection}
    />
  );
}
