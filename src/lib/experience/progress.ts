/**
 * The single normalized progress value for the whole Bitra experience.
 *
 * One pinned ScrollTrigger writes `p` (0 → 1); the R3F scene, the
 * environment layer and the DOM overlays all read it. Because every
 * consumer derives from the same number rather than keeping its own
 * timeline, forward and reverse scrolling cannot drift apart, and no
 * consumer needs React state on the animation frame.
 *
 * This is a mutable singleton on purpose: it is written up to 60×/s and
 * must never trigger a React render.
 */
export const experience = {
  /** normalized story progress, 0..1 */
  p: 0,
  /** identity tag — proves every consumer shares one module instance */
  id: Math.random().toString(36).slice(2, 8),
  /** pointer, normalized -0.5..0.5 (desktop only) */
  px: 0,
  py: 0,
  /** |dp/dt| — used to duck idle motion and pointer influence while scrolling */
  vel: 0,
  /** prefers-reduced-motion: static composition, no idle motion */
  frozen: false,
  /** small-viewport framing and reduced effect budget */
  mobile: false,
};

/**
 * Stage boundaries along `p` — the Bitra journey.
 *
 * Aurora landscape → market-access threshold → Bitra card → smoked-glass
 * market panel → live exchange chamber. Named so the scene reads as a story,
 * and so a boundary moves in exactly one place.
 */
export const STAGE = {
  arrival: [0.0, 0.22],
  approach: [0.22, 0.45],
  portal: [0.45, 0.64],
  orbit: [0.64, 0.8],
  panel: [0.8, 0.92],
  chamber: [0.92, 1.0],
} as const;

/**
 * The object turns continuously through 2π across the journey. Each layer
 * sits at a local rotation that is front-facing only inside its own window,
 * so the phone→card and card→panel handovers happen while the plane is
 * edge-on and therefore invisible. No cut, no flash, no empty frame.
 */
export const TURN = {
  /** phone flips into the card: 0 → π, edge-on at the midpoint */
  portalFrom: 0,
  portalTo: Math.PI,
  /** card flips into the panel: π → 2π, edge-on at the midpoint */
  panelTo: Math.PI * 2,
} as const;

/**
 * Crossfade windows, centred on the edge-on crossings.
 *
 * The turn reaches π/2 at p≈0.545 and 3π/2 at p≈0.86, where the plane is
 * physically invisible. Fades are kept tight around those points so each
 * subject resolves quickly and then holds — the card is fully readable from
 * ~0.57 to ~0.84, which is the deliberate hold the story needs.
 */
export const FADE = {
  phoneOut: [0.522, 0.545],
  cardIn: [0.545, 0.572],
  cardOut: [0.838, 0.86],
  panelIn: [0.86, 0.888],
} as const;

/** threshold glow peaks as the object passes through the portal */
export const BLOOM = [0.42, 0.62] as const;

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as Record<string, unknown>).__exp = experience;
  (window as unknown as Record<string, unknown>).__fade = FADE;
}

/** clamped sub-range progress: 0 before `a`, 1 after `b` */
export function seg(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/** convenience: seg() over a named stage */
export function stage(p: number, key: keyof typeof STAGE): number {
  const [a, b] = STAGE[key];
  return seg(p, a, b);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** smooth ease for segment interpolation (power2-in-out feel) */
export function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** below this an object is treated as fully hidden — one threshold everywhere */
export const HIDDEN = 0.002;

/* ---------------------------------------------------------------------------
   Performance budget. Read by the canvas and the scene; kept here so the
   whole experience shares one set of numbers.
   --------------------------------------------------------------------------- */
export const BUDGET = {
  dpr: {
    desktop: [1, 1.5] as [number, number],
    mobile: [1, 1.25] as [number, number],
  },
  /** peak pointer parallax as a fraction of a unit — desktop only, <2% */
  pointerInfluence: 0.018,
  /** scroll speed at which pointer influence and idle motion are fully ducked */
  velocityDuck: 14,
} as const;

/* ---------------------------------------------------------------------------
   Environment sources.

   `active` is what renders today and is intentionally unchanged. `journey`
   holds the optimized plates committed in the asset checkpoint, ready to be
   switched on in the next checkpoint without touching layer code.
   --------------------------------------------------------------------------- */
export const ENVIRONMENT = {
  active: {
    opening: { desktop: "/videos/space.mp4", mobile: "/videos/space.mp4" },
    chamber: { desktop: "/videos/world.mp4", mobile: "/videos/world.mp4" },
  },
  journey: {
    desktop: "/bitra/experience/journey-desktop.mp4",
    mobile: "/bitra/experience/journey-mobile.mp4",
    poster: "/bitra/experience/journey-poster.webp",
    aurora: "/bitra/experience/aurora-opening.webp",
    chamber: "/bitra/experience/exchange-chamber.webp",
  },
} as const;
