/** Render the original linework as black ink with transparent negative space. */
export function PelicanMark() {
  return (
    <svg
      className="pelican-mark"
      viewBox="145 292 320 400"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="pelican-ink" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.5315 -1.788 -0.1805 0 1.625"
          />
        </filter>
      </defs>
      <image
        href="/brand/pelican-gold.webp"
        width="1080"
        height="1080"
        filter="url(#pelican-ink)"
      />
    </svg>
  );
}
