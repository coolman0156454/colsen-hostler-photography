import Link from "next/link";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sanitizeCallbackUrl = (value: string | string[] | undefined) => {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved || !resolved.startsWith("/")) {
    return "/";
  }

  return resolved;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);
  const signInHref = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
    callbackUrl,
  )}`;

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
      <Link
        href={signInHref}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Continue with Google
      </Link>
    </section>
  );
}

