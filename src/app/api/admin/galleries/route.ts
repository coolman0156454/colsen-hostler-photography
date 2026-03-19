import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { clearDriveCache } from "@/lib/drive";
import { createGallery } from "@/lib/gallery-service";
import { GalleryVisibility, galleryVisibilityValues } from "@/types/gallery";

const createGallerySchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().optional(),
    category: z.string().min(1),
    description: z.string().optional(),
    folderId: z.string().min(1),
    coverImageId: z.string().optional(),
    visibility: z.enum(galleryVisibilityValues),
    password: z.string().optional(),
    isFeatured: z.boolean().optional(),
  })
  .superRefine((data, context) => {
    if (data.visibility === GalleryVisibility.PASSWORD && !data.password?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required for password-protected galleries.",
      });
    }
  });

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createGallerySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid gallery payload.",
      },
      { status: 400 },
    );
  }

  try {
    const gallery = await createGallery(parsed.data);
    clearDriveCache(parsed.data.folderId);

    return NextResponse.json({ gallery }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery", error);
    return NextResponse.json(
      { error: "Failed to create gallery. Check slug/folder uniqueness." },
      { status: 400 },
    );
  }
}
