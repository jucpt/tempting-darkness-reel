import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";
import { EMOJI, SANS } from "../fonts";

const EMOJI_RE = /\p{Extended_Pictographic}/u;

type Props = {
  text: string;
  /** frame (relative to the scene) at which the first word starts */
  delay?: number;
  stagger?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  /** words (exact match, punctuation included) to tint gold */
  highlight?: string[];
  highlightColor?: string;
  letterSpacing?: string;
  lineHeight?: number;
  maxWidth?: number;
  uppercase?: boolean;
};

/** Word-by-word spring reveal (rise + de-blur + fade). Built for sound-off readability. */
export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  stagger = 4,
  fontSize = 84,
  fontFamily = SANS,
  fontWeight = 800,
  color = COLORS.ivory,
  highlight = [],
  highlightColor = COLORS.goldLight,
  letterSpacing = "0.01em",
  lineHeight = 1.18,
  maxWidth = 920,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        textAlign: "center",
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight,
        letterSpacing,
        color,
        textTransform: uppercase ? "uppercase" : "none",
        textShadow: "0 4px 24px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.8)",
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 16, stiffness: 90, mass: 0.9 },
        });
        const isEmoji = EMOJI_RE.test(w);
        const isHi = highlight.includes(w);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              opacity: interpolate(s, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(s, [0, 1], [46, 0])}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`,
              filter: isEmoji
                ? `blur(${interpolate(s, [0, 1], [10, 0])}px) drop-shadow(0 0 14px ${COLORS.gold}) drop-shadow(0 0 4px ${COLORS.goldLight})`
                : `blur(${interpolate(s, [0, 1], [12, 0])}px)`,
              fontFamily: isEmoji ? EMOJI : undefined,
              color: isHi ? highlightColor : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Absolutely positioned text block, kept inside the Instagram-safe band. */
export const TextBlock: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top }}>{children}</div>
);
