import Link from "next/link";

import { env } from "@/lib/env";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const authErrorMessages: Record<string, string> = {
  AccessDenied: "Google sign-in was denied for this account.",
  Callback: "The Google callback failed. Check your OAuth redirect URI.",
  Configuration: "Authentication is not configured correctly on the server.",
  OAuthAccountNotLinked:
    "That email is already linked to a different sign-in method.",
  OAuthCallback: "Google callback failed. Check Railway logs for the provider error.",
  OAuthCreateAccount:
    "Google sign-in could not create or load the user session.",
  OAuthSignin: "The app could not start the Google sign-in request.",
  SessionRequired: "You must sign in before accessing that page.",
  default: "Google sign-in failed. Check Google OAuth settings and server logs.",
};

const sanitizeCallbackUrl = (value: string | string[] | undefined) => {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) {
    return "/";
  }

  if (resolved.startsWith("/")) {
    return resolved;
  }

  try {
    const siteUrl = new URL(env.siteUrl);
    const callbackUrl = new URL(resolved);

    if (callbackUrl.origin === siteUrl.origin) {
      return `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`;
    }
  } catch {
    return "/";
  }

  return resolved;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const signInHref = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
    callbackUrl,
  )}`;
  const errorMessage = errorCode
    ? authErrorMessages[errorCode] ?? authErrorMessages.default
    : null;

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
      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-left text-sm text-red-600 dark:text-red-300">
          <p className="font-semibold">Sign-in error</p>
          <p className="mt-1">{errorMessage}</p>
          {errorCode ? (
            <p className="mt-2 font-mono text-xs opacity-80">Code: {errorCode}</p>
          ) : null}
        </div>
      ) : null}
      <Link
        href={signInHref}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Continue with Google
      </Link>
    </section>
  );
}
