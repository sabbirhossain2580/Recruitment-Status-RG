/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface MonthlyData {
  month: string;
  requisitions: number;
  joined: number;
  ongoing: number;
}

interface Props {
  data: MonthlyData[];
}

export const MonthlyTrendChart: React.FC<Props> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'joined' | 'requisitions' | 'ongoing'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => Math.max(d.requisitions, d.joined, d.ongoing, 5)), 15);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 35;
  const paddingY = 20;

  const pointsCount = data.length || 1;
  const stepX = (chartWidth - paddingX * 2) / (pointsCount - 1 || 1);

  // Generate SVG path points
  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + idx * stepX;
    const y = chartHeight - paddingY - (val / maxValue) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const createSmoothPath = (values: number[]) => {
    const coords = values.map((v, i) => getCoordinates(v, i));
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const reqPath = createSmoothPath(data.map((d) => d.requisitions));
  const joinedPath = createSmoothPath(data.map((d) => d.joined));
  const ongoingPath = createSmoothPath(data.map((d) => d.ongoing));

  // Area under joined
  const joinedCoords = data.map((d, i) => getCoordinates(d.joined, i));
  const joinedAreaPath = joinedCoords.length > 0
    ? `${joinedPath} L ${joinedCoords[joinedCoords.length - 1].x} ${chartHeight - paddingY} L ${joinedCoords[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-4">
      {/* Metric Toggle Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setActiveMetric('requisitions')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'requisitions'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Requisitions
          </button>
          <button
            onClick={() => setActiveMetric('joined')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'joined'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Joined
          </button>
          <button
            onClick={() => setActiveMetric('ongoing')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'ongoing'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ongoing
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Requisitions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Joined
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ongoing
          </span>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="joinedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {Math.round(pct * maxValue)}
                </text>
              </g>
            );
          })}

          {/* Joined Area */}
          {(activeMetric === 'all' || activeMetric === 'joined') && (
            <path d={joinedAreaPath} fill="url(#joinedAreaGradient)" />
          )}

          {/* Lines */}
          {(activeMetric === 'all' || activeMetric === 'requisitions') && (
            <path
              d={reqPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeMetric === 'all' || activeMetric === 'joined') && (
            <path
              d={joinedPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeMetric === 'all' || activeMetric === 'ongoing') && (
            <path
              d={ongoingPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Hover Target */}
          {data.map((d, i) => {
            const reqCoord = getCoordinates(d.requisitions, i);
            const joinedCoord = getCoordinates(d.joined, i);
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.month}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={reqCoord.x}
                    y1={paddingY}
                    x2={reqCoord.x}
                    y2={chartHeight - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Dots */}
                {(activeMetric === 'all' || activeMetric === 'requisitions') && (
                  <circle
                    cx={reqCoord.x}
                    cy={reqCoord.y}
                    r={isHovered ? 5 : 3.5}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                )}

                {(activeMetric === 'all' || activeMetric === 'joined') && (
                  <circle
                    cx={joinedCoord.x}
                    cy={joinedCoord.y}
                    r={isHovered ? 5 : 3.5}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                )}

                {/* X-axis label */}
                <text
                  x={reqCoord.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-500 dark:fill-slate-400 font-medium"
                >
                  {d.month.split(' ')[0]}
                </text>

                {/* Invisible hover area */}
                <rect
                  x={reqCoord.x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700 space-y-1 transition-all z-20"
            style={{
              left: `${Math.min(
                Math.max(10, (hoveredIndex / (data.length - 1)) * 100),
                80
              )}%`,
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
              {data[hoveredIndex].month}
            </div>
            <div className="flex justify-between gap-3 text-blue-300">
              <span>Requisitions:</span>
              <span className="font-mono font-bold">{data[hoveredIndex].requisitions}</span>
            </div>
            <div className="flex justify-between gap-3 text-emerald-300">
              <span>Joined:</span>
              <span className="font-mono font-bold">{data[hoveredIndex].joined}</span>
            </div>
            <div className="flex justify-between gap-3 text-amber-300">
              <span>Ongoing:</span>
              <span className="font-mono font-bold">{data[hoveredIndex].ongoing}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
