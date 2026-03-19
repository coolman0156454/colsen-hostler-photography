import { type Session } from "next-auth";

import { verifyGalleryAccessToken } from "@/lib/security";
import { GalleryVisibility, type GalleryRecord } from "@/types/gallery";

const isAdmin = (session: Session | null) => Boolean(session?.user?.isAdmin);

const isAuthenticated = (session: Session | null) => Boolean(session?.user?.email);

export const canViewGallery = (
  gallery: GalleryRecord,
  session: Session | null,
  galleryAccessToken: string | null,
) => {
  if (gallery.visibility === GalleryVisibility.PUBLIC) {
    return true;
  }

  if (gallery.visibility === GalleryVisibility.GOOGLE_AUTH) {
    return isAdmin(session) || isAuthenticated(session);
  }

  if (gallery.visibility === GalleryVisibility.PASSWORD) {
    if (!galleryAccessToken) {
      return false;
    }

    return verifyGalleryAccessToken(galleryAccessToken, gallery.slug);
  }

  return false;
};
