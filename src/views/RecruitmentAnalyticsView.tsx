/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Layers,
  PieChart,
  Calendar,
  Filter,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Interactive3DDonut } from '../components/charts/Interactive3DDonut';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { EmployeeContributionChart } from '../components/charts/EmployeeContributionChart';
import { CompanyDistributionChart } from '../components/charts/CompanyDistributionChart';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';
import { RecruitmentTypeChart } from '../components/charts/RecruitmentTypeChart';

export const RecruitmentAnalyticsView: React.FC = () => {
  const {
    records,
    stats,
    hrMetrics,
    companyStats,
    departmentStats,
    monthlyTrends,
  } = useRecruitment();

  const [companyFilter, setCompanyFilter] = useState('ALL');

  const donutSlices = [
    { label: 'Joined', count: stats.joinedEmployees, color: '#10b981', hoverColor: '#059669' },
    { label: 'Ongoing', count: stats.ongoingRecruitment, color: '#f59e0b', hoverColor: '#d97706' },
    { label: 'Held Up', count: stats.heldUpRecruitment, color: '#8b5cf6', hoverColor: '#7c3aed' },
    { label: 'Did not Join', count: stats.didNotJoinRecruitment, color: '#ef4444', hoverColor: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Recruitment Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive multi-dimensional visualization of recruitment turnaround times, department demand, and organizational velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Company:</span>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Companies (6)</option>
            {['RAL', 'SGL', 'PSL', 'MTSL', 'RDL', 'RBL'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Chart 1 & Chart 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 1: Recruitment Status Overview
          </h3>
          <p className="text-xs text-slate-500 mb-4">Joined vs Ongoing vs Held Up proportions</p>
          <Interactive3DDonut slices={donutSlices} total={stats.totalRequisitions} />
        </div>

        <div className="lg:col-span-7 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 2: Monthly Recruitment Trends
          </h3>
          <p className="text-xs text-slate-500 mb-4">Volume pace and completion trajectories</p>
          <MonthlyTrendChart data={monthlyTrends} />
        </div>
      </div>

      {/* Grid: Chart 3 (Employee Contribution) */}
      <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
          Chart 3: Employee-wise Recruitment Contribution
        </h3>
        <p className="text-xs text-slate-500 mb-4">Assigned volume, joined employees, and average turnaround times</p>
        <EmployeeContributionChart metrics={hrMetrics} />
      </div>

      {/* Grid: Chart 5 (Department) & Chart 6 (Company) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 5: Department-wise Recruitment Requirements
          </h3>
          <p className="text-xs text-slate-500 mb-4">Highest hiring volume departments and turnaround velocity</p>
          <DepartmentBarChart data={departmentStats} />
        </div>

        <div className="lg:col-span-5 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 6: Company-wise Recruitment Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">RAL, SGL, PSL, MTSL, RDL, RBL breakdown</p>
          <CompanyDistributionChart data={companyStats} />
        </div>
      </div>

      {/* Grid: Chart 4 (Type) & Chart 7 (Monthly Time to Fill Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 4: Recruitment Type Analysis
          </h3>
          <p className="text-xs text-slate-500 mb-4">New headcount vs replacement backfills</p>
          <RecruitmentTypeChart
            newCount={stats.newRecruitmentCount}
            replacementCount={stats.replacementRecruitmentCount}
          />
        </div>

        <div className="lg:col-span-7 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
            Chart 7: Monthly Time to Fill Progression
          </h3>
          <p className="text-xs text-slate-500 mb-4">Average days required to join candidates month-by-month</p>

          <div className="space-y-3 pt-2">
            {monthlyTrends.map((m) => {
              const maxTTF = 60;
              const pct = Math.min(100, Math.round((m.avgTimeToFill / maxTTF) * 100));

              return (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{m.month}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {m.avgTimeToFill > 0 ? `${m.avgTimeToFill} Days Avg` : 'N/A'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
