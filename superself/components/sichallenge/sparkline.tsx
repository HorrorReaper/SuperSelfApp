"use client";

import * as React from "react";

type SparklineProps = {
  data: number[];          // length n (<= 7)
  width?: number;          // px
  height?: number;         // px
  stroke?: string;         // tailwind-friendly color via currentColor pattern
  fill?: string;           // rgba/hex for area fill
  strokeWidth?: number;    // px
  dotRadius?: number;      // px
  className?: string;      // apply text-color to affect stroke if using currentColor
};

export function Sparkline({
  data,
  width = 160,
  height = 48,
  stroke = "currentColor",
  fill = "currentColor",
  strokeWidth = 2,
  dotRadius = 2,
  className,
}: SparklineProps) {
  const max = Math.max(1, ...data); // avoid divide by zero
  const n = data.length;
  const padding = 4;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Map data to points
  const points = data.map((v, i) => {
    const x = padding + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
    const y = padding + innerH - (v / max) * innerH; // invert y (higher value = higher on chart)
    return { x, y, v };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  // Area path
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`
      : "";

  return (
    <svg width={width} height={height} className={className} role="img" aria-label="7-day minutes sparkline">
      {/* Area fill with low opacity */}
      <path d={areaD} fill={fill} opacity="0.15" />
      {/* Line */}
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r={dotRadius} fill={stroke} />
          {/* Accessible invisible hit area with title tooltip */}
          <title>{`${p.v} min`}</title>
        </g>
      ))}
    </svg>
  );
}
