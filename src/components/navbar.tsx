import Link from "next/link";
import type { Session } from "next-auth";

import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/galleries", label: "Galleries" },
  { href: "/contact", label: "Contact" },
];

type NavbarProps = {
  session: Session | null;
};

export function Navbar({ session }: NavbarProps) {
  const isAdmin = Boolean(session?.user?.isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-300/70 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-heading text-xl uppercase tracking-[0.2em]">
          CHP
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1 rounded-full border border-zinc-300/60 bg-zinc-200/45 p-1 dark:border-zinc-700/70 dark:bg-zinc-900/70 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                  "dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Admin
              </Link>
            ) : null}
          </div>
          <ThemeToggle />
          <AuthButton user={session?.user} />
        </div>
      </nav>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 overflow-x-auto px-4 pb-3 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {link.label}
          </Link>
        ))}
        {isAdmin ? (
          <Link
            href="/admin"
            className="rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Admin
          </Link>
        ) : null}
      </div>
    </header>
  );
}
