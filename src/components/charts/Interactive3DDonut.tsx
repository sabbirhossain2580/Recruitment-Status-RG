/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface DonutSlice {
  label: string;
  count: number;
  color: string;
  hoverColor: string;
}

interface Props {
  slices: DonutSlice[];
  total: number;
  title?: string;
}

export const Interactive3DDonut: React.FC<Props> = ({ slices, total, title = 'Status Breakdown' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG coordinate calculations for donut
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
      {/* 3D-effect Circular Canvas */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center filter drop-shadow-xl">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <defs>
            <radialGradient id="donutShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </radialGradient>
            <filter id="shadow3D" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />

          {slices.map((slice, idx) => {
            if (slice.count <= 0) return null;
            const percent = slice.count / (total || 1);
            const dashLength = percent * circumference;
            const dashOffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer origin-center"
                style={{
                  filter: isHovered ? 'url(#shadow3D) brightness(1.15)' : 'none',
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center 3D Hub */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <div className="w-28 h-28 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-inner flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {hoveredIdx !== null ? slices[hoveredIdx].label : 'Total'}
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {hoveredIdx !== null ? slices[hoveredIdx].count : total}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              {hoveredIdx !== null
                ? `${Math.round((slices[hoveredIdx].count / (total || 1)) * 100)}%`
                : 'Requisitions'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown Cards */}
      <div className="flex-1 w-full space-y-2.5">
        {slices.map((slice, idx) => {
          const isHovered = hoveredIdx === idx;
          const pct = Math.round((slice.count / (total || 1)) * 100);

          return (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                isHovered
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm translate-x-1'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: slice.color }}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{slice.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {pct}% of requisitions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{slice.count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
