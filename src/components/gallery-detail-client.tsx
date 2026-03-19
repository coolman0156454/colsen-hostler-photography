"use client";

import { useCallback } from "react";
import { useEffect, useState } from "react";

import { GalleryViewer } from "@/components/gallery-viewer";
import { UnlockGalleryForm } from "@/components/unlock-gallery-form";
import { GalleryVisibility, type GalleryImage, type GalleryVisibility as GalleryVisibilityType } from "@/types/gallery";

type GalleryDetailClientProps = {
  slug: string;
  name: string;
  description: string | null;
  visibility: GalleryVisibilityType;
  canBypassProtection: boolean;
};

const tokenStorageKey = (slug: string) => `gallery_access:${slug}`;

export function GalleryDetailClient({
  slug,
  name,
  description,
  visibility,
  canBypassProtection,
}: GalleryDetailClientProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const needsPassword =
    visibility === GalleryVisibility.PASSWORD && !canBypassProtection;
  const needsGoogleLogin =
    visibility === GalleryVisibility.GOOGLE_AUTH && !canBypassProtection;

  const loadImages = useCallback(async (overrideToken?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const resolvedToken = overrideToken ?? accessToken;
      const response = await fetch(`/api/galleries/${slug}/images`, {
        headers: resolvedToken ? { "x-gallery-token": resolvedToken } : undefined,
      });
      const payload = (await response.json()) as {
        images?: GalleryImage[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Unable to load images.");
        return;
      }

      setImages(payload.images ?? []);
    } catch {
      setError("Unable to load images.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, slug]);

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

    void loadImages();
  }, [accessToken, loadImages, needsGoogleLogin, needsPassword]);

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
    await loadImages(token);
  };

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
        <UnlockGalleryForm slug={slug} onUnlocked={handleUnlocked} />
      ) : null}

      {isLoading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading photos...</p>
      ) : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {!isLoading && !error && (!needsPassword || accessToken) ? (
        <GalleryViewer images={images} galleryName={name} />
      ) : null}
    </section>
  );
}
