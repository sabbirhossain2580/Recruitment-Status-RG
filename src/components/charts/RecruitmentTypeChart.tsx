/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Props {
  newCount: number;
  replacementCount: number;
}

export const RecruitmentTypeChart: React.FC<Props> = ({ newCount, replacementCount }) => {
  const total = newCount + replacementCount || 1;
  const newPct = Math.round((newCount / total) * 100);
  const repPct = 100 - newPct;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="18"
            strokeDasharray={`${(newPct / 100) * 238.76} 238.76`}
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#8b5cf6"
            strokeWidth="18"
            strokeDasharray={`${(repPct / 100) * 238.76} 238.76`}
            strokeDashoffset={`-${(newPct / 100) * 238.76}`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-slate-400 font-medium">Requisitions</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 w-full">
        <div className="p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">New Recruitment</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{newPct}% of total</div>
            </div>
          </div>
          <span className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">{newCount}</span>
        </div>

        <div className="p-3 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-600 shadow-xs" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Replacement</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{repPct}% of total</div>
            </div>
          </div>
          <span className="text-base font-extrabold font-mono text-purple-600 dark:text-purple-400">{replacementCount}</span>
        </div>
      </div>
    </div>
  );
};
