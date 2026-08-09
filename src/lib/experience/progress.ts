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
 * Stage boundaries along `p`. Named so the scene reads as a story rather
 * than a wall of magic numbers, and so a boundary is changed in one place.
 * Values are unchanged from the calibrated timeline.
 */
export const STAGE = {
  approach: [0.14, 0.36],
  dive: [0.38, 0.5],
  bloom: [0.32, 0.52],
  phoneFade: [0.46, 0.51],
  settle: [0.48, 0.68],
  swap: [0.7, 0.84],
  cardFade: [0.72, 0.8],
  panelIn: [0.72, 0.86],
  handoff: [0.88, 1.0],
} as const;

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
