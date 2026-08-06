/**
 * Seedance video assets.
 *
 * Every cinematic slot renders a CSS "cine-field" placeholder at the exact
 * framing the video will occupy. Flip `ready` to true once the encoded
 * webm/mp4 pair and poster frame land in /public/videos — no layout changes
 * are needed, the video simply cross-fades in over the placeholder.
 */

export type VideoAsset = {
  id: string;
  /** false = render the cinematic gradient placeholder instead */
  ready: boolean;
  webm: string;
  mp4: string;
  poster: string;
  /** lighter loop for small screens / save-data */
  mobileMp4?: string;
  prompt: string;
};

export const VIDEOS = {
  hero: {
    id: "A",
    ready: false,
    webm: "/videos/hero.webm",
    mp4: "/videos/hero.mp4",
    poster: "/videos/hero.jpg",
    mobileMp4: "/videos/hero-mobile.mp4",
    prompt:
      "Cinematic macro shot, dark void, molten liquid gold and obsidian glass forms slowly colliding and merging, volumetric light rays, ultra-slow motion, shallow depth of field, high-end finance commercial aesthetic, near-black background with electric accent glints, 4K, photorealistic",
  },
  bridge: {
    id: "B",
    ready: false,
    webm: "/videos/bridge.webm",
    mp4: "/videos/bridge.mp4",
    poster: "/videos/bridge.jpg",
    prompt:
      "A glowing translucent crystalline coin dissolves into thousands of light particles that reassemble into a rising holographic stock chart, dark background, cinematic lighting, slow motion, seamless",
  },
  card: {
    id: "C",
    ready: false,
    webm: "/videos/card.webm",
    mp4: "/videos/card.mp4",
    poster: "/videos/card.jpg",
    prompt:
      "Premium matte-black metal debit card rotating slowly in dramatic studio lighting, light sweep across brushed metal surface, floating in dark space, macro detail, luxury product commercial",
  },
  finale: {
    id: "D",
    ready: false,
    webm: "/videos/finale.webm",
    mp4: "/videos/finale.mp4",
    poster: "/videos/finale.jpg",
    mobileMp4: "/videos/finale-mobile.mp4",
    prompt:
      "Slow aerial drift through a dark abstract cityscape made of glowing candlestick charts and light trails, cinematic anamorphic look, deep blacks, single accent color",
  },
} satisfies Record<string, VideoAsset>;

export type VideoKey = keyof typeof VIDEOS;
