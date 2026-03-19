import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminGalleryForm, type EditableGallery } from "@/components/admin-gallery-form";
import { getAuthSession } from "@/lib/auth";
import { getAllGalleries } from "@/lib/gallery-service";
import { type GalleryVisibility as GalleryVisibilityType } from "@/types/gallery";

const visibilityLabel: Record<GalleryVisibilityType, string> = {
  PUBLIC: "Public",
  PASSWORD: "Password",
  GOOGLE_AUTH: "Google Login",
};

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
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
  const query = await searchParams;
  const rawEditId = Array.isArray(query.edit) ? query.edit[0] : query.edit;
  const editGallery = galleries.find((gallery) => gallery.id === rawEditId) ?? null;
  const editableGallery: EditableGallery | null = editGallery
    ? {
        id: editGallery.id,
        name: editGallery.name,
        slug: editGallery.slug,
        category: editGallery.category,
        description: editGallery.description,
        folderId: editGallery.folderId,
        coverImageId: editGallery.coverImageId,
        visibility: editGallery.visibility,
        isFeatured: editGallery.isFeatured,
        managedByConfig: editGallery.managedByConfig,
        hasPassword: Boolean(editGallery.passwordHash),
      }
    : null;

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

      <AdminGalleryForm
        key={editableGallery?.id ?? "create-gallery"}
        gallery={editableGallery}
      />

      <div className="space-y-3 md:hidden">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="rounded-3xl border border-zinc-300 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold">{gallery.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{gallery.slug}</span>
                  {gallery.managedByConfig ? (
                    <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-amber-500">
                      Config
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                {visibilityLabel[gallery.visibility]}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Category:
                </span>{" "}
                {gallery.category}
              </p>
              <p>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Featured:
                </span>{" "}
                {gallery.isFeatured ? "Yes" : "No"}
              </p>
              <p className="break-all">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  Folder:
                </span>{" "}
                {gallery.folderId}
              </p>
            </div>

            <Link
              href={`/admin?edit=${gallery.id}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Edit Gallery
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100/80 text-xs uppercase tracking-[0.15em] text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3">Gallery</th>
              <th className="px-4 py-3">Folder</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{gallery.slug}</span>
                    {gallery.managedByConfig ? (
                      <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-amber-500">
                        Config
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {gallery.folderId}
                </td>
                <td className="px-4 py-3">{visibilityLabel[gallery.visibility]}</td>
                <td className="px-4 py-3">{gallery.isFeatured ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin?edit=${gallery.id}`}
                    className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
