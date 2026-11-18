import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../config";

const PUFFS = Array.from({ length: 16 }, (_, i) => ({
  x: random(`px${i}`) * WIDTH,
  y: random(`py${i}`) * HEIGHT,
  size: 500 + random(`ps${i}`) * 700,
  vx: (random(`pvx${i}`) - 0.5) * 0.9,
  vy: -0.2 - random(`pvy${i}`) * 0.5,
  warm: random(`pw${i}`) > 0.55,
  alpha: 0.05 + random(`pa${i}`) * 0.07,
  phase: random(`pph${i}`) * Math.PI * 2,
}));

const MOTES = Array.from({ length: 70 }, (_, i) => ({
  x: random(`mx${i}`) * WIDTH,
  y: random(`my${i}`) * HEIGHT,
  r: 1.2 + random(`mr${i}`) * 2.8,
  vy: -0.4 - random(`mv${i}`) * 1.1,
  drift: 10 + random(`md${i}`) * 30,
  phase: random(`mp${i}`) * Math.PI * 2,
  gold: random(`mg${i}`) > 0.25,
}));

const wrap = (v: number, max: number, pad: number) =>
  ((((v + pad) % (max + 2 * pad)) + (max + 2 * pad)) % (max + 2 * pad)) - pad;

/** Drifting smoke puffs + glowing dust motes, layered over every scene. */
export const Fog: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {PUFFS.map((p, i) => {
        const x = wrap(p.x + p.vx * frame, WIDTH, p.size / 2);
        const y = wrap(p.y + p.vy * frame, HEIGHT, p.size / 2);
        const breathe = 0.75 + 0.25 * Math.sin(frame / 40 + p.phase);
        const color = p.warm ? "190,120,70" : "150,140,140";
        return (
          <div
            key={`p${i}`}
            style={{
              position: "absolute",
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: p.size,
              height: p.size * 0.7,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, rgba(${color},${p.alpha * breathe}), rgba(${color},0))`,
            }}
          />
        );
      })}
      {MOTES.map((m, i) => {
        const x = m.x + Math.sin(frame / 35 + m.phase) * m.drift;
        const y = wrap(m.y + m.vy * frame, HEIGHT, 20);
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(frame / 22 + m.phase));
        const c = m.gold ? "243,200,120" : "220,70,60";
        return (
          <div
            key={`m${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: "50%",
              background: `rgba(${c},${0.8 * twinkle})`,
              boxShadow: `0 0 ${m.r * 5}px rgba(${c},${0.6 * twinkle})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
