"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { Session } from "next-auth";

type ProvidersProps = {
  children: ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

