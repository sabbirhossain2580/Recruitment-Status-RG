/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users2,
  BarChart3,
  CalendarDays,
  ClockAlert,
  FileSpreadsheet,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRecruitment } from '../context/RecruitmentContext';

export type ActiveTab =
  | 'overview'
  | 'checklist'
  | 'performance'
  | 'analytics'
  | 'calendar'
  | 'pending'
  | 'reports';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop?: boolean;
  onToggleCollapseDesktop?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop = false,
  onToggleCollapseDesktop,
}) => {
  const { currentUser, isEditor } = useAuth();
  const { alerts, stats, hrMetrics } = useRecruitment();

  const totalPendingAlerts =
    alerts.olderThan30Days.length +
    alerts.olderThan60Days.length +
    alerts.olderThan90Days.length +
    alerts.heldUp.length;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'checklist' as ActiveTab,
      label: 'Recruitment Status – Checklist',
      icon: ClipboardList,
      badge: stats.totalRequisitions,
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'performance' as ActiveTab,
      label: 'HR Recruitment Performance',
      icon: Users2,
      badge: `${hrMetrics.length} Profiles`,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Recruitment Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Recruitment Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'pending' as ActiveTab,
      label: 'Pending Recruitment',
      icon: ClockAlert,
      badge: totalPendingAlerts > 0 ? totalPendingAlerts : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      badge: 'Excel & PDF',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-y-auto overflow-x-hidden ${
          isCollapsedDesktop ? 'lg:w-20 w-68' : 'w-68'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between px-3 py-2 lg:hidden border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onCloseMobile} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            {!isCollapsedDesktop && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Main Menu
              </span>
            )}
            {onToggleCollapseDesktop && (
              <button
                onClick={onToggleCollapseDesktop}
                title={isCollapsedDesktop ? 'Expand Sidebar' : 'Collapse Sidebar to Mini'}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
              >
                {isCollapsedDesktop ? (
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                title={isCollapsedDesktop ? item.label : undefined}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center ${
                  isCollapsedDesktop ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-semibold transition-all text-left relative group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className={`flex items-center ${isCollapsedDesktop ? 'justify-center' : 'gap-3'} truncate`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!isCollapsedDesktop && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsedDesktop && item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ml-1.5 ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when collapsed */}
                {isCollapsedDesktop && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Current User Session Profile Badge */}
        <div className={`p-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 m-2 rounded-2xl ${isCollapsedDesktop ? 'flex flex-col items-center justify-center p-2' : ''}`}>
          <div className={`flex items-center ${isCollapsedDesktop ? 'justify-center' : 'gap-2.5'}`}>
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
              title={`${currentUser.name} (${currentUser.designation})`}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            {!isCollapsedDesktop && (
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.designation}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Full Access
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono font-bold">#{currentUser.employeeId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
