import type { ArtistSignal } from "@/lib/pipeline/types";

const REQUEST_TIMEOUT_MS = 11000;

function normalizeArtist(value: string): string {
  return value
    .replace(/\s+feat\..*/i, "")
    .replace(/\s+ft\..*/i, "")
    .replace(/\s+\(with .*\)/i, "")
    .replace(/\s+\|.*/, "")
    .replace(/["']/g, "")
    .trim();
}

function withinEnglishMarkets(market: string): market is "US" | "CA" | "UK" {
  return market === "US" || market === "CA" || market === "UK";
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": "DeepSpeakerBot/1.0 (+https://github.com/cobymyers/deepspeakerco)",
        ...(init?.headers ?? {})
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function pushSignal(
  list: ArtistSignal[],
  artistRaw: string,
  source: ArtistSignal["source"],
  market: ArtistSignal["market"],
  weight: number,
  context: string
): void {
  const artist = normalizeArtist(artistRaw);

  if (!artist || artist.length < 2 || artist.length > 50) {
    return;
  }

  if (!/^[\w\s.&-]+$/.test(artist)) {
    return;
  }

  list.push({ artist, source, market, weight, context });
}

async function collectAppleMusicSignals(): Promise<ArtistSignal[]> {
  const markets: Array<{ code: "us" | "ca" | "gb"; label: "US" | "CA" | "UK" }> = [
    { code: "us", label: "US" },
    { code: "ca", label: "CA" },
    { code: "gb", label: "UK" }
  ];

  const signals: ArtistSignal[] = [];

  for (const market of markets) {
    const url = `https://rss.applemarketingtools.com/api/v2/${market.code}/music/most-played/50/songs.json`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const entries = data?.feed?.results ?? [];

    for (const entry of entries) {
      const artistName = entry?.artistName;
      const songName = entry?.name ?? "";

      if (typeof artistName === "string" && withinEnglishMarkets(market.label)) {
        pushSignal(
          signals,
          artistName,
          "apple_music",
          market.label,
          2.2,
          `Apple Music charting track: ${songName}`
        );
      }
    }
  }

  return signals;
}

async function collectSpotifySignals(): Promise<ArtistSignal[]> {
  const urls = [
    "https://charts.spotify.com/charts/view/regional-us-daily/latest",
    "https://charts.spotify.com/charts/view/regional-ca-daily/latest",
    "https://charts.spotify.com/charts/view/regional-gb-daily/latest"
  ];

  const markets: Array<"US" | "CA" | "UK"> = ["US", "CA", "UK"];
  const signals: ArtistSignal[] = [];

  for (let i = 0; i < urls.length; i += 1) {
    const response = await fetchWithTimeout(urls[i]);
    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    const artistMatches = [...html.matchAll(/"artistNames":"([^"]+)"/g)];

    for (const match of artistMatches) {
      pushSignal(signals, match[1], "spotify", markets[i], 2.4, "Spotify daily chart momentum");
    }
  }

  return signals;
}

async function collectYouTubeSignals(): Promise<ArtistSignal[]> {
  const signals: ArtistSignal[] = [];
  const response = await fetchWithTimeout(
    "https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%253D%253D"
  );

  if (!response.ok) {
    return signals;
  }

  const html = await response.text();
  const channelMatches = [...html.matchAll(/"ownerText":\{"runs":\[\{"text":"([^"]+)"\}\]/g)];

  for (const match of channelMatches.slice(0, 40)) {
    pushSignal(signals, match[1], "youtube", "global", 1.6, "YouTube music trending shelf");
  }

  return signals;
}

function extractCandidateFromTitle(title: string): string[] {
  const options: string[] = [];
  const normalized = title.replace(/\s+/g, " ").trim();

  const dashSplit = normalized.split(" - ");
  if (dashSplit.length > 1) {
    options.push(dashSplit[0]);
  }

  const colonSplit = normalized.split(": ");
  if (colonSplit.length > 1) {
    options.push(colonSplit[0]);
  }

  const byRegex = normalized.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g);
  if (byRegex) {
    options.push(...byRegex);
  }

  return options.map(normalizeArtist);
}

async function collectRedditSignals(): Promise<ArtistSignal[]> {
  const subreddits = ["indieheads", "popheads", "hiphopheads", "music"];
  const signals: ArtistSignal[] = [];

  for (const subreddit of subreddits) {
    const response = await fetchWithTimeout(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=50`
    );

    if (!response.ok) {
      continue;
    }

    const data = await response.json();
    const posts = data?.data?.children ?? [];

    for (const item of posts) {
      const title = item?.data?.title;
      if (typeof title !== "string") {
        continue;
      }

      for (const candidate of extractCandidateFromTitle(title)) {
        pushSignal(
          signals,
          candidate,
          "reddit",
          "global",
          1.8,
          `Reddit r/${subreddit} discussion: ${title}`
        );
      }
    }
  }

  return signals;
}

async function collectPressSignals(): Promise<ArtistSignal[]> {
  const feeds = [
    "https://pitchfork.com/rss/news/",
    "https://www.nme.com/news/music/feed",
    "https://www.thefader.com/rss"
  ];

  const signals: ArtistSignal[] = [];

  for (const feed of feeds) {
    const response = await fetchWithTimeout(feed);
    if (!response.ok) {
      continue;
    }

    const xml = await response.text();
    const titleMatches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g)];

    for (const match of titleMatches.slice(0, 35)) {
      const title = (match[1] ?? match[2] ?? "").replace(/&amp;/g, "&").trim();
      if (!title || title.toLowerCase().includes("rss")) {
        continue;
      }

      for (const candidate of extractCandidateFromTitle(title)) {
        pushSignal(signals, candidate, "press", "global", 1.5, `Music press mention: ${title}`);
      }
    }
  }

  return signals;
}

export async function collectSignals(): Promise<ArtistSignal[]> {
  const results = await Promise.allSettled([
    collectAppleMusicSignals(),
    collectSpotifySignals(),
    collectYouTubeSignals(),
    collectRedditSignals(),
    collectPressSignals()
  ]);

  const signals: ArtistSignal[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      signals.push(...result.value);
    }
  }

  return signals;
}
