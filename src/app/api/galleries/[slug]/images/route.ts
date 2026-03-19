import { NextResponse } from "next/server";

import { canViewGallery } from "@/lib/access";
import { getAuthSession } from "@/lib/auth";
import { listDriveFolderContents } from "@/lib/drive";
import { getGalleryBySlug } from "@/lib/gallery-service";
import { type GalleryBreadcrumb } from "@/types/gallery";

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
    const url = new URL(request.url);
    const rawPath = url.searchParams.get("path") ?? "";
    const pathIds = rawPath
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean);
    const breadcrumbs: GalleryBreadcrumb[] = [
      { id: gallery.folderId, name: gallery.name },
    ];

    let currentFolderId = gallery.folderId;
    let currentContents = await listDriveFolderContents(currentFolderId);

    for (const folderId of pathIds) {
      const matchingFolder = currentContents.folders.find(
        (folder) => folder.id === folderId,
      );

      if (!matchingFolder) {
        return NextResponse.json(
          { error: "Invalid gallery folder path." },
          { status: 400 },
        );
      }

      breadcrumbs.push({ id: matchingFolder.id, name: matchingFolder.name });
      currentFolderId = matchingFolder.id;
      currentContents = await listDriveFolderContents(currentFolderId);
    }

    return NextResponse.json(
      {
        currentFolderId,
        breadcrumbs,
        folders: currentContents.folders,
        images: currentContents.images,
      },
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
