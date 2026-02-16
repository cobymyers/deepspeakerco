export type SignalSource =
  | "apple_music"
  | "spotify"
  | "youtube"
  | "reddit"
  | "press";

export type ArtistSignal = {
  artist: string;
  source: SignalSource;
  market: "US" | "CA" | "UK" | "global";
  weight: number;
  context: string;
};

export type ArtistCandidate = {
  artist: string;
  score: number;
  sources: SignalSource[];
  markets: Array<"US" | "CA" | "UK" | "global">;
  signals: ArtistSignal[];
};

export type DraftPost = {
  title: string;
  slug: string;
  publishDate: string;
  excerpt: string;
  artist: string;
  body: string;
  sourceSignals: string[];
  image: {
    kind: "abstract" | "platform" | "licensed";
    alt: string;
    url?: string;
    palette?: string[];
    license?: string;
    attribution?: string;
    source?: string;
  };
};

export type PipelineResult =
  | { status: "skipped"; reason: string }
  | { status: "published"; slug: string; filePath: string; artist: string };
