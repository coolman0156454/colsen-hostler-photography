import { redirect } from "next/navigation";

import { AdminGalleryForm } from "@/components/admin-gallery-form";
import { getAuthSession } from "@/lib/auth";
import { getAllGalleries } from "@/lib/gallery-service";
import { type GalleryVisibility as GalleryVisibilityType } from "@/types/gallery";

const visibilityLabel: Record<GalleryVisibilityType, string> = {
  PUBLIC: "Public",
  PASSWORD: "Password",
  GOOGLE_AUTH: "Google Login",
};

export default async function AdminPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!session.user.isAdmin) {
    return (
      <section className="rounded-3xl border border-zinc-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="font-heading text-4xl uppercase tracking-wide">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your Google account is signed in, but not in ADMIN_EMAILS.
        </p>
      </section>
    );
  }

  const galleries = await getAllGalleries();

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
          Admin
        </p>
        <h1 className="font-heading text-5xl uppercase tracking-wide">
          Gallery Management
        </h1>
      </div>

      <AdminGalleryForm />

      <div className="overflow-hidden rounded-3xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100/80 text-xs uppercase tracking-[0.15em] text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3">Gallery</th>
              <th className="px-4 py-3">Folder</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Featured</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((gallery) => (
              <tr
                key={gallery.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{gallery.name}</p>
                  <p className="text-xs text-zinc-500">{gallery.slug}</p>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {gallery.folderId}
                </td>
                <td className="px-4 py-3">{visibilityLabel[gallery.visibility]}</td>
                <td className="px-4 py-3">{gallery.isFeatured ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
