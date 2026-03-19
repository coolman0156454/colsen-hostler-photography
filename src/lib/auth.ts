import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env, isGoogleAuthConfigured } from "@/lib/env";

const isAdminEmail = (email: string | null | undefined) =>
  Boolean(email && env.adminEmails.includes(email.toLowerCase()));

export const authOptions: NextAuthOptions = {
  providers: isGoogleAuthConfigured
    ? [
        GoogleProvider({
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code",
            },
          },
        }),
      ]
    : [],
  pages: {
    signIn: "/auth/signin",
  },
  secret: env.nextAuthSecret || undefined,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token }) {
      token.isAdmin = isAdminEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = token.sub ?? "";
      session.user.isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);

