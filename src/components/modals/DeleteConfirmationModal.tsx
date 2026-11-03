/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { RecruitmentRecord } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  record: RecruitmentRecord | null;
}

export const DeleteConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  record,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirmDelete();
      setIsDeleting(false);
      onClose();
    } catch (err: any) {
      setIsDeleting(false);
      setErrorMessage(err.message || 'Failed to delete requisition.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500/40 dark:border-rose-500/30 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Warning Banner */}
        <div className="p-6 bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-900 border-b border-rose-100 dark:border-rose-900/40 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto mb-3 shadow-md shadow-rose-500/20 ring-4 ring-rose-50 dark:ring-rose-950">
            <Trash2 className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Delete Recruitment Requisition?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            This action will permanently remove this record from the centralized recruitment database and log the deletion in the audit trail.
          </p>
        </div>

        {/* Record Summary Box */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                SL #{record.sl}
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                {record.company}
              </span>
            </div>

            <div className="font-bold text-sm text-slate-900 dark:text-white pt-1">
              {record.positionTitle}
            </div>

            <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
              <span>Dept: {record.department}</span>
              <span className="font-mono font-semibold">Status: {record.status}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel, Keep Record
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Requisition'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
