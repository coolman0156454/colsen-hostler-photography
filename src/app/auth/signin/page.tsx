"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-zinc-300 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
        Authentication
      </p>
      <h1 className="mt-3 font-heading text-5xl uppercase tracking-wide">
        Google Login
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Sign in with Google to access protected client galleries and admin tools.
      </p>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-6 w-full rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Continue with Google
      </button>
    </section>
  );
}

