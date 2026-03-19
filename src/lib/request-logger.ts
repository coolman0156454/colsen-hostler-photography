import { type NextRequest, userAgent } from "next/server";

import { env } from "@/lib/env";

type GeoData = {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
};

type TrafficBucket = {
  firstSeenAt: number;
  lastSeenAt: number;
  total: number;
  sensitiveHits: number;
  pathHits: Record<string, number>;
};

type GoogleSignInLogInput = {
  email?: string | null;
  name?: string | null;
  isAdmin: boolean;
  providerAccountId?: string | null;
  profile?: unknown;
};

const REQUEST_WINDOW_MS = 1000 * 60 * 10;
const PATH_ALERT_THRESHOLD = 15;

const sensitivePathPatterns = [
  /^\/admin(?:\/|$)/i,
  /^\/auth\/signin(?:\/|$)/i,
  /^\/login(?:\/|$)/i,
  /^\/api\/auth(?:\/|$)/i,
];

const scannerPathPatterns = [
  /^\/wp-login\.php(?:\/|$)/i,
  /^\/phpmyadmin(?:\/|$)/i,
  /^\/\.env(?:\/|$)/i,
  /^\/config(?:\/|$)/i,
  /^\/\.git(?:\/|$)/i,
  /^\/boaform(?:\/|$)/i,
];

const globalForRequestLogging = globalThis as typeof globalThis & {
  __colsenTrafficBuckets?: Map<string, TrafficBucket>;
};

const trafficBuckets =
  globalForRequestLogging.__colsenTrafficBuckets ??
  (globalForRequestLogging.__colsenTrafficBuckets = new Map<string, TrafficBucket>());

const firstHeaderValue = (request: NextRequest, names: string[]) => {
  for (const name of names) {
    const value = request.headers.get(name)?.trim();
    if (value) {
      return value;
    }
  }

  return null;
};

const getClientIp = (request: NextRequest) => {
  const forwardedFor = firstHeaderValue(request, ["x-forwarded-for"]);
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return (
    firstHeaderValue(request, ["cf-connecting-ip", "x-real-ip", "fly-client-ip"]) ??
    "unknown"
  );
};

const getGeoData = (request: NextRequest): GeoData => ({
  country: firstHeaderValue(request, [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-geo-country",
    "x-country-code",
  ]),
  region: firstHeaderValue(request, [
    "x-vercel-ip-country-region",
    "x-geo-region",
    "cf-region-code",
  ]),
  city: firstHeaderValue(request, [
    "x-vercel-ip-city",
    "x-geo-city",
    "cf-ipcity",
  ]),
  latitude: firstHeaderValue(request, [
    "x-vercel-ip-latitude",
    "x-geo-latitude",
    "cf-iplatitude",
  ]),
  longitude: firstHeaderValue(request, [
    "x-vercel-ip-longitude",
    "x-geo-longitude",
    "cf-iplongitude",
  ]),
});

const formatGeo = (geo: GeoData) => {
  const parts = [geo.country, geo.region, geo.city].filter(Boolean);
  return parts.length > 0 ? parts.join("/") : "unknown";
};

const trimTrafficBuckets = (now: number) => {
  for (const [key, bucket] of trafficBuckets.entries()) {
    if (now - bucket.lastSeenAt > REQUEST_WINDOW_MS) {
      trafficBuckets.delete(key);
    }
  }
};

const getTrafficBucket = (ip: string, path: string, isSensitive: boolean) => {
  const now = Date.now();
  trimTrafficBuckets(now);

  const existing = trafficBuckets.get(ip);
  if (!existing || now - existing.lastSeenAt > REQUEST_WINDOW_MS) {
    const freshBucket: TrafficBucket = {
      firstSeenAt: now,
      lastSeenAt: now,
      total: 1,
      sensitiveHits: isSensitive ? 1 : 0,
      pathHits: { [path]: 1 },
    };

    trafficBuckets.set(ip, freshBucket);
    return freshBucket;
  }

  existing.lastSeenAt = now;
  existing.total += 1;
  existing.sensitiveHits += isSensitive ? 1 : 0;
  existing.pathHits[path] = (existing.pathHits[path] ?? 0) + 1;

  return existing;
};

const isSensitivePath = (path: string) =>
  sensitivePathPatterns.some((pattern) => pattern.test(path));

