"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  experience,
  stage,
  seg,
  lerp,
  ease,
  HIDDEN,
  BUDGET,
} from "@/lib/experience/progress";
import { PhoneUI } from "@/components/three/PhoneUI";
import { DashboardUI } from "@/components/three/DashboardUI";

/* ---------------------------------------------------------------------------
   Calibrated constants. These are empirical — the artwork aspect ratios and
   the drei Html scales were solved against measured projections. Changing any
   of them silently breaks screen registration. Do not adjust casually.
   --------------------------------------------------------------------------- */
const PHONE_H = 4.3;
const PHONE_W = PHONE_H * (774 / 1498);
const CARD_W = 3.5;
const CARD_H = CARD_W * (1008 / 1600);
const PANEL_W = 4.6;
const PANEL_H = PANEL_W * (1062 / 1700);

/** solved: 320px DOM covers 0.900 of the phone face */
const PHONE_UI_SCALE = 0.249;
/** solved: 1600px DOM covers 0.952 of the panel display */
const PANEL_UI_SCALE = 0.1094;

/* ---------------------------------------------------------------------------
   Procedural atmosphere sprites, created once and disposed on unmount.
   --------------------------------------------------------------------------- */

function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 2;
  return t;
}

function useDisposableTextures() {
  const tex = useMemo(() => {
    const glow = canvasTexture(256, 256, (ctx) => {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    });

    const fog = canvasTexture(512, 128, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "rgba(255,255,255,0.5)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 128);
    });

    const loader = new THREE.TextureLoader();
    const art = (url: string) => {
      const t = loader.load(url, (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;
        loaded.needsUpdate = true;
      });
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    return {
      glow,
      fog,
      phone: art("/textures/phone.png"),
      card: art("/textures/card.png"),
      panel: art("/textures/screen.png"),
    };
  }, []);

  // GPU resources are not garbage collected — release them explicitly
  useEffect(() => {
    return () => {
      Object.values(tex).forEach((t) => t.dispose());
    };
  }, [tex]);

  return tex;
}

/**
 * The persistent narrative object.
 *
 * One group carries every stage of the story — phone, portal, card and the
 * smoked-glass exchange panel. Layers crossfade by opacity; none of them is
 * ever unmounted or conditionally rendered, so there is nothing to remount on
 * reverse scroll and no first-frame flash when a stage re-enters. Visibility
 * is derived from the layer's own computed opacity through one shared
 * threshold, which keeps the hide boundary and the fade boundary in lockstep.
 */
