"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  experience,
  stage,
  seg,
  lerp,
  ease,
  HIDDEN,
  BUDGET,
  FADE,
  BLOOM,
} from "@/lib/experience/progress";
import { PhoneUI } from "@/components/three/PhoneUI";
import { DashboardUI } from "@/components/three/DashboardUI";

/* ---------------------------------------------------------------------------
   Calibrated constants — empirical, solved against measured projections.
   Changing any of these silently breaks screen registration.
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
   Procedural atmosphere, created once and disposed on unmount.
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
 * One group carries the entire journey's position, rotation, scale and depth.
 * The phone, card and panel are layers *inside* that transform — they never
 * move independently, so the object reads as a single thing changing state
 * rather than three objects being swapped.
 *
 * The turn runs continuously from 0 to 2π. Each layer sits at a local
 * rotation that is only front-facing inside its own window (phone 0, card π,
 * panel 0-at-2π), so both handovers happen while the plane is edge-on and
 * physically invisible. Opacity crossfades ride on top for safety. Nothing is
 * conditionally mounted, so reverse scrolling reconstructs every state exactly.
 */
export function NarrativeObject() {
  const tex = useDisposableTextures();

  const narrative = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const panel = useRef<THREE.Group>(null);

  const phoneMat = useRef<THREE.MeshBasicMaterial>(null);
  const cardMat = useRef<THREE.MeshBasicMaterial>(null);
  const panelMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const atmosphere = useRef<THREE.Group>(null);

  const smoothing = useRef({ px: 0, py: 0, idle: 1 });

  /* Under reduced motion the canvas runs frameloop="demand", so the frame
     callback below — which is what writes every transform and opacity — would
     otherwise never execute and the object would sit at its mount defaults.
     Requesting one render after mount and on resize produces the static
     composition exactly as the progress value describes it. */
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!experience.frozen) return;
    invalidate();
    const onResize = () => invalidate();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [invalidate]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = experience.p;
    const s = smoothing.current;
    const mob = experience.mobile;

    /* pointer: desktop only, under 2%, ducked while scrolling fast */
    const duck = Math.max(0, 1 - experience.vel * BUDGET.velocityDuck);
    s.idle += (duck - s.idle) * 0.05;
    const infl =
      experience.frozen || mob ? 0 : BUDGET.pointerInfluence * s.idle;
    s.px += (experience.px * infl - s.px) * 0.06;
    s.py += (experience.py * infl - s.py) * 0.06;

    const arrival = ease(stage(p, "arrival"));
    const approach = ease(stage(p, "approach"));
    const portal = ease(stage(p, "portal"));
    const orbit = stage(p, "orbit");
    const toPanel = ease(stage(p, "panel"));
    const chamber = ease(stage(p, "chamber"));

    const idleAmp = experience.frozen ? 0.02 : 0.04 * s.idle;

    /* ---- one continuous transform for the whole journey ---- */
    if (narrative.current) {
      const g = narrative.current;

      // Depth: a measured approach, not an aggressive zoom. Solved so each
      // stage frames its subject — phone ~56% of viewport height on arrival,
      // card ~45% of width at the hold, panel ~56% of width in the chamber.
      g.position.z =
        -6.2 +
        0.4 * arrival + // -6.2 → -5.8, barely moving
        3.3 * approach + // → -2.5, the real approach
        0.3 * portal + // → -2.2, settles as it turns
        -0.4 * toPanel + // → -2.6, widening into the panel
        -0.2 * chamber; // → -2.8, camera settles in the chamber

      // lateral: starts right of the headline, centres as it approaches
      g.position.x = (mob ? 0 : 2.45) * (1 - approach) + s.px * 0.6;

      // on mobile the copy stacks under the object, so it sits higher and
      // smaller on arrival to keep the eyebrow line clear of the device
      g.position.y =
        lerp(mob ? 1.9 : 0.5, mob ? 0.28 : -0.02, approach) +
        Math.sin(t * 0.5) * idleAmp +
        s.py * 0.4;

      // the turn: 0 → π flips phone into card, π → 2π flips card into panel
      g.rotation.y =
        portal * Math.PI +
        toPanel * Math.PI +
        // gentle orbital sway while the card is the subject
        Math.sin(t * 0.42) * 0.1 * orbit * (1 - toPanel) +
        s.px;

      g.rotation.x = lerp(0.05, -0.02, approach) + s.py * 0.5;
      g.rotation.z =
        lerp(0.04, 0, approach) + Math.sin(t * 0.31) * 0.02 * (1 - toPanel);

      /* Mobile is width-bound, not height-bound: the card (3.5u) and panel
         (4.6u) are wider than the ~2.65u of world space a 390px viewport can
         show at this depth, so the mobile factor steps down as the object
         widens. Desktop has the width to spare and keeps its calibration. */
      const mobScale = 0.66 - 0.08 * portal - 0.13 * toPanel;
      g.scale.setScalar((mob ? mobScale : 1) * (1 + 0.05 * toPanel));
    }

    /* ---- layer crossfades, all centred on edge-on crossings ---- */
    const phoneOpacity = 1 - seg(p, FADE.phoneOut[0], FADE.phoneOut[1]);
    const cardOpacity =
      seg(p, FADE.cardIn[0], FADE.cardIn[1]) *
      (1 - seg(p, FADE.cardOut[0], FADE.cardOut[1]));
    const panelOpacity = seg(p, FADE.panelIn[0], FADE.panelIn[1]);

    if (phoneMat.current) phoneMat.current.opacity = phoneOpacity;
    if (cardMat.current) cardMat.current.opacity = cardOpacity;
    if (panelMat.current) panelMat.current.opacity = panelOpacity;

    // visibility derives from the same opacity that fades it — cannot pop
    if (phone.current) phone.current.visible = phoneOpacity > HIDDEN;
    if (card.current) card.current.visible = cardOpacity > HIDDEN;
    if (panel.current) panel.current.visible = panelOpacity > HIDDEN;

    /* ---- threshold light, peaking as the object crosses the portal ---- */
    const bloom = Math.sin(Math.min(1, seg(p, BLOOM[0], BLOOM[1])) * Math.PI);
    if (screenGlowMat.current) {
      screenGlowMat.current.opacity = bloom * 0.55 * phoneOpacity;
    }
    if (haloMat.current) {
      // atmosphere behind the object, never a readable surface of its own
      haloMat.current.opacity = 0.1 + bloom * 0.16;
    }
    if (flashMat.current) {
      // capped and radial — never a full-frame white clip
      flashMat.current.opacity = Math.pow(bloom, 2.6) * 0.14;
    }

    /* ---- decorative atmosphere: desktop only, recedes on approach ---- */
    if (atmosphere.current) {
      if (mob) {
        atmosphere.current.visible = false;
      } else {
        const fade = 1 - approach;
        atmosphere.current.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | undefined;
          if (m && "opacity" in m) {
            const base = (o.userData.baseOpacity as number) ?? 1;
            (m as THREE.Material & { opacity: number }).opacity = base * fade;
          }
        });
        atmosphere.current.visible = fade > HIDDEN;
      }
    }
  });

  return (
    <>
      <ambientLight intensity={1} />

      {/* ===== the single transforming object ===== */}
      <group ref={narrative} position={[2.45, 0.5, -5.6]}>
        {/* stage: phone — front-facing while the turn is 0..π/2 */}
        <group ref={phone}>
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
        </group>

        {/* stage: card — local π, so it faces camera as the turn reaches π */}
        <group ref={card} rotation={[0, Math.PI, 0]} visible={false}>
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
        </group>

        {/* stage: smoked-glass market panel — faces camera as the turn reaches 2π */}
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

        {/* ambient bloom travelling with the object */}
        <mesh position={[0, 0, -0.9]} scale={[PHONE_W * 2.2, PHONE_H * 1.35, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={haloMat}
            map={tex.glow}
            color="#5f9fe0"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* threshold flash — screen-space, radial, capped */}
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

      {/* decorative atmosphere (desktop only) */}
      <group ref={atmosphere}>
        <FogBand tex={tex.fog} y={-1.9} z={-5} speed={0.014} opacity={0.11} />
        <FogBand tex={tex.fog} y={-2.2} z={-3.4} speed={-0.01} opacity={0.08} />
      </group>
    </>
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
