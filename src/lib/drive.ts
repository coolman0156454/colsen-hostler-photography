import { google } from "googleapis";

import { env } from "@/lib/env";
import { type DriveFolder, type GalleryImage } from "@/types/gallery";

const DRIVE_SCOPE = ["https://www.googleapis.com/auth/drive.readonly"];
const CACHE_TTL_MS = 1000 * 60 * 5;
const MAX_CACHE_ENTRIES = 75;
const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

type CacheEntry = {
  expiresAt: number;
  images: GalleryImage[];
};

const driveCache = new Map<string, CacheEntry>();
const folderContentsCache = new Map<
  string,
  {
    expiresAt: number;
    folders: DriveFolder[];
    images: GalleryImage[];
  }
>();

let driveClient: ReturnType<typeof google.drive> | null = null;

const trimCache = () => {
  if (driveCache.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const oldestKey = driveCache.keys().next().value;
  if (oldestKey) {
    driveCache.delete(oldestKey);
  }
};

const getDriveClient = () => {
  if (driveClient) {
    return driveClient;
  }

  if (env.googleServiceAccountEmail && env.googleServiceAccountPrivateKey) {
    const auth = new google.auth.JWT({
      email: env.googleServiceAccountEmail,
      key: env.googleServiceAccountPrivateKey.replace(/\\n/g, "\n"),
      scopes: DRIVE_SCOPE,
      subject: env.googleServiceAccountImpersonateUser || undefined,
    });

    driveClient = google.drive({
      version: "v3",
      auth,
    });

    return driveClient;
  }

  if (env.googleDriveApiKey) {
    driveClient = google.drive({
      version: "v3",
      auth: env.googleDriveApiKey,
    });

    return driveClient;
  }

  throw new Error(
    "Google Drive API credentials are not configured. Add GOOGLE_DRIVE_API_KEY or service account credentials.",
  );
};

const toImage = (file: {
  id: string;
  name: string;
  createdTime?: string | null;
  imageMediaMetadata?: { width?: number | null; height?: number | null } | null;
}) => ({
  id: file.id,
  name: file.name,
  createdTime: file.createdTime ?? null,
  width: file.imageMediaMetadata?.width ?? null,
  height: file.imageMediaMetadata?.height ?? null,
  thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
  fullUrl: `https://lh3.googleusercontent.com/d/${file.id}=w2400`,
  downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
});

const toFolder = (file: { id: string; name: string }) => ({
  id: file.id,
  name: file.name,
});

const isFolder = (mimeType: string | null | undefined) =>
  mimeType === DRIVE_FOLDER_MIME_TYPE;

const imageOrFolderQuery = (parentId: string) =>
  `'${parentId}' in parents and trashed = false and (mimeType = '${DRIVE_FOLDER_MIME_TYPE}' or mimeType contains 'image/')`;

export const normalizeDriveResourceId = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (DRIVE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const queryId = url.searchParams.get("id")?.trim();
    if (queryId && DRIVE_ID_PATTERN.test(queryId)) {
      return queryId;
    }

    const pathMatch = url.pathname.match(
      /\/(?:file\/d|drive\/folders|document\/d|presentation\/d|spreadsheets\/d)\/([^/]+)/,
    );
    if (pathMatch?.[1] && DRIVE_ID_PATTERN.test(pathMatch[1])) {
      return pathMatch[1];
    }
  } catch {
    return null;
  }

  return null;
};

export const clearDriveCache = (folderId?: string) => {
  if (!folderId) {
    driveCache.clear();
    folderContentsCache.clear();
    return;
  }

  driveCache.delete(folderId);
  folderContentsCache.delete(folderId);
};

