import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXT, TITLE_HIT_FRAME } from "../config";
import { AnimatedText, TextBlock } from "../components/AnimatedText";
import { SlowZoom } from "../components/SlowZoom";
import { SANS, SERIF, SERIF_ITALIC } from "../fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Abstract emblem: thin gold rings, a crimson diamond and a thorn-like crown of strokes. */
const Emblem: React.FC<{ p: number; rot: number }> = ({ p, rot }) => (
  <svg width="300" height="300" viewBox="-150 -150 300 300" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={COLORS.goldLight} />
        <stop offset="1" stopColor="#9b6a22" />
      </linearGradient>
    </defs>
    <circle r="120" fill="none" stroke="url(#g)" strokeWidth="2" strokeDasharray={754} strokeDashoffset={754 * (1 - p)} />
    <circle r="100" fill="none" stroke="url(#g)" strokeWidth="1" opacity={0.6 * p} />
    <g transform={`rotate(${rot})`} opacity={p}>
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1="0" y1="-104" x2="0" y2={i % 2 ? -116 : -124} stroke="url(#g)" strokeWidth="2" transform={`rotate(${i * 15})`} />
      ))}
    </g>
    <g transform={`scale(${p})`}>
      <path d="M 0 -62 L 38 0 L 0 62 L -38 0 Z" fill="#8e0f1c" stroke="url(#g)" strokeWidth="2.5" />
      <path d="M 0 -62 L 0 62 M -38 0 L 38 0" stroke={COLORS.goldLight} strokeWidth="1" opacity="0.6" />
    </g>
  </svg>
);

/** Scene 5 – title card with deep hit, author, genre labels and call to action. */
export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const f = frame - TITLE_HIT_FRAME;
  const sp = (delay: number, damping = 18) => spring({ frame: f - delay, fps, config: { damping, stiffness: 80 } });

  const flash = interpolate(f, [0, 2, 16], [0, 1, 0], clamp);
  const titleS = sp(0, 13);
  const sub = sp(12);
  const line = sp(18);
  const author = sp(24);
  const shine = interpolate(f, [10, 70], [-60, 160], clamp);
  const endFade = interpolate(frame, [durationInFrames - 8, durationInFrames - 1], [1, 0], clamp);
  const ctaDelay = 62;
  const bounce = f > ctaDelay + 15 ? Math.abs(Math.sin((f - ctaDelay) / 7)) * 14 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, opacity: endFade }}>
      <SlowZoom from={1.06} to={1.0}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 38%, rgba(142,15,28,0.55), rgba(74,5,12,0.3) 45%, rgba(0,0,0,0) 75%), radial-gradient(ellipse 60% 25% at 50% 80%, rgba(216,169,74,0.12), rgba(0,0,0,0) 70%)",
          }}
        />
        <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}>
          <Emblem p={sp(-4, 20)} rot={frame * 0.25} />
        </div>
      </SlowZoom>

      {/* title */}
      <div
        style={{
          position: "absolute",
          top: 650,
          width: "100%",
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 118,
          lineHeight: 1.02,
          letterSpacing: "0.04em",
          opacity: interpolate(titleS, [0, 0.5], [0, 1], clamp),
          transform: `scale(${interpolate(titleS, [0, 1], [1.35, 1])})`,
          filter: `blur(${interpolate(titleS, [0, 1], [16, 0])}px) drop-shadow(0 6px 30px rgba(0,0,0,0.9))`,
        }}
      >
        <span
          style={{
            backgroundImage: `linear-gradient(105deg, #9b6a22 0%, ${COLORS.goldLight} 30%, #fff3cf ${shine}%, ${COLORS.gold} ${shine + 12}%, #7d5218 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          TEMPTING
          <br />
          DARKNESS
        </span>
      </div>

      {/* subtitle */}
      <div
        style={{
          position: "absolute",
          top: 925,
          width: "100%",
          textAlign: "center",
          fontFamily: SERIF_ITALIC,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 88,
          color: COLORS.ivory,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
          textShadow: "0 0 30px rgba(142,15,28,0.9)",
        }}
      >
        – {TEXT.subtitle} –
      </div>

      {/* ornament line */}
      <div style={{ position: "absolute", top: 1052, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <div style={{ height: 2, width: 260 * line, background: `linear-gradient(90deg, rgba(216,169,74,0), ${COLORS.gold})` }} />
        <div style={{ width: 14, height: 14, transform: `rotate(45deg) scale(${line})`, background: COLORS.red, border: `2px solid ${COLORS.gold}` }} />
        <div style={{ height: 2, width: 260 * line, background: `linear-gradient(90deg, ${COLORS.gold}, rgba(216,169,74,0))` }} />
      </div>

      {/* author */}
      <div
        style={{
          position: "absolute",
          top: 1090,
          width: "100%",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 50,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: COLORS.goldLight,
          opacity: author,
          transform: `translateY(${(1 - author) * 24}px)`,
        }}
      >
        {TEXT.author}
      </div>

      {/* genre labels */}
      <div style={{ position: "absolute", top: 1205, width: "100%", display: "flex", justifyContent: "center", gap: 22 }}>
        {TEXT.labels.map((l, i) => {
          const s = sp(34 + i * 6, 14);
          return (
            <div
              key={l}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: "0.06em",
                color: i === 2 ? COLORS.ivory : COLORS.goldLight,
                padding: "14px 28px",
                borderRadius: 999,
                border: `2px solid ${i === 2 ? "#c2303c" : COLORS.gold}`,
                background: i === 2 ? "rgba(142,15,28,0.55)" : "rgba(20,10,8,0.7)",
                boxShadow: "0 0 24px rgba(216,169,74,0.18)",
                opacity: s,
                transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>

      {/* call to action */}
      <TextBlock top={1420}>
        <div style={{ transform: `translateY(${-bounce * 0.3}px)` }}>
          <AnimatedText text={TEXT.cta} delay={TITLE_HIT_FRAME + ctaDelay} stagger={3} fontSize={76} />
        </div>
      </TextBlock>

      {/* hit flash */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(circle at 50% 45%, rgba(255,236,190,${flash}), rgba(216,169,74,${flash * 0.6}) 40%, rgba(142,15,28,${flash * 0.3}) 80%)`,
        }}
      />
    </AbsoluteFill>
  );
};
