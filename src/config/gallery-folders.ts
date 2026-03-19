import { GalleryVisibility, type GalleryVisibility as GalleryVisibilityType } from "@/types/gallery";

interface ConfiguredGallery {
  slug: string;
  name: string;
  category: string;
  description?: string;
  folderId: string;
  visibility?: GalleryVisibilityType;
  isFeatured?: boolean;
}

export const configuredGalleries: ConfiguredGallery[] = [
  {
    slug: "sports",
    name: "Sports",
    category: "Sports",
    description: "Fast-paced game moments and athlete highlights.",
    folderId: process.env.DRIVE_FOLDER_SPORTS ?? "",
    visibility: GalleryVisibility.PUBLIC,
    isFeatured: true,
  },
  {
    slug: "portraits",
    name: "Portraits",
    category: "Portraits",
    description: "Clean portrait sessions with natural light and edge.",
    folderId: process.env.DRIVE_FOLDER_PORTRAITS ?? "",
    visibility: GalleryVisibility.PUBLIC,
    isFeatured: true,
  },
  {
    slug: "events",
    name: "Events",
    category: "Events",
    description: "Story-driven coverage for school and community events.",
    folderId: process.env.DRIVE_FOLDER_EVENTS ?? "",
    visibility: GalleryVisibility.PUBLIC,
    isFeatured: false,
  },
];

export const featuredDriveFolderId = process.env.DRIVE_FOLDER_FEATURED ?? "";