export const listDriveFolderContents = async (
  folderId: string,
  options?: { forceRefresh?: boolean },
) => {
  const trimmedFolderId = folderId.trim();
  if (!trimmedFolderId) {
    return {
      folders: [] as DriveFolder[],
      images: [] as GalleryImage[],
    };
  }

  const now = Date.now();
  const cached = folderContentsCache.get(trimmedFolderId);

  if (!options?.forceRefresh && cached && cached.expiresAt > now) {
    return {
      folders: cached.folders,
      images: cached.images,
    };
  }

  const drive = getDriveClient();
  const folders: DriveFolder[] = [];
  const images: GalleryImage[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: imageOrFolderQuery(trimmedFolderId),
      fields:
        "nextPageToken, files(id, name, mimeType, createdTime, imageMediaMetadata(width,height))",
      pageSize: 1000,
      pageToken,
      orderBy: "folder,name,createdTime desc",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    const pageFiles = response.data.files ?? [];
    for (const file of pageFiles) {
      if (!file.id || !file.name) {
        continue;
      }

      if (isFolder(file.mimeType)) {
        folders.push(toFolder({ id: file.id, name: file.name }));
        continue;
      }

      images.push(
        toImage({
          id: file.id,
          name: file.name,
          createdTime: file.createdTime,
          imageMediaMetadata: file.imageMediaMetadata,
        }),
      );
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  folders.sort((a, b) => a.name.localeCompare(b.name));
  images.sort((a, b) => {
    const aTime = a.createdTime ?? "";
    const bTime = b.createdTime ?? "";
    return bTime.localeCompare(aTime);
  });

  folderContentsCache.set(trimmedFolderId, {
    expiresAt: now + CACHE_TTL_MS,
    folders,
    images,
  });
  trimCache();

  return { folders, images };
};

export const listDriveFolderImages = async (
  folderId: string,
  options?: { forceRefresh?: boolean },
) => {
  const trimmedFolderId = folderId.trim();
  if (!trimmedFolderId) {
    return [] as GalleryImage[];
  }

  const now = Date.now();
  const cached = driveCache.get(trimmedFolderId);

  if (
    !options?.forceRefresh &&
    cached &&
    cached.expiresAt > now
  ) {
    return cached.images;
  }

  const drive = getDriveClient();
  const imagesById = new Map<string, GalleryImage>();
  const folderQueue: string[] = [trimmedFolderId];
  const visitedFolders = new Set<string>();

  while (folderQueue.length > 0) {
    const currentFolderId = folderQueue.shift()!;
    if (visitedFolders.has(currentFolderId)) {
      continue;
    }

    visitedFolders.add(currentFolderId);
    let pageToken: string | undefined;

    do {
      const response = await drive.files.list({
        q: imageOrFolderQuery(currentFolderId),
        fields:
          "nextPageToken, files(id, name, mimeType, createdTime, imageMediaMetadata(width,height))",
        pageSize: 1000,
        pageToken,
        orderBy: "createdTime desc",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      });

      const pageFiles = response.data.files ?? [];
      for (const file of pageFiles) {
        if (!file.id || !file.name) {
          continue;
        }

        if (isFolder(file.mimeType)) {
          if (!visitedFolders.has(file.id)) {
            folderQueue.push(file.id);
          }
          continue;
        }

        imagesById.set(
          file.id,
          toImage({
            id: file.id,
            name: file.name,
            createdTime: file.createdTime,
            imageMediaMetadata: file.imageMediaMetadata,
          }),
        );
      }

      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  const files = [...imagesById.values()].sort((a, b) => {
    const aTime = a.createdTime ?? "";
    const bTime = b.createdTime ?? "";
    return bTime.localeCompare(aTime);
  });

  driveCache.set(trimmedFolderId, {
    expiresAt: now + CACHE_TTL_MS,
    images: files,
  });
  trimCache();

  return files;
};

export const resolveDriveImage = async (value: string | null | undefined) => {
  const resourceId = normalizeDriveResourceId(value);
  if (!resourceId) {
    return null;
  }

  const drive = getDriveClient();

  try {
    const response = await drive.files.get({
      fileId: resourceId,
      fields: "id, name, mimeType, createdTime, imageMediaMetadata(width,height)",
      supportsAllDrives: true,
    });

    const file = response.data;
    if (!file.id || !file.name) {
      return null;
    }

    if (isFolder(file.mimeType)) {
      const [firstImage] = await listDriveFolderImages(file.id);
      return firstImage ?? null;
    }

    if (!file.mimeType?.includes("image/")) {
      return null;
    }

    return toImage({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      imageMediaMetadata: file.imageMediaMetadata,
    });
  } catch (error) {
    console.error(`Failed to resolve Drive image reference ${resourceId}`, error);
    return null;
  }
};
