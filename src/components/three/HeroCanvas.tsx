"use client";

import { Canvas } from "@react-three/fiber";
import { HeroScene } from "./HeroScene";
import { heroState } from "@/lib/motion/heroProgress";

/**
 * The single WebGL canvas for the cinematic journey. Lives inside the
 * pinned hero section; DOM copy layers sit above, backdrop layers below.
 */
export function HeroCanvas({ mobile = false }: { mobile?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 32 }}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={heroState.frozen ? "demand" : "always"}
      className="!absolute !inset-0"
      aria-hidden="true"
    >
      <HeroScene />
    </Canvas>
  );
}
