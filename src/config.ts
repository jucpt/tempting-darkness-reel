import timing from "./timing.json";

export const FPS = timing.fps;
export const WIDTH = timing.width;
export const HEIGHT = timing.height;
export const DURATION_IN_FRAMES = Math.round(timing.durationSec * FPS);
export const SAFE_ZONE = timing.safeZonePx;

export type SceneKey = keyof typeof timing.scenes;

const sec = (s: number) => Math.round(s * FPS);
export const TRANSITION = sec(timing.transitionSec);

/** Start frame + length (in frames) per scene, derived from timing.json. */
export const SCENES = Object.fromEntries(
  Object.entries(timing.scenes).map(([k, v]) => [
    k,
    { from: sec(v.from), duration: sec(v.to - v.from) },
  ]),
) as Record<SceneKey, { from: number; duration: number }>;

/** Scene texts — central so wording can be changed in one place. */
export const TEXT = {
  hook: "Sie ist die Tochter des Mafiabosses 🖤",
  cuba: ["Kuba.", "Hitze.", "Gefahr."],
  split: "Ein Ex-Soldat soll sie beschützen",
  heart: "Aber kann sie ihm wirklich vertrauen?",
  title: "Tempting Darkness",
  subtitle: "Rette mich",
  author: "Carol Delight",
  labels: ["Mafia Romance", "Age Gap", "ab 16"],
  cta: "Würdest du es lesen? 👇",
};

export const COLORS = {
  black: "#050304",
  night: "#0c0607",
  gold: "#d8a94a",
  goldLight: "#f3d58a",
  red: "#8e0f1c",
  redDeep: "#4a050c",
  ivory: "#f6ecd9",
};

/**
 * Heartbeat times (seconds, relative to the heart scene start).
 * The same algorithm is used in scripts/make_audio.py so picture and sound stay in sync.
 */
export const heartbeatTimes = (): number[] => {
  const { startBpm, endBpm, endPaddingSec } = timing.heartbeat;
  const dur = timing.scenes.heart.to - timing.scenes.heart.from - endPaddingSec;
  const out: number[] = [];
  let t = 0.3;
  while (t < dur) {
    out.push(t);
    const bpm = startBpm + (endBpm - startBpm) * (t / dur);
    t += 60 / bpm;
  }
  return out;
};

export const TITLE_HIT_FRAME = sec(timing.titleHitOffsetSec);