const isScannerPath = (path: string) =>
  scannerPathPatterns.some((pattern) => pattern.test(path));

const buildDeviceSignature = (request: NextRequest) => {
  const parsed = userAgent(request);
  const browser = parsed.browser.name || "UnknownBrowser";
  const browserVersion = parsed.browser.version || "unknown";
  const os = parsed.os.name || "UnknownOS";
  const osVersion = parsed.os.version || "unknown";
  const deviceType = parsed.device.type || "desktop";
  const deviceVendor = parsed.device.vendor || "unknown";
  const deviceModel = parsed.device.model || "unknown";

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    deviceVendor,
    deviceModel,
    isBot: parsed.isBot,
    signature: `${deviceType}/${browser}/${os}`,
  };
};

const buildFlags = (path: string, geo: GeoData, bucket: TrafficBucket) => {
  const flags: string[] = [];
  const sensitive = isSensitivePath(path);

  if (sensitive) {
    flags.push("SENSITIVE");
  }

  if (isScannerPath(path)) {
    flags.push("SCANNER");
  }

  if (
    geo.country &&
    env.requestCountryAllowlist.length > 0 &&
    !env.requestCountryAllowlist.includes(geo.country.toUpperCase())
  ) {
    flags.push("FOREIGN");
  }

  if (bucket.total >= env.requestAlertThreshold) {
    flags.push("HIGH_VOLUME");
  }

  if ((bucket.pathHits[path] ?? 0) >= PATH_ALERT_THRESHOLD && sensitive) {
    flags.push("PATH_SPAM");
  }

  return flags;
};

export const logRequestEvent = (request: NextRequest) => {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const sensitive = isSensitivePath(path);
  const geo = getGeoData(request);
  const device = buildDeviceSignature(request);
  const bucket = getTrafficBucket(ip, path, sensitive);
  const flags = buildFlags(path, geo, bucket);
  const railwayRequestId = firstHeaderValue(request, ["x-railway-request-id"]);
  const referrer = request.headers.get("referer") ?? "direct";
  const query = request.nextUrl.search || "";

  const summary =
    `[REQUEST${flags.length > 0 ? ":ALERT" : ""}] ` +
    `ip=${ip} method=${request.method} path=${path}${query} ` +
    `device=${device.signature} bot=${device.isBot ? "yes" : "no"} ` +
    `geo=${formatGeo(geo)} count10m=${bucket.total}` +
    `${railwayRequestId ? ` reqId=${railwayRequestId}` : ""}` +
    `${flags.length > 0 ? ` flags=${flags.join(",")}` : ""}`;

  if (flags.length > 0) {
    console.warn(summary);
  } else {
    console.info(summary);
  }

  if (flags.length > 0 || sensitive || env.nextAuthDebug) {
    console.info(
      "[REQUEST:DETAIL]",
      JSON.stringify(
        {
          ip,
          method: request.method,
          path,
          query,
          referrer,
          requestId: railwayRequestId,
          device,
          geo,
          flags,
          count10m: bucket.total,
          pathHits10m: bucket.pathHits[path] ?? 0,
          headers: {
            host: request.headers.get("host"),
            userAgent: request.headers.get("user-agent"),
            forwardedFor: request.headers.get("x-forwarded-for"),
            edge: request.headers.get("x-railway-edge"),
            country: firstHeaderValue(request, [
              "x-vercel-ip-country",
              "cf-ipcountry",
              "x-geo-country",
              "x-country-code",
            ]),
          },
        },
        null,
        2,
      ),
    );
  }
};

export const logGoogleSignIn = ({
  email,
  name,
  isAdmin,
  providerAccountId,
  profile,
}: GoogleSignInLogInput) => {
  console.info(
    `[AUTH][GOOGLE] signed-in email=${email ?? "unknown"} admin=${
      isAdmin ? "yes" : "no"
    } accountId=${providerAccountId ?? "unknown"} name=${name ?? "unknown"}`,
  );

  console.info(
    "[AUTH][GOOGLE][DETAIL]",
    JSON.stringify(
      {
        email: email ?? null,
        name: name ?? null,
        isAdmin,
        providerAccountId: providerAccountId ?? null,
        profile: profile ?? null,
      },
      null,
      2,
    ),
  );
};
