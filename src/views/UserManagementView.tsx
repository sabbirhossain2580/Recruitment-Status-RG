/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Radio,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRecruitment } from '../context/RecruitmentContext';

export const UserManagementView: React.FC = () => {
  const { allUsers, currentUser, switchUserById } = useAuth();
  const { activePresences, records } = useRecruitment();

  const permissionsList = [
    { title: 'Add new recruitment requisitions', allMembers: true },
    { title: 'Edit existing recruitment records', allMembers: true },
    { title: 'Delete recruitment requisitions', allMembers: true },
    { title: 'Update recruitment status & DOJ', allMembers: true },
    { title: 'Update offer letter dates & remarks', allMembers: true },
    { title: 'Update recruitment workflow checklists', allMembers: true },
    { title: 'View executive recruitment dashboards', allMembers: true },
    { title: 'View individual and team performance', allMembers: true },
    { title: 'View time-to-fill analytics & SLA alerts', allMembers: true },
    { title: 'Download reports and export Excel/PDF', allMembers: true },
    { title: 'Leadership rating & appraisals (Head & Manager)', allMembers: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <span>User Management & Role-Based Access Control</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Six authorized enterprise user accounts configured for RG HR with strict permission boundary enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Active Session: <strong>{currentUser.name}</strong></span>
        </div>
      </div>

      {/* User Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUsers.map((user) => {
          const isCurrent = currentUser.employeeId === user.employeeId;
          const isOnline = activePresences.some((p) => p.employeeId === user.employeeId);
          const assignedCount = records.filter(
            (r) =>
              r.recruitmentAssistedBy.trim().toLowerCase() === user.name.trim().toLowerCase() ||
              r.recruitmentAssistedBy.includes(user.name)
          ).length;

          return (
            <div
              key={user.employeeId}
              className={`glass-card-3d p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-blue-500/80 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center font-black text-base shadow-md shrink-0`}
                    >
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{user.designation}</p>
                      <span className="font-mono text-[10px] text-slate-400">
                        ID: {user.employeeId}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-400">
                    Full Access
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Email:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{user.email}</span>
                  </div>
                  {user.role === 'editor' && (
                    <div className="flex justify-between text-slate-500">
                      <span>Assigned Requisitions:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {assignedCount} cases
                      </span>
                    </div>
                  )}
                  {user.role === 'viewer' && (
                    <div className="flex justify-between text-slate-500">
                      <span>Leadership Permissions:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        Appraise 4 HR Officers
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] flex items-center gap-1.5 text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  {isOnline ? 'Connected' : 'Offline'}
                </span>

                {isCurrent ? (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged In</span>
                  </span>
                ) : (
                  <button
                    onClick={() => switchUserById(user.employeeId)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                  >
                    Switch Identity &rarr;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="glass-card-3d p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC) Enforcement Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Permission enforcement is checked on both client UI elements and backend Express/WebSocket endpoints.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b-2 border-slate-800 text-[11px] uppercase font-black">
                <th className="p-3">Permission / Capability</th>
                <th className="p-3 text-center">4 HR Officers (Quazi, Sabbir, Fariha, Maisha)</th>
                <th className="p-3 text-center">Leadership (Syeda Shaila Ashraf & Shahriyar Naiem)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 font-semibold">
              {permissionsList.map((p, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-900 dark:text-slate-100 font-bold">{p.title}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Access
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Access
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
