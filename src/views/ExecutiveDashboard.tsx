/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  Clock,
  PauseCircle,
  Timer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { useAuth } from '../context/AuthContext';
import { Interactive3DDonut } from '../components/charts/Interactive3DDonut';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { EmployeeContributionChart } from '../components/charts/EmployeeContributionChart';
import { CompanyDistributionChart } from '../components/charts/CompanyDistributionChart';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';
import { RecruitmentTypeChart } from '../components/charts/RecruitmentTypeChart';
import { ActiveTab } from '../components/Sidebar';

interface Props {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewRequisition: () => void;
}

export const ExecutiveDashboard: React.FC<Props> = ({ onNavigateTab, onOpenNewRequisition }) => {
  const { stats, hrMetrics, companyStats, departmentStats, monthlyTrends, alerts, isRecordLockedByOther, records } = useRecruitment();
  const { currentUser, isEditor } = useAuth();

  // 3D Donut Slices
  const donutSlices = [
    { label: 'Joined', count: stats.joinedEmployees, color: '#10b981', hoverColor: '#059669' },
    { label: 'Ongoing', count: stats.ongoingRecruitment, color: '#f59e0b', hoverColor: '#d97706' },
    { label: 'Held Up', count: stats.heldUpRecruitment, color: '#8b5cf6', hoverColor: '#7c3aed' },
    { label: 'Did not Join', count: stats.didNotJoinRecruitment, color: '#ef4444', hoverColor: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner with 3D Depth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                Live Enterprise Database
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {records.length} Requisitions Synced
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              RG HR – Recruitment Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              Centralized real-time tracking for HR Executives and Leadership. Turnaround times, joining milestones, and employee contributions update simultaneously across all devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditor && (
              <button
                onClick={onOpenNewRequisition}
                className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>+ Add Requisition</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('checklist')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>View Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Urgency Alert Bar */}
        {(alerts.olderThan60Days.length > 0 || alerts.heldUp.length > 0) && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Attention Required: {alerts.olderThan60Days.length} requisitions pending &gt;60 days & {alerts.heldUp.length} requisition currently Held Up.
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('pending')}
              className="text-cyan-300 hover:text-cyan-200 underline font-semibold text-[11px]"
            >
              Review Pending SLA Queue &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 8 Primary KPI Cards with High Contrast & Color Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Requisitions */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border-t-4 border-t-blue-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Total Requisitions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
              {stats.totalRequisitions}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1">
              <span>Across 6 Group Companies</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Vacancies */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border-t-4 border-t-indigo-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Total Vacancies
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
              {stats.totalVacancies}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1">
              <span>Target headcounts approved</span>
            </div>
          </div>
        </div>

        {/* Card 3: Joined Employees */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="p-5 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 border-t-4 border-t-emerald-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              3. Joined Employees
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-emerald-950 dark:text-emerald-100 tracking-tight">
              {stats.joinedEmployees}
            </div>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold mt-1">
              {Math.round((stats.joinedEmployees / (stats.totalRequisitions || 1)) * 100)}% Success Rate
            </div>
          </div>
        </div>

        {/* Card 4: Ongoing Recruitment */}
        <div
          onClick={() => onNavigateTab('pending')}
          className="p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 border-t-4 border-t-amber-500 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
              4. Ongoing Recruitment
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-amber-950 dark:text-amber-100 tracking-tight">
              {stats.ongoingRecruitment}
            </div>
            <div className="text-[11px] text-amber-900 dark:text-amber-300 font-bold mt-1">
              Active in recruitment pipeline
            </div>
          </div>
        </div>

        {/* Card 5: Held Up Recruitment */}
        <div
          onClick={() => onNavigateTab('pending')}
          className="p-5 rounded-2xl border-2 border-purple-400 dark:border-purple-700 bg-purple-50/80 dark:bg-purple-950/40 border-t-4 border-t-purple-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
              5. Held Up Recruitment
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-purple-950 dark:text-purple-100 tracking-tight">
              {stats.heldUpRecruitment}
            </div>
            <div className="text-[11px] text-purple-900 dark:text-purple-300 font-bold mt-1">
              Awaiting management clearance
            </div>
          </div>
        </div>

        {/* Card 6: Average Time to Fill (Days) */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border-t-4 border-t-cyan-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              6. Avg Time to Fill
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
              {stats.avgTimeToFillDays}{' '}
              <span className="text-xs font-bold text-slate-500">Days</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1">
              Req Date &rarr; Joining Date (Joined only)
            </div>
          </div>
        </div>

        {/* Card 7: New Recruitment */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border-t-4 border-t-sky-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              7. New Recruitment
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
              {stats.newRecruitmentCount}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1">
              Fresh organizational headcount
            </div>
          </div>
        </div>

        {/* Card 8: Replacement Recruitment */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 border-t-4 border-t-violet-600 shadow-md cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              8. Replacement
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
              {stats.replacementRecruitmentCount}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1">
              Backfill for resigned/transferred
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 3D Donut Chart & Monthly Trend Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: 3D Doughnut Status Overview */}
        <div className="lg:col-span-5 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Chart 1: Recruitment Status Overview
              </h3>
              <p className="text-xs text-slate-500">Interactive 3D-styled status distribution</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
              {stats.totalRequisitions} Total
            </span>
          </div>

          <div className="mt-4">
            <Interactive3DDonut slices={donutSlices} total={stats.totalRequisitions} />
          </div>
        </div>

        {/* Chart 2: Monthly Recruitment Trends */}
        <div className="lg:col-span-7 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Chart 2: Monthly Recruitment Trends
              </h3>
              <p className="text-xs text-slate-500">Monthly requisitions, joined employees & ongoing pace</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Analytics &rarr;
            </button>
          </div>

          <div className="mt-4">
            <MonthlyTrendChart data={monthlyTrends} />
          </div>
        </div>
      </div>

      {/* Row 3: Chart 3: Employee Contribution */}
      <div className="glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Chart 3: HR Team – Recruitment Assistance Contribution</span>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {hrMetrics.filter((m) => m.status !== 'resigned').length} Active HR Officers
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Assistance breakdown across registered recruitment officers
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('performance')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Detailed HR Performance Profiles &rarr;
          </button>
        </div>

        <div className="mt-4">
          <EmployeeContributionChart metrics={hrMetrics} />
        </div>
      </div>

      {/* Row 4: Company Breakdown & Recruitment Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 6: Company-wise Recruitment */}
        <div className="lg:col-span-6 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Chart 6: Company-wise Recruitment
              </h3>
              <p className="text-xs text-slate-500">Distribution across RAL, SGL, PSL, MTSL, RDL, RBL</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4">
            <CompanyDistributionChart data={companyStats} />
          </div>
        </div>

        {/* Chart 4: Recruitment Type Analysis */}
        <div className="lg:col-span-6 glass-card-3d p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Chart 4: Recruitment Type Analysis
              </h3>
              <p className="text-xs text-slate-500">New Recruitment vs Replacement analysis</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4">
            <RecruitmentTypeChart
              newCount={stats.newRecruitmentCount}
              replacementCount={stats.replacementRecruitmentCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
