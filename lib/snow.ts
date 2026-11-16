export type SnowDepth = "far" | "mid" | "near";

export interface FlakeSpec {
  id: number;
  depth: SnowDepth;
  /** Percent of viewport width. */
  left: number;
  /** Percent of viewport height; only set for static (reduced-motion) dots. */
  top?: number;
  size: number;
  opacity: number;
  color: string;
  blur: number;
  duration: number;
  /** Always negative: the screen is already snowing on first paint. */
  delay: number;
  sway: number;
}

/** [count on phones, count from 640px] per depth. */
export const SNOW_COUNTS: Record<SnowDepth, [number, number]> = {
  far: [22, 38],
  mid: [14, 24],
  near: [4, 8],
};

export const STILL_DOT_COUNT = 8;

type Range = [number, number];

export const SNOW_SPEC: Record<
  SnowDepth,
  { size: Range; opacity: Range; dur: Range; sway: Range; blur: number }
> = {
  far: { size: [2, 3], opacity: [0.3, 0.5], dur: [20, 25], sway: [10, 16], blur: 0 },
  mid: { size: [3, 4], opacity: [0.5, 0.7], dur: [14, 18], sway: [12, 18], blur: 0 },
  near: { size: [5, 8], opacity: [0.6, 0.8], dur: [10, 14], sway: [14, 20], blur: 1.5 },
};

const COLORS = ["#f6efd8", "#ffffff"];

export function createFlakes(
  depths: SnowDepth[],
  wide: boolean,
  still: boolean,
  random: () => number = Math.random,
): FlakeSpec[] {
  const rand = (min: number, max: number) => min + random() * (max - min);
  const flakes: FlakeSpec[] = [];
  let id = 0;

  for (const depth of depths) {
    if (still && depth !== "far") {
      continue;
    }
    const spec = SNOW_SPEC[depth];
    const count = still ? STILL_DOT_COUNT : SNOW_COUNTS[depth][wide ? 1 : 0];

    for (let i = 0; i < count; i += 1) {
      const duration = rand(...spec.dur);
      flakes.push({
        id: id++,
        depth,
        left: rand(0, 100),
        ...(still ? { top: rand(2, 70) } : null),
        size: rand(...spec.size),
        opacity: rand(...spec.opacity),
        color: COLORS[random() < 0.5 ? 0 : 1],
        blur: spec.blur,
        duration,
        delay: -rand(0, duration),
        sway: rand(...spec.sway) * (random() < 0.5 ? -1 : 1),
      });
    }
  }

  return flakes;
}
