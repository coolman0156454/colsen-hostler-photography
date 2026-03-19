"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { GalleryVisibility } from "@/types/gallery";

export type EditableGallery = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  folderId: string;
  coverImageId: string | null;
  visibility: GalleryVisibility;
  isFeatured: boolean;
  managedByConfig: boolean;
  hasPassword: boolean;
};

const visibilityOptions = [
  { label: "Public", value: GalleryVisibility.PUBLIC },
  { label: "Password Protected", value: GalleryVisibility.PASSWORD },
  { label: "Google Login Required", value: GalleryVisibility.GOOGLE_AUTH },
];

const defaultFormState = {
  name: "",
  slug: "",
  category: "Sports",
  description: "",
  folderId: "",
  coverImageId: "",
  visibility: GalleryVisibility.PUBLIC as GalleryVisibility,
  password: "",
  isFeatured: false,
};

const formStateFromGallery = (gallery?: EditableGallery | null) => {
  if (!gallery) {
    return defaultFormState;
  }

  return {
    name: gallery.name,
    slug: gallery.slug,
    category: gallery.category,
    description: gallery.description ?? "",
    folderId: gallery.folderId,
    coverImageId: gallery.coverImageId ?? "",
    visibility: gallery.visibility,
    password: "",
    isFeatured: gallery.isFeatured,
  };
};

type AdminGalleryFormProps = {
  gallery?: EditableGallery | null;
};

export function AdminGalleryForm({ gallery }: AdminGalleryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(gallery);
  const initialState = formStateFromGallery(gallery);
  const [name, setName] = useState(initialState.name);
  const [slug, setSlug] = useState(initialState.slug);
  const [category, setCategory] = useState(initialState.category);
  const [description, setDescription] = useState(initialState.description);
  const [folderId, setFolderId] = useState(initialState.folderId);
  const [coverImageId, setCoverImageId] = useState(initialState.coverImageId);
  const [visibility, setVisibility] = useState<GalleryVisibility>(
    initialState.visibility,
  );
  const [password, setPassword] = useState(initialState.password);
  const [isFeatured, setIsFeatured] = useState(initialState.isFeatured);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const passwordRequired =
    visibility === GalleryVisibility.PASSWORD && !(isEditing && gallery?.hasPassword);

  const clearEditMode = () => {
    router.push("/admin");
    router.refresh();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/galleries", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: gallery?.id,
          name,
          slug,
          category,
          description,
          folderId,
          coverImageId,
          visibility,
          password,
          isFeatured,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error ?? "Unable to save gallery.");
        return;
      }

      setStatus("success");
      setMessage(isEditing ? "Gallery updated." : "Gallery created.");

      if (isEditing) {
        clearEditMode();
        return;
      }

      setName(defaultFormState.name);
      setSlug(defaultFormState.slug);
      setCategory(defaultFormState.category);
      setDescription(defaultFormState.description);
      setFolderId(defaultFormState.folderId);
      setCoverImageId(defaultFormState.coverImageId);
      setVisibility(defaultFormState.visibility);
      setPassword(defaultFormState.password);
      setIsFeatured(defaultFormState.isFeatured);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Unable to save gallery right now.");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1">
        <h2 className="font-heading text-3xl uppercase tracking-wide">
          {isEditing ? "Edit Gallery" : "Create Gallery"}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isEditing
            ? "Update gallery settings, visibility, and folder mapping."
            : "Add a new live gallery linked to a Google Drive folder."}
        </p>
        {isEditing && gallery?.managedByConfig ? (
          <p className="text-sm text-amber-500">
            Saving this gallery will detach it from env-based config sync so your
            admin changes are not overwritten.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Gallery Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Custom Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="optional-slug"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Category</span>
          <input
            type="text"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Drive Folder ID</span>
          <input
            type="text"
            required
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Description</span>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Cover Image File ID or Drive URL
          </span>
          <input
            type="text"
            value={coverImageId}
            onChange={(event) => setCoverImageId(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <span className="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">
            Paste a Google Drive image link or file ID. If you paste a folder link,
            the first image in that folder will be used.
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Visibility</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as GalleryVisibility)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {visibilityOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibility === GalleryVisibility.PASSWORD ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            {isEditing ? "New Gallery Password" : "Gallery Password"}
          </span>
          <input
            type="password"
            required={passwordRequired}
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {isEditing && gallery?.hasPassword ? (
            <span className="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">
              Leave this blank to keep the current password.
            </span>
          ) : null}
        </label>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) => setIsFeatured(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
        />
        Feature this gallery on home
      </label>

      {message ? (
        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-emerald-500"}`}>
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {status === "saving"
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Gallery"}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={clearEditMode}
            className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
