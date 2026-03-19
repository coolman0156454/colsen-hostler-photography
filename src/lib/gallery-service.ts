import {
  configuredGalleries,
  featuredDriveFolderId,
} from "@/config/gallery-folders";
import { listDriveFolderImages } from "@/lib/drive";
import { readGalleries, writeGalleries } from "@/lib/gallery-repository";
import { hashGalleryPassword } from "@/lib/security";
import { slugify } from "@/lib/slugs";
import {
  GalleryVisibility,
  type GalleryRecord,
  type GalleryVisibility as GalleryVisibilityType,
} from "@/types/gallery";

type CreateGalleryInput = {
  name: string;
  category: string;
  description?: string;
  folderId: string;
  coverImageId?: string;
  visibility: GalleryVisibilityType;
  password?: string;
  slug?: string;
  isFeatured?: boolean;
};

type UpdateGalleryInput = CreateGalleryInput & {
  id: string;
};

let hasSyncedConfiguredGalleries = false;

const sortGalleries = (galleries: GalleryRecord[]) =>
  [...galleries].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return Number(b.isFeatured) - Number(a.isFeatured);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

export const syncConfiguredGalleries = async () => {
  if (hasSyncedConfiguredGalleries) {
    return;
  }

  const validConfiguredGalleries = configuredGalleries.filter((gallery) =>
    gallery.folderId.trim(),
  );
  if (validConfiguredGalleries.length === 0) {
    hasSyncedConfiguredGalleries = true;
    return;
  }

  const existing = await readGalleries();
  const now = new Date().toISOString();
  let changed = false;

  for (const configGallery of validConfiguredGalleries) {
    const index = existing.findIndex((gallery) => gallery.slug === configGallery.slug);

    if (index === -1) {
      existing.push({
        id: crypto.randomUUID(),
        slug: configGallery.slug,
        name: configGallery.name,
        category: configGallery.category,
        description: configGallery.description ?? null,
        folderId: configGallery.folderId.trim(),
        coverImageId: null,
        visibility: configGallery.visibility ?? GalleryVisibility.PUBLIC,
        passwordHash: null,
        isFeatured: Boolean(configGallery.isFeatured),
        managedByConfig: true,
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
      continue;
    }

    const current = existing[index];
    const updated: GalleryRecord = {
      ...current,
      name: configGallery.name,
      category: configGallery.category,
      description: configGallery.description ?? null,
      folderId: configGallery.folderId.trim(),
      visibility: configGallery.visibility ?? GalleryVisibility.PUBLIC,
      isFeatured: Boolean(configGallery.isFeatured),
      managedByConfig: true,
      updatedAt: now,
    };

    existing[index] = updated;
    changed = true;
  }

  if (changed) {
    await writeGalleries(existing);
  }

  hasSyncedConfiguredGalleries = true;
};

export const getAllGalleries = async () => {
  await syncConfiguredGalleries();
  return sortGalleries(await readGalleries());
};

export const getGalleryBySlug = async (slug: string) => {
  await syncConfiguredGalleries();
  const galleries = await readGalleries();
  return galleries.find((gallery) => gallery.slug === slug) ?? null;
};

export const getFeaturedImages = async () => {
  await syncConfiguredGalleries();

  if (featuredDriveFolderId.trim()) {
    return listDriveFolderImages(featuredDriveFolderId.trim());
  }

  const galleries = await readGalleries();
  const featuredGallery = galleries.find((gallery) => gallery.isFeatured);

  if (!featuredGallery) {
    return [];
  }

  return listDriveFolderImages(featuredGallery.folderId);
};

export const createGallery = async (input: CreateGalleryInput) => {
  const visibility = input.visibility;
  const requiresPassword = visibility === GalleryVisibility.PASSWORD;
  const password = input.password?.trim();

  if (requiresPassword && !password) {
    throw new Error("Password is required for password-protected galleries.");
  }

  const normalizedSlug = slugify(input.slug?.trim() || input.name);
  if (!normalizedSlug) {
    throw new Error("Gallery slug could not be generated.");
  }

  const galleries = await readGalleries();
  if (galleries.some((gallery) => gallery.slug === normalizedSlug)) {
    throw new Error("Gallery slug already exists.");
  }

  if (galleries.some((gallery) => gallery.folderId === input.folderId.trim())) {
    throw new Error("This Google Drive folder is already linked to another gallery.");
  }

  const now = new Date().toISOString();
  const created: GalleryRecord = {
    id: crypto.randomUUID(),
    slug: normalizedSlug,
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description?.trim() || null,
    folderId: input.folderId.trim(),
    coverImageId: input.coverImageId?.trim() || null,
    visibility,
    passwordHash: requiresPassword ? await hashGalleryPassword(password!) : null,
    isFeatured: Boolean(input.isFeatured),
    managedByConfig: false,
    createdAt: now,
    updatedAt: now,
  };

  galleries.push(created);
  await writeGalleries(galleries);

  return created;
};

export const updateGallery = async (input: UpdateGalleryInput) => {
  const galleryId = input.id.trim();
  if (!galleryId) {
    throw new Error("Gallery id is required.");
  }

  const visibility = input.visibility;
  const requiresPassword = visibility === GalleryVisibility.PASSWORD;
  const password = input.password?.trim();
  const normalizedSlug = slugify(input.slug?.trim() || input.name);

  if (!normalizedSlug) {
    throw new Error("Gallery slug could not be generated.");
  }

  const trimmedFolderId = input.folderId.trim();
  if (!trimmedFolderId) {
    throw new Error("Drive folder id is required.");
  }

  const galleries = await readGalleries();
  const index = galleries.findIndex((gallery) => gallery.id === galleryId);

  if (index === -1) {
    throw new Error("Gallery not found.");
  }

  if (
    galleries.some(
      (gallery) => gallery.id !== galleryId && gallery.slug === normalizedSlug,
    )
  ) {
    throw new Error("Gallery slug already exists.");
  }

  if (
    galleries.some(
      (gallery) => gallery.id !== galleryId && gallery.folderId === trimmedFolderId,
    )
  ) {
    throw new Error("This Google Drive folder is already linked to another gallery.");
  }

  const current = galleries[index];

  if (requiresPassword && !password && !current.passwordHash) {
    throw new Error("Password is required for password-protected galleries.");
  }

  const now = new Date().toISOString();
  const updated: GalleryRecord = {
    ...current,
    slug: normalizedSlug,
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description?.trim() || null,
    folderId: trimmedFolderId,
    coverImageId: input.coverImageId?.trim() || null,
    visibility,
    passwordHash: requiresPassword
      ? password
        ? await hashGalleryPassword(password)
        : current.passwordHash
      : null,
    isFeatured: Boolean(input.isFeatured),
    managedByConfig: false,
    updatedAt: now,
  };

  galleries[index] = updated;
  await writeGalleries(galleries);

  return updated;
};
