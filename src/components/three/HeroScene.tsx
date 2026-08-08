"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroState, seg, lerp, ease } from "@/lib/motion/heroProgress";

/* ---------- procedural atmosphere (glow sprites + fog bands) ---------- */

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

function useAtmosphere() {
  return useMemo(() => {
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

    return { glow, fog };
  }, []);
}

/** Loads a PNG as an sRGB texture without suspending the canvas. */
function useArtwork(url: string) {
  return useMemo(() => {
    const tex = new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);
}

/* Artwork aspect ratios (source pixel dimensions) */
const PHONE_H = 4.3;
const PHONE_W = PHONE_H * (774 / 1500);
const CARD_W = 3.5;
const CARD_H = CARD_W * (958 / 1600);

export function HeroScene() {
  const atm = useAtmosphere();
  const phoneArt = useArtwork("/textures/phone.png");
  const cardArt = useArtwork("/textures/card.png");

  const phone = useRef<THREE.Group>(null);
  const phoneMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);

  const card = useRef<THREE.Group>(null);
  const cardMat = useRef<THREE.MeshBasicMaterial>(null);
  const cardGlowMat = useRef<THREE.MeshBasicMaterial>(null);

  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const env = useRef<THREE.Group>(null);

  const smoothing = useRef({ px: 0, py: 0, idle: 1 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = heroState.p;
    const s = smoothing.current;
    const mob = heroState.mobile;

    const duck = Math.max(0, 1 - heroState.vel * 14);
    s.idle += (duck - s.idle) * 0.05;
    const phaseInfluence = p < 0.14 ? 1 : p < 0.48 ? 0.5 : 0.35;
    const infl = heroState.frozen ? 0 : 0.06 * phaseInfluence * s.idle;
    s.px += (heroState.px * infl - s.px) * 0.06;
    s.py += (heroState.py * infl - s.py) * 0.06;

    const approach = ease(seg(p, 0.14, 0.36));
    const dive = Math.pow(seg(p, 0.38, 0.5), 1.7);
    const bloom = Math.sin(Math.min(1, seg(p, 0.32, 0.52)) * Math.PI);
    const settle = ease(seg(p, 0.48, 0.68));
    const handoff = ease(seg(p, 0.88, 1.0));
    const idleAmp = heroState.frozen ? 0.02 : 0.045 * s.idle;

    /* ---- phone: establish right of the headline, then dive through ---- */
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
      g.visible = p < 0.52;
    }
    const phoneFade = 1 - seg(p, 0.46, 0.51);
    if (phoneMat.current) phoneMat.current.opacity = phoneFade;
    if (screenGlowMat.current) {
      screenGlowMat.current.opacity = bloom * 0.7 * (1 - seg(p, 0.47, 0.52));
    }
    if (haloMat.current) {
      haloMat.current.opacity = (0.16 + bloom * 0.4) * phoneFade;
    }
    if (flashMat.current) {
      flashMat.current.opacity = Math.pow(bloom, 2.4) * 0.16;
    }

    /* ---- card: settles inside the world, turning slowly ---- */
    if (card.current) {
      const g = card.current;
      g.visible = p > 0.44 && handoff < 0.98;
      const turn = settle * (1 - handoff);
      g.position.z = lerp(-3.4, -0.6, settle) + lerp(0, 2.6, handoff);
      g.position.x = lerp(0.4, -0.05, settle);
      g.position.y = Math.sin(t * 0.5) * idleAmp * 0.8;
      g.rotation.z = lerp(-0.26, -0.1, settle) + Math.sin(t * 0.21) * 0.04 * turn;
      g.rotation.y =
        lerp(0.45, 0.16, settle) + s.px + Math.sin(t * 0.34) * 0.34 * turn;
      g.rotation.x =
        lerp(-0.18, -0.06, settle) + s.py * 0.6 + Math.cos(t * 0.27) * 0.09 * turn;
      g.scale.setScalar(mob ? 0.78 : 1);
    }
    if (cardMat.current) cardMat.current.opacity = settle * (1 - handoff);
    if (cardGlowMat.current) {
      cardGlowMat.current.opacity = settle * 0.3 * (1 - handoff);
    }

    /* ---- atmosphere recedes through the dive ---- */
    if (env.current) {
      env.current.position.z = lerp(0, 1.1, approach);
      const envFade = 1 - ease(seg(p, 0.38, 0.5));
      env.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          const base = (o.userData.baseOpacity as number) ?? 1;
          (m as THREE.Material & { opacity: number }).opacity = base * envFade;
        }
      });
      env.current.visible = envFade > 0.01;
    }
  });

  return (
    <>
      {/* artwork carries its own baked lighting, so the scene only needs
          enough ambient for the additive atmosphere to sit correctly */}
      <ambientLight intensity={1} />

      {/* ---------- the Bitra phone ---------- */}
      <group ref={phone} position={[2.45, 0.5, -5.6]}>
        <mesh>
          <planeGeometry args={[PHONE_W, PHONE_H]} />
          <meshBasicMaterial
            ref={phoneMat}
            map={phoneArt}
            transparent
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        {/* screen goes white-hot as the camera falls into it */}
        <mesh position={[0, 0, 0.01]} scale={[PHONE_W * 0.92, PHONE_H * 0.94, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={screenGlowMat}
            map={atm.glow}
            color="#cfe8ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        {/* ambient bloom behind the device */}
        <mesh position={[0, 0, -0.4]} scale={[PHONE_W * 3, PHONE_H * 1.9, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={haloMat}
            map={atm.glow}
            color="#5f9fe0"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ---------- the Bitra card ---------- */}
      <group ref={card} visible={false}>
        <mesh>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial
            ref={cardMat}
            map={cardArt}
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
            map={atm.glow}
            color="#5f9fe0"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* threshold flash — radial, capped, never full frame */}
      <mesh position={[0, 0, 4.6]} scale={[14, 9, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={flashMat}
          map={atm.glow}
          color="#cfe8ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* ---------- drifting atmosphere over the space plate ---------- */}
      <group ref={env}>
        <FogBand tex={atm.fog} y={-1.9} z={-5} speed={0.014} opacity={0.11} />
        <FogBand tex={atm.fog} y={-2.2} z={-3.4} speed={-0.01} opacity={0.08} />
        <mesh
          position={[-2.6, 1.2, -8]}
          rotation={[0, 0, 0.5]}
          scale={[1.6, 10, 1]}
          userData={{ baseOpacity: 0.05 }}
        >
          <planeGeometry />
          <meshBasicMaterial
            map={atm.fog}
            color="#79bfff"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
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
    <mesh ref={ref} position={[0, y, z]} scale={[24, 2.4, 1]} userData={{ baseOpacity: opacity }}>
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
