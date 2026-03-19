export const GalleryVisibility = {
  PUBLIC: "PUBLIC",
  PASSWORD: "PASSWORD",
  GOOGLE_AUTH: "GOOGLE_AUTH",
} as const;

export type GalleryVisibility =
  (typeof GalleryVisibility)[keyof typeof GalleryVisibility];

export const galleryVisibilityValues = [
  GalleryVisibility.PUBLIC,
  GalleryVisibility.PASSWORD,
  GalleryVisibility.GOOGLE_AUTH,
] as const;

export interface GalleryRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  folderId: string;
  coverImageId: string | null;
  visibility: GalleryVisibility;
  passwordHash: string | null;
  isFeatured: boolean;
  managedByConfig: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  name: string;
  createdTime: string | null;
  width: number | null;
  height: number | null;
  thumbnailUrl: string;
  fullUrl: string;
  downloadUrl: string;
}
