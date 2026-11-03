/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Shield,
} from 'lucide-react';
import { RecruitmentRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: RecruitmentRecord | null;
  onEdit: (record: RecruitmentRecord) => void;
  onDelete?: (record: RecruitmentRecord) => void;
}

export const RecruitmentDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  onEdit,
  onDelete,
}) => {
  const { isEditor } = useAuth();

  if (!isOpen || !record) return null;

  const checklistItems = [
    { key: 'mrfApproved', label: '1. MRF Formally Approved' },
    { key: 'jobPosted', label: '2. Job Ad Published (Bdjobs / LinkedIn)' },
    { key: 'cvScreening', label: '3. Initial CV Screening' },
    { key: 'firstInterview', label: '4. First Round Technical Viva' },
    { key: 'finalInterview', label: '5. Final Interview with HOD' },
    { key: 'salaryDiscussion', label: '6. Salary & Perks Negotiation' },
    { key: 'bgVerification', label: '7. Background & Credential Check' },
    { key: 'offerLetterIssued', label: '8. Formal Offer Letter Issued' },
    { key: 'offerAccepted', label: '9. Offer Accepted by Candidate' },
    { key: 'onboardingPrepared', label: '10. Onboarding & Station Prepared' },
    { key: 'joiningConfirmed', label: '11. Candidate Joined (DOJ Verified)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black px-2.5 py-1 rounded-xl bg-blue-600 text-white">
              SL #{record.sl}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {record.positionTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {record.department} • <strong className="text-blue-600 font-mono">{record.company}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metric Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="mt-1 font-bold text-xs">
                {record.status === 'Joined' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">Joined (Completed)</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-mono">{record.status}</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {record.status === 'Joined' ? 'Time to Fill' : 'Pending Age'}
              </span>
              <div className="mt-1 font-mono text-xs font-black text-slate-900 dark:text-white">
                {record.status === 'Joined' && record.timeToFill !== null
                  ? `${record.timeToFill} Days`
                  : `${record.pendingAge || 0} Days`}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requisition Date</span>
              <div className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                {record.requisitionDate}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOJ (Joining)</span>
              <div className="mt-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {record.doj || 'Pending'}
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">HOD / Dept Head:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{record.hod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Submitted By:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{record.requisitionSubmittedBy}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Vacancy Count:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{record.vacancy}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Recruitment Type:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{record.recruitmentType}</span>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Assisted By (HR Officer):</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {record.recruitmentAssistedBy}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Offer Letter Date:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {record.offerLetterDate || 'Not yet issued'}
                </span>
              </div>
              {record.recruitmentType === 'Replacement' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Replacement Of:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {record.replacementOfWhom || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Previous Salary:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {record.replacementEmployeeSalary ? `${record.replacementEmployeeSalary} BDT` : 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Workflow Checklist Progress */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recruitment Process Checklist (11 Milestones)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {checklistItems.map((item) => {
                const isChecked = record.checklist && (record.checklist as any)[item.key];
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                      isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${isChecked ? 'text-emerald-500' : 'text-slate-300'}`}
                    />
                    <span className={isChecked ? 'font-medium' : 'line-through'}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          {record.remarks && (
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Remarks / Operational Notes:</span>
              <p className="text-slate-600 dark:text-slate-400">{record.remarks}</p>
            </div>
          )}

          {/* Audit Footer */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div>
              Last Modified by: <strong className="text-slate-700 dark:text-slate-300">{record.lastUpdatedBy}</strong>
            </div>
            <div>
              Timestamp: {new Date(record.lastUpdatedAt).toLocaleString()} (Version #{record.version})
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {onDelete && (
                <button
                  onClick={() => {
                    onClose();
                    onDelete(record);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-2 border-rose-300 hover:border-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Requisition</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit This Requisition</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
