/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HRPerformanceMetric } from '../../types';

interface Props {
  metrics: HRPerformanceMetric[];
}

export const EmployeeContributionChart: React.FC<Props> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState<'totalAssigned' | 'totalJoined' | 'totalOngoing' | 'avgTimeToFill'>('totalJoined');

  // Strictly display only the 4 frontline HR recruitment officers
  const activeRecruiters = useMemo(() => {
    return metrics.filter(
      (m) =>
        m.name !== 'Syeda Shaila Ashraf' &&
        m.name !== 'Shahriyar Naiem' &&
        m.employeeId !== '01-02-0440' &&
        m.employeeId !== '22-02-1826' &&
        m.status !== 'resigned'
    );
  }, [metrics]);

  const maxVal = Math.max(...activeRecruiters.map((m) => m[selectedMetric]), 10);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'totalAssigned':
        return 'Requisitions Handled';
      case 'totalJoined':
        return 'Joined Candidates';
      case 'totalOngoing':
        return 'Ongoing Requisitions';
      case 'avgTimeToFill':
        return 'Average Time to Fill (Days)';
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setSelectedMetric('totalJoined')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
            selectedMetric === 'totalJoined'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Joined ({activeRecruiters.reduce((a, b) => a + b.totalJoined, 0)})
        </button>
        <button
          onClick={() => setSelectedMetric('totalAssigned')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
            selectedMetric === 'totalAssigned'
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Total Requisitions ({activeRecruiters.reduce((a, b) => a + b.totalAssigned, 0)})
        </button>
        <button
          onClick={() => setSelectedMetric('totalOngoing')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
            selectedMetric === 'totalOngoing'
              ? 'bg-amber-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Ongoing ({activeRecruiters.reduce((a, b) => a + b.totalOngoing, 0)})
        </button>
        <button
          onClick={() => setSelectedMetric('avgTimeToFill')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
            selectedMetric === 'avgTimeToFill'
              ? 'bg-purple-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Avg Time to Fill
        </button>
      </div>

      {/* Horizontal / Vertical 3D Bar Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {activeRecruiters.map((m) => {
          const val = m[selectedMetric];
          const pct = Math.min(100, Math.round((val / (maxVal || 1)) * 100));

          return (
            <div
              key={m.employeeId}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${m.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
                  >
                    {m.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {m.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.designation}</p>
                  </div>
                </div>

                <div className="mt-4 mb-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getMetricLabel()}</span>
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {val}
                    {selectedMetric === 'avgTimeToFill' && <span className="text-xs text-slate-400 ml-1 font-normal">days</span>}
                  </span>
                </div>

                {/* Progress track */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      selectedMetric === 'totalJoined'
                        ? 'bg-emerald-500'
                        : selectedMetric === 'totalAssigned'
                        ? 'bg-blue-600'
                        : selectedMetric === 'totalOngoing'
                        ? 'bg-amber-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Quick stats footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-slate-400">Total</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 font-mono">{m.totalAssigned}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-emerald-500 font-semibold">Joined</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{m.totalJoined}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-purple-500 font-semibold">Rating</div>
                  <div className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                    ★ {m.averageLeadershipRating}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
