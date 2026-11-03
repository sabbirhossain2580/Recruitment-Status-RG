/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DepartmentData {
  department: string;
  total: number;
  joined: number;
  ongoing: number;
  avgTimeToFill: number;
}

interface Props {
  data: DepartmentData[];
}

export const DepartmentBarChart: React.FC<Props> = ({ data }) => {
  const topDepts = data.slice(0, 7);
  const maxVal = Math.max(...topDepts.map((d) => d.total), 1);

  return (
    <div className="space-y-3.5">
      {topDepts.map((d) => {
        const pct = Math.round((d.total / maxVal) * 100);

        return (
          <div key={d.department} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={d.department}>
                {d.department}
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">
                  Avg TTF: <strong className="text-slate-700 dark:text-slate-200">{d.avgTimeToFill}d</strong>
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{d.total} reqs</span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
