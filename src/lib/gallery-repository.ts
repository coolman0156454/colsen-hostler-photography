import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { GalleryRecord } from "@/types/gallery";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "galleries.json");

let writeQueue = Promise.resolve();

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
};

export const readGalleries = async () => {
  await ensureStore();
  const raw = await readFile(dataFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as GalleryRecord[];
    if (!Array.isArray(parsed)) {
      return [] as GalleryRecord[];
    }
    return parsed;
  } catch {
    return [] as GalleryRecord[];
  }
};

export const writeGalleries = async (galleries: GalleryRecord[]) => {
  writeQueue = writeQueue.then(async () => {
    await ensureStore();
    await writeFile(dataFile, JSON.stringify(galleries, null, 2), "utf8");
  });

  await writeQueue;
};

