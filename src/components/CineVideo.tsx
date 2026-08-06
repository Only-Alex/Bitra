import { VIDEOS, type VideoKey } from "@/lib/assets";

type CineVideoProps = {
  asset: VideoKey;
  /** eager-load (hero); everything else lazy */
  priority?: boolean;
  /** vignette + horizon fade so sections butt together seamlessly */
  overlay?: boolean;
  grain?: boolean;
  className?: string;
};

/**
 * A cinematic media slot. Renders the Seedance loop when the asset is
 * encoded and `ready`; until then, an animated gradient field occupies the
 * exact same framing so the video can drop in with zero layout change.
 */
export function CineVideo({
  asset,
  priority = false,
  overlay = true,
  grain = true,
  className = "",
}: CineVideoProps) {
  const v = VIDEOS[asset];

  return (
    <div className={`cine-field ${className}`} aria-hidden="true" data-cine={v.id}>
      {v.ready ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          poster={v.poster}
          preload={priority ? "auto" : "none"}
        >
          {/* mp4 first: webm pairs are optional and may not exist */}
          <source src={v.mp4} type="video/mp4" />
          <source src={v.webm} type="video/webm" />
        </video>
      ) : (
        <>
          <div className="cine-blob cine-a" />
          <div className="cine-blob cine-b" />
          <div className="cine-blob cine-c" />
          <div className="cine-sheen" />
        </>
      )}
      {overlay && <div className="cine-vignette" />}
      {grain && <div className="grain" />}
    </div>
  );
}
