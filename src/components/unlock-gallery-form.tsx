"use client";

import { useState } from "react";

type UnlockGalleryFormProps = {
  onUnlocked: (token: string) => Promise<void> | void;
  slug: string;
};

export function UnlockGalleryForm({ onUnlocked, slug }: UnlockGalleryFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/galleries/${slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !payload.token) {
        setError(payload.error ?? "Invalid password.");
        return;
      }

      setPassword("");
      await onUnlocked(payload.token);
    } catch {
      setError("Unable to unlock this gallery right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="font-heading text-3xl uppercase tracking-wide">
        Private Gallery
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter the gallery password to view these photos.
      </p>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={4}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Unlocking..." : "Unlock Gallery"}
      </button>
    </form>
  );
}

