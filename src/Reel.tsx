import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import { COLORS, DURATION_IN_FRAMES, SCENES, SceneKey, TRANSITION } from "./config";
import { Fog } from "./components/Fog";
import { Vignette } from "./components/Vignette";
import { HookScene } from "./scenes/HookScene";
import { CubaScene } from "./scenes/CubaScene";
import { SplitScene } from "./scenes/SplitScene";
import { HeartScene } from "./scenes/HeartScene";
import { TitleScene } from "./scenes/TitleScene";
import { SceneFade } from "./components/SceneFade";

const ORDER: [SceneKey, React.FC][] = [
  ["hook", HookScene],
  ["cuba", CubaScene],
  ["split", SplitScene],
  ["heart", HeartScene],
  ["title", TitleScene],
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
    {ORDER.map(([key, Scene], i) => {
      const { from, duration } = SCENES[key];
      const isFirst = i === 0;
      const isLast = i === ORDER.length - 1;
      // every scene (except the last) overlaps the next one for a crossfade
      const len = isLast ? DURATION_IN_FRAMES - from : duration + TRANSITION;
      return (
        <Sequence key={key} from={from} durationInFrames={len} name={key}>
          <SceneFade fadeIn={!isFirst} total={len}>
            <Scene />
          </SceneFade>
        </Sequence>
      );
    })}
    <Fog />
    <Vignette />
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);
