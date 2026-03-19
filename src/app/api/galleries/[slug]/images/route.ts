import { NextResponse } from "next/server";

import { canViewGallery } from "@/lib/access";
import { getAuthSession } from "@/lib/auth";
import { listDriveFolderImages } from "@/lib/drive";
import { getGalleryBySlug } from "@/lib/gallery-service";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  const session = await getAuthSession();
  const token = request.headers.get("x-gallery-token");
  const canView = canViewGallery(gallery, session, token);

  if (!canView) {
    return NextResponse.json(
      { error: "Access denied for this gallery." },
      { status: 403 },
    );
  }

  try {
    const images = await listDriveFolderImages(gallery.folderId);

    return NextResponse.json(
      { images },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Failed to list drive folder images", error);
    return NextResponse.json(
      { error: "Unable to load images from Google Drive." },
      { status: 500 },
    );
  }
}

