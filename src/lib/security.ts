import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "@/lib/env";

const GALLERY_TOKEN_AUDIENCE = "gallery-access";
const GALLERY_TOKEN_ISSUER = "colsen-hostler-photography";

interface GalleryTokenPayload {
  gallerySlug: string;
}

const getTokenSecret = () => {
  if (!env.galleryAccessTokenSecret) {
    throw new Error(
      "GALLERY_ACCESS_TOKEN_SECRET or NEXTAUTH_SECRET is required for protected galleries.",
    );
  }

  return env.galleryAccessTokenSecret;
};

export const hashGalleryPassword = async (password: string) =>
  bcrypt.hash(password, 12);

export const verifyGalleryPassword = async (
  password: string,
  hashedPassword: string,
) => bcrypt.compare(password, hashedPassword);

export const createGalleryAccessToken = (gallerySlug: string) => {
  const payload: GalleryTokenPayload = { gallerySlug };

  return jwt.sign(payload, getTokenSecret(), {
    audience: GALLERY_TOKEN_AUDIENCE,
    expiresIn: "12h",
    issuer: GALLERY_TOKEN_ISSUER,
  });
};

export const verifyGalleryAccessToken = (
  token: string,
  expectedGallerySlug: string,
) => {
  try {
    const decoded = jwt.verify(token, getTokenSecret(), {
      audience: GALLERY_TOKEN_AUDIENCE,
      issuer: GALLERY_TOKEN_ISSUER,
    }) as GalleryTokenPayload;

    return decoded.gallerySlug === expectedGallerySlug;
  } catch {
    return false;
  }
};

