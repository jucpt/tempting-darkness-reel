import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { TRANSITION } from "../config";

/** Fades a scene in over the transition window so neighbouring scenes crossfade. */
export const SceneFade: React.FC<{ fadeIn: boolean; total: number; children: React.ReactNode }> = ({
  fadeIn,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, TRANSITION], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
