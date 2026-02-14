import type { ArtistCandidate, ArtistSignal } from "@/lib/pipeline/types";

const MAINSTREAM_BLOCKLIST = new Set([
  "taylor swift",
  "drake",
  "billie eilish",
  "beyonce",
  "kendrick lamar",
  "the weeknd",
  "ariana grande",
  "dua lipa",
  "ed sheeran",
  "travis scott",
  "rihanna",
  "lady gaga"
]);

const MOMENTUM_TERMS = [
  "breakthrough",
  "viral",
  "buzz",
  "emerging",
  "rising",
  "on the rise",
  "new single",
  "debut"
];

export function scoreCandidates(signals: ArtistSignal[]): ArtistCandidate[] {
  const byArtist = new Map<string, ArtistCandidate>();

  for (const signal of signals) {
    const key = signal.artist.toLowerCase().trim();

    if (!key || MAINSTREAM_BLOCKLIST.has(key)) {
      continue;
    }

    const existing = byArtist.get(key) ?? {
      artist: signal.artist,
      score: 0,
      sources: [],
      markets: [],
      signals: []
    };

    existing.signals.push(signal);
    existing.score += signal.weight;

    if (!existing.sources.includes(signal.source)) {
      existing.sources.push(signal.source);
      existing.score += 0.8;
    }

    if (!existing.markets.includes(signal.market)) {
      existing.markets.push(signal.market);
      existing.score += 0.25;
    }

    const context = signal.context.toLowerCase();
    if (MOMENTUM_TERMS.some((term) => context.includes(term))) {
      existing.score += 0.4;
    }

    byArtist.set(key, existing);
  }

  return [...byArtist.values()]
    .filter((candidate) => candidate.sources.length >= 2)
    .sort((a, b) => b.score - a.score);
}
