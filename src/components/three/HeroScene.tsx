"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { heroState, seg, lerp, ease } from "@/lib/motion/heroProgress";
import { PhoneUI } from "./PhoneUI";

const ICE = new THREE.Color("#79bfff");
const ICE_HI = new THREE.Color("#a7d8ff");

/* ---------- procedural textures (client-only, generated once) ---------- */

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

function useEnvTextures() {
  return useMemo(() => {
    const glow = canvasTexture(256, 256, (ctx) => {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    });

    const ridge = (seed: number, jag: number) =>
      canvasTexture(1024, 256, (ctx) => {
        let y = 110 + seed * 30;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(0, 256);
        ctx.lineTo(0, y);
        for (let x = 0; x <= 1024; x += 8) {
          const r = Math.sin(x * 0.013 + seed * 37) + Math.sin(x * 0.031 + seed * 91) * 0.6;
          y += r * jag + (Math.sin(x * 0.004 + seed * 13) * jag) / 2;
          y = Math.min(230, Math.max(30, y));
          ctx.lineTo(x, y);
        }
        ctx.lineTo(1024, 256);
        ctx.closePath();
        ctx.fill();
      });

    const fog = canvasTexture(512, 128, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "rgba(255,255,255,0.5)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 128);
    });

    return { glow, ridge1: ridge(1, 6), ridge2: ridge(2, 9), fog };
  }, []);
}

/* ---------- rounded-rect path for rim tubes + lattice ---------- */

function roundedRectPath(w: number, h: number, r: number): THREE.CurvePath<THREE.Vector3> {
  const hw = w / 2;
  const hh = h / 2;
  const path = new THREE.CurvePath<THREE.Vector3>();
  const v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    const curve = new THREE.EllipseCurve(cx, cy, r, r, a0, a1, false, 0);
    const pts = curve.getPoints(8).map((p) => v(p.x, p.y));
    for (let i = 0; i < pts.length - 1; i++)
      path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  };
  path.add(new THREE.LineCurve3(v(-hw + r, hh), v(hw - r, hh)));
  arc(hw - r, hh - r, Math.PI / 2, 0);
  path.add(new THREE.LineCurve3(v(hw, hh - r), v(hw, -hh + r)));
  arc(hw - r, -hh + r, 0, -Math.PI / 2);
  path.add(new THREE.LineCurve3(v(hw - r, -hh), v(-hw + r, -hh)));
  arc(-hw + r, -hh + r, -Math.PI / 2, -Math.PI);
  path.add(new THREE.LineCurve3(v(-hw, -hh + r), v(-hw, hh - r)));
  arc(-hw + r, hh - r, Math.PI, Math.PI / 2);
  return path;
}

