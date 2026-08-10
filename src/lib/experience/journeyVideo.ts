/**
 * Deterministic video scrubbing for the journey plate.
 *
 * The element is never played as a film: its currentTime is a pure function
 * of the normalized experience progress, so scrolling backwards lands on
 * exactly the same frame as scrolling forwards. Driven from the existing
 * pinned ScrollTrigger's onUpdate — this module owns no RAF loop, no
 * ScrollTrigger and no React state.
 *
 * The plate is encoded with a 15-frame GOP precisely so these seeks are cheap.
 */

type State = {
  el: HTMLVideoElement | null;
  duration: number;
  /** metadata parsed — safe to set currentTime */
  seekable: boolean;
  /** enough data decoded to show a frame — safe to hide the poster */
  painted: boolean;
};

export const journeyVideo: State = {
  el: null,
  duration: 0,
  seekable: false,
  painted: false,
};

/** last committed time, to skip redundant seeks within a frame's tolerance */
let lastTime = -1;

/** seeks closer together than this are visually indistinguishable */
const EPSILON = 1 / 48;
/** never seek the final frame exactly — some decoders stall on it */
const TAIL_GUARD = 0.05;

export function attachJourneyVideo(el: HTMLVideoElement): () => void {
  journeyVideo.el = el;
  journeyVideo.seekable = false;
  journeyVideo.painted = false;
  lastTime = -1;

  const onMeta = () => {
    if (!Number.isFinite(el.duration) || el.duration <= 0) return;
    journeyVideo.duration = el.duration;
    journeyVideo.seekable = true;
    // land on the opening frame immediately so the first paint is correct
    try {
      el.currentTime = 0;
    } catch {
      /* seeking may not be permitted yet; the poster covers this */
    }
  };

  const onPainted = () => {
    journeyVideo.painted = true;
  };

  el.addEventListener("loadedmetadata", onMeta);
  el.addEventListener("loadeddata", onPainted);
  el.addEventListener("seeked", onPainted);

  // already buffered from cache
  if (el.readyState >= 1) onMeta();
  if (el.readyState >= 2) onPainted();

  // Some engines refuse to decode a never-played element. A muted
  // play/pause primes the decoder; failure is harmless — the poster stays.
  const prime = () => {
    void el
      .play()
      .then(() => el.pause())
      .catch(() => {});
  };
  prime();

  return () => {
    el.removeEventListener("loadedmetadata", onMeta);
    el.removeEventListener("loadeddata", onPainted);
    el.removeEventListener("seeked", onPainted);
    journeyVideo.el = null;
    journeyVideo.seekable = false;
    journeyVideo.painted = false;
    journeyVideo.duration = 0;
    lastTime = -1;
  };
}

/** Map normalized progress onto the plate. Pure, clamped, idempotent. */
export function scrubJourney(p: number): void {
  const el = journeyVideo.el;
  if (!el || !journeyVideo.seekable) return;

  const span = Math.max(0, journeyVideo.duration - TAIL_GUARD);
  const t = Math.min(span, Math.max(0, p) * span);

  if (Math.abs(t - lastTime) < EPSILON) return;
  lastTime = t;

  // never let it run on its own clock
  if (!el.paused) el.pause();
  try {
    el.currentTime = t;
  } catch {
    /* transient seek rejection — next update retries */
  }
}
