import Image from "next/image";

/**
 * The Bitra brand assets, served from the supplied artwork.
 * `mark` is the symbol alone; `logo` is the full lockup with the wordmark.
 * Both were keyed to transparency from public/Brand.png — no redraw, so
 * they match the supplied logo exactly.
 */

export function BitraMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: "auto" }}
      priority
      aria-hidden="true"
    />
  );
}

export function BitraLogo({
  height = 26,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  // lockup is 1200 x 281
  return (
    <Image
      src="/brand/logo.png"
      alt="Bitra"
      width={Math.round(height * (1200 / 281))}
      height={height}
      className={className}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
