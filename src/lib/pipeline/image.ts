const PALETTES = [
  ["#111111", "#5f5a50", "#d2cbc0"],
  ["#1f1f1f", "#8f2218", "#efe8dd"],
  ["#171819", "#40555f", "#d8ddd9"],
  ["#131313", "#6d5a3a", "#e8dfce"]
];

export function buildAbstractImageMeta(artist: string): {
  kind: "abstract";
  alt: string;
  palette: string[];
} {
  const hash = Array.from(artist).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  return {
    kind: "abstract",
    alt: `Abstract cover artwork inspired by ${artist}`,
    palette
  };
}
