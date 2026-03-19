const parseCsv = (raw: string | undefined): string[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY ?? "",
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
  googleServiceAccountPrivateKey:
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "",
  googleServiceAccountImpersonateUser:
    process.env.GOOGLE_SERVICE_ACCOUNT_IMPERSONATE_USER ?? "",
  galleryAccessTokenSecret:
    process.env.GALLERY_ACCESS_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  contactFromEmail:
    process.env.CONTACT_FROM_EMAIL ??
    "Colsen Hostler Photography <onboarding@resend.dev>",
  contactToEmail: process.env.CONTACT_TO_EMAIL ?? "",
  adminEmails: parseCsv(process.env.ADMIN_EMAILS),
};

export const isProduction = env.nodeEnv === "production";

export const isGoogleAuthConfigured = Boolean(
  env.googleClientId && env.googleClientSecret,
);

export const isDriveConfigured = Boolean(
  env.googleDriveApiKey ||
    (env.googleServiceAccountEmail && env.googleServiceAccountPrivateKey),
);
