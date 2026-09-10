// Native images preserve arbitrary remote artwork URLs without an image-proxy dependency.
/* eslint-disable @next/next/no-img-element */
export function ArtistPhoto({
  src,
  artist,
  priority = false,
}: {
  src: string;
  artist: string;
  priority?: boolean;
}) {
  return (
    <img
      className="artist-photo"
      src={src}
      alt={`${artist}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
