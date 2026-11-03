/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Menu,
  Maximize,
  Minimize,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRecruitment } from '../context/RecruitmentContext';
import { toggleBrowserFullscreen, isCurrentlyFullscreen } from '../utils/fullscreenUtils';

interface Props {
  onOpenNewRequisition: () => void;
  onOpenSupabaseModal?: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<Props> = ({
  onOpenNewRequisition,
  onOpenSupabaseModal,
  onToggleSidebar,
  isDarkMode,
  onToggleDarkMode,
  isSidebarOpen,
}) => {
  const { currentUser, switchUserById, allUsers, isEditor } = useAuth();
  const { connectionState, activePresences, records, stats } = useRecruitment();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    await toggleBrowserFullscreen();
    setIsFullscreen(isCurrentlyFullscreen());
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Hamburger & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
            title="Toggle Sidebar (Expand/Collapse)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              RG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  RG HR
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  Live System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                Recruitment Status & Checklist
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-time Connection Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border shadow-2xs transition-all ${
              connectionState === 'connected'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : connectionState === 'syncing'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400'
                  : connectionState === 'syncing'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline font-mono">
              {connectionState === 'connected'
                ? 'Connected'
                : connectionState === 'syncing'
                ? 'Synchronizing'
                : 'Connection Lost'}
            </span>
          </div>

          {/* Active online collaborative users count */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-mono"
            title="Active HR members connected right now"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{Math.max(activePresences.length, 1)} Online</span>
          </div>
        </div>

        {/* Right: User Switcher & Dark Mode & New Requisition */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Requisition Button */}
          {isEditor ? (
            <button
              onClick={onOpenNewRequisition}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Requisition</span>
            </button>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium"
              title="Management has view-only access for dashboards and reports"
            >
              <Shield className="w-3 h-3" />
              <span>Executive View</span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title={isFullscreen ? 'Exit Full Screen' : 'Open Full Screen (Edge to Edge / ফুল স্ক্রিন)'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 text-blue-600" />
                <span className="hidden md:inline">Exit Full</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span className="hidden md:inline">Full Screen</span>
              </>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile & Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-left"
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentUser.role === 'editor' ? 'HR Editor' : 'Leadership'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu to switch active employee */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Simulate / Switch User
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Test simultaneous HR Editor updates or Leadership View
                  </div>
                </div>

                {/* Section A: All 6 HR Authorized Users (Full Edit & Delete Access) */}
                <div className="px-3.5 pt-2 pb-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>Authorized HR Members (Full Access)</span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono font-bold">6 Users</span>
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.employeeId}
                    onClick={() => {
                      switchUserById(u.employeeId);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      currentUser.employeeId === u.employeeId
                        ? 'bg-blue-50 dark:bg-blue-950/60 font-bold border-l-4 border-blue-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                      >
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold font-mono">
                          ID: {u.employeeId} • {u.designation}
                        </div>
                      </div>
                    </div>
                    {currentUser.employeeId === u.employeeId && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
