import type { ReactNode } from "react";

import { Navbar } from "@/components/navbar";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <Navbar />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-amber-500/20 blur-3xl dark:bg-amber-400/10" />
      </div>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-zinc-300/70 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800/70 dark:text-zinc-400">
        Copyright {new Date().getFullYear()} Colsen Hostler Photography
      </footer>
    </>
  );
}
