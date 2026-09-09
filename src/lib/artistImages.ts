import type { PostMeta } from "@/lib/content";

type WikipediaSummary = {
  thumbnail?: {
    source?: string;
  };
};

type ITunesResult = {
  artworkUrl100?: string;
};

type ITunesResponse = {
  results?: ITunesResult[];
};

async function fetchWikipediaArtistImage(artist: string): Promise<string | null> {
  const title = artist.trim().replace(/\s+/g, "_");
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) {
    return null;
  }

  const summary = (await response.json()) as WikipediaSummary;
  return summary.thumbnail?.source ?? null;
}

async function fetchITunesArtistArtwork(artist: string): Promise<string | null> {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&attribute=artistTerm&limit=1`,
    { next: { revalidate: 60 * 60 * 24 } }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ITunesResponse;
  const artwork = data.results?.[0]?.artworkUrl100;

  if (!artwork) {
    return null;
  }

  return artwork.replace("100x100bb", "600x600bb");
}

async function fetchArtistImage(artist: string): Promise<string | null> {
  try {
    const wikipediaImage = await fetchWikipediaArtistImage(artist);
    if (wikipediaImage) {
      return wikipediaImage;
    }
  } catch {
    // fall through to iTunes
  }

  try {
    return await fetchITunesArtistArtwork(artist);
  } catch {
    return null;
  }
}

export async function getArtistImageMap(posts: PostMeta[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniqueArtists = Array.from(new Set(posts.map((post) => post.artist)));

  await Promise.all(
    uniqueArtists.map(async (artist) => {
      const fallback = posts.find((post) => post.artist === artist)?.image?.url;
      const resolved = await fetchArtistImage(artist);

      if (resolved) {
        map.set(artist, resolved);
      } else if (fallback) {
        map.set(artist, fallback);
      }
    })
  );

  return map;
}
