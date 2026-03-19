import { NextResponse } from "next/server";
import { z } from "zod";

import { getGalleryBySlug } from "@/lib/gallery-service";
import {
  createGalleryAccessToken,
  verifyGalleryPassword,
} from "@/lib/security";
import { GalleryVisibility } from "@/types/gallery";

type Context = {
  params: Promise<{ slug: string }>;
};

const unlockSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request, context: Context) {
  const { slug } = await context.params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  if (gallery.visibility !== GalleryVisibility.PASSWORD || !gallery.passwordHash) {
    return NextResponse.json(
      { error: "This gallery does not require a password." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = unlockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password payload." }, { status: 400 });
  }

  const isValidPassword = await verifyGalleryPassword(
    parsed.data.password,
    gallery.passwordHash,
  );

  if (!isValidPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = createGalleryAccessToken(gallery.slug);
  return NextResponse.json({ token });
}
