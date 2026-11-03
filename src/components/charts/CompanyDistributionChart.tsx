/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CompanyData {
  company: string;
  total: number;
  joined: number;
  ongoing: number;
  heldUp: number;
}

interface Props {
  data: CompanyData[];
}

export const CompanyDistributionChart: React.FC<Props> = ({ data }) => {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-3">
      {data.map((co) => {
        const percent = Math.round((co.total / maxTotal) * 100);

        return (
          <div key={co.company} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wide">
                {co.company}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{co.joined} Joined</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-amber-600 dark:text-amber-400">{co.ongoing} Ongoing</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="font-bold text-slate-900 dark:text-white">{co.total} Total</span>
              </div>
            </div>

            {/* Multi-segment stacked bar */}
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(co.joined / (co.total || 1)) * percent}%` }}
                title={`${co.joined} Joined`}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${(co.ongoing / (co.total || 1)) * percent}%` }}
                title={`${co.ongoing} Ongoing`}
              />
              <div
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${(co.heldUp / (co.total || 1)) * percent}%` }}
                title={`${co.heldUp} Held Up`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