export function NarrativeObject() {
  const tex = useDisposableTextures();

  const narrative = useRef<THREE.Group>(null);

  const phone = useRef<THREE.Group>(null);
  const phoneMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);

  const card = useRef<THREE.Group>(null);
  const cardMat = useRef<THREE.MeshBasicMaterial>(null);
  const cardGlowMat = useRef<THREE.MeshBasicMaterial>(null);

  const panel = useRef<THREE.Group>(null);
  const panelMat = useRef<THREE.MeshBasicMaterial>(null);

  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const atmosphere = useRef<THREE.Group>(null);

  const smoothing = useRef({ px: 0, py: 0, idle: 1 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = experience.p;
    const s = smoothing.current;
    const mob = experience.mobile;

    /* pointer: desktop only, capped under 2%, ducked while scrolling fast */
    const duck = Math.max(0, 1 - experience.vel * BUDGET.velocityDuck);
    s.idle += (duck - s.idle) * 0.05;
    const phaseInfluence = p < 0.14 ? 1 : p < 0.48 ? 0.5 : 0.35;
    const infl =
      experience.frozen || mob
        ? 0
        : BUDGET.pointerInfluence * phaseInfluence * s.idle;
    s.px += (experience.px * infl - s.px) * 0.06;
    s.py += (experience.py * infl - s.py) * 0.06;

    const approach = ease(stage(p, "approach"));
    const dive = Math.pow(stage(p, "dive"), 1.7);
    const bloom = Math.sin(Math.min(1, stage(p, "bloom")) * Math.PI);
    const settle = ease(stage(p, "settle"));
    const swap = ease(stage(p, "swap"));
    const handoff = ease(stage(p, "handoff"));
    const idleAmp = experience.frozen ? 0.02 : 0.045 * s.idle;

    /* ---- phone: establishes right of the headline, then dives through ---- */
    const phoneOpacity = 1 - stage(p, "phoneFade");
    if (phone.current) {
      const g = phone.current;
      g.position.z = lerp(-5.6, -0.6, approach) + dive * 7.6;
      g.position.x = lerp(mob ? 0 : 2.45, 0, approach) * (1 - dive);
      g.position.y =
        lerp(mob ? 1.5 : 0.5, mob ? 0.3 : -0.02, approach) * (1 - dive) +
        Math.sin(t * 0.55) * idleAmp * (1 - dive);
      g.rotation.y =
        Math.sin(t * 0.4) * 0.04 * s.idle * (1 - approach * 0.6) + s.px;
      g.rotation.x = s.py * 0.6;
      g.scale.setScalar(mob ? 0.72 : 1);
      // derived from the same opacity that fades it — cannot pop
      g.visible = phoneOpacity > HIDDEN;
    }
    if (phoneMat.current) phoneMat.current.opacity = phoneOpacity;
    if (screenGlowMat.current) {
      screenGlowMat.current.opacity = bloom * 0.7 * (1 - seg(p, 0.47, 0.52));
    }
    if (haloMat.current) {
      haloMat.current.opacity = (0.16 + bloom * 0.4) * phoneOpacity;
    }
    if (flashMat.current) {
      flashMat.current.opacity = Math.pow(bloom, 2.4) * 0.16;
    }

    /* ---- card settles and turns, then hands off to the panel ----
       Both share one rotation: the card keeps turning to edge-on and swaps
       out exactly as the panel turns in from the other side. */
    const cardOpacity = settle * (1 - ease(stage(p, "cardFade")));
    if (card.current) {
      const g = card.current;
      const turn = settle * (1 - swap);
      g.position.z = lerp(-3.4, -0.6, settle) + swap * 1.2;
      g.position.x = lerp(0.4, -0.05, settle);
      g.position.y = Math.sin(t * 0.5) * idleAmp * 0.8 + swap * 0.5;
      g.rotation.z = lerp(-0.26, -0.1, settle) + Math.sin(t * 0.21) * 0.04 * turn;
      g.rotation.y =
        lerp(0.45, 0.16, settle) +
        s.px +
        Math.sin(t * 0.34) * 0.34 * turn +
        swap * 1.45;
      g.rotation.x =
        lerp(-0.18, -0.06, settle) + s.py * 0.6 + Math.cos(t * 0.27) * 0.09 * turn;
      g.scale.setScalar((mob ? 0.78 : 1) * lerp(1, 0.82, swap));
      g.visible = cardOpacity > HIDDEN;
    }
    if (cardMat.current) cardMat.current.opacity = cardOpacity;
    if (cardGlowMat.current) cardGlowMat.current.opacity = settle * 0.3 * (1 - swap);

    /* ---- exchange panel: completes the card's arc, then leads the exit ---- */
    const panelOpacity = ease(stage(p, "panelIn")) * (1 - handoff * 0.85);
    if (panel.current) {
      const g = panel.current;
      g.rotation.y = lerp(-1.35, 0, swap) + s.px * 0.5;
      g.rotation.x = lerp(0.16, 0, swap) + s.py * 0.35;
      g.rotation.z = lerp(0.1, 0, swap);
      g.position.z = lerp(-3.2, -1.4, swap) + handoff * 1.1;
      g.position.x = lerp(-0.3, 0, swap);
      g.position.y = lerp(-0.35, 0, swap) + Math.sin(t * 0.45) * idleAmp * 0.6;
      g.scale.setScalar((mob ? 0.72 : 1) * lerp(0.72, 1, swap));
      g.visible = panelOpacity > HIDDEN;
    }
    if (panelMat.current) panelMat.current.opacity = panelOpacity;

    /* ---- atmosphere recedes through the dive (desktop only) ---- */
    if (atmosphere.current) {
      if (mob) {
        atmosphere.current.visible = false;
      } else {
        atmosphere.current.position.z = lerp(0, 1.1, approach);
        const envFade = 1 - ease(stage(p, "dive"));
        atmosphere.current.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | undefined;
          if (m && "opacity" in m) {
            const base = (o.userData.baseOpacity as number) ?? 1;
            (m as THREE.Material & { opacity: number }).opacity = base * envFade;
          }
        });
        atmosphere.current.visible = envFade > HIDDEN;
      }
    }
  });

  return (
    <group ref={narrative}>
      {/* artwork carries its own baked lighting; ambient only lifts the
          additive atmosphere sprites into range */}
      <ambientLight intensity={1} />

      {/* ---------- stage: phone ---------- */}
      <group ref={phone} position={[2.45, 0.5, -5.6]}>
        <mesh>
          <planeGeometry args={[PHONE_W, PHONE_H]} />
          <meshBasicMaterial
            ref={phoneMat}
            map={tex.phone}
            transparent
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        {/* live app screen — calibrated to the artwork's display region */}
        <Html
          transform
          position={[0, 0, 0.006]}
          scale={PHONE_UI_SCALE}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <PhoneUI />
        </Html>

        <mesh position={[0, 0, 0.012]} scale={[PHONE_W * 0.92, PHONE_H * 0.94, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={screenGlowMat}
            map={tex.glow}
            color="#cfe8ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh position={[0, 0, -0.4]} scale={[PHONE_W * 3, PHONE_H * 1.9, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={haloMat}
            map={tex.glow}
            color="#5f9fe0"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ---------- stage: portal (reserved; wired in a later checkpoint) ---------- */}
      <group name="portal" visible={false} />

      {/* ---------- stage: card ---------- */}
      <group ref={card} visible={false}>
        <mesh>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial
            ref={cardMat}
            map={tex.card}
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.3]} scale={[CARD_W * 1.9, CARD_H * 2.6, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={cardGlowMat}
            map={tex.glow}
            color="#5f9fe0"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ---------- stage: smoked-glass exchange panel ---------- */}
      <group ref={panel} visible={false}>
        <mesh>
          <planeGeometry args={[PANEL_W, PANEL_H]} />
          <meshBasicMaterial
            ref={panelMat}
            map={tex.panel}
            transparent
            opacity={0}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        {/* live terminal — calibrated to the panel's display region */}
        <Html
          transform
          position={[0, 0, 0.006]}
          scale={PANEL_UI_SCALE}
          zIndexRange={[28, 0]}
          style={{ pointerEvents: "none" }}
        >
          <DashboardUI />
        </Html>
      </group>

      {/* threshold flash — radial, capped, never a full-frame clip */}
      <mesh position={[0, 0, 4.6]} scale={[14, 9, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={flashMat}
          map={tex.glow}
          color="#cfe8ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* ---------- decorative atmosphere (desktop only) ---------- */}
      <group ref={atmosphere}>
        <FogBand tex={tex.fog} y={-1.9} z={-5} speed={0.014} opacity={0.11} />
        <FogBand tex={tex.fog} y={-2.2} z={-3.4} speed={-0.01} opacity={0.08} />
        <mesh
          position={[-2.6, 1.2, -8]}
          rotation={[0, 0, 0.5]}
          scale={[1.6, 10, 1]}
          userData={{ baseOpacity: 0.05 }}
        >
          <planeGeometry />
          <meshBasicMaterial
            map={tex.fog}
            color="#79bfff"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function FogBand({
  tex,
  y,
  z,
  speed,
  opacity,
}: {
  tex: THREE.Texture;
  y: number;
  z: number;
  speed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.position.x = Math.sin(state.clock.elapsedTime * speed * 12) * 1.4;
  });
  return (
    <mesh
      ref={ref}
      position={[0, y, z]}
      scale={[24, 2.4, 1]}
      userData={{ baseOpacity: opacity }}
    >
      <planeGeometry />
      <meshBasicMaterial
        map={tex}
        color="#8fb4d8"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
