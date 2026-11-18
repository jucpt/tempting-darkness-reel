import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from "./config";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TemptingDarkness"
    component={Reel}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
