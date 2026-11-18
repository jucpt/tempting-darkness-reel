import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/** Slow Ken-Burns style push-in over the full length of the parent sequence. */
export const SlowZoom: React.FC<{
  from?: number;
  to?: number;
  originY?: string;
  children: React.ReactNode;
}> = ({ from = 1, to = 1.1, originY = "50%", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to]);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `50% ${originY}` }}>
      {children}
    </AbsoluteFill>
  );
};
