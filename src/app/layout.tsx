import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/site-shell";
import { getAuthSession } from "@/lib/auth";

import "./globals.css";

const headingFont = Bebas_Neue({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colsen Hostler Photography",
  description:
    "Sports and portrait photography portfolio for Colsen Hostler Photography.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers session={session}>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
