/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClockAlert,
  AlertTriangle,
  Clock,
  PauseCircle,
  FileQuestion,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { useAuth } from '../context/AuthContext';
import { RecruitmentRecord } from '../types';

interface Props {
  onOpenEditModal: (record: RecruitmentRecord) => void;
  onOpenDetailModal: (record: RecruitmentRecord) => void;
}

export const PendingRecruitmentView: React.FC<Props> = ({
  onOpenEditModal,
  onOpenDetailModal,
}) => {
  const { alerts, alertThresholds, updateAlertThresholds, records } = useRecruitment();
  const { isEditor } = useAuth();

  const [activeAlertTab, setActiveAlertTab] = useState<'30' | '60' | '90' | 'held' | 'missingDOJ' | 'missingOffer'>('30');
  const [showConfigThresholds, setShowConfigThresholds] = useState(false);

  const [localWarningDays, setLocalWarningDays] = useState(alertThresholds.warningDays);
  const [localDangerDays, setLocalDangerDays] = useState(alertThresholds.dangerDays);
  const [localCriticalDays, setLocalCriticalDays] = useState(alertThresholds.criticalDays);

  const handleSaveThresholds = () => {
    updateAlertThresholds({
      warningDays: Number(localWarningDays) || 30,
      dangerDays: Number(localDangerDays) || 60,
      criticalDays: Number(localCriticalDays) || 90,
    });
    setShowConfigThresholds(false);
  };

  const getActiveList = (): RecruitmentRecord[] => {
    switch (activeAlertTab) {
      case '30':
        return alerts.olderThan30Days;
      case '60':
        return alerts.olderThan60Days;
      case '90':
        return alerts.olderThan90Days;
      case 'held':
        return alerts.heldUp;
      case 'missingDOJ':
        return alerts.missingDOJ;
      case 'missingOffer':
        return alerts.missingOfferLetter;
    }
  };

  const activeRecords = getActiveList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ClockAlert className="w-6 h-6 text-amber-500" />
            <span>Pending Recruitment & SLA Alert Queue</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Urgency monitor for aging requisitions, missing milestone dates, and stalled recruitment pipelines.
          </p>
        </div>

        <button
          onClick={() => setShowConfigThresholds(!showConfigThresholds)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span>Configure Thresholds ({alertThresholds.warningDays}/{alertThresholds.dangerDays}/{alertThresholds.criticalDays}d)</span>
        </button>
      </div>

      {/* Threshold Config Panel */}
      {showConfigThresholds && (
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
              Recruitment SLA Threshold Configuration
            </h4>
            <span className="text-[11px] text-slate-500">Days from Requisition Date</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Warning Threshold (Days)
              </label>
              <input
                type="number"
                min={10}
                max={60}
                value={localWarningDays}
                onChange={(e) => setLocalWarningDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Danger Threshold (Days)
              </label>
              <input
                type="number"
                min={30}
                max={90}
                value={localDangerDays}
                onChange={(e) => setLocalDangerDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Critical SLA Breach (Days)
              </label>
              <input
                type="number"
                min={60}
                max={180}
                value={localCriticalDays}
                onChange={(e) => setLocalCriticalDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowConfigThresholds(false)}
              className="px-3 py-1 text-xs rounded-lg text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveThresholds}
              className="px-4 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
            >
              Apply Thresholds
            </button>
          </div>
        </div>
      )}

      {/* Alert Category Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveAlertTab('30')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === '30'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            Age &gt;{alertThresholds.warningDays} Days
          </div>
          <div className="text-xl font-black font-mono mt-1">{alerts.olderThan30Days.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Moderate Pending</div>
        </button>

        <button
          onClick={() => setActiveAlertTab('60')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === '60'
              ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            Age &gt;{alertThresholds.dangerDays} Days
          </div>
          <div className="text-xl font-black font-mono mt-1">{alerts.olderThan60Days.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">High SLA Risk</div>
        </button>

        <button
          onClick={() => setActiveAlertTab('90')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === '90'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            Age &gt;{alertThresholds.criticalDays} Days
          </div>
          <div className="text-xl font-black font-mono mt-1">{alerts.olderThan90Days.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Critical Delay</div>
        </button>

        <button
          onClick={() => setActiveAlertTab('held')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === 'held'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Held Up</div>
          <div className="text-xl font-black font-mono mt-1">{alerts.heldUp.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Paused by Mgmt</div>
        </button>

        <button
          onClick={() => setActiveAlertTab('missingOffer')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === 'missingOffer'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Missing Offer</div>
          <div className="text-xl font-black font-mono mt-1">{alerts.missingOfferLetter.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">No Offer Date</div>
        </button>

        <button
          onClick={() => setActiveAlertTab('missingDOJ')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeAlertTab === 'missingDOJ'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Missing DOJ</div>
          <div className="text-xl font-black font-mono mt-1">{alerts.missingDOJ.length}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Joined without DOJ</div>
        </button>
      </div>

      {/* Active Records List */}
      <div className="glass-card-3d rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Requisitions in Active Alert Queue ({activeRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Immediate action recommended to expedite turnaround and clear bottlenecks.
            </p>
          </div>
        </div>

        {activeRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No requisitions currently fall into this urgency category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecords.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      SL #{r.sl} • {r.company}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        (r.pendingAge || 0) >= alertThresholds.criticalDays
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {r.pendingAge || 0} Days Pending
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {r.positionTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.department} • HOD: {r.hod}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Requisition Date:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{r.requisitionDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Assisted By:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{r.recruitmentAssistedBy}</span>
                    </div>
                    {r.remarks && (
                      <div className="pt-1 text-slate-600 dark:text-slate-400 italic">
                        "{r.remarks}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Status: <strong className="text-slate-700 dark:text-slate-300">{r.status}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetailModal(r)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600"
                    >
                      Checklist
                    </button>
                    {isEditor && (
                      <button
                        onClick={() => onOpenEditModal(r)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                      >
                        Update Record &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
