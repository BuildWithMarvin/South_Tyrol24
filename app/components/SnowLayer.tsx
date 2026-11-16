"use client";

import { useEffect, useState, type CSSProperties } from "react";

import styles from "../calendar.module.css";

import { createFlakes, type FlakeSpec, type SnowDepth } from "@/lib/snow";

interface Flake {
  id: number;
  style: CSSProperties;
}

interface SnowLayerProps {
  /** `back` = far + mid flakes (behind the village); `near` = sparse foreground. */
  layer: "back" | "near";
}

function toFlake(spec: FlakeSpec): Flake {
  return {
    id: spec.id,
    style: {
      left: `${spec.left}%`,
      ...(spec.top !== undefined ? { top: `${spec.top}%` } : null),
      width: spec.size,
      height: spec.size,
      opacity: spec.opacity,
      background: spec.color,
      filter: spec.blur ? `blur(${spec.blur}px)` : undefined,
      animationDuration: `${spec.duration}s`,
      animationDelay: `${spec.delay}s`,
      "--sway": `${spec.sway}px`,
    } as CSSProperties,
  };
}

export function SnowLayer({ layer }: SnowLayerProps) {
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const [still, setStill] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const depths: SnowDepth[] = layer === "back" ? ["far", "mid"] : ["near"];
    const wideQuery = window.matchMedia("(min-width: 640px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const rebuild = () => {
      setStill(motionQuery.matches);
      setFlakes(
        layer === "near" && motionQuery.matches
          ? []
          : createFlakes(depths, wideQuery.matches, motionQuery.matches).map(
              toFlake,
            ),
      );
    };

    const onVisibility = () => setPaused(document.hidden);

    rebuild();
    onVisibility();
    wideQuery.addEventListener("change", rebuild);
    motionQuery.addEventListener("change", rebuild);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      wideQuery.removeEventListener("change", rebuild);
      motionQuery.removeEventListener("change", rebuild);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [layer]);

  if (flakes.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.snowLayer} ${
        layer === "near" ? styles.snowNear : styles.snowBack
      }`}
      data-paused={paused}
      data-still={still}
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span key={flake.id} className={styles.flake} style={flake.style} />
      ))}
    </div>
  );
}
