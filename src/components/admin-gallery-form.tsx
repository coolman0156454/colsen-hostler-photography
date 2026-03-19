"use client";

import { useState } from "react";

import { GalleryVisibility } from "@/types/gallery";

const visibilityOptions = [
  { label: "Public", value: GalleryVisibility.PUBLIC },
  { label: "Password Protected", value: GalleryVisibility.PASSWORD },
  { label: "Google Login Required", value: GalleryVisibility.GOOGLE_AUTH },
];

export function AdminGalleryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Sports");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [coverImageId, setCoverImageId] = useState("");
  const [visibility, setVisibility] = useState<GalleryVisibility>(
    GalleryVisibility.PUBLIC,
  );
  const [password, setPassword] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSlug("");
    setCategory("Sports");
    setDescription("");
    setFolderId("");
    setCoverImageId("");
    setVisibility(GalleryVisibility.PUBLIC);
    setPassword("");
    setIsFeatured(false);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
      setMessage("Gallery created. Refresh the page to view it.");
      resetForm();
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
            Cover Image File ID
          </span>
          <input
            type="text"
            value={coverImageId}
            onChange={(event) => setCoverImageId(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
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
          <span className="mb-2 block text-sm font-medium">Gallery Password</span>
          <input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
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

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {status === "saving" ? "Saving..." : "Create Gallery"}
      </button>
    </form>
  );
}
