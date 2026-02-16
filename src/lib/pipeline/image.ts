import type { DraftPost } from "@/lib/pipeline/types";

const PALETTES = [
  ["#111111", "#5f5a50", "#d2cbc0"],
  ["#1f1f1f", "#8f2218", "#efe8dd"],
  ["#171819", "#40555f", "#d8ddd9"],
  ["#131313", "#6d5a3a", "#e8dfce"]
];

const LICENSE_DENY_TERMS = ["noncommercial", "fair use", "all rights reserved", "nd", "nc"];
const LICENSE_ALLOW_TERMS = [
  "cc0",
  "public domain",
  "cc by",
  "cc-by",
  "cc by-sa",
  "cc-by-sa"
];

type WikimediaApiResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: Array<{
          descriptionurl?: string;
          thumburl?: string;
          url?: string;
          extmetadata?: Record<string, { value?: string }>;
        }>;
      }
    >;
  };
};

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function isAllowedLicense(licenseText: string): boolean {
  const normalized = licenseText.toLowerCase();

  if (LICENSE_DENY_TERMS.some((term) => normalized.includes(term))) {
    return false;
  }

  return LICENSE_ALLOW_TERMS.some((term) => normalized.includes(term));
}

export function buildAbstractImageMeta(artist: string): DraftPost["image"] {
  const hash = Array.from(artist).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  return {
    kind: "abstract",
    alt: `Abstract cover artwork inspired by ${artist}`,
    palette
  };
}

function extractLicense(metadata?: Record<string, { value?: string }>): string {
  const candidates = [
    metadata?.LicenseShortName?.value,
    metadata?.License?.value,
    metadata?.UsageTerms?.value
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return stripHtml(candidates.join(" | "));
}

function extractAttribution(metadata?: Record<string, { value?: string }>): string {
  const candidates = [
    metadata?.Artist?.value,
    metadata?.Credit?.value,
    metadata?.Attribution?.value,
    metadata?.ObjectName?.value
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return stripHtml(candidates.join(" | "));
}

export async function selectLicensedArtistImage(artist: string): Promise<DraftPost["image"] | null> {
  if (process.env.IMAGE_LICENSE_GATE === "false") {
    return null;
  }

  const query = `${artist} portrait music`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DeepSpeakerBot/1.0 (+https://github.com/cobymyers/deepspeakerco)"
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikimediaApiResponse;
    const pages = Object.values(payload.query?.pages ?? {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      const metadata = info?.extmetadata;
      const license = extractLicense(metadata);

      if (!license || !isAllowedLicense(license)) {
        continue;
      }

      const imageUrl = info?.thumburl ?? info?.url;
      if (!imageUrl) {
        continue;
      }

      const attribution = extractAttribution(metadata);
      const source = info?.descriptionurl;

      return {
        kind: "licensed",
        alt: `${artist} promotional image`,
        url: imageUrl,
        license,
        attribution: attribution || undefined,
        source: source || undefined
      };
    }

    return null;
  } catch {
    return null;
  }
}
