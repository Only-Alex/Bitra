"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { NarrativeObject } from "./NarrativeObject";
import { BUDGET } from "@/lib/experience/progress";

/**
 * The one persistent WebGL canvas for the entire experience.
 *
 * Mounted once and never torn down between stages — every scene lives inside
 * NarrativeObject. Reduced-motion and breakpoint are resolved here at mount
 * (not read from the mutable progress singleton, whose flags are written
 * later by the timeline effect), so the frameloop and DPR are correct on the
 * very first frame.
 */
export function ExperienceCanvas() {
  // canvas is client-only (dynamic, ssr:false) but resolve after mount anyway
  // so the first frame never depends on a render-time media query
  const [{ reduced, mobile }, setEnv] = useState({
    reduced: false,
    mobile: false,
  });

  useEffect(() => {
    setEnv({
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      mobile: window.matchMedia("(max-width: 767px)").matches,
    });
  }, []);

  const dpr = mobile ? BUDGET.dpr.mobile : BUDGET.dpr.desktop;

  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 32 }}
      dpr={dpr}
      gl={{
        antialias: !mobile,
        alpha: true,
        powerPreference: "high-performance",
      }}
      // static composition under reduced motion: render on demand only
      frameloop={reduced ? "demand" : "always"}
      className="!absolute !inset-0"
      aria-hidden="true"
    >
      <NarrativeObject />
    </Canvas>
  );
}
