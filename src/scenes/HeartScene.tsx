import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, heartbeatTimes, TEXT } from "../config";
import { AnimatedText, TextBlock } from "../components/AnimatedText";
import { SlowZoom } from "../components/SlowZoom";

const HEART =
  "M 0 -60 C -20 -110 -110 -115 -118 -40 C -124 20 -60 70 0 120 C 60 70 124 20 118 -40 C 110 -115 20 -110 0 -60 Z";

/** Scene 4 – flickering light, a heart beating faster and faster, ECG trace. */
export const HeartScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beats = heartbeatTimes();

  // pulse: sum of lub (strong) + dub (weaker) decays from the last beat
  let pulse = 0;
  for (const b of beats) {
    const d = t - b;
    if (d >= 0 && d < 0.6) pulse = Math.max(pulse, Math.exp(-d * 14));
    const d2 = d - 0.15;
    if (d2 >= 0 && d2 < 0.5) pulse = Math.max(pulse, 0.55 * Math.exp(-d2 * 16));
  }
  const scale = 1 + pulse * 0.16;

  // light flicker: mostly on, occasional drops (deterministic)
  const step = Math.floor(frame / 2);
  const r = random(`flick-${step}`);
  const flicker = r < 0.12 ? 0.25 + r * 2 : r < 0.2 ? 0.7 : 1;
  const lamp = flicker * (0.85 + 0.15 * Math.sin(frame / 2.7));

  // ECG trace: spikes at beat times scrolling right → left
  const W = 1080;
  const pxPerSec = 360;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 4) {
    const tt = t - (W - x) / pxPerSec;
    let y = 0;
    for (const b of beats) {
      const d = tt - b;
      if (d > -0.05 && d < 0.25) {
        y += -150 * Math.exp(-((d - 0.0) ** 2) / 0.00015) + 60 * Math.exp(-((d - 0.035) ** 2) / 0.0002);
        y += -40 * Math.exp(-((d - 0.17) ** 2) / 0.0008);
      }
    }
    if (tt < 0) y = 0;
    pts.push(`${x},${y.toFixed(1)}`);
  }

  const glow = 0.35 + pulse * 0.65;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <SlowZoom from={1.0} to={1.12} originY="40%">
        {/* hanging lamp light from above */}
        <AbsoluteFill
          style={{
            opacity: lamp,
            background:
              "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(243,213,138,0.42), rgba(216,169,74,0.12) 50%, rgba(0,0,0,0) 80%)",
          }}
        />
        {/* red heart glow */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 42%, rgba(180,20,35,${0.55 * glow}), rgba(74,5,12,${0.35 * glow}) 30%, rgba(0,0,0,0) 60%)`,
          }}
        />
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="heartFill" cx="0.4" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#e2343f" />
              <stop offset="0.55" stopColor="#8e0f1c" />
              <stop offset="1" stopColor="#3a0309" />
            </radialGradient>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>
          <g transform={`translate(540 810) scale(${2.4 * scale})`}>
            <path d={HEART} fill="#ff3b4a" opacity={0.35 * glow} filter="url(#soft)" transform="scale(1.15)" />
            <path d={HEART} fill="url(#heartFill)" stroke={COLORS.goldLight} strokeWidth={1.6} strokeOpacity={0.7 * lamp} />
            {/* a hairline crack through the heart */}
            <path
              d="M 4 -58 L -10 -20 L 12 10 L -6 48 L 6 80"
              stroke={COLORS.black}
              strokeWidth={3}
              fill="none"
              opacity={0.75}
            />
          </g>
          <g transform="translate(0 1180)" opacity={0.85}>
            <polyline points={pts.join(" ")} fill="none" stroke="#ff4a55" strokeWidth={5} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 10px #ff2a3a)" }} />
          </g>
        </svg>
        {/* darkness dip when the light drops */}
        <AbsoluteFill style={{ backgroundColor: "black", opacity: (1 - flicker) * 0.6 }} />
      </SlowZoom>
      <TextBlock top={1330}>
        <AnimatedText text={TEXT.heart} delay={16} stagger={5} fontSize={86} highlight={["vertrauen?"]} />
      </TextBlock>
    </AbsoluteFill>
  );
};
