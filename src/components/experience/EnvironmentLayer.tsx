"use client";

import { ENVIRONMENT } from "@/lib/experience/progress";

/**
 * The environmental video layer, behind the canvas.
 *
 * Both plates stay mounted for the whole experience — the timeline drives
 * their opacity and playback, so nothing remounts on reverse scroll. Sources
 * come from ENVIRONMENT.active; the optimized journey plates are already
 * committed and referenced in ENVIRONMENT.journey, ready to be switched in
 * without touching this component.
 */
export function EnvironmentLayer() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #04060c 0%, #090b12 45%, #050508 100%)",
        }}
      />

      {/* opening world */}
      <div data-space className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          src={ENVIRONMENT.active.opening.desktop}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,8,0.55) 0%, transparent 30%, transparent 60%, rgba(5,5,8,0.85) 100%)",
          }}
        />
      </div>

      {/* product stage */}
      <div data-stage className="stage-bg absolute inset-0 opacity-0" />

      {/* market chamber */}
      <div data-world className="absolute inset-0 opacity-0">
        <video
          className="h-full w-full object-cover"
          src={ENVIRONMENT.active.chamber.desktop}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 30%, rgba(5,5,8,0.75) 80%, #050508 100%)",
          }}
        />
      </div>

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
