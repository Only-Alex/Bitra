/**
 * The Bitra mark — two arrows chasing a loop, the crypto/equity round
 * trip. Traced from the supplied card and app artwork so the nav, the
 * card face and the app icon all carry the same logo.
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
        <linearGradient id="bm-a" x1="4" y1="6" x2="28" y2="16">
          <stop offset="0" stopColor="#a7d8ff" />
          <stop offset="1" stopColor="#2f6ea8" />
        </linearGradient>
        <linearGradient id="bm-b" x1="26" y1="18" x2="5" y2="29">
          <stop offset="0" stopColor="#59b6f5" />
          <stop offset="1" stopColor="#1d8ad6" />
        </linearGradient>
      </defs>

      {/* upper arrow: sweeps right, turns down into the loop */}
      <path
        d="M7 10.5 H19.5 a5 5 0 0 1 5 5 v1.2"
        stroke="url(#bm-a)"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <path
        d="M15.6 6.9 L19.9 10.5 L15.6 14.1"
        stroke="url(#bm-a)"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* lower arrow: returns left, closing the round trip */}
      <path
        d="M25 21.5 H12.5 a5 5 0 0 1 -5 -5 v-1.2"
        stroke="url(#bm-b)"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <path
        d="M16.4 25.1 L12.1 21.5 L16.4 17.9"
        stroke="url(#bm-b)"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
