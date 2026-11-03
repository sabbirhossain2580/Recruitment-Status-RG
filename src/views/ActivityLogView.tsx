/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  User,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { AuditLogEntry } from '../types';

export const ActivityLogView: React.FC = () => {
  const { auditLogs } = useRecruitment();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs
    .filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          log.performedBy.toLowerCase().includes(term) ||
          log.summaryNote?.toLowerCase().includes(term) ||
          (log.positionTitle && log.positionTitle.toLowerCase().includes(term)) ||
          log.action.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .reverse(); // Newest first

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Create
          </span>
        );
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Update
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Delete
          </span>
        );
      case 'BATCH_IMPORT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Import
          </span>
        );
      case 'RATING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Rating
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-800">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-600" />
            <span>Audit Trail & Activity Log</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete tamper-evident chronology of who created, edited, reviewed, or recalculated recruitment records in real-time.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          {filteredLogs.length} Events Logged
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card-3d p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by officer name, position title, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white font-semibold"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="STATUS_CHANGE">Status Change</option>
            <option value="DELETE">Delete</option>
            <option value="BATCH_IMPORT">Import</option>
            <option value="RATING">Leadership Rating</option>
          </select>
        </div>
      </div>

      {/* Timeline Entries */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit events found matching the criteria.
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="glass-card-3d p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {getActionBadge(entry.action)}
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {entry.performedBy}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    (ID: {entry.performedByEmpId})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Summary note */}
              {entry.summaryNote && (
                <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {entry.summaryNote}
                </div>
              )}

              {/* Field by Field Diff */}
              {entry.changes && entry.changes.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Modified Fields ({entry.changes.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {entry.changes.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] flex items-center justify-between gap-2"
                      >
                        <span className="font-sans font-semibold text-slate-600 dark:text-slate-400">
                          {c.field}:
                        </span>
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-rose-500 line-through truncate max-w-[100px]">
                            {String(c.oldValue) || '(empty)'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[120px]">
                            {String(c.newValue) || '(empty)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
