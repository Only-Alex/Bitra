/**
 * The Bitra mark — "gateway tick". The rounded portal ring (the same
 * silhouette as the hero object's rim) with a market line breaking out
 * through its right edge: crypto enters, equity exits. Reads at 16px.
 */
export function BitraMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-ring" x1="0" y1="32" x2="32" y2="0">
          <stop offset="0" stopColor="#3d7fc4" />
          <stop offset="1" stopColor="#a7d8ff" />
        </linearGradient>
      </defs>
      {/* portal ring, broken where the line exits */}
      <path
        d="M25 3.5 H11 A7.5 7.5 0 0 0 3.5 11 v10 A7.5 7.5 0 0 0 11 28.5 h10 a7.5 7.5 0 0 0 7.5 -7.5 v-4.5"
        stroke="url(#bm-ring)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* the market line, exiting the gateway */}
      <path
        d="M9 21 L14 15.5 L18 18.5 L29.5 6.5"
        stroke="#e8ecf4"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 6 h5.8 v5.8"
        stroke="#e8ecf4"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
