"use client";

import { useEffect, useRef, useState } from "react";
import { ENVIRONMENT } from "@/lib/experience/progress";
import { attachJourneyVideo } from "@/lib/experience/journeyVideo";

/**
 * The environmental plate behind the persistent narrative object.
 *
 * The journey video is scrubbed, never played (see journeyVideo). Layered
 * beneath it are the optimized poster and the aurora still, so there is a
 * painted frame at every moment — before metadata parses, while a seek
 * resolves, and if video decoding is refused outright.
 *
 * Under reduced motion no video is mounted at all; the static artwork is the
 * environment.
 */
export function EnvironmentLayer({
  reduced,
  mobile,
}: {
  reduced: boolean;
  mobile: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = videoRef.current;
    if (!el) return;

    const detach = attachJourneyVideo(el);
    // reveal the plate only once a real frame exists behind the poster
    const onReady = () => setPainted(true);
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("seeked", onReady);
    if (el.readyState >= 2) setPainted(true);

    return () => {
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("seeked", onReady);
      detach();
    };
  }, [reduced]);

  const src = mobile ? ENVIRONMENT.journey.mobile : ENVIRONMENT.journey.desktop;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* deepest fallback — always painted, never black */}
      <div
        className="absolute inset-0 bg-void bg-cover bg-center"
        style={{ backgroundImage: `url(${ENVIRONMENT.journey.aurora})` }}
      />

      {/* optimized poster, covering any gap before the plate paints */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${ENVIRONMENT.journey.poster})`,
          opacity: reduced ? 0 : painted ? 0 : 1,
        }}
      />

      {/* the scrubbed journey plate */}
      {!reduced && (
        <video
          ref={videoRef}
          data-journey
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: painted ? 1 : 0 }}
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />
      )}

      {/* chamber still, revealed as the journey settles */}
      <div
        data-chamber
        className="absolute inset-0 bg-cover bg-center opacity-0"
        style={{ backgroundImage: `url(${ENVIRONMENT.journey.chamber})` }}
      />

      {/* restrained legibility gradient — copy sits bottom-left and top-left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.10) 26%, rgba(5,5,8,0.10) 58%, rgba(5,5,8,0.82) 100%)",
        }}
      />

      {/* brand watermark, held far back */}
      <div
        data-ghost
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden text-center opacity-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo.png"
          alt=""
          className="mx-auto w-[62vw] max-w-none opacity-[0.13]"
        />
      </div>
    </div>
  );
}
