import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { COLORS, TEXT } from "../config";
import { AnimatedText, TextBlock } from "../components/AnimatedText";
import { SlowZoom } from "../components/SlowZoom";

const CY = 820; // vertical centre of the light slit

/** Scene 1 – darkness, a thin streak of light ignites and opens like an eye. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const lineW = interpolate(frame, [8, 38], [0, 1080], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const open = interpolate(frame, [30, 85], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineAlpha = interpolate(frame, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shimmer = 0.9 + 0.1 * Math.sin(frame / 5);
  const slitH = 4 + open * 560;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <SlowZoom from={1.0} to={1.12} originY={`${(CY / 1920) * 100}%`}>
        {/* warm ambient spill that grows as the slit opens */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 90% ${10 + open * 30}% at 50% ${(CY / 1920) * 100}%, rgba(142,15,28,${0.55 * open}), rgba(74,5,12,${0.3 * open}) 45%, rgba(0,0,0,0) 75%)`,
          }}
        />
        {/* the opening slit – lens-shaped via an ellipse clip */}
        <div
          style={{
            position: "absolute",
            left: 540 - lineW / 2,
            top: CY - slitH / 2,
            width: lineW,
            height: slitH,
            borderRadius: "50%",
            opacity: lineAlpha,
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,240,205,${shimmer}) 0%, ${COLORS.goldLight} 12%, ${COLORS.gold} 30%, rgba(142,15,28,0.9) 62%, rgba(40,3,8,0) 100%)`,
            boxShadow: `0 0 ${40 + open * 120}px rgba(216,169,74,${0.55 * lineAlpha}), 0 0 ${200 * open}px rgba(142,15,28,0.6)`,
          }}
        />
        {/* hot core line */}
        <div
          style={{
            position: "absolute",
            left: 540 - (lineW * 0.8) / 2,
            top: CY - 1.5,
            width: lineW * 0.8,
            height: 3,
            opacity: lineAlpha * (1 - open * 0.6),
            background: "linear-gradient(90deg, rgba(255,240,200,0), #fff6dc 50%, rgba(255,240,200,0))",
            boxShadow: "0 0 30px #f3d58a",
          }}
        />
        {/* soft vertical light rays */}
        {[-1, 1].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              left: 540 - 2,
              top: CY - 700 * open,
              height: 1400 * open,
              width: 4,
              opacity: 0.25 * open,
              transform: `rotate(${d * 22}deg)`,
              background: "linear-gradient(180deg, rgba(243,213,138,0), rgba(243,213,138,0.9) 50%, rgba(243,213,138,0))",
              filter: "blur(6px)",
            }}
          />
        ))}
      </SlowZoom>
      <TextBlock top={1240}>
        <AnimatedText text={TEXT.hook} delay={42} fontSize={86} highlight={["Mafiabosses"]} />
      </TextBlock>
    </AbsoluteFill>
  );
};
