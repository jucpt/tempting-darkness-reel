import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXT } from "../config";
import { AnimatedText, TextBlock } from "../components/AnimatedText";
import { Palm } from "../components/Palm";
import { SlowZoom } from "../components/SlowZoom";

const HORIZON = 1180;

/** Scene 2 – blood-red sunset over the sea, palm silhouettes, "Kuba. Hitze. Gefahr." */
export const CubaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sunY = interpolate(frame, [0, durationInFrames], [HORIZON - 70, HORIZON + 10]);
  const sway = (phase: number) => Math.sin(frame / 28 + phase) * 1.8;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <SlowZoom from={1.08} to={1.0} originY="62%">
        <svg width="1080" height="1920" viewBox="0 0 1080 1920">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#060203" />
              <stop offset="0.22" stopColor="#1c0408" />
              <stop offset="0.42" stopColor="#4d0811" />
              <stop offset="0.55" stopColor="#9a2318" />
              <stop offset="0.6" stopColor="#d06a2a" />
              <stop offset="0.615" stopColor="#f2b45c" />
            </linearGradient>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a1410" />
              <stop offset="0.25" stopColor="#24060a" />
              <stop offset="1" stopColor="#050203" />
            </linearGradient>
            <radialGradient id="sun" cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#fff2c6" />
              <stop offset="0.5" stopColor="#f6c060" />
              <stop offset="1" stopColor="#e07a2c" />
            </radialGradient>
            <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="rgba(246,180,90,0.55)" />
              <stop offset="1" stopColor="rgba(246,120,60,0)" />
            </radialGradient>
            <clipPath id="aboveHorizon">
              <rect x="0" y="0" width="1080" height={HORIZON} />
            </clipPath>
            <mask id="sunStripes">
              <rect x="0" y="0" width="1080" height="1920" fill="white" />
              {Array.from({ length: 7 }, (_, i) => (
                <rect key={i} x="0" y={HORIZON - 30 - i * 30 + ((frame * 0.6) % 30)} width="1080" height={3 + (6 - i) * 1.6} fill="black" />
              ))}
            </mask>
          </defs>

          <rect width="1080" height={HORIZON} fill="url(#sky)" />
          <ellipse cx="540" cy={sunY} rx="620" ry="420" fill="url(#halo)" clipPath="url(#aboveHorizon)" />
          <g clipPath="url(#aboveHorizon)" mask="url(#sunStripes)">
            <circle cx="540" cy={sunY} r="230" fill="url(#sun)" />
          </g>

          {/* sea */}
          <rect y={HORIZON} width="1080" height={1920 - HORIZON} fill="url(#sea)" />
          {/* shimmering sun reflection */}
          {Array.from({ length: 26 }, (_, i) => {
            const y = HORIZON + 8 + i * i * 0.9 + i * 8;
            const w = (220 - i * 5) * (0.6 + 0.4 * Math.sin(frame / 9 + i * 1.3));
            const off = Math.sin(frame / 14 + i * 0.7) * 18;
            return (
              <rect
                key={i}
                x={540 - w / 2 + off}
                y={y}
                width={Math.max(w, 0)}
                height={3 + i * 0.25}
                rx="2"
                fill="#f6c060"
                opacity={0.75 - i * 0.026}
              />
            );
          })}
          {/* horizon glow line */}
          <rect y={HORIZON - 1} width="1080" height="2" fill="#f7cf80" opacity="0.6" />

          {/* palms */}
          <Palm x={70} baseY={2000} height={980} lean={130} sway={sway(0)} seed={1} />
          <Palm x={250} baseY={2020} height={680} lean={-40} sway={sway(1.4)} seed={4} />
          <Palm x={1020} baseY={2000} height={900} lean={-150} sway={sway(2.2)} seed={2} />
          {/* dark foreground beach */}
          <path d={`M0 1760 Q 540 1700 1080 1770 L1080 1920 L0 1920 Z`} fill="#040102" />
        </svg>
      </SlowZoom>

      <TextBlock top={300}>
        {TEXT.cuba.map((w, i) => (
          <AnimatedText
            key={w}
            text={w}
            delay={14 + i * 20}
            fontSize={132}
            letterSpacing="0.04em"
            lineHeight={1.12}
            uppercase
            color={i === 2 ? COLORS.goldLight : COLORS.ivory}
          />
        ))}
      </TextBlock>
    </AbsoluteFill>
  );
};
