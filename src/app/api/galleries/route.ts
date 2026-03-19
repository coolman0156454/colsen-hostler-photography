import { NextResponse } from "next/server";

import { getAllGalleries } from "@/lib/gallery-service";

export async function GET() {
  const galleries = await getAllGalleries();

  return NextResponse.json({
    galleries: galleries.map((gallery) => ({
      id: gallery.id,
      slug: gallery.slug,
      name: gallery.name,
      category: gallery.category,
      description: gallery.description,
      coverImageId: gallery.coverImageId,
      visibility: gallery.visibility,
      isFeatured: gallery.isFeatured,
    })),
  });
}