function prand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function latticeGeometry(w: number, h: number): THREE.BufferGeometry {
  const nodes: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    nodes.push([(prand(i, 3) - 0.5) * w * 0.86, (prand(i, 7) - 0.5) * h * 0.86]);
  }
  const positions: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const dists = nodes
      .map((n, j) => ({ j, d: Math.hypot(n[0] - nodes[i][0], n[1] - nodes[i][1]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of dists) {
      positions.push(nodes[i][0], nodes[i][1], 0, nodes[j][0], nodes[j][1], 0);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

/* phone (portrait) and market panel (landscape glass) dimensions */
const PW = 2.05;
const PH = 4.2;
const MW = 3.4;
const MH = 2.15;

export function HeroScene() {
  const tex = useEnvTextures();

  const phone = useRef<THREE.Group>(null);
  const phoneMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const phoneRimMat = useRef<THREE.MeshBasicMaterial>(null);
  const screenGlowMat = useRef<THREE.MeshBasicMaterial>(null);

  const panel = useRef<THREE.Group>(null);
  const panelMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const panelRimMat = useRef<THREE.MeshBasicMaterial>(null);
  const lattice = useRef<THREE.LineSegments>(null);
  const latMat = useRef<THREE.LineBasicMaterial>(null);

  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const env = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const riseLight = useRef<THREE.PointLight>(null);

  const phoneRimGeo = useMemo(
    () => new THREE.TubeGeometry(roundedRectPath(PW, PH, 0.3) as never, 220, 0.016, 6, true),
    [],
  );
  const panelRimGeo = useMemo(
    () => new THREE.TubeGeometry(roundedRectPath(MW, MH, 0.14) as never, 220, 0.016, 6, true),
    [],
  );
  const latGeo = useMemo(() => latticeGeometry(MW, MH), []);
  const latTotal = useMemo(() => latGeo.getAttribute("position").count, [latGeo]);

  const smoothing = useRef({ px: 0, py: 0, idle: 1 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = heroState.p;
    const s = smoothing.current;
    const mob = heroState.mobile;

    const duck = Math.max(0, 1 - heroState.vel * 14);
    s.idle += (duck - s.idle) * 0.05;
    const phaseInfluence = p < 0.14 ? 1 : p < 0.48 ? 0.5 : 0.35;
    const infl = heroState.frozen ? 0 : 0.065 * phaseInfluence * s.idle;
    s.px += (heroState.px * infl - s.px) * 0.06;
    s.py += (heroState.py * infl - s.py) * 0.06;

    const approach = ease(seg(p, 0.14, 0.36));
    const dive = Math.pow(seg(p, 0.38, 0.5), 1.7);
    const bloom = Math.sin(Math.min(1, seg(p, 0.32, 0.52)) * Math.PI);
    const settle = ease(seg(p, 0.48, 0.68));
    const handoff = ease(seg(p, 0.88, 1.0));
    const idleAmp = heroState.frozen ? 0.02 : 0.045 * s.idle;

    /* ---- phone: establish → approach → dive through the screen ---- */
    if (phone.current) {
      const g = phone.current;
      g.position.z = lerp(-5.6, -0.6, approach) + dive * 7.6;
      g.position.x = lerp(mob ? 0 : -0.55, 0, approach) * (1 - dive);
      g.position.y =
        lerp(mob ? 1.5 : 0.62, mob ? 0.3 : -0.02, approach) * (1 - dive) +
        Math.sin(t * 0.55) * idleAmp * (1 - dive);
      g.rotation.y =
        Math.sin(t * 0.4) * 0.05 * s.idle * (1 - approach * 0.6) + s.px;
      g.rotation.x = s.py * 0.7;
      g.rotation.z = lerp(0, 0.05, dive);
      g.scale.setScalar(mob ? 0.72 : 1);
      g.visible = p < 0.52;
    }
    if (phoneMat.current) {
      phoneMat.current.opacity = 1 - seg(p, 0.46, 0.51);
    }
    if (phoneRimMat.current) {
      phoneRimMat.current.opacity = (0.55 + bloom * 0.45) * (1 - seg(p, 0.46, 0.51));
      phoneRimMat.current.color.copy(ICE).lerp(ICE_HI, bloom);
    }
    if (screenGlowMat.current) {
      // the screen itself goes white-hot as you fall into it
      screenGlowMat.current.opacity = bloom * 0.85 * (1 - seg(p, 0.47, 0.52));
    }
    if (flashMat.current) {
      flashMat.current.opacity = Math.pow(bloom, 2.4) * 0.18;
    }
    if (haloMat.current) {
      haloMat.current.opacity = (0.12 + bloom * 0.3) * (1 - seg(p, 0.47, 0.54));
    }
    if (riseLight.current) {
      riseLight.current.intensity = 0.3 + bloom * 3;
    }

    /* ---- glass market panel inside the world ---- */
    if (panel.current) {
      const g = panel.current;
      g.visible = p > 0.44 && handoff < 0.98;
      g.position.z = lerp(-3.4, -0.9, settle) + lerp(0, 2.4, handoff);
      g.position.x = lerp(0.5, -0.12, settle);
      g.position.y = Math.sin(t * 0.5) * idleAmp * 0.8;
      g.rotation.z = lerp(-0.3, -0.16, settle);
      g.rotation.y = lerp(0.5, 0.24, settle) + s.px;
      g.rotation.x = lerp(-0.2, -0.1, settle) + s.py * 0.7;
      g.scale.setScalar(mob ? 0.78 : 1);
    }
    if (panelMat.current) {
      panelMat.current.opacity = settle * 0.55 * (1 - handoff);
    }
    if (panelRimMat.current) {
      panelRimMat.current.opacity = settle * 0.8 * (1 - handoff);
    }
    if (lattice.current && latMat.current) {
      const draw = seg(p, 0.72, 0.88);
      lattice.current.geometry.setDrawRange(0, Math.floor(latTotal * draw));
      latMat.current.opacity = draw * (0.85 + Math.sin(t * 2.1) * 0.15) * (1 - handoff);
    }

    /* ---- moonlit valley: parallax recession, dissolve at the dive ---- */
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

    if (keyLight.current) {
      const a = t * 0.12;
      keyLight.current.position.set(Math.sin(a) * 4 - 2, 3, Math.cos(a) * 2 + 4);
    }
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#3a5a80" />
      <directionalLight ref={keyLight} position={[-2, 3, 4]} intensity={1.1} color="#9fcfff" />
      <directionalLight position={[3, -2, -3]} intensity={0.35} color="#2a4a70" />
      <pointLight ref={riseLight} position={[0, 0.5, 3.2]} intensity={0.3} color="#a7d8ff" />

      {/* ---------- the Bitra phone — gateway into the markets ---------- */}
      <group ref={phone} position={[-0.55, 0.62, -5.6]}>
        <RoundedBox args={[PW, PH, 0.13]} radius={0.3} smoothness={6}>
          <meshPhysicalMaterial
            ref={phoneMat}
            color="#0c1017"
            metalness={0.9}
            roughness={0.24}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            transparent
          />
        </RoundedBox>

        {/* luminous rim — the object's identity */}
        <mesh geometry={phoneRimGeo}>
          <meshBasicMaterial
            ref={phoneRimMat}
            color="#79bfff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        {/* screen bloom plate, behind the DOM screen */}
        <mesh position={[0, 0, 0.068]} scale={[PW * 0.93, PH * 0.95, 1]}>
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

        {/* live app UI — sharp DOM mapped onto the screen */}
        <Html
          transform
          position={[0, 0, 0.072]}
          scale={0.21}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <PhoneUI />
        </Html>

        {/* halo */}
        <mesh position={[0, 0, -0.5]} scale={[5.6, 7.4, 1]}>
          <planeGeometry />
          <meshBasicMaterial
            ref={haloMat}
            map={tex.glow}
            color="#79bfff"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ---------- glass market panel, inside the world ---------- */}
      <group ref={panel} visible={false}>
        <RoundedBox args={[MW, MH, 0.05]} radius={0.14} smoothness={6}>
          <meshPhysicalMaterial
            ref={panelMat}
            color="#101623"
            metalness={0.4}
            roughness={0.15}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            transparent
            opacity={0}
          />
        </RoundedBox>
        <mesh geometry={panelRimGeo}>
          <meshBasicMaterial
            ref={panelRimMat}
            color="#79bfff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <lineSegments ref={lattice} geometry={latGeo} position={[0, 0, 0.035]}>
          <lineBasicMaterial
            ref={latMat}
            color="#a7d8ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      {/* threshold flash — radial, capped, never full-frame */}
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

      {/* ---------- moonlit obsidian environment ---------- */}
      <group ref={env}>
        <mesh position={[3.4, 2.6, -14]} scale={[2.2, 2.2, 1]} userData={{ baseOpacity: 0.75 }}>
          <planeGeometry />
          <meshBasicMaterial
            map={tex.glow}
            color="#d8e8f8"
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[-1, -2.1, -9]} scale={[26, 4.4, 1]} userData={{ baseOpacity: 0.9 }}>
          <planeGeometry />
          <meshBasicMaterial map={tex.ridge2} color="#0a0d14" transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh position={[1.5, -2.4, -6]} scale={[20, 3.6, 1]} userData={{ baseOpacity: 1 }}>
          <planeGeometry />
          <meshBasicMaterial map={tex.ridge1} color="#06080d" transparent opacity={1} depthWrite={false} />
        </mesh>
        <FogBand tex={tex.fog} y={-1.9} z={-5} speed={0.014} opacity={0.13} />
        <FogBand tex={tex.fog} y={-2.2} z={-3.4} speed={-0.01} opacity={0.1} />
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
