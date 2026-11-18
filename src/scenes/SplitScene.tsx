import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXT } from "../config";
import { AnimatedText, TextBlock } from "../components/AnimatedText";
import { SlowZoom } from "../components/SlowZoom";

// Abstract busts (viewBox 1080x1920). Woman left, facing right; man right, facing left.
const WOMAN =
  "M 150 1500 C 150 1250 210 1130 300 1095 C 320 1088 335 1070 338 1040 " + // shoulder → neck
  "L 340 990 C 300 975 270 930 262 870 C 255 815 262 760 290 720 " + // back of neck → head back
  "C 320 680 380 668 420 690 C 450 707 462 735 466 760 " + // crown → forehead
  "C 470 780 468 790 478 806 C 486 818 482 826 470 828 " + // brow → nose
  "C 474 840 472 850 466 856 C 470 864 466 872 458 876 " + // lips
  "C 452 900 440 925 410 935 L 400 1040 C 404 1070 420 1090 452 1100 " + // chin → neck front
  "C 520 1125 560 1200 572 1300 L 580 1500 Z";
const WOMAN_HAIR =
  "M 292 712 C 230 760 210 860 226 960 C 238 1040 200 1120 170 1190 " +
  "C 230 1170 270 1120 290 1060 C 300 1100 290 1160 262 1220 " +
  "C 320 1190 350 1120 345 1040 C 340 990 330 960 320 930 Z";
const MAN =
  "M 1080 1500 L 1080 1180 C 1040 1110 960 1080 890 1065 C 860 1058 845 1040 842 1010 " +
  "L 840 965 C 880 950 905 905 912 850 C 918 800 912 740 885 700 " +
  "C 855 655 790 642 745 662 C 712 676 694 705 688 732 " +
  "C 684 750 686 770 674 790 C 664 806 668 814 682 818 " +
  "C 678 832 680 842 688 848 C 684 856 688 866 698 870 " +
  "C 706 900 720 922 752 940 C 770 950 772 990 768 1030 " +
  "C 762 1065 740 1085 700 1100 C 600 1135 540 1220 520 1320 L 500 1500 Z";

/** Scene 3 – two silhouettes separated by a widening crack of golden light. */
export const SplitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const open = interpolate(frame, [0, 60], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" });
  const gap = interpolate(frame, [0, durationInFrames], [10, 34]);
  const flick = 0.92 + 0.08 * Math.sin(frame / 3.3) * Math.sin(frame / 7.1);
  const drift = interpolate(frame, [0, durationInFrames], [0, 26]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <SlowZoom from={1.0} to={1.08} originY="45%">
        {/* back light from the crack */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${18 + open * 22}% 60% at 50% 46%, rgba(216,169,74,${0.55 * open * flick}), rgba(142,15,28,${0.45 * open}) 40%, rgba(12,6,7,0) 80%)`,
          }}
        />
        {/* the crack itself */}
        <div
          style={{
            position: "absolute",
            left: 540 - gap / 2,
            top: 0,
            bottom: 0,
            width: gap,
            opacity: open,
            background:
              "linear-gradient(180deg, rgba(255,236,190,0) 0%, rgba(255,236,190,0.95) 25%, #fff4d8 48%, rgba(255,236,190,0.95) 70%, rgba(255,236,190,0) 100%)",
            boxShadow: `0 0 60px 14px rgba(243,213,138,${0.7 * flick}), 0 0 220px 60px rgba(142,15,28,0.55)`,
            filter: "blur(1.5px)",
          }}
        />
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="rimW" x1="0" x2="1">
              <stop offset="0.75" stopColor="#050203" />
              <stop offset="1" stopColor="#5a2a14" />
            </linearGradient>
            <linearGradient id="rimM" x1="1" x2="0">
              <stop offset="0.75" stopColor="#050203" />
              <stop offset="1" stopColor="#5a2a14" />
            </linearGradient>
            <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.55" stopColor="#0c0607" stopOpacity="0" />
              <stop offset="0.78" stopColor="#0c0607" stopOpacity="1" />
            </linearGradient>
          </defs>
          <g transform={`translate(${-drift - 40} 0)`}>
            <path d={WOMAN_HAIR} fill="#050203" />
            <path d={WOMAN} fill="url(#rimW)" stroke={COLORS.gold} strokeOpacity={0.55 * open} strokeWidth={2.5} />
          </g>
          <g transform={`translate(${drift + 40} 0)`}>
            <path d={MAN} fill="url(#rimM)" stroke={COLORS.gold} strokeOpacity={0.55 * open} strokeWidth={2.5} />
          </g>
          <rect width="1080" height="1920" fill="url(#fadeDown)" />
        </svg>
      </SlowZoom>
      <TextBlock top={1330}>
        <AnimatedText text={TEXT.split} delay={22} fontSize={88} highlight={["Ex-Soldat"]} />
      </TextBlock>
    </AbsoluteFill>
  );
};
