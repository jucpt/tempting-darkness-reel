import React from "react";

type Props = {
  x: number;
  baseY: number;
  height: number;
  /** horizontal offset of the crown relative to the base */
  lean: number;
  /** sway angle in degrees applied to the fronds */
  sway: number;
  color?: string;
  seed?: number;
};

const frondAngles = [-170, -140, -112, -80, -52, -22, 8, -195, -60];

/** Abstract palm-tree silhouette built from bezier fronds with hanging leaflets. */
export const Palm: React.FC<Props> = ({ x, baseY, height, lean, sway, color = "#050203", seed = 0 }) => {
  const cx = x + lean;
  const cy = baseY - height;
  // trunk: tapered curved band
  const midX = x + lean * 0.25;
  const midY = baseY - height * 0.5;
  const trunk = `M ${x - 26} ${baseY} Q ${midX - 22} ${midY} ${cx - 8} ${cy}
                 L ${cx + 8} ${cy} Q ${midX + 22} ${midY} ${x + 26} ${baseY} Z`;

  return (
    <g>
      <path d={trunk} fill={color} />
      {/* trunk rings */}
      {Array.from({ length: 14 }, (_, i) => {
        const t = (i + 1) / 15;
        const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * midX + t * t * cx;
        const py = (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * midY + t * t * cy;
        const w = 26 - 18 * t;
        return <ellipse key={i} cx={px} cy={py} rx={w + 3} ry={4} fill={color} />;
      })}
      <g transform={`rotate(${sway} ${cx} ${cy})`}>
        {frondAngles.map((deg, k) => {
          const a = ((deg + (seed % 7) * 3) * Math.PI) / 180;
          const L = height * (0.36 + 0.08 * Math.sin(k * 1.7 + seed));
          const droop = L * (0.35 + 0.15 * Math.cos(k + seed));
          const p1 = { x: cx + Math.cos(a) * L * 0.55, y: cy + Math.sin(a) * L * 0.55 - L * 0.22 };
          const p2 = { x: cx + Math.cos(a) * L, y: cy + Math.sin(a) * L + droop };
          const leaflets = [];
          for (let i = 1; i <= 16; i++) {
            const t = i / 17;
            const px = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * p1.x + t * t * p2.x;
            const py = (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * p1.y + t * t * p2.y;
            // tangent
            const tx = 2 * (1 - t) * (p1.x - cx) + 2 * t * (p2.x - p1.x);
            const ty = 2 * (1 - t) * (p1.y - cy) + 2 * t * (p2.y - p1.y);
            const tl = Math.hypot(tx, ty) || 1;
            const nx = -ty / tl;
            const ny = tx / tl;
            const len = L * 0.28 * (1 - t * 0.75);
            for (const side of [1, -1]) {
              // leaflets hang down and slightly backwards
              const ex = px + (nx * side * 0.55 + (tx / tl) * 0.35) * len;
              const ey = py + Math.abs(ny * 0.55) * len + len * 0.75;
              leaflets.push(
                <path
                  key={`${i}${side}`}
                  d={`M ${px} ${py} Q ${(px + ex) / 2 + nx * side * 6} ${(py + ey) / 2 - 6} ${ex} ${ey}`}
                  stroke={color}
                  strokeWidth={7 - t * 4}
                  strokeLinecap="round"
                  fill="none"
                />,
              );
            }
          }
          return (
            <g key={k}>
              <path
                d={`M ${cx} ${cy} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
                stroke={color}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
              {leaflets}
            </g>
          );
        })}
        <circle cx={cx} cy={cy + 6} r={22} fill={color} />
      </g>
    </g>
  );
};
