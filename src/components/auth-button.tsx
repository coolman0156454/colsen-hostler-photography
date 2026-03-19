"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { cn } from "@/lib/utils";

export function AuthButton() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full bg-zinc-700/30 dark:bg-zinc-700/40" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
        )}
      >
        Log In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:flex">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "Profile image"}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : null}
        <span className="max-w-32 truncate">{user.name || user.email}</span>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
        )}
      >
        Log Out
      </button>
    </div>
  );
}

