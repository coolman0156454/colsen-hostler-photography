"use client";

import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { startTransition, useCallback, useEffect, useState } from "react";

import { GalleryViewer } from "@/components/gallery-viewer";
import { UnlockGalleryForm } from "@/components/unlock-gallery-form";
import {
  GalleryVisibility,
  type DriveFolder,
  type GalleryBreadcrumb,
  type GalleryFolderContents,
  type GalleryImage,
  type GalleryVisibility as GalleryVisibilityType,
} from "@/types/gallery";

type GalleryDetailClientProps = {
  slug: string;
  name: string;
  description: string | null;
  visibility: GalleryVisibilityType;
  canBypassProtection: boolean;
  initialPath: string[];
};

const tokenStorageKey = (slug: string) => `gallery_access:${slug}`;

export function GalleryDetailClient({
  slug,
  name,
  description,
  visibility,
  canBypassProtection,
  initialPath,
}: GalleryDetailClientProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<GalleryBreadcrumb[]>([
    { id: slug, name },
  ]);
  const [folderPath, setFolderPath] = useState<string[]>(initialPath);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const needsPassword =
    visibility === GalleryVisibility.PASSWORD && !canBypassProtection;
  const needsGoogleLogin =
    visibility === GalleryVisibility.GOOGLE_AUTH && !canBypassProtection;

  const syncUrl = useCallback((nextPath: string[]) => {
    const url = new URL(window.location.href);

    if (nextPath.length === 0) {
      url.searchParams.delete("path");
    } else {
      url.searchParams.set("path", nextPath.join(","));
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, []);

  const loadContents = useCallback(
    async (pathOverride?: string[], overrideToken?: string | null) => {
      const requestedPath = pathOverride ?? folderPath;

      setIsLoading(true);
      setError(null);

      try {
        const resolvedToken = overrideToken ?? accessToken;
        const query =
          requestedPath.length > 0
            ? `?path=${encodeURIComponent(requestedPath.join(","))}`
            : "";
        const response = await fetch(`/api/galleries/${slug}/images${query}`, {
          headers: resolvedToken ? { "x-gallery-token": resolvedToken } : undefined,
        });
        const payload = (await response.json()) as Partial<GalleryFolderContents> & {
          error?: string;
        };

        if (!response.ok) {
          if (response.status === 403 && needsPassword && resolvedToken) {
            window.localStorage.removeItem(tokenStorageKey(slug));
            setAccessToken(null);
            setFolders([]);
            setImages([]);
            setBreadcrumbs([{ id: slug, name }]);
            setError("Saved gallery access expired. Enter the password again.");
            return;
          }

          if (response.status === 400 && requestedPath.length > 0) {
            startTransition(() => setFolderPath([]));
            syncUrl([]);
            await loadContents([], resolvedToken);
            return;
          }

          setError(payload.error ?? "Unable to load gallery contents.");
          return;
        }

        setFolders(Array.isArray(payload.folders) ? payload.folders : []);
        setImages(Array.isArray(payload.images) ? payload.images : []);
        setBreadcrumbs(
          Array.isArray(payload.breadcrumbs)
            ? payload.breadcrumbs
            : [
                {
                  id: slug,
                  name,
                },
              ],
        );
      } catch {
        setError("Unable to load gallery contents.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, folderPath, name, needsPassword, slug, syncUrl],
  );

  useEffect(() => {
    if (needsGoogleLogin) {
      setIsLoading(false);
      return;
    }

    if (needsPassword && !accessToken) {
      const savedToken = window.localStorage.getItem(tokenStorageKey(slug));
      if (savedToken) {
        setAccessToken(savedToken);
      } else {
        setIsLoading(false);
        return;
      }
    }
  }, [needsGoogleLogin, needsPassword, slug, accessToken]);

  useEffect(() => {
    if (needsGoogleLogin) {
      return;
    }

    if (needsPassword && !accessToken) {
      return;
    }

    syncUrl(folderPath);
    void loadContents(folderPath);
  }, [
    accessToken,
    folderPath,
    loadContents,
    needsGoogleLogin,
    needsPassword,
    syncUrl,
  ]);

  if (needsGoogleLogin) {
    return (
      <div className="rounded-3xl border border-zinc-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-heading text-3xl uppercase tracking-wide">
          Login Required
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          This gallery is only available to signed-in users.
        </p>
      </div>
    );
  }

  const handleUnlocked = async (token: string) => {
    window.localStorage.setItem(tokenStorageKey(slug), token);
    setAccessToken(token);
    await loadContents(folderPath, token);
  };

  const navigateToPath = (nextPath: string[]) => {
    startTransition(() => setFolderPath(nextPath));
  };

  const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name ?? name;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-5xl uppercase tracking-wide">{name}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>

      {needsPassword && !accessToken ? (
        <div className="space-y-3">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <UnlockGalleryForm slug={slug} onUnlocked={handleUnlocked} />
        </div>
      ) : null}

      {!needsPassword || accessToken ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-300 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => {
                const nextPath = breadcrumbs
                  .slice(1, index + 1)
                  .map((item) => item.id);

                return (
                  <button
                    key={breadcrumb.id}
                    type="button"
                    onClick={() => navigateToPath(nextPath)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                      index === breadcrumbs.length - 1
                        ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {index === 0 ? <FolderOpen size={14} /> : null}
                    <span>{breadcrumb.name}</span>
                    {index < breadcrumbs.length - 1 ? <ChevronRight size={14} /> : null}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Browsing: {currentFolderName}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading folder contents...
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          {!isLoading && !error ? (
            <>
              {folders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-3xl uppercase tracking-wide">
                      Folders
                    </h2>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      {folders.length} available
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => navigateToPath([...folderPath, folder.id])}
                        className="group rounded-3xl border border-zinc-300 bg-white p-5 text-left shadow-sm transition-transform hover:-translate-y-1 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                              Folder
                            </p>
                            <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                              {folder.name}
                            </h3>
                          </div>
                          <Folder className="mt-1 text-cyan-500 transition-transform group-hover:translate-x-1 dark:text-cyan-300" />
                        </div>
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                          Open {folder.name} to browse subfolders and photos.
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {images.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-3xl uppercase tracking-wide">
                      Photos
                    </h2>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      {images.length} loaded
                    </p>
                  </div>
                  <GalleryViewer images={images} galleryName={currentFolderName} />
                </div>
              ) : null}

              {folders.length === 0 && images.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  This folder does not have subfolders or images yet.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
